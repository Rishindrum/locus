import { auth } from "../backend/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser
} from "firebase/auth";
import { db } from '../backend/firebaseConfig';
import {
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
  } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchUserData } from "../backend/backendFunctions";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async fbUser => {
      if (fbUser) {
        // Try to get pfp from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          let pfp = null;
          if (userDoc.exists()) {
            const userData = userDoc.data();
            pfp = userData.pfp || null;
          }
          setUser({
            ...fbUser,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || '',
            pfp,
          });
        } catch (e) {
          setUser({
            ...fbUser,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || '',
            pfp: null,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Login function that validates the provided username and password.
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        // console.log("We reached here somehow",userCredential.user);
        setUser(userCredential.user);
        return { success: true };
      }
    } catch (error) {
      console.log("Invalid credentials",userCredential.user);
      return { success: false, message: error.message }; // Return the error message
    }
  };

  // Logout function to clear user data and redirect to the login page.
  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  const del = async () => {
    await deleteDoc(doc(db, 'users', user.uid));
    await deleteUser(user);
    setUser(null);
  }

  // Register function
  const register = async (name, email, password) => {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
  
      console.log("User registered:", userCredential.user);
      console.log("User ID:", userId);
  
      // Add user data to Firestore
      await setDoc(doc(db, 'users', userId), {
        userId,
        name,
        email,
        followers: [],
        following: [],
        savedSpaces: [],
        createdSpaces: [],
        additional: {
          points: 0,
          reviews: [],
        },
      });
  
      // Update state
      setUser(userCredential.user);
      return { success: true };
    } catch (error) {
      console.error("Error during registration:", error.message);
      return { success: false, message: error.message }; // Return the error message
    }
  };

  const remember = async () => {
    try {
      await firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message }; // Return the error message
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message }; // Return the error message
    }
  };

  // An object containing our state and functions related to authentication.
  // By using this context, child components can easily access and use these without prop drilling.
  const contextValue = {
    user,
    loading,
    login,
    logout,
    del,
    register,
    remember,
    resetPassword,
  };

  // The AuthProvider component uses the AuthContext.Provider to wrap its children.
  // This makes the contextValue available to all children and grandchildren.
  // Instead of manually passing down data and functions, components inside this provider can
  // simply use the useAuth() hook to access anything they need.
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// signOut(auth)

// const user = auth.currentUser;
// const displayName = user.displayName;
// const token = user.accessToken;
// const email = user.email;
// const photoURL = user.photoURL;
// const emailVerified = user.emailVerified;
// const uid = user.uid;