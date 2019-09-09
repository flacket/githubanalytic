import * as firebase from "firebase/app"
import 'firebase/auth'


const firebaseConfig = {
  //Your web app's Firebase configuration
}

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig)
export default firebaseApp