import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVFGjYtgU28zki4twTBlBHHlBTRuvzF-0",
  authDomain: "rhsweb-a7bb6.firebaseapp.com",
  projectId: "rhsweb-a7bb6",
  storageBucket: "rhsweb-a7bb6.firebasestorage.app",
  messagingSenderId: "707901710922",
  appId: "1:707901710922:web:27a1d8aecc4d7c490f7cb3",
  measurementId: "G-P4YTTNLJEW"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };