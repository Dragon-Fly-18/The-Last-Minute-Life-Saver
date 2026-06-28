import { deleteTask } from "../taskService";
import CalendarSync from "./calendar";

/* ── Icons ───────────────────────────────────────────── */
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

/* ── Deadline Helpers ─────────────────────────────────── */
function parseDeadline(deadlineStr) {
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

const checkDeadlineStatus = (deadlineStr) => {
  if (!deadlineStr) return null;
  const dt = parseDeadline(deadlineStr);
  if (!dt) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const taskDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

  if (taskDate.getTime() === today.getTime()) {
    return "today";
  } else if (taskDate.getTime() === tomorrow.getTime()) {
    return "tomorrow";
  }
  return null;
};

/* ── Component ───────────────────────────────────────── */
function TaskCard({ task, onDelete, onToggleStatus }) {
  const isCompleted = (task.status || "Pending").toLowerCase() === "completed";
  const deadlineAlert = !isCompleted ? checkDeadlineStatus(task.deadline) : null;

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      if (onDelete) onDelete(task.id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div
      className={`task-row-card ${isCompleted ? "completed" : ""} ${
        deadlineAlert ? `due-${deadlineAlert}` : ""
      }`}
    >
      {/* Left side: Checkbox & Meta Info */}
      <div className="task-row-left">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => onToggleStatus(task.id, task.status || "Pending")}
          />
          <span className="checkmark"></span>
        </label>
        
        <div className="task-info">
          <h4 className="task-title-text">{task.title}</h4>
          
          <div className="task-meta">
            {task.deadline && (
              <span className="task-meta-item">
                📅 {task.deadline}
              </span>
            )}
            
            {task.priority && (
              <span className={`task-priority-tag ${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
            )}

            {/* Smart warning badges */}
            {deadlineAlert === "today" && (
              <span className="task-alert-tag due-today-tag">
                🔥 Due Today
              </span>
            )}
            {deadlineAlert === "tomorrow" && (
              <span className="task-alert-tag due-tomorrow-tag">
                ⏰ Due Tomorrow
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="task-row-actions">
        <CalendarSync taskTitle={task.title} taskDate={task.deadline || new Date().toISOString()} />
        <button
          className="tc-delete-btn"
          onClick={handleDelete}
          title="Delete task"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
