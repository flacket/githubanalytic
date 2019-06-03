<template>
  <div class="lineadetiempo">
  <h1 class="subheading-1 blue--text">Linea de Tiempo</h1>
  <h1 class="subheading grey--text">{{repository.pullRequest.title}}</h1>
  <h1 class="subheading-2 grey--text">{{repository.pullRequest.number}}</h1>
  <v-container>
<!-- 
  <CardProyecto v-for="item in user.repositories.edges" 
  v-bind:project="item.node" v-bind:key="item.node.id">
            <v-divider></v-divider>
  </CardProyecto>

   <ApolloQuery :query="require('@/queries/repositories.gql')">
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
//import CardProyecto from '../components/CardProyecto'
import {GET_REPO} from '../queries.js'

export default {
  components: {
    //CardProyecto
  },
  data() {
    return {
      btn_toggle: 0,
      repository: ''
    }
  },
  apollo:{
    repository: {
      query: GET_REPO,
      variables: {owner: "cdr", name: "code-server", number: 146}
    },
  }
}
</script>
