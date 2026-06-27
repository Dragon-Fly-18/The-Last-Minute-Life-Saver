import {useEffect,useState} from "react";
import {getTasks,deleteTask} from "../taskService";
import CalendarSync from "./calendar";

function TaskList(){

const [tasks,setTasks]=useState([]);

const loadTasks=async()=>{
const data=await getTasks();
setTasks(data);
};

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
  </svg>
);

useEffect(()=>{
loadTasks();
},[]);

const removeTask=async(id)=>{
await deleteTask(id);
loadTasks();
};

return(
<div>
<h2>
Your Tasks
</h2>

{
tasks.map(task=>(
<div key={task.id}>
  <div>
    <h3 style={{ margin: '0 0 5px 0' }}>{task.title}</h3>
    <span style={{ marginRight: '15px' }}>Deadline: {task.deadline}</span>
    <span>Priority: {task.priority}</span>
  </div>
  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
    <CalendarSync taskTitle={task.title} taskDate={task.deadline || new Date().toISOString()} />
    <button
      className="tc-delete-btn"
      onClick={()=>removeTask(task.id)}
      title="Delete task"
    >
      <TrashIcon />
    </button>
  </div>
</div>
))
}

</div>
)
}

export default TaskList;