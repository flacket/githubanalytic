import firebase from 'firebase/app'
import 'firebase/auth'

//Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzrBIkMUFCRNS54cNNcJKm-GJUbXfQ8Sk",
  authDomain: "github-analytic.firebaseapp.com",
  databaseURL: "https://github-analytic.firebaseio.com",
  projectId: "github-analytic",
  storageBucket: "",
  messagingSenderId: "13664469414",
  appId: "1:13664469414:web:61898e0bfdc563ecb28f67"
}

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig)
export default firebaseApp