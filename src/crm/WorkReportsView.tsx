import React, { useState } from 'react';
import { 
  BarChart3, Download, FileSpreadsheet, Filter, Calendar, 
  User, CheckCircle2, Clock, AlertTriangle, ChevronRight, Eye 
} from 'lucide-react';
import { WorkReportFilter, Employee, Client, Project, Task } from './crmTypes';
import { crmDb } from './crmDbService';
import { generateWorkReportPDF, exportReportToCSV } from './pdfService';

interface WorkReportsViewProps {
  currentEmployee?: Employee; // If provided, locks report to this employee
  isAdmin?: boolean;
}

export const WorkReportsView: React.FC<WorkReportsViewProps> = ({
  currentEmployee,
  isAdmin = true
}) => {
  const employees = crmDb.getEmployees();
  const clients = crmDb.getClients();
  const projects = crmDb.getProjects();

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    currentEmployee ? currentEmployee.id : 'ALL'
  );
  const [selectedClientId, setSelectedClientId] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [period, setPeriod] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Generate Report state
  const [reportResult, setReportResult] = useState<any>(() => {
    return crmDb.generateWorkReport({
      employeeId: currentEmployee ? currentEmployee.id : undefined,
      period: 'all'
    });
  });

  const handleGenerate = () => {
    const filter: WorkReportFilter = {
      employeeId: selectedEmpId === 'ALL' ? undefined : selectedEmpId,
      clientId: selectedClientId === 'ALL' ? undefined : selectedClientId,
      projectId: selectedProjectId === 'ALL' ? undefined : selectedProjectId,
      status: selectedStatus === 'All' ? undefined : selectedStatus,
      period,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    };

    const res = crmDb.generateWorkReport(filter);
    setReportResult(res);
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'In Progress': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Under Review': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Revision Required': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Blocked': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Employee Work Reports &amp; Audit Analysis
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {currentEmployee 
              ? `Personal performance report and deliverables audit for ${currentEmployee.name}` 
              : 'Detailed performance, task progress, deliverables, and blockers report across all 7 employees.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportReportToCSV(reportResult)}
            className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800/80 text-slate-200 text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button
            onClick={() => generateWorkReportPDF(reportResult)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold flex items-center gap-2 hover:opacity-95 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Download size={16} /> Download PDF Report
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Filter size={15} className="text-indigo-400" />
          Filter Report Parameters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          
          {/* Employee Selector */}
          {!currentEmployee && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Employee</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All 7 Employees</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.id}) — {e.designation}</option>
                ))}
              </select>
            </div>
          )}

          {/* Client Filter */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Client</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Task Status */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Task Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Under Review">Under Review</option>
              <option value="Revision Required">Revision Required</option>
              <option value="Not Started">Not Started</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Time Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Time History</option>
              <option value="daily">Daily Report (Today)</option>
              <option value="weekly">Weekly Report (Last 7 Days)</option>
              <option value="monthly">Monthly Report (Current Month)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {period === 'custom' && (
            <>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider text-sm transition-colors cursor-pointer"
            >
              Generate Live Report
            </button>
          </div>

        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Total Tasks</p>
          <p className="text-3xl font-black text-white font-mono">{reportResult?.totalAssignedTasks || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">Completed (Overall)</p>
          <p className="text-3xl font-black text-emerald-400 font-mono">{reportResult?.tasksCompletedOverall || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1.5">In Progress</p>
          <p className="text-3xl font-black text-indigo-400 font-mono">{reportResult?.tasksInProgress || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-1.5">Overdue Tasks</p>
          <p className="text-3xl font-black text-rose-400 font-mono">{reportResult?.tasksOverdue || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Avg Progress</p>
          <p className="text-3xl font-black text-indigo-400 font-mono">{reportResult?.completionPercentage || 0}%</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Hours Logged</p>
          <p className="text-3xl font-black text-purple-400 font-mono">{reportResult?.totalHoursSpent || 0}h</p>
        </div>
      </div>

      {/* Blockers & Delays Section (If reported) */}
      {reportResult?.blockersEncountered && reportResult.blockersEncountered.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-400 uppercase tracking-wider">
            <AlertTriangle size={16} /> Reported Blockers &amp; Roadblocks ({reportResult.blockersEncountered.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {reportResult.blockersEncountered.map((b: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-white">{b.taskTitle}: </span>
                <span className="text-rose-300">{b.blocker}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Task Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Task Records Included in Report ({(reportResult?.tasks || []).length})
          </h3>
          <span className="text-xs text-slate-400">
            Source: Live Database
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Task ID</th>
                <th className="py-3.5 px-5">Task Title</th>
                <th className="py-3.5 px-5">Client &amp; Project</th>
                <th className="py-3.5 px-5">Assignee</th>
                <th className="py-3.5 px-5">Priority</th>
                <th className="py-3.5 px-5">Due Date</th>
                <th className="py-3.5 px-5">Progress</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(reportResult?.tasks || []).map((task: Task) => (
                <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-indigo-400">
                    {task.id}
                  </td>
                  <td className="py-4 px-5 font-semibold text-white">
                    {task.title}
                  </td>
                  <td className="py-4 px-5">
                    <div className="text-slate-200 font-medium">{task.projectTitle}</div>
                    <div className="text-xs text-slate-400">{task.clientName}</div>
                  </td>
                  <td className="py-4 px-5 text-slate-200 font-medium">
                    {task.assignedEmployeeName}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      task.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400' :
                      task.priority === 'High' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-300 font-mono">
                    {task.dueDate}
                  </td>
                  <td className="py-4 px-5 font-mono font-bold text-indigo-400">
                    <div className="flex items-center gap-2.5">
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${task.completionPercentage}%` }}
                        />
                      </div>
                      <span>{task.completionPercentage}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
