import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { SubjectIcon } from '../SubjectIcon';
import {
  BarChart3,
  Flame,
  Clock,
  Award,
  Zap,
  Star,
  CheckCircle2,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';

export const AnalyticsView: React.FC = () => {
  const { state, resetToDefaults } = useStudy();

  const totalMinutesStudied = state.sessions.reduce((a, s) => a + s.durationMinutes, 0);
  const totalHoursStudied = (totalMinutesStudied / 60).toFixed(1);

  // Group study minutes by day of week for the current week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals: number[] = [0, 0, 0, 0, 0, 0, 0];

  state.sessions.forEach(sess => {
    const d = new Date(sess.date);
    const dayIdx = d.getDay();
    dayTotals[dayIdx] += sess.durationMinutes;
  });

  const maxDayMinutes = Math.max(...dayTotals, 60);

  // Subject distribution
  const subjectTotals: Record<string, number> = {};
  state.sessions.forEach(sess => {
    subjectTotals[sess.subjectId] = (subjectTotals[sess.subjectId] || 0) + sess.durationMinutes;
  });

  const subjectBreakdown = state.subjects.map(s => {
    const minutes = subjectTotals[s.id] || 0;
    const hours = (minutes / 60).toFixed(1);
    const percent = totalMinutesStudied > 0 ? Math.round((minutes / totalMinutesStudied) * 100) : 0;
    return {
      subject: s,
      minutes,
      hours,
      percent
    };
  }).sort((a, b) => b.minutes - a.minutes);

  // 28-day habit streak grid
  const daysGrid = Array.from({ length: 28 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - i));
    const dateStr = date.toISOString().split('T')[0];
    const minutesOnDate = state.sessions
      .filter(s => s.date.startsWith(dateStr))
      .reduce((a, c) => a + c.durationMinutes, 0);
    return {
      date: dateStr,
      dayNumber: date.getDate(),
      minutes: minutesOnDate,
      intensity:
        minutesOnDate === 0
          ? 0
          : minutesOnDate < 30
          ? 1
          : minutesOnDate < 60
          ? 2
          : minutesOnDate < 120
          ? 3
          : 4
    };
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Study Analytics & Habit Heatmap
          </h1>
          <p className="text-xs text-slate-400">
            Biometric retention velocity, subject time distribution, and session history logs.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset sample study data back to default demo state?')) {
              resetToDefaults();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* KPI Stats Top Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Focus Time</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">{totalHoursStudied}<span className="text-sm text-slate-400 ml-1">hrs</span></p>
          <span className="text-[11px] text-indigo-300 font-medium mt-1 block">Across {state.sessions.length} logged sessions</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400 font-mono">{state.streak.current}<span className="text-sm text-slate-400 ml-1">days</span></p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">All-time record: {state.streak.longest} days</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Avg Focus Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono">4.8<span className="text-sm text-slate-400 ml-1">/ 5.0</span></p>
          <span className="text-[11px] text-emerald-300 font-medium mt-1 block">Deep Flow State index</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Mastery Retained</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-purple-400 font-mono">
            {state.flashcards.filter(f => f.boxLevel >= 4).length}<span className="text-sm text-slate-400 ml-1">cards</span>
          </p>
          <span className="text-[11px] text-purple-300 font-medium mt-1 block">Level 4 & 5 Leitner consolidation</span>
        </motion.div>
      </div>

      {/* Grid: Weekly Bar Chart & Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Focus Hours Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Weekly Study Time Distribution
              </span>
              <span className="text-xs font-mono text-indigo-400 font-bold">
                {totalMinutesStudied} mins total
              </span>
            </div>

            {/* SVG / Flex Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => {
                // index map: Mon=1, Tue=2, ..., Sun=0
                const mappedIdx = (idx + 1) % 7;
                const minutes = dayTotals[mappedIdx];
                const heightPercent = Math.max(8, Math.round((minutes / maxDayMinutes) * 100));

                return (
                  <div key={dayName} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                      {minutes}m
                    </div>
                    <div className="w-full bg-slate-950 rounded-xl h-36 flex items-end p-1">
                      <motion.div
                        className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-lg shadow-md"
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">{dayName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>⚡ Peak Study Day: <strong className="text-white">Tuesday & Friday</strong></span>
            <span>Recommended: <strong className="text-indigo-400">{state.settings.dailyGoalHours}h/day</strong></span>
          </div>
        </div>

        {/* Subject Breakdown Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Course Study Hours Share
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {state.subjects.length} Enrolled
              </span>
            </div>

            <div className="space-y-3.5">
              {subjectBreakdown.map(item => (
                <div key={item.subject.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg bg-gradient-to-r ${item.subject.color} text-white`}>
                        <SubjectIcon name={item.subject.icon} className="w-3 h-3" />
                      </div>
                      <span className="text-white truncate max-w-[180px]">{item.subject.name}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-slate-300 font-bold">{item.hours} hrs</span>
                      <span className="text-slate-500 text-[11px] ml-1.5">({item.percent}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.subject.accentColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            Tip: Balance your study distribution across upcoming exams to prevent cramming.
          </div>
        </div>

      </div>

      {/* 28-Day Habit Heatmap */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              28-Day Continuous Study Heatmap
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span>Less</span>
            <span className="w-3 h-3 rounded-sm bg-slate-800" />
            <span className="w-3 h-3 rounded-sm bg-indigo-950" />
            <span className="w-3 h-3 rounded-sm bg-indigo-700" />
            <span className="w-3 h-3 rounded-sm bg-indigo-500" />
            <span className="w-3 h-3 rounded-sm bg-cyan-400" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
          {daysGrid.map((day, idx) => {
            const colors = [
              'bg-slate-950 border-slate-800',
              'bg-indigo-950 border-indigo-900 text-indigo-300',
              'bg-indigo-800 border-indigo-700 text-indigo-100',
              'bg-indigo-600 border-indigo-500 text-white',
              'bg-cyan-400 border-cyan-300 text-slate-950 font-bold'
            ];

            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.15, y: -2 }}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition cursor-pointer shadow-sm ${colors[day.intensity]}`}
                title={`${day.date}: ${day.minutes} minutes studied`}
              >
                <span className="text-[10px] font-mono opacity-80">{day.dayNumber}</span>
                <span className="text-[11px] font-mono mt-0.5">{day.minutes > 0 ? `${day.minutes}m` : '-'}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Session History Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Recent Logged Focus Sessions
          </span>
          <span className="text-xs text-slate-400 font-mono">{state.sessions.length} Recorded</span>
        </div>

        {state.sessions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No focus sessions recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 font-medium">Subject & Topic</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Duration</th>
                  <th className="pb-3 font-medium">Focus Rating</th>
                  <th className="pb-3 font-medium">Date & Reflection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {state.sessions.slice(0, 8).map(sess => (
                  <tr key={sess.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 pr-3 font-bold text-white">
                      {sess.subjectName || 'General'}
                      {sess.topicTitle && (
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {sess.topicTitle}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium font-mono text-[10px]">
                        {sess.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 pr-3 font-mono font-bold text-indigo-300">
                      {sess.durationMinutes} min
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: sess.focusRating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-slate-400">
                      <span className="font-mono text-[11px] text-slate-300">
                        {new Date(sess.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {sess.notes && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{sess.notes}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
