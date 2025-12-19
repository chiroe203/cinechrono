// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

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

// データ取得
export const fetchTimelineData = async () => {
  try {
    const q = query(collection(db, 'timeline'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('データ取得エラー:', error);
    return [];
  }
};

// データ追加
export const addTimelineItem = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'timeline'), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('データ追加エラー:', error);
    throw error;
  }
};

// データ削除
export const deleteTimelineItem = async (id) => {
  try {
    await deleteDoc(doc(db, 'timeline', id));
    return true;
  } catch (error) {
    console.error('データ削除エラー:', error);
    throw error;
  }
};

// ログイン
export const loginAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('ログインエラー:', error);
    throw error;
  }
};

// ログアウト
export const logoutAdmin = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('ログアウトエラー:', error);
    throw error;
  }
};
