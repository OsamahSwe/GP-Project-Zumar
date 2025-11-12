import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAort413AlC2-2_I93jefCYyiBJYljUiE8",
  authDomain: "swe497-gp2.firebaseapp.com",
  projectId: "swe497-gp2",
  storageBucket: "swe497-gp2.appspot.com",
  messagingSenderId: "922150276985",
  appId: "1:922150276985:web:be6db672cd548ad39669a8",
  measurementId: "G-SZ2QJ7RDYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
