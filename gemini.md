# Project Instructions - The Last-Minute Life Saver

## Project Overview

Build an AI-powered productivity companion that helps students, professionals, and entrepreneurs manage tasks, prioritize work, and complete deadlines on time.

The application should move beyond simple reminders and provide AI-based productivity suggestions.


## Tech Stack

Frontend:
- React + Vite
- JavaScript
- Component-based architecture

Backend:
- FastAPI
- Python

Database:
- Firebase Firestore

AI:
- Google Gemini API


## Project Structure

Frontend:
- src/components -> reusable UI components
- src/pages -> application pages
- firebase.js -> Firebase configuration
- taskService.js -> Firestore operations


Backend:
- main.py -> API routes
- gemini.py -> Gemini AI integration
- .env -> API keys


## Development Rules

- Never expose API keys in frontend code.
- Always keep secrets inside .env files.
- Do not modify Firebase configuration unless required.
- Use reusable React components.
- Keep components small and clean.
- Follow existing folder structure.
- Avoid creating unnecessary files.


## Firebase Rules

- Use Firestore for storing tasks.
- Task data should contain:
  - title
  - deadline
  - priority
  - status

- Use service functions for database operations.


## AI Rules

- Gemini should provide:
  - Task prioritization
  - Productivity suggestions
  - Task breakdown plans

- AI responses should be clear and actionable.
- Avoid generic responses.


## UI Guidelines

- Create a modern productivity dashboard.
- Use clean cards and sections.
- Keep UI responsive.
- Maintain consistent spacing and design.


## Coding Style

- Use async/await for API calls.
- Add proper error handling.
- Keep code readable.
- Do not rewrite existing working code unnecessarily.


## Current Features

Completed:
- React setup
- FastAPI setup
- Firebase connection
- Task creation
- Task listing
- Task deletion
- Gemini API connection
- AI task planner
- Smart priority prediction
- AI Auto Task Breakdown
- Calendar integration
- AI Productivity Score
- Notification Reminder

Future Features:
- Habit tracking
- Voice assistant

UI Styles:
1️⃣ Skeuomorphism
2️⃣ Neomorphism
3️⃣ Glassmorphism
4️⃣ Claymorphism
5️⃣ Minimalism
6️⃣ Maximalism
7️⃣ Brutalism
8️⃣ Liquid Glass
9️⃣ Bento Grid
🔟 Spatial UI