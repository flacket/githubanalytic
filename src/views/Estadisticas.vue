<template>
  <div class="pullrequest">
  <h1 class="subheading-1 blue--text">Estadísticas</h1>
  <a class="headline grey--text" target="_blank"
  href="https://drive.google.com/open?id=1W8h82JV60Z-aL4g64GW67DpM28ghSDeGrFt2KFpqU8s">
  Link Drive</a> 
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
  <v-progress-linear v-if="$apollo.loading" indeterminate color="primary"></v-progress-linear>
  <div v-if="show">
    <v-data-table
      :headers="encabezados"
      :items="estadisticas"
      :items-per-page="20"
      class="elevation-1 mt-2"
    ></v-data-table>
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
  </div>

  </div>
</template>

<script>
import {GET_REPO} from '../queries.js'
import moment from "moment";
moment.locale("es-us");

export default {
  data() {
    return {
      show: false,
      countMatrix: '',
      cohesionMatrix: '',
      cohesionInd: '',
      encabezados: [
          {
            text: 'Participante',
            align: 'left',
            sortable: false,
            value: 'nombre',
          },
          { text: 'Cohesion Ind', value: 'coeInd' },
          { text: 'Msj. Enviados', value: 'msjEnviados' },
          { text: 'Msj. Recibidos', value: 'msjRecibidos' }
        ],
      estadisticas: '',
      participants: '',
      repository: '',
      number: '',
      owner: 'cdr', name: 'code-server',
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
      console.log(this.estadisticas)
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
    refreshQuery() {
      this.$apollo.queries.repository.refetch({ number: this.number })
      .then(() => {
        console.clear()
        var cantPersonas = this.repository.pullRequest.participants.totalCount
        this.participants = new Array();

        //cargar lista personas
        var self = this
        this.repository.pullRequest.participants.edges.forEach(function(element) {
          self.participants.push(element.node.login)
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
        //variables para revisar si repite comentario
        var lastCommentBody
        var lastCommentDate
        var lastCommentAuthor = null
        //Contar Cometarios
        this.repository.pullRequest.comments.edges.forEach(function(element) {
          //verifico si el comentario esta antes de la fecha de cierre
          if(element.node.createdAt < self.repository.pullRequest.closedAt 
            || !self.repository.pullRequest.closedAt){
            console.log('--------------------')
            console.log('FComentario: ', element.node.createdAt)
          let encontrado = false
          let c = 0

          //reviso que el usuario no repita comentario
          //ni escriba 2 mensajes seguidos
          var commentNoValido = false
          if ((lastCommentAuthor != null) && (lastCommentAuthor == element.node.author.login)){
          // comenta el mismo del comentario anterior
            let momentDate = moment(element.node.createdAt, 'YYYY-MM-DDTHH:mm:ssZ');
            let ComentDate = momentDate.toDate();
            let timeLapsed = (ComentDate.getTime() - lastCommentDate.getTime()) / 1000
            console.log('Minutos:', timeLapsed/60)
            console.log('lastCommentAuthor:', lastCommentAuthor)
            console.log('Author:', element.node.author.login)
            if ((lastCommentBody == element.node.body)||(timeLapsed < 900)){ 
              //el comentario se repite o fecha es menor a 15 min
              commentNoValido = true
              console.log('no valido')
            }
          }
          //registro el comentario para revisar despues si repite
          let momDate = moment(element.node.createdAt, 'YYYY-MM-DDTHH:mm:ssZ');
          lastCommentDate = momDate.toDate();
          lastCommentBody = element.node.body
          lastCommentAuthor = element.node.author.login

          while (!encontrado){
              if (self.participants[c] == element.node.author.login){
                encontrado = true
                //este participante ha hecho un comentario
                //Busco si el comentario menciona (@) algun participante
                var arrobaBandera = false
                for (i = 0; i < cantPersonas; i++){
                  if(element.node.body.search('@' + self.participants[i])>-1){
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
        this.repository.pullRequest.reviewThreads.edges.forEach(function(element){
          //este array va a mantener las personas que comentaron en el review
          //para despues poder usarlas como receptor en el conteo de interacciones
          var reviewArray = new Array()        
          //reinicio la variable para revisar si repite reviews
          lastCommentAuthor = null
          console.log('---')
          for (var comm = 0; comm < element.node.comments.totalCount; comm++){
            var reviewComment = element.node.comments.edges[comm].node
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
              var data = { name: reviewComment.author.login,
                          pos: posicion }
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
                if (self.participants[j] == reviewComment.reactions.edges[index].node.user.login){
                  console.log(' -Reacciona: ', reviewComment.reactions.edges[index].node.user.login)
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
      }) //apollo refetch
    } //refresh query()
  }
}
</script>