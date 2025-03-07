import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyBw099KF6lZWnvQjIrJufM5jWb-F7I1I0c",
  authDomain: "reepost-f6b39.firebaseapp.com",
  projectId: "reepost-f6b39",
  storageBucket: "reepost-f6b39.appspot.com",
  messagingSenderId: "639829835827",
  appId: "1:639829835827:web:655964aa7859ad27822346"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Configure persistence to LOCAL by default
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting up persistence:", error);
  });