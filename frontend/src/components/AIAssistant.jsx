import { useState } from "react";
import { addTask } from "../taskService";

/* ── Icons ──────────────────────────────────────────── */
const SparkIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const BrainIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
    <line x1="9" y1="22" x2="15" y2="22" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const ListIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

/* ── Priority color map ─────────────────────────────── */
const PRIORITY_MAP = {
  High:   { color: "#ff6b6b", bg: "rgba(255, 59, 48, 0.15)", border: "rgba(255, 59, 48, 0.4)", emoji: "🔴" },
  Medium: { color: "#ffd43b", bg: "rgba(255, 204, 0, 0.12)",  border: "rgba(255, 204, 0, 0.35)", emoji: "🟡" },
  Low:    { color: "#69db7c", bg: "rgba(52, 199, 89, 0.12)",  border: "rgba(52, 199, 89, 0.35)", emoji: "🟢" },
};

/* ── Component ──────────────────────────────────────── */
function AIAssistant() {
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState("");

  // AI Plan state
  const [planResponse, setPlanResponse] = useState("");
  const [planLoading, setPlanLoading] = useState(false);

  // Priority prediction state
  const [prediction, setPrediction] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Task breakdown state
  const [breakdown, setBreakdown] = useState(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  /* ── Generate AI Plan ─────────────────────────────── */
  const getAIPlan = async () => {
    if (!task.trim()) return;
    setPlanLoading(true);
    setPlanResponse("");
    setPrediction(null);
    setBreakdown(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const data = await res.json();
      setPlanResponse(data["AI response"]);
    } catch {
      setPlanResponse("⚠️ Could not reach the AI service. Make sure the backend is running.");
    } finally {
      setPlanLoading(false);
    }
  };

  /* ── Predict Priority ─────────────────────────────── */
  const predictPriority = async () => {
    if (!task.trim()) return;
    setPredictLoading(true);
    setPrediction(null);
    setSaved(false);
    setPlanResponse("");
    setBreakdown(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/predict-priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, deadline: deadline || null }),
      });
      const data = await res.json();
      if (data.error) {
        setPlanResponse(`⚠️ ${data.error}`);
      } else {
        setPrediction(data);
      }
    } catch {
      setPlanResponse("⚠️ Could not reach the AI service. Make sure the backend is running.");
    } finally {
      setPredictLoading(false);
    }
  };

  /* ── Save predicted task to Firestore ──────────────── */
  const saveToTasks = async () => {
    if (!prediction || saved) return;
    try {
      await addTask({
        title: task,
        deadline: deadline || "",
        priority: prediction.priority,
        status: "Pending",
      });
      setSaved(true);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  /* ── Auto Task Breakdown ───────────────────────────── */
  const getTaskBreakdown = async () => {
    if (!task.trim()) return;
    setBreakdownLoading(true);
    setBreakdown(null);
    setPrediction(null);
    setPlanResponse("");
    try {
      const res = await fetch("http://127.0.0.1:8000/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const data = await res.json();
      if (data.error) {
        setPlanResponse(`⚠️ ${data.error}`);
      } else {
        setBreakdown(data.subtasks);
      }
    } catch {
      setPlanResponse("⚠️ Could not reach the AI service. Make sure the backend is running.");
    } finally {
      setBreakdownLoading(false);
    }
  };

  /* ── Render helpers ───────────────────────────────── */
  const pStyle = prediction ? PRIORITY_MAP[prediction.priority] || PRIORITY_MAP.Medium : null;

  return (
    <div className="ai-assistant-wrap">
      <p className="ai-assistant-sub">
        Get an instant productivity plan or predict task priority — powered by Gemini AI.
      </p>

      {/* ── Inputs ──────────────────────────────────── */}
      <input
        className="ai-task-input"
        placeholder="Describe your task…"
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />

      <input
        className="ai-task-input ai-deadline-input"
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />

      {/* ── Buttons ─────────────────────────────────── */}
      <div className="ai-btn-row">
        <button
          className={`ai-generate-btn${planLoading ? " ai-generate-btn--loading" : ""}`}
          onClick={getAIPlan}
          disabled={planLoading || !task.trim()}
        >
          <SparkIcon />
          {planLoading ? "Generating…" : "AI Plan"}
        </button>

        <button
          className={`ai-predict-btn${predictLoading ? " ai-predict-btn--loading" : ""}`}
          onClick={predictPriority}
          disabled={predictLoading || !task.trim()}
        >
          <BrainIcon />
          {predictLoading ? "Predicting…" : "Predict Priority"}
        </button>

        <button
          className={`ai-breakdown-btn${breakdownLoading ? " ai-breakdown-btn--loading" : ""}`}
          onClick={getTaskBreakdown}
          disabled={breakdownLoading || !task.trim()}
        >
          <ListIcon />
          {breakdownLoading ? "Breaking down…" : "Auto Breakdown"}
        </button>
      </div>

      {/* ── Prediction Card ─────────────────────────── */}
      {prediction && (
        <div className="pp-card">
          <div className="pp-header">
            <span className="pp-label">SMART PRIORITY PREDICTION</span>
          </div>

          {/* Priority Badge + Confidence */}
          <div className="pp-top-row">
            <span
              className="pp-badge"
              style={{ background: pStyle.bg, borderColor: pStyle.border, color: pStyle.text }}
            >
              {pStyle.emoji} {prediction.priority}
            </span>

            <div className="pp-confidence-wrap">
              <span className="pp-confidence-text">{prediction.confidence}% confident</span>
              <div className="pp-meter">
                <div
                  className="pp-meter-fill"
                  style={{
                    width: `${prediction.confidence}%`,
                    background: pStyle.color,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <p className="pp-reason">{prediction.reason}</p>

          {/* Tips */}
          {prediction.tips && prediction.tips.length > 0 && (
            <div className="pp-tips">
              <span className="pp-tips-label">Quick Tips</span>
              <ul className="pp-tips-list">
                {prediction.tips.map((tip, i) => (
                  <li key={i}>
                    <CheckIcon /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Save button */}
          <button
            className={`pp-save-btn${saved ? " pp-save-btn--saved" : ""}`}
            onClick={saveToTasks}
            disabled={saved}
          >
            <SaveIcon />
            {saved ? "Saved to Tasks ✓" : "Save to Tasks"}
          </button>
        </div>
      )}

      {/* ── Breakdown Card ─────────────────────────── */}
      {breakdown && (
        <div className="pp-card">
          <div className="pp-header">
            <span className="pp-label">AI TASK BREAKDOWN</span>
          </div>
          <ul className="pp-tips-list" style={{ marginTop: "12px" }}>
            {breakdown.map((step, i) => (
              <li key={i}>
                <span style={{ fontWeight: "bold", color: "#4da6ff", marginRight: "6px" }}>{i + 1}.</span> {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── AI Plan Response ────────────────────────── */}
      {planResponse && (
        <div className="ai-response-box">
          <span className="ai-response-label">AI RESPONSE</span>
          <p className="ai-response-text">{planResponse}</p>
        </div>
      )}
    </div>
  );
}

export default AIAssistant;