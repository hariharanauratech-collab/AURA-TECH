import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, FolderGit2, CheckSquare, BarChart3, 
  Bell, User, LogOut, ArrowRight, Clock, AlertTriangle, CheckCircle2, 
  Calendar, Send, Phone, Mail, ChevronRight, Sparkles, ExternalLink 
} from 'lucide-react';
import { Employee, Task, Project, Client, NotificationItem } from './crmTypes';
import { crmDb } from './crmDbService';
import { ProgressModal } from './ProgressModal';
import { WorkReportsView } from './WorkReportsView';
import { formatINR } from './pdfService';

interface EmployeePortalProps {
  employee: Employee;
  onLogout: () => void;
}

type TabType = 'dashboard' | 'clients' | 'projects' | 'tasks' | 'update_progress' | 'reports' | 'notifications' | 'profile';

export const EmployeePortal: React.FC<EmployeePortalProps> = ({
  employee,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedTaskForProgress, setSelectedTaskForProgress] = useState<Task | null>(null);

  // Load employee-specific data
  const metrics = crmDb.calculateEmployeeMetrics(employee.id);
  const myProjects = crmDb.getProjectsForEmployee(employee.id);
  const myTasks = crmDb.getTasksForEmployee(employee.id);
  const allClients = crmDb.getClients();
  const myClientIds = new Set(myProjects.map(p => p.clientId));
  const myClients = allClients.filter(c => myClientIds.has(c.id));
  const myNotifications = crmDb.getNotifications(employee.id);
  const unreadCount = myNotifications.filter(n => !n.read).length;

  const handleProgressSubmitted = () => {
    // Force refresh by triggering state update
    setSelectedTaskForProgress(null);
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
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900/70 border-r border-slate-800 flex flex-col shrink-0">
        
        {/* Brand & Employee Identity */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="Aura Tech" className="h-8 w-auto object-contain" />
            <span className="font-bold tracking-tight text-white uppercase text-sm">
              AURA <span className="text-indigo-400">TECH</span>
            </span>
            <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Employee
            </span>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <img 
              src={employee.avatar || '/logo.png'} 
              alt={employee.name} 
              className="w-10 h-10 rounded-xl object-cover border border-indigo-500/30"
              onError={(e) => { (e.target as any).src = '/logo.png'; }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-white truncate">{employee.name}</h3>
              <p className="text-[10px] text-indigo-400 font-mono">{employee.id}</p>
              <p className="text-[10px] text-slate-400 truncate">{employee.designation}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard size={16} />
            My Dashboard
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'clients' 
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={16} />
              My Clients
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 font-mono text-slate-300">
              {myClients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'projects' 
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <FolderGit2 size={16} />
              My Projects
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 font-mono text-slate-300">
              {myProjects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'tasks' 
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare size={16} />
              My Tasks
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 font-mono text-indigo-300 font-bold">
              {myTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('update_progress')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'update_progress' 
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Clock size={16} />
            Update Work Progress
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'reports' 
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 size={16} />
            My Work Reports
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'notifications' 
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell size={16} />
              Notifications
            </div>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 font-mono text-white font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'profile' 
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <User size={16} />
            My Profile
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 text-xs font-semibold transition-colors"
          >
            <LogOut size={14} />
            Exit Employee Portal
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/30 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-white capitalize">
              {activeTab.replace('_', ' ')}
            </h1>
            <span className="text-xs text-slate-500 hidden sm:inline">
              • Employee Portal ({employee.name})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
              )}
            </button>

            <button
              onClick={() => {
                if (myTasks.length > 0) setSelectedTaskForProgress(myTasks[0]);
                else alert('No tasks assigned yet to update.');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:opacity-95 cursor-pointer"
            >
              <Clock size={14} /> Update Progress
            </button>
          </div>
        </header>

        {/* Tab Content Container */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Welcome Hero Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Aura Tech Employee Workspace
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Welcome back, {employee.name}!
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    You have <span className="font-bold text-white">{myTasks.filter(t => t.status !== 'Completed').length} active tasks</span> across <span className="font-bold text-white">{myProjects.length} assigned projects</span>.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-4 text-center">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Overall Progress</p>
                    <p className="text-xl font-black text-indigo-400 font-mono">{metrics.overallProgress}%</p>
                  </div>
                  <div className="w-px h-8 bg-slate-800"></div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Completed</p>
                    <p className="text-xl font-black text-emerald-400 font-mono">{metrics.completedTasks}/{metrics.totalTasks}</p>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">My Clients</p>
                  <p className="text-2xl font-black text-white font-mono">{myClients.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">My Projects</p>
                  <p className="text-2xl font-black text-white font-mono">{myProjects.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">Tasks In Progress</p>
                  <p className="text-2xl font-black text-indigo-400 font-mono">{metrics.inProgressTasks}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">Under Review</p>
                  <p className="text-2xl font-black text-amber-400 font-mono">{metrics.underReviewTasks}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">Overdue Tasks</p>
                  <p className="text-2xl font-black text-rose-400 font-mono">{metrics.overdueTasks}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Tasks Completed</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono">{metrics.completedTasks}</p>
                </div>
              </div>

              {/* Tasks Requiring Revision Alert (If any) */}
              {myTasks.filter(t => t.status === 'Revision Required').length > 0 && (
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <div>
                      <h4 className="text-xs font-bold text-orange-300">Action Required: Tasks Needing Revision</h4>
                      <p className="text-[11px] text-orange-400/80">Main Admin has requested updates on one or more of your deliverables.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('tasks')}
                    className="px-3 py-1.5 rounded-lg bg-orange-500 text-white font-bold text-xs"
                  >
                    View Tasks
                  </button>
                </div>
              )}

              {/* Active Assigned Tasks Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    My Active Task Assignments ({myTasks.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    View All <ChevronRight size={14} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Task</th>
                        <th className="py-3 px-4">Project</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Progress</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {myTasks.slice(0, 5).map((task) => (
                        <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white">
                            <div>{task.title}</div>
                            <span className="text-[10px] text-slate-500 font-mono">{task.id}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {task.projectTitle}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400' :
                              task.priority === 'High' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono">
                            {task.dueDate}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${task.completionPercentage}%` }}></div>
                              </div>
                              <span>{task.completionPercentage}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedTaskForProgress(task)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[11px] font-bold border border-indigo-500/30 transition-colors cursor-pointer"
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MY CLIENTS (Strictly restricted to assigned projects) */}
          {activeTab === 'clients' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">My Assigned Clients</h3>
                <p className="text-xs text-slate-400">Clients associated with projects you are currently allocated to work on.</p>
              </div>

              {myClients.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
                  No clients currently assigned to your projects.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myClients.map(client => {
                    const clientProjects = myProjects.filter(p => p.clientId === client.id);
                    return (
                      <div key={client.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                              {client.id}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1">{client.name}</h4>
                            <p className="text-xs text-slate-400 font-medium">{client.company}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {client.status}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                          <p><span className="text-slate-500">Email:</span> {client.email}</p>
                          <p><span className="text-slate-500">Phone:</span> {client.phone}</p>
                          <p><span className="text-slate-500">Tier:</span> {client.clientType}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Assigned Projects ({clientProjects.length}):
                          </p>
                          <div className="space-y-1.5">
                            {clientProjects.map(cp => (
                              <div key={cp.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                                <span className="font-semibold text-white">{cp.title}</span>
                                <span className="font-mono text-indigo-400 font-bold">{cp.completionPercentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">My Assigned Projects</h3>
                <p className="text-xs text-slate-400">All active projects where you are a key contributor.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myProjects.map(proj => {
                  const tasksInProj = myTasks.filter(t => t.projectId === proj.id);
                  const myRole = proj.assignedEmployees.find(e => e.employeeId === employee.id);

                  return (
                    <div key={proj.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                            {proj.id}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1">{proj.title}</h4>
                          <p className="text-xs text-slate-400">Client: {proj.clientName}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {proj.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                        {proj.description}
                      </p>

                      {/* My Assigned Role & Responsibility */}
                      {myRole && (
                        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
                          <p className="font-bold text-indigo-300 mb-0.5">Your Role: {myRole.role}</p>
                          <p className="text-slate-300 text-[11px]">{myRole.responsibility}</p>
                        </div>
                      )}

                      {/* Overall Project Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1.5 font-medium">
                          <span className="text-slate-400">Project Progress</span>
                          <span className="font-mono font-bold text-indigo-400">{proj.completionPercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" 
                            style={{ width: `${proj.completionPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Project Meta */}
                      <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                        <span>Due: <span className="font-mono text-white">{proj.dueDate}</span></span>
                        <span>My Tasks in Project: <span className="font-mono text-white">{tasksInProj.length}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MY TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">My Task Queue</h3>
                  <p className="text-xs text-slate-400">Manage tasks, deadlines, and log continuous progress.</p>
                </div>
              </div>

              <div className="space-y-3">
                {myTasks.map(task => (
                  <div key={task.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                          {task.id}
                        </span>
                        <h4 className="text-sm font-bold text-white">{task.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400' :
                          task.priority === 'High' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">
                      {task.description}
                    </p>

                    {task.adminInstructions && (
                      <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300">
                        <span className="font-bold">Admin Instructions: </span>{task.adminInstructions}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-4 text-slate-400">
                        <span>Project: <span className="text-white font-medium">{task.projectTitle}</span></span>
                        <span>Due: <span className="font-mono text-white">{task.dueDate}</span></span>
                        <span>Hours: <span className="font-mono text-white">{task.actualHours || 0}h logged</span></span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${task.completionPercentage}%` }}></div>
                          </div>
                          <span className="font-mono font-bold text-indigo-400">{task.completionPercentage}%</span>
                        </div>
                        <button
                          onClick={() => setSelectedTaskForProgress(task)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Clock size={13} /> Update Progress
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: UPDATE WORK PROGRESS (Quick selector) */}
          {activeTab === 'update_progress' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Select Task to Update Progress</h3>
                <p className="text-xs text-slate-400">Choose one of your assigned deliverables to submit a timestamped progress entry.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTaskForProgress(task)}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">{task.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">{task.projectTitle}</p>
                    <div className="mt-3 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Progress: {task.completionPercentage}%</span>
                      <span className="text-indigo-400 font-bold flex items-center gap-1">Update <ArrowRight size={13} /></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: MY WORK REPORTS */}
          {activeTab === 'reports' && (
            <div className="animate-in fade-in duration-200">
              <WorkReportsView currentEmployee={employee} isAdmin={false} />
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Notifications & Announcements</h3>
                <p className="text-xs text-slate-400">Task reassignments, deadline changes, and admin instructions.</p>
              </div>

              <div className="space-y-2">
                {myNotifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      notif.read ? 'bg-slate-900/40 border-slate-800' : 'bg-indigo-950/20 border-indigo-500/30 shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-xl mx-auto p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-4">
                <img 
                  src={employee.avatar || '/logo.png'} 
                  alt={employee.name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40"
                  onError={(e) => { (e.target as any).src = '/logo.png'; }}
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{employee.name}</h3>
                  <p className="text-xs text-indigo-400 font-mono">{employee.id}</p>
                  <p className="text-xs text-slate-400">{employee.designation}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Department</span>
                  <span className="font-semibold text-white">{employee.department}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Email</span>
                  <span className="font-semibold text-white">{employee.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-semibold text-white">{employee.phone}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Joined Date</span>
                  <span className="font-semibold text-white">{employee.joinedDate}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Skills & Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {employee.skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* RENDER PROGRESS UPDATE MODAL WHEN SELECTED */}
      {selectedTaskForProgress && (
        <ProgressModal
          task={selectedTaskForProgress}
          currentEmployee={employee}
          onClose={() => setSelectedTaskForProgress(null)}
          onUpdateSubmitted={handleProgressSubmitted}
        />
      )}

    </div>
  );
};
