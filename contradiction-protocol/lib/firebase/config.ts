import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAu2WEOTV_sU5wPd2LfIIxoc8dQaze0pjQ",
  authDomain: "contradiction-protocol.firebaseapp.com",
  projectId: "contradiction-protocol",
  storageBucket: "contradiction-protocol.firebasestorage.app",
  messagingSenderId: "135711545877",
  appId: "1:135711545877:web:3b6a20dd45df336b7d0c1c",
  measurementId: "G-9973DQ396X",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
