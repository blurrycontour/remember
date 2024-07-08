import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJVrnhkOPcwHsanpVKNvRryQUrYJEqIY4",
  authDomain: "rememberapp-2c62b.firebaseapp.com",
  projectId: "rememberapp-2c62b",
  storageBucket: "rememberapp-2c62b.appspot.com",
  messagingSenderId: "34068054287",
  appId: "1:34068054287:web:c69ff9beb7f5eb498dfe7a",
  measurementId: "G-ZKG4W1RZV4"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
