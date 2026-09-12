Hiiiii 👋🏻 

# Plannix (Your Task Manager)

> **Plannix** is an intelligent, real-time daily task and deadline manager featuring automated midnight rollover, seamless multi-device cloud synchronization, interactive progress analytics, timeline organizing, and immersive atmospheric themes.

---

## ✨ Features

- 🔄 **Real-Time Cross-Device Sync**: Create tasks on your phone and see them instantly appear on your laptop in real time via Firebase Firestore listeners (`onSnapshot`).
- 🌙 **Automated Midnight Rollover**: Tasks marked incomplete by 11:59:59 PM roll over into "Missed" status automatically, with full support for "Completed Late" check-offs.
- 📊 **Progress & Analytics Dashboard**: Track daily completion rates, on-time vs. late stats, active streaks, and comprehensive history logs for every task.
- 📅 **Interactive Timeline Organizer**: Organize, schedule, and distribute future tasks across upcoming dates with visual workload indicators.
- 🎨 **Atmospheric Themes & Particle Canvas**: Choose between interactive themes (Volcano, Galaxy, Cherry Blossom, Ocean) featuring custom ambient particle canvas backdrops.
- 🔐 **Secure Multi-User Isolation**: Seamless Google Authentication and Email/Password sign-in with complete privacy and account-partitioned cloud storage.
- 📦 **Export / Import**: Full offline caching via IndexedDB / LocalStorage, with JSON export and import capabilities.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **Backend & Database**: Firebase Firestore, Firebase Authentication
- **Deployment**: Vercel / Cloud Run (Single Page Application configuration)
