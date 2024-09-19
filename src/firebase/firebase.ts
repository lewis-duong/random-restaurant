// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyBGGxZ9o9fPVN8K1mUXpqcmlCCq_S8uXxM",
  authDomain: "random-wheel-e989a.firebaseapp.com",
  databaseURL: "https://random-wheel-e989a-default-rtdb.firebaseio.com",
  projectId: "random-wheel-e989a",
  storageBucket: "random-wheel-e989a.appspot.com",
  messagingSenderId: "467824764941",
  appId: "1:467824764941:web:d50eeb13588cde72f7cd44",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const database = getDatabase(app);
const storage = getStorage(app);

export {
  firebaseConfig,
  app,
  auth,
  googleProvider,
  database,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
};
