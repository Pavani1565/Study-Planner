import React, { useState, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { X, Settings, Volume2, Target, RotateCcw, Server, RefreshCw, Download, Upload, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { state, backendStatus, updateSettings, resetToDefaults, syncWithServer, exportDatabase, importDatabase } = useStudy();

  const [activeTab, setActiveTab] = useState<'general' | 'backend'>('general');
  const [focusMin, setFocusMin] = useState(state.settings.pomodoroFocusMinutes);
  const [shortBreakMin, setShortBreakMin] = useState(state.settings.pomodoroShortBreakMinutes);
  const [longBreakMin, setLongBreakMin] = useState(state.settings.pomodoroLongBreakMinutes);
  const [dailyGoalHours, setDailyGoalHours] = useState(state.settings.dailyGoalHours);
  const [soundEnabled, setSoundEnabled] = useState(state.settings.soundEnabled);
  const [syncing, setSyncing] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      pomodoroFocusMinutes: Number(focusMin),
      pomodoroShortBreakMinutes: Number(shortBreakMin),
      pomodoroLongBreakMinutes: Number(longBreakMin),
      dailyGoalHours: Number(dailyGoalHours),
      soundEnabled
    });
    onClose();
  };

  const handleManualSync = async () => {
    setSyncing(true);
    await syncWithServer();
    setTimeout(() => setSyncing(false), 500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const success = await importDatabase(parsed);
        if (success) {
          setImportStatus('Database successfully restored from JSON!');
        } else {
          setImportStatus('Failed: Invalid backup structure.');
        }
      } catch {
        setImportStatus('Failed: Could not parse JSON file.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Planner Preferences & Backend</h2>
                  <p className="text-[11px] text-slate-400">Settings, Focus Timers & Server API</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800/80 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'general'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Timer & Goals</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('backend')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'backend'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Backend & Database</span>
                <span className={`w-2 h-2 rounded-full ${backendStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              </button>
            </div>

            {/* Tab Content */}
            <div className="overflow-y-auto pr-1 space-y-4 flex-1">
              {activeTab === 'general' ? (
                <form onSubmit={handleSave} className="space-y-4">
                  {/* Daily Target */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-indigo-400" />
                      Daily Study Target (Hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      value={dailyGoalHours}
                      onChange={e => setDailyGoalHours(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Pomodoro Intervals */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Focus (min)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={focusMin}
                        onChange={e => setFocusMin(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Short (min)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={shortBreakMin}
                        onChange={e => setShortBreakMin(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Long (min)</label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={longBreakMin}
                        onChange={e => setLongBreakMin(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Audio feedback checkbox */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold text-slate-200">Alert Chimes & Completion Fanfares</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={e => setSoundEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Reset to default initial data?')) {
                          resetToDefaults();
                          onClose();
                        }
                      }}
                      className="text-xs text-slate-500 hover:text-slate-300 font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Data</span>
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30"
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Server Health Status Card */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-white">Express Backend Server</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Online {backendStatus.latencyMs ? `(${backendStatus.latencyMs}ms)` : ''}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800/60">
                        <div className="text-[10px] text-slate-400">Subjects</div>
                        <div className="text-sm font-bold text-white">{state.subjects.length}</div>
                      </div>
                      <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800/60">
                        <div className="text-[10px] text-slate-400">Tasks</div>
                        <div className="text-sm font-bold text-white">{state.tasks.length}</div>
                      </div>
                      <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800/60">
                        <div className="text-[10px] text-slate-400">Cards</div>
                        <div className="text-sm font-bold text-white">{state.flashcards.length}</div>
                      </div>
                      <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800/60">
                        <div className="text-[10px] text-slate-400">Sessions</div>
                        <div className="text-sm font-bold text-white">{state.sessions.length}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
                      <span>Persistence: <strong className="text-slate-200">data/study-db.json</strong></span>
                      <span>Last sync: <strong className="text-slate-200">{backendStatus.lastSyncedAt || 'Active'}</strong></span>
                    </div>
                  </div>

                  {/* Actions: Sync, Export, Import */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={syncing}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                      <span>{syncing ? 'Syncing...' : 'Force Sync'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={exportDatabase}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export JSON</span>
                    </button>

                    <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import JSON</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {importStatus && (
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-400" />
                      <span>{importStatus}</span>
                    </div>
                  )}

                  {/* API Endpoints Catalog */}
                  <div>
                    <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                      Live REST API Endpoints
                    </div>
                    <div className="space-y-1.5 text-[11px] font-mono text-slate-400 bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-40 overflow-y-auto">
                      <div className="flex items-center justify-between"><span className="text-emerald-400 font-bold">GET</span> <span>/api/health</span></div>
                      <div className="flex items-center justify-between"><span className="text-emerald-400 font-bold">GET</span> <span>/api/state</span></div>
                      <div className="flex items-center justify-between"><span className="text-blue-400 font-bold">POST</span> <span>/api/state/sync</span></div>
                      <div className="flex items-center justify-between"><span className="text-emerald-400 font-bold">GET / POST</span> <span>/api/subjects</span></div>
                      <div className="flex items-center justify-between"><span className="text-emerald-400 font-bold">GET / POST</span> <span>/api/tasks</span></div>
                      <div className="flex items-center justify-between"><span className="text-emerald-400 font-bold">GET / POST</span> <span>/api/schedule-blocks</span></div>
                      <div className="flex items-center justify-between"><span className="text-emerald-400 font-bold">GET / POST</span> <span>/api/flashcards</span></div>
                      <div className="flex items-center justify-between"><span className="text-emerald-400 font-bold">GET / POST</span> <span>/api/sessions</span></div>
                      <div className="flex items-center justify-between"><span className="text-emerald-400 font-bold">GET</span> <span>/api/analytics</span></div>
                      <div className="flex items-center justify-between"><span className="text-indigo-400 font-bold">POST</span> <span>/api/ai/study-plan</span></div>
                      <div className="flex items-center justify-between"><span className="text-indigo-400 font-bold">POST</span> <span>/api/ai/flashcards</span></div>
                      <div className="flex items-center justify-between"><span className="text-indigo-400 font-bold">POST</span> <span>/api/ai/explain</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
