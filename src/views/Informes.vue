<template>
  <div>
  <h1 class="subheading-1 blue--text">Informes</h1>

  <PRSelector v-on:searchPR="refreshQuery"></PRSelector>
  <v-progress-linear v-if="$apollo.loading" indeterminate color="primary"></v-progress-linear>
  <v-divider class="mb-2"></v-divider>

  <v-expansion-panels accordion v-if="show">
    <v-expansion-panel
      v-for="item in pullRequests"
      :key="item.number"
    >
      <v-expansion-panel-header>{{item.title}}</v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-data-table
          :headers="encabezados"
          :items="item.estadisticas"
          :items-per-page="20"
        ></v-data-table>
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
import {GET_REPO} from '../graphql/queries.js'
import moment from "moment";
moment.locale("es-us");

export default {
  components: { PRSelector },
  data() {
    return {
      show: true,
      repository: '',
      pullRequests: [],
      countMatrix: '',
      cohesionMatrix: '',
      estadisticas: '',
      encabezados: [
        { text: 'Participante', sortable: false, value: 'nombre' },
        { text: 'Cohesion Ind', value: 'coeInd' },
        { text: 'Msj. Enviados', value: 'msjEnviados' },
        { text: 'Msj. Recibidos', value: 'msjRecibidos' }
      ],
    }
  },
  apollo:{
    repository: {
      query: GET_REPO,
      variables: {owner: "cdr", name: "code-server", number: 154}
    }
  },
  methods: {
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
    refreshQuery(search) {
      this.$apollo.queries.repository.refetch({ 
        owner: search.owner, 
        name: search.name, 
        number: parseInt(search.number)
      }).then(() => {
        console.log(this.repository.pullRequest)

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
      })
    }
  }
}
</script>