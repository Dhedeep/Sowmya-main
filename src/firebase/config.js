import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyByrUein4m5p3woiXmGXucMM-jF18Ym2XI",
  authDomain: "sowmya-selections.firebaseapp.com",
  projectId: "sowmya-selections",
  storageBucket: "sowmya-selections.firebasestorage.app",
  messagingSenderId: "315262534086",
  appId: "1:315262534086:web:46498a6ecb87d7907532c7",
  measurementId: "G-J70T7WR1LX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;