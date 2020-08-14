import moment from "moment";
moment.locale("es-us");
/*export function listaParticipantesRepo(pullRequests) {
  //creo una lista de los Paticipantes de cada PR del repositorio
  let listPersonas = [];
  pullRequests.forEach((PR) => {
    PR.participants.nodes.forEach((participante) => {
      if (!listPersonas.includes(participante.login)) {
        listPersonas.push(participante.login);
      }
    });
  });
  return listPersonas;
}*/
export function getParticipantesRepoStat(estadisticasPR) {
  //console.log("estadisticasPR: ", estadisticasPR);
  //creo una lista de los Paticipantes de cada PR del repositorio
  let participantesStat = [];
  estadisticasPR.forEach((PR) => {
    PR.tabla.forEach((participante) => {
      let cantParticipantes = participantesStat.length;
      let encontrado = false;
      let i = 0;
      while (!encontrado && i < cantParticipantes) {
        if (participantesStat[i].nombre == participante.nombre)
          encontrado = true;
        else i++;
      }
      if (encontrado) {
        //agrego stats al participante existente
        participantesStat[i].coheIndSum += participante.coeInd;
        participantesStat[i].coheIndTotal++;
        participantesStat[i].coheInd =
          participantesStat[i].coheIndSum / participantesStat[i].coheIndTotal++;
        participantesStat[i].colabIndSum += participante.colabInd;
        participantesStat[i].colabIndTotal++;
        participantesStat[i].colabInd =
          participantesStat[i].colabIndSum /
          participantesStat[i].colabIndTotal++;
        participantesStat[i].mimicaIndSum += participante.mimicaInd;
        participantesStat[i].mimicaIndTotal++;
        participantesStat[i].mimicaInd =
          participantesStat[i].mimicaIndSum /
          participantesStat[i].mimicaIndTotal++;
        participantesStat[i].tonoIndSum += participante.mimicaInd;
        participantesStat[i].tonoIndTotal++;
        participantesStat[i].tonoInd =
          participantesStat[i].tonoIndSum / participantesStat[i].tonoIndTotal++;
        participantesStat[i].CantPRParticipa++;
        if (participantesStat[i].nombre == PR.autor)
          participantesStat[i].CantPRAuthor++;
      } else {
        //agrego stats como participante nuevo
        var partStat = {
          nombre: participante.nombre,
          coheInd: participante.coeInd,
          coheIndSum: participante.coeInd,
          coheIndTotal: 1,
          colabInd: participante.colabInd,
          colabIndSum: participante.colabInd,
          colabIndTotal: 1,
          mimicaInd: participante.mimicaInd,
          mimicaIndSum: participante.mimicaInd,
          mimicaIndTotal: 1,
          tonoInd: participante.tonoInd,
          tonoIndSum: participante.tonoInd,
          tonoIndTotal: 1,
          CantPRAuthor: 0,
          CantPRParticipa: 1,
        };
        if (partStat.nombre == PR.autor) partStat.CantPRAuthor++;
        participantesStat.push(partStat);
      }
    });
  });
  return participantesStat;
}
export function habilidadParticipante(pullRequests) {
  //creo una lista de los Paticipantes de cada PR del repositorio
  var listPersonas = [];
  for (let i = 0; i < pullRequests.length; i++) {
    //hago una lista de participantes
    for (let j = 0; j < pullRequests[i].participants.nodes.length; j++) {
      //Busco si el participante ya esta incluido en la lista
      var index = -1;
      for (var p = 0; p < listPersonas.length; p++) {
        if (
          listPersonas[p].nombre == pullRequests[i].participants.nodes[j].login
        ) {
          index = p;
        }
      }
      //si no esta incluido lo agrego
      if (index == -1) {
        let newpersona = {
          nombre: pullRequests[i].participants.nodes[j].login,
          cantAutor: 0,
          cantMerge: 0,
        };
        index = listPersonas.push(newpersona);
        index = index - 1;
      }
      //busco el creador del PR y reviso si fue mergeado y sumo
      if (
        pullRequests[i].author.login ==
        pullRequests[i].participants.nodes[j].login
      ) {
        listPersonas[index].cantAutor++;
        if (pullRequests[i].state == "MERGED") listPersonas[index].cantMerge++;
      }
    }
  }
  return listPersonas;
}
export function duracionPRdias(tcreated, tclosed) {
  //Obtengo la duracion del PR en días
  let createdAt = moment(tcreated);
  let closedAt = moment(tclosed);
  // get the difference between the moments
  let diff = closedAt.diff(createdAt);
  //expresarlo como duracion
  let diffDuration = moment.duration(diff);
  //console.log("diffDuration: ", diffDuration);
  //TODO: mejorar
  diff =
    diffDuration.days() +
    "D:" +
    diffDuration.hours() +
    "H:" +
    diffDuration.minutes() +
    "M";
  //eliminar ceros para evitar errores en operaciones
  if (diff == 0) diff = 1;
  let duraciondias = {
    createdAt: createdAt.format("DD/MM/YY"),
    closedAt: closedAt.format("DD/MM/YY"),
    diff: diff,
  };
  return duraciondias;
}
export function cohesionFormula(cantPersonas, countMatrix) {
  //Esta funcion crea una matriz de cohesion interpersonal
  //entre los usuarios participantes de un Pull Request
  //crear matriz NxN
  let cohesionMatrix = new Array(cantPersonas);
  for (let n = 0; n < cantPersonas; n++) {
    cohesionMatrix[n] = new Array(cantPersonas);
  }
  //recorro y cargo la matriz
  for (let c = 0; c < cantPersonas; c++) {
    for (let f = c; f < cantPersonas; f++) {
      //contar cohesion para [c][f]
      if (c == f) cohesionMatrix[c][f] = 0;
      else {
        var result;
        var sum = countMatrix[c][f] + countMatrix[f][c];
        if (sum > 0) {
          //aplico la formula y luego redondeo
          result = 1 - Math.abs(countMatrix[c][f] - countMatrix[f][c]) / sum;
          result = Math.round(result * 100) / 100;
        } else result = 0;
        cohesionMatrix[c][f] = result;
        cohesionMatrix[f][c] = result;
      }
    }
  }
  return cohesionMatrix;
}
export function comunaFormula(participantes) {
  //TODO: EXPLICAR ESTO
  //Esta funcion crea una matriz de comunalidad
  //entre los usuarios participantes de un Pull Request
  //########################################################
  let cantPersonas = participantes.totalCount;
  //creo un arreglo dando formato a los datos de comunalidad
  //para luego calcular la formula sobre esos datos
  let comunaConteo = [];
  for (let i = 0; i < cantPersonas; i++) {
    let varComuna = { location: "", following: "", starredRepos: "" };
    varComuna.location = participantes.nodes[i].location;

    participantes.nodes[i].following.nodes.forEach((following) => {
      varComuna.following = varComuna.following + " " + following.id;
    });
    participantes.nodes[i].starredRepositories.nodes.forEach((starredRepos) => {
      varComuna.starredRepos = varComuna.starredRepos + " " + starredRepos.id;
    });
    comunaConteo.push(varComuna);
  }
  //creo una variable con la funcion del coseno de similaridad
  const docSimilarity = require("doc-similarity");
  //crear matriz NxN de comunalidad
  let comunaMatrix = new Array(cantPersonas);
  for (let n = 0; n < cantPersonas; n++) {
    comunaMatrix[n] = new Array(cantPersonas);
  }
  //recorro y cargo la matriz
  for (let i = 0; i < cantPersonas; i++) {
    for (let j = i; j < cantPersonas; j++) {
      //contar cohesion para [i][j]
      if (i == j) comunaMatrix[i][j] = 0;
      else {
        let following, starredRepos, location, result;
        //calculo similaridad de seguidos
        following = docSimilarity.wordFrequencySim(
          comunaConteo[i].following,
          comunaConteo[j].following,
          docSimilarity.jaccardSim
        );
        //calculo similaridad de seguidos
        starredRepos = docSimilarity.wordFrequencySim(
          comunaConteo[i].starredRepos,
          comunaConteo[j].starredRepos,
          docSimilarity.jaccardSim
        );
        //TODO:Calculo distancia por indice de Hofstead
        location = 0;
        result = (following + starredRepos + location) / 3;
        result = (following + starredRepos) / 2; //NOTE: borrar cuando este lista location
        comunaMatrix[i][j] = Math.round(result * 100) / 100;
        comunaMatrix[j][i] = comunaMatrix[i][j];
      }
    }
  }
  return comunaMatrix;
}
export function colaboracionFormula(cantPersonas, countMatrix) {
  //crear matriz NxN
  var colaboracionMatrix = new Array(cantPersonas);
  var totalinterac = new Array(cantPersonas);
  for (let n = 0; n < cantPersonas; n++) {
    colaboracionMatrix[n] = new Array(cantPersonas);
    totalinterac[n] = 0;
  }
  //calculo el total de interacciones de cada participante con el resto
  for (let i = 0; i < cantPersonas; i++) {
    for (let j = 0; j < cantPersonas; j++) totalinterac[i] += countMatrix[i][j];
  }
  for (let i = 0; i < cantPersonas; i++) {
    for (let j = i; j < cantPersonas; j++) {
      //contar cohesion para [i][j]
      if (i == j) colaboracionMatrix[i][j] = 0;
      //colaboracion entre i y j en conjunto
      else {
        let result;
        //cant interacciones entre j y i
        var sum = countMatrix[i][j] + countMatrix[j][i];
        if (totalinterac[i] > 0 && totalinterac[j] > 0) {
          //aplico la formula de colaboración
          result = sum / (totalinterac[i] + totalinterac[j]);
          //redondeo el resultado
          result = Math.round(result * 100) / 100;
        } else {
          //no hay interacciones entre i y j
          result = 0;
        }
        colaboracionMatrix[i][j] = result;
        colaboracionMatrix[j][i] = result;
      }
      //colaboracion de i con j, y de j con i
      /*else {
        let resulti, resultj;
        //cant interacciones entre j y i
        var sum = countMatrix[i][j] + countMatrix[j][i];
        if (totalinterac[i] > 0 && totalinterac[j] > 0) {
          //aplico la formula de colaboración
          resulti = sum / totalinterac[i];
          resultj = sum / totalinterac[j];
          //redondeo el resultado
          resulti = Math.round(resulti * 100) / 100;
          resultj = Math.round(resultj * 100) / 100;
        } else {
          //no hay interacciones entre i y j
          resulti = 0;
          resultj = 0;
        }
        colaboracionMatrix[i][j] = resulti;
        colaboracionMatrix[j][i] = resultj;
      }*/
    }
  }
  return colaboracionMatrix;
}
export function getPRChat(cantPersonas, pullRequest) {
  //Crea una lista de los comentarios que se hicieron en un PR
  //mostrando Participante, Comentario y Fecha
  var listaChat = new Array(cantPersonas);

  pullRequest.comments.nodes.forEach((comment) => {
    let row = {
      Participante: comment.author.login,
      Comentario: comment.body,
      Fecha: comment.createdAt,
    };
    listaChat.push(row);
  });
  pullRequest.reviewThreads.nodes.forEach((review) => {
    review.comments.nodes.forEach((reviewcomment) => {
      let row = {
        Participante: reviewcomment.author.login,
        Comentario: reviewcomment.body,
        Fecha: reviewcomment.createdAt,
      };
      listaChat.push(row);
    });
  });

  return listaChat;
}
function listaComentariosParticipante(cantPersonas, pullRequest) {
  //creo una lista donde cada slot tiene todos los
  //comentarios encadenados de un participante
  var listaComents = new Array(cantPersonas);

  for (let i = 0; i < cantPersonas; i++) {
    let person = pullRequest.participants.nodes[i].login;
    //me fijo si el comentario dela persona es la del Autor
    //caso contrario "cereo" la cadena para las prox consultas
    if (person == pullRequest.author.login) listaComents[i] = pullRequest.body;
    else listaComents[i] = "";
    pullRequest.comments.nodes.forEach((comment) => {
      if (person == comment.author.login)
        listaComents[i] = listaComents[i] + " " + comment.body;
    });
    pullRequest.reviewThreads.nodes.forEach((review) => {
      review.comments.nodes.forEach((reviewcomment) => {
        if (person == reviewcomment.author.login)
          listaComents[i] = listaComents[i] + " " + reviewcomment.body;
      });
    });
    //console.log('- Persona: ', person)
    //console.log(listaComents[i])
  }
  return listaComents;
}
export function mimicaFormula(cantPersonas, pullRequest) {
  //Esta funcion crea una matriz con el grado de mimica de los participantes
  //el grado de mimica es la similaridad que hay entre sus comentarios en un PR
  //https://www.npmjs.com/package/doc-similarity
  let listaComm = listaComentariosParticipante(cantPersonas, pullRequest);
  //creo una variable con la funcion del coseno de similaridad
  const docSimilarity = require("doc-similarity");
  //crear matriz NxN
  let mimicaMatrix = new Array(cantPersonas);
  for (let n = 0; n < cantPersonas; n++)
    mimicaMatrix[n] = new Array(cantPersonas);
  //calculo valores de mimica para la matriz
  for (let i = 0; i < cantPersonas; i++) {
    for (let j = i; j < cantPersonas; j++) {
      //contar cohesion para [i][j]
      if (i == j) mimicaMatrix[i][j] = 0;
      else {
        let result;
        //llamo a la funcion de coseno de similaridad
        result = docSimilarity.wordFrequencySim(
          listaComm[i],
          listaComm[j],
          docSimilarity.cosineSim
        );
        mimicaMatrix[i][j] = Math.round(result * 100) / 100;
        mimicaMatrix[j][i] = mimicaMatrix[i][j];
      }
    }
  }
  return mimicaMatrix;
}
export function polaridadFormula(cantPersonas, pullRequest) {
  let listaComm = listaComentariosParticipante(cantPersonas, pullRequest);
  let polarity = require("polarity");
  let polarityTable = new Array();
  for (let i = 0; i < cantPersonas; i++) {
    //reemplazo caracteres indeseados
    let str = listaComm[i].replace(/"/g, " ");
    str = str.replace(/\n/g, " ");
    //divido el string en un arreglo de palabras
    let arreglo = str.trim().split(" ");
    //aplico función de polaridad
    let polaridad = polarity(arreglo);
    polarityTable.push(polaridad);
  }
  return polarityTable;
}
export function matrizConteoPR(pullRequest) {
  //busco cantidad de participantes
  let cantPersonas = pullRequest.participants.totalCount;
  //y almaceno el nombre de cada participante
  let participants = new Array();
  pullRequest.participants.nodes.forEach(function(element) {
    participants.push(element.login);
  });
  //crear matriz NxN (con ceros)
  var countMatrix = new Array(cantPersonas);
  for (var i = 0; i < cantPersonas; i++) {
    countMatrix[i] = new Array(cantPersonas);
    for (var j = 0; j < cantPersonas; j++) {
      countMatrix[i][j] = 0;
    }
  }
  //Primer Cometario
  for (i = 1; i < cantPersonas; i++) {
    countMatrix[0][i]++;
  }
  pullRequest.reactions.nodes.forEach(function(element) {
    let encontrado = false;
    let e = 1; //salteo el participante de la pos[0], no se va a autorreaccionar
    while (!encontrado) {
      if (participants[e] == element.user.login) {
        //console.log('Reacciona 1er comment: ', participants[e])
        //este participante le reacciono al creador del PR
        countMatrix[e][0]++;
        encontrado = true;
      } else if (e == cantPersonas) {
        encontrado = true;
      }
      e++;
    }
  });
  //console.log('----- COMMENTS -----')
  //variables para revisar si repite comentario
  var lastCommentBody;
  var lastCommentDate;
  var lastCommentAuthor = null;
  //Contar Cometarios
  pullRequest.comments.nodes.forEach(function(element) {
    //verifico si el comentario esta antes de la fecha de cierre
    if (element.createdAt < pullRequest.closedAt || !pullRequest.closedAt) {
      //console.log('--------------------')
      //console.log('FComentario: ', element.createdAt)
      let encontrado = false;
      let c = 0;
      //reviso que el usuario no repita comentario
      //ni escriba 2 mensajes seguidos
      var commentNoValido = false;
      if (
        lastCommentAuthor != null &&
        lastCommentAuthor == element.author.login
      ) {
        // comenta el mismo del comentario anterior
        let momentDate = moment(element.createdAt, "YYYY-MM-DDTHH:mm:ssZ");
        let ComentDate = momentDate.toDate();
        let timeLapsed =
          (ComentDate.getTime() - lastCommentDate.getTime()) / 1000;
        //console.log('Minutos:', timeLapsed/60)
        //console.log('lastCommentAuthor:', lastCommentAuthor)
        //console.log('Author:', element.author.login)
        if (lastCommentBody == element.body || timeLapsed < 900) {
          //el comentario se repite o fecha es menor a 15 min
          commentNoValido = true;
          //console.log('no valido')
        }
      }
      //registro el comentario para revisar despues si repite
      let momDate = moment(element.createdAt, "YYYY-MM-DDTHH:mm:ssZ");
      lastCommentDate = momDate.toDate();
      lastCommentBody = element.body;
      lastCommentAuthor = element.author.login;
      //busco el participante que hizo el comentario
      while (!encontrado) {
        if (participants[c] == element.author.login) {
          encontrado = true;
          //este participante ha hecho un comentario
          //Busco si el comentario menciona (@) algun participante
          var arrobaBandera = false;
          for (i = 0; i < cantPersonas; i++) {
            if (element.body.search("@" + participants[i]) > -1) {
              //el comentario menciona esta persona
              if (c != i) {
                //si no es el que comenta
                //console.log('Comenta: ', participants[c])
                //console.log(' -Hacia: @' + participants[i])
                countMatrix[c][i]++;
                arrobaBandera = true;
              }
            }
          }
          if (!arrobaBandera) {
            //el comentario va para todos (no @ a nadie)
            if (!commentNoValido) {
              //el comentario no esta repetido
              //console.log('Comenta: ', participants[c])
              //console.log(' -Hacia: Todos')
              for (i = 0; i < cantPersonas; i++) {
                if (c != i)
                  //si no es el que comenta
                  countMatrix[c][i]++;
              }
            }
          }
          //reacciones al comentarios
          //crear array de reaccionadores
          var reactionArray = new Array();
          for (var index = 0; index < element.reactions.totalCount; index++) {
            let enc = false;
            let j = 0;
            while (!enc) {
              if (
                participants[j] == element.reactions.nodes[index].user.login
              ) {
                //este participante le reacciono al creador del PR
                enc = true;
                //verificar si no reacciono antes
                let i = 0;
                var yaReacciono = false;
                while (i < reactionArray.length && !yaReacciono) {
                  if (participants[j] == reactionArray[i]) yaReacciono = true;
                  else i++;
                }
                if (!yaReacciono) {
                  //console.log('  -Reacciona: ', participants[j])
                  reactionArray.push(participants[j]);
                  countMatrix[j][c]++;
                }
              } else if (j == cantPersonas) {
                enc = true;
              }
              j++;
            }
          } //reaccion comentarios
        } else if (c == cantPersonas) {
          encontrado = true;
        }
        c++;
      } //while encontrado
    }
  }); //contar comentarios
  //console.log('----- REVIEWS -----')
  //contar reviews
  pullRequest.reviewThreads.nodes.forEach(function(element) {
    //este array va a mantener las personas que comentaron en el review
    //para despues poder usarlas como receptor en el conteo de interacciones
    var reviewArray = new Array();
    //reinicio la variable para revisar si repite reviews
    lastCommentAuthor = null;
    //console.log('---')
    element.comments.nodes.forEach(function(reviewComment) {
      //busco el index del comentarista
      var encontrado = false;
      var c = 0;
      var posicion;
      try {
        while (!encontrado) {
          if (participants[c] == reviewComment.author.login) {
            encontrado = true;
            //este participante ha hecho un comentario, se guarda su posicion
            posicion = c;
          } else if (c == cantPersonas) {
            encontrado = true;
          }
          c++;
        }
        let add = true;
        c = 0;
        if (reviewArray.length != 0) {
          while (add && c < reviewArray.length) {
            if (posicion == reviewArray[c].pos) {
              add = false;
            }
            c++;
          }
        }
        if (add) {
          //Agrego el comentarista al array
          var data = { name: reviewComment.author.login, pos: posicion };
          reviewArray.push(data);
        }
        //NOTE: PROBAR SI ESTA PARTE SE PUEDE MEZCLAR CON EL "NOTE" DE ARRIBA
        //Busco si el comentario menciona (@) algun participante
        var arrobaBandera = false;
        for (i = 0; i < cantPersonas; i++) {
          if (reviewComment.body.search("@" + participants[i]) > -1) {
            //el comentario menciona esta persona
            //si no es el que comenta y no va a ser contado (en reviewArray)
            if (c != i && !reviewArray.includes(participants[i])) {
              //console.log('Comenta: ', participants[posicion])
              //console.log(' -Hacia: @', participants[i])
              countMatrix[c][i]++;
              arrobaBandera = true;
            }
          }
        }
        //reviso que el usuario no repita comentario
        //ni escriba 2 mensajes seguidos
        var commentNoValido = false;
        if (
          lastCommentAuthor != null &&
          lastCommentAuthor == reviewComment.author.login
        ) {
          // comenta el mismo del comentario anterior
          let momentDate = moment(
            reviewComment.createdAt,
            "YYYY-MM-DDTHH:mm:ssZ"
          );
          let ComentDate = momentDate.toDate();
          let timeLapsed =
            (ComentDate.getTime() - lastCommentDate.getTime()) / 1000;
          //console.log('Minutos:', timeLapsed/60)
          //console.log('lastCommentAuthor:', lastCommentAuthor)
          //console.log('Author:', reviewComment.author.login)
          if (lastCommentBody == reviewComment.body || timeLapsed < 900) {
            //el comentario se repite o fecha es menor a 15 min
            commentNoValido = true;
            //console.log('no valido')
          }
        }
        //registro el comentario para revisar despues si repite
        let momDate = moment(reviewComment.createdAt, "YYYY-MM-DDTHH:mm:ssZ");
        lastCommentDate = momDate.toDate();
        lastCommentBody = reviewComment.body;
        lastCommentAuthor = reviewComment.author.login;
        //si es el primer comentario del review
        if (reviewArray.length == 1) {
          //el comentario va para el creador del PR
          countMatrix[posicion][0]++;
        } else {
          //sumo comentario de <<posicion>> a las personas, que ya comentaron en el mismo review
          if (!arrobaBandera && !commentNoValido) {
            //solo si no hay gente arrobada, y el comentario no esta repetido
            for (i = 0; i < reviewArray.length; i++) {
              if (posicion != reviewArray[i].pos) {
                //console.log('Comenta: ', participants[posicion], ' | (no@)Hacia: ', participants[reviewArray[i].pos])
                countMatrix[posicion][reviewArray[i].pos]++;
              }
            }
          }
        }
        //console.log('Review Comments - Reactions:')
        //reacciones al comentarios
        for (
          var index = 0;
          index < reviewComment.reactions.totalCount;
          index++
        ) {
          let enc = false;
          let j = 0;
          //busco la posicion en la matriz del que reacciona
          while (!enc) {
            if (
              participants[j] == reviewComment.reactions.nodes[index].user.login
            ) {
              //console.log(' -Reacciona: ', reviewComment.reactions.nodes[index].user.login)
              //este participante le reacciono al creador del PR
              countMatrix[j][posicion]++;
              enc = true;
              //} else if (j == cantPersonas)
              //  { enc = true }
              //j++
            } else j++;
            if (j == cantPersonas) enc = true;
          }
        } //reacciones
      } catch (err) {
        //TODO: this.showSnackbar('Error en Review Comments:' + err.message, 'error', 5000)
        console.log("Error en Review Comments | PR#:", pullRequest.number);
      }
    }); //comentario de cada review
  }); //contar reviews
  //devuelvo la matriz de conteo del PR
  return countMatrix;
} //matrizConteoPR
