import React, { useState } from 'react';
import { X, CheckSquare, Calendar, BookOpen, Layers, Plus } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { motion, AnimatePresence } from 'motion/react';
import { AVAILABLE_ICONS, SubjectIcon } from './SubjectIcon';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'task' | 'subject' | 'block' | 'flashcard';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, initialTab = 'task' }) => {
  const { state, addTask, addSubject, addScheduleBlock, addFlashcard } = useStudy();
  const [activeTab, setActiveTab] = useState<'task' | 'subject' | 'block' | 'flashcard'>(initialTab);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState(state.subjects[0]?.id || '');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDueTime, setTaskDueTime] = useState('18:00');
  const [taskMinutes, setTaskMinutes] = useState(45);
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskNotes, setTaskNotes] = useState('');

  // Subject form state
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subGoalHours, setSubGoalHours] = useState(6);
  const [subExamName, setSubExamName] = useState('');
  const [subExamDate, setSubExamDate] = useState('');
  const [subIcon, setSubIcon] = useState('BookOpen');
  const [subColorIdx, setSubColorIdx] = useState(0);

  // Block form state
  const [blockTitle, setBlockTitle] = useState('');
  const [blockSubjectId, setBlockSubjectId] = useState(state.subjects[0]?.id || '');
  const [blockDay, setBlockDay] = useState(1);
  const [blockStart, setBlockStart] = useState('09:00');
  const [blockEnd, setBlockEnd] = useState('10:30');
  const [blockTopic, setBlockTopic] = useState('');

  // Flashcard form state
  const [cardSubjectId, setCardSubjectId] = useState(state.subjects[0]?.id || '');
  const [cardTopic, setCardTopic] = useState('');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [cardHint, setCardHint] = useState('');

  const colorPalettes = [
    { name: 'Indigo Dream', gradient: 'from-indigo-600 to-violet-600', accent: '#6366f1' },
    { name: 'Cyan Sky', gradient: 'from-blue-600 to-cyan-600', accent: '#0ea5e9' },
    { name: 'Emerald Forest', gradient: 'from-emerald-600 to-teal-600', accent: '#10b981' },
    { name: 'Amber Sunset', gradient: 'from-amber-500 to-orange-600', accent: '#f59e0b' },
    { name: 'Rose Blossom', gradient: 'from-rose-600 to-pink-600', accent: '#f43f5e' },
    { name: 'Fuchsia Neon', gradient: 'from-fuchsia-600 to-purple-600', accent: '#d946ef' },
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      subjectId: taskSubjectId || state.subjects[0]?.id || 'sub-gen',
      dueDate: taskDueDate,
      dueTime: taskDueTime,
      estimatedMinutes: Number(taskMinutes),
      priority: taskPriority,
      completed: false,
      notes: taskNotes.trim() || undefined
    });
    setTaskTitle('');
    setTaskNotes('');
    onClose();
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;
    const selectedPalette = colorPalettes[subColorIdx];
    addSubject({
      name: subName.trim(),
      code: subCode.trim() || 'GEN 101',
      color: selectedPalette.gradient,
      accentColor: selectedPalette.accent,
      icon: subIcon,
      goalHoursPerWeek: Number(subGoalHours),
      examName: subExamName.trim() || undefined,
      examDate: subExamDate || undefined,
      topics: [
        { id: `top-${Date.now()}-1`, title: 'Course Fundamentals & Overview', completed: false, estimatedHours: 3, difficulty: 'easy' }
      ]
    });
    setSubName('');
    setSubCode('');
    onClose();
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle.trim()) return;
    addScheduleBlock({
      title: blockTitle.trim(),
      subjectId: blockSubjectId || state.subjects[0]?.id || 'sub-1',
      dayOfWeek: Number(blockDay),
      startTime: blockStart,
      endTime: blockEnd,
      topic: blockTopic.trim() || undefined,
      completed: false
    });
    setBlockTitle('');
    setBlockTopic('');
    onClose();
  };

  const handleCreateFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) return;
    addFlashcard({
      subjectId: cardSubjectId || state.subjects[0]?.id || 'sub-1',
      topic: cardTopic.trim() || 'Key Concept',
      front: cardFront.trim(),
      back: cardBack.trim(),
      hint: cardHint.trim() || undefined
    });
    setCardFront('');
    setCardBack('');
    setCardHint('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Quick Add
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/80 rounded-xl my-4 border border-slate-800">
              {[
                { key: 'task', label: 'Task', icon: CheckSquare },
                { key: 'block', label: 'Schedule', icon: Calendar },
                { key: 'subject', label: 'Subject', icon: BookOpen },
                { key: 'flashcard', label: 'Card', icon: Layers },
              ].map(t => {
                const Icon = t.icon;
                const active = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key as any)}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                      active
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Task Form */}
            {activeTab === 'task' && (
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Calculus Problem Set 3"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                    <select
                      value={taskSubjectId}
                      onChange={e => setTaskSubjectId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      {state.subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={e => setTaskPriority(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority 🚨</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Est. Minutes</label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={taskMinutes}
                      onChange={e => setTaskMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={e => setTaskDueDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Instructions (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Chapter references, page numbers, links..."
                    value={taskNotes}
                    onChange={e => setTaskNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-600/30"
                >
                  Create Task
                </button>
              </form>
            )}

            {/* Subject Form */}
            {activeTab === 'subject' && (
              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Course / Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Molecular Biology & Genetics"
                    value={subName}
                    onChange={e => setSubName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Course Code</label>
                    <input
                      type="text"
                      placeholder="e.g. BIO 302"
                      value={subCode}
                      onChange={e => setSubCode(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white uppercase focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Weekly Target (Hrs)</label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={subGoalHours}
                      onChange={e => setSubGoalHours(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Exam / Goal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Final Board Exam"
                      value={subExamName}
                      onChange={e => setSubExamName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Exam Date</label>
                    <input
                      type="date"
                      value={subExamDate}
                      onChange={e => setSubExamDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Color Palette Choice */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Theme Palette</label>
                  <div className="grid grid-cols-6 gap-2">
                    {colorPalettes.map((pal, idx) => (
                      <button
                        key={pal.name}
                        type="button"
                        onClick={() => setSubColorIdx(idx)}
                        className={`h-8 rounded-xl bg-gradient-to-r ${pal.gradient} transition ring-2 ${
                          subColorIdx === idx ? 'ring-white ring-offset-2 ring-offset-slate-900 scale-105' : 'ring-transparent opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject Icon</label>
                  <div className="grid grid-cols-8 gap-2">
                    {AVAILABLE_ICONS.slice(0, 16).map(iconName => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setSubIcon(iconName)}
                        className={`p-2 rounded-xl flex items-center justify-center border transition ${
                          subIcon === iconName
                            ? 'bg-indigo-600/30 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <SubjectIcon name={iconName} className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-600/30"
                >
                  Create Subject
                </button>
              </form>
            )}

            {/* Schedule Block Form */}
            {activeTab === 'block' && (
              <form onSubmit={handleCreateBlock} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Study Block Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Physics Formula Memorization"
                    value={blockTitle}
                    onChange={e => setBlockTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                    <select
                      value={blockSubjectId}
                      onChange={e => setBlockSubjectId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      {state.subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Day of Week</label>
                    <select
                      value={blockDay}
                      onChange={e => setBlockDay(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                      <option value={0}>Sunday</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={blockStart}
                      onChange={e => setBlockStart(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">End Time</label>
                    <input
                      type="time"
                      value={blockEnd}
                      onChange={e => setBlockEnd(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Topic / Objective (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter 4 Practice Drills"
                    value={blockTopic}
                    onChange={e => setBlockTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-600/30"
                >
                  Add to Timetable
                </button>
              </form>
            )}

            {/* Flashcard Form */}
            {activeTab === 'flashcard' && (
              <form onSubmit={handleCreateFlashcard} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                    <select
                      value={cardSubjectId}
                      onChange={e => setCardSubjectId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      {state.subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Topic Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Cell Division"
                      value={cardTopic}
                      onChange={e => setCardTopic(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Front (Question / Prompt) *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. What is the rate-limiting enzyme of glycolysis?"
                    value={cardFront}
                    onChange={e => setCardFront(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Back (Answer / Explanation) *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Phosphofructokinase-1 (PFK-1), which phosphorylates fructose-6-phosphate to fructose-1,6-bisphosphate."
                    value={cardBack}
                    onChange={e => setCardBack(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hint (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Starts with PFK..."
                    value={cardHint}
                    onChange={e => setCardHint(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-600/30"
                >
                  Create Flashcard
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
