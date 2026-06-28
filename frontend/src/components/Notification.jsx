import { useState, useEffect, useRef } from "react";
import { updateTask } from "../taskService";

/* ── SVG Icons ───────────────────────────────────────────── */
const BellIcon = ({ hasUnread }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      animation: hasUnread ? "bellRing 2s ease infinite" : "none",
      filter: hasUnread ? "drop-shadow(0 0 8px rgba(255, 59, 48, 0.6))" : "none"
    }}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ── Local Date Helpers for Fallback ─────────────────────── */
function parseDeadlineLocal(deadlineStr) {
  if (!deadlineStr || typeof deadlineStr !== "string") return null;
  const s = deadlineStr.trim();
  if (!s) return null;

  if (s.includes("T")) {
    try {
      const clean = s.replace(/Z$/, "").split(".")[0];
      const d = new Date(clean);
      return Number.isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }

  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const d = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const d = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getLocalReminders(tasks) {
  const reminders = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  for (const task of tasks) {
    const status = String(task.status || "Pending").trim().toLowerCase();
    if (status === "completed") continue;
    
    const deadlineStr = task.deadline;
    if (!deadlineStr) continue;
    
    const dt = parseDeadlineLocal(deadlineStr);
    if (!dt) continue;
    
    const taskDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    
    if (taskDate.getTime() === tomorrow.getTime()) {
      reminders.push({
        id: task.id,
        title: task.title,
        deadline: deadlineStr,
        priority: task.priority || "Medium",
        message: `⏰ Reminder: "${task.title} deadline tomorrow"`,
        type: "tomorrow"
      });
    } else if (taskDate.getTime() === today.getTime()) {
      reminders.push({
        id: task.id,
        title: task.title,
        deadline: deadlineStr,
        priority: task.priority || "Medium",
        message: `🔥 Urgent: "${task.title} deadline today"`,
        type: "today"
      });
    }
  }
  return reminders;
}

/* ── Main Component ───────────────────────────────────────── */
export default function NotificationBell({ tasks }) {
  const [reminders, setReminders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [activeToasts, setActiveToasts] = useState([]);
  const [seenReminderIds, setSeenReminderIds] = useState(new Set());
  const dropdownRef = useRef(null);

  // 1. Fetch reminders from backend with local fallback
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setReminders([]);
      return;
    }

    const fetchReminders = async () => {
      try {
        const client_date = new Date().toISOString();
        const response = await fetch("http://127.0.0.1:8000/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks, client_date }),
        });
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setReminders(data);
        } else {
          setReminders(getLocalReminders(tasks));
        }
      } catch (err) {
        console.warn("Backend reminders failed, using local comparison fallback:", err);
        setReminders(getLocalReminders(tasks));
      }
    };

    fetchReminders();
  }, [tasks]);

  // 2. Trigger slide-in toast notifications for unseen active reminders
  useEffect(() => {
    if (reminders.length === 0) return;

    const newToasts = [];
    const updatedSeen = new Set(seenReminderIds);
    let hasNew = false;

    reminders.forEach((r) => {
      const key = `${r.id}-${r.type}`;
      // Only trigger toast if it hasn't been seen, and wasn't dismissed
      if (!seenReminderIds.has(key) && !dismissedIds.has(r.id)) {
        newToasts.push(r);
        updatedSeen.add(key);
        hasNew = true;
      }
    });

    if (hasNew) {
      setSeenReminderIds(updatedSeen);
      setActiveToasts((prev) => [...prev, ...newToasts]);

      // Dismiss each toast after 6 seconds
      newToasts.forEach((t) => {
        setTimeout(() => {
          setActiveToasts((prev) => prev.filter((item) => `${item.id}-${item.type}` !== `${t.id}-${t.type}`));
        }, 6000);
      });
    }
  }, [reminders, dismissedIds, seenReminderIds]);

  // 3. Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter out reminders that user dismissed
  const visibleReminders = reminders.filter((r) => !dismissedIds.has(r.id));
  const hasUnread = visibleReminders.length > 0;

  const handleDismiss = (id) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleComplete = async (id) => {
    try {
      await updateTask(id, { status: "Completed" });
      handleDismiss(id);
    } catch (err) {
      console.error("Failed to mark task as completed from reminder:", err);
    }
  };

  return (
    <div className="nb-wrapper" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        className={`nb-trigger-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        aria-label="View notifications"
        id="nb-trigger-btn"
      >
        <BellIcon hasUnread={hasUnread} />
        {hasUnread && (
          <span className="nb-badge">
            {visibleReminders.length}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Drawer */}
      {isOpen && (
        <div className="nb-dropdown">
          <div className="nb-header">
            <h4>Alerts & Reminders</h4>
            {hasUnread && (
              <button
                className="nb-dismiss-all-btn"
                onClick={() => visibleReminders.forEach((r) => handleDismiss(r.id))}
              >
                Clear all
              </button>
            )}
          </div>

          <div className="nb-body">
            {visibleReminders.length === 0 ? (
              <div className="nb-empty-state">
                <p>No active reminders. You are all caught up! 🎉</p>
              </div>
            ) : (
              visibleReminders.map((r) => (
                <div key={`${r.id}-${r.type}`} className={`nb-item nb-item--${r.type}`}>
                  <div className="nb-item-content">
                    <p className="nb-item-message">{r.message}</p>
                    <span className="nb-item-deadline">Due: {r.deadline}</span>
                  </div>
                  <div className="nb-item-actions">
                    <button
                      className="nb-action-btn nb-action-btn--complete"
                      title="Mark Completed"
                      onClick={() => handleComplete(r.id)}
                    >
                      <CheckIcon />
                    </button>
                    <button
                      className="nb-action-btn nb-action-btn--dismiss"
                      title="Dismiss"
                      onClick={() => handleDismiss(r.id)}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Toast Notification Stack */}
      <div className="nb-toast-container">
        {activeToasts.map((toast) => (
          <div key={`toast-${toast.id}-${toast.type}`} className={`nb-toast nb-toast--${toast.type}`}>
            <div className="nb-toast-body">
              <span className="nb-toast-title">Deadline Alert</span>
              <p className="nb-toast-message">{toast.message}</p>
            </div>
            <button
              className="nb-toast-close"
              onClick={() => setActiveToasts((prev) => prev.filter((item) => item.id !== toast.id))}
            >
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
