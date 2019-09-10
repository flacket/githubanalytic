<template>
  <div class="pullrequest">

  <h1 class="subheading-1 blue--text">Pull Request:</h1>
  <v-form>
    <v-select
      v-model="number" :items="pulls" label="Número" v-on:change='refreshQuery'
    ></v-select>
  </v-form>
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
    <Comment v-for="item in repository.pullRequest.comments.edges"
    v-bind:avatarUrl="item.node.author.avatarUrl"
    v-bind:login="item.node.author.login"
    v-bind:createdAt="item.node.createdAt"
    v-bind:reactCant="item.node.reactions.totalCount"
    v-bind:body="item.node.bodyHTML"
    v-bind:key="item.node.id">
    <v-divider></v-divider>
    </Comment>
      <h1 class="subheading grey--text mt-3">Reviews:</h1>
    <div v-for="item in repository.pullRequest.reviewThreads.edges"
    v-bind:key="item.node.id" class="my-2 ml-4">
      <Comment v-for="com in item.node.comments.edges"
      v-bind:avatarUrl="com.node.author.avatarUrl"
      v-bind:login="com.node.author.login"
      v-bind:createdAt="com.node.createdAt"
      v-bind:reactCant="com.node.reactions.totalCount"
      v-bind:body="com.node.bodyHTML"
      v-bind:key="com.node.id">
      <v-divider></v-divider>
      </Comment>
    </div>
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
      show: false,
      repository: '',
      number: '',
      owner: 'cdr', name: 'code-server',
      pulls: [154, 146, 57, 104, 192, 365, 362, 472, 517, 640]
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
    refreshQuery() {
      this.$apollo.queries.repository.refetch({ number: this.number })
      .then(() => {
        this.show = true
      })
    }//refresh query
  }
}
</script>