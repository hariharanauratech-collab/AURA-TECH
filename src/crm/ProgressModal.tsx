import React, { useState } from 'react';
import { 
  X, CheckCircle2, Clock, AlertTriangle, ArrowRight, 
  Calendar, User, FileText, ChevronRight, History, Send 
} from 'lucide-react';
import { Task, TaskStatus, TaskProgressLog } from './crmTypes';
import { crmDb } from './crmDbService';

interface ProgressModalProps {
  task: Task;
  currentEmployee: { id: string; name: string };
  onClose: () => void;
  onUpdateSubmitted: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  task,
  currentEmployee,
  onClose,
  onUpdateSubmitted
}) => {
  const [activeTab, setActiveTab] = useState<'update' | 'history'>('update');
  const [percentage, setPercentage] = useState<number>(task.completionPercentage || 0);
  const [status, setStatus] = useState<TaskStatus>(task.status || 'In Progress');
  const [workCompleted, setWorkCompleted] = useState<string>('');
  const [workRemaining, setWorkRemaining] = useState<string>('');
  const [timeSpent, setTimeSpent] = useState<string>('2.0');
  const [blockers, setBlockers] = useState<string>('');
  const [nextActivity, setNextActivity] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const previousLogs: TaskProgressLog[] = crmDb.getProgressLogs(task.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workCompleted.trim()) {
      setError('Please describe the work completed so far.');
      return;
    }

    setIsSubmitting(true);
    try {
      crmDb.submitProgressUpdate({
        taskId: task.id,
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.name,
        completionPercentage: Number(percentage),
        workCompleted: workCompleted.trim(),
        workRemaining: workRemaining.trim(),
        timeSpentHours: parseFloat(timeSpent) || 0,
        status,
        blockers: blockers.trim() || undefined,
        nextPlannedActivity: nextActivity.trim() || undefined
      });

      onUpdateSubmitted();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit progress update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (s: TaskStatus) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {task.id}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(task.status)}`}>
                {task.status}
              </span>
              <span className="text-sm text-slate-400 font-medium">
                • {task.projectTitle}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {task.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('update')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'update' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={15} />
            Submit Work Progress
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'history' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History size={15} />
            Progress Timeline ({previousLogs.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {activeTab === 'update' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Progress Slider */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Completion Percentage
                  </label>
                  <span className="text-xl font-black text-indigo-400 font-mono">
                    {percentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPercentage(val);
                    if (val === 100) setStatus('Under Review');
                    else if (val > 0 && status === 'Not Started') setStatus('In Progress');
                  }}
                  className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 font-medium pt-1">
                  <button type="button" onClick={() => setPercentage(25)} className="hover:text-indigo-400">25%</button>
                  <button type="button" onClick={() => setPercentage(50)} className="hover:text-indigo-400">50%</button>
                  <button type="button" onClick={() => setPercentage(75)} className="hover:text-indigo-400">75%</button>
                  <button type="button" onClick={() => { setPercentage(100); setStatus('Under Review'); }} className="hover:text-emerald-400 font-bold">100%</button>
                </div>
              </div>

              {/* Status and Time Spent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Current Task Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review (Ready for Approval)</option>
                    <option value="Revision Required">Revision Required</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Time Spent on this Update (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    placeholder="e.g. 3.5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Work Completed so far */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Work Completed So Far <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={workCompleted}
                  onChange={(e) => setWorkCompleted(e.target.value)}
                  placeholder="Detail the modules, features, or assets finished in this session..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Work Remaining */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Work Remaining
                </label>
                <textarea
                  rows={2}
                  value={workRemaining}
                  onChange={(e) => setWorkRemaining(e.target.value)}
                  placeholder="What tasks or tests are pending to reach 100%..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Blockers & Next Steps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Blockers or Difficulties (If any)
                  </label>
                  <input
                    type="text"
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    placeholder="e.g. Awaiting client API keys or design asset"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Next Planned Activity
                  </label>
                  <input
                    type="text"
                    value={nextActivity}
                    onChange={(e) => setNextActivity(e.target.value)}
                    placeholder="e.g. Conduct responsive testing on iPhone viewport"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-800/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Send size={14} />
                  {isSubmitting ? 'Submitting...' : 'Save & Publish Progress'}
                </button>
              </div>
            </form>
          ) : (
            /* Historical Timeline View */
            <div className="space-y-4">
              {previousLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No historical progress updates logged yet for this task.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {previousLogs.map((log) => (
                    <div key={log.id} className="relative group">
                      <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-900"></div>
                      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{log.employeeName}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(log.status)}`}>
                              {log.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock size={12} />
                            {new Date(log.timestamp).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm pt-1">
                          <span className="font-mono font-bold text-indigo-400">
                            Progress: {log.completionPercentage}%
                          </span>
                          {log.timeSpentHours > 0 && (
                            <span className="text-slate-400">
                              • Logged: {log.timeSpentHours} hrs
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50">
                          <p className="font-semibold text-slate-200 text-xs mb-1">Completed:</p>
                          {log.workCompleted}
                        </div>

                        {log.workRemaining && (
                          <div className="text-sm text-slate-400">
                            <span className="font-semibold text-slate-300">Remaining: </span>
                            {log.workRemaining}
                          </div>
                        )}

                        {log.blockers && (
                          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300">
                            <span className="font-bold">Blocker: </span> {log.blockers}
                          </div>
                        )}

                        {log.nextPlannedActivity && (
                          <div className="text-sm text-slate-400">
                            <span className="font-semibold text-slate-300">Next Action: </span>
                            {log.nextPlannedActivity}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
