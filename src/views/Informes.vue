<template>
  <div class="Informes">
  <h1 class="subheading-1 blue--text">Informes</h1>
  <!--<h1 class="subheading grey--text">{{user.name}}</h1>-->
  <v-container>

  <v-layout class="pb-3">
    <v-btn-toggle class="transparent" v-model="btn_toggle">
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn small text @click="sortBy('title')" v-on="on">
            <v-icon small left>folder</v-icon>
            <span class="caption text-lowercase">Por proyecto</span>
          </v-btn>
        </template>
        <span>Ordena la lista por proyectos</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn small text @click="sortBy('person')" v-on="on">
            <v-icon small left>person</v-icon>
            <span class="caption text-lowercase">Por persona</span>
          </v-btn>
        </template>
        <span>Ordena la lista por persona</span>
      </v-tooltip> 

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn small text @click="sortBy('status')" v-on="on">
            <v-icon small left>check_circle</v-icon>
            <span class="caption text-lowercase">Por estado</span>
          </v-btn>
        </template>
        <span>Ordena la lista por estado</span>
      </v-tooltip>
    </v-btn-toggle>
  </v-layout>

  <CardProyecto v-for="item in user.repositories.nodes" 
  v-bind:project="item" v-bind:key="item.id">
            <v-divider></v-divider>
  </CardProyecto>

<!--    <ApolloQuery :query="require('@/queries/repositories.gql')">
      <template slot-scope="{ result: { data, loading } }">
        <div v-if="loading">Loading...</div>
        <ul v-else>
          // eslint-disable-next-line vue/require-v-for-key
          <li v-for="repo of user.name" class="user">
            {{ item.name }}
          </li>
        </ul>
      </template>
    </ApolloQuery>-->

  </v-container>
  </div>
</template>

<script>
import CardProyecto from '../components/CardProyecto'
import {GET_USER} from '../graphql/queries.js'

export default {
  components: {
    CardProyecto
  },
  data() {
    return {
      btn_toggle: 0,
      user: {
        repositories: {
          nodes: [{
            name: '',
            nameWithOwner: '',
            createdAt: '',
            isPrivate: '',
            description: ''
          }]
        }
      }
    }
  },
  apollo:{
    user: {
      query: GET_USER,
      variables: {login: "Flacket"}
    }
  }/*,
  methods: {
    sortBy(prop) {
      this.projects.sort((a,b) => a[prop] < b[prop] ? -1 : 1)
    }
  }*/
}
</script>