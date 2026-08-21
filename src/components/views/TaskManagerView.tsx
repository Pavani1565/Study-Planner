import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { SubjectIcon } from '../SubjectIcon';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskManagerViewProps {
  onOpenQuickAdd: (tab?: 'task' | 'subject' | 'block' | 'flashcard') => void;
  onLaunchTimerForSubject: (subjectId: string, topic?: string) => void;
}

type TaskFilter = 'all' | 'today' | 'urgent' | 'pending' | 'completed';

export const TaskManagerView: React.FC<TaskManagerViewProps> = ({
  onOpenQuickAdd,
  onLaunchTimerForSubject
}) => {
  const { state, toggleTask, deleteTask } = useStudy();
  const [filter, setFilter] = useState<TaskFilter>('pending');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = state.tasks.filter(task => {
    // Subject filter
    if (subjectFilter !== 'all' && task.subjectId !== subjectFilter) return false;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchNotes = task.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }

    // Status filter
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    if (filter === 'today') return task.dueDate === todayStr;
    if (filter === 'urgent') return task.priority === 'high' && !task.completed;
    return true;
  });

  const completedCount = state.tasks.filter(t => t.completed).length;
  const pendingCount = state.tasks.filter(t => !t.completed).length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-400" />
            Study Tasks & Assignment Pipeline
          </h1>
          <p className="text-xs text-slate-400">
            Organize homework, problem sets, past papers, and project milestones.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOpenQuickAdd('task')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment Task</span>
        </motion.button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Total Tasks</span>
          <p className="text-2xl font-black text-white font-mono mt-1">{state.tasks.length}</p>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold uppercase text-amber-400">Pending</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">{pendingCount}</p>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold uppercase text-emerald-400">Completed</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{completedCount}</p>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold uppercase text-indigo-400">Completion Rate</span>
          <p className="text-2xl font-black text-indigo-400 font-mono mt-1">
            {state.tasks.length > 0 ? Math.round((completedCount / state.tasks.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full md:w-auto">
          {[
            { key: 'pending', label: `Pending (${pendingCount})` },
            { key: 'urgent', label: 'Urgent 🚨' },
            { key: 'today', label: 'Due Today' },
            { key: 'completed', label: `Done (${completedCount})` },
            { key: 'all', label: 'All' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filter === t.key
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search & Subject select */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-52">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Courses</option>
            {state.subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center">
          <CheckSquare className="w-12 h-12 text-slate-700 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold text-slate-400">No tasks found matching current filters</p>
          <button
            onClick={() => onOpenQuickAdd('task')}
            className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            Add New Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map(task => {
              const subject = state.subjects.find(s => s.id === task.subjectId);
              const isOverdue = !task.completed && task.dueDate < todayStr;

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                    task.completed
                      ? 'bg-slate-950/50 border-slate-800/60 opacity-60'
                      : isOverdue
                      ? 'bg-slate-900 border-rose-500/40 shadow-sm shadow-rose-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-0.5 text-slate-500 hover:text-indigo-400 transition shrink-0"
                    >
                      <CheckCircle2
                        className={`w-6 h-6 ${
                          task.completed ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-600'
                        }`}
                      />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {subject && (
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                            {subject.code}
                          </span>
                        )}
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            task.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : task.priority === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500 text-white">
                            Overdue
                          </span>
                        )}
                      </div>

                      <h3 className={`text-sm font-bold text-white leading-snug ${task.completed ? 'line-through text-slate-500' : ''}`}>
                        {task.title}
                      </h3>

                      {task.notes && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.notes}</p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Due {task.dueDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          ~{task.estimatedMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!task.completed && (
                      <button
                        onClick={() => onLaunchTimerForSubject(task.subjectId, task.title)}
                        className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        title="Work on this task in focus timer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Work on Task</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};
