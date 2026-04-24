import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// ─── Config ──────────────────────────────────────────────────────────────────
// NEXT_PUBLIC_ vars are inlined by Next.js at build time on the client bundle
// and available at runtime from process.env.  They are also available during
// SSR because Next.js exposes them server-side as well, but only after the
// .env.local file has been loaded by the Next.js server process.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// ─── App (singleton, safe with HMR) ──────────────────────────────────────────
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ─── Services ─────────────────────────────────────────────────────────────────
// getAuth / getFirestore / getStorage are safe to call on both server and
// client when the app is already initialised.  Auth on the server just won't
// have a persisted session, but it won't throw unless the apiKey is missing.
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export default app;
