import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Default Seed Data
const DEFAULT_INITIAL_STATE = {
  subjects: [
    {
      id: 'sub-1',
      name: 'Advanced Calculus & Linear Algebra',
      code: 'MATH 201',
      color: 'from-blue-600 to-cyan-600',
      accentColor: '#3b82f6',
      icon: 'Sigma',
      goalHoursPerWeek: 8,
      examName: 'Midterm Examination',
      examDate: '2026-09-15',
      instructor: 'Prof. Anderson',
      description: 'Multivariable calculus, eigenvectors, partial derivatives, and matrix decompositions.',
      topics: [
        { id: 'top-1-1', title: 'Eigenvalues & Diagonalization', completed: true, difficulty: 'hard', estimatedHours: 4 },
        { id: 'top-1-2', title: 'Multivariable Chain Rule & Gradients', completed: true, difficulty: 'medium', estimatedHours: 3 },
        { id: 'top-1-3', title: 'Lagrange Multipliers & Optimization', completed: false, difficulty: 'hard', estimatedHours: 5 },
        { id: 'top-1-4', title: 'Double & Triple Integrals (Polar/Spherical)', completed: false, difficulty: 'medium', estimatedHours: 4 },
        { id: 'top-1-5', title: "Vector Fields & Green's Theorem", completed: false, difficulty: 'hard', estimatedHours: 6 }
      ]
    },
    {
      id: 'sub-2',
      name: 'Neural Networks & Deep Learning',
      code: 'CS 480',
      color: 'from-purple-600 to-indigo-600',
      accentColor: '#a855f7',
      icon: 'Cpu',
      goalHoursPerWeek: 10,
      examName: 'Final Project & Theory Exam',
      examDate: '2026-09-28',
      instructor: 'Dr. Evelyn Vance',
      description: 'Backpropagation, Transformers, Attention mechanisms, CNNs, and optimization algorithms.',
      topics: [
        { id: 'top-2-1', title: 'Backpropagation & Computational Graphs', completed: true, difficulty: 'medium', estimatedHours: 4 },
        { id: 'top-2-2', title: 'Convolutional Filters & ResNets', completed: true, difficulty: 'medium', estimatedHours: 5 },
        { id: 'top-2-3', title: 'Multi-Head Self-Attention & Transformers', completed: false, difficulty: 'hard', estimatedHours: 7 },
        { id: 'top-2-4', title: 'Gradient Descent Optimizers (Adam, RMSProp)', completed: true, difficulty: 'easy', estimatedHours: 3 },
        { id: 'top-2-5', title: 'Diffusion Models & Generative AI', completed: false, difficulty: 'hard', estimatedHours: 6 }
      ]
    },
    {
      id: 'sub-3',
      name: 'Organic Chemistry & Reaction Mechanisms',
      code: 'CHEM 310',
      color: 'from-emerald-600 to-teal-600',
      accentColor: '#10b981',
      icon: 'FlaskConical',
      goalHoursPerWeek: 7,
      examName: 'Chapter 1-6 Comprehensive Quiz',
      examDate: '2026-09-08',
      instructor: 'Prof. H. Tanaka',
      description: 'Stereochemistry, SN1/SN2/E1/E2 reactions, carbonyl chemistry, and NMR spectroscopy.',
      topics: [
        { id: 'top-3-1', title: 'Stereocenters & R/S Nomenclature', completed: true, difficulty: 'easy', estimatedHours: 2 },
        { id: 'top-3-2', title: 'Nucleophilic Substitution (SN1 vs SN2)', completed: true, difficulty: 'medium', estimatedHours: 4 },
        { id: 'top-3-3', title: 'Elimination Pathways (E1 vs E2)', completed: false, difficulty: 'medium', estimatedHours: 3 },
        { id: 'top-3-4', title: '1H & 13C NMR Spectroscopy Analysis', completed: false, difficulty: 'hard', estimatedHours: 6 },
        { id: 'top-3-5', title: 'Aldol Condensations & Enolate Chemistry', completed: false, difficulty: 'hard', estimatedHours: 5 }
      ]
    },
    {
      id: 'sub-4',
      name: 'Cognitive Psychology & Memory',
      code: 'PSYC 250',
      color: 'from-amber-500 to-orange-600',
      accentColor: '#f59e0b',
      icon: 'Brain',
      goalHoursPerWeek: 5,
      examName: 'Midterm Research Paper & Exam',
      examDate: '2026-10-02',
      instructor: 'Dr. Marcus Brody',
      description: 'Working memory models, spacing effect, cognitive biases, and attention systems.',
      topics: [
        { id: 'top-4-1', title: 'Baddeley Working Memory Model', completed: true, difficulty: 'easy', estimatedHours: 2 },
        { id: 'top-4-2', title: 'Spaced Repetition & Forgetting Curve', completed: true, difficulty: 'easy', estimatedHours: 2 },
        { id: 'top-4-3', title: 'Heuristics & Decision Framing Biases', completed: false, difficulty: 'medium', estimatedHours: 3 },
        { id: 'top-4-4', title: 'Neurobiology of Long-Term Potentiation', completed: false, difficulty: 'hard', estimatedHours: 4 }
      ]
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Solve Problem Set 4: Lagrange Multipliers & Contours',
      subjectId: 'sub-1',
      topicId: 'top-1-3',
      dueDate: '2026-08-23',
      dueTime: '23:59',
      estimatedMinutes: 90,
      priority: 'high',
      completed: false,
      notes: 'Questions 4, 7, 9 have tricky constrained boundary conditions.'
    },
    {
      id: 'task-2',
      title: 'Derive Transformer Attention Matrix Equations by Hand',
      subjectId: 'sub-2',
      topicId: 'top-2-3',
      dueDate: '2026-08-24',
      dueTime: '17:00',
      estimatedMinutes: 60,
      priority: 'high',
      completed: false,
      notes: 'Include softmax temperature scaling (sqrt(d_k)).'
    },
    {
      id: 'task-3',
      title: 'Review 1H NMR practice spectra problem booklet',
      subjectId: 'sub-3',
      topicId: 'top-3-4',
      dueDate: '2026-08-25',
      dueTime: '14:00',
      estimatedMinutes: 45,
      priority: 'medium',
      completed: false,
      notes: 'Focus on splitting patterns (doublet of doublets) and integration ratios.'
    },
    {
      id: 'task-4',
      title: 'Read Baddeley 2020 Working Memory paper (Pages 14-38)',
      subjectId: 'sub-4',
      topicId: 'top-4-1',
      dueDate: '2026-08-22',
      dueTime: '20:00',
      estimatedMinutes: 40,
      priority: 'low',
      completed: true,
      completedAt: '2026-08-21T10:00:00Z',
      notes: 'Summarized the role of episodic buffer in active recall.'
    },
    {
      id: 'task-5',
      title: 'Implement PyTorch ResNet-18 custom residual skip block',
      subjectId: 'sub-2',
      topicId: 'top-2-2',
      dueDate: '2026-08-26',
      dueTime: '22:00',
      estimatedMinutes: 75,
      priority: 'medium',
      completed: false,
      notes: 'Test with CIFAR-10 classification benchmark.'
    }
  ],
  scheduleBlocks: [
    { id: 'sb-1', dayOfWeek: 1, startTime: '09:00', endTime: '10:30', subjectId: 'sub-1', title: 'Calculus Practice & Problem Sets', topic: 'Optimization' },
    { id: 'sb-2', dayOfWeek: 1, startTime: '14:00', endTime: '15:30', subjectId: 'sub-2', title: 'Deep Learning Code Lab', topic: 'Attention heads' },
    { id: 'sb-3', dayOfWeek: 2, startTime: '10:00', endTime: '11:30', subjectId: 'sub-3', title: 'Orgo Reaction Drills', topic: 'NMR Spectroscopy' },
    { id: 'sb-4', dayOfWeek: 2, startTime: '16:00', endTime: '17:30', subjectId: 'sub-4', title: 'Psychology Paper Summaries', topic: 'Cognitive Biases' },
    { id: 'sb-5', dayOfWeek: 3, startTime: '09:00', endTime: '11:00', subjectId: 'sub-2', title: 'Deep Work: Neural Architecture', topic: 'Transformer Implementations' },
    { id: 'sb-6', dayOfWeek: 3, startTime: '15:00', endTime: '16:30', subjectId: 'sub-1', title: 'Vector Calculus', topic: "Green's Theorem" },
    { id: 'sb-7', dayOfWeek: 4, startTime: '11:00', endTime: '12:30', subjectId: 'sub-3', title: 'Organic Synthesis Review', topic: 'Aldol Condensation' },
    { id: 'sb-8', dayOfWeek: 4, startTime: '14:30', endTime: '16:00', subjectId: 'sub-2', title: 'Model Training & Hyperparams', topic: 'Adam Optimizer' },
    { id: 'sb-9', dayOfWeek: 5, startTime: '10:00', endTime: '12:00', subjectId: 'sub-1', title: 'Weekly Math Exam Prep', topic: 'Lagrange Multipliers' },
    { id: 'sb-10', dayOfWeek: 5, startTime: '14:00', endTime: '15:30', subjectId: 'sub-4', title: 'Memory Research Review', topic: 'Active Recall Mechanisms' },
    { id: 'sb-11', dayOfWeek: 6, startTime: '10:30', endTime: '12:30', subjectId: 'sub-2', title: 'Weekend Project Sprint', topic: 'PyTorch Pipeline' },
    { id: 'sb-12', dayOfWeek: 0, startTime: '16:00', endTime: '17:30', subjectId: 'sub-3', title: 'Weekly Chemistry Flashcard Review', topic: 'Reactions Quiz' }
  ],
  sessions: [
    {
      id: 'sess-1',
      subjectId: 'sub-2',
      subjectName: 'Neural Networks & Deep Learning',
      topicTitle: 'Transformers Self-Attention',
      date: '2026-08-21T08:30:00.000Z',
      durationMinutes: 50,
      type: 'pomodoro',
      focusRating: 5,
      notes: 'Derived multi-head attention matrix projections.'
    },
    {
      id: 'sess-2',
      subjectId: 'sub-1',
      subjectName: 'Advanced Calculus',
      topicTitle: 'Eigenvalues & Diagonalization',
      date: '2026-08-20T14:00:00.000Z',
      durationMinutes: 45,
      type: 'deep_work',
      focusRating: 4,
      notes: 'Completed 6 practice problems from Chapter 4.'
    },
    {
      id: 'sess-3',
      subjectId: 'sub-3',
      subjectName: 'Organic Chemistry',
      topicTitle: 'SN1 vs SN2 Mechanisms',
      date: '2026-08-19T10:15:00.000Z',
      durationMinutes: 35,
      type: 'revision',
      focusRating: 5,
      notes: 'Steric hindrance and solvent polarity comparison.'
    },
    {
      id: 'sess-4',
      subjectId: 'sub-4',
      subjectName: 'Cognitive Psychology',
      topicTitle: 'Baddeley Working Memory',
      date: '2026-08-18T16:00:00.000Z',
      durationMinutes: 60,
      type: 'deep_work',
      focusRating: 4,
      notes: 'Read chapter and took Cornell notes.'
    },
    {
      id: 'sess-5',
      subjectId: 'sub-2',
      subjectName: 'Neural Networks',
      topicTitle: 'PyTorch ResNet Architecture',
      date: '2026-08-17T09:00:00.000Z',
      durationMinutes: 50,
      type: 'pomodoro',
      focusRating: 5,
      notes: 'Implemented skip connection unit test.'
    }
  ],
  flashcards: [
    {
      id: 'fc-1',
      subjectId: 'sub-2',
      topic: 'Transformers',
      front: 'Why is the Scaled Dot-Product Attention scaled by 1/sqrt(d_k)?',
      back: 'To prevent large values of dot-products from pushing the softmax function into regions with extremely small gradients (gradient vanishing problem) when the key dimension d_k is large.',
      hint: 'Think about variance of dot products and softmax gradient saturation.',
      boxLevel: 3,
      reviewCount: 4,
      lastReviewed: '2026-08-20'
    },
    {
      id: 'fc-2',
      subjectId: 'sub-1',
      topic: 'Linear Algebra',
      front: 'What geometric property guarantees that an n×n real matrix has an orthogonal eigenbasis?',
      back: 'The matrix must be symmetric (A = A^T), as stated by the Spectral Theorem for symmetric real matrices.',
      hint: 'Matrix transpose symmetry and Spectral Theorem.',
      boxLevel: 2,
      reviewCount: 3,
      lastReviewed: '2026-08-19'
    },
    {
      id: 'fc-3',
      subjectId: 'sub-3',
      topic: 'NMR Spectroscopy',
      front: 'What does the n + 1 multiplicity rule dictate in 1H-NMR spectroscopy?',
      back: 'The peak signal of a proton will split into (n + 1) peaks, where n is the number of chemically non-equivalent neighboring protons located 3 bonds away (vicinal coupling).',
      hint: 'Vicinal spin-spin coupling.',
      boxLevel: 4,
      reviewCount: 6,
      lastReviewed: '2026-08-20'
    },
    {
      id: 'fc-4',
      subjectId: 'sub-4',
      topic: 'Memory',
      front: 'Explain the "Testing Effect" (Retrieval Practice) in cognitive psychology.',
      back: 'Actively retrieving information from memory produces superior long-term retention compared to passively re-reading or restudying the same material, by strengthening neural retrieval pathways.',
      hint: 'Active recall vs passive exposure.',
      boxLevel: 5,
      reviewCount: 8,
      lastReviewed: '2026-08-18'
    },
    {
      id: 'fc-5',
      subjectId: 'sub-2',
      topic: 'Optimizers',
      front: 'How does Adam optimizer combine AdaGrad and RMSProp?',
      back: 'Adam maintains exponential moving averages of both the past gradients (first moment / momentum like RMSProp/SGD) and the squared gradients (second moment / uncentered variance like AdaGrad/RMSProp), with bias correction for early steps.',
      hint: 'First moment (mean) + Second moment (variance).',
      boxLevel: 3,
      reviewCount: 3,
      lastReviewed: '2026-08-17'
    }
  ],
  streak: {
    current: 6,
    longest: 14,
    lastDate: '2026-08-21'
  },
  settings: {
    pomodoroFocusMinutes: 25,
    pomodoroShortBreakMinutes: 5,
    pomodoroLongBreakMinutes: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    autoStartBreaks: false,
    dailyGoalHours: 4
  }
};

// Database Persistence Engine
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "study-db.json");

let memoryState = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
let saveTimeout: NodeJS.Timeout | null = null;

function loadDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      memoryState = { ...DEFAULT_INITIAL_STATE, ...JSON.parse(content) };
      console.log("✅ Study Database loaded from disk:", DB_FILE);
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_INITIAL_STATE, null, 2), "utf-8");
      console.log("✨ Seeded new Study Database at:", DB_FILE);
    }
  } catch (err) {
    console.error("⚠️ Failed to load database file, using memory fallback:", err);
  }
}

function scheduleSaveDatabase() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(memoryState, null, 2), "utf-8");
    } catch (err) {
      console.error("⚠️ Failed to write database to disk:", err);
    }
  }, 100);
}

// Gemini AI Client Helper
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  // Load persistent DB
  loadDatabase();

  const app = express();
  const PORT = 3000;
  const startTime = Date.now();

  app.use(express.json({ limit: "10mb" }));

  // Request logger middleware
  app.use((req, _res, next) => {
    if (req.path.startsWith("/api/")) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // SYSTEM & HEALTH ENDPOINTS
  // ==========================================

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      storage: {
        subjectsCount: memoryState.subjects.length,
        tasksCount: memoryState.tasks.length,
        flashcardsCount: memoryState.flashcards.length,
        sessionsCount: memoryState.sessions.length,
        scheduleBlocksCount: memoryState.scheduleBlocks.length,
      },
      time: new Date().toISOString()
    });
  });

  // Full state get & sync
  app.get("/api/state", (_req: Request, res: Response) => {
    res.json(memoryState);
  });

  app.post("/api/state/sync", (req: Request, res: Response) => {
    try {
      const incomingState = req.body;
      if (incomingState && typeof incomingState === 'object') {
        memoryState = {
          ...memoryState,
          ...incomingState,
          subjects: incomingState.subjects || memoryState.subjects,
          tasks: incomingState.tasks || memoryState.tasks,
          scheduleBlocks: incomingState.scheduleBlocks || memoryState.scheduleBlocks,
          sessions: incomingState.sessions || memoryState.sessions,
          flashcards: incomingState.flashcards || memoryState.flashcards,
          streak: incomingState.streak || memoryState.streak,
          settings: incomingState.settings || memoryState.settings,
        };
        scheduleSaveDatabase();
        res.json({ success: true, state: memoryState });
      } else {
        res.status(400).json({ error: "Invalid state payload" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to sync state" });
    }
  });

  // Reset database to default seed
  app.post("/api/reset", (_req: Request, res: Response) => {
    memoryState = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
    scheduleSaveDatabase();
    res.json({ success: true, message: "Database reset to defaults", state: memoryState });
  });

  // Export database
  app.get("/api/export", (_req: Request, res: Response) => {
    res.setHeader("Content-Disposition", "attachment; filename=study-orbit-backup.json");
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(memoryState, null, 2));
  });

  // Import database
  app.post("/api/import", (req: Request, res: Response) => {
    try {
      const data = req.body;
      if (!data || !Array.isArray(data.subjects) || !Array.isArray(data.tasks)) {
        return res.status(400).json({ error: "Invalid backup format. Must contain subjects and tasks arrays." });
      }
      memoryState = {
        subjects: data.subjects,
        tasks: data.tasks || [],
        scheduleBlocks: data.scheduleBlocks || [],
        sessions: data.sessions || [],
        flashcards: data.flashcards || [],
        streak: data.streak || { current: 1, longest: 1, lastDate: new Date().toISOString().split('T')[0] },
        settings: data.settings || DEFAULT_INITIAL_STATE.settings,
      };
      scheduleSaveDatabase();
      res.json({ success: true, state: memoryState });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Import failed" });
    }
  });

  // ==========================================
  // SUBJECTS & TOPICS CRUD
  // ==========================================

  app.get("/api/subjects", (_req: Request, res: Response) => {
    res.json(memoryState.subjects);
  });

  app.post("/api/subjects", (req: Request, res: Response) => {
    try {
      const { name, code, color, accentColor, icon, goalHoursPerWeek, examName, examDate, instructor, description, topics } = req.body;
      if (!name) return res.status(400).json({ error: "Subject name is required" });

      const newSubject = {
        id: `sub-${Date.now()}`,
        name,
        code: code || '',
        color: color || 'from-indigo-600 to-cyan-600',
        accentColor: accentColor || '#6366f1',
        icon: icon || 'BookOpen',
        goalHoursPerWeek: Number(goalHoursPerWeek) || 5,
        examName: examName || undefined,
        examDate: examDate || undefined,
        instructor: instructor || undefined,
        description: description || '',
        topics: Array.isArray(topics) ? topics : []
      };

      memoryState.subjects.push(newSubject);
      scheduleSaveDatabase();
      res.status(201).json(newSubject);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/subjects/:id", (req: Request, res: Response) => {
    const sub = memoryState.subjects.find((s: any) => s.id === req.params.id);
    if (!sub) return res.status(404).json({ error: "Subject not found" });
    res.json(sub);
  });

  app.put("/api/subjects/:id", (req: Request, res: Response) => {
    const index = memoryState.subjects.findIndex((s: any) => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Subject not found" });

    memoryState.subjects[index] = {
      ...memoryState.subjects[index],
      ...req.body,
      id: req.params.id // Prevent id mutation
    };
    scheduleSaveDatabase();
    res.json(memoryState.subjects[index]);
  });

  app.delete("/api/subjects/:id", (req: Request, res: Response) => {
    const id = req.params.id;
    const initialLen = memoryState.subjects.length;
    memoryState.subjects = memoryState.subjects.filter((s: any) => s.id !== id);

    if (memoryState.subjects.length === initialLen) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Cascade delete related records
    memoryState.tasks = memoryState.tasks.filter((t: any) => t.subjectId !== id);
    memoryState.scheduleBlocks = memoryState.scheduleBlocks.filter((b: any) => b.subjectId !== id);
    memoryState.flashcards = memoryState.flashcards.filter((f: any) => f.subjectId !== id);

    scheduleSaveDatabase();
    res.json({ success: true, deletedId: id });
  });

  // Topic sub-routes
  app.post("/api/subjects/:id/topics", (req: Request, res: Response) => {
    const subject = memoryState.subjects.find((s: any) => s.id === req.params.id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const { title, difficulty, estimatedHours, notes } = req.body;
    if (!title) return res.status(400).json({ error: "Topic title is required" });

    const newTopic = {
      id: `top-${Date.now()}`,
      title,
      completed: false,
      difficulty: difficulty || 'medium',
      estimatedHours: Number(estimatedHours) || 2,
      notes: notes || ''
    };

    subject.topics.push(newTopic);
    scheduleSaveDatabase();
    res.status(201).json(newTopic);
  });

  app.patch("/api/subjects/:id/topics/:topicId/toggle", (req: Request, res: Response) => {
    const subject = memoryState.subjects.find((s: any) => s.id === req.params.id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const topic = subject.topics.find((t: any) => t.id === req.params.topicId);
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    topic.completed = !topic.completed;
    scheduleSaveDatabase();
    res.json({ success: true, topic });
  });

  app.delete("/api/subjects/:id/topics/:topicId", (req: Request, res: Response) => {
    const subject = memoryState.subjects.find((s: any) => s.id === req.params.id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    subject.topics = subject.topics.filter((t: any) => t.id !== req.params.topicId);
    scheduleSaveDatabase();
    res.json({ success: true });
  });

  // ==========================================
  // TASKS CRUD
  // ==========================================

  app.get("/api/tasks", (req: Request, res: Response) => {
    let result = [...memoryState.tasks];
    const { status, subjectId, search } = req.query;

    if (status === 'completed') {
      result = result.filter(t => t.completed);
    } else if (status === 'pending') {
      result = result.filter(t => !t.completed);
    } else if (status === 'high') {
      result = result.filter(t => t.priority === 'high' && !t.completed);
    }

    if (subjectId && typeof subjectId === 'string') {
      result = result.filter(t => t.subjectId === subjectId);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
    }

    res.json(result);
  });

  app.post("/api/tasks", (req: Request, res: Response) => {
    try {
      const { title, subjectId, topicId, dueDate, dueTime, estimatedMinutes, priority, notes, tags } = req.body;
      if (!title || !subjectId || !dueDate) {
        return res.status(400).json({ error: "Title, subjectId, and dueDate are required" });
      }

      const newTask = {
        id: `task-${Date.now()}`,
        title,
        subjectId,
        topicId: topicId || undefined,
        dueDate,
        dueTime: dueTime || '23:59',
        estimatedMinutes: Number(estimatedMinutes) || 45,
        priority: priority || 'medium',
        completed: false,
        notes: notes || '',
        tags: Array.isArray(tags) ? tags : []
      };

      memoryState.tasks.unshift(newTask);
      scheduleSaveDatabase();
      res.status(201).json(newTask);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/tasks/:id", (req: Request, res: Response) => {
    const index = memoryState.tasks.findIndex((t: any) => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Task not found" });

    memoryState.tasks[index] = {
      ...memoryState.tasks[index],
      ...req.body,
      id: req.params.id
    };
    scheduleSaveDatabase();
    res.json(memoryState.tasks[index]);
  });

  app.patch("/api/tasks/:id/toggle", (req: Request, res: Response) => {
    const task = memoryState.tasks.find((t: any) => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : undefined;

    scheduleSaveDatabase();
    res.json({ success: true, task });
  });

  app.delete("/api/tasks/:id", (req: Request, res: Response) => {
    const initialLen = memoryState.tasks.length;
    memoryState.tasks = memoryState.tasks.filter((t: any) => t.id !== req.params.id);
    if (memoryState.tasks.length === initialLen) {
      return res.status(404).json({ error: "Task not found" });
    }
    scheduleSaveDatabase();
    res.json({ success: true, deletedId: req.params.id });
  });

  // ==========================================
  // TIMETABLE / SCHEDULE BLOCKS CRUD
  // ==========================================

  app.get("/api/schedule-blocks", (req: Request, res: Response) => {
    let blocks = [...memoryState.scheduleBlocks];
    if (req.query.dayOfWeek !== undefined) {
      const day = parseInt(req.query.dayOfWeek as string, 10);
      blocks = blocks.filter(b => b.dayOfWeek === day);
    }
    res.json(blocks);
  });

  app.post("/api/schedule-blocks", (req: Request, res: Response) => {
    const { dayOfWeek, startTime, endTime, subjectId, title, topic, roomOrLink } = req.body;
    if (dayOfWeek === undefined || !startTime || !endTime || !subjectId || !title) {
      return res.status(400).json({ error: "dayOfWeek, startTime, endTime, subjectId, and title are required" });
    }

    const newBlock = {
      id: `sb-${Date.now()}`,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      subjectId,
      title,
      topic: topic || '',
      completed: false,
      roomOrLink: roomOrLink || undefined
    };

    memoryState.scheduleBlocks.push(newBlock);
    scheduleSaveDatabase();
    res.status(201).json(newBlock);
  });

  app.put("/api/schedule-blocks/:id", (req: Request, res: Response) => {
    const index = memoryState.scheduleBlocks.findIndex((b: any) => b.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Schedule block not found" });

    memoryState.scheduleBlocks[index] = {
      ...memoryState.scheduleBlocks[index],
      ...req.body,
      id: req.params.id
    };
    scheduleSaveDatabase();
    res.json(memoryState.scheduleBlocks[index]);
  });

  app.patch("/api/schedule-blocks/:id/toggle", (req: Request, res: Response) => {
    const block = memoryState.scheduleBlocks.find((b: any) => b.id === req.params.id);
    if (!block) return res.status(404).json({ error: "Block not found" });

    block.completed = !block.completed;
    scheduleSaveDatabase();
    res.json({ success: true, block });
  });

  app.delete("/api/schedule-blocks/:id", (req: Request, res: Response) => {
    memoryState.scheduleBlocks = memoryState.scheduleBlocks.filter((b: any) => b.id !== req.params.id);
    scheduleSaveDatabase();
    res.json({ success: true });
  });

  // ==========================================
  // FLASHCARDS CRUD & LEITNER REPETITION
  // ==========================================

  app.get("/api/flashcards", (req: Request, res: Response) => {
    let cards = [...memoryState.flashcards];
    if (req.query.subjectId) {
      cards = cards.filter(c => c.subjectId === req.query.subjectId);
    }
    if (req.query.boxLevel) {
      const box = parseInt(req.query.boxLevel as string, 10);
      cards = cards.filter(c => c.boxLevel === box);
    }
    res.json(cards);
  });

  app.post("/api/flashcards", (req: Request, res: Response) => {
    const { subjectId, topic, front, back, hint } = req.body;
    if (!subjectId || !front || !back) {
      return res.status(400).json({ error: "subjectId, front, and back are required" });
    }

    const newCard = {
      id: `fc-${Date.now()}`,
      subjectId,
      topic: topic || 'General',
      front,
      back,
      hint: hint || undefined,
      boxLevel: 1,
      reviewCount: 0,
      lastReviewed: undefined
    };

    memoryState.flashcards.unshift(newCard);
    scheduleSaveDatabase();
    res.status(201).json(newCard);
  });

  app.post("/api/flashcards/:id/review", (req: Request, res: Response) => {
    const { rating } = req.body; // 'again' | 'hard' | 'good' | 'easy'
    const card = memoryState.flashcards.find((c: any) => c.id === req.params.id);
    if (!card) return res.status(404).json({ error: "Flashcard not found" });

    let newBox = card.boxLevel;
    if (rating === 'again') newBox = 1;
    else if (rating === 'hard') newBox = Math.max(1, card.boxLevel);
    else if (rating === 'good') newBox = Math.min(5, card.boxLevel + 1);
    else if (rating === 'easy') newBox = Math.min(5, card.boxLevel + 2);

    card.boxLevel = newBox;
    card.reviewCount = (card.reviewCount || 0) + 1;
    card.lastReviewed = new Date().toISOString().split('T')[0];

    scheduleSaveDatabase();
    res.json({ success: true, card });
  });

  app.delete("/api/flashcards/:id", (req: Request, res: Response) => {
    memoryState.flashcards = memoryState.flashcards.filter((c: any) => c.id !== req.params.id);
    scheduleSaveDatabase();
    res.json({ success: true });
  });

  // ==========================================
  // STUDY SESSIONS & STREAKS
  // ==========================================

  app.get("/api/sessions", (req: Request, res: Response) => {
    let list = [...memoryState.sessions];
    if (req.query.subjectId) {
      list = list.filter(s => s.subjectId === req.query.subjectId);
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    res.json(list.slice(0, limit));
  });

  app.post("/api/sessions", (req: Request, res: Response) => {
    const { subjectId, subjectName, topicTitle, durationMinutes, type, focusRating, notes, date } = req.body;
    if (!subjectId || !durationMinutes) {
      return res.status(400).json({ error: "subjectId and durationMinutes are required" });
    }

    const newSession = {
      id: `sess-${Date.now()}`,
      subjectId,
      subjectName: subjectName || undefined,
      topicTitle: topicTitle || undefined,
      date: date || new Date().toISOString(),
      durationMinutes: Number(durationMinutes),
      type: type || 'pomodoro',
      focusRating: focusRating ? Number(focusRating) : 5,
      notes: notes || ''
    };

    // Calculate streak
    const todayStr = new Date().toISOString().split('T')[0];
    const lastDate = memoryState.streak?.lastDate;

    let newCurrent = memoryState.streak?.current || 0;
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

    const newLongest = Math.max(newCurrent, memoryState.streak?.longest || 1);

    memoryState.streak = {
      current: newCurrent,
      longest: newLongest,
      lastDate: todayStr
    };

    memoryState.sessions.unshift(newSession);
    scheduleSaveDatabase();
    res.status(201).json({ session: newSession, streak: memoryState.streak });
  });

  // ==========================================
  // ANALYTICS COMPUTATION ENDPOINT
  // ==========================================

  app.get("/api/analytics", (_req: Request, res: Response) => {
    const sessions = memoryState.sessions;
    const subjects = memoryState.subjects;

    const totalMinutes = sessions.reduce((acc: number, s: any) => acc + (s.durationMinutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    // By subject distribution
    const subjectMinutesMap: Record<string, number> = {};
    sessions.forEach((s: any) => {
      subjectMinutesMap[s.subjectId] = (subjectMinutesMap[s.subjectId] || 0) + (s.durationMinutes || 0);
    });

    const subjectBreakdown = subjects.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      code: sub.code,
      color: sub.accentColor,
      hours: Math.round(((subjectMinutesMap[sub.id] || 0) / 60) * 10) / 10,
      goalHours: sub.goalHoursPerWeek,
      completedTopics: sub.topics.filter((t: any) => t.completed).length,
      totalTopics: sub.topics.length,
      progressPercent: sub.topics.length > 0 ? Math.round((sub.topics.filter((t: any) => t.completed).length / sub.topics.length) * 100) : 0
    }));

    // Daily focus hours for last 7 days
    const dailyStats: { date: string; day: string; hours: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      const dayMins = sessions
        .filter((s: any) => s.date && s.date.startsWith(dateStr))
        .reduce((acc: number, s: any) => acc + (s.durationMinutes || 0), 0);

      dailyStats.push({
        date: dateStr,
        day: dayName,
        hours: Math.round((dayMins / 60) * 10) / 10
      });
    }

    res.json({
      totalHours,
      totalSessions: sessions.length,
      streak: memoryState.streak,
      subjectBreakdown,
      dailyStats,
      flashcardsMastered: memoryState.flashcards.filter((f: any) => f.boxLevel >= 5).length,
      totalFlashcards: memoryState.flashcards.length,
      completedTasks: memoryState.tasks.filter((t: any) => t.completed).length,
      pendingTasks: memoryState.tasks.filter((t: any) => !t.completed).length,
    });
  });

  // ==========================================
  // SETTINGS ENDPOINTS
  // ==========================================

  app.get("/api/settings", (_req: Request, res: Response) => {
    res.json(memoryState.settings);
  });

  app.put("/api/settings", (req: Request, res: Response) => {
    memoryState.settings = { ...memoryState.settings, ...req.body };
    scheduleSaveDatabase();
    res.json(memoryState.settings);
  });

  // ==========================================
  // AI STRATEGY & COGNITIVE LOGIC ENDPOINTS
  // ==========================================

  // AI Study Plan Generator
  app.post("/api/ai/study-plan", async (req: Request, res: Response) => {
    try {
      const { subjects, examTarget, dailyHours, targetGrade, currentLevel, notes } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
          fallback: true
        });
      }

      const prompt = `You are an elite academic tutor and cognitive science study strategist.
Create an optimized, realistic, and highly motivating study plan for a student.
Parameters:
- Subjects & Topics: ${JSON.stringify(subjects || memoryState.subjects)}
- Target Exam / Goal: ${examTarget || "Upcoming Semester Finals"}
- Daily Study Capacity: ${dailyHours || 4} hours/day
- Target Goal: ${targetGrade || "Top Marks / Mastery"}
- Current Understanding: ${currentLevel || "Intermediate"}
- Additional Context: ${notes || "None"}

Respond strictly in valid JSON with no markdown formatting around it, matching this schema:
{
  "summary": "Brief 2-sentence encouraging summary of the strategy",
  "recommendedDailyRhythm": "e.g. 2 x 50min blocks + 1 x 25min revision block",
  "strategies": ["Key study technique 1", "Key study technique 2", "Key study technique 3"],
  "scheduleBlocks": [
    {
      "id": "block-1",
      "day": "Monday",
      "subject": "Subject Name",
      "topic": "Specific Topic",
      "durationMinutes": 60,
      "technique": "Active Recall / Practice Problems / Feynman Technique / Blurting",
      "priority": "high"
    }
  ],
  "milestones": [
    {
      "title": "Phase 1: Foundation & Core Concepts",
      "targetDays": "Days 1-7",
      "goal": "Master high-yield fundamentals"
    },
    {
      "title": "Phase 2: Deep Practice & Past Papers",
      "targetDays": "Days 8-14",
      "goal": "Timed problem solving and error log reviews"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response from AI");
      }
      const data = JSON.parse(text);
      res.json(data);
    } catch (err: any) {
      console.error("AI Study Plan Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate study plan" });
    }
  });

  // AI Flashcards Generator
  app.post("/api/ai/flashcards", async (req: Request, res: Response) => {
    try {
      const { topic, subject, count = 6, notes } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
          fallback: true
        });
      }

      const prompt = `Create ${count} high-yield active recall flashcards for Subject: "${subject || 'General'}" on Topic: "${topic}".
Notes/Context: ${notes || 'Standard curriculum essentials'}

Focus on conceptual understanding, key definitions, application problems, and common pitfalls.
Format strictly as valid JSON:
{
  "flashcards": [
    {
      "id": "fc-1",
      "front": "Clear, direct question or concept challenge",
      "back": "Concise, precise explanation or formula with bullet points if helpful",
      "hint": "Brief memory cue or hint"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (!text) throw new Error("No text returned");
      const data = JSON.parse(text);
      res.json(data);
    } catch (err: any) {
      console.error("AI Flashcards Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate flashcards" });
    }
  });

  // AI Concept Explainer (Feynman technique)
  app.post("/api/ai/explain", async (req: Request, res: Response) => {
    try {
      const { concept, subject, level = "simple" } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.status(503).json({ error: "Gemini API key not configured." });
      }

      const prompt = `Explain the following concept using the Feynman Technique and vivid intuitive analogies:
Concept: "${concept}"
Subject: "${subject || 'General'}"
Target Level: "${level}" (ELI5 / High School / College)

Respond strictly in JSON format:
{
  "title": "${concept}",
  "oneSentenceHook": "Intuitive 1-sentence analogy or summary",
  "breakdown": [
    {
      "heading": "Core Idea",
      "body": "Clear step by step explanation"
    },
    {
      "heading": "Real-World Analogy",
      "body": "Everyday analogy that makes it unforgettable"
    },
    {
      "heading": "Common Misconception",
      "body": "What students often get wrong"
    }
  ],
  "quickCheckQuestion": "A quick 1-question self-test to check understanding",
  "quickCheckAnswer": "The answer"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response text");
      res.json(JSON.parse(text));
    } catch (err: any) {
      console.error("AI Explain Error:", err);
      res.status(500).json({ error: err.message || "Failed to explain concept" });
    }
  });

  // AI Quick Tips
  app.post("/api/ai/quick-tips", async (req: Request, res: Response) => {
    try {
      const { subject, examDaysLeft } = req.body;
      const ai = getAIClient();
      if (!ai) {
        return res.json({
          tips: [
            "Use the 20-minute blurting technique: write everything you recall onto a blank sheet.",
            "Solve 3 practice exam questions under strict timed conditions.",
            "Review your hardest Leitner flashcards before going to sleep to maximize memory consolidation."
          ]
        });
      }

      const prompt = `Provide 3 immediate, high-impact study tactics for subject: "${subject || 'General Studies'}" with ${examDaysLeft || 14} days left until the exam. Output strictly JSON: {"tips": ["tip1", "tip2", "tip3"]}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text || '{"tips": []}'));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Study Planner Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
