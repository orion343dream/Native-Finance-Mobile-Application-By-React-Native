
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBf1mwimmgiDavo_Ytnh28-6R8LSkMUnkc",
  authDomain: "nativefinanceapp.firebaseapp.com",
  projectId: "nativefinanceapp",
  storageBucket: "nativefinanceapp.firebasestorage.app",
  messagingSenderId: "1737513953",
  appId: "1:1737513953:web:59a286ce1d7a926d28d0a0",
  measurementId: "G-0B3YWRSNYE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
