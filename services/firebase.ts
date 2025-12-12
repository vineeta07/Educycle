import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRhU1IKlFbZ6CrLTUijI4_kbdny5ccIzM",
  authDomain: "educycle-71704.firebaseapp.com",
  projectId: "educycle-71704",
  storageBucket: "educycle-71704.firebasestorage.app",
  messagingSenderId: "392794506618",
  appId: "1:392794506618:web:59a06d4af07cd918bc02c3",
  measurementId: "G-4ZL3DCV24Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();