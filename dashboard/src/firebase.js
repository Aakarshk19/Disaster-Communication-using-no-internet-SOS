// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeQzX4bShBMljPXOW2ef84zY1kPaeebc8",
  authDomain: "disastersos-2a189.firebaseapp.com",
  projectId: "disastersos-2a189",
  storageBucket: "disastersos-2a189.firebasestorage.app",
  messagingSenderId: "313786894359",
  appId: "1:313786894359:web:a312fe74861128d4673452",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
