<template>
  <div class="pullrequest">

  <h1 class="subheading-1 blue--text">Estadísticas</h1>
  <v-form>
    <v-select
      v-model="number" :items="pulls" label="Pull Request" v-on:change='refreshQuery'
    ></v-select>
  </v-form>
  <h1 v-if="show" class="headline grey--text">{{repository.pullRequest.title}}
    <a class="subheading" target="_blank"
    :href="repository.pullRequest.url">
    #{{repository.pullRequest.number}}
    </a> 
  </h1>
  <div v-if="show">
    <h1 class="headline blue--text mt-4 mb-1">Tabla de Conteo</h1>
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
    <h1 class="headline blue--text mt-4 mb-1">Matriz de Cohesion Individual</h1>
    <v-simple-table>
      <thead>
        <tr>
          <th v-for="item in participants" :key="item" class="text-left">{{item}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in cohesionMatrix" :key="item.jota">
          <td v-for="jota in item" :key="jota.x">{{jota}}</td>
        </tr>
      </tbody>
    </v-simple-table>
    <h1 class="headline blue--text mt-4 mb-1">Promedio Cohesion Individual</h1>
    <v-simple-table>
      <thead>
        <tr>
          <th v-for="item in participants" :key="item" class="text-left">{{item}}</th>
        </tr>
      </thead>
      <tbody>
        <tr >
          <td v-for="item in cohesionInd" :key="item.jota">{{item}}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </div>

  </div>
</template>

<script>
import {GET_REPO} from '../queries.js'

export default {
  data() {
    return {
      show: false,
      countMatrix: '',
      cohesionMatrix: '',
      cohesionInd: '',
      participants: '',
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
    cohesionIndividual() {
      var cantPersonas = this.participants.length
      var x = new Array(cantPersonas);

      console.log('--- Cohesion Individual ---')
      for (var i = 0; i < cantPersonas; i++){
        var coInd = 0 
        for(var j = 0; j < cantPersonas; j++){
          coInd += this.cohesionMatrix[i][j]
        }
        x[i] = (coInd / (cantPersonas - 1))
        console.log(this.participants[i], ':')
        console.log('  -', x[i])
      }
      this.cohesionInd = x
      console.log(this.cohesionInd)
    },
    cohesionFormula() {
      var cantPersonas = this.participants.length
      //crear matriz NxN
      var x = new Array(cantPersonas);
      for (let n = 0; n < cantPersonas; n++)
        { x[n] = new Array(cantPersonas) }
      this.cohesionMatrix = x

      for(let c = 0; c < cantPersonas; c++){
        for(let f = 0; f < cantPersonas; f++){
          //contar cohesion para [c][f]
          if (c==f) 
            this.cohesionMatrix[c][f] = 0
          else{ 
            var result
            var dif = Math.abs(this.countMatrix[c][f] - this.countMatrix[f][c])
            if(dif > 0){
              result = 1 - (dif / (this.countMatrix[c][f] + this.countMatrix[f][c]))
            } else result = 0
            this.cohesionMatrix[c][f] = result
            this.cohesionMatrix[f][c] = result
          }
        }
      }
      this.cohesionIndividual()
    },
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
          //verifico si el comentario esta antes de la fecha de cierre
          if(element.node.createdAt < self.repository.pullRequest.closedAt || !self.repository.pullRequest.closedAt){
          let encontrado = false
          let c = 0
          while (!encontrado){
            if (self.participants[c] == element.node.author.login){
              console.log('Comenta: ', self.participants[c])
              encontrado = true
              //este participante ha hecho un comentario
              //Busco si el comentario menciona (@) algun participante
              var arrobaBandera = false
              for (i = 0; i < cantPersonas; i++){
                if(element.node.body.search('@' + self.participants[i])>-1){
                  //el comentario menciona esta persona
                  if (c != i){  //si no es el que comenta
                    console.log(' -Hacia: @' + self.participants[i])
                    self.countMatrix[c][i]++
                    arrobaBandera = true
                  }
                }
              }
              if(!arrobaBandera){
                console.log(' -Hacia: Todos')
                //el comentario va para todos
                for (i = 0; i < cantPersonas; i++){
                  if (c != i) //si no es el que comenta
                    self.countMatrix[c][i]++
                }
              }

              //reacciones al comentarios
              //crear array de reaccionadores
              var reactionArray = new Array()
              for (var index = 0; index < element.node.reactions.totalCount; index++){
                let enc = false
                let j = 0
                while (!enc){
                  if (self.participants[j] == element.node.reactions.edges[index].node.user.login){
                    //este participante le reacciono al creador del PR
                    enc = true
                    //verificar si no reacciono antes
                    let i = 0
                    var yaReacciono = false
                    while(i < reactionArray.length && !yaReacciono){
                      if(self.participants[j] == reactionArray[i])
                        yaReacciono = true
                      else i++
                    }
                    if(!yaReacciono){
                      console.log('  -Reacciona: ', element.node.reactions.edges[index].node.user.login)
                      reactionArray.push(self.participants[j])
                      self.countMatrix[j][c]++
                    }
                  } else if (j == cantPersonas)
                    {enc = true}
                  j++

                }
              }//reaccion comentarios
            } else if (c == cantPersonas)
              {encontrado = true}
            c++
          }
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
                if (posicion != reviewArray[i].pos){
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
                  { enc = true }
                j++
              }
            }

          }
        }) //contar reviews
        this.cohesionFormula()
        this.show = true
      })
    }//refresh query
  }
}
</script>