// Authentication functions
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Export auth directly for components that need it
export { auth };

// Register a new user
export const registerUser = async (email, password, displayName, role = 'cleaner') => {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
      profileComplete: false
    });
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role
      }
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Sign in existing user
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userData?.role || 'cleaner'
      }
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Check if user is admin
export const checkIfAdmin = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Set up auth state observer
export const setupAuthObserver = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          callback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || userData.displayName,
            role: userData.role || 'cleaner',
            profileComplete: userData.profileComplete || false
          });
        } else {
          callback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'cleaner',
            profileComplete: false
          });
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'cleaner',
          profileComplete: false
        });
      }
    } else {
      // User is signed out
      callback(null);
    }
  });
};
