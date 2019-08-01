<template>
  <div class="pullrequest">

  <h1 class="subheading-1 blue--text">Pull Request:</h1>
  <v-form>
    <v-select
      v-model="number" :items="pulls" label="Número" v-on:change='refreshQuery'
    ></v-select>
  </v-form>
  <h1 class="headline grey--text">{{repository.pullRequest.title}}
    <a class="subheading" target="_blank"
    :href="repository.pullRequest.url">
    #{{repository.pullRequest.number}}
    </a> 
  </h1>


    <v-simple-table>
    <thead>
      <tr>
        <th v-for="item in countMatrix[0]" :key="item.jota" class="text-left">Fila: {{item + 1}}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in countMatrix" :key="item.jota">
        <td v-for="jota in item" :key="jota.j">{{jota}}</td>
      </tr>
    </tbody>
  </v-simple-table>


  <v-container>
    <Comment 
      v-bind:avatarUrl="repository.pullRequest.author.avatarUrl"
      v-bind:login="repository.pullRequest.author.login"
      v-bind:createdAt="repository.pullRequest.createdAt"
      v-bind:reactCant="repository.pullRequest.reactions.totalCount"
      v-bind:body="repository.pullRequest.body"
    ><v-divider></v-divider>
    </Comment>
    <Comment v-for="item in repository.pullRequest.comments.edges"
    v-bind:avatarUrl="item.node.author.avatarUrl"
    v-bind:login="item.node.author.login"
    v-bind:createdAt="item.node.createdAt"
    v-bind:reactCant="item.node.reactions.totalCount"
    v-bind:body="item.node.body"
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
      v-bind:body="com.node.body"
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
      btn_toggle: 0,
      countMatrix: '',
      repository: {
        pullRequest: {
          author: {
            login: '',
            avatarUrl: ''
          },
          body: '',
          createdAt: '',
          number: '',
          state: '',
          title: '',
          url: '',
          reactions: {
            totalCount:'',
            edges: [{
              node: {
                user: {
                  login:''
                }
              }
            }]
          },
          participants: {
            totalCount: ''
          },
          reviewThreads: {
            edges: [{
              node: {
                comments: {
                  edges: [{
                    node: {
                      body: '',
                      author: {
                        login: '',
                        avatarUrl: ''
                      },
                      createdAt: '',
                      reactions: {
                        totalCount: '',
                        edges: [{
                          node: {
                            user: {
                              login: ''
                            }
                          }
                        }]
                      }
                    }
                  }]
                }
              }
            }]
          },
          comments: {
            edges: [{
              node: {
                body: '',
                createdAt: '',
                author : {
                  login: '',
                  avatarUrl: ''
                },
                reactions: {
                  totalCount: '',
                  edges: [{
                    node: {
                      user: {
                        login: ''
                      }
                    }
                  }]
                }
              }
            }]
          }
          }
        },
      number: 146,
      owner: 'cdr', name: 'code-server',
      pulls: [154, 146, 57, 104, 192, 365, 362, 472, 517, 640]
    }
  },
  apollo:{
    repository: {
      query: GET_REPO,
      variables: {owner: "cdr", name: "code-server", number: 154},
    },
  },
  methods: {
    refreshQuery() {
      this.$apollo.queries.repository.refetch({ number: this.number })
      .then(()=> {
        var cantPersonas = this.repository.pullRequest.participants.totalCount
        console.log('Participantes: ', cantPersonas)
        /*this.countMatrix = [cantPersonas][cantPersonas]
        counter.forEach(function (elemento, indice, array) {
          console.log(elemento, indice)
        })*/

        //crear matriz
        var x = new Array(cantPersonas);
        for (var l = 0; l < x.length; l++) {
          x[l] = new Array(cantPersonas);
        }
        this.countMatrix = x

        //cargar matriz
        for (var i = 0; i < x.length; i++) {
          for (var j = 0; j < x.length; j++) {
            x[i][j] = 0
          }
        }
        console.log(x);

      })
    }
  }
}
</script>