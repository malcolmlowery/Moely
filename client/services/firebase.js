import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  connectAuthEmulator,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  getAuth,
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  where, 
  query, 
  collection, 
  getDoc,
  orderBy,
  connectFirestoreEmulator,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAlmMFSQS0C9uR_MKSVkjxPpv673clBLlg",
  authDomain: "moely-68eee.firebaseapp.com",
  projectId: "moely-68eee",
  storageBucket: "moely-68eee.appspot.com",
  messagingSenderId: "146297418980",
  appId: "1:146297418980:web:f333cb188b32a917fb68f1",
  measurementId: "G-CM0TEYZR8D"
};
  
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
const db = getFirestore(app);

// connectAuthEmulator(auth, 'http://127.0.0.1:9099');
// connectFirestoreEmulator(db, 'localhost', 8080);

export { 
  auth, 
  db,
  doc,
  getDoc,
  onAuthStateChanged,
  onSnapshot,
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  where,
  orderBy,
  collection,
  query,
  getAuth,
};