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
        <th v-for="item in participants" :key="item" class="text-left">{{item}}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in countMatrix" :key="item.jota">
        <td v-for="jota in item" :key="jota.x">{{jota}}</td>
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
      participants: '',
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
      number: 154,
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
        var cantPersonas = this.repository.pullRequest.participants.totalCount
        this.participants = new Array();

        //cargar lista personas
        var self = this
        this.repository.pullRequest.participants.edges.forEach(function(element) {
          self.participants.push(element.node.login)
        })

        //crear matriz NxN
        var x = new Array(cantPersonas);
        for (var l = 0; l < cantPersonas; l++) {
          x[l] = new Array(cantPersonas);
        }
        this.countMatrix = x

        //cargar matriz (con ceros)
        for (var i = 0; i < cantPersonas; i++) {
          for (var j = 0; j < cantPersonas; j++) {
            this.countMatrix[i][j] = 0
          }
        }
        
        //Primer Cometario
        for (i = 1; i < cantPersonas; i++){
          this.countMatrix[0][i]++
        }
        this.repository.pullRequest.reactions.edges.forEach(function(element) {
          let encontrado = false
          let e = 1 //salteo el participante de la pos[0], no se va a autorreaccionar
          while (!encontrado){
            if (self.participants[e] == element.node.user.login){
              console.log('Reacciona 1er comment: ', self.participants[e])
              //este participante le reacciono al creador del PR
              self.countMatrix[e][0]++
              encontrado = true
            } else if (e == cantPersonas) 
              {encontrado = true}
            e++
          }
        })
console.log('----- COMMENTS -----')
        //Contar Cometarios
        this.repository.pullRequest.comments.edges.forEach(function(element) {
          let encontrado = false
          let c = 0
          while (!encontrado){
            if (self.participants[c] == element.node.author.login){
              console.log('Comenta: ', self.participants[c])
              encontrado = true
              //este participante ha hecho un comentario
              //Busco si el comentario menciona algun participante
              var arrobaBandera = false
              for (i = 0; i < cantPersonas; i++){
                if(element.node.body.search('@' + self.participants[i])>-1){
                  console.log(' -Hacia: @' + self.participants[i])
                  //el comentario menciona esta persona
                  arrobaBandera = true
                  if (c != i)  //si no es el que comenta
                  self.countMatrix[c][i]++
                }
              }
              if(!arrobaBandera){
                console.log(' -Hacia: Todos')
                //el comentario va para todos
                for (i = 0; i < cantPersonas; i++){
                  if (c != i)
                    self.countMatrix[c][i]++
                }
              }

              //reacciones al comentarios
              for (var index = 0; index<element.node.reactions.totalCount; index++){
                console.log('  -Reacciona: ', element.node.reactions.edges[index].node.user.login)
                let enc = false
                let j = 0
                while (!enc){
                  if (self.participants[j] == element.node.reactions.edges[index].node.user.login){
                    //este participante le reacciono al creador del PR
                    self.countMatrix[j][c]++
                    enc = true
                  } else if (j == cantPersonas)
                    {enc = true}
                  j++
                }
              }
            } else if (c == cantPersonas)
              {encontrado = true}
            c++
          }
        }) //contar comentarios
console.log('----- REVIEWS -----')
        //contar reviews
        this.repository.pullRequest.reviewThreads.edges.forEach(function(element){
          //este array va a mantener las personas que comentaron en el review
          //para despues poder usarlas como receptor en el conteo de interacciones
          var reviewArray = new Array()
          console.log('---')
          for (var comm = 0; comm < element.node.comments.totalCount; comm++){
            //busco el index del comentarista
            var encontrado = false
            var c = 0
            var posicion
            while (!encontrado){
              if (self.participants[c] == element.node.comments.edges[comm].node.author.login){
                console.log('Comenta: ', self.participants[c])
                encontrado = true
                //este participante ha hecho un comentario
                //se guarda su posicion
                posicion = c
              } else if (c == cantPersonas)
                {encontrado = true}
              c++
            }

            //TODO: ESTA PARTE SE PUEDE MEZCLAR CON EL "TODO" DE ABAJO
            //me fijo si debo agregar el comentarista al reviewArray
            let add = true
            c=0
            if(reviewArray.length != 0){
              while(add && c < reviewArray.length){
                if (posicion == reviewArray[c].pos)
                  {add = false}
                c++
              }
            }
            if(add){
              //Agrego el comentarista al array
              var data = { name: element.node.comments.edges[comm].node.author.login,
                          pos: posicion }
              reviewArray.push(data)
            }

            //TODO: ESTA PARTE SE PUEDE MEZCLAR CON EL "TODO" DE ARRIBA
            //si es el primer comentario del review
            if (reviewArray.length == 0){
              //Si es el que crea el PR el que comenta primero
              if(posicion == 0){
                for (i = 1; i < cantPersonas; i++){
                  //el comentario va para todos los participantes
                  self.countMatrix[0][i]++
                }
              } else {
                //el comentario va para el creador del PR
                self.countMatrix[posicion][0]++
              }
            } else {
              //sumo comentario de <<posicion>> a las personas
              //que ya comentaron en el mismo review
              for (i = 0; i < reviewArray.length; i++){
                if (posicion!=reviewArray[i].pos){
                  self.countMatrix[posicion][reviewArray[i].pos]++
                }
              }
            }

            //reacciones al comentarios
            for (var index = 0; index < element.node.comments.edges[comm].node.reactions.totalCount; index++){
              let enc = false
              let j = 0
              //busco la posicion en la matriz del que reacciona
              while (!enc){
                if (self.participants[j] == element.node.comments.edges[comm]
                                        .node.reactions.edges[index].node.user.login){
                  console.log(' -Reacciona: ', element.node.comments.edges[comm]
                                          .node.reactions.edges[index].node.user.login)
                  //este participante le reacciono al creador del PR
                  self.countMatrix[j][posicion]++
                  enc = true
                } else if (j == cantPersonas)
                  {enc = true}
                j++
              }
            }

          }
        }) //contar reviews
        console.log(x)
      })
    }
  }
}
</script>