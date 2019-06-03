<template>
  <div class="estadisticas">
  <h1 class="subheading-1 blue--text">Estadísticas</h1>
  <!--<h1 class="subheading grey--text">{{user.name}}</h1>
  --><v-container>

  <v-layout row class="pb-3">
    <v-btn-toggle class="transparent" v-model="btn_toggle">
      <v-tooltip top>
        <v-btn small flat @click="sortBy('title')" slot="activator">
          <v-icon small left>folder</v-icon>
          <span class="caption text-lowercase">Por proyecto</span>
        </v-btn>
        <span>Ordena la lista por proyectos</span>
      </v-tooltip> 
      <v-tooltip top>
        <v-btn small flat @click="sortBy('person')" slot="activator">
          <v-icon small left>person</v-icon>
          <span class="caption text-lowercase">Por persona</span>
        </v-btn>
        <span>Ordena la lista por persona</span>
      </v-tooltip> 
      <v-tooltip top>
        <v-btn small flat @click="sortBy('status')" slot="activator">
          <v-icon small left>check_circle</v-icon>
          <span class="caption text-lowercase">Por estado</span>
        </v-btn>
        <span>Ordena la lista por estado</span>
      </v-tooltip> 
    </v-btn-toggle>
  </v-layout>

  <CardProyecto v-for="item in user.repositories.edges" 
  v-bind:project="item.node" v-bind:key="item.node.id">
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
import {GET_REPOS} from '../queries.js'

export default {
  components: {
    CardProyecto
  },
  data() {
    return {
      btn_toggle: 0,
      user: ''
    }
  },
  apollo:{
    user: GET_REPOS
  }/*,
  methods: {
    sortBy(prop) {
      this.projects.sort((a,b) => a[prop] < b[prop] ? -1 : 1)
    }
  }*/
}
/*
        { title: 'Design a new website', person: 'The Net Ninja', due: '1st Jan 2019', status: 'ongoing', content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt consequuntur eos eligendi illum minima adipisci deleniti, dicta mollitia enim explicabo fugiat quidem ducimus praesentium voluptates porro molestias non sequi animi!'},
        { title: 'Code up the homepage', person: 'Chun Li', due: '10th Jan 2019', status: 'complete', content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt consequuntur eos eligendi illum minima adipisci deleniti, dicta mollitia enim explicabo fugiat quidem ducimus praesentium voluptates porro molestias non sequi animi!'},
        { title: 'Design video thumbnails', person: 'Ryu', due: '20th Dec 2018', status: 'complete', content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt consequuntur eos eligendi illum minima adipisci deleniti, dicta mollitia enim explicabo fugiat quidem ducimus praesentium voluptates porro molestias non sequi animi!'},
        { title: 'Create a community forum', person: 'Gouken', due: '20th Oct 2018', status: 'overdue', content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt consequuntur eos eligendi illum minima adipisci deleniti, dicta mollitia enim explicabo fugiat quidem ducimus praesentium voluptates porro molestias non sequi animi!'},
     */ 
</script>