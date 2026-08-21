export type Priority = 'low' | 'medium' | 'high';

export type SessionType = 'pomodoro' | 'deep_work' | 'revision' | 'practice_test';

export interface TopicItem {
  id: string;
  title: string;
  completed: boolean;
  estimatedHours?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // Tailwind color class or hex
  accentColor: string;
  icon: string; // Lucide icon name
  goalHoursPerWeek: number;
  examName?: string;
  examDate?: string; // YYYY-MM-DD
  topics: TopicItem[];
  instructor?: string;
  description?: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string;
  topicId?: string;
  dueDate: string; // YYYY-MM-DD or ISO
  dueTime?: string; // HH:mm
  estimatedMinutes: number;
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  tags?: string[];
}

export interface StudyBlock {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // HH:mm format e.g. "09:00"
  endTime: string; // HH:mm format e.g. "10:30"
  subjectId: string;
  title: string;
  topic?: string;
  completed?: boolean;
  roomOrLink?: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName?: string;
  topicTitle?: string;
  date: string; // ISO string
  durationMinutes: number;
  type: SessionType;
  focusRating?: number; // 1 to 5
  notes?: string;
}

export interface Flashcard {
  id: string;
  subjectId: string;
  topic: string;
  front: string;
  back: string;
  hint?: string;
  lastReviewed?: string;
  boxLevel: number; // 1 = Daily, 2 = 3 Days, 3 = 7 Days, 4 = 14 Days, 5 = Mastered
  reviewCount: number;
}

export interface AIStudyPlan {
  summary: string;
  recommendedDailyRhythm: string;
  strategies: string[];
  scheduleBlocks: {
    id: string;
    day: string;
    subject: string;
    topic: string;
    durationMinutes: number;
    technique: string;
    priority: string;
  }[];
  milestones: {
    title: string;
    targetDays: string;
    goal: string;
  }[];
}

export interface ConceptExplanation {
  title: string;
  oneSentenceHook: string;
  breakdown: {
    heading: string;
    body: string;
  }[];
  quickCheckQuestion: string;
  quickCheckAnswer: string;
}

export interface BackendStatus {
  connected: boolean;
  status: 'connected' | 'syncing' | 'offline';
  latencyMs?: number;
  uptimeSeconds?: number;
  geminiConfigured?: boolean;
  lastSyncedAt?: string;
  storageStats?: {
    subjectsCount: number;
    tasksCount: number;
    flashcardsCount: number;
    sessionsCount: number;
    scheduleBlocksCount: number;
  };
}

export interface AppState {
  subjects: Subject[];
  tasks: StudyTask[];
  scheduleBlocks: StudyBlock[];
  sessions: StudySession[];
  flashcards: Flashcard[];
  streak: {
    current: number;
    longest: number;
    lastDate: string;
  };
  settings: {
    pomodoroFocusMinutes: number;
    pomodoroShortBreakMinutes: number;
    pomodoroLongBreakMinutes: number;
    longBreakInterval: number;
    soundEnabled: boolean;
    autoStartBreaks: boolean;
    dailyGoalHours: number;
  };
}

