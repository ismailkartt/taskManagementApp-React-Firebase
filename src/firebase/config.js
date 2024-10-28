// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDyU7oG-_bM2_G0bJmEKmc2zatWFTn9DOw",
  authDomain: "task-management-app-c322f.firebaseapp.com",
  projectId: "task-management-app-c322f",
  storageBucket: "task-management-app-c322f.appspot.com",
  messagingSenderId: "456591486682",
  appId: "1:456591486682:web:bf25a46b5a92a573537fe3",
  measurementId: "G-C0JG5CQPYC"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Servisleri al
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;