import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCiCKHd6SfP86aQHjbrou7bGF8VVMg7PXE",
  authDomain: "gen-lang-client-0680043177.firebaseapp.com",
  projectId: "gen-lang-client-0680043177",
  storageBucket: "gen-lang-client-0680043177.firebasestorage.app",
  messagingSenderId: "16806890900",
  appId: "1:16806890900:web:43eb09c67d8d14ab309381",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, 'snapdex-india-db-1');
