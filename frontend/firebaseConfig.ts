// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyB6MjHN1zTp1dr99MSkV74t-q3fhI4H7T0',
  authDomain: 'munch-37564.firebaseapp.com',
  projectId: 'munch-37564',
  storageBucket: 'munch-37564.appspot.com',
  messagingSenderId: '927916149392',
  appId: '1:927916149392:web:649c182b29431dea90a615',
  measurementId: 'G-GPPV3KQXED',
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage),
});
