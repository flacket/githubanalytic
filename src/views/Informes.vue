<template>
  <div>
  <h1 class="subheading-1 blue--text">Informes</h1>

  <PRSelector v-on:searchPR="countQuery"></PRSelector>
  <v-btn class="mb-2" :color="colorCancel" v-on:click="toggleCancelar()">Cancelar Busqueda</v-btn>
  <v-progress-linear v-if="$apollo.loading" indeterminate color="primary"></v-progress-linear>
  <v-divider class="mb-2"></v-divider>

  <v-expansion-panels accordion>
    <v-expansion-panel
      v-for="item in countPRs"
      :key="item.startCursor"
    >
      <v-expansion-panel-header>{{item.startCursor}}</v-expansion-panel-header>
      <v-expansion-panel-content>
        <p>Max Reactions: {{item.reactions}}</p>
        <p>Max Participants: {{item.participants}}</p>
        <p>Max Comments: {{item.comments}}</p>
        <p>Max CommentsReactions: {{item.commentsReactions}}</p>
        <p>Max ReviewThreads: {{item.reviewThreads}}</p>
        <p>Max ReviewThreadsComments: {{item.reviewThreadsComments}}</p>
        <!--<v-simple-table>
          <thead>
            <tr>
              <th v-for="index in item.participants.nodes" :key="index.login" class="text-left">{{index.login}}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in item.countMatrix" :key="i.jota">
              <td v-for="jota in i" :key="jota.x">{{jota}}</td>
            </tr>
          </tbody>
        </v-simple-table>-->
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>

  </div>
</template>

<script>
import PRSelector from '../components/PRSelector'
import {GET_REPOS} from '../graphql/queries.js'
import moment from "moment";
moment.locale("es-us");

export default {
  components: { PRSelector },
  data() {
    return {
      colorCancel: "error",
      cancel: true,
      getPR: '',
      countPRs: [],
      pullRequests: '',
      countMatrix: '',
      cohesionMatrix: '',
      estadisticas: '',
    }
  },
  apollo:{
    getPR: {
      query: GET_REPOS,
      variables: {
        owner: "cdr", 
        name: "code-server",
        reactions: 1,
        participants: 1,
        comments: 1,
        commentsReactions: 1,
        rvThreads: 1, 
        rvThreadsComments: 1
      },
      //TODO:
      update: data => data.repository
    }
  },
  methods: {
    toggleCancelar() {
      this.cancel = !this.cancel
      if(this.cancel)
      this.colorCancel = "error"
      else this.colorCancel = "warning"
    },
    cohesionEstadisticas() {
      var cantPersonas = this.participants.length
      var estadisticas = '['
      var coeInd, msjEnviados, msjRecibidos
      for (var i = 0; i < cantPersonas; i++){
        coeInd = 0
        msjEnviados = 0
        msjRecibidos = 0
        for(var j = 0; j < cantPersonas; j++){
          coeInd += this.cohesionMatrix[i][j]
          msjEnviados += this.countMatrix[i][j]
          msjRecibidos += this.countMatrix[j][i]
        }
        estadisticas += '{"nombre": "' + this.participants[i] +
          '", "coeInd": ' + (Math.round((coeInd / (cantPersonas - 1)) * 100) / 100) +
          ', "msjEnviados": ' + msjEnviados +
          ', "msjRecibidos": ' + msjRecibidos + '}'
        if (i+1 < cantPersonas)
          estadisticas += ','
      }
      estadisticas += ']'
      this.estadisticas = JSON.parse(estadisticas)

      //Adjunto las estadisticas a los datos del Pull Request
      this.repository.pullRequest.countMatrix = this.countMatrix
      this.repository.pullRequest.estadisticas = this.estadisticas
      this.pullRequests.push(this.repository.pullRequest)
      this.countMatrix = ''
    },
    cohesionFormula() {
      //Esta funcion crea una matriz de cohesion interpersonal
      //entre los usuarios participantes de un Pull Request
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
            var sum = this.countMatrix[c][f] + this.countMatrix[f][c]
            if(sum > 0){
              result = 1 - ((Math.abs(this.countMatrix[c][f] - this.countMatrix[f][c])) / sum)
            } else result = 0
            this.cohesionMatrix[c][f] = Math.round(result * 100) / 100
            this.cohesionMatrix[f][c] = Math.round(result * 100) / 100
          }
        }
      }
      this.cohesionEstadisticas()
    },
    countQuery(search){
      //Esta funcion crea una lista con la cantidad de datos que se necesitan 
      //extraer para cada Pull Request (comentarios, reacciones, etc.) 
      //Optimizando así la busqueda y reduciendo la cantidad de llamadas a la API.
      //Por cada 50 Pull Request almacena el maximo de datos que hay que traer
      var self = this
      let cursor
      //reviso si el array esta vacio (Primer Consulta)
      //sino tomo el cursor de la ultima consluta
      if (this.countPRs.length == 0) 
        cursor = null
      else 
        cursor = this.countPRs[this.countPRs.length-1].endCursor
      //Creo un nuevo item en el arreglo de countPRs donde guardar el resultado de la consulta
      this.countPRs.push({
        comments: 0, 
        reviewThreads: 0, 
        reactions: 0, 
        participants: 0,
        reviewThreadsComments: 0,
        commentsReactions: 0,
        endCursor: null,
        startCursor: null
      })
      this.$apollo.queries.getPR.refetch({ 
        owner: search.owner, 
        name: search.name,
        cursor: cursor,
        rvThreads: 1,
        comments: 1,
        rvThreadsComments: 1,
        commentsReactions: 1
      }).then(() => {
        let i = self.countPRs.length -1
        //cargo los primeros valores del contador PR
        self.countPRs[i].startCursor = self.getPR.pullRequests.pageInfo.startCursor
        self.countPRs[i].endCursor = self.getPR.pullRequests.pageInfo.endCursor
        self.getPR.pullRequests.nodes.forEach(function(item){
          if (item.comments.totalCount > self.countPRs[i].comments)
            self.countPRs[i].comments = item.comments.totalCount
          if (item.reviewThreads.totalCount > self.countPRs[i].reviewThreads)
            self.countPRs[i].reviewThreads = item.reviewThreads.totalCount
          if (item.reactions.totalCount > self.countPRs[i].reactions)
            self.countPRs[i].reactions = item.reactions.totalCount
          if (item.participants.totalCount > self.countPRs[i].participants)
            self.countPRs[i].participants = item.participants.totalCount
        })
        //Busco los valores que faltan que estan anidados dentro de lo recien consultado
        self.$apollo.queries.getPR.refetch({ 
          owner: search.owner, 
          name: search.name,
          cursor: self.countPRs[i].startCursor,
          rvThreads: self.countPRs[i].reviewThreads,
          comments: self.countPRs[i].comments,
          rvThreadsComments: 1,
          commentsReactions: 1
        }).then(() => {
          //caargo los ultimos valores del contador PR
          self.getPR.pullRequests.nodes.forEach(function(item){
            item.reviewThreads.nodes.forEach(function(revThread){
              if (revThread.comments.totalCount > self.countPRs[i].reviewThreadsComments)
                self.countPRs[i].reviewThreadsComments = revThread.comments.totalCount
            })
            item.comments.nodes.forEach(function(comm){
              if (comm.reactions.totalCount > self.countPRs[i].commentsReactions)
                self.countPRs[i].commentsReactions = comm.reactions.totalCount
            })
          })

          //Reviso si faltan cargar más Pull Requests desde la paginación de la API
          //Si estan todos los datos, Llamo a la funcion getFullPR.
          if (self.getPR.pullRequests.pageInfo.hasNextPage && self.cancel)
            self.countQuery(search)
          else {
            console.log("Fin de contar PullRequest")
            self.getFullPR(search, 0)
          }
        })//repository.refetch2*/
      })//repository.refetch
      //this.refreshQuery(search)
    },//refreshQuery
    getFullPR(search, index){
      //Esta funcion busca los datos de los Pull Request
      //analizando la lista de this.countPRs y pidiendo 
      //solo la cantidad necesaria de datos a la API
      var self = this
        this.$apollo.queries.getPR.refetch({
        owner: search.owner,
        name: search.name,
        startCursor: this.countPRs[index].startCursor,
        reactions: this.countPRs[index].reactions,
        participants: this.countPRs[index].participants,
        comments: this.countPRs[index].comments,
        rvThreads: this.countPRs[index].reviewThreads,
        rvThreadsComments: this.countPRs[index].reviewThreadsComments,
        commentsReactions: this.countPRs[index].commentsReactions
      }).then(() => {
        //Transformo el resultado a cadena
        //para poder almacenarlo por valor en la lista self.pullRequests
        let parser = JSON.stringify(self.getPR.pullRequests.nodes)
        self.pullRequests += parser.substring(1, parser.length - 1)
        console.log('index: ', index, ' | countPR.length: ', self.countPRs.length-1)
        //Reviso si faltan PRs por agregar a la lista
        if (index < self.countPRs.length-1){
          self.pullRequests += ','
          self.getFullPR(search, index + 1)
        }
        else {
          //Transformo a Objeto la lista de self.pullRequests
          let aux = "[" + self.pullRequests + "]"
          self.pullRequests = JSON.parse(aux)
          console.log(self.pullRequests)
          console.log("Fin de Extraer Pull Requests")
        }
      })
      },

      /*refreshQuery(index, pr) {
        var cantPersonas = this.repository.pullRequest.participants.totalCount
        this.participants = new Array();

        //cargar lista personas
        var self = this
        this.repository.pullRequest.participants.nodes.forEach(function(element) {
          self.participants.push(element.login)
        })

        //crear matriz NxN (con ceros)
        var x = new Array(cantPersonas)
        for (var i = 0; i < cantPersonas; i++) {
          x[i] = new Array(cantPersonas)
          for (var j = 0; j < cantPersonas; j++) {
            x[i][j] = 0
          }
        }
        this.countMatrix = x

        //Primer Cometario
        for (i = 1; i < cantPersonas; i++){
          this.countMatrix[0][i]++
        }
        this.repository.pullRequest.reactions.nodes.forEach(function(element) {
          let encontrado = false
          let e = 1 //salteo el participante de la pos[0], no se va a autorreaccionar
          while (!encontrado){
            if (self.participants[e] == element.user.login){
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
        //variables para revisar si repite comentario
        var lastCommentBody
        var lastCommentDate
        var lastCommentAuthor = null
        //Contar Cometarios
        this.repository.pullRequest.comments.nodes.forEach(function(element) {
          //verifico si el comentario esta antes de la fecha de cierre
          if(element.createdAt < self.repository.pullRequest.closedAt 
            || !self.repository.pullRequest.closedAt){
            console.log('--------------------')
            console.log('FComentario: ', element.createdAt)
          let encontrado = false
          let c = 0

          //reviso que el usuario no repita comentario
          //ni escriba 2 mensajes seguidos
          var commentNoValido = false
          if ((lastCommentAuthor != null) && (lastCommentAuthor == element.author.login)){
          // comenta el mismo del comentario anterior
            let momentDate = moment(element.createdAt, 'YYYY-MM-DDTHH:mm:ssZ');
            let ComentDate = momentDate.toDate();
            let timeLapsed = (ComentDate.getTime() - lastCommentDate.getTime()) / 1000
            console.log('Minutos:', timeLapsed/60)
            console.log('lastCommentAuthor:', lastCommentAuthor)
            console.log('Author:', element.author.login)
            if ((lastCommentBody == element.body)||(timeLapsed < 900)){ 
              //el comentario se repite o fecha es menor a 15 min
              commentNoValido = true
              console.log('no valido')
            }
          }
          //registro el comentario para revisar despues si repite
          let momDate = moment(element.createdAt, 'YYYY-MM-DDTHH:mm:ssZ');
          lastCommentDate = momDate.toDate();
          lastCommentBody = element.body
          lastCommentAuthor = element.author.login

          while (!encontrado){
            if (self.participants[c] == element.author.login){
                encontrado = true
                //este participante ha hecho un comentario
                //Busco si el comentario menciona (@) algun participante
                var arrobaBandera = false
                for (i = 0; i < cantPersonas; i++){
                  if(element.body.search('@' + self.participants[i])>-1){
                    //el comentario menciona esta persona
                    if (c != i){  //si no es el que comenta
                      console.log('Comenta: ', self.participants[c])
                      console.log(' -Hacia: @' + self.participants[i])
                      self.countMatrix[c][i]++
                      arrobaBandera = true
                    }
                  }
                }
                if(!arrobaBandera){
                  //el comentario va para todos (no @ a nadie)
                  if(!commentNoValido){
                    //el comentario no esta repetido
                    console.log('Comenta: ', self.participants[c])
                    console.log(' -Hacia: Todos')
                    for (i = 0; i < cantPersonas; i++){
                      if (c != i) //si no es el que comenta
                        self.countMatrix[c][i]++
                    }
                  }
                }
                //reacciones al comentarios
                //crear array de reaccionadores
                var reactionArray = new Array()
                for (var index = 0; index < element.reactions.totalCount; index++){
                  let enc = false
                  let j = 0
                  while (!enc){
                    if (self.participants[j] == element.reactions.nodes[index].user.login){
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
                        console.log('  -Reacciona: ', self.participants[j])
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
            }//while encontrado
          }
        }) //contar comentarios
        console.log('----- REVIEWS -----')
        //contar reviews
        this.repository.pullRequest.reviewThreads.nodes.forEach(function(element){
          //este array va a mantener las personas que comentaron en el review
          //para despues poder usarlas como receptor en el conteo de interacciones
          var reviewArray = new Array()        
          //reinicio la variable para revisar si repite reviews
          lastCommentAuthor = null
          console.log('---')
          for (var comm = 0; comm < element.comments.totalCount; comm++){
            var reviewComment = element.comments.nodes[comm]
            //busco el index del comentarista
            var encontrado = false
            var c = 0
            var posicion
            while (!encontrado){
              if (self.participants[c] == reviewComment.author.login){
                encontrado = true
                //este participante ha hecho un comentario, se guarda su posicion
                posicion = c
              } else if (c == cantPersonas)
                {encontrado = true}
              c++
            }

            //TODO: ESTA PARTE SE PUEDE MEZCLAR CON EL "TODO" DE ABAJO
            //me fijo si debo agregar el comentarista al reviewArray
            //el reviewArray va a mantener los usuarios que han
            //hecho uno o más comentarios en el review.
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
              var data = { name: reviewComment.author.login, pos: posicion }
              reviewArray.push(data)
            }

            //TODO: ESTA PARTE SE PUEDE MEZCLAR CON EL "TODO" DE ARRIBA
             //Busco si el comentario menciona (@) algun participante
            var arrobaBandera = false
            for (i = 0; i < cantPersonas; i++){
              if(reviewComment.body.search('@' + self.participants[i])>-1){
                //el comentario menciona esta persona
                //si no es el que comenta y no va a ser contado (en reviewArray)
                if (c != i && !reviewArray.includes(self.participants[i])){
                  console.log('Comenta: ', self.participants[posicion])
                  console.log(' -Hacia: @', self.participants[i])
                  self.countMatrix[c][i]++
                  arrobaBandera = true
                }
              }
            }

            //reviso que el usuario no repita comentario
            //ni escriba 2 mensajes seguidos
            var commentNoValido = false
            if ((lastCommentAuthor != null) && (lastCommentAuthor == reviewComment.author.login)){
            // comenta el mismo del comentario anterior
              let momentDate = moment(reviewComment.createdAt, 'YYYY-MM-DDTHH:mm:ssZ');
              let ComentDate = momentDate.toDate();
              let timeLapsed = (ComentDate.getTime() - lastCommentDate.getTime()) / 1000
              console.log('Minutos:', timeLapsed/60)
              console.log('lastCommentAuthor:', lastCommentAuthor)
              console.log('Author:', reviewComment.author.login)
              if ((lastCommentBody == reviewComment.body)||(timeLapsed < 900)){ 
                //el comentario se repite o fecha es menor a 15 min
                commentNoValido = true
                console.log('no valido')
              }
            }
            //registro el comentario para revisar despues si repite
            let momDate = moment(reviewComment.createdAt, 'YYYY-MM-DDTHH:mm:ssZ');
            lastCommentDate = momDate.toDate();
            lastCommentBody = reviewComment.body
            lastCommentAuthor = reviewComment.author.login

            //si es el primer comentario del review
            if (reviewArray.length == 1){
              //el comentario va para el creador del PR
              self.countMatrix[posicion][0]++
              console.log('Comenta: ', self.participants[posicion])
              console.log(' -(1comm)Hacia: ', self.participants[0])
            } else {
              //sumo comentario de <<posicion>> a las personas
              //que ya comentaron en el mismo review
              if((!arrobaBandera) && (!commentNoValido)){ 
                //solo si no hay gente arrobada
                //y el comentario no esta repetido
                for (i = 0; i < reviewArray.length; i++){
                  if (posicion != reviewArray[i].pos){
                    self.countMatrix[posicion][reviewArray[i].pos]++
                    console.log('Comenta: ', self.participants[posicion])
                    console.log(' -(no@)Hacia: ', self.participants[reviewArray[i].pos])
                  }
                }
              }
            }

            //reacciones al comentarios
            for (var index = 0; index < reviewComment.reactions.totalCount; index++){
              let enc = false
              let j = 0
              //busco la posicion en la matriz del que reacciona
              while (!enc){
                if (self.participants[j] == reviewComment.reactions.nodes[index].user.login){
                  console.log(' -Reacciona: ', reviewComment.reactions.nodes[index].user.login)
                  //este participante le reacciono al creador del PR
                  self.countMatrix[j][posicion]++
                  enc = true
                } else if (j == cantPersonas)
                  { enc = true }
                j++
              }
            } //reacciones

          }  //comentario de cada review
        }) //contar reviews
        this.cohesionFormula()
        this.show = true
    })*/
  }
}
</script>