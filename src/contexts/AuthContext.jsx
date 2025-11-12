// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp, // server-side timestamp
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);

  // Check if username already exists
  async function checkUsernameExists(username) {
    try {
      const usernameQuery = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
      const usernameSnapshot = await getDocs(usernameQuery);
      return !usernameSnapshot.empty;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  // Sign up:
  // - role='student' -> regular student, approved:true
  // - role='organizer' -> club organizer, creates club request (no Firebase Auth account until approved)
  // - role='admin' -> admin, only creates request (no Firebase Auth account until approved)
  async function signup(email, password, username, role = 'student', clubName = '') {
    try {
      // Check if username already exists
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        const error = new Error('USERNAME_EXISTS');
        error.code = 'USERNAME_EXISTS';
        throw error;
      }

      // For admin role, only create request (no Firebase Auth account)
      if (role === 'admin') {
        // Check if email already has a pending request
        const requestsRef = collection(db, 'adminRequests');
        const emailQuery = query(requestsRef, where('email', '==', email));
        const emailSnapshot = await getDocs(emailQuery);
        
        if (!emailSnapshot.empty) {
          const error = new Error('ADMIN_REQUEST_EXISTS');
          error.code = 'ADMIN_REQUEST_EXISTS';
          throw error;
        }

        // Create admin request only (no Firebase Auth account)
        const requestRef = doc(collection(db, 'adminRequests'));
        await setDoc(requestRef, {
          email,
          username: username.toLowerCase(),
          password: password, // Store password for manual account creation (you can hash this if needed)
          status: 'pending',
          createdAt: serverTimestamp(),
        });

        // Return a mock object to indicate success
        return { requestId: requestRef.id };
      }

      // For organizer role, create club request (no Firebase Auth account until approved)
      if (role === 'organizer') {
        if (!clubName || clubName.trim().length < 3) {
          const error = new Error('CLUB_NAME_REQUIRED');
          error.code = 'CLUB_NAME_REQUIRED';
          throw error;
        }

        // Check if email already has a pending request
        const requestsRef = collection(db, 'clubRequests');
        const emailQuery = query(requestsRef, where('email', '==', email));
        const emailSnapshot = await getDocs(emailQuery);
        
        if (!emailSnapshot.empty) {
          const error = new Error('CLUB_REQUEST_EXISTS');
          error.code = 'CLUB_REQUEST_EXISTS';
          throw error;
        }

        // Create club request only (no Firebase Auth account)
        const requestRef = doc(collection(db, 'clubRequests'));
        await setDoc(requestRef, {
          email,
          username: username.toLowerCase(),
          clubName: clubName.trim(),
          password: password, // Store password for account creation after approval
          status: 'pending',
          createdAt: serverTimestamp(),
        });

        // Return a mock object to indicate success
        return { requestId: requestRef.id };
      }

      // For students, create Firebase Auth account (auto-approved)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        username: username.toLowerCase(),
        role: 'student',
        approved: true, // Students are auto-approved
        adminRequested: false,
        createdAt: serverTimestamp(),
      });
      
      return userCredential;
    } catch (error) {
      // Re-throw the error with proper code for error handling
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function getUserData(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  }

  // Refresh user data after profile updates
  async function refreshUserData() {
    if (currentUser) {
      const data = await getUserData(currentUser.uid);
      setUserData(data || null);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        let data = await getUserData(user.uid);


        setUserData(data || null);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}




