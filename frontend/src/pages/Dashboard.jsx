import TaskForm from "../components/taskform";
import TaskList from "../components/tasklist";
import AIAssistant from "../components/AIAssistant";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

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
    <div className="dashboard-container">
      <nav className="dashboard-nav glass-panel-dark">
        <div className="nav-brand">
          <span className="brand-icon">🔥</span>
          <h2>Life Saver</h2>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Sign Out
        </button>
      </nav>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome to your Dashboard</h1>
          <p>Let's conquer those last-minute tasks!</p>
        </header>

        <div className="dashboard-grid">
          <div className="grid-item tasks-section glass-panel-dark">
            <h3 className="section-title">Add New Task</h3>
            <TaskForm />
          </div>

          <div className="grid-item ai-section glass-panel-dark">
            <h3 className="section-title">AI Assistant</h3>
            <AIAssistant />
          </div>
          
          <div className="grid-item list-section glass-panel-dark">
            <h3 className="section-title">Your Tasks</h3>
            <TaskList />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
