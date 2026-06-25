import TaskForm from "../components/taskform";
import TaskList from "../components/tasklist";
import AIAssistant from "../components/AIAssistant";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

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

/* ── Component ───────────────────────────────────────────── */
function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="db-root">
      {/* Ambient blobs — same as Signup/Login */}
      <div className="lm-blob lm-blob-tl" />
      <div className="lm-blob lm-blob-br" />
      <div className="db-blob-mid" />

      {/* ── Navbar ── */}
      <nav className="db-nav">
        <div className="db-nav-brand">
          <DiamondIcon />
          <span className="db-brand-text">
            Life<span className="db-brand-accent">Saver</span>
          </span>
        </div>

        <div className="db-nav-center">
          <span className="db-nav-badge">🔥 Last-Minute Mode</span>
        </div>

        <button id="db-logout-btn" className="db-logout-btn" onClick={handleLogout}>
          <LogoutIcon />
          Sign Out
        </button>
      </nav>

      {/* ── Main ── */}
      <main className="db-main">
        {/* Hero header */}
        <header className="db-hero">
          <p className="db-hero-eyebrow">Welcome back</p>
          <h1 className="db-hero-title">
            Your <span className="db-gradient-text">AI-Powered</span> Dashboard
          </h1>
          <p className="db-hero-sub">
            Conquer deadlines, prioritize smarter, and ship on time — every time.
          </p>
        </header>

        {/* ── Card Grid ── */}
        <div className="db-grid">

          {/* Add Task */}
          <div className="db-card db-card--task">
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
            <div className="db-card-header">
              <span className="db-card-icon db-card-icon--cyan">
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
            <div className="db-card-header">
              <span className="db-card-icon db-card-icon--pink">
                <ListIcon />
              </span>
              <div>
                <h3 className="db-card-title">Your Tasks</h3>
                <p className="db-card-sub">Track and manage everything</p>
              </div>
            </div>
            <div className="db-card-body">
              <TaskList />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
