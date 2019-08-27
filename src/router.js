import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Estadisticas from './views/Estadisticas.vue'
//import Informes from './views/Informes.vue'
import UserStats from './views/UserStats.vue'
import PullRequest from './views/PullRequest.vue'
import Configuracion from './views/Configuracion.vue'
import Acerca from './views/Acerca.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/estadisticas',
      name: 'estadisticas',
      component: Estadisticas
    },
    {
      path: '/pullrequest',
      name: 'pullrequest',
      component: PullRequest
    },
    {
      path: '/userstats',
      name: 'userstats',
      component: UserStats
    },
    {
      path: '/configuracion',
      name: 'configuracion',
      component: Configuracion
    },
    {
      path: '/acerca',
      name: 'acerca',
      component: Acerca
    }
  ]
})
