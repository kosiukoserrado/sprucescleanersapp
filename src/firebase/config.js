// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1j3Q6kcwILHGFw2MI8L4mmRZM8DmsVx0",
  authDomain: "spruces-app-bff67.firebaseapp.com",
  projectId: "spruces-app-bff67",
  storageBucket: "spruces-app-bff67.firebasestorage.app",
  messagingSenderId: "725151975956",
  appId: "1:725151975956:web:f9041edc982c7eafe67501",
  measurementId: "G-NE7BT0GXCB"
};

// Export the config for components that need it
export { firebaseConfig };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
