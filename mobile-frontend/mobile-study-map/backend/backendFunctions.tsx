import { storage, auth, db } from "./firebaseConfig";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  writeBatch,
  query,
  getFirestore,
  where,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

// ===== LOGIN/LOGOUT/REGISTER/DELETE/FORGOT_PASSWORD USER FUNCTIONS ARE IN ../contexts/AuthContext.tsx ===== 
// ===== USER FUNCTIONS =====

// Get user profile data
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.error("User not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  try {
    await updateDoc(doc(db, "users", userId), userData);
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error); 
    throw error;
  }
};

// Follow/Unfollow a user
export const toggleFollowUser = async (userId: string, targetUserId: string, isFollowing = true) => {
  try {
    const batch = writeBatch(db);
    const userRef = doc(db, "users", userId);
    const targetUserRef = doc(db, "users", targetUserId);
    
    if (isFollowing) {
      batch.update(userRef, { following: arrayUnion(targetUserId) });
      batch.update(targetUserRef, { followers: arrayUnion(userId) });
    } else {
      batch.update(userRef, { following: arrayRemove(targetUserId) });
      batch.update(targetUserRef, { followers: arrayRemove(userId) });
    }
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error updating follow status:", error);
    throw error;
  }
};

// Fetch all users except the current user
export const fetchAllUsersExceptCurrent = async (currentUserId: string) => {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('userId', '!=', currentUserId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Upload profile photo for new user to Firebase Storage
export const uploadProfilePicture = async (userId: string, imageUri: string) => {
  const imageRef = ref(storage, `profilePictures/${userId}.jpg`);

  const imageData = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const blob = await fetch(`data:image/jpeg;base64,${imageData}`).then(res => res.blob());

  await uploadBytes(imageRef, blob);
  const downloadURL = await getDownloadURL(imageRef);
  return downloadURL;
};

// Save new user's pfp URL into Firestore
export const saveProfilePictureURL = async (userId: string, downloadURL: string) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      pfp: downloadURL,
    });
  } catch (error) {
    console.error("Error saving profile picture URL to Firestore:", error);
    throw error;
  }
};



// ===== STUDY SPACES FUNCTIONS =====

// Get all study spaces
export const getAllStudySpaces = async () => {
  try {
    const spacesCollection = collection(db, "studySpaces");
    const spacesSnapshot = await getDocs(spacesCollection);
    return spacesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting study spaces:", error);
    throw error;
  }
};

// Get a specific study space
export const getStudySpace = async (spaceId) => {
  try {
    const spaceDoc = await getDoc(doc(db, "studySpaces", spaceId));
    if (spaceDoc.exists()) {
      return { id: spaceDoc.id, ...spaceDoc.data() };
    } else {
      console.error("Study space not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting study space:", error);
    throw error;
  }
};

// gets a user's saved spaces
export const getSavedStudySpaces = async (userId) => {
  try {
    // Step 1: Get the user document
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const savedSpaces = userSnap.data().savedSpaces || [];

    if (savedSpaces.length === 0) {
      return []; // No saved spaces
    }

    // Step 2: Query the studySpaces collection by spaceId
    const studySpacesRef = collection(db, "studySpaces");

    // Firestore limits `in` queries to 10 values at a time
    const chunks = [];
    for (let i = 0; i < savedSpaces.length; i += 10) {
      chunks.push(savedSpaces.slice(i, i + 10));
    }

    const results = [];

    for (const chunk of chunks) {
      const q = query(studySpacesRef, where("spaceId", "in", chunk));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
    }

    return results;
  } catch (error) {
    console.error("Error fetching saved study spaces:", error);
    throw error;
  }
};

// Create a new study space
export const createStudySpace = async (userId, spaceData) => {
  try {
    // Add space to studySpaces collection
    const spaceRef = doc(collection(db, "studySpaces"));
    const spaceId = spaceRef.id;
    
    const fullSpaceData = {
      ...spaceData,
      spaceId,
      numRatings: 0,
      createdBy: userId
    };
    
    await setDoc(spaceRef, fullSpaceData);
    
    // Update user's createdSpaces array
    await updateDoc(doc(db, "users", userId), {
      createdSpaces: arrayUnion(spaceId)
    });
    
    return { success: true, spaceId };
  } catch (error) {
    console.error("Error creating study space:", error);
    throw error;
  }
};

// Save a study space
export const saveStudySpace = async (userId, spaceId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      savedSpaces: arrayUnion(spaceId)
    });
    return { success: true, spaceId };
  } catch (error) {
    console.error("Error saving study space:", error);
    throw error;
  }
}

// Unsave a study space
export const unsaveStudySpace = async (userId, spaceId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      savedSpaces: arrayRemove(spaceId)
    });
    return { success: true, spaceId };
  } catch (error) {
    console.error("Error unsaving study space:", error);
    throw error;
  }
};

// Update an existing study space
export const updateStudySpace = async (spaceId, spaceData) => {
  try {
    await updateDoc(doc(db, "studySpaces", spaceId), spaceData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating study space:", error);
    throw error;
  }
};

// ===== SESSION FUNCTIONS =====

interface SessionData {
  id: string;
  description: string;
  sessionType: string;
  spaceId: string;
  userId: string;
  users: string[];
  isActive: boolean;
  startTime: Date;
  endTime: Date | null;
}

// Get all sessions for a user
export const getUserSessions = async (userId) => {
  try {
    const sessionsCollection = collection(db, "sessions");
    const q = query(sessionsCollection, where("userId", "==", userId));
    const sessionsSnapshot = await getDocs(q);
    return sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting user sessions:", error);
    throw error;
  }
};

// Get a specific session
export const getSession = async (sessionId): Promise<SessionData | null> => {
  try {
    const sessionDoc = await getDoc(doc(db, "sessions", sessionId));
    if (sessionDoc.exists()) {
      const data = sessionDoc.data();
      // Defensive: ensure all required fields exist
      return {
        id: sessionDoc.id,
        description: data.description || '',
        sessionType: data.sessionType || '',
        spaceId: data.spaceId || '',
        userId: data.userId || '',
        users: data.users || [],
        isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
        startTime: data.startTime ? new Date(data.startTime) : new Date(),
        endTime: data.endTime ? new Date(data.endTime) : null
      };
    } else {
      console.error("Session not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting session:", error);
    throw error;
  }
};

// Create a new session
export const createSession = async (sessionData) => {
  try {
    const sessionRef = doc(collection(db, "sessions"));
    const sessionId = sessionRef.id;
    
    const fullSessionData = {
      ...sessionData,
      sessionId,
      isActive: true,
      startTime: new Date().toISOString()
    };
    
    await setDoc(sessionRef, fullSessionData);
    
    return { success: true, sessionId };
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};

// Update a session
export const updateSession = async (sessionId, sessionData) => {
  try {
    await updateDoc(doc(db, "sessions", sessionId), sessionData);
    return { success: true };
  } catch (error) {
    console.error("Error updating session:", error);
    throw error;
  }
};

// End a session
export const endSession = async (sessionId: string, userId?: string): Promise<boolean> => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) {
      throw new Error('Session not found');
    }
    const sessionData = sessionDoc.data();
    let updatedUsers = sessionData.users;
    let updatedPastUsers = sessionData.pastUsers || [];
    if (userId) {
      // Remove from users, add to pastUsers if not already there
      updatedUsers = sessionData.users.filter((id: string) => id !== userId);
      if (!updatedPastUsers.includes(userId)) {
        updatedPastUsers = [...updatedPastUsers, userId];
      }
    }
    if (updatedUsers.length === 0) {
      // If no users left, fully end the session
      await updateDoc(sessionRef, {
        isActive: false,
        endTime: new Date(),
        users: updatedUsers,
        pastUsers: updatedPastUsers
      });
    } else {
      // Otherwise just remove the user
      await updateDoc(sessionRef, {
        users: updatedUsers,
        pastUsers: updatedPastUsers
      });
    }
    return true;
  } catch (error) {
    console.error('Error ending session:', error);
    return false;
  }
};

// Leave a session
export const leaveSession = async (sessionId: string, userId: string): Promise<boolean> => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      throw new Error('Session not found');
    }

    const sessionData = sessionDoc.data() as SessionData;
    const updatedUsers = sessionData.users.filter(id => id !== userId);

    if (updatedUsers.length === 0) {
      // If no users left, end the session
      await updateDoc(sessionRef, {
        isActive: false,
        endTime: new Date(),
        users: updatedUsers
      });
    } else {
      // Otherwise just remove the user
      await updateDoc(sessionRef, {
        users: updatedUsers
      });
    }
    return true;
  } catch (error) {
    console.error('Error leaving session:', error);
    return false;
  }
};

// Get user's active session
export const getUserActiveSession = async (userId: string): Promise<SessionData | null> => {
  try {
    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef,
      where('users', 'array-contains', userId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const sessionDoc = snapshot.docs[0];
    return { id: sessionDoc.id, ...sessionDoc.data() as SessionData };
  } catch (error) {
    console.error('Error getting user active session:', error);
    return null;
  }
};

// Join a session
export const joinSession = async (sessionId: string, userId: string): Promise<boolean> => {
  try {
    // Defensive: never allow empty userId
    if (!userId || userId === "") {
      console.error("joinSession called with empty userId", userId);
      throw new Error("No valid user ID provided to joinSession");
    }
    // Check if user is already in an active session
    const activeSession = await getUserActiveSession(userId);
    if (activeSession) {
      if (activeSession.id === sessionId) {
        throw new Error('You are already in this session');
      }
      // Leave current session first
      await leaveSession(activeSession.id, userId);
    }

    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      throw new Error('Session not found');
    }

    const sessionData = sessionDoc.data() as SessionData;
    if (!sessionData.isActive) {
      throw new Error('Session is no longer active');
    }

    await updateDoc(sessionRef, {
      users: arrayUnion(userId)
    });
    return true;
  } catch (error) {
    console.error('Error joining session:', error);
    throw error;
  }
};

// Add user to a session
export const addUserToSession = async (sessionId, userId) => {
  try {
    await updateDoc(doc(db, "sessions", sessionId), {
      users: arrayUnion(userId)
    });
    return { success: true };
  } catch (error) {
    console.error("Error adding user to session:", error);
    throw error;
  }
};

// ===== COMMENT FUNCTIONS =====

// Get all comments for a space
export const getSpaceComments = async (spaceId) => {
  try {
    const commentsCollection = collection(db, "comments");
    const q = query(commentsCollection, where("space", "==", `/studySpaces/${spaceId}`));
    const commentsSnapshot = await getDocs(q);
    return commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting space comments:", error);
    throw error;
  }
};

// Get all comments by a user
export const getUserComments = async (userId) => {
  try {
    const commentsCollection = collection(db, "comments");
    const q = query(commentsCollection, where("user", "==", `/users/${userId}`));
    const commentsSnapshot = await getDocs(q);
    return commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting user comments:", error);
    throw error;
  }
};

// Create a new comment
export const createComment = async (userId, spaceId, text) => {
  try {
    const commentData = {
      user: `/users/${userId}`,
      space: `/studySpaces/${spaceId}`,
      text,
      timestamp: new Date().toISOString()
    };
    
    const commentRef = doc(collection(db, "comments"));
    const commentId = commentRef.id;
    
    await setDoc(commentRef, {
      ...commentData,
      commentId
    });
    
    // Add reference to the user's comments array
    await updateDoc(doc(db, "users", userId), {
      comments: arrayUnion(`/comments/${commentId}`)
    });
    
    return { success: true, commentId };
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

// Update a comment
export const updateComment = async (commentId, text) => {
  try {
    await updateDoc(doc(db, "comments", commentId), { text });
    return { success: true };
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (userId, commentId) => {
  try {
    const batch = writeBatch(db);
    
    // Delete the comment
    batch.delete(doc(db, "comments", commentId));
    
    // Remove from user's comments array
    batch.update(doc(db, "users", userId), {
      comments: arrayRemove(`/comments/${commentId}`)
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// ===== RATINGS & REVIEWS =====

// Add a review to a study space
export const addReview = async (userId, spaceId, rating, reviewText = "") => {
  try {
    const batch = writeBatch(db);
    const userRef = doc(db, "users", userId);
    const spaceRef = doc(db, "studySpaces", spaceId);
    
    // Get current space data to update rating
    const spaceDoc = await getDoc(spaceRef);
    const spaceData = spaceDoc.data();
    
    // Add to user's reviews
    const reviewData = {
      spaceId,
      rating,
      text: reviewText,
      timestamp: new Date().toISOString()
    };
    
    batch.update(userRef, {
      reviews: arrayUnion(reviewData)
    });
    
    // Update space rating
    const newNumRatings = (spaceData.numRatings || 0) + 1;
    batch.update(spaceRef, {
      numRatings: newNumRatings
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

// ===== POINTS & REWARDS =====

// Add points to a user
export const addPointsToUser = async (userId, points) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    const currentPoints = userData.points || 0;
    await updateDoc(userRef, {
      points: currentPoints + points
    });
    
    return { success: true, newPoints: currentPoints + points };
  } catch (error) {
    console.error("Error adding points:", error);
    throw error;
  }
};
