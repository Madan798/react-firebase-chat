import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchatapp-3f4e3.firebaseapp.com",
  projectId: "reactchatapp-3f4e3",
  storageBucket: "reactchatapp-3f4e3.appspot.com",
  messagingSenderId: "783121583474",
  appId: "1:783121583474:web:e97e1b5ef8cffad55721eb",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
