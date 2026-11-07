import { supabase } from './supabase';
import {
  AuditLog,
  Client,
  Employee,
  Invoice,
  NotificationItem,
  Payment,
  Project,
  Task,
  TaskProgressLog
} from './crmTypes';

export type CrmSnapshot = {
  employees: Employee[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  progressLogs: TaskProgressLog[];
  invoices: Invoice[];
  payments: Payment[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
};

const defaultAvatarByEmployeeId: Record<string, string> = {
  EMP001: '/team/niranjan.jpg',
  EMP002: '/team/makizh.jpg',
  EMP003: '/team/hariharan.jpg',
  EMP004: '/team/priyanka.jpg',
  EMP005: '/team/dhanya.jpg',
  EMP006: '/team/praveen.jpg',
  EMP007: '/team/vengateshwaran.jpg'
};

const tableByKey: Record<string, keyof CrmSnapshot> = {
  aura_crm_employees: 'employees',
  aura_crm_clients: 'clients',
  aura_crm_projects: 'projects',
  aura_crm_tasks: 'tasks',
  aura_crm_progress_logs: 'progressLogs',
  aura_crm_invoices: 'invoices',
  aura_crm_payments: 'payments',
  aura_crm_audit_logs: 'auditLogs',
  aura_crm_notifications: 'notifications'
};

const tableByCollection: Record<keyof CrmSnapshot, string> = {
  employees: 'crm_employees',
  clients: 'crm_clients',
  projects: 'crm_projects',
  tasks: 'crm_tasks',
  progressLogs: 'crm_task_progress_logs',
  invoices: 'crm_invoices',
  payments: 'crm_payments',
  auditLogs: 'crm_audit_logs',
  notifications: 'crm_notifications'
};

const toDatabaseRow = (item: Record<string, unknown>) => Object.fromEntries(
  Object.entries(item)
    .filter(([key, value]) => key !== 'assignedEmployees' && value !== undefined)
    .map(([key, value]) => [key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`), value])
);

const fromDatabaseRow = (item: Record<string, unknown>) => Object.fromEntries(
  Object.entries(item).map(([key, value]) => [
    key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()),
    value
  ])
);

const assignmentRows = (projects: Project[]) => projects.flatMap(project =>
  (project.assignedEmployees || []).map(assignment => ({
    id: `${project.id}-${assignment.employeeId}`,
    project_id: project.id,
    employee_id: assignment.employeeId,
    role: assignment.role,
    responsibility: assignment.responsibility
  }))
);

const persistQueue = new Map<string, Promise<void>>();
let persistenceEnabled = false;
let activeRole: 'admin' | 'employee' | null = null;
const persistedRecords = new Map<keyof CrmSnapshot, Map<string, string>>();

export function disableCrmPersistence() {
  persistenceEnabled = false;
  activeRole = null;
  persistedRecords.clear();
}

const recordKey = (record: Record<string, unknown>) => String(record.id || '');

const setPersistedRecords = (collection: keyof CrmSnapshot, records: Record<string, unknown>[]) => {
  persistedRecords.set(collection, new Map(records.map(record => [
    recordKey(record),
    JSON.stringify(record)
  ])));
};

const reportPersistenceError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('CRM database write failed:', error);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('crm-persistence-error', { detail: message }));
  }
};

async function upsertCollection(collection: keyof CrmSnapshot, records: Record<string, unknown>[]) {
  if (records.length === 0) return;
  const table = tableByCollection[collection];
  const { error } = await supabase.from(table).upsert(records.map(toDatabaseRow), { onConflict: 'id' });
  if (error) {
    throw new Error(`Saving ${table} failed: ${error.message}`);
  }

  if (collection === 'projects') {
    const assignments = assignmentRows(records as unknown as Project[]);
    if (assignments.length > 0) {
      const { error: assignmentError } = await supabase
        .from('crm_project_assignments')
        .upsert(assignments, { onConflict: 'id' });
      if (assignmentError) {
        throw new Error(`Saving project assignments failed: ${assignmentError.message}`);
      }
    }

    for (const project of records as unknown as Project[]) {
      const { data: currentAssignments, error: loadError } = await supabase
        .from('crm_project_assignments')
        .select('id, employee_id')
        .eq('project_id', project.id);
      if (loadError) {
        throw new Error(`Checking project assignments failed: ${loadError.message}`);
      }

      const assignedIds = new Set((project.assignedEmployeeIds || []).map(String));
      const removedIds = (currentAssignments || [])
        .filter(assignment => !assignedIds.has(assignment.employee_id))
        .map(assignment => assignment.id);
      if (removedIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('crm_project_assignments')
          .delete()
          .in('id', removedIds);
        if (deleteError) {
          throw new Error(`Removing outdated project assignments failed: ${deleteError.message}`);
        }
      }
    }
  }
}

async function persistChangedRecords(collection: keyof CrmSnapshot, records: Record<string, unknown>[]) {
  const knownRecords = persistedRecords.get(collection) || new Map<string, string>();
  const changedRecords = records.filter(record =>
    knownRecords.get(recordKey(record)) !== JSON.stringify(record)
  );
  if (changedRecords.length === 0) return;

  if (activeRole === 'employee') {
    if (collection === 'tasks' || collection === 'notifications') {
      for (const record of changedRecords) {
        const { id, ...values } = toDatabaseRow(record);
        const { error } = await supabase.from(tableByCollection[collection]).update(values).eq('id', id);
        if (error) throw new Error(`Saving ${tableByCollection[collection]} failed: ${error.message}`);
      }
    } else if (collection === 'progressLogs' || collection === 'auditLogs') {
      const { error } = await supabase
        .from(tableByCollection[collection])
        .insert(changedRecords.map(toDatabaseRow));
      if (error) throw new Error(`Saving ${tableByCollection[collection]} failed: ${error.message}`);
    }

    setPersistedRecords(collection, records);
    return;
  }

  await upsertCollection(collection, changedRecords);
  setPersistedRecords(collection, records);
}

export function persistCrmSnapshot(localStorageKey: string, value: string) {
  if (!persistenceEnabled) return;
  const collection = tableByKey[localStorageKey];
  if (!collection) return;

  let records: Record<string, unknown>[];
  try {
    records = JSON.parse(value) as Record<string, unknown>[];
  } catch (error) {
    reportPersistenceError(new Error(`Could not serialize CRM data for ${collection}: ${String(error)}`));
    return;
  }

  const previous = persistQueue.get(collection) || Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(() => persistChangedRecords(collection, records))
    .catch(reportPersistenceError);
  persistQueue.set(collection, next);
}

async function loadCollection<T>(collection: keyof CrmSnapshot): Promise<T[]> {
  try {
    const { data, error } = await supabase.from(tableByCollection[collection]).select('*');
    if (error) {
      console.warn(`Cloud load note for ${tableByCollection[collection]}:`, error.message);
      return [];
    }
    return (data || []).map(row => fromDatabaseRow(row as Record<string, unknown>) as T);
  } catch (err) {
    console.warn(`Cloud collection load exception for ${collection}:`, err);
    return [];
  }
}

export async function initializeCrmDatabase(
  isAdmin: boolean,
  employeeId: string,
  defaults: CrmSnapshot,
  writeLocalSnapshot: (collection: keyof CrmSnapshot, records: unknown[]) => void
) {
  persistenceEnabled = false;
  activeRole = null;
  persistedRecords.clear();
  try {
    let employees = await loadCollection<Employee>('employees');
    let clients = await loadCollection<Client>('clients');
    let projects = await loadCollection<Project>('projects');
    let tasks = await loadCollection<Task>('tasks');
    let progressLogs = await loadCollection<TaskProgressLog>('progressLogs');
    let invoices = await loadCollection<Invoice>('invoices');
    let payments = await loadCollection<Payment>('payments');
    let auditLogs = await loadCollection<AuditLog>('auditLogs');
    let notifications = await loadCollection<NotificationItem>('notifications');

    const databaseIsEmpty = employees.length === 0
      && clients.length === 0
      && projects.length === 0
      && tasks.length === 0;

    if (databaseIsEmpty) {
      if (isAdmin) {
        try {
          await upsertCollection('employees', defaults.employees as unknown as Record<string, unknown>[]);
          await upsertCollection('clients', defaults.clients as unknown as Record<string, unknown>[]);
          await upsertCollection('projects', defaults.projects as unknown as Record<string, unknown>[]);
          await upsertCollection('tasks', defaults.tasks as unknown as Record<string, unknown>[]);
          await upsertCollection('progressLogs', defaults.progressLogs as unknown as Record<string, unknown>[]);
          await upsertCollection('invoices', defaults.invoices as unknown as Record<string, unknown>[]);
          await upsertCollection('payments', defaults.payments as unknown as Record<string, unknown>[]);
          await upsertCollection('auditLogs', defaults.auditLogs as unknown as Record<string, unknown>[]);
          await upsertCollection('notifications', defaults.notifications as unknown as Record<string, unknown>[]);
        } catch (seedErr) {
          console.warn('Initial cloud database seed note (local storage primary):', seedErr);
        }
      }

      employees = defaults.employees;
      clients = defaults.clients;
      projects = defaults.projects;
      tasks = defaults.tasks;
      progressLogs = defaults.progressLogs;
      invoices = defaults.invoices;
      payments = defaults.payments;
      auditLogs = defaults.auditLogs;
      notifications = defaults.notifications;
    }

    const employeesWithoutAvatar = employees.filter(employee => !employee.avatar?.trim());
    employees = employees.map(employee => ({
      ...employee,
      avatar: employee.avatar?.trim() || defaultAvatarByEmployeeId[employee.id] || ''
    }));

    if (isAdmin && employeesWithoutAvatar.length > 0) {
      const employeesWithRestoredAvatars = employeesWithoutAvatar
        .map(employee => employees.find(updated => updated.id === employee.id))
        .filter((employee): employee is Employee => Boolean(employee && employee.avatar));
      try {
        await upsertCollection(
          'employees',
          employeesWithRestoredAvatars as unknown as Record<string, unknown>[]
        );
      } catch (err) {
        // Safe to ignore in offline/local
      }
    }

    activeRole = isAdmin ? 'admin' : 'employee';
    setPersistedRecords('employees', employees as unknown as Record<string, unknown>[]);
    setPersistedRecords('clients', clients as unknown as Record<string, unknown>[]);
    setPersistedRecords('projects', projects as unknown as Record<string, unknown>[]);
    setPersistedRecords('tasks', tasks as unknown as Record<string, unknown>[]);
    setPersistedRecords('progressLogs', progressLogs as unknown as Record<string, unknown>[]);
    setPersistedRecords('invoices', invoices as unknown as Record<string, unknown>[]);
    setPersistedRecords('payments', payments as unknown as Record<string, unknown>[]);
    setPersistedRecords('auditLogs', auditLogs as unknown as Record<string, unknown>[]);
    setPersistedRecords('notifications', notifications as unknown as Record<string, unknown>[]);

    const allowedProjects = isAdmin
      ? projects
      : projects.filter(project => project.assignedEmployeeIds?.includes(employeeId));
    const allowedClients = isAdmin
      ? clients
      : clients.filter(client => allowedProjects.some(project => project.clientId === client.id));
    const projectAssignments = await loadAssignments();
    const employeeById = new Map(employees.map(employee => [employee.id, employee]));
    const projectsWithAssignments = allowedProjects.map(project => {
      const assignments = projectAssignments.filter(assignment => assignment.project_id === project.id);
      return {
        ...project,
        assignedEmployees: assignments.length > 0
          ? assignments.map(assignment => ({
              employeeId: assignment.employee_id,
              employeeName: employeeById.get(assignment.employee_id)?.name || assignment.employee_id,
              role: assignment.role || '',
              responsibility: assignment.responsibility || ''
            }))
          : project.assignedEmployees || []
      };
    });

    writeLocalSnapshot('employees', isAdmin ? employees : employees.filter(employee => employee.id === employeeId));
    writeLocalSnapshot('clients', allowedClients);
    writeLocalSnapshot('projects', projectsWithAssignments);
    writeLocalSnapshot('tasks', isAdmin ? tasks : tasks.filter(task => task.assignedEmployeeId === employeeId));
    writeLocalSnapshot('progressLogs', isAdmin ? progressLogs : progressLogs.filter(log => log.employeeId === employeeId));
    writeLocalSnapshot('invoices', isAdmin ? invoices : []);
    writeLocalSnapshot('payments', isAdmin ? payments : []);
    writeLocalSnapshot('auditLogs', isAdmin ? auditLogs : auditLogs.filter(log => log.actorRole === 'employee' && log.actor.includes(employeeId)));
    writeLocalSnapshot('notifications', isAdmin
      ? notifications
      : notifications.filter(notification => !notification.recipientEmployeeId || notification.recipientEmployeeId === employeeId));

    persistenceEnabled = true;
  } catch (error) {
    activeRole = null;
    console.warn('CRM sync initialization note (using local cache):', error);
    writeLocalSnapshot('employees', defaults.employees);
    writeLocalSnapshot('clients', defaults.clients);
    writeLocalSnapshot('projects', defaults.projects);
    writeLocalSnapshot('tasks', defaults.tasks);
    writeLocalSnapshot('progressLogs', defaults.progressLogs);
    writeLocalSnapshot('invoices', defaults.invoices);
    writeLocalSnapshot('payments', defaults.payments);
    writeLocalSnapshot('auditLogs', defaults.auditLogs);
    writeLocalSnapshot('notifications', defaults.notifications);
  }
}

async function loadAssignments(): Promise<Array<{
  project_id: string;
  employee_id: string;
  role: string | null;
  responsibility: string | null;
}>> {
  try {
    const { data, error } = await supabase
      .from('crm_project_assignments')
      .select('project_id, employee_id, role, responsibility');
    if (error) {
      return [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}
