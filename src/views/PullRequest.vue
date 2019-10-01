<template>
  <div class="pullrequest">
    <h1 class="subheading-1 blue--text">Pull Request:</h1>
    <PRSelector
      v-on:searchPR="refreshQuery"
    ><v-divider></v-divider>
    </PRSelector>
    <h1 v-if="show" class="headline grey--text">{{repository.pullRequest.title}}
      <a class="subheading" target="_blank"
      :href="repository.pullRequest.url">
      #{{repository.pullRequest.number}}
      </a> 
    </h1>
    <v-progress-linear v-if="$apollo.loading" indeterminate color="primary"></v-progress-linear>
    <v-container v-if="show">
      <Comment 
        v-bind:avatarUrl="repository.pullRequest.author.avatarUrl"
        v-bind:login="repository.pullRequest.author.login"
        v-bind:createdAt="repository.pullRequest.createdAt"
        v-bind:reactCant="repository.pullRequest.reactions.totalCount"
        v-bind:body="repository.pullRequest.bodyHTML"
      ><v-divider></v-divider>
      </Comment>
      <Comment v-for="item in repository.pullRequest.comments.nodes"
      v-bind:avatarUrl="item.author.avatarUrl"
      v-bind:login="item.author.login"
      v-bind:createdAt="item.createdAt"
      v-bind:reactCant="item.reactions.totalCount"
      v-bind:body="item.bodyHTML"
      v-bind:key="item.id">
      <v-divider></v-divider>
      </Comment>
        <h1 class="subheading grey--text mt-3">Reviews:</h1>
      <div v-for="item in repository.pullRequest.reviewThreads.nodes"
      v-bind:key="item.id" class="my-2 ml-4">
        <Comment v-for="com in item.comments.nodes"
        v-bind:avatarUrl="com.author.avatarUrl"
        v-bind:login="com.author.login"
        v-bind:createdAt="com.createdAt"
        v-bind:reactCant="com.reactions.totalCount"
        v-bind:body="com.bodyHTML"
        v-bind:key="com.id">
        <v-divider></v-divider>
        </Comment>
      </div>
    </v-container>
  </div>
</template>

<script>
import Comment from '../components/Comment'
import PRSelector from '../components/PRSelector'
import {GET_REPO} from '../graphql/queries.js'

export default {
  components: {
    Comment,
    PRSelector
  },
  data() {
    return {
      show: false,
      repository: '',
      pulls: [154, 146, 57, 104, 192, 365, 362, 472, 517, 640,
      917, 625, 221, 441, 679, 480, 130, 113, 475, 344, 450,
      915, 379, 471, 201, 225, 72, 433, 701, 781, 362, 640, 
      28, 167, 120, 269, 303, 311, 285, 422, 722, 255, 307, 
      246, 416, 730, 916, 794, 998, 857]
    }
  },
  apollo:{
    repository: {
      query: GET_REPO,
      variables: {owner: "cdr", name: "code-server", number: 154},
      //{"owner": "cdr", "name": "code-server", "number": 517}
    },
  },
  methods: {
    refreshQuery(search) {
      this.$apollo.queries.repository.refetch({ 
        owner: search.owner, 
        name: search.name, 
        number: parseInt(search.number)
      })
      .then(() => {
        this.show = true
      })
      .catch((err) =>{ 
        console.log('Ocurrio un problema al buscar el PR: ', err.message)
        this.show = false
      })
    }//refresh query
  }
}
</script>