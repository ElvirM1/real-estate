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
// Guard: only call getAuth/getFirestore/getStorage when the API key is present.
// During Next.js static prerendering (e.g. /_not-found) NEXT_PUBLIC_ vars may
// be absent on the Vercel build server.  All real usages live inside
// "use client" components / useEffect hooks, so undefined is never reached
// at actual runtime.
const configured = !!firebaseConfig.apiKey;

export const auth: Auth = configured
  ? getAuth(app)
  : (undefined as unknown as Auth);
export const db: Firestore = configured
  ? getFirestore(app)
  : (undefined as unknown as Firestore);
export const storage: FirebaseStorage = configured
  ? getStorage(app)
  : (undefined as unknown as FirebaseStorage);
export default app;
