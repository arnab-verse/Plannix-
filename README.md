# Plannix (Your Task Manager) ⚡

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-ffca28.svg?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Author](https://img.shields.io/badge/Crafted_By-ArnabVerse-f59e0b.svg)](https://github.com/arnabverse)

> **A modern, responsive, deadline-aware daily task management and productivity powerhouse.** Features automatic midnight rollover, visual calendar history, velocity analytics, dynamic atmospheric themes, and AI timeline planning.

🌐 **Live Demo:** [https://plannix.pages.dev](https://plannix.pages.dev)  

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running Locally](#running-locally)
  - [Building for Production](#building-for-production)
- [Application Flow & Logic](#-application-flow--logic)
  - [Task Lifecycle & Deadline Engine](#task-lifecycle--deadline-engine)
  - [Midnight Rollover System](#midnight-rollover-system)
  - [AI Smart Schedule Planner](#ai-smart-schedule-planner)
- [Theming System](#-theming-system)
- [Scripts Reference](#-scripts-reference)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Author & Acknowledgments](#-author--acknowledgments)

---

## 🌟 Overview

**Plannix** is engineered to eliminate task overwhelm and procrastination through real-time urgency feedback, deterministic state machines, and intelligent calendar analytics. 

Unlike traditional to-do lists where past due items silently pile up into guilt-inducing backlogs, Plannix enforces strict deadline awareness:
1. Tasks have definitive daily assignments.
2. Completed items are verified as **On-Time** or **Late**.
3. Missed tasks automatically roll over at midnight with complete historical audit logs.
4. An integrated Google Gemini AI engine creates feasible, realistic time-blocked timelines.

---

## 🚀 Key Features

### 🎯 1. Deadline-Aware Daily Task Management
- **Status Engine**: Automatically categorizes tasks into `Pending`, `Completed On-Time`, `Completed Late`, or `Missed`.
- **Micro-Interactions**: Smooth checkboxes, swipe actions, priority tags (`High`, `Medium`, `Low`), and celebratory confetti animations upon daily completion.
- **Task Notes & Time Estimations**: Assign expected durations in minutes and track execution precision.

### 🌙 2. Automated Midnight Rollover
- Seamless daily transitions at `00:00` local time.
- Unfinished tasks from yesterday are automatically audited:
  - Transitioned to missed status or carried forward to today's schedule according to user rules.
  - Maintains chronological audit events in `historyLog` with timestamps.

### 📅 3. Visual Interactive Calendar & Heatmap
- Month-by-month calendar overview reflecting completion density.
- Color-coded badges indicating 100% on-time days, partial completions, or missed deadlines.
- Day click-through inspection: revisit any date in the past to view completed tasks and historical events.

### 📊 4. Productivity & Velocity Analytics
- **On-Time Rate vs. Late Rate**: Comprehensive breakdown of execution efficiency.
- **Completion Velocity**: Trend tracking over 7-day and 30-day windows.
- Metric filtering directly from dashboard cards.

### 🤖 5. AI Smart Schedule Organizer
- Powered by **Google Gemini 2.5 Flash**.
- Ingests pending tasks, duration estimates, priority levels, and user start time.
- Generates a mathematically balanced day timeline with break recommendations, buffer calculations, and deadline feasibility checks.

### 🎨 6. Atmospheric Themes & Visual Polish
- Four distinct atmospheric color spaces:
  - 🌌 **Galaxy** (Deep Cosmic Indigo & Violet)
  - 🌸 **Cherry Blossom** (Elegant Sakura Pink & Soft Rose)
  - 🌋 **Volcano** (Rich Crimson, Amber, and Fiery Slate)
  - 🌊 **Ocean** (Deep Marine Azure & Aqua)
- Solid Crimson non-transparent dropdown menu with crisp, zero-ghosting GPU rendering.
- Particle ambient canvas backdrop matching active theme dynamics.

### 🔐 7. Multi-Provider Authentication & Sync
- **Firebase Firestore & Authentication** integration.
- Fast guest mode with robust `localStorage` offline-first persistence.
- Persistent user profiles, account avatar popover, and cloud sync.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tooling** | [Vite 6](https://vitejs.dev/) + [ESBuild](https://esbuild.github.io/) + [TSX](https://github.com/privatenumber/tsx) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) with native modern CSS theme variables |
| **Animation & Motion** | [Motion (Framer Motion)](https://motion.dev/) & [Canvas-Confetti](https://github.com/catdad/canvas-confetti) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Backend & Proxy** | [Node.js](https://nodejs.org/) & [Express 4](https://expressjs.com/) |
| **Cloud Database & Auth** | [Google Firebase Firestore](https://firebase.google.com/docs/firestore) & [Firebase Auth](https://firebase.google.com/docs/auth) |
| **AI Schedule Engine** | [@google/genai](https://github.com/google/generative-ai-js) (Gemini 2.5 Flash) |

---

## 📂 Project Architecture

```plaintext
plannix/
├── public/
│   ├── favicon.svg              # SVG App Icon
│   └── og-image.png             # Social preview card
├── src/
│   ├── components/
│   │   ├── AtmosphericBackground.tsx  # Dynamic particle & gradient backdrop
│   │   ├── AuthView.tsx               # Login, registration, and credential flows
│   │   ├── CalendarView.tsx           # Monthly heatmap & historical date selector
│   │   ├── Header.tsx                 # Top navigation, metrics, theme selector
│   │   ├── HistoryView.tsx            # Chronological task audit timeline
│   │   ├── NavigationGrid.tsx         # Bottom/Mobile navigation dock
│   │   ├── OrganizeTasksModal.tsx     # Gemini AI timeline schedule generator
│   │   ├── SettingsView.tsx           # Rollover preferences, sound, theme options
│   │   ├── StatisticsView.tsx         # Visual charts, completion rates, graphs
│   │   ├── TaskItem.tsx               # Memoized interactive task row component
│   │   └── TodayDashboard.tsx         # Primary task list, quick-add, status tabs
│   ├── data/
│   │   └── initialTasks.ts            # Seed starter tasks & historical samples
│   ├── lib/
│   │   ├── firebase.ts                # Firebase client initialization
│   │   └── gemini.ts                  # Gemini API scheduling service client
│   ├── services/
│   │   └── taskStorage.ts             # Storage layer (Firestore + LocalStorage)
│   ├── utils/
│   │   ├── dateUtils.ts               # Local timezone date formatting & diffing
│   │   └── soundEffects.ts            # Optional UI audio feedback
│   ├── App.tsx                        # Master layout, state dispatchers, routing
│   ├── index.css                      # Tailwind v4 theme variables & custom utilities
│   ├── main.tsx                       # React DOM root entry point
│   └── types.ts                       # Shared TypeScript models & interfaces
├── server.ts                          # Express server with Vite middleware proxy
├── index.html                         # HTML entry with full SEO & Schema.org JSON-LD
├── package.json                       # Dependencies & build scripts
├── tsconfig.json                      # TypeScript strict compiler configuration
└── vite.config.ts                     # Vite bundler plugins & aliases

---

🚦 Getting Started

Prerequisites
Node.js: v18.0.0 or higher
npm: v9.0.0 or higher (or pnpm / yarn)
Installation
Clone the repository:
code
Bash
git clone https://github.com/your-username/plannix.git
cd plannix
Install project dependencies:
code
Bash
npm install
Environment Configuration
Create a .env file in the root directory (referencing .env.example):
code
Bash
cp .env.example .env
Add your API credentials:
code
Ini
# Google Gemini API Key for AI task organization
GEMINI_API_KEY="your-gemini-api-key"

# App URL (Optional for local development)
APP_URL="http://localhost:3000"

# Firebase Config (Optional for cloud sync; fallback to local storage if omitted)
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
Running Locally
Start the full-stack development server:
code
Bash
npm run dev
Open your browser and navigate to http://localhost:3000.
Building for Production
Compile both the client bundle and the server output:
code
Bash
npm run build
Preview the production build locally:
code
Bash
npm run start

---

🧠 Application Flow & Logic

Task Lifecycle & Deadline Engine
Each task follows a deterministic state model:

┌──────────────────────┐
           │   Task Created       │
           │  (status: pending)   │
           └──────────┬───────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[Before Midnight]           [After Midnight]
Completed?                  Task Incomplete?
  ├── YES ──► "completed_on_time"     └── YES ──► "missed"
  └── NO  ──► (rolls to next day)                   │
                                                    ▼
                                            User Completes Later
                                                    │
                                                    └──► "completed_late"

pending: Task assigned for today awaiting completion.
completed_on_time: Task marked completed before the midnight deadline of its scheduled date.
missed: Midnight passed and the task was still pending.
completed_late: A missed task completed after its original due date.
Midnight Rollover System
The application actively listens for date boundary changes using continuous client clock checking and system resumes. When midnight crosses:
Completed tasks freeze into historical snapshots.
Unfinished tasks trigger rollover handling: marked as missed in yesterday's record and rolled into today's backlog.
Statistics and calendar summaries update automatically without requiring manual page reload.
AI Smart Schedule Planner
Powered by Gemini 2.5 Flash, the schedule generator takes your daily tasks and organizes them into an optimized block schedule:
Priority Weighing: Places high-priority focus blocks earlier in the day.
Buffer Distribution: Inserts restorative 5–15 minute cognitive breaks between work periods.
Feasibility Indicator: Flags whether all assigned work can be completed before your chosen cutoff time.

---

🎨 Theming System

Plannix features an ergonomic, zero-flicker CSS variable theming engine. Themes can be changed on the fly from the header dropdown:
Theme	Class Identifier	Primary Tone	Description
Galaxy	data-theme="galaxy"	#8b5cf6	Deep celestial violet with neon starfield highlights
Cherry Blossom	data-theme="cherry_blossom"	#ec4899	Sakura blossom blush with warm pastel accents
Volcano	data-theme="volcano"	#f97316	Volcanic magma charcoal with vibrant amber & orange
Ocean	data-theme="ocean"	#06b6d4	Abyssal deep navy with bioluminescent cyan
The theme selector utilizes a custom solid crimson gradient dropdown (#990011) with anti-aliasing to ensure readable contrast on all display panels.

---

📜 Scripts Reference

npm run dev - Starts the development server with Hot Module Replacement and Express proxy.
npm run build - Builds production-optimized Vite static assets and bundles server.ts.
npm run start - Runs the bundled production server (dist/server.cjs).
npm run lint - Validates TypeScript types across the codebase with tsc --noEmit.
npm run clean - Cleans build output directories.

---

🚀 Deployment

Cloudflare Pages
Connect your GitHub repository to Cloudflare Pages.
Set Build command: npm run build
Set Build output directory: dist
Set Node version: >= 18.0.0
Configure environment variables in Cloudflare Pages dashboard (GEMINI_API_KEY, etc.).
Docker / Self-Hosted Node.js
code
Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start"]

---

📄 License
Distributed under the Apache License 2.0. See LICENSE for details.

