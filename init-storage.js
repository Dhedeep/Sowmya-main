import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2DeBojg9vsPkY9f0TrVXIjXjY34Xc8oY",
  authDomain: "test-46178.firebaseapp.com",
  projectId: "test-46178",
  storageBucket: "test-46178.firebasestorage.app",
  messagingSenderId: "358374837194",
  appId: "1:358374837194:web:9a6db4bcb8bd725d275d33",
  measurementId: "G-ERH6VV716L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

async function initializeStorage() {
  try {
    console.log('Initializing Firebase Storage...');
    
    // Create a simple test file to upload
    const testContent = 'This is a test file to initialize Firebase Storage';
    const testBuffer = Buffer.from(testContent, 'utf8');
    
    // Upload a test file to initialize the storage bucket
    const storageRef = ref(storage, 'init/test.txt');
    await uploadBytes(storageRef, testBuffer);
    
    console.log('✅ Firebase Storage initialized successfully!');
    console.log('📁 Test file uploaded to: init/test.txt');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('🔗 Download URL:', downloadURL);
    
    // Create a test document in Firestore to verify storage is working
    await setDoc(doc(db, 'storage', 'init'), {
      initialized: true,
      timestamp: new Date(),
      testFileURL: downloadURL
    });
    
    console.log('✅ Firestore document created to verify storage initialization');
    
  } catch (error) {
    console.error('❌ Error initializing Firebase Storage:', error);
    
    if (error.code === 'storage/unauthorized') {
      console.log('\n💡 To fix this issue:');
      console.log('1. Go to https://console.firebase.google.com/project/test-46178/storage');
      console.log('2. Click "Get Started" to set up Firebase Storage');
      console.log('3. Choose "Start in test mode" for now');
      console.log('4. Select a location (choose the closest to your users)');
      console.log('5. Run this script again');
    }
  }
}

initializeStorage();