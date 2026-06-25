import json
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from gemini import ask_gemini, ask_gemini_json


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