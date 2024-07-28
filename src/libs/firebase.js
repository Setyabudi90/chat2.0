import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.VITE_FIREBASE_GOOGLE_API_KEY,
    authDomain: import.meta.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.VITE_FIREBASE_APP_ID
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app)
export const storage = getStorage(app)