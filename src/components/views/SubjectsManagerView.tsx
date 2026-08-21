import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { SubjectIcon } from '../SubjectIcon';
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SubjectsManagerViewProps {
  onOpenQuickAdd: (tab?: 'task' | 'subject' | 'block' | 'flashcard') => void;
  onLaunchTimerForSubject: (subjectId: string, topic?: string) => void;
}

export const SubjectsManagerView: React.FC<SubjectsManagerViewProps> = ({
  onOpenQuickAdd,
  onLaunchTimerForSubject
}) => {
  const { state, toggleTopicCompletion, addTopic, deleteTopic, deleteSubject } = useStudy();
  
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(
    state.subjects[0]?.id || null
  );

  // New topic inline state
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicHours, setNewTopicHours] = useState(3);
  const [newTopicDiff, setNewTopicDiff] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [addingToSubjectId, setAddingToSubjectId] = useState<string | null>(null);

  const handleAddTopicSubmit = (subjectId: string) => {
    if (!newTopicTitle.trim()) return;
    addTopic(subjectId, {
      title: newTopicTitle.trim(),
      completed: false,
      estimatedHours: Number(newTopicHours),
      difficulty: newTopicDiff
    });
    setNewTopicTitle('');
    setAddingToSubjectId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Courses & Syllabus Progress Tracker
          </h1>
          <p className="text-xs text-slate-400">
            Track syllabus chapter completion, upcoming exam countdowns, and topic mastery.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOpenQuickAdd('subject')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </motion.button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {state.subjects.map(subject => {
          const isExpanded = expandedSubjectId === subject.id;
          const totalTopics = subject.topics.length;
          const completedTopics = subject.topics.filter(t => t.completed).length;
          const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

          // Exam countdown
          let daysToExam: number | null = null;
          if (subject.examDate) {
            const diff = Math.ceil(
              (new Date(subject.examDate).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
            );
            daysToExam = diff;
          }

          return (
            <motion.div
              key={subject.id}
              layout
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden transition hover:border-slate-700"
            >
              {/* Header Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Course Name & Details */}
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${subject.color} text-white shadow-lg shrink-0 mt-0.5`}>
                    <SubjectIcon name={subject.icon} className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                        {subject.code}
                      </span>
                      {subject.instructor && (
                        <span className="text-xs text-slate-400">
                          • {subject.instructor}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-white leading-snug">{subject.name}</h2>
                    {subject.description && (
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl">{subject.description}</p>
                    )}
                  </div>
                </div>

                {/* Right Metrics & Expand CTA */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  {daysToExam !== null && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        {subject.examName || 'Exam'}
                      </span>
                      <span className={`text-xs font-mono font-bold ${daysToExam <= 5 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {daysToExam <= 0 ? 'Today!' : `${daysToExam} days left`}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => onLaunchTimerForSubject(subject.id)}
                    className="p-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition font-semibold text-xs flex items-center gap-1.5"
                    title="Study this subject"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Focus</span>
                  </button>

                  <button
                    onClick={() => setExpandedSubjectId(isExpanded ? null : subject.id)}
                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Progress Track */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-400">Syllabus Completion</span>
                  <span className="font-mono text-indigo-300">
                    {completedTopics}/{totalTopics} Topics ({percent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Expanded Topic Breakdown Checklist */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-6 pt-4 border-t border-slate-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        Syllabus Topics & Key Concepts
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAddingToSubjectId(addingToSubjectId === subject.id ? null : subject.id)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Topic</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm(`Delete subject "${subject.name}" and all related tasks?`)) {
                              deleteSubject(subject.id);
                            }
                          }}
                          className="text-xs text-rose-400 hover:text-rose-300 font-semibold ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Topic Creator */}
                    {addingToSubjectId === subject.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-slate-950 border border-indigo-500/30 rounded-2xl flex flex-wrap items-center gap-2"
                      >
                        <input
                          type="text"
                          required
                          placeholder="e.g. Chapter 6: Thermodynamics"
                          value={newTopicTitle}
                          onChange={e => setNewTopicTitle(e.target.value)}
                          className="flex-1 min-w-[200px] px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <select
                          value={newTopicDiff}
                          onChange={e => setNewTopicDiff(e.target.value as any)}
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          placeholder="Est. Hrs"
                          value={newTopicHours}
                          onChange={e => setNewTopicHours(Number(e.target.value))}
                          className="w-16 px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTopicSubmit(subject.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow"
                        >
                          Add
                        </button>
                      </motion.div>
                    )}

                    {/* Topics Checklist */}
                    <div className="space-y-2">
                      {subject.topics.map(topic => (
                        <div
                          key={topic.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                            topic.completed
                              ? 'bg-slate-950/60 border-slate-800/60 opacity-65'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleTopicCompletion(subject.id, topic.id)}
                              className="text-slate-500 hover:text-indigo-400 transition"
                            >
                              <CheckCircle2
                                className={`w-5 h-5 ${
                                  topic.completed ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-600'
                                }`}
                              />
                            </button>
                            <div>
                              <span className={`text-xs font-bold text-white ${topic.completed ? 'line-through text-slate-500' : ''}`}>
                                {topic.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {topic.difficulty && (
                                  <span
                                    className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                      topic.difficulty === 'hard'
                                        ? 'text-rose-400 bg-rose-500/10'
                                        : topic.difficulty === 'medium'
                                        ? 'text-amber-400 bg-amber-500/10'
                                        : 'text-emerald-400 bg-emerald-500/10'
                                    }`}
                                  >
                                    {topic.difficulty}
                                  </span>
                                )}
                                {topic.estimatedHours && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    ~{topic.estimatedHours} hrs
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onLaunchTimerForSubject(subject.id, topic.title)}
                              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white transition text-[11px] font-bold flex items-center gap-1"
                              title="Start timer for topic"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Drill</span>
                            </button>
                            <button
                              onClick={() => deleteTopic(subject.id, topic.id)}
                              className="p-1 text-slate-600 hover:text-rose-400 transition"
                              title="Delete topic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
