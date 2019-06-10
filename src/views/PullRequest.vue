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
    v-bind:avatarUrl="item.node.author.avatarUrl"
    v-bind:login="item.node.author.login"
    v-bind:createdAt="item.node.createdAt"
    v-bind:reactCant="item.node.reactions.edges.length"
    v-bind:body="item.node.body "
    v-bind:key="item.node.id">
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