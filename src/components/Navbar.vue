<template>
<div id="inspire">
  <v-navigation-drawer app
      :clipped="$vuetify.breakpoint.lgAndUp"
      v-model="drawer">
    <v-list dense>
      <template v-for="link in links">
        <v-layout
          v-if="link.heading"
          :key="link.heading"
          row align-center >
        </v-layout>
        <v-list-item v-else :key="link.text"  router :to="link.route">
          <v-list-item-action>
            <v-icon>{{ link.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ link.text }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
  
  <v-app-bar app dark color="blue darken-3"
    :clipped-left="$vuetify.breakpoint.lgAndUp">
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title class="headline text-uppercase">
      <span class="font-weight-bold">GITHUB</span>
      <span class="font-weight-light">ANALYTIC</span>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <GithubLogin />
  </v-app-bar>
</div>
</template>

<script>
//import Login from './Login'
import GithubLogin from './GithubLogin'
export default {
  components: { 
    //Login, 
    GithubLogin 
  },
  data(){
    return{
      dialog: false,
    drawer: null,
    links: [
      { icon: 'home', text: 'Inicio', route: '/' },
      { icon: 'pie_chart', text: 'Estadísticas', route: '/estadisticas' },
      { icon: 'list_alt', text: 'Pull Request', route: '/pullrequest' },
      { icon: 'timeline', text: 'User Stats', route: '/userstats' },
      { icon: 'settings', text: 'Configuración', route: '/configuracion' },
      { icon: 'help', text: 'Acerca de', route: '/acerca' }
    ]
    }
  },
  props: {
    source: String
  } 
}
</script>
