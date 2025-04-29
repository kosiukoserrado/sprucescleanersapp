import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/auth';
import { getUserProfile, createUserProfile } from '../firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.message || 'Failed to log in' 
      };
    }
  };

  // Register function
  const register = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, { displayName });
      
      // Create user profile in Firestore
      await createUserProfile(userCredential.user.uid, {
        email,
        displayName,
        role: 'cleaner',
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        error: error.message || 'Failed to register' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { 
        success: false, 
        error: error.message || 'Failed to log out' 
      };
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return { 
        success: false, 
        error: error.message || 'Failed to send password reset email' 
      };
    }
  };

  // Effect to handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get user profile from Firestore
          const profileResult = await getUserProfile(user.uid);
          
          if (profileResult.success) {
            setUserProfile(profileResult.profile);
            setIsAdmin(profileResult.profile?.role === 'admin');
          } else {
            console.error("Failed to get user profile:", profileResult.error);
          }
        } catch (error) {
          console.error("Error getting user profile:", error);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    login,
    register,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
