
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  projectId: "gen-lang-client-0742616574",
  appId: "1:1099174415554:web:b5f4595e3ca2d0ecfebf5b",
  apiKey: "AIzaSyDIFQ3LuBVJpAtcHnLijh20XXdqg9-Ytis",
  authDomain: "gen-lang-client-0742616574.firebaseapp.com",
  storageBucket: "gen-lang-client-0742616574.firebasestorage.app",
  messagingSenderId: "1099174415554",
  databaseId: "ai-studio-remixagnesvideog-1b9a8ea0-ed07-4214-8804-99ec9f327b4a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.databaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut, onAuthStateChanged };
