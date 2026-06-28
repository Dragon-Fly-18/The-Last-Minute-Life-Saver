import { useState } from "react";
import { addHabit, deleteHabit, updateHabit } from "../taskService";

// Helper to format Date to YYYY-MM-DD local string
const getLocalDateString = (dateObjOrStr) => {
  if (!dateObjOrStr) return null;
  const d = new Date(dateObjOrStr);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
};

// SVG icons used in the habit tracker
const FlameIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
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

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function HabitTracker({ habits = [], tasks = [] }) {
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate current week days: Monday to Sunday
  const current = new Date();
  const day = current.getDay(); // Sun=0, Mon=1, Tue=2...
  const distanceToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + distanceToMonday);

  const weekDays = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = getLocalDateString(d);
    weekDays.push({
      name: dayNames[i],
      dateStr,
      isToday: new Date().toDateString() === d.toDateString(),
      formattedDate: d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    });
  }

  // Calculate set of all completed dates (either habit or task completed on that date)
  const completedDates = new Set();

  // 1. Accumulate habit completion dates
  habits.forEach((habit) => {
    if (habit.completedDays) {
      Object.entries(habit.completedDays).forEach(([dateStr, isCompleted]) => {
        if (isCompleted) {
          completedDates.add(dateStr);
        }
      });
    }
  });

  // 2. Accumulate task completion dates
  tasks.forEach((task) => {
    if (task.status?.toLowerCase() === "completed" && task.completedAt) {
      const dateStr = getLocalDateString(task.completedAt);
      if (dateStr) {
        completedDates.add(dateStr);
      }
    }
  });

  // Calculate current productivity streak (consecutive days with activity)
  const calculateStreak = () => {
    if (completedDates.size === 0) return 0;

    let streak = 0;
    const today = new Date();
    const todayStr = getLocalDateString(today);
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    let checkDate = today;
    let checkStr = todayStr;

    // If today is not completed, check if yesterday was.
    // This allows the user to maintain their streak until the end of the day.
    if (!completedDates.has(todayStr)) {
      if (completedDates.has(yesterdayStr)) {
        checkDate = yesterday;
        checkStr = yesterdayStr;
      } else {
        return 0; // Streak broken
      }
    }

    // Traverse backwards
    while (completedDates.has(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = getLocalDateString(checkDate);
    }

    return streak;
  };

  const streak = calculateStreak();

  // Handlers
  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await addHabit({
        title: newHabitTitle.trim(),
        createdAt: new Date().toISOString(),
        completedDays: {}
      });
      setNewHabitTitle("");
    } catch (err) {
      console.error("Error adding habit:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHabitDay = async (habit, dateStr) => {
    const completedDays = { ...(habit.completedDays || {}) };
    completedDays[dateStr] = !completedDays[dateStr];

    try {
      await updateHabit(habit.id, { completedDays });
    } catch (err) {
      console.error("Error updating habit:", err);
    }
  };

  const handleDeleteHabit = async (id) => {
    if (window.confirm("Are you sure you want to delete this habit?")) {
      try {
        await deleteHabit(id);
      } catch (err) {
        console.error("Error deleting habit:", err);
      }
    }
  };

  return (
    <div className="habit-tracker-container">
      {/* Streak Dashboard Section */}
      <div className="habit-streak-card">
        <div className="habit-streak-info">
          <div className="habit-streak-badge">
            <FlameIcon />
            <span>Productivity Streak</span>
          </div>
          <h2 className="habit-streak-title">
            <span className="db-gradient-text">{streak} Day{streak !== 1 ? "s" : ""} Streak</span>
          </h2>
          <p className="habit-streak-sub">
            Keep completing daily habits or tasks to grow your streak!
          </p>
        </div>

        {/* Weekly Completion Grid */}
        <div className="habit-weekly-grid">
          {weekDays.map((day) => {
            const isCompleted = completedDates.has(day.dateStr);
            return (
              <div 
                key={day.dateStr} 
                className={`habit-week-pill ${isCompleted ? "completed" : ""} ${day.isToday ? "today" : ""}`}
                title={`${day.formattedDate}: ${isCompleted ? "Completed" : "No completions yet"}`}
              >
                <span className="habit-week-dayname">{day.name}</span>
                <span className="habit-week-checkmark">
                  {isCompleted ? "✅" : "⚪"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habits List Panel */}
      <div className="habit-list-card">
        <div className="habit-panel-header">
          <CalendarIcon />
          <div>
            <h3 className="habit-panel-title">My Habits</h3>
            <p className="habit-panel-sub">Toggle completion for any day of the current week</p>
          </div>
        </div>

        <div className="habits-list">
          {habits.length === 0 ? (
            <div className="empty-habits">
              <p>No habits added yet. Create one below to kickstart your routine!</p>
            </div>
          ) : (
            habits.map((habit) => (
              <div key={habit.id} className="habit-row">
                <div className="habit-row-left">
                  <span className="habit-title">{habit.title}</span>
                </div>

                <div className="habit-row-center">
                  <div className="habit-days-row">
                    {weekDays.map((day) => {
                      const isDayCompleted = !!habit.completedDays?.[day.dateStr];
                      return (
                        <button
                          key={day.dateStr}
                          type="button"
                          className={`habit-day-bubble ${isDayCompleted ? "active" : ""} ${day.isToday ? "today" : ""}`}
                          onClick={() => handleToggleHabitDay(habit, day.dateStr)}
                          title={`${day.name} (${day.formattedDate}): Click to toggle completion`}
                        >
                          <span className="day-bubble-text">{day.name[0]}</span>
                          {isDayCompleted && (
                            <span className="day-bubble-check">
                              <CheckIcon />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="habit-row-right">
                  <button
                    type="button"
                    className="tc-delete-btn"
                    onClick={() => handleDeleteHabit(habit.id)}
                    title="Delete habit"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Habit Form */}
        <div className="habit-add-form">
          <input
            type="text"
            placeholder="Add new habit (e.g. Gym, Read 10 pages)..."
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            disabled={isSubmitting}
            maxLength={60}
          />
          <button type="button" onClick={handleAddHabit} disabled={isSubmitting || !newHabitTitle.trim()}>
            {isSubmitting ? "Adding..." : "+ Add Habit"}
          </button>
        </div>
      </div>
    </div>
  );
}
