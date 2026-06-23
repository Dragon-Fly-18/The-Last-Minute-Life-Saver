import { useState } from "react";


function AIAssistant(){

const [response,setResponse] = useState("");

const getAIPlan = async()=>{

const res = await fetch(
"http://127.0.0.1:8000/ai"
);


const data = await res.json();


setResponse(data["AI response"]);

};


return(

<div>

<h2>
🤖 AI Productivity Assistant
</h2>


<button onClick={getAIPlan}>
Generate AI Plan
</button>


<p>
{response}
</p>


</div>

)


}


export default AIAssistant;