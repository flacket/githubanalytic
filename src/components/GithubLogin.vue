<template>
  <div>
    <v-btn v-if="!isLoggedIn" @click="githubLogin" color="primary white--text">
      <v-icon left>{{ghIcon}}</v-icon>Iniciar Sesión
    </v-btn>
    <v-btn v-if="isLoggedIn" @click="githublogout" color="primary white--text">
      Cerrar Sesión
    </v-btn>
  </div>
</template>

<script>
import firebaseApp from "../FirebaseApp";
import firebase from "firebase/app"
import "firebase/auth"
import { mdiGithubCircle } from "@mdi/js"

export default {
data() {
  return {
    isLoggedIn: false,
    ghIcon: mdiGithubCircle
  }
},
created() {
  var user = firebaseApp.auth().currentUser
  if (user) this.isLoggedIn = true
  else this.isLoggedIn = false
  console.log('current user: ', user)
  },
methods: {
  async githubLogin() {
    var provider = new firebase.auth.GithubAuthProvider()
    provider.addScope('repo');

    await firebaseApp.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a GitHub Access Token. You can use it to access the GitHub API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user.displayName;
      localStorage.setItem("tokenId", token)
      localStorage.setItem("user", user)
      console.log('Usuario Logueado: ', user)
      console.log('TokenId: ', token)
    }).catch(function(error) {
      console.log('errorCode: ', error.code)
      console.log('errorMessage: ', error.message)
      // The email of the user's account used.
      console.log('email: ', error.email)
      // The firebase.auth.AuthCredential type that was used.
      console.log('credential: ', error.credential)
    });
    //this.$router.go({path: '/'});
  },
  githublogout(){
    var self = this
    firebase.auth().signOut().then(function() {
      localStorage.setItem("tokenId", null)
      localStorage.setItem("user", null)
      self.$router.go({path: '/'});
    }).catch(function(error) {
      console.log('errorCode: ', error.code)
      console.log('errorMessage: ', error.message)
    });
  }
}
}
</script>