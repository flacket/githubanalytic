<template>
  <div class="pullrequest">
  <h1 class="subheading-1 blue--text">Pull Request:</h1>
  <h1 class="headline grey--text">{{repository.pullRequest.title}}
    <span class="subheading grey--text">#{{repository.pullRequest.number}}</span>
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
      repository: ''
    }
  },
  apollo:{
    repository: {
      query: GET_REPO,
      variables: {owner: "cdr", name: "code-server", number: 154},
      /*update(data) {
        console.log(data)
        // The returned value will update
        // the vue property 'pingMessage'
        return data.pullRequest
      },*/
    },
  }
}
</script>
