import { deleteTask } from "../taskService";
import CalendarSync from "./calendar";

/* ── Priority color map ─────────────────────────────── */
const PRIORITY_COLORS = {
  High:   { bg: "rgba(255, 59, 48, 0.15)", border: "rgba(255, 59, 48, 0.4)",  text: "#ff6b6b" },
  Medium: { bg: "rgba(255, 204, 0, 0.12)",  border: "rgba(255, 204, 0, 0.35)", text: "#ffd43b" },
  Low:    { bg: "rgba(52, 199, 89, 0.12)",  border: "rgba(52, 199, 89, 0.35)", text: "#69db7c" },
};

/* ── Icons ───────────────────────────────────────────── */
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/* ── Component ───────────────────────────────────────── */
function TaskCard({ task, onDelete }) {
  const colors = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium;

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      if (onDelete) onDelete(task.id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="tc-card">
      {/* Left section */}
      <div className="tc-info">
        <h4 className="tc-title">{task.title}</h4>

        <div className="tc-meta">
          {task.deadline && (
            <span className="tc-deadline">
              <ClockIcon />
              {task.deadline}
            </span>
          )}

          <span
            className="tc-priority-badge"
            style={{
              background: colors.bg,
              borderColor: colors.border,
              color: colors.text,
            }}
          >
            {task.priority || "—"}
          </span>

          <span className={`tc-status tc-status--${(task.status || "Pending").toLowerCase()}`}>
            {task.status || "Pending"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', marginTop: '15px' }}>
        <CalendarSync taskTitle={task.title} taskDate={task.deadline || new Date().toISOString()} />
        <button className="tc-delete-btn" onClick={handleDelete} title="Delete task" style={{
            backgroundColor: '#ff4d4d',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <TrashIcon /> Delete
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
