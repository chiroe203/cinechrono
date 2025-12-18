import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDyJ6IhfEAf6Bsf7LTQ5YByG8T-ou6cXwE",
  authDomain: "cinechrono-1c1a8.firebaseapp.com",
  projectId: "cinechrono-1c1a8",
  storageBucket: "cinechrono-1c1a8.firebasestorage.app",
  messagingSenderId: "1029924381560",
  appId: "1:1029924381560:web:5c36f1b9ac2ed2f7a09e8d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);