import React from 'react';
import {
  LayoutDashboard,
  Timer,
  Calendar,
  BookOpen,
  CheckSquare,
  Layers,
  Sparkles,
  BarChart3,
  Flame,
  Plus,
  Server,
  Settings
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { AmbientSoundController } from './AmbientSoundController';
import { motion } from 'motion/react';

export type ActiveTab =
  | 'dashboard'
  | 'timer'
  | 'timetable'
  | 'subjects'
  | 'tasks'
  | 'flashcards'
  | 'ai'
  | 'analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickAdd: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenQuickAdd, onOpenSettings }) => {
  const { state, backendStatus } = useStudy();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'ai', label: 'AI Strategist', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">StudyOrbit</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  FULL-STACK
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Focus & Exam Mastery</p>
            </div>
          </div>

          {/* Center Navigation Bar */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/30 -z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center gap-2">
            {/* Backend Server Status Pill */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenSettings}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition ${
                backendStatus.connected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              }`}
              title="Backend Server Status & API Endpoints"
            >
              <Server className="w-3.5 h-3.5" />
              <span className={`w-1.5 h-1.5 rounded-full ${backendStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden xl:inline">API</span>
              <span>{backendStatus.connected ? `${backendStatus.latencyMs || 12}ms` : 'Syncing'}</span>
            </motion.button>

            {/* Ambient Sound Bar */}
            <AmbientSoundController />

            {/* Streak Counter */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab('analytics')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold cursor-pointer shadow-sm shadow-amber-500/10"
              title={`${state.streak.current} day study streak!`}
            >
              <motion.span
                animate={{ rotate: [-8, 8, -8], scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
              </motion.span>
              <span>{state.streak.current}d</span>
            </motion.div>

            {/* Quick Add Button */}
            <motion.button
              id="quick-add-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </motion.button>

            {/* Settings Button */}
            {onOpenSettings && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenSettings}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl border border-slate-800 transition"
                title="Settings & Backend Config"
              >
                <Settings className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Nav Overflow */}
        <div className="lg:hidden flex items-center gap-1 py-2 overflow-x-auto no-scrollbar border-t border-slate-800/60">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
