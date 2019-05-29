import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Estadisticas from './views/Estadisticas.vue'
import Informes from './views/Informes.vue'
import LineaDeTiempo from './views/LineaDeTiempo.vue'
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
      path: '/lineadetiempo',
      name: 'lineadetiempo',
      component: LineaDeTiempo
    },
    {
      path: '/informes',
      name: 'informes',
      component: Informes
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
