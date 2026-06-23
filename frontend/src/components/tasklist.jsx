import {useEffect,useState} from "react";
import {getTasks,deleteTask} from "../taskService";


function TaskList(){


const [tasks,setTasks]=useState([]);


const loadTasks=async()=>{

const data=await getTasks();

setTasks(data);

};


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


<h3>
{task.title}
</h3>


<p>
Deadline: {task.deadline}
</p>


<p>
Priority: {task.priority}
</p>


<button
onClick={()=>removeTask(task.id)}
>

Delete

</button>


</div>


))

}


</div>

)


}


export default TaskList;