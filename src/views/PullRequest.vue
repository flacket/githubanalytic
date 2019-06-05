<template>
  <div class="pullrequest">

  <h1 class="subheading-1 blue--text">Pull Request:</h1>
  <v-form>
    <v-select
      v-model="number" :items="pulls" label="Número"
    ></v-select>
  </v-form>
  <h1 class="headline grey--text">{{repository.pullRequest.title}}
    <a class="subheading" target="_blank"
    :href="repository.pullRequest.url">
    #{{repository.pullRequest.number}}
    </a> 
  </h1>
  <v-container>
    <Comment v-for="item in repository.pullRequest.comments.edges"
    v-bind:item="item.node" v-bind:key="item.node.id">
      <v-divider></v-divider>
    </Comment>
  </v-container>
  </div>
</template>

<script>
import Comment from '../components/Comment'
import {GET_REPO} from '../queries.js'

export default {
  components: {
    Comment
  },
  data() {
    return {
      btn_toggle: 0,
      repository: '',
      number: 146,
      pulls: [56, 146, 157]
    }
  },
  apollo:{
    repository: {
      query: GET_REPO,
      variables: {owner: "cdr", name: "code-server", number: 146},
    },
  }
}
</script>