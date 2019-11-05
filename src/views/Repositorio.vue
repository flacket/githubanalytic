<template>
  <div>
  <h1 class="subheading-1 blue--text">Repositorio</h1>

  <PRSelector v-on:searchPR="countQuery"></PRSelector>
  <v-btn class="mb-2" :color="colorCancel" 
  v-on:click="toggleCancelar" v-if="$apollo.loading">
    <v-icon left>mdi-cancel</v-icon>Detener Busqueda</v-btn>
  <v-btn class="mb-2 mx-2" color="primary" @click.native="btnLoadFile">
    <v-icon left>mdi-download</v-icon>Cargar Informe</v-btn>
  <v-btn class="mb-2" color="primary" v-on:click="saveFile()">
    <v-icon left>mdi-upload</v-icon>Guardar Informe</v-btn>
  <input id="file-upload" type="file" ref="myFile" style="display:none" @change="loadFile"><br/>
  <v-progress-linear v-if="$apollo.loading" indeterminate color="primary"></v-progress-linear>
  <v-divider class="mb-2"></v-divider>

  <v-expansion-panels accordion>
    <v-expansion-panel
      v-for="pullR in estadisticas"
      :key="pullR.id"
    >
      <v-expansion-panel-header>#{{pullR.PR}}</v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-simple-table fixed-header height="300px">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">nombre</th>
                <th class="text-left">coeInd</th>
                <th class="text-left">msjEnviados</th>
                <th class="text-left">msjRecibidos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pullR.tabla" :key="item.nombre">
                <td>{{ item.nombre }}</td>
                <td>{{ item.coeInd }}</td>
                <td>{{ item.msjEnviados }}</td>
                <td>{{ item.msjRecibidos }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
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
      estadisticas: []
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
    btnLoadFile() {
      document.getElementById('file-upload').click()
    },
    loadFile() {
      let file = this.$refs.myFile.files[0];
      if(!file) return
      // Credit: https://stackoverflow.com/a/754398/52160
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload =  evt => {
        this.pullRequests = JSON.parse(evt.target.result)
        //LLamo a realizar el analisis y conteo
        this.estadisticas = []
        this.getInteractionCount()
      }
      reader.onerror = evt => {
        console.error(evt);
      }
    },
    saveFile () {
      const data = JSON.stringify(this.pullRequests)
      const blob = new Blob([data], {type: 'text/plain'})
      const e = document.createEvent('MouseEvents'),
            a = document.createElement('a')
      a.download = "informe.json"
      a.href = window.URL.createObjectURL(blob)
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
      e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      a.dispatchEvent(e)
      console.log('Archivo Guardado')
    },
    toggleCancelar() {
      this.cancel = !this.cancel
      if(this.cancel)
      this.colorCancel = "error"
      else this.colorCancel = "warning"
    },
    cohesionEstadisticas(index) {
      let cantPersonas = this.pullRequests[index].participants.totalCount
      let tabla = '['
      let coeInd, msjEnviados, msjRecibidos
      for (var i = 0; i < cantPersonas; i++){
        coeInd = 0
        msjEnviados = 0
        msjRecibidos = 0
        for(var j = 0; j < cantPersonas; j++){
          coeInd += this.cohesionMatrix[i][j]
          msjEnviados += this.countMatrix[i][j]
          msjRecibidos += this.countMatrix[j][i]
        }
        //Me aseguro que hayan mas de 2 personas para calcular la cohesion
        if (cantPersonas > 1)
          coeInd = (Math.round((coeInd / (cantPersonas - 1)) * 100) / 100)
        else coeInd = 0
        //creo la tabla con los datos estaditicos
        tabla += '{"nombre": "' + this.pullRequests[index].participants.nodes[i].login +
          '", "coeInd": ' + coeInd +
          ', "msjEnviados": ' + msjEnviados +
          ', "msjRecibidos": ' + msjRecibidos + '}'
        if (i + 1 < cantPersonas)
          tabla += ','
      }
      tabla += ']'
      //Adjunto las estadisticas a los datos del Pull Request
      let estadisticaPR = {
        id: index,
        PR: this.pullRequests[index].number,
        tabla: JSON.parse(tabla),
        cohesionMatrix: this.cohesionMatrix
      }
      this.estadisticas.push(estadisticaPR)
    },
    cohesionFormula(index) {
      //Esta funcion crea una matriz de cohesion interpersonal
      //entre los usuarios participantes de un Pull Request
      let cantPersonas = this.pullRequests[index].participants.totalCount
      //crear matriz NxN
      let x = new Array(cantPersonas)
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
      this.cohesionEstadisticas(index)
    },
    countQuery(search){
      //Esta funcion crea una lista con la cantidad de datos que se necesitan 
      //extraer para cada Pull Request (comentarios, reacciones, etc.) 
      //Optimizando así la busqueda y reduciendo la cantidad de llamadas a la API.
      //Por cada 50 Pull Request almacena el maximo de datos que hay que traer
      this.estadisticas = []
      var self = this
      let afterCursor
      let beforeCursor
      let overflowAlet = false  //indica si se superan las 100 consultas de la API
      let hasNextPage = false
      //reviso si el array esta vacio (Primer Consulta)
      //sino tomo el cursor de la ultima consluta
      beforeCursor = null
      if (this.countPRs.length == 0)
        afterCursor = null
      else afterCursor = this.countPRs[this.countPRs.length - 1].endCursor

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

      //Hago la consulta
      this.$apollo.queries.getPR.refetch({ 
        owner: search.owner, 
        name: search.name,
        afterCursor: afterCursor,
        beforeCursor: beforeCursor,
        rvThreads: 1,
        comments: 1,
        rvThreadsComments: 1,
        commentsReactions: 1
      }).then(() => {
        let i = self.countPRs.length - 1
        //cargo los primeros valores del contador PR
        self.countPRs[i].startCursor = self.getPR.pullRequests.pageInfo.startCursor
        self.countPRs[i].endCursor = self.getPR.pullRequests.pageInfo.endCursor
        hasNextPage = self.getPR.pullRequests.pageInfo.hasNextPage
        self.getPR.pullRequests.nodes.forEach(function(item){
          if (item.comments.totalCount > self.countPRs[i].comments){
            if (item.comments.totalCount > 100){
              self.countPRs[i].comments = 100
              overflowAlet = true
            }
            else
              self.countPRs[i].comments = item.comments.totalCount
          }
          if (item.reviewThreads.totalCount > self.countPRs[i].reviewThreads){
            if (item.reviewThreads.totalCount > 100){
              self.countPRs[i].reviewThreads = 100
              overflowAlet = true
            }
            else
            self.countPRs[i].reviewThreads = item.reviewThreads.totalCount
          }
          if (item.reactions.totalCount > self.countPRs[i].reactions){
            if (item.reactions.totalCount > 100){
              self.countPRs[i].reactions = 100
              overflowAlet = true
            }
            else
              self.countPRs[i].reactions = item.reactions.totalCount
          }
          if (item.participants.totalCount > self.countPRs[i].participants){
            if (item.participants.totalCount > 100){
              self.countPRs[i].participants = 100
              overflowAlet = true
            }
            else
              self.countPRs[i].participants = item.participants.totalCount
          }
        })
        //si es el primer conjunto buscado
        if (i == 0){
          afterCursor = null
          beforeCursor = self.countPRs[i].endCursor
        } else {
          afterCursor = self.countPRs[i-1].endCursor
          beforeCursor = null
        }
        //Busco los valores que faltan que estan anidados dentro de lo recien consultado
        self.$apollo.queries.getPR.refetch({ 
          owner: search.owner, 
          name: search.name,
          afterCursor: afterCursor,
          beforeCursor: beforeCursor,
          rvThreads: self.countPRs[i].reviewThreads,
          comments: self.countPRs[i].comments,
          rvThreadsComments: 1,
          commentsReactions: 1
        }).then(() => {
          //caargo los ultimos valores del contador PR
          self.getPR.pullRequests.nodes.forEach(function(item){
            item.reviewThreads.nodes.forEach(function(revThread){
              if (revThread.comments.totalCount > self.countPRs[i].reviewThreadsComments){
                if (revThread.comments.totalCount > 100){
                  self.countPRs[i].reviewThreadsComments = 100
                  overflowAlet = true
                }
                else
                  self.countPRs[i].reviewThreadsComments = revThread.comments.totalCount
              }
            })
            item.comments.nodes.forEach(function(comm){
              if (comm.reactions.totalCount > self.countPRs[i].commentsReactions){
                if (comm.reactions.totalCount > 100){
                  self.countPRs[i].commentsReactions = 100
                  overflowAlet = true
                }
                else
                  self.countPRs[i].commentsReactions = comm.reactions.totalCount
              }
            })
          })
          if (overflowAlet)
            console.log('SE SUPERO EL LIMITE DE LA API - Limitado a 100')
          //Reviso si faltan cargar más Pull Requests desde la paginación de la API
          //Si estan todos los datos, Llamo a la funcion getFullPR.
          console.log('Pagina: ', self.countPRs.length, ' | PRs: ', 50 * self.countPRs.length)
          if (hasNextPage && self.cancel)
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
      console.log('index: ', index)
      let afterCursor
      let beforeCursor
      //si es el primer conjunto buscado
      if (index == 0){
        afterCursor = null
        beforeCursor = self.countPRs[index].endCursor
      } else {
        afterCursor = self.countPRs[index-1].endCursor
        beforeCursor = null
      }
      this.$apollo.queries.getPR.refetch({
        owner: search.owner,
        name: search.name,
        afterCursor: afterCursor,
        beforeCursor: beforeCursor,
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
        parser = parser.substring(1 , parser.length - 1)
        self.pullRequests += parser
        
        //Reviso si faltan PRs por agregar a la lista
        if (index < self.countPRs.length - 1){
          self.pullRequests += ','
          self.getFullPR(search, index + 1)
        } else {
          //Transformo a Objeto la lista de self.pullRequests
          let aux = "[" + self.pullRequests + "]"
          self.pullRequests = JSON.parse(aux)
          console.log(self.pullRequests)
          this.getInteractionCount()
        }
      })
    },
    getInteractionCount(){
      var self = this
      console.log('Comienzo Análisis')
      var contando = 0
      this.pullRequests.forEach(function(pullRequest){
        contando++
        //busco cantidad de participantes
        var cantPersonas = pullRequest.participants.totalCount
        var participants = new Array()
        //y almaceno el nombre de cada participante
        pullRequest.participants.nodes.forEach(function(element) {
          participants.push(element.login)
        })

        //crear matriz NxN (con ceros)
        var x = new Array(cantPersonas)
        for (var i = 0; i < cantPersonas; i++) {
          x[i] = new Array(cantPersonas)
          for (var j = 0; j < cantPersonas; j++) {
            x[i][j] = 0
          }
        }
        self.countMatrix = x
        //Primer Cometario
        for (i = 1; i < cantPersonas; i++){
          self.countMatrix[0][i]++
        }
        pullRequest.reactions.nodes.forEach(function(element) {
          let encontrado = false
          let e = 1 //salteo el participante de la pos[0], no se va a autorreaccionar
          while (!encontrado){
            if (participants[e] == element.user.login){
              //console.log('Reacciona 1er comment: ', participants[e])
              //este participante le reacciono al creador del PR
              self.countMatrix[e][0]++
              encontrado = true
            } else if (e == cantPersonas) 
              {encontrado = true}
            e++
          }
        })
        //console.log('----- COMMENTS -----')
        //variables para revisar si repite comentario
        var lastCommentBody
        var lastCommentDate
        var lastCommentAuthor = null
        //Contar Cometarios
        pullRequest.comments.nodes.forEach(function(element) {
          //verifico si el comentario esta antes de la fecha de cierre
          if(element.createdAt < pullRequest.closedAt || !pullRequest.closedAt){
            //console.log('------------------')
            //console.log('FComentario: ', element.createdAt)
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
              //console.log('Minutos:', timeLapsed/60)
              //console.log('lastCommentAuthor:', lastCommentAuthor)
              //console.log('Author:', element.author.login)
              if ((lastCommentBody == element.body)||(timeLapsed < 900)){ 
                //el comentario se repite o fecha es menor a 15 min
                commentNoValido = true
                //console.log('no valido')
              }
            }
            //registro el comentario para revisar despues si repite
            let momDate = moment(element.createdAt, 'YYYY-MM-DDTHH:mm:ssZ');
            lastCommentDate = momDate.toDate();
            lastCommentBody = element.body
            lastCommentAuthor = element.author.login
            while (!encontrado){
              if (participants[c] == element.author.login){
                encontrado = true //este participante ha hecho un comentario
                //Busco si el comentario menciona (@) algun participante
                var arrobaBandera = false
                for (i = 0; i < cantPersonas; i++){
                  if(element.body.search('@' + participants[i])>-1){
                    //el comentario menciona esta persona
                    if (c != i){  //si no es el que comenta
                      //console.log('Comenta: ', participants[c],' | Hacia: @' + participants[i])
                      self.countMatrix[c][i]++
                      arrobaBandera = true
                    }
                  }
                }
                if(!arrobaBandera){
                  //el comentario va para todos (no @ a nadie)
                  if(!commentNoValido){
                    //el comentario no esta repetido
                    //console.log('Comenta: ', participants[c], ' | Hacia: Todos')
                    for (i = 0; i < cantPersonas; i++){
                      if (c != i) //si no es el que comenta
                        self.countMatrix[c][i]++
                    }
                  }
                }
                //reacciones al comentarios, crear array de reaccionadores
                var reactionArray = new Array()
                for (var index = 0; index < element.reactions.totalCount; index++){
                  let enc = false
                  let j = 0
                  while (!enc){
                    if (participants[j] == element.reactions.nodes[index].user.login){
                      //este participante le reacciono al creador del PR
                      enc = true
                      //verificar si no reacciono antes
                      let i = 0
                      var yaReacciono = false
                      while(i < reactionArray.length && !yaReacciono){
                        if(participants[j] == reactionArray[i])
                          yaReacciono = true
                        else i++
                      }
                      if(!yaReacciono){
                        //console.log(' -Reacciona: ', participants[j])
                        reactionArray.push(participants[j])
                        self.countMatrix[j][c]++
                      }
                    } else if (j == cantPersonas){
                      enc = true
                    }
                    j++
                  }
                }//reaccion comentarios
              } else if (c == cantPersonas){
                encontrado = true
              }
              c++
            }//while encontrado
          }
        })//forEach Comments
        //console.log('----- REVIEWS -----')
        //contar reviews
        pullRequest.reviewThreads.nodes.forEach(function(element){
          //este array va a mantener las personas que comentaron en el review
          //para despues poder usarlas como receptor en el conteo de interacciones
          var reviewArray = new Array()        
          //reinicio la variable para revisar si repite reviews
          lastCommentAuthor = null
          element.comments.nodes.forEach(function(reviewComment){
            //busco el index del comentarista
            var encontrado = false
            var c = 0
            var posicion
            //console.log('-----')
            try{
              while (!encontrado){
                if (participants[c] == reviewComment.author.login){
                  encontrado = true
                  //este participante ha hecho un comentario, se guarda su posicion
                  posicion = c
                } else c++
                if (c == cantPersonas){
                  encontrado = true}
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
                if(reviewComment.body.search('@' + participants[i])>-1){
                  //el comentario menciona esta persona
                  //si no es el que comenta y no va a ser contado (en reviewArray)
                  if (c != i && !reviewArray.includes(participants[i])){
                    //console.log('Comenta: ', participants[posicion], ' | Hacia: @', participants[i])
                    self.countMatrix[c][i]++
                    arrobaBandera = true
                  }
                }
              }
              //reviso que el usuario no repita comentario, ni escriba 2 mensajes seguidos
              var commentNoValido = false
              if ((lastCommentAuthor != null) && (lastCommentAuthor == reviewComment.author.login)){
              // comenta el mismo del comentario anterior
                let momentDate = moment(reviewComment.createdAt, 'YYYY-MM-DDTHH:mm:ssZ')
                let ComentDate = momentDate.toDate()
                let timeLapsed = (ComentDate.getTime() - lastCommentDate.getTime()) / 1000
                //console.log('Minutos:', timeLapsed/60)
                //console.log('lastCommentAuthor:', lastCommentAuthor)
                //console.log('Author:', reviewComment.author.login)
                if ((lastCommentBody == reviewComment.body)||(timeLapsed < 900)){ 
                  //el comentario se repite o fecha es menor a 15 min
                  commentNoValido = true
                }
              }
              //registro el comentario para revisar despues si repite
              let momDate = moment(reviewComment.createdAt, 'YYYY-MM-DDTHH:mm:ssZ');
              lastCommentDate = momDate.toDate();
              lastCommentBody = reviewComment.body
              lastCommentAuthor = reviewComment.author.login
              //si es el primer comentario del review
              if (reviewArray.length == 1){
                //console.log('Comenta: ', participants[posicion], ' | (1comm)Hacia: ', participants[0])
                //el comentario va para el creador del PR
                self.countMatrix[posicion][0]++
              } else {
                //sumo comentario de <<posicion>> a las personas, que ya comentaron en el mismo review
                if((!arrobaBandera) && (!commentNoValido)){ 
                  //solo si no hay gente arrobada y el comentario no esta repetido
                  for (i = 0; i < reviewArray.length; i++){
                    if (posicion != reviewArray[i].pos){
                      //console.log('Comenta: ', participants[posicion], ' | (no@)Hacia: ', participants[reviewArray[i].pos])
                      self.countMatrix[posicion][reviewArray[i].pos]++
                    }
                  }
                }
              }
              //console.log('Review Comments - Reactions:')
              //reacciones al comentarios
              for (var index = 0; index < reviewComment.reactions.totalCount; index++){
                let enc = false
                let j = 0
                //busco la posicion en la matriz del que reacciona
                while (!enc){
                  if (participants[j] == reviewComment.reactions.nodes[index].user.login){
                    //console.log(' -Reacciona: ', reviewComment.reactions.nodes[index].user.login)
                    //este participante le reacciono al creador del PR
                    self.countMatrix[j][posicion]++
                    enc = true
                  } else j++
                  if (j == cantPersonas) enc = true
                }
              } //reacciones
            }
            catch(err) {
              console.log('Error en Review Comments:',err.message)
              console.log('Error PR #:', pullRequest.number)
            }
          })  //comentario de cada review
        }) //contar reviews
        self.cohesionFormula(contando - 1)
      })//foreach PullRequest
      console.log('Análisis finalizado | Cant PR: ', contando)
      this.countPRs = []
      this.pullRequests = ''
    }/////////////////////////////////////////////////////////////////////////
  }
}
</script>