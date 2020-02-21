<template>
  <div>
    <h1 class="subheading-1 blue--text">Pull Request</h1> 
    <PRSelector v-on:searchPR="refreshQuery"></PRSelector>
    <v-progress-linear v-if="$apollo.loading" indeterminate color="primary"></v-progress-linear>
    <v-divider class="mb-2"></v-divider>
    <!--/////////////////////////////////////////////////////-->
    <div v-if="show">
      <h1 class="headline grey--text">{{repository.pullRequest.title}}
        <a class="subheading" target="_blank"
        :href="repository.pullRequest.url">
        #{{repository.pullRequest.number}}
        </a>
      </h1>
      <v-container>
        <v-row>
          <v-col sm="12" md="2"> 
            <v-layout column>
              <v-flex class="mb-3">
                <h4>Cohesión Grupal:</h4>
                <Doughnut :chartData='chartCoheGrupal'/>
              </v-flex>
              <v-flex>
                <p>Participantes: {{this.participants.length}}</p>
              </v-flex>
              <v-flex>
                <p>Tamaño PR: 
                {{this.repository.pullRequest.additions + this.repository.pullRequest.deletions}}</p>
              </v-flex>
              <v-flex>
                <p>Estado: {{this.repository.pullRequest.state}}</p>
              </v-flex>
            </v-layout>
          </v-col>

          <v-col sm="12" md="5">
            <h4>Cohesión Individual:</h4>
            <BarChart :chartData='chartCohe'/>
          </v-col>
            <v-col sm="12" md="5">
            <h4>Colaboración Individual:</h4>
            <BarChart :chartData='chartColab'/>
          </v-col>
        </v-row>
        <v-row>
          <v-col sm="12" md="12">
            <h4>Cantidad de Mensajes:</h4>
            <v-data-table hide-default-footer
              :headers="encabezados"
              :items="estadisticas"
              :items-per-page="20"
              class="elevation-1 mt-2"
            ></v-data-table>
          </v-col>
        </v-row>
      </v-container>


    </div>
  </div>
</template>

<script>
import PRSelector from '../components/PRSelector'
import BarChart from "../components/chartjs/BarChart.vue"
import Doughnut from "../components/chartjs/Doughnut.vue"
import {GET_REPO} from '../graphql/queries.js'
import moment from "moment";
moment.locale("es-us");

export default {
  components: { 
    PRSelector,
    BarChart,
    Doughnut
  },
  data() {
    return {
      show: false,
      countMatrix: '',
      cohesionMatrix: '',
      colaboracionMatrix: '',
      participants: '',
      repository: '',
      chartCohe: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "rgba(0, 71, 255, 1)"
          }
        ]
      },
      chartCoheGrupal: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: ["rgba(0, 71, 255, 1)", "#ccccff"]
          }
        ]
      },
      chartColab: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "rgba(0, 71, 255, 1)"
          }
        ]
      },
      estadisticas: '',
      encabezados: [
        { text: 'Participante', sortable: false, value: 'nombre' },
        { text: 'Msj. Enviados', value: 'msjEnviados' },
        { text: 'Msj. Recibidos', value: 'msjRecibidos' }
      ],
      cohesionGrupal: ''
    }
  },
  apollo:{
    repository: {
      query: GET_REPO,
      variables: {owner: "flacket", name: "githubanalytic", number: 150},
    },
  },
  mounted:function(){
    this.$apollo.skipAll = true
  },
  methods: {
    cohesionFormula() {
      var cantPersonas = this.repository.pullRequest.participants.totalCount
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
    },
    colaboracionFormula(){
      var cantPersonas = this.repository.pullRequest.participants.totalCount
      //crear matriz NxN
      var x = new Array(cantPersonas);
      for (let n = 0; n < cantPersonas; n++)
        { x[n] = new Array(cantPersonas) }
      this.colaboracionMatrix = x

      var totalinterac = new Array(cantPersonas);
      for(let p = 0; p < cantPersonas; p++){
        for(let f = 0; f < cantPersonas; f++){
          totalinterac[p] = 0
        }
      }
      for(let p = 0; p < cantPersonas; p++){
        for(let f = 0; f < cantPersonas; f++){
          totalinterac[p] += this.countMatrix[p][f]
        }
      }

      for(let c = 0; c < cantPersonas; c++){
        for(let f = 0; f < cantPersonas; f++){
          //contar cohesion para [c][f]
          if (c==f)
            this.colaboracionMatrix[c][f] = 0
          else{
            var result
            //cant interacciones entre f y c
            var sum = this.countMatrix[c][f] + this.countMatrix[f][c]
            if(sum > 0){
              result = sum / totalinterac[c]
            } else result = 0
            this.colaboracionMatrix[c][f] = Math.round(result * 100) / 100
            this.colaboracionMatrix[f][c] = Math.round(result * 100) / 100
          }
        }
      }
    },
    estadisticasPR() {
      this.cohesionFormula()
      this.colaboracionFormula()
      var cantPersonas = this.repository.pullRequest.participants.totalCount
      var tabla = '['
      var coeInd, colabInd, msjEnviados, msjRecibidos
      for (let i = 0; i < cantPersonas; i++){
        coeInd = 0
        colabInd = 0
        msjEnviados = 0
        msjRecibidos = 0
        for(let j = 0; j < cantPersonas; j++){
          coeInd += this.cohesionMatrix[i][j]
          colabInd += this.colaboracionMatrix[i][j]
          msjEnviados += this.countMatrix[i][j]
          msjRecibidos += this.countMatrix[j][i]
        }
        //Me aseguro que hayan mas de 2 personas para calcular las cohesiónes
        if (cantPersonas > 1)
            coeInd = (Math.round((coeInd / (cantPersonas - 1)) * 100) / 100)
            colabInd = (Math.round((colabInd / (cantPersonas - 1)) * 100) / 100)
        //creo la tabla con los datos estaditicos
        tabla += '{"nombre": "' + this.repository.pullRequest.participants.nodes[i].login +
          '", "coeInd": ' + coeInd +
          ', "colabInd": ' + colabInd +
          ', "msjEnviados": ' + msjEnviados +
          ', "msjRecibidos": ' + msjRecibidos + '}'
        if (i+1 < cantPersonas)
          tabla += ','
      }
      tabla += ']'
      this.estadisticas = JSON.parse(tabla)
      //Obtengo la cohesión grupal
      var cohesionGrupal = 0
      this.estadisticas.forEach(function (item) {
        cohesionGrupal += item.coeInd
      })
      cohesionGrupal = cohesionGrupal / this.estadisticas.length
      //Doy formato al valor de CohesionGrupal para el gráfico
      cohesionGrupal = cohesionGrupal * 100
      this.chartCoheGrupal.labels[0] = cohesionGrupal.toFixed(2) + '%'
      this.chartCoheGrupal.datasets[0].data[0] = cohesionGrupal
      this.chartCoheGrupal.datasets[0].data[1] = 100 - cohesionGrupal
      this.chartDataFormatCohe()
      this.chartDataFormatColab()
    },
    chartDataFormatCohe() {
      //Genera el dataset para armar el grafico de cohesion individual
      let cantPersonas = this.repository.pullRequest.participants.totalCount
      this.chartCohe.labels = []
      this.chartCohe.datasets[0].data = []
      for(let i = 0; i < cantPersonas; i++){
        this.chartCohe.labels.push(this.estadisticas[i].nombre)
        this.chartCohe.datasets[0].data.push((this.estadisticas[i].coeInd * 100).toFixed(2))
      }
      this.show = true
    },
    chartDataFormatColab() {
      //Genera el dataset para armar el grafico de cohesion individual
      let cantPersonas = this.repository.pullRequest.participants.totalCount
      this.chartColab.labels = []
      this.chartColab.datasets[0].data = []
      for(let i = 0; i < cantPersonas; i++){
        this.chartColab.labels.push(this.estadisticas[i].nombre)
        this.chartColab.datasets[0].data.push((this.estadisticas[i].colabInd * 100).toFixed(2))
      }
      this.show = true
    },
    refreshQuery(search) {
      this.show = false
      if (!this.$apollo.skipAll){
        this.$apollo.skipAll = false
      }

      this.$apollo.queries.repository.refetch({ 
        owner: search.owner, 
        name: search.name, 
        number: parseInt(search.number)
      }).then(() => {
        //Llamo a hacer el conteo de Interacciones
        this.countMatrix = this.matrizConteoPR(this.repository.pullRequest)
        //LLamo a generar las estadisticas en base al conteo
        this.estadisticasPR()
      }) //apollo refetch
    },
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
    }//matrizConteoPR
  }
}
</script>