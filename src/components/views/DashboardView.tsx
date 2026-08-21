import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { ActiveTab } from '../Navbar';
import { SubjectIcon } from '../SubjectIcon';
import {
  Timer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Flame,
  ArrowRight,
  Plus,
  Play,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickAdd: (tab?: 'task' | 'subject' | 'block' | 'flashcard') => void;
  onLaunchTimerForSubject: (subjectId: string, topic?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenQuickAdd,
  onLaunchTimerForSubject
}) => {
  const { state, toggleTask, toggleBlockCompleted, getTodayStudyMinutes } = useStudy();

  const todayMinutes = getTodayStudyMinutes();
  const targetMinutes = state.settings.dailyGoalHours * 60;
  const progressPercent = Math.min(100, Math.round((todayMinutes / targetMinutes) * 100));

  const currentDayOfWeek = new Date().getDay(); // 0-6
  const todaysBlocks = state.scheduleBlocks
    .filter(b => b.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const pendingTasks = state.tasks.filter(t => !t.completed);
  const urgentTasks = pendingTasks
    .filter(t => t.priority === 'high' || t.dueDate === new Date().toISOString().split('T')[0])
    .slice(0, 4);

  // Calculate upcoming exams
  const upcomingExams = state.subjects
    .filter(s => s.examDate)
    .map(s => {
      const examTime = new Date(s.examDate!).getTime();
      const nowTime = new Date().setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((examTime - nowTime) / (1000 * 60 * 60 * 24));
      
      const totalTopics = s.topics.length;
      const completedTopics = s.topics.filter(t => t.completed).length;
      const syllabusPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      return {
        subject: s,
        diffDays,
        syllabusPercent,
        totalTopics,
        completedTopics
      };
    })
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Hero Summary & Daily Rhythm Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Welcome & Focus Launcher Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {state.streak.current} day continuous streak 🔥
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {getGreeting()}, scholar. Ready to conquer your syllabus?
              </h1>
              <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                You have {pendingTasks.length} pending academic tasks and {todaysBlocks.length} scheduled study blocks for today.
              </p>
            </div>

            {/* Quick Action CTA Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-6 mt-4 border-t border-slate-800/80">
              <motion.button
                id="hero-start-timer-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('timer')}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/30 transition"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Focus Session</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('flashcards')}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 rounded-2xl font-semibold text-sm transition"
              >
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Daily Flashcard Drill</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('ai')}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-indigo-300 rounded-2xl font-semibold text-sm transition"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Study Plan</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Daily Goal & Streak Visual Ring */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Study Goal</span>
            <span className="text-xs font-mono text-indigo-400 font-semibold">{todayMinutes}m / {targetMinutes}m</span>
          </div>

          {/* Circular Progress Gauge */}
          <div className="flex items-center justify-center my-4 relative">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="56"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800"
                fill="transparent"
              />
              <motion.circle
                cx="72"
                cy="72"
                r="56"
                stroke="currentColor"
                strokeWidth="10"
                className="text-indigo-500"
                fill="transparent"
                strokeDasharray={351.86}
                strokeDashoffset={351.86 - (351.86 * progressPercent) / 100}
                strokeLinecap="round"
                initial={{ strokeDashoffset: 351.86 }}
                animate={{ strokeDashoffset: 351.86 - (351.86 * progressPercent) / 100 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white font-mono">{progressPercent}%</span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Completed</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{state.streak.current} Days Streak</span>
            </div>
            <div className="text-slate-400 font-medium">
              Record: <span className="text-slate-200 font-bold">{state.streak.longest}d</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* 2. Urgent Exam Countdowns & Milestones */}
      {upcomingExams.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Target Exams & Final Deadlines
            </h2>
            <button
              onClick={() => setActiveTab('subjects')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingExams.map(exam => {
              const sub = exam.subject;
              const isUrgent = exam.diffDays <= 7;

              return (
                <motion.div
                  key={sub.id}
                  whileHover={{ y: -3 }}
                  className="relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${sub.color} text-white shadow`}>
                        <SubjectIcon name={sub.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight truncate max-w-[160px]">{sub.name}</h3>
                        <p className="text-xs text-slate-400 font-mono">{sub.code}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                        exam.diffDays <= 3
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : isUrgent
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {exam.diffDays <= 0 ? 'Today!' : `${exam.diffDays}d left`}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-300 mb-2 truncate">
                    {sub.examName || 'Final Examination'}
                  </p>

                  {/* Syllabus Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span>Syllabus Covered</span>
                      <span className="font-mono text-slate-200">{exam.completedTopics}/{exam.totalTopics} topics ({exam.syllabusPercent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${exam.syllabusPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Fast Action */}
                  <button
                    onClick={() => onLaunchTimerForSubject(sub.id)}
                    className="mt-3 w-full py-1.5 bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition flex items-center justify-center gap-1.5"
                  >
                    <Timer className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Study for this Exam</span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Grid: Today's Schedule & High Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Timetable / Schedule */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Today's Schedule Blocks</h2>
              </div>
              <button
                onClick={() => setActiveTab('timetable')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaysBlocks.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-400">No scheduled study blocks for today</p>
                <button
                  onClick={() => onOpenQuickAdd('block')}
                  className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-400 rounded-xl transition inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Study Block
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysBlocks.map(b => {
                  const subject = state.subjects.find(s => s.id === b.subjectId);
                  return (
                    <motion.div
                      key={b.id}
                      whileHover={{ scale: 1.01 }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                        b.completed
                          ? 'bg-slate-950/60 border-slate-800/60 opacity-60'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleBlockCompleted(b.id)}
                          className="text-slate-500 hover:text-indigo-400 transition"
                        >
                          <CheckCircle2
                            className={`w-5 h-5 ${
                              b.completed ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-600'
                            }`}
                          />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-indigo-300">
                              {b.startTime} - {b.endTime}
                            </span>
                            {subject && (
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                                {subject.code}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm font-bold text-white ${b.completed ? 'line-through text-slate-500' : ''}`}>
                            {b.title}
                          </p>
                          {b.topic && <p className="text-xs text-slate-400">{b.topic}</p>}
                        </div>
                      </div>

                      <button
                        onClick={() => onLaunchTimerForSubject(b.subjectId, b.topic || b.title)}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                        title="Start timer for this block"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onOpenQuickAdd('block')}
            className="mt-4 w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Block for Today</span>
          </button>
        </div>

        {/* Priority Tasks & Assignments */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Priority Deadlines & Tasks</h2>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>All Tasks ({pendingTasks.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentTasks.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-400">All high priority tasks cleared!</p>
                <button
                  onClick={() => onOpenQuickAdd('task')}
                  className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-400 rounded-xl transition inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Task
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentTasks.map(t => {
                  const subject = state.subjects.find(s => s.id === t.subjectId);
                  return (
                    <motion.div
                      key={t.id}
                      whileHover={{ scale: 1.01 }}
                      className={`flex items-start justify-between p-3.5 rounded-2xl border transition ${
                        t.completed
                          ? 'bg-slate-950/60 border-slate-800/60 opacity-60'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTask(t.id)}
                          className="mt-0.5 text-slate-500 hover:text-indigo-400 transition"
                        >
                          <CheckCircle2
                            className={`w-5 h-5 ${
                              t.completed ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-600'
                            }`}
                          />
                        </button>
                        <div>
                          <p className={`text-sm font-bold text-white ${t.completed ? 'line-through text-slate-500' : ''}`}>
                            {t.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {subject && (
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                                {subject.code}
                              </span>
                            )}
                            <span className="text-[11px] text-rose-400 font-medium font-mono">
                              Due: {t.dueDate}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ~{t.estimatedMinutes}m
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          t.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onOpenQuickAdd('task')}
            className="mt-4 w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Create New Assignment Task</span>
          </button>
        </div>

      </div>

    </div>
  );
};
