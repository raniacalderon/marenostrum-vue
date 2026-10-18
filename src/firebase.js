// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHD7gQwVCbVCKWQ_WGjDRa80iT6zlNyUM",
  authDomain: "marenostrum-rania-web-2026.firebaseapp.com",
  projectId: "marenostrum-rania-web-2026",
  storageBucket: "marenostrum-rania-web-2026.firebasestorage.app",
  messagingSenderId: "606801096690",
  appId: "1:606801096690:web:17edee87bf57170c8e856b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);