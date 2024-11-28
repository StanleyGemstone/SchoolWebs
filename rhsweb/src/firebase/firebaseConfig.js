// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVFGjYtgU28zki4twTBlBHHlBTRuvzF-0",
  authDomain: "rhsweb-a7bb6.firebaseapp.com",
  projectId: "rhsweb-a7bb6",
  storageBucket: "rhsweb-a7bb6.firebasestorage.app",
  messagingSenderId: "707901710922",
  appId: "1:707901710922:web:27a1d8aecc4d7c490f7cb3",
  measurementId: "G-P4YTTNLJEW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };