import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDocFromServer, collection } from "firebase/firestore";
// @ts-ignore
// ✅ 改成這樣：
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Firebase Sign In Error", error);
  }
};

export const signOut = async () => {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error("Firebase Sign Out Error", error);
  }
};

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: any;
}

export const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null) => {
  const user = auth.currentUser;
  const authInfo = user ? {
    userId: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    isAnonymous: user.isAnonymous,
    providerInfo: user.providerData
  } : null;

  const errorInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo
  };
  
  if (errorInfo.error.includes("Missing or insufficient permissions") || errorInfo.error.includes("permission-denied")) {
     console.error("Firestore Permission Denied Payload: ", JSON.stringify(errorInfo));
     throw new Error(JSON.stringify(errorInfo));
  }
  
  console.error("Firestore error:", errorInfo);
  throw error;
};

// Validate connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();
