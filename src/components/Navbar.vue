<template>
  <nav>
  <v-navigation-drawer app fixed
      :clipped="$vuetify.breakpoint.mdAndUp"
      v-model="drawer">
    <v-list dense>
      <v-list-tile v-for="link in links" :key="link.text" router :to="link.route">
        <v-list-tile-action>
          <v-icon>{{ link.icon }}</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ link.text }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>

  <v-toolbar color="primary" dark fixed app
    :clipped-left="$vuetify.breakpoint.mdAndUp"
  >
    <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
    <v-toolbar-title class="headline text-uppercase">
      <span class="font-weight-bold">GITHUB</span>
      <span class="font-weight-light">ANALYTIC</span>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <Login />
  </v-toolbar>
  </nav>
</template>

<script>
import Login from './Login'
export default {
  components: { Login },
  data(){
    return{
      dialog: false,
    drawer: null,
    links: [
      { icon: 'home', text: 'Inicio', route: '/' },
      { icon: 'pie_chart', text: 'Estadísticas', route: '/estadisticas' },
      { icon: 'timeline', text: 'Linea de Tiempo', route: '/lineadetiempo' },
      { icon: 'list_alt', text: 'Informes', route: '/informes' },
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
