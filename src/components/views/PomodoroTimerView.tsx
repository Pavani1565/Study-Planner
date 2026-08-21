import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import { playAlert } from '../../utils/audio';
import { SubjectIcon } from '../SubjectIcon';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  Star,
  Layers,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PomodoroTimerViewProps {
  initialSubjectId?: string;
  initialTopic?: string;
}

type TimerMode = 'focus' | 'short_break' | 'long_break';

export const PomodoroTimerView: React.FC<PomodoroTimerViewProps> = ({
  initialSubjectId,
  initialTopic
}) => {
  const { state, logSession } = useStudy();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || state.subjects[0]?.id || ''
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || '');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Time state
  const getDurationForMode = (m: TimerMode) => {
    if (m === 'focus') return state.settings.pomodoroFocusMinutes * 60;
    if (m === 'short_break') return state.settings.pomodoroShortBreakMinutes * 60;
    return state.settings.pomodoroLongBreakMinutes * 60;
  };

  const [timeLeft, setTimeLeft] = useState<number>(getDurationForMode('focus'));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  // Completion Log Modal
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sessionRating, setSessionRating] = useState<number>(5);
  const [sessionNotes, setSessionNotes] = useState('');
  const [lastFinishedDuration, setLastFinishedDuration] = useState(25);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update time if settings change and timer is not running
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDurationForMode(mode));
    }
  }, [mode, state.settings]);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      const minutesCompleted = Math.round(getDurationForMode('focus') / 60);
      setLastFinishedDuration(minutesCompleted);
      setCompletedSessionsCount(prev => prev + 1);
      setShowRatingModal(true);

      playAlert('complete');

      // Auto switch to break if configured
      if ((completedSessionsCount + 1) % state.settings.longBreakInterval === 0) {
        setMode('long_break');
      } else {
        setMode('short_break');
      }
    } else {
      playAlert('break');
      setMode('focus');
    }
  };

  const toggleTimer = () => {
    if (!isRunning) {
      playAlert('start');
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode));
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDurationForMode(newMode));
  };

  const handleSaveSessionRating = () => {
    const subject = state.subjects.find(s => s.id === selectedSubjectId);
    logSession({
      subjectId: selectedSubjectId,
      subjectName: subject?.name || 'General Study',
      topicTitle: selectedTopic || 'Study Session',
      date: new Date().toISOString(),
      durationMinutes: lastFinishedDuration,
      type: 'pomodoro',
      focusRating: sessionRating,
      notes: sessionNotes.trim() || undefined
    });
    setShowRatingModal(false);
    setSessionNotes('');
  };

  // Calculations for Ring SVG
  const totalSeconds = getDurationForMode(mode);
  const progressFraction = (totalSeconds - timeLeft) / totalSeconds;
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - progressFraction * circumference;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentSubject = state.subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-center items-center' : 'space-y-8 pb-12'}`}>
      
      {/* Zen / Fullscreen Toggle button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            Focus Engine & Pomodoro
          </h1>
          <p className="text-xs text-slate-400">
            Immersive, distraction-free study cycles with biometric interval tracking.
          </p>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={isFullscreen ? "Exit Zen Mode" : "Enter Zen Mode"}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-xl mx-auto w-full">
        
        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-inner mb-6">
          {(
            [
              { key: 'focus', label: 'Deep Focus', duration: `${state.settings.pomodoroFocusMinutes}m` },
              { key: 'short_break', label: 'Short Break', duration: `${state.settings.pomodoroShortBreakMinutes}m` },
              { key: 'long_break', label: 'Long Break', duration: `${state.settings.pomodoroLongBreakMinutes}m` },
            ] as const
          ).map(tab => (
            <button
              key={tab.key}
              onClick={() => switchMode(tab.key)}
              className={`relative py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === tab.key
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === tab.key && (
                <motion.div
                  layoutId="activeTimerModePill"
                  className={`absolute inset-0 rounded-xl shadow-lg ${
                    tab.key === 'focus'
                      ? 'bg-indigo-600 shadow-indigo-600/30'
                      : tab.key === 'short_break'
                      ? 'bg-emerald-600 shadow-emerald-600/30'
                      : 'bg-cyan-600 shadow-cyan-600/30'
                  }`}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 block">{tab.label}</span>
              <span className="relative z-10 text-[10px] opacity-75 font-mono">{tab.duration}</span>
            </button>
          ))}
        </div>

        {/* Target Subject Selector */}
        {!isFullscreen && mode === 'focus' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="w-full sm:w-1/2">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Target Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={e => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedTopic('');
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              >
                {state.subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Specific Topic / Goal
              </label>
              {currentSubject && currentSubject.topics.length > 0 ? (
                <select
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">General Subject Study</option>
                  {currentSubject.topics.map(t => (
                    <option key={t.id} value={t.title}>{t.title} {t.completed ? '✓' : ''}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Chapter 4 Practice Problems"
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Central Timer Display */}
        <div className="relative flex flex-col items-center justify-center p-8 bg-slate-900/80 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-xl">
          
          {/* Animated Glow Halo */}
          <motion.div
            animate={{
              scale: isRunning ? [1, 1.06, 1] : 1,
              opacity: isRunning ? [0.3, 0.6, 0.3] : 0.2
            }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            className={`absolute w-72 h-72 rounded-full blur-3xl pointer-events-none ${
              mode === 'focus' ? 'bg-indigo-600' : mode === 'short_break' ? 'bg-emerald-600' : 'bg-cyan-600'
            }`}
          />

          {/* Radial SVG Circle */}
          <div className="relative w-80 h-80 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Track */}
              <circle
                cx="160"
                cy="160"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                className="text-slate-800"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <motion.circle
                cx="160"
                cy="160"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                className={
                  mode === 'focus'
                    ? 'text-indigo-500'
                    : mode === 'short_break'
                    ? 'text-emerald-400'
                    : 'text-cyan-400'
                }
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                transition={{ duration: 0.5, ease: 'linear' }}
              />
            </svg>

            {/* Inner Details */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              {currentSubject && mode === 'focus' && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 text-xs font-bold text-indigo-300 border border-slate-700/80 mb-2 max-w-[200px] truncate">
                  <SubjectIcon name={currentSubject.icon} className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{currentSubject.code}</span>
                </div>
              )}

              <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tighter drop-shadow-md">
                {formatTime(timeLeft)}
              </span>

              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-2">
                {mode === 'focus' ? 'Session In Progress' : 'Recharge & Hydrate'}
              </p>

              {/* Pomodoro Cycles Dots */}
              <div className="flex items-center gap-1.5 mt-3">
                {[1, 2, 3, 4].map(idx => (
                  <span
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      (completedSessionsCount % 4) >= idx
                        ? 'bg-indigo-500 scale-110 shadow-sm shadow-indigo-500'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-4 mt-6 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shadow-md"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>

            <motion.button
              id="pomodoro-toggle-play-btn"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={toggleTimer}
              className={`flex items-center justify-center w-16 h-16 rounded-3xl text-white shadow-2xl transition ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/40'
              }`}
            >
              {isRunning ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-0.5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTimerComplete()}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shadow-md"
              title="Skip / Complete Session"
            >
              <SkipForward className="w-5 h-5" />
            </motion.button>
          </div>

        </div>

      </div>

      {/* Post-Session Rating & Reflection Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 text-center"
            >
              <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                <Award className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-black text-white">Focus Session Complete! 🎉</h2>
              <p className="text-xs text-slate-300 mt-1">
                You logged <span className="font-bold text-indigo-400">{lastFinishedDuration} minutes</span> of deep study on <span className="font-bold text-white">{currentSubject?.name || 'General Study'}</span>.
              </p>

              {/* Star Rating for focus quality */}
              <div className="my-5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  How was your focus & flow state?
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSessionRating(star)}
                      className="p-1.5 transition transform hover:scale-125"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= sessionRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-left mb-5">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Quick Reflection / What you mastered (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mastered eigenbasis transformations, did 4 problems"
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleSaveSessionRating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                Log & Take Break
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
