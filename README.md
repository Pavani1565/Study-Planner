# Study Planner

A full-stack study planning and productivity application designed to help students organize their academic work, manage study schedules, track focus sessions, and monitor learning progress.

## Features

* Dashboard with daily study progress and upcoming exams
* Subject and syllabus management
* Study task and assignment management
* Weekly timetable and study scheduling
* Pomodoro and focus timer
* Study session and streak tracking
* Flashcards with spaced repetition
* AI-powered study plan and concept explanations
* Subject-wise and weekly analytics
* 28-day study activity tracking
* Ambient focus sounds
* Data export and import
* Persistent backend storage
* Responsive and animated user interface

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* Lucide React

### Backend

* Node.js
* Express.js
* TypeScript
* REST API

### AI

* Gemini API

### Storage

* JSON-based persistent storage

## Project Structure

```text
study-planner/
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── utils/
│   ├── types.ts
│   ├── App.tsx
│   └── index.css
├── data/
│   └── study-db.json
├── server.ts
├── package.json
└── README.md
```

## Getting Started

### Clone the repository

```bash
git clone https://github.com/your-username/study-planner.git
cd study-planner
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file and add the required API configuration:

```env
GEMINI_API_KEY=your_api_key
```

### Run the application

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Backend API

The application provides REST APIs for:

* Subjects and topics
* Tasks
* Timetable and schedules
* Flashcards
* Study sessions
* Analytics
* Settings
* Data synchronization
* AI study services

## Data Persistence

The application supports real user data rather than being limited to demo content. Subjects, tasks, schedules, flashcards, study sessions, and other application data are persisted through the backend.

Users can also export and import their study data for backup and restoration.

## Purpose

The goal of Study Planner is to provide students with a single platform for planning their studies, maintaining consistent study habits, preparing for examinations, and understanding their academic progress.

## Project Status

Active Development

## Author

Pavani

Computer Science and Systems Engineering
