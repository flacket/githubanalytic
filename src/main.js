import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import createProvider from './vue-apollo'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import firebaseApp from './FirebaseApp'

Vue.config.productionTip = false

let app = '';
firebaseApp.auth().onAuthStateChanged(() => {
  if (!app) {
    /* eslint-disable no-new */
    app = new Vue({
      router,
      vuetify,
      apolloProvider: createProvider(),
      render: h => h(App)
    }).$mount('#app')
  }
});
