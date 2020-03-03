import moment from 'moment'
moment.locale('es-us')

export function duracionPRdias(tcreated, tclosed) {
  //Obtengo la duracion del PR en días
  let createdAt = moment(tcreated)
  let closedAt = moment(tclosed)
  // get the difference between the moments
  let diff = closedAt.diff(createdAt)
  //expresarlo como duracion
  let diffDuration = moment.duration(diff)
  diff = diffDuration.days()
  //eliminar ceros para evitar errores en operaciones
  if (diff == 0)
    diff = 1
  let duraciondias = {
    createdAt: createdAt.format("DD/MM/YY"),
    closedAt: closedAt.format("DD/MM/YY"),
    diff: diff
  }
  return duraciondias
}
export function cohesionFormula(cantPersonas, countMatrix) {
    //Esta funcion crea una matriz de cohesion interpersonal
    //entre los usuarios participantes de un Pull Request
    //crear matriz NxN 
    let cohesionMatrix = new Array(cantPersonas)
    for (let n = 0; n < cantPersonas; n++)
      { cohesionMatrix[n] = new Array(cantPersonas) }

    for(let c = 0; c < cantPersonas; c++){
      for(let f = 0; f < cantPersonas; f++){
        //contar cohesion para [c][f]
        if (c==f)
          cohesionMatrix[c][f] = 0
        else{
          var result
          var sum = countMatrix[c][f] + countMatrix[f][c]
          if(sum > 0){
            result = 1 - ((Math.abs(countMatrix[c][f] - countMatrix[f][c])) / sum)
          } else result = 0
          cohesionMatrix[c][f] = Math.round(result * 100) / 100
          cohesionMatrix[f][c] = Math.round(result * 100) / 100
        }
      }
    }
    return cohesionMatrix
  }
  export function colaboracionFormula(cantPersonas, countMatrix){
    //crear matriz NxN
    var colaboracionMatrix = new Array(cantPersonas);
    for (let n = 0; n < cantPersonas; n++)
      { colaboracionMatrix[n] = new Array(cantPersonas) }

    var totalinterac = new Array(cantPersonas);
    for(let p = 0; p < cantPersonas; p++){
      for(let f = 0; f < cantPersonas; f++){
        totalinterac[p] = 0
      }
    }
    for(let p = 0; p < cantPersonas; p++){
      for(let f = 0; f < cantPersonas; f++){
        totalinterac[p] += countMatrix[p][f]
      }
    }

    for(let c = 0; c < cantPersonas; c++){
      for(let f = 0; f < cantPersonas; f++){
        //contar cohesion para [c][f]
        if (c==f)
          colaboracionMatrix[c][f] = 0
        else{
          var result
          //cant interacciones entre f y c
          var sum = countMatrix[c][f] + countMatrix[f][c]
          if(sum > 0){
            result = sum / totalinterac[c]
          } else result = 0
          colaboracionMatrix[c][f] = Math.round(result * 100) / 100
          colaboracionMatrix[f][c] = Math.round(result * 100) / 100
        }
      }
    }
    return colaboracionMatrix
  }
  export function matrizConteoPR(pullRequest){
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