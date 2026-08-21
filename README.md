# 📚 Study Planner

A modern, full-stack **Study Planner Application** designed to help students organize their academic workload, manage study tasks, track study hours, prepare for exams, and monitor their overall learning progress.

The application provides a personalized dashboard where students can manage subjects, create study tasks, set target study hours, schedule sessions, track completed work, and visualize their progress.

## ✨ Features

### 📊 Dashboard

* Overview of today's study activities
* Total study hours
* Completed tasks
* Pending tasks
* Upcoming exams
* Study progress statistics
* Daily and weekly progress visualization

### 📚 Subject Management

* Add new subjects
* Edit subject details
* Delete subjects
* Set target study hours for each subject
* Track progress for individual subjects

### ✅ Study Task Management

* Create study tasks
* Assign tasks to subjects
* Set priority levels
* Set deadlines
* Mark tasks as completed
* Edit and delete tasks
* Filter tasks by status and priority

### ⏱️ Study Session Tracking

* Start and stop study sessions
* Track actual study duration
* Record completed study sessions
* Compare actual hours with target hours
* Maintain study history

### 📅 Daily Study Schedule

* Plan study sessions for each day
* Assign subjects to time slots
* View today's schedule
* Track scheduled vs completed sessions

### 📝 Exam Management

* Add upcoming exams
* Set exam dates
* Associate exams with subjects
* Display upcoming exams
* Countdown to examinations

### 📈 Progress Dashboard

* Daily study hours
* Weekly study hours
* Subject-wise progress
* Task completion percentage
* Study consistency
* Visual charts and statistics

### 🎨 Modern Animated UI

* Responsive design
* Smooth page transitions
* Animated dashboard components
* Interactive cards
* Progress animations
* Loading animations
* Hover effects
* Mobile-friendly interface
* Dark/Light theme support

### 🔐 Authentication

* User registration
* User login
* Secure authentication
* Protected routes
* User-specific study data

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios
* Lucide React
* Framer Motion

### Backend

* Python
* FastAPI
* SQLAlchemy
* Uvicorn
* JWT Authentication
* Password Hashing

### Database

* SQLite

### Development Tools

* Git
* GitHub
* VS Code
* npm
* Python Virtual Environment

---

## 🏗️ Application Architecture

```text
                    ┌──────────────────────┐
                    │      Study Planner   │
                    │       Frontend       │
                    │   React + Vite       │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │       FastAPI        │
                    │       Backend        │
                    ├──────────────────────┤
                    │ Authentication       │
                    │ Subjects             │
                    │ Tasks                │
                    │ Study Sessions       │
                    │ Exams                │
                    │ Progress             │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       SQLite         │
                    │       Database       │
                    └──────────────────────┘
```

---

## 📁 Project Structure

```text
study-planner/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── database.py
│   │   ├── auth.py
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── README.md
└── .gitignore
```

---

## 🗄️ Database Design

The application can use the following primary entities:

### Users

```text
User
 ├── id
 ├── name
 ├── email
 ├── password_hash
 └── created_at
```

### Subjects

```text
Subject
 ├── id
 ├── user_id
 ├── name
 ├── description
 ├── target_hours
 └── created_at
```

### Tasks

```text
Task
 ├── id
 ├── user_id
 ├── subject_id
 ├── title
 ├── description
 ├── priority
 ├── due_date
 ├── status
 └── created_at
```

### Study Sessions

```text
StudySession
 ├── id
 ├── user_id
 ├── subject_id
 ├── start_time
 ├── end_time
 ├── duration
 └── created_at
```

### Exams

```text
Exam
 ├── id
 ├── user_id
 ├── subject_id
 ├── exam_name
 ├── exam_date
 └── description
```

### Study Schedule

```text
Schedule
 ├── id
 ├── user_id
 ├── subject_id
 ├── date
 ├── start_time
 ├── end_time
 └── status
```

---

## 🔄 Application Workflow

```text
Register / Login
       │
       ▼
    Dashboard
       │
       ├── Add Subjects
       │
       ├── Create Tasks
       │
       ├── Set Study Targets
       │
       ├── Add Exams
       │
       ├── Create Daily Schedule
       │
       └── Start Study Session
                    │
                    ▼
             Track Duration
                    │
                    ▼
            Complete Session
                    │
                    ▼
            Update Progress
                    │
                    ▼
            Progress Dashboard
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/study-planner.git

cd study-planner
```

### 2. Setup Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

### 3. Setup Backend

Open another terminal:

```bash
cd backend

python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

**Linux/macOS:**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend will run on:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend directory:

```env
DATABASE_URL=sqlite:///./study_planner.db
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Do not commit sensitive environment variables to GitHub.

---

## 🔐 Authentication Flow

```text
User
 │
 ▼
Login / Register
 │
 ▼
Password Hashing
 │
 ▼
JWT Token Generated
 │
 ▼
Token Stored on Client
 │
 ▼
Protected API Requests
 │
 ▼
Backend Validates JWT
 │
 ▼
User Data Returned
```

---

## 📱 Main Pages

| Page         | Purpose                    |
| ------------ | -------------------------- |
| Landing Page | Introduces the application |
| Login        | User authentication        |
| Register     | Create account             |
| Dashboard    | Overall study overview     |
| Subjects     | Manage subjects            |
| Tasks        | Manage study tasks         |
| Schedule     | Plan daily study sessions  |
| Study Timer  | Track study sessions       |
| Exams        | Manage upcoming exams      |
| Progress     | Analyze study performance  |
| Profile      | Manage user information    |

---

## 🎯 Goals of the Project

The main goal of Study Planner is to help students:

* Organize their academic workload
* Develop consistent study habits
* Manage deadlines effectively
* Track actual study time
* Prepare for upcoming examinations
* Identify subjects requiring more attention
* Visualize academic progress
* Improve time-management skills

---

## 🌟 Future Enhancements

Planned improvements include:

* 🤖 AI-powered study recommendations
* 📅 Automatic study-plan generation
* 🔔 Smart reminders and notifications
* 📊 Advanced analytics
* 🧠 Personalized revision recommendations
* 📱 Progressive Web App support
* ☁️ Cloud database integration
* 🔄 Real-time synchronization
* 🏆 Gamification and achievement badges
* 🔥 Study streak tracking
* 📤 Export study reports as PDF
* 🎯 AI-based exam preparation plans

---

## 🔒 Security

The application follows standard security practices including:

* JWT-based authentication
* Password hashing
* Protected API routes
* Environment variable configuration
* User-specific data access
* Input validation
* CORS configuration

---

## 📊 Example Dashboard Metrics

```text
┌─────────────────────────────────────────┐
│              STUDY DASHBOARD             │
├─────────────────────────────────────────┤
│                                         │
│  📚 Subjects        ✅ Tasks             │
│      6                  24               │
│                                         │
│  ⏱️ Study Hours      📝 Exams            │
│      18.5               3                │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│       Weekly Study Progress             │
│                                         │
│       ████████████████░░  82%           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 💡 Why This Project?

Students often struggle with:

* Poor time management
* Multiple academic deadlines
* Lack of study consistency
* Difficulty tracking study hours
* Exam preparation planning
* Understanding their learning progress

**Study Planner brings these activities into one centralized platform.**

---

## 📌 Project Status

🚧 **Active Development**

The project is being developed as a complete full-stack application with an interactive and animated user interface.

---

## 👩‍💻 Author

**Pavani**

Computer Science & Systems Engineering Student

---

## 📄 License

This project is created for educational and development purposes.

---

⭐ If you find this project useful, consider giving the repository a star!

