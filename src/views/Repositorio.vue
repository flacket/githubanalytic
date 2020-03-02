<template>
<div>
  <div class="text-center">
    <v-snackbar right v-model="snackbar.show" :timeout="snackbar.timeout" :color="snackbar.color">
      {{ snackbar.text }}
      <v-btn dark text @click="snackbar.show = false">Close</v-btn>
    </v-snackbar>
  </div>
  <h1 class="subheading-1 blue--text">Repositorio</h1>

  <PRSelector v-on:searchPR="getRepoPRcant"></PRSelector>
  <v-progress-linear v-if="loading" color="primary" :buffer-value="progressValue" :value="progressValue" stream></v-progress-linear>
  <v-divider class="mb-2"></v-divider>
  <!--/////////////////////////////////////////////////////-->
  <v-btn class="mb-2" :color="colorCancel" v-on:click="toggleCancelar" v-if="loading">
      <v-icon left>mdi-cancel</v-icon>
  Detener Busqueda</v-btn>
  <div v-if="show">
    <div class="mt-2">
      <v-btn class="mb-2 mx-2" color="primary" v-on:click="csvExport()">
      <v-icon left>mdi-file-table</v-icon>Exportar CSV</v-btn>   
      <input id="file-upload" type="file" ref="myFile" style="display:none" @change="loadFile"><br/>
    </div>

    <v-btn class="mx-2" color="primary" @click.native="btnLoadFile">
      <v-icon left>mdi-download</v-icon>Cargar json</v-btn>
    <v-btn color="primary" v-on:click="saveFile()">
      <v-icon left>mdi-upload</v-icon>Guardar json</v-btn>

    <v-data-table
      :headers="encabezados"
      :items="estadisticas"
      :items-per-page="20"
      class="elevation-1 mt-2"
    ></v-data-table>
  </div>
</div>
</template>

<script>
import PRSelector from '../components/PRSelector'
import {GET_REPOS, REPOSITORY_PRS} from '../graphql/queries.js'
import moment from 'moment'
moment.locale('es-us')

export default {
  components: { PRSelector },
  data() {
    return {
      loading: false,
      progressValue: 0,
      progressPercent: 0,
      show: false,
      snackbar: {
        show: false,
        text: 'Bienvenido a Gitana: Analíticas de Github',
        color: 'info',
        timeout: 2500
      },
      colorCancel: 'error',
      cancel: true,
      getPR: '',
      countPRs: [],
      countMatrix: '',
      cohesionMatrix: '',
      encabezados: [
        { text: 'PR#', sortable: false, value: 'PR' },
        { text: 'Cohesión Grupal', value: 'cohesionGrupal' },
        { text: 'CG Varianza', value: 'cohesionGrupalVarianza' },
        { text: 'Participantes', value: 'participantes' },
        { text: 'Fecha Inicio', value: 'fechaInicio' },
        { text: 'Fecha Cierre', value: 'fechaCierre' },
        { text: 'Duración Dias', value: 'duraccionDias' },
        { text: 'Código Agregado', value: 'codigoAdd' },
        { text: 'Código Quitado', value: 'codigoRem' },
        { text: 'Total Cambios', value: 'sizePR' },
        { text: 'Estado', value: 'estado' },
      ],
      pullRequests: '',
      repository:'',
      estadisticas: []
    }
  },
  apollo:{
    getPR: {
      query: GET_REPOS,
      variables: {
        owner: "flacket", 
        name: "githubanalytic",
        reactions: 1,
        participants: 1,
        comments: 1,
        commentsReactions: 1,
        rvThreads: 1, 
        rvThreadsComments: 1
      },
      update: data => data.repository
    },
    getPRcant:{
      query: REPOSITORY_PRS,
      variables: {
        owner: "flacket", 
        name: "githubanalytic"
      },
      update: data => data.repository.pullRequests
    }
  },
  mounted:function(){
        this.$apollo.skipAll = true
  },
  methods: {
    showSnackbar(text, color, timeout) {
      this.snackbar.text = text
      this.snackbar.color = color
      this.snackbar.timeout = timeout
      this.snackbar.show = true
    },
    btnLoadFile() {
      document.getElementById('file-upload').click()
    },
    csvExport () {
      //Creo el archivo CSV
      const { Parser } = require('json2csv')
      const fields = [
        'PR',
        'cohesionGrupal',
        'cohesionGrupalVarianza',
        'participantes',
        'fechaInicio',
        'fechaCierre',
        'duraccionDias',
        'codigoAdd',
        'codigoRem',
        'sizePR',
        'estado'
      ]

      const json2csvParser = new Parser({ fields })
      const csv = json2csvParser.parse(this.estadisticas)

      //Exporto ahora el archivo CSV
      const exportName = "informe" + ".csv" || "export.csv"
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, exportName)
      } else {
        const link = document.createElement("a")
        if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", exportName)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        }
      }
      console.log('CSV Guardado')
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
      a.download = "informe" + ".json"
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
    cohesionFormula(cantPersonas) {
      //Esta funcion crea una matriz de cohesion interpersonal
      //entre los usuarios participantes de un Pull Request
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
    },
    cohesionEstadisticas(pullRequest) {
      let cantPersonas = pullRequest.participants.totalCount
      this.cohesionFormula(cantPersonas)
      let tabla = '['
      let coeInd, msjEnviados, msjRecibidos
      for (var i = 0; i < cantPersonas; i++){
        coeInd = 0
        msjEnviados = 0
        msjRecibidos = 0
        //Cuento los mensajes enviados y recibidos para la persona "i"
        for(var j = 0; j < cantPersonas; j++){
          coeInd += this.cohesionMatrix[i][j]
          msjEnviados += this.countMatrix[i][j]
          msjRecibidos += this.countMatrix[j][i]
        }
        //Me aseguro que hayan mas de 2 personas para calcular las cohesiónes
        if (cantPersonas > 1)
          coeInd = (Math.round ((coeInd / (cantPersonas - 1)) * 100) / 100)
        //creo la tabla con los datos estaditicos
        tabla += '{"nombre": "' + pullRequest.participants.nodes[i].login +
          '", "coeInd": ' + coeInd +
          ', "msjEnviados": ' + msjEnviados +
          ', "msjRecibidos": ' + msjRecibidos + '}'
        if (i + 1 < cantPersonas)
          tabla += ','
      }
      tabla += ']'
      tabla = JSON.parse(tabla)

      //Obtengo la cohesión grupal y varianza
      var cohesionGrupal = 0
      tabla.forEach(function(item){
        cohesionGrupal += item.coeInd
      })
      cohesionGrupal = cohesionGrupal / tabla.length
      let coheGrupalVarianza = 0
      tabla.forEach(function(item){
        coheGrupalVarianza += ((item.coeInd - cohesionGrupal) * (item.coeInd - cohesionGrupal))
      })
      coheGrupalVarianza = coheGrupalVarianza / tabla.length

      //Obtengo la duracion del PR en días
      let createdAt = moment(pullRequest.createdAt)
      let closedAt = moment(pullRequest.closedAt)
      
      // get the difference between the moments
      let diff = closedAt.diff(createdAt)
      //express as a duration
      let diffDuration = moment.duration(diff)
      diff = diffDuration.days()
      if (diff == 0)
        diff = 1
      
      //Calculo el estado del PR
      let estado
      switch(pullRequest.state){
        case 'MERGED': estado = 1; break
        case 'CLOSED':estado = 0; break
        case 'OPEN': estado = 0.5; break
      }

      //Adjunto las estadisticas a los datos del Pull Request
      let estadisticaPR = {
        //TODO:id: index,
        PR: pullRequest.number,
        tabla: tabla,
        cohesionGrupal: cohesionGrupal.toFixed(3),
        cohesionGrupalVarianza: coheGrupalVarianza.toFixed(3),
        fechaInicio: createdAt.format("DD/MM/YY"),
        fechaCierre: closedAt.format("DD/MM/YY"),
        duraccionDias: diff || '-',
        codigoAdd: pullRequest.additions,
        codigoRem: pullRequest.deletions,
        sizePR: pullRequest.additions + pullRequest.deletions,
        estado: estado,
        cohesionMatrix: this.cohesionMatrix,
        participantes: cantPersonas
      }
      this.estadisticas.push(estadisticaPR)
      //NOTE:this.show = true
    },
    getRepoPRcant(search){
      var self = this      
      //Hago la consulta
      if (!this.$apollo.skipAll){
        this.$apollo.skipAll = false
      }
      this.$apollo.queries.getPRcant.refetch({ 
        owner: search.owner, 
        name: search.name,
      }).then(() => {
        console.log('Cantidad de PRs: ',self.getPRcant.totalCount)
        self.progressPercent = 100 / (Math.ceil(self.getPRcant.totalCount / 50) * 2)
        console.log('% de cada Búsqueda: ', self.progressPercent)
        self.countQuery(search)
      })
    },
    countQuery(search){
      //Esta funcion crea una lista con la cantidad de datos que se necesitan 
      //extraer para cada Pull Request (comentarios, reacciones, etc.) 
      //Optimizando así la busqueda y reduciendo la cantidad de llamadas a la API.
      //Por cada 50 Pull Request almacena el maximo de datos que hay que traer
      this.show = false
      this.loading = true
      this.estadisticas = []
      this.pullRequests = ''
      var self = this
      let afterCursor
      let beforeCursor
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
      this.$apollo.queries.getPR.refetch({ 
        owner: search.owner, 
        name: search.name,
        afterCursor: afterCursor,
        beforeCursor: beforeCursor,
        reactions: 1, 
        participants: 1,
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
              console.log('Se superó el limite de la API - Limitado a 100 (PR:', self.countPRs[i], ', comments')
            }
            else
              self.countPRs[i].comments = item.comments.totalCount
          }
          if (item.reviewThreads.totalCount > self.countPRs[i].reviewThreads){
            if (item.reviewThreads.totalCount > 100){
              self.countPRs[i].reviewThreads = 100
              console.log('Se superó el limite de la API - Limitado a 100 (PR:', self.countPRs[i], ', reviewThreads')
            }
            else
            self.countPRs[i].reviewThreads = item.reviewThreads.totalCount
          }
          if (item.reactions.totalCount > self.countPRs[i].reactions){
            if (item.reactions.totalCount > 100){
              self.countPRs[i].reactions = 100
              console.log('Se superó el limite de la API - Limitado a 100 (PR:', self.countPRs[i], ', reactions')
            }
            else
              self.countPRs[i].reactions = item.reactions.totalCount
          }
          if (item.participants.totalCount > self.countPRs[i].participants){
            if (item.participants.totalCount > 100){
              self.countPRs[i].participants = 100
              console.log('Se superó el limite de la API - Limitado a 100 (PR:', self.countPRs[i], ', participants')
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
          reactions: 1, 
          participants: 1,
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
                  console.log('Se superó el limite de la API - Limitado a 100 (PR:', self.countPRs[i], ', reviewThreadsComments')
                }
                else
                  self.countPRs[i].reviewThreadsComments = revThread.comments.totalCount
              }
            })
            item.comments.nodes.forEach(function(comm){
              if (comm.reactions.totalCount > self.countPRs[i].commentsReactions){
                if (comm.reactions.totalCount > 100){
                  self.countPRs[i].commentsReactions = 100
                  console.log('Se superó el limite de la API - Limitado a 100 (PR:', self.countPRs[i], ', commentsReactions')
                }
                else
                  self.countPRs[i].commentsReactions = comm.reactions.totalCount
              }
            })
          })
          console.log('Pagina: ', self.countPRs.length, ' | PRs: ', 50 * self.countPRs.length)
          self.progressValue = self.progressValue + self.progressPercent
          //NOTE:
          //Reviso si faltan cargar más Pull Requests desde la paginación de la API
          //Si estan todos los datos, Llamo a la funcion getFullPR.
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

    /////////////////////////////////////////////////////////////////////////
    matrizConteoPR(pullRequest){
      //busco cantidad de participantes
      let cantPersonas = pullRequest.participants.totalCount
      //y almaceno el nombre de cada participante
      let participants = new Array()
      pullRequest.participants.nodes.forEach(function(element) {
        participants.push(element.login)
      })
      //crear matriz NxN (con ceros)
      var countMatrix = new Array(cantPersonas)
      for (var i = 0; i < cantPersonas; i++) {
        countMatrix[i] = new Array(cantPersonas)
        for (var j = 0; j < cantPersonas; j++) {
          countMatrix[i][j] = 0
        }
      }
      //Primer Cometario
      for (i = 1; i < cantPersonas; i++){
        countMatrix[0][i]++
      }
      pullRequest.reactions.nodes.forEach(function(element) {
        let encontrado = false
        let e = 1 //salteo el participante de la pos[0], no se va a autorreaccionar
        while (!encontrado){
          if (participants[e] == element.user.login){
            //console.log('Reacciona 1er comment: ', participants[e])
            //este participante le reacciono al creador del PR
            countMatrix[e][0]++
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
          //console.log('--------------------')
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
          //busco el participante que hizo el comentario
          while (!encontrado){
            if (participants[c] == element.author.login){
                encontrado = true
              //este participante ha hecho un comentario
              //Busco si el comentario menciona (@) algun participante
              var arrobaBandera = false
              for (i = 0; i < cantPersonas; i++){
                if(element.body.search('@' + participants[i])>-1){
                  //el comentario menciona esta persona
                  if (c != i){  //si no es el que comenta
                    //console.log('Comenta: ', participants[c])
                    //console.log(' -Hacia: @' + participants[i])
                    countMatrix[c][i]++
                    arrobaBandera = true
                  }
                }
              }
              if(!arrobaBandera){
                //el comentario va para todos (no @ a nadie)
                if(!commentNoValido){
                  //el comentario no esta repetido
                  //console.log('Comenta: ', participants[c])
                  //console.log(' -Hacia: Todos')
                  for (i = 0; i < cantPersonas; i++){
                    if (c != i) //si no es el que comenta
                      countMatrix[c][i]++
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
                      //console.log('  -Reacciona: ', participants[j])
                      reactionArray.push(participants[j])
                      countMatrix[j][c]++
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
      //console.log('----- REVIEWS -----')
      //contar reviews
      pullRequest.reviewThreads.nodes.forEach(function(element){
        //este array va a mantener las personas que comentaron en el review
        //para despues poder usarlas como receptor en el conteo de interacciones
        var reviewArray = new Array()        
        //reinicio la variable para revisar si repite reviews
        lastCommentAuthor = null
        //console.log('---')
        element.comments.nodes.forEach(function(reviewComment){
          //busco el index del comentarista
          var encontrado = false
          var c = 0
          var posicion
          try{
            while (!encontrado){
              if (participants[c] == reviewComment.author.login){
                encontrado = true
                //este participante ha hecho un comentario, se guarda su posicion
                posicion = c
              } else if (c == cantPersonas)
                {encontrado = true}
              c++
            }
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
            //NOTE: PROBAR SI ESTA PARTE SE PUEDE MEZCLAR CON EL "NOTE" DE ARRIBA
              //Busco si el comentario menciona (@) algun participante
            var arrobaBandera = false
            for (i = 0; i < cantPersonas; i++){
              if(reviewComment.body.search('@' + participants[i])>-1){
                //el comentario menciona esta persona
                //si no es el que comenta y no va a ser contado (en reviewArray)
                if (c != i && !reviewArray.includes(participants[i])){
                  //console.log('Comenta: ', participants[posicion])
                  //console.log(' -Hacia: @', participants[i])
                  countMatrix[c][i]++
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
              //console.log('Minutos:', timeLapsed/60)
              //console.log('lastCommentAuthor:', lastCommentAuthor)
              //console.log('Author:', reviewComment.author.login)
              if ((lastCommentBody == reviewComment.body)||(timeLapsed < 900)){ 
                //el comentario se repite o fecha es menor a 15 min
                commentNoValido = true
                //console.log('no valido')
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
              countMatrix[posicion][0]++
            } else {
              //sumo comentario de <<posicion>> a las personas, que ya comentaron en el mismo review
              if((!arrobaBandera) && (!commentNoValido)){ 
                //solo si no hay gente arrobada, y el comentario no esta repetido
                for (i = 0; i < reviewArray.length; i++){
                  if (posicion != reviewArray[i].pos){
                    //console.log('Comenta: ', participants[posicion], ' | (no@)Hacia: ', participants[reviewArray[i].pos])
                    countMatrix[posicion][reviewArray[i].pos]++
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
                  countMatrix[j][posicion]++
                  enc = true
                //} else if (j == cantPersonas)
                //  { enc = true }
                //j++
                } else j++
                if (j == cantPersonas) enc = true
              }
            } //reacciones
          } catch(err) {
            //TODO: this.showSnackbar('Error en Review Comments:' + err.message, 'error', 5000)
            console.log('Error en Review Comments | PR#:', pullRequest.number)
          }
        })  //comentario de cada review
      }) //contar reviews
      //devuelvo la matriz de conteo del PR
      return countMatrix
    },//matrizConteoPR
    ////////////////////////////////////////////////////////////////////////

    conteoPRs(){

    },
    getFullPR(search, index){
      //Esta funcion busca los datos de los Pull Request
      //analizando la lista de this.countPRs y pidiendo 
      //solo la cantidad necesaria de datos a la API
      var self = this
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

        let parser = JSON.stringify(self.getPR.pullRequests.nodes)
        parser = parser.substring(1 , parser.length - 1)
        self.pullRequests += parser
        self.progressValue = self.progressValue + self.progressPercent
        //Reviso si faltan PRs por agregar a la lista
        if (index < self.countPRs.length - 1){
          self.pullRequests += ','
          self.getFullPR(search, index + 1)
        } else {
          //Transformo a Objeto la lista de self.pullRequests
          let aux = "[" + self.pullRequests + "]"
          self.pullRequests = JSON.parse(aux)
          //Calculo la matriz de conteo y estadisticas para cada PR
          self.pullRequests.forEach(function(pullRequest){
            self.countMatrix = self.matrizConteoPR(pullRequest)
            self.cohesionEstadisticas(pullRequest)
          })
          self.show = true
          self.loading = false
          self.showSnackbar('Análisis Finalizado', 'success', 3000)
          //console.log('Análisis finalizado | Cant PR: ', contando)
        }
        /*let cont = 1
        self.getPR.pullRequests.nodes.forEach(function(pullR){ cont++
          self.countMatrix = self.matrizConteoPR(pullR)
          self.cohesionEstadisticas(pullR)
        })*/
      })
    }//getFullPR
  }
}
</script>