import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyDpFIxjyF-_lsqtqMN3XJEUtUZBM65cdFc",
  authDomain: "b2-prep.firebaseapp.com",
  projectId: "b2-prep",
  storageBucket: "b2-prep.firebasestorage.app",
  messagingSenderId: "380381562896",
  appId: "1:380381562896:web:6e3d944aaef13394dca295"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId configured in firebase-applet-config
export const db = getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);

// Validate Connection to Firestore on startup
import { doc, getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Firestore connected successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: client is offline.");
    } else {
      console.warn("Firestore connection check resulted in:", error);
    }
  }
}
testConnection();

