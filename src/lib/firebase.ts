import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  projectId: "studied-turbine-25jvd",
  appId: "1:81977064894:web:e7b4be1b96c080be784def",
  apiKey: "AIzaSyDRgkkTgrN9g_kss4EsGzQeInfujnExkms",
  authDomain: "studied-turbine-25jvd.firebaseapp.com",
  storageBucket: "studied-turbine-25jvd.firebasestorage.app",
  messagingSenderId: "81977064894"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { 
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}, "ai-studio-bbfb202e-374e-438e-9c0b-82f1fdbe19e0");
export const storage = getStorage(app);
