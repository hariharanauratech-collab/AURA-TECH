import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, Users, FolderGit2, CheckSquare, Clock, BarChart3, 
  FileText, DollarSign, TrendingUp, Shield, Settings, LogOut, Plus, 
  Search, Filter, Eye, Edit3, ArrowRight, CheckCircle2, AlertTriangle, 
  Calendar, UserCheck, Trash2, ChevronRight, X, Sparkles, AlertCircle 
} from 'lucide-react';
import { 
  Employee, Client, Project, Task, TaskProgressLog, 
  Invoice, Payment, AuditLog, TaskPriority, TaskStatus, ProjectRequest, ProjectRequestStatus
} from './crmTypes';
import { crmDb } from './crmDbService';
import { supabaseService } from './supabase';
import { InvoiceView } from './InvoiceView';
import { WorkReportsView } from './WorkReportsView';
import { ProgressModal } from './ProgressModal';
import { formatINR } from './pdfService';

interface AdminPortalProps {
  onLogout: () => void;
}

type AdminTab = 
  | 'dashboard' 
  | 'requests'
  | 'employees' 
  | 'clients' 
  | 'projects' 
  | 'tasks' 
  | 'progress' 
  | 'reports' 
  | 'invoices' 
  | 'payments' 
  | 'revenue' 
  | 'audit' 
  | 'settings';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Live Database States
  const [employees, setEmployees] = useState<Employee[]>(crmDb.getEmployees());
  const [clients, setClients] = useState<Client[]>(crmDb.getClients());
  const [projects, setProjects] = useState<Project[]>(crmDb.getProjects());
  const [tasks, setTasks] = useState<Task[]>(crmDb.getTasks());
  const [progressLogs, setProgressLogs] = useState<TaskProgressLog[]>(crmDb.getProgressLogs());
  const [invoices, setInvoices] = useState<Invoice[]>(crmDb.getInvoices());
  const [payments, setPayments] = useState<Payment[]>(crmDb.getPayments());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(crmDb.getAuditLogs());
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);
  const [projectRequestError, setProjectRequestError] = useState('');
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<Employee | null>(null);

  // Modals
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [reassignTaskTarget, setReassignTaskTarget] = useState<Task | null>(null);
  const [reassignNewEmpId, setReassignNewEmpId] = useState('');
  const [reassignNotes, setReassignNotes] = useState('');

  // Form States: New Client
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientGstin, setNewClientGstin] = useState('');
  const [newClientType, setNewClientType] = useState<'Student' | 'Professional' | 'Enterprise'>('Professional');
  const [clientDuplicateWarning, setClientDuplicateWarning] = useState<string>('');

  // Form States: New Project
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjClientId, setNewProjClientId] = useState(clients[0]?.id || '');
  const [newProjType, setNewProjType] = useState('Website');
  const [newProjBudget, setNewProjBudget] = useState('50000');
  const [newProjDueDate, setNewProjDueDate] = useState('');
  const [newProjAssignedEmps, setNewProjAssignedEmps] = useState<string[]>(['EMP001', 'EMP002']);

  // Form States: New Task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskProjId, setNewTaskProjId] = useState(projects[0]?.id || '');
  const [newTaskEmpId, setNewTaskEmpId] = useState(employees[0]?.id || '');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskEstHours, setNewTaskEstHours] = useState('20');
  const [newTaskAdminInstructions, setNewTaskAdminInstructions] = useState('');

  const refreshAll = () => {
    setEmployees(crmDb.getEmployees());
    setClients(crmDb.getClients());
    setProjects(crmDb.getProjects());
    setTasks(crmDb.getTasks());
    setProgressLogs(crmDb.getProgressLogs());
    setInvoices(crmDb.getInvoices());
    setPayments(crmDb.getPayments());
    setAuditLogs(crmDb.getAuditLogs());
  };

  const refreshProjectRequests = async () => {
    setIsLoadingRequests(true);
    setProjectRequestError('');
    try {
      setProjectRequests(await supabaseService.getProjectRequests());
    } catch (error) {
      setProjectRequestError(error instanceof Error ? error.message : 'Could not load project requests.');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') void refreshProjectRequests();
  }, [activeTab]);

  const handleProjectRequestStatusChange = async (id: string, status: ProjectRequestStatus) => {
    try {
      await supabaseService.updateProjectRequestStatus(id, status);
      await refreshProjectRequests();
    } catch (error) {
      setProjectRequestError(error instanceof Error ? error.message : 'Could not update project request.');
    }
  };

  const businessOverview = crmDb.getBusinessOverview();

  // Handle Create Client with Duplicate Check
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    const dup = crmDb.checkClientDuplicate(newClientEmail, newClientPhone, newClientName, newClientCompany);
    if (dup) {
      setClientDuplicateWarning(`This client already exists (${dup.name} — ${dup.company}, ${dup.email}). Duplicate client records are not allowed.`);
      return;
    }

    crmDb.addClient({
      name: newClientName,
      company: newClientCompany,
      email: newClientEmail,
      phone: newClientPhone,
      address: newClientAddress,
      gstin: newClientGstin || undefined,
      clientType: newClientType,
      status: 'Active',
      totalBudget: 0
    });

    refreshAll();
    setIsAddClientOpen(false);
    setNewClientName('');
    setNewClientCompany('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientAddress('');
    setNewClientGstin('');
    setClientDuplicateWarning('');
  };

  // Handle Create Project & Multi-Employee Allocation
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === newProjClientId);
    if (!client) {
      alert('Please select a valid client.');
      return;
    }

    const assignedAllocations = newProjAssignedEmps.map(empId => {
      const emp = employees.find(e => e.id === empId);
      return {
        employeeId: empId,
        employeeName: emp ? emp.name : empId,
        role: emp ? emp.designation : 'Contributor',
        responsibility: 'Project execution and deliverable milestones'
      };
    });

    crmDb.addProject({
      title: newProjTitle,
      description: newProjDesc,
      clientId: client.id,
      clientName: client.company || client.name,
      projectType: newProjType,
      budget: parseFloat(newProjBudget) || 0,
      status: 'In Progress',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: newProjDueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      assignedEmployeeIds: newProjAssignedEmps,
      assignedEmployees: assignedAllocations
    });

    refreshAll();
    setIsAddProjectOpen(false);
    setNewProjTitle('');
    setNewProjDesc('');
  };

  // Handle Create Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find(p => p.id === newTaskProjId);
    const emp = employees.find(e => e.id === newTaskEmpId);

    if (!project || !emp) {
      alert('Please select a project and employee.');
      return;
    }

    crmDb.addTask({
      title: newTaskTitle,
      description: newTaskDesc,
      projectId: project.id,
      projectTitle: project.title,
      clientId: project.clientId,
      clientName: project.clientName,
      assignedEmployeeId: emp.id,
      assignedEmployeeName: emp.name,
      priority: newTaskPriority,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: newTaskDueDate || project.dueDate,
      estimatedHours: parseFloat(newTaskEstHours) || 0,
      actualHours: 0,
      status: 'In Progress',
      completionPercentage: 0,
      adminInstructions: newTaskAdminInstructions || undefined,
      weight: 1.0
    });

    refreshAll();
    setIsAddTaskOpen(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskAdminInstructions('');
  };

  // Handle Reassign Task
  const handleReassignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTaskTarget || !reassignNewEmpId) return;

    crmDb.reassignTask(
      reassignTaskTarget.id,
      reassignNewEmpId,
      'Main Admin',
      reassignNotes
    );

    refreshAll();
    setReassignTaskTarget(null);
    setReassignNewEmpId('');
    setReassignNotes('');
  };

  // Approve or Request Revision on Task
  const handleApproveTask = (task: Task) => {
    crmDb.updateTask(
      {
        ...task,
        status: 'Completed',
        completionPercentage: 100
      },
      'Main Admin',
      'admin'
    );
    refreshAll();
  };

  const handleRequestRevision = (task: Task) => {
    const note = prompt('Please enter revision instructions for the employee:');
    if (!note) return;

    crmDb.updateTask(
      {
        ...task,
        status: 'Revision Required',
        adminInstructions: `Revision Request: ${note}`
      },
      'Main Admin',
      'admin'
    );
    crmDb.addNotification({
      recipientEmployeeId: task.assignedEmployeeId,
      title: 'Revision Requested on Task',
      message: `Admin requested revisions on "${task.title}": ${note}`,
      type: 'revision'
    });
    refreshAll();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'In Progress': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Under Review': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Revision Required': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Blocked': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* ADMIN SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col shrink-0">
        
        {/* Brand */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <img src="/logo.png" alt="Aura Tech" className="h-8 w-auto object-contain" />
            <span className="font-bold tracking-tight text-white uppercase text-sm">
              AURA <span className="text-indigo-500">TECH</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Main Admin Control</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono">
              v2.5
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto text-xs font-semibold">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'requests', label: 'Project Requests', icon: FileText, badge: projectRequests.filter(request => request.status === 'New').length },
            { id: 'employees', label: 'Employees (7)', icon: Users, badge: employees.length },
            { id: 'clients', label: 'Clients & CRM', icon: UserCheck, badge: clients.length },
            { id: 'projects', label: 'Projects & Allocation', icon: FolderGit2, badge: projects.length },
            { id: 'tasks', label: 'Task Assignments', icon: CheckSquare, badge: tasks.length },
            { id: 'progress', label: 'Work Progress', icon: Clock },
            { id: 'reports', label: 'Employee Work Reports', icon: BarChart3 },
            { id: 'invoices', label: 'Invoices & Billing', icon: FileText, badge: invoices.length },
            { id: 'payments', label: 'Payments & Revenue', icon: DollarSign },
            { id: 'revenue', label: 'Revenue Analytics', icon: TrendingUp },
            { id: 'audit', label: 'Audit Logs', icon: Shield },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Log out */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Exit Admin Portal
          </button>
        </div>

      </aside>

      {/* ADMIN MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/30 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-white capitalize">
              {activeTab.replace('_', ' ')}
            </h1>
            <span className="text-xs text-slate-500 hidden sm:inline">
              • Aura Tech Central Administration
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddProjectOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} /> New Project
            </button>
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Assign Task
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          
          {/* TAB 1: MAIN ADMIN DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Executive Business Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Employees</p>
                  <p className="text-2xl font-black text-indigo-400 font-mono">7</p>
                  <span className="text-[10px] text-slate-500">Aura Core Team</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active Clients</p>
                  <p className="text-2xl font-black text-white font-mono">{businessOverview.activeClients}</p>
                  <span className="text-[10px] text-slate-500">Confirmed Retainers</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active Projects</p>
                  <p className="text-2xl font-black text-white font-mono">{businessOverview.activeProjects}</p>
                  <span className="text-[10px] text-slate-500">{businessOverview.totalProjects} Total Projects</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Completed</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono">{businessOverview.completedProjects}</p>
                  <span className="text-[10px] text-slate-500">Delivered</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">Overdue Tasks</p>
                  <p className="text-2xl font-black text-rose-400 font-mono">{businessOverview.overdueTasks}</p>
                  <span className="text-[10px] text-slate-500">Needs Attention</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">Avg Progress</p>
                  <p className="text-2xl font-black text-indigo-400 font-mono">{businessOverview.overallWorkCompletion}%</p>
                  <span className="text-[10px] text-slate-500">Weighted Velocity</span>
                </div>
              </div>

              {/* Financial Snapshot Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/20">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Invoiced Revenue</p>
                  <p className="text-2xl font-black text-white font-mono mt-1">{formatINR(businessOverview.totalRevenue)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{businessOverview.totalInvoices} Invoices Generated</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Payments Collected</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatINR(businessOverview.paymentsReceived)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Realized in Bank / UPI</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-400">Outstanding Receivables</p>
                  <p className="text-2xl font-black text-rose-400 font-mono mt-1">{formatINR(businessOverview.outstandingPayments)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{businessOverview.pendingInvoices} Pending Invoices</p>
                </div>
              </div>

              {/* DEDICATED EMPLOYEE OVERVIEW TABLE (Section 2 Requirement) */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <Users size={16} className="text-indigo-400" />
                      Dedicated Employee Overview & Workload Table (All 7 Members)
                    </h3>
                    <p className="text-xs text-slate-400">Live operational status, assignments, task completion, and last submitted progress timestamp.</p>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    Source: Database Sync
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-3">Emp ID</th>
                        <th className="py-3 px-3 text-center">Clients</th>
                        <th className="py-3 px-3 text-center">Projects</th>
                        <th className="py-3 px-3 text-center">Tasks</th>
                        <th className="py-3 px-3 text-center text-emerald-400">Completed</th>
                        <th className="py-3 px-3 text-center text-indigo-400">In-Progress</th>
                        <th className="py-3 px-3 text-center text-rose-400">Overdue</th>
                        <th className="py-3 px-4">Overall Work Progress</th>
                        <th className="py-3 px-4">Last Progress Update</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {employees.map((emp) => {
                        const m = crmDb.calculateEmployeeMetrics(emp.id);
                        return (
                          <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={emp.avatar || '/logo.png'}
                                  alt={emp.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                                  onError={(e) => { (e.target as any).src = '/logo.png'; }}
                                />
                                <div>
                                  <div className="font-bold text-white text-xs">{emp.name}</div>
                                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{emp.designation}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3 font-mono font-bold text-indigo-400 text-xs">
                              {emp.id}
                            </td>

                            <td className="py-3 px-3 text-center font-mono font-semibold text-slate-200">
                              {m.assignedClientsCount}
                            </td>

                            <td className="py-3 px-3 text-center font-mono font-semibold text-slate-200">
                              {m.assignedProjectsCount}
                            </td>

                            <td className="py-3 px-3 text-center font-mono font-bold text-white">
                              {m.totalTasks}
                            </td>

                            <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                              {m.completedTasks}
                            </td>

                            <td className="py-3 px-3 text-center font-mono font-bold text-indigo-400">
                              {m.inProgressTasks}
                            </td>

                            <td className="py-3 px-3 text-center font-mono font-bold text-rose-400">
                              {m.overdueTasks}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" 
                                    style={{ width: `${m.overallProgress}%` }}
                                  />
                                </div>
                                <span className="font-mono font-bold text-indigo-400 text-xs">
                                  {m.overallProgress}%
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-[11px] text-slate-400">
                              {m.lastUpdate ? (
                                <span>{new Date(m.lastUpdate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                              ) : (
                                <span className="text-slate-600 italic">No logs yet</span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedEmployeeDetails(emp)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-bold text-[11px] border border-indigo-500/30 transition-colors cursor-pointer"
                                >
                                  View Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* WEBSITE PROJECT REQUEST INBOX */}
          {activeTab === 'requests' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Website Project Requests</h3>
                  <p className="text-xs text-slate-400">Requests submitted through the public Aura Tech website.</p>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshProjectRequests()}
                  disabled={isLoadingRequests}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                >
                  {isLoadingRequests ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>

              {projectRequestError && (
                <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {projectRequestError}
                </div>
              )}

              {isLoadingRequests && projectRequests.length === 0 ? (
                <p className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">Loading project requests…</p>
              ) : projectRequests.length === 0 ? (
                <p className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
                  No project requests found. New website submissions will appear here.
                </p>
              ) : (
                <div className="grid gap-3">
                  {projectRequests.map(request => (
                    <article key={request.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div>
                            <h4 className="font-bold text-white">{request.projectTitle}</h4>
                            <p className="text-xs text-slate-400">{request.projectType} · {request.clientType} · {new Date(request.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="text-xs text-slate-300">
                            <p className="font-semibold">{request.clientName}</p>
                            <p>{request.clientEmail} · {request.clientPhone}</p>
                          </div>
                          <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-400">{request.description}</p>
                        </div>
                        <label className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Status
                          <select
                            value={request.status}
                            onChange={event => void handleProjectRequestStatusChange(request.id, event.target.value as ProjectRequestStatus)}
                            className="mt-1 block rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                          >
                            {(['New', 'Reviewed', 'Contacted', 'Converted', 'Rejected'] as ProjectRequestStatus[]).map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EMPLOYEES GRID */}
          {activeTab === 'employees' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Aura Tech Seven Core Team</h3>
                  <p className="text-xs text-slate-400">Complete profiles, assigned duties, and real-time workload metrics.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map(emp => {
                  const m = crmDb.calculateEmployeeMetrics(emp.id);
                  return (
                    <div key={emp.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar || '/logo.png'}
                          alt={emp.name}
                          className="w-12 h-12 rounded-xl object-cover border border-indigo-500/30"
                          onError={(e) => { (e.target as any).src = '/logo.png'; }}
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{emp.name}</h4>
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            {emp.id}
                          </span>
                          <p className="text-xs text-slate-400">{emp.designation}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950 text-center text-xs">
                        <div>
                          <p className="text-[10px] text-slate-500">Tasks</p>
                          <p className="font-bold text-white font-mono">{m.totalTasks}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Completed</p>
                          <p className="font-bold text-emerald-400 font-mono">{m.completedTasks}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Progress</p>
                          <p className="font-bold text-indigo-400 font-mono">{m.overallProgress}%</p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1">
                        <p><span className="text-slate-500">Dept:</span> {emp.department}</p>
                        <p><span className="text-slate-500">Email:</span> {emp.email}</p>
                        <p><span className="text-slate-500">Phone:</span> {emp.phone}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                        <button
                          onClick={() => setSelectedEmployeeDetails(emp)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                        >
                          View Workload Drawer →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CLIENTS & CRM */}
          {activeTab === 'clients' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Clients Master Directory</h3>
                  <p className="text-xs text-slate-400">All registered clients, contact data, project bookings, and billing histories.</p>
                </div>
                <button
                  onClick={() => setIsAddClientOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Add New Client
                </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Client ID</th>
                        <th className="py-3 px-4">Client Name & Company</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Tier</th>
                        <th className="py-3 px-4">Active Projects</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {clients.map(c => {
                        const clientProjects = projects.filter(p => p.clientId === c.id);
                        return (
                          <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-indigo-400">{c.id}</td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">{c.name}</div>
                              <div className="text-[11px] text-slate-400">{c.company}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              <div>{c.email}</div>
                              <div className="text-[11px] text-slate-500">{c.phone}</div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-300">{c.clientType}</td>
                            <td className="py-3 px-4">
                              {clientProjects.length > 0 ? (
                                <span className="font-mono font-bold text-indigo-400">
                                  {clientProjects.map(p => p.title).join(', ')}
                                </span>
                              ) : (
                                <span className="text-slate-500 italic">None booked yet</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS & ALLOCATION */}
          {activeTab === 'projects' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Active Projects & Employee Distribution</h3>
                  <p className="text-xs text-slate-400">Section 5 Compliance: Client projects distributed to chosen team members.</p>
                </div>
                <button
                  onClick={() => setIsAddProjectOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Create & Distribute Project
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(proj => (
                  <div key={proj.id} className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                          {proj.id}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{proj.title}</h4>
                        <p className="text-xs text-slate-400">Client: <span className="text-slate-200">{proj.clientName}</span></p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                      {proj.description}
                    </p>

                    {/* Assigned Employees Chips */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Assigned Employees ({proj.assignedEmployees.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {proj.assignedEmployees.map((alloc) => (
                          <div key={alloc.employeeId} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                            <span className="font-bold text-white">{alloc.employeeName}</span>
                            <span className="text-[10px] text-indigo-400">({alloc.role})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="text-slate-400">Calculated Project Progress</span>
                        <span className="font-mono font-bold text-indigo-400">{proj.completionPercentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" 
                          style={{ width: `${proj.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                      <span>Budget: <span className="font-mono text-white font-bold">{formatINR(proj.budget)}</span></span>
                      <span>Due: <span className="font-mono text-white">{proj.dueDate}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TASK ASSIGNMENTS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Task Queue & Reassignment Center</h3>
                  <p className="text-xs text-slate-400">Assign, reassign, set priorities, and review employee deliverables.</p>
                </div>
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Assign New Task
                </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Task</th>
                        <th className="py-3 px-4">Project</th>
                        <th className="py-3 px-4">Assigned To</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Progress</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {tasks.map(task => (
                        <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{task.title}</div>
                            <div className="text-[10px] text-indigo-400 font-mono">{task.id}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{task.projectTitle}</td>
                          <td className="py-3 px-4 font-semibold text-white">{task.assignedEmployeeName}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400' :
                              task.priority === 'High' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono">{task.dueDate}</td>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                            {task.completionPercentage}%
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {task.status === 'Under Review' && (
                                <>
                                  <button
                                    onClick={() => handleApproveTask(task)}
                                    title="Approve completed work"
                                    className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRequestRevision(task)}
                                    title="Request revisions"
                                    className="px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[11px] font-bold"
                                  >
                                    Revise
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setReassignTaskTarget(task);
                                  setReassignNewEmpId(employees.find(e => e.id !== task.assignedEmployeeId)?.id || '');
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                              >
                                Reassign
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WORK PROGRESS FEED */}
          {activeTab === 'progress' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Continuous Work Progress Timeline</h3>
                <p className="text-xs text-slate-400">Every progress entry logged by employees with exact timestamps, completed work, hours, and blockers.</p>
              </div>

              <div className="space-y-3">
                {progressLogs.map(log => (
                  <div key={log.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{log.employeeName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({log.employeeId})</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock size={12} />
                        {new Date(log.timestamp).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200">
                      Task: <span className="text-indigo-400">{log.taskTitle}</span> • Project: {log.projectTitle}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-indigo-400 font-bold">Progress: {log.completionPercentage}%</span>
                      {log.timeSpentHours > 0 && <span className="text-slate-400">Time Spent: {log.timeSpentHours} hrs</span>}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      <p className="font-semibold text-slate-200 text-[11px] mb-1">Work Finished:</p>
                      {log.workCompleted}
                    </div>

                    {log.workRemaining && (
                      <p className="text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Remaining: </span>{log.workRemaining}
                      </p>
                    )}

                    {log.blockers && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                        <span className="font-bold">Blocker Reported: </span>{log.blockers}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: WORK REPORTS */}
          {activeTab === 'reports' && (
            <div className="animate-in fade-in duration-200">
              <WorkReportsView isAdmin={true} />
            </div>
          )}

          {/* TAB 8: INVOICES & BILLING */}
          {activeTab === 'invoices' && (
            <div className="animate-in fade-in duration-200">
              <InvoiceView isAdmin={true} />
            </div>
          )}

          {/* TAB 9: PAYMENTS & COLLECTIONS */}
          {activeTab === 'payments' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Payments & Ledger Records</h3>
                <p className="text-xs text-slate-400">Actual collections received via bank transfers, UPI, or corporate cheques.</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Payment ID</th>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Reference / UTR</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {payments.map(p => (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-400">{p.id}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{p.invoiceNumber}</td>
                          <td className="py-3 px-4 font-medium text-white">{p.clientName}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">{p.transactionReference}</td>
                          <td className="py-3 px-4 text-slate-400 font-mono">{p.paymentDate}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                            {formatINR(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: REVENUE ANALYTICS */}
          {activeTab === 'revenue' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Revenue & Financial Analytics</h3>
                <p className="text-xs text-slate-400">Section 11 Compliance: Client-wise and project-wise distribution without duplicating shared revenues.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project-Wise Revenue */}
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Project-Wise Revenue Allocation</h4>
                  <div className="space-y-2">
                    {projects.map(proj => (
                      <div key={proj.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{proj.title}</p>
                          <p className="text-[11px] text-slate-500">{proj.clientName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-indigo-400">{formatINR(proj.budget)}</p>
                          <p className="text-[10px] text-slate-500">{proj.assignedEmployees.length} contributors</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Client-Wise Invoicing */}
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Client-Wise Receivables</h4>
                  <div className="space-y-2">
                    {clients.map(client => {
                      const clientInvoices = invoices.filter(i => i.clientId === client.id);
                      const totalInvoiced = clientInvoices.reduce((s, i) => s + i.totalAmount, 0);
                      const balance = clientInvoices.reduce((s, i) => s + i.outstandingBalance, 0);

                      return (
                        <div key={client.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-white">{client.company || client.name}</p>
                            <p className="text-[11px] text-slate-500">{client.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-white">{formatINR(totalInvoiced)}</p>
                            <p className={`text-[10px] font-mono ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {balance > 0 ? `Due: ${formatINR(balance)}` : 'Fully Settled'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">System Audit Trail</h3>
                <p className="text-xs text-slate-400">Section 12 Compliance: Immutable audit records for assignments, updates, and financial actions.</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Actor</th>
                        <th className="py-3 px-4">Entity</th>
                        <th className="py-3 px-4">Details</th>
                        <th className="py-3 px-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">{log.action}</td>
                          <td className="py-3 px-4 text-indigo-400 font-medium">{log.actor}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{log.entityType} ({log.entityId})</td>
                          <td className="py-3 px-4 text-slate-300 max-w-md truncate">{log.details}</td>
                          <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5 animate-in fade-in duration-200 text-xs">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Aura Tech System Settings</h3>
                <p className="text-slate-400">Database synchronization, invoice bank accounts, and credentials.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="font-bold text-white">Database & Backend Engine</p>
                <p className="text-slate-400">Database Engine: PostgreSQL / Supabase + LocalStorage Fallback Layer</p>
                <p className="text-slate-400">Supabase Endpoint: <span className="font-mono text-indigo-400">vjcogmxzgmvpbqevrdiy.supabase.co</span></p>
                <div className="flex items-center gap-2 text-emerald-400 font-bold pt-1">
                  <CheckCircle2 size={14} /> System Online & Synced
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="font-bold text-white">Main Admin Access</p>
                <p className="text-slate-400">Authorized administrator verified by Supabase.</p>
                <p className="text-slate-400">Role: Executive Main Admin (Full Permissions)</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="font-bold text-white">Default Invoicing Bank Details</p>
                <p className="text-slate-400">Bank: HDFC Bank Ltd | A/C: 50200089271632</p>
                <p className="text-slate-400">IFSC: HDFC0001234 | UPI: auratech008@hdfcbank</p>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* MODAL: ADD CLIENT */}
      {isAddClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Add New Client Record</h3>
              <button onClick={() => { setIsAddClientOpen(false); setClientDuplicateWarning(''); }} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-5 space-y-3.5 text-xs">
              {clientDuplicateWarning && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
                  {clientDuplicateWarning}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  placeholder="e.g. Apex Retailers Pvt Ltd"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Client Type</label>
                  <select
                    value={newClientType}
                    onChange={(e) => setNewClientType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Professional">Professional / Startup</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Student">Student (50% Concession)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={newClientGstin}
                    onChange={(e) => setNewClientGstin(e.target.value)}
                    placeholder="33AABCA..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Billing Address</label>
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="Street, City, State, Pincode"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PROJECT & ALLOCATE EMPLOYEES */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Create New Project & Allocate Team</h3>
                <p className="text-xs text-slate-400">Section 5: Select relevant employees to automatically distribute project.</p>
              </div>
              <button onClick={() => setIsAddProjectOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  placeholder="e.g. Apex E-Commerce Platform"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Select Client *</label>
                  <select
                    value={newProjClientId}
                    onChange={(e) => setNewProjClientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Project Type</label>
                  <select
                    value={newProjType}
                    onChange={(e) => setNewProjType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Website">Website</option>
                    <option value="Application">Application</option>
                    <option value="AI Chatbot">AI Chatbot</option>
                    <option value="Logo">Logo / Brand</option>
                    <option value="UI/UX (for website or app)">UI/UX Design</option>
                    <option value="Software">Enterprise Software</option>
                    <option value="Video Editing">Video Editing</option>
                    <option value="Data Visualization">Data Visualization</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Budget Value (₹)</label>
                  <input
                    type="number"
                    value={newProjBudget}
                    onChange={(e) => setNewProjBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Milestone Due Date</label>
                  <input
                    type="date"
                    value={newProjDueDate}
                    onChange={(e) => setNewProjDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Project Description & Scope</label>
                <textarea
                  rows={2}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Detail deliverable requirements..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Multi-employee allocation check */}
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1.5">
                  Assign Relevant Employees (Automatic Distribution):
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 max-h-36 overflow-y-auto">
                  {employees.map(emp => {
                    const isAssigned = newProjAssignedEmps.includes(emp.id);
                    return (
                      <label key={emp.id} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewProjAssignedEmps([...newProjAssignedEmps, emp.id]);
                            } else {
                              setNewProjAssignedEmps(newProjAssignedEmps.filter(id => id !== emp.id));
                            }
                          }}
                          className="accent-indigo-500"
                        />
                        <span>{emp.name} ({emp.id})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider"
                >
                  Create & Distribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN TASK */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Assign Task to Employee</h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Frontend Responsive Testing"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Target Project *</label>
                  <select
                    value={newTaskProjId}
                    onChange={(e) => setNewTaskProjId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Assign to Employee *</label>
                  <select
                    value={newTaskEmpId}
                    onChange={(e) => setNewTaskEmpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.id}) — {e.designation}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Est. Hours</label>
                  <input
                    type="number"
                    value={newTaskEstHours}
                    onChange={(e) => setNewTaskEstHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Task Description</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="What needs to be done..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Admin Instructions</label>
                <input
                  type="text"
                  value={newTaskAdminInstructions}
                  onChange={(e) => setNewTaskAdminInstructions(e.target.value)}
                  placeholder="Special criteria or deliverables..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REASSIGN TASK (Preserving History) */}
      {reassignTaskTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Reassign Task</h3>
                <p className="text-xs text-slate-400">Current Assignee: {reassignTaskTarget.assignedEmployeeName}</p>
              </div>
              <button onClick={() => setReassignTaskTarget(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReassignTask} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">New Assignee (Employee)</label>
                <select
                  value={reassignNewEmpId}
                  onChange={(e) => setReassignNewEmpId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id}) — {e.designation}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Reassignment Reason / Admin Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Workload balancing or skill alignment"
                  value={reassignNotes}
                  onChange={(e) => setReassignNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReassignTaskTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: VIEW EMPLOYEE DETAILS */}
      {selectedEmployeeDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmployeeDetails.avatar || '/logo.png'}
                  alt={selectedEmployeeDetails.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  onError={(e) => { (e.target as any).src = '/logo.png'; }}
                />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedEmployeeDetails.name}</h3>
                  <p className="text-xs text-indigo-400 font-mono">{selectedEmployeeDetails.id} • {selectedEmployeeDetails.designation}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmployeeDetails(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {(() => {
                  const m = crmDb.calculateEmployeeMetrics(selectedEmployeeDetails.id);
                  return (
                    <>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Tasks</p>
                        <p className="text-lg font-black text-white font-mono">{m.totalTasks}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Completed</p>
                        <p className="text-lg font-black text-emerald-400 font-mono">{m.completedTasks}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">In-Progress</p>
                        <p className="text-lg font-black text-indigo-400 font-mono">{m.inProgressTasks}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Velocity</p>
                        <p className="text-lg font-black text-purple-400 font-mono">{m.overallProgress}%</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-300 mb-2">Assigned Tasks:</h4>
                <div className="space-y-2">
                  {tasks.filter(t => t.assignedEmployeeId === selectedEmployeeDetails.id).map(t => (
                    <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{t.title}</p>
                        <p className="text-[11px] text-slate-400">{t.projectTitle} • Due: {t.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(t.status)}`}>
                          {t.status}
                        </span>
                        <span className="font-mono font-bold text-indigo-400">{t.completionPercentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
