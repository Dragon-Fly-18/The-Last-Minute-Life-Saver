from datetime import datetime
import re

def parse_deadline(deadline_str: str):
    """
    Tries to parse various date formats for deadline checking.
    Returns a datetime object or None if parsing fails.
    """
    if not deadline_str or not isinstance(deadline_str, str):
        return None
    
    # Strip whitespace
    s = deadline_str.strip()
    if not s:
        return None
        
    # Try common formats
    # 1. ISO format (e.g. 2026-06-27T18:00:00.000Z or similar)
    if 'T' in s:
        try:
            # Strip Z if present, replace with offset or parse naive
            clean_s = s.rstrip('Z')
            # Only parse up to seconds/microsec
            return datetime.fromisoformat(clean_s.split('.')[0])
        except ValueError:
            pass

    # 2. YYYY-MM-DD
    match = re.match(r"^(\d{4})-(\d{2})-(\d{2})$", s)
    if match:
        try:
            return datetime.strptime(s, "%Y-%m-%d")
        except ValueError:
            pass
            
    # 3. DD-MM-YYYY or DD/MM/YYYY
    match = re.match(r"^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$", s)
    if match:
        day, month, year = match.groups()
        try:
            return datetime(int(year), int(month), int(day))
        except ValueError:
            pass

    # 4. YYYY/MM/DD
    match = re.match(r"^(\d{4})/(\d{2})/(\d{2})$", s)
    if match:
        try:
            return datetime.strptime(s, "%Y/%m/%d")
        except ValueError:
            pass

    # Fallback try-catch block for generic ISO-like
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        pass

    return None

def calculate_productivity_score(tasks: list):
    """
    Calculates a productivity score (0 - 100) and returns stats breakdown.
    Logic:
      - Completed / total tasks
      - High priority pending tasks (deduction)
      - Overdue tasks (deduction)
    """
    if not tasks:
        return {
            "score": 0,
            "total_tasks": 0,
            "completed_tasks": 0,
            "pending_tasks": 0,
            "high_priority_pending": 0,
            "overdue_tasks": 0,
            "completion_rate": 0.0
        }

    total_tasks = len(tasks)
    completed_tasks = 0
    pending_tasks = 0
    high_priority_pending = 0
    medium_priority_pending = 0
    overdue_tasks = 0

    now = datetime.now()

    for task in tasks:
        # Check completion
        # Firestore status can be case-insensitive, e.g. "Completed", "completed", "Pending", "pending"
        status = str(task.get("status", "Pending")).strip().lower()
        is_completed = status == "completed"

        if is_completed:
            completed_tasks += 1
        else:
            pending_tasks += 1
            # Priority checks for pending tasks
            priority = str(task.get("priority", "Low")).strip().lower()
            if priority == "high":
                high_priority_pending += 1
            elif priority == "medium":
                medium_priority_pending += 1
            
            # Overdue checks for pending tasks
            deadline_str = task.get("deadline")
            if deadline_str:
                dt = parse_deadline(deadline_str)
                if dt and dt < now:
                    overdue_tasks += 1

    # Base score is completed / total * 100
    completion_rate = (completed_tasks / total_tasks) * 100
    score = completion_rate

    # Deductions
    # -15 per overdue pending task
    # -10 per high priority pending task
    # -5 per medium priority pending task
    deductions = (overdue_tasks * 15) + (high_priority_pending * 10) + (medium_priority_pending * 5)
    
    final_score = max(0, min(100, round(score - deductions)))

    return {
        "score": final_score,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "high_priority_pending": high_priority_pending,
        "overdue_tasks": overdue_tasks,
        "completion_rate": round(completion_rate, 1)
    }
