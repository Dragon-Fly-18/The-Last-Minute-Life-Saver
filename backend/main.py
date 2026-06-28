import json
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.auth.exceptions import RefreshError
from googleapiclient.errors import HttpError
from gemini import ask_gemini, ask_gemini_json
from calendar_service import create_event


app = FastAPI()


# React frontend connection allow
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskRequest(BaseModel):
    task: str


class PredictRequest(BaseModel):
    task: str
    deadline: Optional[str] = None


class CalendarRequest(BaseModel):
    access_token: str
    title: str
    date: str


# Test backend
@app.get("/")
def home():
    return {
        "message": "AI Life Saver Backend Running 🚀"
    }


# AI Task Planner
@app.post("/ai")
def ai_planner(data: TaskRequest):
    print("AI REQUEST RECEIVED")
    print(data.task)

    prompt = f"""
You are an AI productivity assistant.

Analyze this task:

{data.task}

Give response only in this format:

Priority:
(High/Medium/Low)

Reason:

Action Plan:
1.
2.
3.

Deadline Advice:

Keep the answer short and practical.
"""

    result = ask_gemini(prompt)

    return {
        "AI response": result
    }


# Smart Priority Prediction
@app.post("/predict-priority")
def predict_priority(data: PredictRequest):
    print("PRIORITY PREDICTION REQUEST")
    print(f"Task: {data.task}")
    print(f"Deadline: {data.deadline}")

    deadline_context = ""
    if data.deadline:
        deadline_context = f"\nThe deadline for this task is: {data.deadline}.\nFactor the deadline urgency into your priority and confidence score."

    prompt = f"""You are an expert productivity coach and task-priority analyst.

Analyze this task and predict its priority level.

Task: "{data.task}"
{deadline_context}

Return a JSON object with exactly these keys:
{{
  "priority": "High" or "Medium" or "Low",
  "confidence": a number from 0 to 100 representing how confident you are,
  "reason": a clear 1-2 sentence explanation of why you chose this priority,
  "tips": an array of 2-3 short, actionable productivity tips specific to this task
}}

Priority Guidelines:
- HIGH: Deadline within 24 hours, mission-critical work, blockers for others, exams, presentations, urgent client work.
- MEDIUM: Deadline within 2-7 days, important but not urgent, regular assignments, team tasks.
- LOW: No tight deadline, nice-to-have, personal learning, optional improvements, routine admin.

Be specific to the task. Do not give generic advice."""

    raw = ask_gemini_json(prompt)

    if raw is None:
        return {"error": "AI service unavailable"}

    try:
        result = json.loads(raw)
        # Validate expected keys
        for key in ("priority", "confidence", "reason", "tips"):
            if key not in result:
                return {"error": f"Missing key: {key}"}
        return result
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response"}


# AI Task Breakdown
@app.post("/breakdown")
def task_breakdown(data: TaskRequest):
    print("TASK BREAKDOWN REQUEST")
    print(f"Task: {data.task}")

    prompt = f"""You are an expert project manager. Break down the following task into 3-5 clear, actionable subtasks.

Task: "{data.task}"

Return a JSON object with a single key "subtasks" containing a list of strings representing the steps.

Example:
{{
  "subtasks": [
    "Dataset collect",
    "Train model",
    "Test accuracy",
    "Prepare report"
  ]
}}
"""

    raw = ask_gemini_json(prompt)

    if raw is None:
        return {"error": "AI service unavailable"}

    try:
        result = json.loads(raw)
        if "subtasks" not in result:
            return {"error": "Missing key: subtasks"}
        return result
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response"}


# Calendar
@app.post("/calendar")
def add_calendar_event(data: CalendarRequest):
    try:
        # Clean the token in case it was pasted with quotes or "Bearer " in docs
        token = data.access_token.strip().strip('"').strip("'")
        if token.lower().startswith("bearer "):
            token = token[7:].strip()

        event = create_event(
            token,
            data.title,
            data.date
        )

        return {
            "message": "Event created successfully",
            "event": event
        }
    except RefreshError:
        return {"error": "Invalid or expired access token. Please authenticate again. Ensure you are using the Google Calendar Access Token, not a Firebase ID token."}
    except HttpError as e:
        return {"error": f"Google Calendar API Error: {e.reason}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}"}


# AI Productivity Score
from productivity import calculate_productivity_score

class ProductivityRequest(BaseModel):
    tasks: list
    habits: Optional[list] = None

@app.post("/productivity")
def get_productivity_analysis(data: ProductivityRequest):
    stats = calculate_productivity_score(data.tasks)

    # Build habit context for the AI prompt
    habits = data.habits or []
    total_habits = len(habits)
    active_habits = 0
    streak_days = 0

    if habits:
        from datetime import datetime, timedelta

        today = datetime.now().date()
        # Count habits that have at least one completion this week
        monday = today - timedelta(days=today.weekday())
        for habit in habits:
            completed_days = habit.get("completedDays", {})
            for date_str, is_done in completed_days.items():
                if is_done:
                    try:
                        d = datetime.strptime(date_str, "%Y-%m-%d").date()
                        if monday <= d <= today:
                            active_habits += 1
                            break
                    except ValueError:
                        pass

        # Calculate streak: consecutive days (backwards from today) with any completion
        all_completed_dates = set()
        for habit in habits:
            for date_str, is_done in habit.get("completedDays", {}).items():
                if is_done:
                    all_completed_dates.add(date_str)
        # Also count task completion dates
        for task in data.tasks:
            if str(task.get("status", "")).strip().lower() == "completed" and task.get("completedAt"):
                try:
                    d = datetime.fromisoformat(task["completedAt"].rstrip("Z").split(".")[0])
                    all_completed_dates.add(d.strftime("%Y-%m-%d"))
                except (ValueError, AttributeError):
                    pass

        check = today
        while check.strftime("%Y-%m-%d") in all_completed_dates:
            streak_days += 1
            check = check - timedelta(days=1)
        # If today has no completions yet, check from yesterday
        if streak_days == 0:
            check = today - timedelta(days=1)
            while check.strftime("%Y-%m-%d") in all_completed_dates:
                streak_days += 1
                check = check - timedelta(days=1)

    habit_context = ""
    if total_habits > 0:
        habit_context = f"""
- Total Habits Tracked: {total_habits}
- Active Habits This Week: {active_habits}/{total_habits}
- Current Productivity Streak: {streak_days} day(s)"""

    # Generate quick personalized AI coaching tip from Gemini
    prompt = f"""You are a helpful and direct AI productivity coach. 
Analyze the user's current task stats:
- Productivity Score: {stats['score']}%
- Completion Rate: {stats['completion_rate']}% ({stats['completed_tasks']}/{stats['total_tasks']} tasks completed)
- High Priority Pending Tasks: {stats['high_priority_pending']}
- Overdue Tasks: {stats['overdue_tasks']}{habit_context}

Write a single-sentence, highly actionable and direct piece of advice/encouragement (under 25 words).
Focus on what they should do next (e.g. tackle high priority tasks, address overdue ones, maintain their habit streak, or celebrate if they are doing great).
Do not be generic. Keep it short."""

    try:
        ai_tip = ask_gemini(prompt)
        if not ai_tip or ai_tip.strip() == "":
            ai_tip = "Keep up the momentum and focus on your high-priority items!"
        else:
            ai_tip = ai_tip.strip()
    except Exception:
        ai_tip = "Stay focused! Tackling high-priority tasks first will keep you on track."

    return {
        "stats": stats,
        "ai_tip": ai_tip
    }


# Smart Reminder System
from remainder_service import get_reminders_from_tasks

class RemindersRequest(BaseModel):
    tasks: list
    client_date: Optional[str] = None

@app.post("/reminders")
def check_tasks_reminders(data: RemindersRequest):
    return get_reminders_from_tasks(data.tasks, data.client_date)