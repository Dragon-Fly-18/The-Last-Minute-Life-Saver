from datetime import datetime, date, timedelta
from productivity import parse_deadline

def get_reminders_from_tasks(tasks: list, client_date_str: str = None) -> list:
    """
    Analyzes pending tasks and returns a list of notifications for deadlines
    that are due today or tomorrow relative to the client's current local date.
    """
    reminders = []
    
    # 1. Establish client current local date/time
    if client_date_str:
        try:
            # client_date_str is ISO format, e.g. "2026-06-28T12:25:03+05:30"
            # Strip offset if needed, or parse using datetime.fromisoformat
            # Python 3.7+ fromisoformat handles +HH:MM offsets
            # If offset ends in Z, replace it
            clean_str = client_date_str.replace('Z', '+00:00')
            now_client = datetime.fromisoformat(clean_str)
        except Exception as e:
            print(f"Error parsing client_date_str: {e}")
            now_client = datetime.now()
    else:
        now_client = datetime.now()

    today = now_client.date()
    tomorrow = today + timedelta(days=1)
    
    for task in tasks:
        # Check task completion status
        status = str(task.get("status", "Pending")).strip().lower()
        if status == "completed":
            continue
            
        deadline_str = task.get("deadline")
        if not deadline_str:
            continue
            
        dt = parse_deadline(deadline_str)
        if not dt:
            continue
            
        task_date = dt.date()
        task_title = task.get("title", "Untitled Task")
        
        if task_date == tomorrow:
            reminders.append({
                "id": task.get("id"),
                "title": task_title,
                "deadline": deadline_str,
                "priority": task.get("priority", "Medium"),
                "message": f"⏰ Reminder: \"{task_title} deadline tomorrow\"",
                "type": "tomorrow"
            })
        elif task_date == today:
            reminders.append({
                "id": task.get("id"),
                "title": task_title,
                "deadline": deadline_str,
                "priority": task.get("priority", "Medium"),
                "message": f"🔥 Urgent: \"{task_title} deadline today\"",
                "type": "today"
            })
            
    return reminders
