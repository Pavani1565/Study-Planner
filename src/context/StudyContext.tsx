import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Subject, StudyTask, StudyBlock, Flashcard, StudySession, TopicItem, BackendStatus } from '../types';
import { INITIAL_APP_STATE } from '../data/initialData';
import confetti from 'canvas-confetti';
import { playAlert } from '../utils/audio';

const STORAGE_KEY = 'study_planner_state_v1';

interface StudyContextType {
  state: AppState;
  backendStatus: BackendStatus;
  
  // Subject actions
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTopic: (subjectId: string, topic: Omit<TopicItem, 'id'>) => Promise<void>;
  toggleTopicCompletion: (subjectId: string, topicId: string) => Promise<void>;
  deleteTopic: (subjectId: string, topicId: string) => Promise<void>;

  // Task actions
  addTask: (task: Omit<StudyTask, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<StudyTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;

  // Timetable actions
  addScheduleBlock: (block: Omit<StudyBlock, 'id'>) => Promise<void>;
  updateScheduleBlock: (id: string, updates: Partial<StudyBlock>) => Promise<void>;
  deleteScheduleBlock: (id: string) => Promise<void>;
  toggleBlockCompleted: (id: string) => Promise<void>;

  // Session & Streak actions
  logSession: (session: Omit<StudySession, 'id'>) => Promise<void>;
  
  // Flashcard actions
  addFlashcard: (card: Omit<Flashcard, 'id' | 'boxLevel' | 'reviewCount'>) => Promise<void>;
  reviewFlashcard: (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => Promise<void>;
  deleteFlashcard: (cardId: string) => Promise<void>;

  // Settings & Sync
  updateSettings: (newSettings: Partial<AppState['settings']>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  exportDatabase: () => Promise<void>;
  importDatabase: (importedState: any) => Promise<boolean>;

  // Derived helpers
  getTodayStudyMinutes: () => number;
  getSubjectById: (id: string) => Subject | undefined;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to read from localStorage", e);
    }
    return INITIAL_APP_STATE;
  });

  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    connected: false,
    status: 'syncing',
    latencyMs: 0,
  });

  const isInitialMount = useRef(true);

  // Sync to local storage on any state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to persist to localStorage", e);
    }
  }, [state]);

  // Ping Backend and Fetch State on Mount
  const checkBackendHealthAndFetchState = useCallback(async () => {
    const t0 = performance.now();
    try {
      const res = await fetch('/api/health');
      const t1 = performance.now();
      const latency = Math.round(t1 - t0);

      if (res.ok) {
        const healthData = await res.json();
        
        // Fetch full server state on first load
        if (isInitialMount.current) {
          isInitialMount.current = false;
          try {
            const stateRes = await fetch('/api/state');
            if (stateRes.ok) {
              const serverState = await stateRes.json();
              if (serverState && serverState.subjects && serverState.subjects.length > 0) {
                setState(serverState);
              }
            }
          } catch (fetchErr) {
            console.warn("Could not fetch initial server state:", fetchErr);
          }
        }

        setBackendStatus({
          connected: true,
          status: 'connected',
          latencyMs: latency,
          uptimeSeconds: healthData.uptimeSeconds,
          geminiConfigured: healthData.geminiConfigured,
          lastSyncedAt: new Date().toLocaleTimeString(),
          storageStats: healthData.storage
        });
      } else {
        setBackendStatus(prev => ({ ...prev, connected: false, status: 'offline' }));
      }
    } catch {
      setBackendStatus(prev => ({ ...prev, connected: false, status: 'offline' }));
    }
  }, []);

  useEffect(() => {
    checkBackendHealthAndFetchState();
    const interval = setInterval(checkBackendHealthAndFetchState, 15000);
    return () => clearInterval(interval);
  }, [checkBackendHealthAndFetchState]);

  // Backend Sync Helper
  const syncWithServer = async () => {
    setBackendStatus(prev => ({ ...prev, status: 'syncing' }));
    try {
      const res = await fetch('/api/state/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(data.state);
        }
        setBackendStatus(prev => ({
          ...prev,
          connected: true,
          status: 'connected',
          lastSyncedAt: new Date().toLocaleTimeString()
        }));
      }
    } catch (e) {
      console.warn("Backend sync failed, offline fallback:", e);
      setBackendStatus(prev => ({ ...prev, connected: false, status: 'offline' }));
    }
  };

  // Subject Handlers
  const addSubject = async (sub: Omit<Subject, 'id'>) => {
    const tempId = `sub-${Date.now()}`;
    const newSubject: Subject = {
      ...sub,
      id: tempId
    };

    setState(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject]
    }));

    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubject)
      });
      if (res.ok) {
        const serverSub = await res.json();
        setState(prev => ({
          ...prev,
          subjects: prev.subjects.map(s => s.id === tempId ? serverSub : s)
        }));
      }
    } catch (err) {
      console.warn("Server create subject failed:", err);
    }
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
    }));

    try {
      await fetch(`/api/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.warn("Server update subject failed:", err);
    }
  };

  const deleteSubject = async (id: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      tasks: prev.tasks.filter(t => t.subjectId !== id),
      scheduleBlocks: prev.scheduleBlocks.filter(b => b.subjectId !== id),
      flashcards: prev.flashcards.filter(f => f.subjectId !== id)
    }));

    try {
      await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn("Server delete subject failed:", err);
    }
  };

  const addTopic = async (subjectId: string, topic: Omit<TopicItem, 'id'>) => {
    const tempId = `top-${Date.now()}`;
    const newTopic: TopicItem = {
      ...topic,
      id: tempId
    };

    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s.id === subjectId) {
          return { ...s, topics: [...s.topics, newTopic] };
        }
        return s;
      })
    }));

    try {
      const res = await fetch(`/api/subjects/${subjectId}/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topic)
      });
      if (res.ok) {
        const createdTopic = await res.json();
        setState(prev => ({
          ...prev,
          subjects: prev.subjects.map(s => {
            if (s.id === subjectId) {
              return {
                ...s,
                topics: s.topics.map(t => t.id === tempId ? createdTopic : t)
              };
            }
            return s;
          })
        }));
      }
    } catch (err) {
      console.warn("Server add topic failed:", err);
    }
  };

  const toggleTopicCompletion = async (subjectId: string, topicId: string) => {
    playAlert('check');
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s.id === subjectId) {
          const updatedTopics = s.topics.map(t => {
            if (t.id === topicId) {
              const nextVal = !t.completed;
              if (nextVal) {
                confetti({
                  particleCount: 35,
                  spread: 60,
                  origin: { y: 0.7 }
                });
              }
              return { ...t, completed: nextVal };
            }
            return t;
          });
          return { ...s, topics: updatedTopics };
        }
        return s;
      })
    }));

    try {
      await fetch(`/api/subjects/${subjectId}/topics/${topicId}/toggle`, { method: 'PATCH' });
    } catch (err) {
      console.warn("Server toggle topic failed:", err);
    }
  };

  const deleteTopic = async (subjectId: string, topicId: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s.id === subjectId) {
          return { ...s, topics: s.topics.filter(t => t.id !== topicId) };
        }
        return s;
      })
    }));

    try {
      await fetch(`/api/subjects/${subjectId}/topics/${topicId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn("Server delete topic failed:", err);
    }
  };

  // Task Handlers
  const addTask = async (task: Omit<StudyTask, 'id'>) => {
    const tempId = `task-${Date.now()}`;
    const newTask: StudyTask = {
      ...task,
      id: tempId
    };

    setState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        const created = await res.json();
        setState(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === tempId ? created : t)
        }));
      }
    } catch (err) {
      console.warn("Server add task failed:", err);
    }
  };

  const updateTask = async (id: string, updates: Partial<StudyTask>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.warn("Server update task failed:", err);
    }
  };

  const deleteTask = async (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn("Server delete task failed:", err);
    }
  };

  const toggleTask = async (id: string) => {
    playAlert('check');
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === id) {
          const next = !t.completed;
          if (next) {
            confetti({
              particleCount: 45,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
          return {
            ...t,
            completed: next,
            completedAt: next ? new Date().toISOString() : undefined
          };
        }
        return t;
      })
    }));

    try {
      await fetch(`/api/tasks/${id}/toggle`, { method: 'PATCH' });
    } catch (err) {
      console.warn("Server toggle task failed:", err);
    }
  };

  // Timetable Handlers
  const addScheduleBlock = async (block: Omit<StudyBlock, 'id'>) => {
    const tempId = `sb-${Date.now()}`;
    const newBlock: StudyBlock = {
      ...block,
      id: tempId
    };

    setState(prev => ({
      ...prev,
      scheduleBlocks: [...prev.scheduleBlocks, newBlock]
    }));

    try {
      const res = await fetch('/api/schedule-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlock)
      });
      if (res.ok) {
        const created = await res.json();
        setState(prev => ({
          ...prev,
          scheduleBlocks: prev.scheduleBlocks.map(b => b.id === tempId ? created : b)
        }));
      }
    } catch (err) {
      console.warn("Server add schedule block failed:", err);
    }
  };

  const updateScheduleBlock = async (id: string, updates: Partial<StudyBlock>) => {
    setState(prev => ({
      ...prev,
      scheduleBlocks: prev.scheduleBlocks.map(b => b.id === id ? { ...b, ...updates } : b)
    }));

    try {
      await fetch(`/api/schedule-blocks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.warn("Server update block failed:", err);
    }
  };

  const deleteScheduleBlock = async (id: string) => {
    setState(prev => ({
      ...prev,
      scheduleBlocks: prev.scheduleBlocks.filter(b => b.id !== id)
    }));

    try {
      await fetch(`/api/schedule-blocks/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn("Server delete block failed:", err);
    }
  };

  const toggleBlockCompleted = async (id: string) => {
    playAlert('check');
    setState(prev => ({
      ...prev,
      scheduleBlocks: prev.scheduleBlocks.map(b => {
        if (b.id === id) {
          const next = !b.completed;
          if (next) {
            confetti({
              particleCount: 30,
              spread: 50,
              origin: { y: 0.7 }
            });
          }
          return { ...b, completed: next };
        }
        return b;
      })
    }));

    try {
      await fetch(`/api/schedule-blocks/${id}/toggle`, { method: 'PATCH' });
    } catch (err) {
      console.warn("Server toggle block failed:", err);
    }
  };

  // Session Log & Streak
  const logSession = async (sessionData: Omit<StudySession, 'id'>) => {
    const tempId = `sess-${Date.now()}`;
    const newSession: StudySession = {
      ...sessionData,
      id: tempId
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const lastDate = state.streak.lastDate;

    let newCurrent = state.streak.current;
    if (lastDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        newCurrent += 1;
      } else {
        newCurrent = 1;
      }
    }

    const newLongest = Math.max(newCurrent, state.streak.longest);

    playAlert('complete');
    confetti({
      particleCount: 90,
      spread: 90,
      origin: { y: 0.5 }
    });

    setState(prev => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
      streak: {
        current: newCurrent,
        longest: newLongest,
        lastDate: todayStr
      }
    }));

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session && data.streak) {
          setState(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => s.id === tempId ? data.session : s),
            streak: data.streak
          }));
        }
      }
    } catch (err) {
      console.warn("Server log session failed:", err);
    }
  };

  // Flashcards
  const addFlashcard = async (card: Omit<Flashcard, 'id' | 'boxLevel' | 'reviewCount'>) => {
    const tempId = `fc-${Date.now()}`;
    const newCard: Flashcard = {
      ...card,
      id: tempId,
      boxLevel: 1,
      reviewCount: 0
    };

    setState(prev => ({
      ...prev,
      flashcards: [newCard, ...prev.flashcards]
    }));

    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard)
      });
      if (res.ok) {
        const serverCard = await res.json();
        setState(prev => ({
          ...prev,
          flashcards: prev.flashcards.map(c => c.id === tempId ? serverCard : c)
        }));
      }
    } catch (err) {
      console.warn("Server add flashcard failed:", err);
    }
  };

  const reviewFlashcard = async (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    setState(prev => ({
      ...prev,
      flashcards: prev.flashcards.map(c => {
        if (c.id === cardId) {
          let newBox = c.boxLevel;
          if (rating === 'again') newBox = 1;
          else if (rating === 'hard') newBox = Math.max(1, c.boxLevel);
          else if (rating === 'good') newBox = Math.min(5, c.boxLevel + 1);
          else if (rating === 'easy') newBox = Math.min(5, c.boxLevel + 2);

          return {
            ...c,
            boxLevel: newBox,
            reviewCount: c.reviewCount + 1,
            lastReviewed: new Date().toISOString().split('T')[0]
          };
        }
        return c;
      })
    }));

    try {
      await fetch(`/api/flashcards/${cardId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
    } catch (err) {
      console.warn("Server review flashcard failed:", err);
    }
  };

  const deleteFlashcard = async (cardId: string) => {
    setState(prev => ({
      ...prev,
      flashcards: prev.flashcards.filter(c => c.id !== cardId)
    }));

    try {
      await fetch(`/api/flashcards/${cardId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn("Server delete flashcard failed:", err);
    }
  };

  const updateSettings = async (newSettings: Partial<AppState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (err) {
      console.warn("Server update settings failed:", err);
    }
  };

  const resetToDefaults = async () => {
    setState(INITIAL_APP_STATE);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(data.state);
        }
      }
    } catch (err) {
      console.warn("Server reset failed:", err);
    }
  };

  const exportDatabase = async () => {
    try {
      const res = await fetch('/api/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studyorbit-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      // Client fallback export
      const jsonStr = JSON.stringify(state, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studyorbit-local-backup.json`;
      a.click();
    }
  };

  const importDatabase = async (importedState: any): Promise<boolean> => {
    if (!importedState || !Array.isArray(importedState.subjects) || !Array.isArray(importedState.tasks)) {
      return false;
    }
    setState(importedState);
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importedState)
      });
      return res.ok;
    } catch {
      return true;
    }
  };

  const getTodayStudyMinutes = () => {
    const today = new Date().toISOString().split('T')[0];
    return state.sessions
      .filter(s => s.date.startsWith(today))
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
  };

  const getSubjectById = (id: string) => {
    return state.subjects.find(s => s.id === id);
  };

  return (
    <StudyContext.Provider
      value={{
        state,
        backendStatus,
        addSubject,
        updateSubject,
        deleteSubject,
        addTopic,
        toggleTopicCompletion,
        deleteTopic,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        addScheduleBlock,
        updateScheduleBlock,
        deleteScheduleBlock,
        toggleBlockCompleted,
        logSession,
        addFlashcard,
        reviewFlashcard,
        deleteFlashcard,
        updateSettings,
        resetToDefaults,
        syncWithServer,
        exportDatabase,
        importDatabase,
        getTodayStudyMinutes,
        getSubjectById
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
