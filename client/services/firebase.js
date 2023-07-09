import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const fb_config = {
    apiKey: "AIzaSyDeW3haYqbABaXG6vB-ObOEvbLHurlJRVI",
    authDomain: "medrant-baa93.firebaseapp.com",
    projectId: "medrant-baa93",
    storageBucket: "medrant-baa93.appspot.com",
    messagingSenderId: "713435796533",
    appId: "1:713435796533:web:cfb936d97802266ff8cd7c",
    measurementId: "G-SFDY2V0BQS"
  };
  
const app = initializeApp(fb_config);
const firestore = getFirestore(app);
// const functions = getFunctions(app);

// connectFunctionsEmulator(functions, '0.0.0.0', 5001)
connectFirestoreEmulator(firestore, '127.0.0.1', 5001);