import React, { useState } from 'react';
import { StudyProvider } from './context/StudyContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/views/DashboardView';
import { PomodoroTimerView } from './components/views/PomodoroTimerView';
import { TimetableScheduleView } from './components/views/TimetableScheduleView';
import { SubjectsManagerView } from './components/views/SubjectsManagerView';
import { TaskManagerView } from './components/views/TaskManagerView';
import { FlashcardsDeckView } from './components/views/FlashcardsDeckView';
import { AIPlannerView } from './components/views/AIPlannerView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { QuickAddModal } from './components/QuickAddModal';
import { SettingsModal } from './components/SettingsModal';
import { Settings, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function StudyAppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'task' | 'subject' | 'block' | 'flashcard'>('task');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Timer launch state
  const [timerSubjectId, setTimerSubjectId] = useState<string | undefined>(undefined);
  const [timerTopic, setTimerTopic] = useState<string | undefined>(undefined);

  const handleOpenQuickAdd = (tab: 'task' | 'subject' | 'block' | 'flashcard' = 'task') => {
    setQuickAddTab(tab);
    setIsQuickAddOpen(true);
  };

  const handleLaunchTimerForSubject = (subjectId: string, topic?: string) => {
    setTimerSubjectId(subjectId);
    setTimerTopic(topic);
    setActiveTab('timer');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => handleOpenQuickAdd('task')}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' && (
              <DashboardView
                setActiveTab={setActiveTab}
                onOpenQuickAdd={handleOpenQuickAdd}
                onLaunchTimerForSubject={handleLaunchTimerForSubject}
              />
            )}

            {activeTab === 'timer' && (
              <PomodoroTimerView
                initialSubjectId={timerSubjectId}
                initialTopic={timerTopic}
              />
            )}

            {activeTab === 'timetable' && (
              <TimetableScheduleView
                onOpenQuickAdd={handleOpenQuickAdd}
                onLaunchTimerForSubject={handleLaunchTimerForSubject}
              />
            )}

            {activeTab === 'subjects' && (
              <SubjectsManagerView
                onOpenQuickAdd={handleOpenQuickAdd}
                onLaunchTimerForSubject={handleLaunchTimerForSubject}
              />
            )}

            {activeTab === 'tasks' && (
              <TaskManagerView
                onOpenQuickAdd={handleOpenQuickAdd}
                onLaunchTimerForSubject={handleLaunchTimerForSubject}
              />
            )}

            {activeTab === 'flashcards' && (
              <FlashcardsDeckView onOpenQuickAdd={handleOpenQuickAdd} />
            )}

            {activeTab === 'ai' && <AIPlannerView />}

            {activeTab === 'analytics' && <AnalyticsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950/80 border-t border-slate-900 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">StudyOrbit</span>
            <span>•</span>
            <span>Intelligent Study Planner & Focus Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 text-slate-500">
              Designed for Flow State <Sparkles className="w-3 h-3 text-indigo-400" />
            </span>
          </div>
        </div>
      </footer>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialTab={quickAddTab}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <StudyAppContent />
    </StudyProvider>
  );
}
