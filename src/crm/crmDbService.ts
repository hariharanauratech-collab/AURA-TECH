import { 
  Employee, Client, Project, Task, TaskProgressLog, 
  Invoice, Payment, AuditLog, NotificationItem, WorkReportFilter, TaskStatus, TaskPriority 
} from './crmTypes';
import { supabase } from './supabase';
import { CrmSnapshot, disableCrmPersistence, initializeCrmDatabase, persistCrmSnapshot } from './crmSupabasePersistence';

const EMPLOYEES_KEY = 'aura_crm_employees';
const CLIENTS_KEY = 'aura_crm_clients';
const PROJECTS_KEY = 'aura_crm_projects';
const TASKS_KEY = 'aura_crm_tasks';
const PROGRESS_LOGS_KEY = 'aura_crm_progress_logs';
const INVOICES_KEY = 'aura_crm_invoices';
const PAYMENTS_KEY = 'aura_crm_payments';
const AUDIT_LOGS_KEY = 'aura_crm_audit_logs';
const NOTIFICATIONS_KEY = 'aura_crm_notifications';

function uniqueRecords<T>(records: T[], identityKeys: (record: T) => string[]): T[] {
  const seen = new Set<string>();
  return records.filter(record => {
    const keys = identityKeys(record).filter(Boolean);
    if (keys.some(key => seen.has(key))) return false;
    keys.forEach(key => seen.add(key));
    return true;
  });
}

// 7 Aura Tech Core Employees (Matching constants.tsx & public/team images)
export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    name: 'Niranjan',
    email: 'niranjan.auratech@gmail.com',
    phone: '+91 9025255617',
    designation: 'Full-Stack Developer',
    department: 'Software Engineering',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Cloud Architecture'],
    avatar: '/team/niranjan.jpg',
    active: true,
    joinedDate: '2024-01-15'
  },
  {
    id: 'EMP002',
    name: 'Makizh',
    email: 'makizh.auratech@gmail.com',
    phone: '+91 9786943535',
    designation: 'Full-Stack Developer & Lead',
    department: 'Software Engineering',
    skills: ['React', 'TypeScript', 'Supabase', 'Python', 'DevOps'],
    avatar: '/team/makizh.jpg',
    active: true,
    joinedDate: '2024-01-10'
  },
  {
    id: 'EMP003',
    name: 'Hariharan',
    email: 'hariharan.auratech@gmail.com',
    phone: '+91 93452 56633',
    designation: 'Full-Stack Developer & Video Editor',
    department: 'Creative & Engineering',
    skills: ['Web Development', 'Video Editing', 'Premiere Pro', 'UI Design'],
    avatar: '/team/hariharan.jpg',
    active: true,
    joinedDate: '2024-02-01'
  },
  {
    id: 'EMP004',
    name: 'Priyanka',
    email: 'priyanka.auratech@gmail.com',
    phone: '+91 99946 85359',
    designation: 'UI/UX Designer & Video Editor',
    department: 'Design Studio',
    skills: ['Figma', 'UI/UX Design', 'Motion Design', 'Video Production'],
    avatar: '/team/priyanka.jpg',
    active: true,
    joinedDate: '2024-02-15'
  },
  {
    id: 'EMP005',
    name: 'Dhanya',
    email: 'dhanyadass.auratech@gmail.com',
    phone: '+91 91509 60105',
    designation: 'Full-Stack Developer & Web Designer',
    department: 'Software Engineering',
    skills: ['Frontend Architecture', 'TailwindCSS', 'REST APIs', 'Web Design'],
    avatar: '/team/dhanya.jpg',
    active: true,
    joinedDate: '2024-03-01'
  },
  {
    id: 'EMP006',
    name: 'Praveen Raja',
    email: 'praveenraja.auratech@gmail.com',
    phone: '+91 90928 88502',
    designation: 'UI/UX Designer & Script Writer',
    department: 'Creative & Strategy',
    skills: ['Wireframing', 'Prototyping', 'Creative Scripting', 'Design Systems'],
    avatar: '/team/praveen.jpg',
    active: true,
    joinedDate: '2024-03-10'
  },
  {
    id: 'EMP007',
    name: 'Vengateshwaran',
    email: 'vengat.auratech@gmail.com',
    phone: '+91 93420 85829',
    designation: 'Frontend Developer & Designer',
    department: 'Frontend Engineering',
    skills: ['React', 'JavaScript', 'CSS Animations', 'Responsive Layouts'],
    avatar: '/team/vengateshwaran.jpg',
    active: true,
    joinedDate: '2024-03-15'
  }
];

export const DEFAULT_CLIENTS: Client[] = [];

export const DEFAULT_PROJECTS: Project[] = [];

export const DEFAULT_TASKS: Task[] = [];

export const DEFAULT_PROGRESS_LOGS: TaskProgressLog[] = [];

export const DEFAULT_INVOICES: Invoice[] = [];

export const DEFAULT_PAYMENTS: Payment[] = [];

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-INIT-001',
    action: 'System Initialized Fresh',
    actor: 'System Admin',
    actorRole: 'admin',
    entityType: 'System',
    entityId: 'SYS-INIT',
    details: 'Aura Tech Enterprise CRM Suite initialized fresh with 7 Core Employee accounts.',
    timestamp: new Date().toISOString()
  }
];

export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];

export const FRESH_SLATE_KEY = 'aura_crm_fresh_slate_2026_v4';

export function purgeLegacyDummyData() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(FRESH_SLATE_KEY)) {
    try {
      localStorage.removeItem(CLIENTS_KEY);
      localStorage.removeItem(PROJECTS_KEY);
      localStorage.removeItem(TASKS_KEY);
      localStorage.removeItem(PROGRESS_LOGS_KEY);
      localStorage.removeItem(INVOICES_KEY);
      localStorage.removeItem(PAYMENTS_KEY);
      localStorage.removeItem(AUDIT_LOGS_KEY);
      localStorage.removeItem(NOTIFICATIONS_KEY);
      localStorage.removeItem('aura_crm_project_requests');
      localStorage.removeItem('aura_submissions');

      localStorage.setItem(CLIENTS_KEY, JSON.stringify([]));
      localStorage.setItem(PROJECTS_KEY, JSON.stringify([]));
      localStorage.setItem(TASKS_KEY, JSON.stringify([]));
      localStorage.setItem(PROGRESS_LOGS_KEY, JSON.stringify([]));
      localStorage.setItem(INVOICES_KEY, JSON.stringify([]));
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify([]));
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(DEFAULT_AUDIT_LOGS));
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
      localStorage.setItem('aura_crm_project_requests', JSON.stringify([]));
      localStorage.setItem('aura_submissions', JSON.stringify([]));
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(DEFAULT_EMPLOYEES));

      localStorage.setItem(FRESH_SLATE_KEY, 'true');
    } catch (e) {
      console.warn('Error purging legacy dummy records:', e);
    }
  }
}

class CrmDbService {
  private cloudInitialization: Promise<void> | null = null;

  private initStorage() {
    if (typeof window === 'undefined') return;
    purgeLegacyDummyData();

    if (!localStorage.getItem(EMPLOYEES_KEY)) {
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
    }
    if (!localStorage.getItem(CLIENTS_KEY)) {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(DEFAULT_CLIENTS));
    }
    if (!localStorage.getItem(PROJECTS_KEY)) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(DEFAULT_PROJECTS));
    }
    if (!localStorage.getItem(TASKS_KEY)) {
      localStorage.setItem(TASKS_KEY, JSON.stringify(DEFAULT_TASKS));
    }
    if (!localStorage.getItem(PROGRESS_LOGS_KEY)) {
      localStorage.setItem(PROGRESS_LOGS_KEY, JSON.stringify(DEFAULT_PROGRESS_LOGS));
    }
    if (!localStorage.getItem(INVOICES_KEY)) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(DEFAULT_INVOICES));
    }
    if (!localStorage.getItem(PAYMENTS_KEY)) {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(DEFAULT_PAYMENTS));
    }
    if (!localStorage.getItem(AUDIT_LOGS_KEY)) {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(DEFAULT_AUDIT_LOGS));
    }
    if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
  }

  constructor() {
    this.initStorage();
  }

  private saveSnapshot(key: string, records: unknown[]): void {
    const serialized = JSON.stringify(records);
    localStorage.setItem(key, serialized);
    persistCrmSnapshot(key, serialized);
  }

  private getUniqueRecords<T>(
    key: string,
    defaults: T[],
    identityKeys: (record: T) => string[]
  ): T[] {
    this.initStorage();
    try {
      const data = localStorage.getItem(key);
      const parsed: unknown = data ? JSON.parse(data) : defaults;
      const records = Array.isArray(parsed) ? parsed as T[] : defaults;
      const unique = uniqueRecords(records, identityKeys);
      if (unique.length !== records.length) {
        localStorage.setItem(key, JSON.stringify(unique));
      }
      return unique;
    } catch {
      return defaults;
    }
  }

  async initializeCloudDatabase(isAdmin: boolean, employeeId: string): Promise<void> {
    if (this.cloudInitialization) {
      return this.cloudInitialization;
    }

    const defaults: CrmSnapshot = {
      employees: this.getEmployees(),
      clients: this.getClients(),
      projects: this.getProjects(),
      tasks: this.getTasks(),
      progressLogs: this.getProgressLogs(),
      invoices: this.getInvoices(),
      payments: this.getPayments(),
      auditLogs: this.getAuditLogs(),
      notifications: this.getNotifications()
    };
    const keyByCollection: Record<keyof CrmSnapshot, string> = {
      employees: EMPLOYEES_KEY,
      clients: CLIENTS_KEY,
      projects: PROJECTS_KEY,
      tasks: TASKS_KEY,
      progressLogs: PROGRESS_LOGS_KEY,
      invoices: INVOICES_KEY,
      payments: PAYMENTS_KEY,
      auditLogs: AUDIT_LOGS_KEY,
      notifications: NOTIFICATIONS_KEY
    };

    this.cloudInitialization = initializeCrmDatabase(isAdmin, employeeId, defaults, (collection, records) => {
      localStorage.setItem(keyByCollection[collection], JSON.stringify(records));
    });
    try {
      await this.cloudInitialization;
    } finally {
      this.cloudInitialization = null;
    }
  }

  disableCloudPersistence(): void {
    disableCrmPersistence();
  }

  // --- EMPLOYEES ---
  getEmployees(): Employee[] {
    const defaultById = new Map(DEFAULT_EMPLOYEES.map(employee => [employee.id, employee]));
    return this.getUniqueRecords(EMPLOYEES_KEY, DEFAULT_EMPLOYEES, employee => [
      employee.id,
      employee.email?.trim().toLowerCase()
    ]).map(employee => ({
        ...employee,
        email: defaultById.get(employee.id)?.email || employee.email,
        avatar: employee.avatar?.trim() || defaultById.get(employee.id)?.avatar || ''
    }));
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.getEmployees().find(e => e.id === id);
  }

  updateEmployee(updated: Employee): void {
    const list = this.getEmployees().map(e => e.id === updated.id ? updated : e);
    this.saveSnapshot(EMPLOYEES_KEY, list);
    this.addAuditLog({
      action: 'Employee Profile Updated',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Employee',
      entityId: updated.id,
      details: `Updated profile details for ${updated.name} (${updated.id})`
    });
  }

  // --- CLIENTS ---
  getClients(): Client[] {
    return this.getUniqueRecords(CLIENTS_KEY, DEFAULT_CLIENTS, client => [
      client.id,
      client.email?.trim().toLowerCase(),
      client.phone?.replace(/\D/g, ''),
      `${client.name?.trim().toLowerCase()}|${client.company?.trim().toLowerCase()}`
    ]).map(client => ({
        ...client,
        clientType: client.clientType === 'Student'
          || client.clientType === 'Professional'
          || client.clientType === 'Enterprise'
          ? client.clientType
          : 'Professional'
    }));
  }

  addClient(client: Omit<Client, 'id' | 'createdAt'>): Client {
    const clients = this.getClients();
    const existing = this.checkClientDuplicate(client.email, client.phone, client.name, client.company);
    if (existing) return existing;
    const id = `CLI-${1000 + clients.length + 1}`;
    const newClient: Client = {
      ...client,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [newClient, ...clients];
    this.saveSnapshot(CLIENTS_KEY, updated);
    this.addAuditLog({
      action: 'Client Created',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Client',
      entityId: id,
      details: `Created new client record for ${client.name} (${client.company})`
    });
    return newClient;
  }

  updateClient(client: Client): void {
    const list = this.getClients().map(c => c.id === client.id ? client : c);
    this.saveSnapshot(CLIENTS_KEY, list);
    this.addAuditLog({
      action: 'Client Updated',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Client',
      entityId: client.id,
      details: `Updated client ${client.name} details.`
    });
  }

  // Check potential duplicates
  checkClientDuplicate(email: string, phone: string, name = '', company = ''): Client | undefined {
    const clients = this.getClients();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanName = name.trim().toLowerCase();
    const cleanCompany = company.trim().toLowerCase();
    return clients.find(c => {
      const matchEmail = c.email.trim().toLowerCase() === cleanEmail;
      const matchPhone = cleanPhone && c.phone.replace(/\D/g, '') === cleanPhone;
      const matchNameAndCompany = cleanName && cleanCompany
        && c.name.trim().toLowerCase() === cleanName
        && c.company.trim().toLowerCase() === cleanCompany;
      return matchEmail || matchPhone || matchNameAndCompany;
    });
  }

  // --- PROJECTS ---
  getProjects(): Project[] {
    return this.getUniqueRecords(PROJECTS_KEY, DEFAULT_PROJECTS, project => [
      project.id,
      `${project.clientId}|${project.title?.trim().toLowerCase()}`
    ]);
  }

  getProjectsForEmployee(employeeId: string): Project[] {
    return this.getProjects().filter(p => p.assignedEmployeeIds.includes(employeeId));
  }

  addProject(projectData: Omit<Project, 'id' | 'createdAt' | 'completionPercentage'>): Project {
    const projects = this.getProjects();
    const id = `PRJ-${2000 + projects.length + 1}`;
    const newProject: Project = {
      ...projectData,
      id,
      completionPercentage: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [newProject, ...projects];
    this.saveSnapshot(PROJECTS_KEY, updated);

    // Notify assigned employees
    projectData.assignedEmployeeIds.forEach(empId => {
      this.addNotification({
        recipientEmployeeId: empId,
        title: 'New Project Allocation',
        message: `You have been allocated to work on new project: "${newProject.title}" for client ${newProject.clientName}.`,
        type: 'assignment'
      });
    });

    this.addAuditLog({
      action: 'Project Created',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Project',
      entityId: id,
      details: `Created project "${newProject.title}" with ${newProject.assignedEmployeeIds.length} assigned employees.`
    });

    return newProject;
  }

  updateProject(project: Project): void {
    const list = this.getProjects().map(p => p.id === project.id ? project : p);
    this.saveSnapshot(PROJECTS_KEY, list);
    this.addAuditLog({
      action: 'Project Updated',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Project',
      entityId: project.id,
      details: `Updated project "${project.title}" details.`
    });
  }

  // --- TASKS ---
  getTasks(): Task[] {
    return this.getUniqueRecords(TASKS_KEY, DEFAULT_TASKS, task => [
      task.id,
      `${task.projectId}|${task.assignedEmployeeId}|${task.title?.trim().toLowerCase()}`
    ]);
  }

  getTasksForEmployee(employeeId: string): Task[] {
    return this.getTasks().filter(t => t.assignedEmployeeId === employeeId);
  }

  addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'history'>): Task {
    const tasks = this.getTasks();
    const id = `TSK-${3000 + tasks.length + 1}`;
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id,
      history: [
        {
          timestamp: now,
          actor: 'Main Admin',
          action: `Created task and assigned to ${taskData.assignedEmployeeName}`
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    const updated = [newTask, ...tasks];
    this.saveSnapshot(TASKS_KEY, updated);

    // Notify employee
    this.addNotification({
      recipientEmployeeId: newTask.assignedEmployeeId,
      title: 'New Task Assignment',
      message: `You were assigned task "${newTask.title}" for ${newTask.projectTitle}. Priority: ${newTask.priority}, Due: ${newTask.dueDate}`,
      type: 'assignment'
    });

    this.addAuditLog({
      action: 'Task Created',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Task',
      entityId: id,
      details: `Created task "${newTask.title}" assigned to ${newTask.assignedEmployeeName}`
    });

    this.recalculateProjectProgress(newTask.projectId);

    return newTask;
  }

  updateTask(task: Task, actor: string = 'Main Admin', role: 'admin' | 'employee' = 'admin'): void {
    const now = new Date().toISOString();
    const tasks = this.getTasks().map(t => {
      if (t.id === task.id) {
        return {
          ...task,
          updatedAt: now
        };
      }
      return t;
    });
    this.saveSnapshot(TASKS_KEY, tasks);

    this.addAuditLog({
      action: 'Task Updated',
      actor,
      actorRole: role,
      entityType: 'Task',
      entityId: task.id,
      details: `Updated task "${task.title}" status to ${task.status} (${task.completionPercentage}%).`
    });

    this.recalculateProjectProgress(task.projectId);
  }

  reassignTask(taskId: string, newEmployeeId: string, actor: string = 'Main Admin', notes?: string): Task | null {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    const newEmp = this.getEmployeeById(newEmployeeId);
    if (!task || !newEmp) return null;

    const oldName = task.assignedEmployeeName;
    const oldId = task.assignedEmployeeId;
    const now = new Date().toISOString();

    const historyItem = {
      timestamp: now,
      actor,
      action: `Reassigned from ${oldName} to ${newEmp.name}`,
      from: oldName,
      to: newEmp.name,
      notes: notes || undefined
    };

    const updatedTask: Task = {
      ...task,
      assignedEmployeeId: newEmp.id,
      assignedEmployeeName: newEmp.name,
      history: [historyItem, ...(task.history || [])],
      updatedAt: now
    };

    const list = tasks.map(t => t.id === taskId ? updatedTask : t);
    this.saveSnapshot(TASKS_KEY, list);

    // Notify new employee
    this.addNotification({
      recipientEmployeeId: newEmp.id,
      title: 'Task Reassigned to You',
      message: `Task "${task.title}" for ${task.projectTitle} was reassigned to you. ${notes ? `Notes: ${notes}` : ''}`,
      type: 'assignment'
    });

    // Notify old employee
    this.addNotification({
      recipientEmployeeId: oldId,
      title: 'Task Reassigned',
      message: `Task "${task.title}" was reassigned to ${newEmp.name} by ${actor}.`,
      type: 'assignment'
    });

    this.addAuditLog({
      action: 'Task Reassigned',
      actor,
      actorRole: 'admin',
      entityType: 'Task',
      entityId: taskId,
      details: `Reassigned from ${oldName} to ${newEmp.name}. ${notes ? `Reason: ${notes}` : ''}`
    });

    return updatedTask;
  }

  // --- CONTINUOUS WORK PROGRESS TRACKING (CORE MODULE) ---
  submitProgressUpdate(update: {
    taskId: string;
    employeeId: string;
    employeeName: string;
    completionPercentage: number;
    workCompleted: string;
    workRemaining: string;
    timeSpentHours: number;
    status: TaskStatus;
    blockers?: string;
    nextPlannedActivity?: string;
    attachments?: string[];
  }): TaskProgressLog {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === update.taskId);
    if (!task) throw new Error('Task not found');

    const now = new Date().toISOString();
    const logId = `LOG-${4000 + this.getProgressLogs().length + 1}`;

    const newLog: TaskProgressLog = {
      id: logId,
      taskId: task.id,
      taskTitle: task.title,
      projectId: task.projectId,
      projectTitle: task.projectTitle,
      employeeId: update.employeeId,
      employeeName: update.employeeName,
      completionPercentage: update.completionPercentage,
      workCompleted: update.workCompleted,
      workRemaining: update.workRemaining,
      timeSpentHours: update.timeSpentHours,
      status: update.status,
      blockers: update.blockers,
      nextPlannedActivity: update.nextPlannedActivity,
      attachments: update.attachments || [],
      timestamp: now
    };

    // Save to continuous progress logs (never overwrite!)
    const currentLogs = this.getProgressLogs();
    const updatedLogs = [newLog, ...currentLogs];
    this.saveSnapshot(PROGRESS_LOGS_KEY, updatedLogs);

    // Update active task record
    const updatedTask: Task = {
      ...task,
      completionPercentage: update.completionPercentage,
      status: update.status,
      actualHours: (task.actualHours || 0) + (update.timeSpentHours || 0),
      employeeUpdates: update.workCompleted,
      history: [
        {
          timestamp: now,
          actor: update.employeeName,
          action: `Progress updated to ${update.completionPercentage}% (${update.status})`,
          notes: update.workCompleted
        },
        ...(task.history || [])
      ],
      updatedAt: now
    };

    const taskList = tasks.map(t => t.id === task.id ? updatedTask : t);
    this.saveSnapshot(TASKS_KEY, taskList);

    // Recalculate overall project completion %
    this.recalculateProjectProgress(task.projectId);

    // Audit Log
    this.addAuditLog({
      action: 'Work Progress Submitted',
      actor: `${update.employeeName} (${update.employeeId})`,
      actorRole: 'employee',
      entityType: 'Progress',
      entityId: logId,
      details: `Task "${task.title}": ${update.completionPercentage}%, Status: ${update.status}. Time logged: ${update.timeSpentHours}h.`
    });

    // Notify Main Admin
    this.addNotification({
      title: `Progress Update: ${task.title}`,
      message: `${update.employeeName} logged ${update.completionPercentage}% progress (${update.status}). Completed: "${update.workCompleted.substring(0, 80)}..."`,
      type: 'progress'
    });

    return newLog;
  }

  getProgressLogs(taskId?: string, employeeId?: string, projectId?: string): TaskProgressLog[] {
    let logs = this.getUniqueRecords(PROGRESS_LOGS_KEY, DEFAULT_PROGRESS_LOGS, log => [log.id]);
    if (taskId) logs = logs.filter(l => l.taskId === taskId);
    if (employeeId) logs = logs.filter(l => l.employeeId === employeeId);
    if (projectId) logs = logs.filter(l => l.projectId === projectId);
    return logs;
  }

  // --- RECALCULATE PROGRESS ---
  recalculateProjectProgress(projectId: string): number {
    const tasks = this.getTasks().filter(t => t.projectId === projectId);
    if (tasks.length === 0) return 0;

    let totalWeight = 0;
    let weightedSum = 0;

    tasks.forEach(t => {
      const w = t.weight && t.weight > 0 ? t.weight : 1.0;
      totalWeight += w;
      weightedSum += (t.completionPercentage || 0) * w;
    });

    const calculatedProgress = Math.round((weightedSum / totalWeight) * 10) / 10;

    const projects = this.getProjects();
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          completionPercentage: calculatedProgress,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    this.saveSnapshot(PROJECTS_KEY, updated);
    return calculatedProgress;
  }

  calculateEmployeeMetrics(employeeId: string) {
    const tasks = this.getTasksForEmployee(employeeId);
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const underReview = tasks.filter(t => t.status === 'Under Review').length;
    const revisionReq = tasks.filter(t => t.status === 'Revision Required').length;
    const pending = tasks.filter(t => t.status === 'Not Started').length;
    
    const now = new Date();
    const overdue = tasks.filter(t => {
      if (t.status === 'Completed') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }).length;

    const avgProgress = total > 0 
      ? Math.round(tasks.reduce((sum, t) => sum + (t.completionPercentage || 0), 0) / total)
      : 0;

    const assignedProjects = this.getProjectsForEmployee(employeeId);
    const assignedClientIds = new Set(assignedProjects.map(p => p.clientId));

    const logs = this.getProgressLogs(undefined, employeeId);
    const lastUpdate = logs.length > 0 ? logs[0].timestamp : null;

    return {
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      underReviewTasks: underReview,
      revisionRequiredTasks: revisionReq,
      pendingTasks: pending,
      overdueTasks: overdue,
      overallProgress: avgProgress,
      assignedProjectsCount: assignedProjects.length,
      assignedClientsCount: assignedClientIds.size,
      lastUpdate
    };
  }

  // --- INVOICES & PAYMENTS ---
  getInvoices(): Invoice[] {
    return this.getUniqueRecords(INVOICES_KEY, DEFAULT_INVOICES, invoice => [
      invoice.id,
      invoice.invoiceNumber?.trim().toLowerCase()
    ]);
  }

  addInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt'>): Invoice {
    const invoices = this.getInvoices();
    const id = `INV-${5000 + invoices.length + 1}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [newInvoice, ...invoices];
    this.saveSnapshot(INVOICES_KEY, updated);

    this.addAuditLog({
      action: 'Invoice Created',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Invoice',
      entityId: id,
      details: `Generated invoice ${newInvoice.invoiceNumber} for ${newInvoice.clientName} (Total: ₹${newInvoice.totalAmount.toLocaleString('en-IN')})`
    });

    return newInvoice;
  }

  updateInvoice(invoice: Invoice): void {
    const list = this.getInvoices().map(inv => inv.id === invoice.id ? invoice : inv);
    this.saveSnapshot(INVOICES_KEY, list);
    this.addAuditLog({
      action: 'Invoice Updated',
      actor: 'Main Admin',
      actorRole: 'admin',
      entityType: 'Invoice',
      entityId: invoice.id,
      details: `Updated invoice ${invoice.invoiceNumber}. Status: ${invoice.status}, Outstanding: ₹${invoice.outstandingBalance}`
    });
  }

  getPayments(): Payment[] {
    return this.getUniqueRecords(PAYMENTS_KEY, DEFAULT_PAYMENTS, payment => [
      payment.id,
      payment.transactionReference?.trim().toLowerCase()
    ]);
  }

  recordPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Payment {
    const payments = this.getPayments();
    const id = `PAY-${6000 + payments.length + 1}`;
    const newPayment: Payment = {
      ...paymentData,
      id,
      createdAt: new Date().toISOString()
    };

    const updatedPayments = [newPayment, ...payments];
    this.saveSnapshot(PAYMENTS_KEY, updatedPayments);

    // Update associated invoice balance
    const invoices = this.getInvoices();
    const targetInvoice = invoices.find(inv => inv.id === paymentData.invoiceId || inv.invoiceNumber === paymentData.invoiceNumber);

    if (targetInvoice) {
      const newPaid = Number(targetInvoice.paidAmount || 0) + Number(paymentData.amount);
      const newBalance = Math.max(0, Number(targetInvoice.totalAmount) - newPaid);
      let newStatus = targetInvoice.status;
      if (newBalance === 0) {
        newStatus = 'Paid';
      } else if (newPaid > 0) {
        newStatus = 'Partially Paid';
      }

      const updatedInvoice: Invoice = {
        ...targetInvoice,
        paidAmount: newPaid,
        outstandingBalance: newBalance,
        status: newStatus
      };

      const updatedInvoicesList = invoices.map(i => i.id === targetInvoice.id ? updatedInvoice : i);
      this.saveSnapshot(INVOICES_KEY, updatedInvoicesList);
    }

    this.addAuditLog({
      action: 'Payment Recorded',
      actor: paymentData.recordedBy || 'Main Admin',
      actorRole: 'admin',
      entityType: 'Payment',
      entityId: id,
      details: `Recorded ₹${paymentData.amount.toLocaleString('en-IN')} payment from ${paymentData.clientName} via ${paymentData.paymentMethod} (Ref: ${paymentData.transactionReference})`
    });

    return newPayment;
  }

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLog[] {
    return this.getUniqueRecords(AUDIT_LOGS_KEY, DEFAULT_AUDIT_LOGS, log => [log.id]);
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditLog = {
      ...log,
      id: `AUD-${7000 + logs.length + 1}`,
      timestamp: new Date().toISOString()
    };
    const updated = [newEntry, ...logs];
    this.saveSnapshot(AUDIT_LOGS_KEY, updated);
  }

  // --- NOTIFICATIONS ---
  getNotifications(employeeId?: string): NotificationItem[] {
    let list = this.getUniqueRecords(NOTIFICATIONS_KEY, DEFAULT_NOTIFICATIONS, notification => [
      notification.id
    ]);
    if (employeeId) {
      list = list.filter(n => !n.recipientEmployeeId || n.recipientEmployeeId === employeeId);
    }
    return list;
  }

  addNotification(notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): void {
    const list = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: `NOTIF-${8000 + list.length + 1}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    const updated = [newNotif, ...list];
    this.saveSnapshot(NOTIFICATIONS_KEY, updated);
  }

  markNotificationRead(id: string): void {
    const list = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    this.saveSnapshot(NOTIFICATIONS_KEY, list);
  }

  // --- COMPREHENSIVE BUSINESS OVERVIEW STATS (FOR MAIN ADMIN DASHBOARD) ---
  getBusinessOverview() {
    const employees = this.getEmployees();
    const clients = this.getClients();
    const projects = this.getProjects();
    const tasks = this.getTasks();
    const invoices = this.getInvoices();
    const payments = this.getPayments();

    const activeClients = clients.filter(c => c.status === 'Active').length;
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const pendingProjects = projects.filter(p => p.status === 'Planning' || p.status === 'On Hold').length;

    const now = new Date();
    const overdueTasks = tasks.filter(t => {
      if (t.status === 'Completed') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }).length;

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const paymentsReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const outstandingPayments = Math.max(0, totalRevenue - paymentsReceived);

    const totalInvoices = invoices.length;
    const pendingInvoices = invoices.filter(inv => inv.status !== 'Paid' && inv.status !== 'Cancelled').length;

    const overallWorkCompletion = projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + (p.completionPercentage || 0), 0) / projects.length)
      : 0;

    return {
      totalEmployees: employees.length,
      activeClients,
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      overdueTasks,
      totalRevenue,
      paymentsReceived,
      outstandingPayments,
      totalInvoices,
      pendingInvoices,
      overallWorkCompletion
    };
  }

  // --- WORK REPORT GENERATOR ---
  generateWorkReport(filter: WorkReportFilter) {
    const employee = filter.employeeId ? this.getEmployeeById(filter.employeeId) : undefined;
    let tasks = filter.employeeId ? this.getTasksForEmployee(filter.employeeId) : this.getTasks();
    let logs = filter.employeeId ? this.getProgressLogs(undefined, filter.employeeId) : this.getProgressLogs();

    if (filter.clientId) {
      tasks = tasks.filter(t => t.clientId === filter.clientId);
      logs = logs.filter(l => {
        const t = this.getTasks().find(task => task.id === l.taskId);
        return t && t.clientId === filter.clientId;
      });
    }

    if (filter.projectId) {
      tasks = tasks.filter(t => t.projectId === filter.projectId);
      logs = logs.filter(l => l.projectId === filter.projectId);
    }

    if (filter.status && filter.status !== 'All') {
      tasks = tasks.filter(t => t.status === filter.status);
    }

    // Date filtering
    if (filter.startDate) {
      const start = new Date(filter.startDate).getTime();
      tasks = tasks.filter(t => new Date(t.createdAt).getTime() >= start);
      logs = logs.filter(l => new Date(l.timestamp).getTime() >= start);
    }
    if (filter.endDate) {
      const end = new Date(filter.endDate).getTime();
      tasks = tasks.filter(t => new Date(t.createdAt).getTime() <= end);
      logs = logs.filter(l => new Date(l.timestamp).getTime() <= end);
    }

    // Distinguish completed during period vs overall completed
    const completedInPeriod = logs.filter(l => l.status === 'Completed').length;
    const completedOverall = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'Not Started').length;
    
    const now = new Date();
    const overdue = tasks.filter(t => {
      if (t.status === 'Completed') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }).length;

    const totalHoursSpent = logs.reduce((sum, l) => sum + (l.timeSpentHours || 0), 0);
    const avgProgress = tasks.length > 0 
      ? Math.round(tasks.reduce((sum, t) => sum + (t.completionPercentage || 0), 0) / tasks.length)
      : 0;

    const assignedProjects = filter.employeeId 
      ? this.getProjectsForEmployee(filter.employeeId)
      : this.getProjects();

    const clientIds = new Set(assignedProjects.map(p => p.clientId));
    const assignedClients = this.getClients().filter(c => clientIds.has(c.id));

    return {
      employee,
      reportingPeriod: filter.period || 'all',
      assignedClients,
      assignedProjects,
      tasks,
      progressLogs: logs,
      totalAssignedTasks: tasks.length,
      tasksCompletedInPeriod: completedInPeriod,
      tasksCompletedOverall: completedOverall,
      tasksInProgress: inProgress,
      tasksPending: pending,
      tasksOverdue: overdue,
      completionPercentage: avgProgress,
      totalHoursSpent,
      blockersEncountered: logs.filter(l => l.blockers && l.blockers.trim().length > 0).map(l => ({
        taskTitle: l.taskTitle,
        blocker: l.blockers,
        timestamp: l.timestamp
      }))
    };
  }
}

export const crmDb = new CrmDbService();
