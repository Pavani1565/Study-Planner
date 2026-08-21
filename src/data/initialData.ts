import { AppState, Subject, StudyTask, StudyBlock, Flashcard, StudySession } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
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
];

export const INITIAL_TASKS: StudyTask[] = [
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
];

export const INITIAL_SCHEDULE_BLOCKS: StudyBlock[] = [
  // Monday (1)
  { id: 'sb-1', dayOfWeek: 1, startTime: '09:00', endTime: '10:30', subjectId: 'sub-1', title: 'Calculus Practice & Problem Sets', topic: 'Optimization' },
  { id: 'sb-2', dayOfWeek: 1, startTime: '14:00', endTime: '15:30', subjectId: 'sub-2', title: 'Deep Learning Code Lab', topic: 'Attention heads' },
  // Tuesday (2)
  { id: 'sb-3', dayOfWeek: 2, startTime: '10:00', endTime: '11:30', subjectId: 'sub-3', title: 'Orgo Reaction Drills', topic: 'NMR Spectroscopy' },
  { id: 'sb-4', dayOfWeek: 2, startTime: '16:00', endTime: '17:30', subjectId: 'sub-4', title: 'Psychology Paper Summaries', topic: 'Cognitive Biases' },
  // Wednesday (3)
  { id: 'sb-5', dayOfWeek: 3, startTime: '09:00', endTime: '11:00', subjectId: 'sub-2', title: 'Deep Work: Neural Architecture', topic: 'Transformer Implementations' },
  { id: 'sb-6', dayOfWeek: 3, startTime: '15:00', endTime: '16:30', subjectId: 'sub-1', title: 'Vector Calculus', topic: "Green's Theorem" },
  // Thursday (4)
  { id: 'sb-7', dayOfWeek: 4, startTime: '11:00', endTime: '12:30', subjectId: 'sub-3', title: 'Organic Synthesis Review', topic: 'Aldol Condensation' },
  { id: 'sb-8', dayOfWeek: 4, startTime: '14:30', endTime: '16:00', subjectId: 'sub-2', title: 'Model Training & Hyperparams', topic: 'Adam Optimizer' },
  // Friday (5)
  { id: 'sb-9', dayOfWeek: 5, startTime: '10:00', endTime: '12:00', subjectId: 'sub-1', title: 'Weekly Math Exam Prep', topic: 'Lagrange Multipliers' },
  { id: 'sb-10', dayOfWeek: 5, startTime: '14:00', endTime: '15:30', subjectId: 'sub-4', title: 'Memory Research Review', topic: 'Active Recall Mechanisms' },
  // Saturday (6)
  { id: 'sb-11', dayOfWeek: 6, startTime: '10:30', endTime: '12:30', subjectId: 'sub-2', title: 'Weekend Project Sprint', topic: 'PyTorch Pipeline' },
  // Sunday (0)
  { id: 'sb-12', dayOfWeek: 0, startTime: '16:00', endTime: '17:30', subjectId: 'sub-3', title: 'Weekly Chemistry Flashcard Review', topic: 'Reactions Quiz' },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
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
];

export const INITIAL_SESSIONS: StudySession[] = [
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
];

export const INITIAL_APP_STATE: AppState = {
  subjects: INITIAL_SUBJECTS,
  tasks: INITIAL_TASKS,
  scheduleBlocks: INITIAL_SCHEDULE_BLOCKS,
  sessions: INITIAL_SESSIONS,
  flashcards: INITIAL_FLASHCARDS,
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
