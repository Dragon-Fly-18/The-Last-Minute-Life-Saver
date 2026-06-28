import { 
collection,
addDoc,
getDocs,
deleteDoc,
updateDoc,
doc
} from "firebase/firestore";

import db from "./firebase";


export const addTask = async(task)=>{

await addDoc(
collection(db,"tasks"),
task
);

};



export const getTasks = async()=>{


const snapshot =
await getDocs(
collection(db,"tasks")
);


return snapshot.docs.map(item=>({

id:item.id,
...item.data()

}));

};



export const deleteTask = async(id)=>{


await deleteDoc(
doc(db,"tasks",id)
);


};


export const updateTask = async(id, data)=>{

await updateDoc(
doc(db,"tasks",id),
data
);

};

export const addHabit = async(habit)=>{
  await addDoc(
    collection(db,"habits"),
    habit
  );
};

export const getHabits = async()=>{
  const snapshot = await getDocs(
    collection(db,"habits")
  );
  return snapshot.docs.map(item=>({
    id:item.id,
    ...item.data()
  }));
};

export const deleteHabit = async(id)=>{
  await deleteDoc(
    doc(db,"habits",id)
  );
};

export const updateHabit = async(id, data)=>{
  await updateDoc(
    doc(db,"habits",id),
    data
  );
};