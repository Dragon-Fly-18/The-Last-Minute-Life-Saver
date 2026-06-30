import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBr46Hz2vDnAhGk_EJ1cUO4nyVngm_5s_U",
  authDomain: "last-minute-life-saver-c7a1f.firebaseapp.com",
  projectId: "last-minute-life-saver-c7a1f",
  storageBucket: "last-minute-life-saver-c7a1f.firebasestorage.app",
  messagingSenderId: "441725424967",
  appId: "1:441725424967:web:ebe8e9cbc9755de57be862"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { auth };
export default db;