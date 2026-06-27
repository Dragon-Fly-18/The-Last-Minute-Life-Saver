from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime, timedelta

SCOPES = [
    "https://www.googleapis.com/auth/calendar.events"
]

def _ensure_valid_date(date_str):
    try:
        if "T" in date_str or ":" in date_str:
            return "dateTime", date_str
        else:
            datetime.strptime(date_str, "%Y-%m-%d")
            return "date", date_str
    except Exception:
        # Fallback to tomorrow if parsing fails
        now = datetime.utcnow() + timedelta(days=1)
        return "dateTime", now.isoformat() + "Z"

def create_event(access_token, title, date):
    creds = Credentials(token=access_token)

    service = build(
        "calendar",
        "v3",
        credentials=creds
    )

    time_key, valid_date = _ensure_valid_date(date)

    event = {
        "summary": title,
        "description": "Created from Last Minute Life Saver AI",
        "start": {
            time_key: valid_date
        },
        "end": {
            time_key: valid_date
        }
    }

    created_event = service.events().insert(
        calendarId="primary",
        body=event
    ).execute()

    return created_event


def update_event(access_token, event_id, title, date):
    creds = Credentials(token=access_token)

    service = build(
        "calendar",
        "v3",
        credentials=creds
    )

    time_key, valid_date = _ensure_valid_date(date)

    event = {
        "summary": title,
        "description": "Updated from Last Minute Life Saver AI",
        "start": {
            time_key: valid_date
        },
        "end": {
            time_key: valid_date
        }
    }

    updated_event = service.events().update(
        calendarId="primary",
        eventId=event_id,
        body=event
    ).execute()

    return updated_event


def delete_event(access_token, event_id):
    creds = Credentials(token=access_token)

    service = build(
        "calendar",
        "v3",
        credentials=creds
    )

    service.events().delete(
        calendarId="primary",
        eventId=event_id
    ).execute()

    return {"status": "success", "message": f"Event {event_id} deleted successfully"}
