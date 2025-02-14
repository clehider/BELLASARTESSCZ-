import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
