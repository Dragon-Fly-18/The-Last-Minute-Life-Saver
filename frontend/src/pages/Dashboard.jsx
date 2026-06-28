import { useState, useEffect } from "react";
import TaskForm from "../components/taskform";
import AIAssistant from "../components/AIAssistant";
import { auth } from "../firebase";
import db from "../firebase";
import { onSnapshot, collection } from "firebase/firestore";
import { deleteTask, updateTask } from "../taskService";
import CalendarSync from "../components/calendar";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

/* ── Productivity score (mirrors backend/productivity.py) ── */
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

function calculateProductivityStats(tasks) {
  if (!tasks.length) {
    return {
      score: 0,
      total_tasks: 0,
      completed_tasks: 0,
      pending_tasks: 0,
      high_priority_pending: 0,
      overdue_tasks: 0,
      completion_rate: 0,
    };
  }

  const now = new Date();
  let completedTasks = 0;
  let pendingTasks = 0;
  let highPriorityPending = 0;
  let mediumPriorityPending = 0;
  let overdueTasks = 0;

  for (const task of tasks) {
    const status = String(task.status || "Pending").trim().toLowerCase();
    const isCompleted = status === "completed";

    if (isCompleted) {
      completedTasks += 1;
    } else {
      pendingTasks += 1;
      const priority = String(task.priority || "Low").trim().toLowerCase();
      if (priority === "high") highPriorityPending += 1;
      else if (priority === "medium") mediumPriorityPending += 1;

      const deadline = parseDeadline(task.deadline);
      if (deadline && deadline < now) overdueTasks += 1;
    }
  }

  const totalTasks = tasks.length;
  const completionRate = (completedTasks / totalTasks) * 100;
  const deductions =
    overdueTasks * 15 + highPriorityPending * 10 + mediumPriorityPending * 5;
  const score = Math.max(0, Math.min(100, Math.round(completionRate - deductions)));

  return {
    score,
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    pending_tasks: pendingTasks,
    high_priority_pending: highPriorityPending,
    overdue_tasks: overdueTasks,
    completion_rate: Math.round(completionRate * 10) / 10,
  };
}

function getLocalCoachTip(stats) {
  if (stats.total_tasks === 0) {
    return "No tasks yet! Create a task below to begin calculating your score.";
  }
  if (stats.completed_tasks === 0) {
    return "Complete your first task to start building your productivity score.";
  }
  if (stats.overdue_tasks > 0) {
    return "Tackle overdue tasks first to boost your score quickly.";
  }
  if (stats.high_priority_pending > 0) {
    return "Focus on your high-priority pending tasks next.";
  }
  return "Great progress! Keep completing tasks to raise your score.";
}

/* ── SVG Icons ───────────────────────────────────────────── */
const DiamondIcon = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dGradDB" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4fc3f7" />
        <stop offset="50%" stopColor="#7c4dff" />
        <stop offset="100%" stopColor="#e040fb" />
      </linearGradient>
    </defs>
    <polygon points="24,4 44,18 24,44 4,18" fill="url(#dGradDB)" opacity="0.9" />
    <polygon points="24,4 44,18 24,24 4,18" fill="rgba(255,255,255,0.25)" />
    <polygon points="4,18 24,24 24,44" fill="rgba(0,0,0,0.18)" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const TaskIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const SparkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ZapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/* ── Component ───────────────────────────────────────────── */
function Dashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [productivity, setProductivity] = useState({
    score: 0,
    stats: {
      total_tasks: 0,
      completed_tasks: 0,
      pending_tasks: 0,
      high_priority_pending: 0,
      overdue_tasks: 0,
      completion_rate: 0
    },
    ai_tip: "No tasks yet! Create a task below to begin calculating your score."
  });
  const [filter, setFilter] = useState("All"); // All, Pending, Completed
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);

    // Setup real-time listener for tasks
    const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(data);
    });

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const stats = calculateProductivityStats(tasks);

    setProductivity({
      score: stats.score,
      stats,
      ai_tip: getLocalCoachTip(stats),
    });

    if (tasks.length === 0) return;

    const fetchAiTip = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/productivity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks }),
        });
        const result = await response.json();
        if (result?.ai_tip?.trim()) {
          setProductivity((prev) => ({
            ...prev,
            ai_tip: result.ai_tip.trim(),
          }));
        }
      } catch (err) {
        console.error("Failed to fetch productivity tip:", err);
        setProductivity((prev) => ({
          ...prev,
          ai_tip: getLocalCoachTip(stats),
        }));
      }
    };

    fetchAiTip();
  }, [tasks]);

  const hasCompletedTasks = productivity.stats.completed_tasks > 0;
  const displayScore = hasCompletedTasks ? productivity.score : 0;

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    try {
      await updateTask(id, { status: nextStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" ||
      (filter === "Pending" && (task.status || "Pending").toLowerCase() !== "completed") ||
      (filter === "Completed" && (task.status || "Pending").toLowerCase() === "completed");
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="db-root">
      {/* ── Animated Gradient Mesh Background ── */}
      <div className="db-gradient-mesh" />

      {/* ── Floating Glass Orbs ── */}
      <div className="db-orb db-orb--1" />
      <div className="db-orb db-orb--2" />
      <div className="db-orb db-orb--3" />
      <div className="db-orb db-orb--4" />

      {/* ── Noise Texture Overlay ── */}
      <div className="db-noise" />

      {/* ── Navbar (Frosted Glass) ── */}
      <nav className="db-nav">
        <div className="db-nav-brand">
          <div className="db-brand-diamond">
            <DiamondIcon />
          </div>
          <span className="db-brand-text">
            Life<span className="db-brand-accent">Saver</span>
          </span>
        </div>

        <div className="db-nav-center">
          <span className="db-nav-badge">
            <span className="db-badge-dot" />
             Last-Minute Mode
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            className="db-theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <button id="db-logout-btn" className="db-logout-btn" onClick={handleLogout}>
            <LogoutIcon />
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="db-main">
        {/* Hero header */}
        <header className="db-hero">
          <p className="db-hero-eyebrow">{greeting()}</p>
          <h1 className="db-hero-title">
            Your <span className="db-gradient-text">AI-Powered</span> Dashboard
          </h1>
          <p className="db-hero-sub">
            Conquer deadlines, prioritize smarter, and ship on time — every time.
          </p>

          {/* Quick Stat Chips */}
          <div className="db-stat-chips">
            <div className="db-stat-chip">
              <ClockIcon />
              <span>Real-time Sync</span>
            </div>
            <div className="db-stat-chip">
              <ZapIcon />
              <span>AI Powered</span>
            </div>
            <div className="db-stat-chip">
              <ShieldIcon />
              <span>Smart Priority</span>
            </div>
          </div>
        </header>

        {/* ── Card Grid ── */}
        <div className="db-grid">

          {/* AI Productivity Score Card */}
          <div className="db-card db-card--score">
            <div className="db-card-shimmer" />
            <div className="db-card-header">
              <span className="db-card-icon db-card-icon--cyan">
                <ChartIcon />
              </span>
              <div>
                <h3 className="db-card-title">Productivity Score</h3>
                <p className="db-card-sub">AI-driven real-time analysis</p>
              </div>
            </div>
            <div className="db-card-body score-card-body">
              <div className="score-main-row">
                {/* SVG Gauge */}
                <div className="gauge-container">
                  <svg className="gauge-svg" viewBox="0 0 100 100" aria-hidden="true">
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00e676" />
                        <stop offset="100%" stopColor="#00b0ff" />
                      </linearGradient>
                    </defs>
                    <g transform="rotate(-90 50 50)">
                      <circle className="gauge-bg" cx="50" cy="50" r="40" />
                      <circle
                        className="gauge-progress"
                        cx="50"
                        cy="50"
                        r="40"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * displayScore) / 100}
                      />
                    </g>
                    {hasCompletedTasks && (
                      <text
                        className="gauge-value"
                        x="50"
                        y="50"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {productivity.score}%
                      </text>
                    )}
                  </svg>
                </div>

                {/* Factors checklist */}
                <div className="score-factors">
                  <div className="factor-item">
                    <span className="factor-bullet">✓</span>
                    <span className="factor-label">Completed Tasks</span>
                  </div>
                  <div className="factor-item">
                    <span className="factor-bullet">✓</span>
                    <span className="factor-label">Deadlines Met</span>
                  </div>
                  <div className="factor-item">
                    <span className="factor-bullet">✓</span>
                    <span className="factor-label">Priority Handling</span>
                  </div>
                </div>
              </div>

              {/* Stats breakdown chips */}
              <div className="score-breakdown">
                <div className="breakdown-chip" title="Completed vs Total">
                  <span className="breakdown-val">{productivity.stats.completed_tasks}/{productivity.stats.total_tasks}</span>
                  <span className="breakdown-lbl">Completed</span>
                </div>
                <div className="breakdown-chip warning" title="High Priority Pending">
                  <span className="breakdown-val">{productivity.stats.high_priority_pending}</span>
                  <span className="breakdown-lbl">High Priority</span>
                </div>
                <div className="breakdown-chip danger" title="Overdue Pending Tasks">
                  <span className="breakdown-val">{productivity.stats.overdue_tasks}</span>
                  <span className="breakdown-lbl">Overdue</span>
                </div>
              </div>

              {/* AI Suggestion Box */}
              <div className="score-ai-insight">
                <div className="ai-insight-title">COACH INSIGHT</div>
                <p className="ai-insight-text">"{productivity.ai_tip}"</p>
              </div>
            </div>
          </div>

          {/* Add Task */}
          <div className="db-card db-card--task">
            <div className="db-card-shimmer" />
            <div className="db-card-header">
              <span className="db-card-icon db-card-icon--purple">
                <TaskIcon />
              </span>
              <div>
                <h3 className="db-card-title">Add New Task</h3>
                <p className="db-card-sub">Queue up what needs doing</p>
              </div>
            </div>
            <div className="db-card-body">
              <TaskForm />
            </div>
          </div>

          {/* AI Assistant */}
          <div className="db-card db-card--ai">
            <div className="db-card-shimmer" />
            <div className="db-card-header">
              <span className="db-card-icon db-card-icon--pink">
                <SparkIcon />
              </span>
              <div>
                <h3 className="db-card-title">AI Assistant</h3>
                <p className="db-card-sub">Powered by Gemini</p>
              </div>
            </div>
            <div className="db-card-body">
              <AIAssistant />
            </div>
          </div>

          {/* Task List */}
          <div className="db-card db-card--list">
            <div className="db-card-shimmer" />
            <div className="db-card-header task-list-header">
              <div className="task-header-left">
                <span className="db-card-icon db-card-icon--pink">
                  <ListIcon />
                </span>
                <div>
                  <h3 className="db-card-title">Your Tasks</h3>
                  <p className="db-card-sub">Track, manage, and complete your checklist</p>
                </div>
              </div>

              {/* Filters & Search in Header */}
              <div className="task-header-controls">
                <input
                  type="text"
                  className="task-search-input"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="task-filter-group">
                  {["All", "Pending", "Completed"].map((f) => (
                    <button
                      key={f}
                      className={`task-filter-btn ${filter === f ? "active" : ""}`}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="db-card-body">
              <div className="tasks-container">
                {filteredTasks.length === 0 ? (
                  <div className="empty-tasks">
                    <p>No tasks found. Add a new task to get started!</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isCompleted = (task.status || "Pending").toLowerCase() === "completed";
                    return (
                      <div key={task.id} className={`task-row-card ${isCompleted ? "completed" : ""}`}>
                        <div className="task-row-left">
                          <label className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => handleToggleStatus(task.id, task.status || "Pending")}
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
                            </div>
                          </div>
                        </div>
                        <div className="task-row-actions">
                          <CalendarSync taskTitle={task.title} taskDate={task.deadline || new Date().toISOString()} />
                          <button
                            className="tc-delete-btn"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Delete task"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;

