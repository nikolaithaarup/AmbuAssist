import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase web client identifiers are intentionally public. They identify the
// Firebase project; Firestore rules and App Check enforce access. Never place a
// service-account credential or Admin SDK secret in EXPO_PUBLIC_* variables.
export const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyDIJAdngVOQ9SidsoU8bxAerV8Ec2oYRxU",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "ambuassist-99a75.firebaseapp.com",
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "ambuassist-99a75",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "ambuassist-99a75.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1006971597281",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    "1:1006971597281:web:f4df8bb1123fe1ee0362a0",
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-CSWFM0ZVDR",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
