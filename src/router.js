import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import firebaseApp from './FirebaseApp'

import Estadisticas from './views/Estadisticas.vue'
//import Informes from './views/Informes.vue'
import UserStats from './views/UserStats.vue'
import PullRequest from './views/PullRequest.vue'
import Configuracion from './views/Configuracion.vue'
import Acerca from './views/Acerca.vue'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/estadisticas',
      name: 'estadisticas',
      component: Estadisticas,
      meta:{
        requiresAuth: true
      }
    },
    {
      path: '/pullrequest',
      name: 'pullrequest',
      component: PullRequest,
      meta:{
        requiresAuth: true
      }
    },
    {
      path: '/userstats',
      name: 'userstats',
      component: UserStats,
      meta:{
        requiresAuth: true
      }
    },
    {
      path: '/configuracion',
      name: 'configuracion',
      component: Configuracion,
      meta:{
        requiresAuth: true
      }
    },
    {
      path: '/acerca',
      name: 'acerca',
      component: Acerca
    }
  ]
})

//Nav Royal Guards
router.beforeEach((to, from, next) => {
  //check for requireddAuth guard
  if(to.matched.some(record => record.meta.requiresAuth)) {
    //check if NOT logged in
    if(!firebaseApp.auth().currentUser){
      //Go to login 
      next({
        path: '/error',
        query:{
          redirect: to.fullPath
        }
      });
    } else next();
  } else if (to.matched.some(record => record.meta.requiresGuest)){
      //check if logged in
    if(firebaseApp.auth().currentUser){
      //Go to login 
      next({
        path: '/',
        query:{
          redirect: to.fullPath
        }
      });
    } else next();
  } else next();
});

export default router;