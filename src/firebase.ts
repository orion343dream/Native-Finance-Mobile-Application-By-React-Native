
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
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

let authInstance;
try {
  // Dynamically require to avoid type/resolve issues if subpath is missing
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getReactNativePersistence } = require('firebase/auth/react-native');
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Fallback to default auth without persistence if RN helpers are unavailable
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);

