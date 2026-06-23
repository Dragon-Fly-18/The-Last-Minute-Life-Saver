import {useState} from "react";
import {addTask} from "../taskService";


function TaskForm(){

const [task,setTask]=useState({
 title:"",
 deadline:"",
 priority:""
});


const submitTask=async(e)=>{

e.preventDefault();


await addTask({
 ...task,
 status:"Pending"
});


alert("Task Added 🔥");


};



return(

<form onSubmit={submitTask}>


<input
placeholder="Task name"

onChange={(e)=>
setTask({
...task,
title:e.target.value
})
}
/>



<input
placeholder="Deadline"

onChange={(e)=>
setTask({
...task,
deadline:e.target.value
})
}
/>



<select

onChange={(e)=>
setTask({
...task,
priority:e.target.value
})
}

>

<option>
Priority
</option>

<option>
High
</option>

<option>
Medium
</option>

<option>
Low
</option>


</select>


<button>
Add Task
</button>


</form>

)


}


export default TaskForm;