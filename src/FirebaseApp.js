import firebase from "firebase/compat/app";

const firebaseConfig = {
  apiKey: import.meta.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VUE_APP_FIREBASE_PROJECT_ID + ".firebaseapp.com",
  databaseURL:
    "https://" + import.meta.env.VUE_APP_FIREBASE_PROJECT_ID + ".firebaseio.com",
  projectId: import.meta.env.VUE_APP_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VUE_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.VUE_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
export default firebaseApp;
