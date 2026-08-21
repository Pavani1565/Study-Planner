import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { SubjectIcon } from '../SubjectIcon';
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Play,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';

interface TimetableScheduleViewProps {
  onOpenQuickAdd: (tab?: 'task' | 'subject' | 'block' | 'flashcard') => void;
  onLaunchTimerForSubject: (subjectId: string, topic?: string) => void;
}

const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
  { id: 0, name: 'Sunday', short: 'Sun' },
];

export const TimetableScheduleView: React.FC<TimetableScheduleViewProps> = ({
  onOpenQuickAdd,
  onLaunchTimerForSubject
}) => {
  const { state, toggleBlockCompleted, deleteScheduleBlock } = useStudy();
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');

  const currentDayOfWeek = new Date().getDay();

  const filteredBlocks = state.scheduleBlocks.filter(b => {
    const dayMatch = selectedDay === 'all' || b.dayOfWeek === selectedDay;
    const subMatch = filterSubjectId === 'all' || b.subjectId === filterSubjectId;
    return dayMatch && subMatch;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            Weekly Timetable & Schedule Blocks
          </h1>
          <p className="text-xs text-slate-400">
            Structure your week into high-leverage study blocks and exam preparation intervals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenQuickAdd('block')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Block</span>
          </motion.button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Day Selector Chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedDay === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Week
          </button>
          {DAYS_OF_WEEK.map(d => {
            const isToday = d.id === currentDayOfWeek;
            const active = selectedDay === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow'
                    : isToday
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{d.name}</span>
                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
              </button>
            );
          })}
        </div>

        {/* Filter by Subject */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filterSubjectId}
            onChange={e => setFilterSubjectId(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Subjects</option>
            {state.subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid or Day View */}
      {selectedDay === 'all' ? (
        /* Full 7-Day Columns */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
          {DAYS_OF_WEEK.map(dayObj => {
            const dayBlocks = filteredBlocks
              .filter(b => b.dayOfWeek === dayObj.id)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            const isToday = dayObj.id === currentDayOfWeek;

            return (
              <div
                key={dayObj.id}
                className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col justify-between min-h-[320px] transition ${
                  isToday
                    ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/20'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {dayObj.name}
                        {isToday && (
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500 text-white">
                            Today
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {dayBlocks.length} session{dayBlocks.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Day Blocks List */}
                  {dayBlocks.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-6 h-6 text-slate-700 mx-auto mb-1 opacity-50" />
                      <p className="text-[11px] text-slate-500 font-medium">Free day</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {dayBlocks.map(block => {
                        const subject = state.subjects.find(s => s.id === block.subjectId);
                        return (
                          <motion.div
                            key={block.id}
                            whileHover={{ y: -2 }}
                            className={`p-3 rounded-xl border relative group transition ${
                              block.completed
                                ? 'bg-slate-950/60 border-slate-800/60 opacity-60'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-mono text-indigo-400 font-bold mb-1">
                              <span>{block.startTime} - {block.endTime}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => toggleBlockCompleted(block.id)}
                                  className="text-slate-400 hover:text-emerald-400"
                                  title="Mark done"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteScheduleBlock(block.id)}
                                  className="text-slate-400 hover:text-rose-400"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              {subject && (
                                <div className={`p-1 rounded-lg bg-gradient-to-r ${subject.color} text-white shrink-0 mt-0.5`}>
                                  <SubjectIcon name={subject.icon} className="w-3 h-3" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h4 className={`text-xs font-bold text-white truncate ${block.completed ? 'line-through text-slate-500' : ''}`}>
                                  {block.title}
                                </h4>
                                {block.topic && (
                                  <p className="text-[11px] text-slate-400 truncate">{block.topic}</p>
                                )}
                              </div>
                            </div>

                            {/* Quick Start Timer button */}
                            <button
                              onClick={() => onLaunchTimerForSubject(block.subjectId, block.topic || block.title)}
                              className="mt-2 w-full py-1 bg-slate-900 hover:bg-indigo-600 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white transition flex items-center justify-center gap-1"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>Focus Timer</span>
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onOpenQuickAdd('block')}
                  className="mt-3 w-full py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3 text-indigo-400" />
                  <span>Add Block</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Single Selected Day Detailed View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">
                {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name} Schedule
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {filteredBlocks.length} planned session{filteredBlocks.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => onOpenQuickAdd('block')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Block
            </button>
          </div>

          {filteredBlocks.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-400">No study blocks on this day</p>
              <button
                onClick={() => onOpenQuickAdd('block')}
                className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-400 rounded-xl transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Schedule First Block
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBlocks.map(block => {
                const subject = state.subjects.find(s => s.id === block.subjectId);
                return (
                  <motion.div
                    key={block.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-2xl border transition ${
                      block.completed
                        ? 'bg-slate-950/60 border-slate-800 opacity-60'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        {block.startTime} - {block.endTime}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleBlockCompleted(block.id)}
                          className="text-slate-400 hover:text-emerald-400 transition"
                        >
                          <CheckCircle2
                            className={`w-5 h-5 ${
                              block.completed ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-600'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => deleteScheduleBlock(block.id)}
                          className="text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {subject && (
                        <div className={`p-2 rounded-xl bg-gradient-to-r ${subject.color} text-white shadow`}>
                          <SubjectIcon name={subject.icon} className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <h4 className={`text-sm font-bold text-white ${block.completed ? 'line-through text-slate-500' : ''}`}>
                          {block.title}
                        </h4>
                        {block.topic && <p className="text-xs text-slate-400">{block.topic}</p>}
                        {subject && (
                          <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                            {subject.code} • {subject.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onLaunchTimerForSubject(block.subjectId, block.topic || block.title)}
                      className="mt-4 w-full py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Pomodoro for this Block</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
