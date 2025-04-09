import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdCPBQt8Mu9Cn3uYIU21lmbNa5O1QX_sU",
  authDomain: "studymap-5c5ae.firebaseapp.com",
  projectId: "studymap-5c5ae",
  storageBucket: "studymap-5c5ae.firebasestorage.app",
  messagingSenderId: "706349997559",
  appId: "1:706349997559:web:3125556dab386ac4f322f2",
  measurementId: "G-LFTPF7RVQP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { storage, auth, db };
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

//to host on firebase cli, go to terminal in projects root folder, then firebase login, firebase init, firebase deploy