import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAOkE27nXxkipOczHekDsaoS3tXpqWOIEo",
  authDomain: "react-chat-98ca7.firebaseapp.com",
  projectId: "react-chat-98ca7",
  storageBucket: "react-chat-98ca7.appspot.com",
  messagingSenderId: "236660772088",
  appId: "1:236660772088:web:204c4cba8203870caabf0d"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const database = getDatabase(app);
