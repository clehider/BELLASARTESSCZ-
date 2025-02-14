import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB08Ss_5HwpRWU2Ag2k3Nxc2JgIutrXqDg",
  authDomain: "institutogestion-80e6b.firebaseapp.com",
  databaseURL: "https://institutogestion-80e6b-default-rtdb.firebaseio.com",
  projectId: "institutogestion-80e6b",
  storageBucket: "institutogestion-80e6b.firebasestorage.app",
  messagingSenderId: "730912881952",
  appId: "1:730912881952:web:504dadab578ed8afef6b45"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const rtdb = getDatabase(app);

export { db, auth, rtdb };
