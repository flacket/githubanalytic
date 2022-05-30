<template>
  <div>
    <div>
      <v-snackbar
        v-model="snackbar.show"
        right
        :timeout="snackbar.timeout"
        :color="snackbar.color"
      >
        {{ snackbar.text }}
        <v-btn dark rounded text @click="snackbar.show = false">Cerrar</v-btn>
      </v-snackbar>
    </div>
    <h1 class="subheading-1 blue--text">Descarga de Pull Request</h1>
    <PRSelector
      hide-number="true"
      @search-pr="getRepoPRcant"
    ></PRSelector>
    <p v-if="loading" class="font-weight-light">{{ progress.text }}</p>
    <v-progress-linear
      v-if="loading"
      color="primary"
      :buffer-value="progress.bartotal"
      :value="progress.bartotal"
      stream
    ></v-progress-linear>
    <v-divider class="my-2"></v-divider>
    <!--///////////////////////////////////////////////////////////////////////////////-->
    <v-btn v-if="!show && !loading" color="primary" rounded @click="btnLoadFile">
      <v-icon left>mdi-download</v-icon>Cargar json</v-btn
    >
    <v-btn
      v-if="loading"
      class="mb-2"
      rounded
      :color="colorCancel"
      @click="toggleCancelar"
    >
      <v-icon left>mdi-cancel</v-icon>Detener Busqueda</v-btn
    >

    <div v-if="show">
      <h2 class="subheading-1 blue--text">
        {{ search.owner }} / {{ search.name }}
      </h2>
      <v-btn class="ma-2" color="primary" rounded @click="csvExport()">
        <v-icon left>mdi-file-table</v-icon>Exportar CSV</v-btn
      >

      <v-btn color="primary" rounded @click="saveFile()">
        <v-icon left>mdi-download</v-icon>Guardar json</v-btn
      >

      <h4 class="mt-4">Datos del repositorio</h4>
      <v-card class="d-flex justify-left my-2" flat>
        <v-card class="pa-2">
          <p>Seguidores: {{repository.followers}}</p>
          <p>Estrellas: {{repository.stargazers}}</p>
          <p>Watchers: {{repository.watchers}}</p>
          <p>Forks: {{repository.forks}}</p>
        </v-card>

        <v-card class="ml-4">
          <v-simple-table fixed-header height="300px">
            <template #default>
              <thead>
                <tr>
                  <th class="text-left">Lista de Participantes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in participantsList" :key="item">
                  <td>{{ item }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card>
      </v-card>

      <h4 class="mt-4">Tabla de Comentarios</h4>
      <v-data-table
        :headers="repoListCommentsHeaders"
        :items="repoListComments"
        :items-per-page="5"
        class="elevation-1 mt-2"
      >
      <template #cell(estado)="item">
        <v-chip :color="getColor(item.estado)" dark>
          {{ item.estado }}
        </v-chip>
        </template>
      </v-data-table>

    </div>
    <input
      id="file-upload"
      ref="myFile"
      type="file"
      style="display:none"
      @change="loadFile"
    /><br />
  </div>
</template>

<script>
import PRSelector from "../components/PRSelector.vue";
import { DOWN_REPOS, REPOSITORY_PRS, USER_STATS } from "../graphql/queries.js";
import { Parser } from "json2csv";
import {
  cohesionFormula,
  colaboracionFormula,
  mimicaFormula,
  polaridadFormula,
  duracionPRdias,
  //matrizConteoPR,
  //getParticipantesRepoStat,
} from "../formulas.js";

export default {
  components: { PRSelector },
  data() {
    return {
      search: { owner: "", name: "" },
      emptyRules: [(v) => !!v || "Ingrese algun valor"],
      loading: false,
      progress: {
        text: "Cargando",
        bar: 0,
        bartotal: 0,
        totalPR: 0,
      },
      show: false,
      snackbar: {
        show: false,
        text: "Bienvenido a Gitana: Analíticas de Github",
        color: "info",
        timeout: 2500,
      },
      colorCancel: "error",
      cancel: true,
      getPR: "",
      countPRs: [],
      countMatrix: "",
      cohesionMatrix: "",
      colabMatrix: "",
      mimicaMatrix: "",
      estadisticasPersona: "",
      pullRequests: [],
      repoListComments: [],
      repoListCommentsHeaders: [
        { text: "PR", value: "PR" }, //numero
        { text: "Estado", value: "estado" }, //merged, etc
        { text: "duracionDias", value: "duracionDias" },
        { text: "lineasModif", value: "lineasModif" },
        { text: "Participante", value: "participante" },
        { text: "Comentario", value: "comentario" },
        { text: "👍", value: "Thumbs_Up" },
        { text: "👎", value: "Thumbs_Down" },
        { text: "😄", value: "Laugh" },
        { text: "🎉", value: "Hooray" },
        { text: "😕", value: "Confused" },
        { text: "❤️", value: "Heart" },
        { text: "🚀", value: "Rocket" },
        { text: "👀", value: "Eyes" },
      ],
      repository: {
        stargazers: 0, 
        forks: 0,
        watchers: 0,
        followers: 0,
      },
      usersData: "",
      estadisticas: [],
      participantsList: [],
    };
  },
  apollo: {
    getPR: {
      query: DOWN_REPOS,
      variables: {
        owner: "flacket",
        name: "githubanalytic",
        reactions: 1,
        participants: 1,
        comments: 1,
        commentsReactions: 1,
        rvThreads: 1,
        rvThreadsComments: 1,
      },
      update: (data) => data.repository,
    },
    usersData: {
      query: USER_STATS,
      variables: {
        owner: "flacket"
      },
      update: (data) => data.user,
    },
    getPRcant: {
      query: REPOSITORY_PRS,
      variables: {
        owner: "flacket",
        name: "githubanalytic",
      },
      update: (data) => data.repository.pullRequests,
    },
  },
  mounted: function() {
    this.$apollo.skipAll = true;
  },
  methods: {
    showSnackbar(text, color, timeout) {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.timeout = timeout;
      this.snackbar.show = true;
    },
    progressbar() {
      if (this.progress.bar == 0) {
        this.progress.text = "Cargando " + this.progress.totalPR + " PR's.";
        this.progress.bartotal = 0;
        this.progress.bar = 100 / (Math.ceil(this.progress.totalPR / 15) * 2);
      } else {
        this.progress.bartotal = this.progress.bartotal + this.progress.bar;
        this.progress.text =
          "Cargando " +
          this.progress.totalPR +
          " PR's. " +
          Math.floor(this.progress.bartotal) +
          "% Completado";
      }
    },
    getColor (estado) {
      switch(estado) {
        case "MERGED": return '#6f42c1'
        case "CLOSED": return '#d73a49'
        case "OPEN": return '#d73a49'
        default: return '#999999'
      }
    },
    csvExport() {
      //Creo el archivo CSV
      let header = [
        "RepoTotalFollowers",
        "RepoTotalStargazers",
        "RepoTotalWatchers",
        "RepoTotalForks",
        "PR", //numero
        "Estado", //merged, etc
        "duracionDias",
        "lineasModif",
        "Participante",
        "Comentario",
        "Thumbs_Up",
        "Thumbs_Down",
        "Laugh",
        "Hooray",
        "Confused",
        "Heart",
        "Rocket",
        "Eyes",
      ];
      const json2csvParser = new Parser({header});
      const csv = json2csvParser.parse(this.repoListComments);
      //Exporto ahora el archivo CSV
      const exportName = this.search.owner + " - " + this.search.name + ".csv" || "export.csv";
      const blob = new Blob([csv], { type: "text/csv;charset=unicode;" });
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, exportName);
      } else {
        const link = document.createElement("a");
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", exportName);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      this.showSnackbar("Archivo CSV Guardado", "success", 4000);
    },
    ListCommentsRow() {
      //creo la fila para cada elemento del csv
      this.pullRequests.forEach(PR => {
              //Obtengo la duracion del PR en días
        let duracionDias = duracionPRdias(
          PR.createdAt,
          PR.closedAt
        );
        let PRinfo = {
          PR: PR.number, //numero
          estado: PR.state, //merged, etc
          duracionDias: duracionDias.diff,
          lineasModif: PR.additions + PR.deletions,
        };
        let comments = this.CommentsRow(PRinfo, PR.comments.nodes);
        let aux = this.repoListComments.concat(comments);
        this.repoListComments = aux;
        PR.reviewThreads.nodes.forEach(rv => {
          let revComments = this.CommentsRow(PRinfo, rv.comments.nodes);
          aux = this.repoListComments.concat(revComments);
          this.repoListComments = aux;
        });
      });
    },
    CommentsRow(PRinfo, comments){
      let commentsArray = [];
        comments.forEach(comment => {
          //calculo la cantidad de reacciones para cada icono
          let reactionsArray = new Array(8);
          for (let i = 0; i < 8; i++) reactionsArray[i] = 0;
          comment.reactions.nodes.forEach(reaction => {
            switch (reaction.content) {
              case "THUMBS_UP":
                reactionsArray[0]=reactionsArray[0]+1;
              break;
              case "THUMBS_DOWN":
                reactionsArray[1]=reactionsArray[1]+1;
              break;
              case "LAUGH":
                reactionsArray[2]=reactionsArray[2]+1;
              break;
              case "HOORAY":
                reactionsArray[3]=reactionsArray[3]+1;
              break;
              case "CONFUSED":
                reactionsArray[4]=reactionsArray[4]+1;
              break;
              case "HEART":
                reactionsArray[5]=reactionsArray[5]+1;
              break;
              case "ROCKET":
                reactionsArray[6]=reactionsArray[6]+1;
              break;
              case "EYES":
                reactionsArray[7]=reactionsArray[7]+1;
              break;
              default:
                console.log("falta un icono de reaccion en la lista: ", reaction.content);
              break;
            }
          });
          let row = {
            RepoTotalFollowers: this.repository.followers,
            RepoTotalStargazers: this.repository.stargazers,
            RepoTotalWatchers: this.repository.watchers,
            RepoTotalForks: this.repository.forks,
            PR: PRinfo.PR,
            estado: PRinfo.estado,
            duracionDias: PRinfo.duracionDias,
            lineasModif: PRinfo.lineasModif,
            participante: comment.author? comment.author.login : "|Usuario Borrado|",
            comentario: comment.body,
            Thumbs_Up: reactionsArray[0],
            Thumbs_Down: reactionsArray[1],
            Laugh: reactionsArray[2],
            Hooray: reactionsArray[3],
            Confused: reactionsArray[4],
            Heart: reactionsArray[5],
            Rocket: reactionsArray[6],
            Eyes: reactionsArray[7],
          };
          commentsArray.push(row);
        });
        return commentsArray;
    },
    btnLoadFile() {
      document.getElementById("file-upload").click();
    },
    loadFile() {
      let file = this.$refs.myFile.files[0];
      if (!file) return;
      this.show = false;
      this.loading = !this.loading;
      this.datosRepo = {
        participantes: 0,
        miembros: 0,
        colaboradores: 0,
        PRmerged: 0,
        PRclosed: 0,
        PRtotal: 0,
      };
      // Credit: https://stackoverflow.com/a/754398/52160
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (evt) => {
        //this.pullRequests = JSON.parse(evt.target.result);
        let repo = JSON.parse(evt.target.result);
        this.search = {
          owner: repo.owner,
          name: repo.name
        }
        this.pullRequests = [];
        repo.pullRequests.forEach((PR) => {
          if (PR.participants.totalCount > 1) {
            this.pullRequests.push(PR);
          }
        });
        //LLamo a función para armar lista de participantes con sus datos
        this.setParticipantsList();

        //LLamo a función para armar lista de comentarios
        this.ListCommentsRow();

        this.show = !this.show;
        this.loading = !this.loading;
        //this.agregarID();
        //this.setAnalytics(this.search);
      };
      reader.onerror = (evt) => {
        this.showSnackbar(
          "Error al cargar el archivo: \n" + evt,
          "error",
          8000
        );
      };
    },
    saveFile() {
      //Agrego la lista de pullrequests a la Organizacion
      const repo = {
        owner: this.search.owner,
        name: this.search.name,
        pullRequests: this.pullRequests
      }
      const data = JSON.stringify(repo),
        blob = new Blob([data], { type: "text/plain" }),
        e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
      a.download = this.search.owner + " - " + this.search.name + ".json";
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
      e.initEvent("click", true, false);
      a.dispatchEvent(e);
      this.showSnackbar("Archivo JSON Guardado", "success", 4000);
    },
    toggleCancelar() {
      this.cancel = !this.cancel;
      if (this.cancel) this.colorCancel = "error";
      else this.colorCancel = "warning";
    },
    getEstadisticas(pullRequest) {
      try {
        var cantPersonas = pullRequest.participants.totalCount;
        this.cohesionMatrix = cohesionFormula(cantPersonas, this.countMatrix);
        this.colabMatrix = colaboracionFormula(cantPersonas, this.countMatrix);
        this.mimicaMatrix = mimicaFormula(cantPersonas, pullRequest);
        var polaridad = polaridadFormula(cantPersonas, pullRequest);
        //alert("Habilidad del participante:", listPersonas);
      } catch (error) {
        alert("Error en EstadisticasPR-Creando formulas: ", error);
        this.showSnackbar(
          "Error al generar las estadisticas: " + error,
          "error",
          8000
        );
      }
      let tabla = new Array();
      let coeInd, colabInd, mimicaInd, msjEnviados, msjRecibidos;
      for (let i = 0; i < cantPersonas; i++) {
        coeInd = 0;
        colabInd = 0;
        mimicaInd = 0;
        msjEnviados = 0;
        msjRecibidos = 0;
        //Cuento los mensajes enviados y recibidos para la persona "i"
        for (let j = 0; j < cantPersonas; j++) {
          coeInd += this.cohesionMatrix[i][j];
          colabInd += this.colabMatrix[i][j];
          mimicaInd += this.mimicaMatrix[i][j];
          msjEnviados += this.countMatrix[i][j];
          msjRecibidos += this.countMatrix[j][i];
        }
        //Me aseguro que hayan mas de 2 personas para calcular las cohesiónes
        if (cantPersonas > 1) {
          coeInd = Math.round((coeInd / (cantPersonas - 1)) * 100) / 100;
          colabInd = Math.round((colabInd / cantPersonas) * 100) / 100;
          mimicaInd = Math.round((mimicaInd / cantPersonas) * 100) / 100;
        }
        //calculo Polaridad
        let tonoInd = 0,
          tonoPos = polaridad[i].positivity,
          tonoNeg = Math.abs(polaridad[i].negativity);
        if (tonoPos + tonoNeg > 0) tonoInd = tonoPos / (tonoPos + tonoNeg);

        let login, id;
        if (pullRequest.participants.nodes[i]) {
          login = pullRequest.participants.nodes[i].login;
          id = pullRequest.participants.nodes[i].id;
        } else login = "|Usuario Borrado|";
        //creola tabla con los datos estaditicos
        tabla.push({
          id: id,
          login: login,
          coeInd: coeInd,
          colabInd: colabInd,
          mimicaInd: mimicaInd,
          tonoInd: tonoInd,
          msjEnviados: msjEnviados,
          msjRecibidos: msjRecibidos,
        });
      }

      //Saco estadisticas de grupo
      let cohesionGrupal = 0;
      let colabGrupal = 0;
      let mimicaGrupal = 0;
      let tonoGrupal = 0;
      tabla.forEach((item) => {
        cohesionGrupal += item.coeInd;
        colabGrupal += item.coeInd;
        mimicaGrupal += item.mimicaInd;
        tonoGrupal += item.tonoInd;
      });
      cohesionGrupal = cohesionGrupal / tabla.length;
      colabGrupal = colabGrupal / tabla.length;
      mimicaGrupal = mimicaGrupal / tabla.length;
      tonoGrupal = tonoGrupal / tabla.length;

      /*Obtengo la varianza de cohesión
      let coheGrupalVarianza = 0;
      tabla.forEach((item) => {
        coheGrupalVarianza +=
          (item.coeInd - cohesionGrupal) * (item.coeInd - cohesionGrupal);
      });
      coheGrupalVarianza = coheGrupalVarianza / tabla.length;*/

      //Obtengo la duracion del PR en días
      //let duracionDias = duracionPRdias(pullRequest.createdAt,pullRequest.closedAt);

      //Adjunto las estadisticas a los datos del Pull Request
      let estadisticaPR = {
        //TODO:id: index,
        statsIndividuales: tabla,
        matrizInteracciones: this.countMatrix,
        cohesionGrupal: cohesionGrupal.toFixed(2),
        colaboracionGrupal: colabGrupal.toFixed(2),
        mimicaGrupal: mimicaGrupal.toFixed(2),
        tonoGrupal: tonoGrupal.toFixed(2),
        cohesionMatriz: this.cohesionMatrix,
        mimicaMatriz: this.mimicaMatrix,
        colabMatriz: this.colabMatrix,
        polaridadTabla: polaridad,
        //fechaInicio: duracionDias.createdAt,
        //fechaCierre: duracionDias.closedAt,
        //duraccionDias: duracionDias.diff || "-",
      };
      this.estadisticas.push(estadisticaPR);
    },
    agregarID() {
      //Esta funcion agrega los ID faltantes al JSON de la consulta
      for (let r = 0; r < this.pullRequests.length; r++) {
        //agregamos id al autor del PR
        try {
          if (this.pullRequests[r].author) {
            let encontrado = false;
            let index = 0;
            while (!encontrado) {
              if (this.pullRequests[r].participants.nodes[index].login == this.pullRequests[r].author.login) {
                this.pullRequests[r].author.id = this.pullRequests[r].participants.nodes[index].id;
                encontrado = true;
              } else if (index < this.pullRequests[r].participants.totalCount) {
                encontrado = true;
              }
              index++;
            }
          } else {
            this.pullRequests[r].author = {login: "|Usuario Borrado|", id: 0};
          }
        } catch (error) {
          console.log("PR: ", this.pullRequests[r].number, " | Error en agregarID/Autor del PR: ", error);
        }

        //agregamos id a los autores de Comentarios
        try {
          for (let c = 0; c < this.pullRequests[r].comments.totalCount; c++) {
            let encontrado = false;
            let index = 0;
            if (this.pullRequests[r].comments.nodes[c].author) {
              while (!encontrado) {
                if (this.pullRequests[r].participants.nodes[index].login == this.pullRequests[r].comments.nodes[c].author.login) {
                  this.pullRequests[r].comments.nodes[c].author.id = this.pullRequests[r].participants.nodes[index].id
                  encontrado = true;
                } else if (index < this.pullRequests[r].participants.totalCount) {
                  encontrado = true;
                }
                index++;
              }
            } else {
              this.pullRequests[r].comments.nodes[c].author = {login: "|Usuario Borrado|", id: 0};
            }
          }
        } catch (error) {
          console.log("PR: ", this.pullRequests[r].number, " | Error en agregarID/Autores de Comentarios: ", error);
        }

        //agregamos id a los autores de Reviews
        try {
          for (let i = 0; i < this.pullRequests[r].reviewThreads.totalCount; i++) {
            for (let c = 0; c < this.pullRequests[r].reviewThreads.nodes[i].comments.totalCount; c++) {
              let encontrado = false;
              let index = 0;
              if (this.pullRequests[r].reviewThreads.nodes[i].comments.nodes[c].author) {
                while (!encontrado) {
                  if (this.pullRequests[r].participants.nodes[index].login == this.pullRequests[r].reviewThreads.nodes[i].comments.nodes[c].author.login) {
                    this.pullRequests[r].reviewThreads.nodes[i].comments.nodes[c].author.id = this.pullRequests[r].participants.nodes[index].id
                    encontrado = true;
                  } else if (index < this.pullRequests[r].participants.totalCount) {
                    encontrado = true;
                  }
                  index++;
                }
              } else {
                this.pullRequests[r].reviewThreads.nodes[i].comments.nodes[c].author = {login: "|Usuario Borrado|", id: 0};
              }
            }
          }
        } catch (error) {
          console.log("PR: ", this.pullRequests[r].number, " | Error en agregarID/Autores de Reviews: ", error);
        }
      }
    },
    getRepoPRcant(search) {
      var self = this;
      //Hago la consulta
      if (!this.$apollo.skipAll) {
        this.$apollo.skipAll = false;
      }
      this.$apollo.queries.getPRcant
        .refetch({
          owner: search.owner,
          name: search.name,
        })
        .then(() => {
          self.search = search;
          self.progress.totalPR = self.getPRcant.totalCount;
          self.progressbar();
          self.countQuery(search);
        });
    },
    countQuery(search) {
      //Esta funcion crea una lista con la cantidad de datos que se necesitan
      //extraer para cada Pull Request (comentarios, reacciones, etc.)
      //Optimizando así la busqueda y reduciendo la cantidad de llamadas a la API.
      //Por cada 50 Pull Request almacena el maximo de datos que hay que traer
      this.show = false;
      this.loading = true;
      this.estadisticas = [];
      this.pullRequests = "";
      var self = this;
      let afterCursor;
      let beforeCursor;
      let hasNextPage = false;
      //reviso si el array esta vacio (Primer Consulta)
      //sino tomo el cursor de la ultima consluta
      beforeCursor = null;
      if (this.countPRs.length == 0) afterCursor = null;
      else afterCursor = this.countPRs[this.countPRs.length - 1].endCursor;
      //Creo un nuevo item en el arreglo de countPRs donde guardar el resultado de la consulta
      this.countPRs.push({
        comments: 0,
        reviewThreads: 0,
        reactions: 0,
        participants: 0,
        reviewThreadsComments: 0,
        commentsReactions: 0,
        endCursor: null,
        startCursor: null,
      });
      this.$apollo.queries.getPR
        .refetch({
          owner: search.owner,
          name: search.name,
          afterCursor: afterCursor,
          beforeCursor: beforeCursor,
          reactions: 1,
          participants: 1,
          rvThreads: 1,
          comments: 1,
          rvThreadsComments: 1,
          commentsReactions: 1,
        })
        .then(() => {
          let i = self.countPRs.length - 1;
          //cargo los primeros valores del contador PR
          self.countPRs[i].startCursor =
            self.getPR.pullRequests.pageInfo.startCursor;
          self.countPRs[i].endCursor =
            self.getPR.pullRequests.pageInfo.endCursor;
          hasNextPage = self.getPR.pullRequests.pageInfo.hasNextPage;
          self.getPR.pullRequests.nodes.forEach(function(item) {
            if (item.comments.totalCount > self.countPRs[i].comments) {
              if (item.comments.totalCount > 100) {
                self.countPRs[i].comments = 100;
                alert(
                  "Se superó el limite de la API - Limitado a 100 (PR:",
                  self.countPRs[i],
                  ", comments"
                );
              } else self.countPRs[i].comments = item.comments.totalCount;
            }
            if (
              item.reviewThreads.totalCount > self.countPRs[i].reviewThreads
            ) {
              if (item.reviewThreads.totalCount > 100) {
                self.countPRs[i].reviewThreads = 100;
                alert(
                  "Se superó el limite de la API - Limitado a 100 (PR:",
                  self.countPRs[i],
                  ", reviewThreads"
                );
              } else
                self.countPRs[i].reviewThreads = item.reviewThreads.totalCount;
            }
            if (item.reactions.totalCount > self.countPRs[i].reactions) {
              if (item.reactions.totalCount > 100) {
                self.countPRs[i].reactions = 100;
                alert(
                  "Se superó el limite de la API - Limitado a 100 (PR:",
                  self.countPRs[i],
                  ", reactions"
                );
              } else self.countPRs[i].reactions = item.reactions.totalCount;
            }
            if (item.participants.totalCount > self.countPRs[i].participants) {
              if (item.participants.totalCount > 100) {
                self.countPRs[i].participants = 100;
                alert(
                  "Se superó el limite de la API - Limitado a 100 (PR:",
                  self.countPRs[i],
                  ", participants"
                );
              } else
                self.countPRs[i].participants = item.participants.totalCount;
            }
          });
          //si es el primer conjunto buscado
          if (i == 0) {
            afterCursor = null;
            beforeCursor = self.countPRs[i].endCursor;
          } else {
            afterCursor = self.countPRs[i - 1].endCursor;
            beforeCursor = null;
          }
          //Busco los valores que faltan que estan anidados dentro de lo recien consultado
          self.$apollo.queries.getPR
            .refetch({
              owner: search.owner,
              name: search.name,
              afterCursor: afterCursor,
              beforeCursor: beforeCursor,
              reactions: 1,
              participants: 1,
              rvThreads: self.countPRs[i].reviewThreads,
              comments: self.countPRs[i].comments,
              rvThreadsComments: 1,
              commentsReactions: 1,
            })
            .then(() => {
              //caargo los ultimos valores del contador PR
              self.getPR.pullRequests.nodes.forEach(function(item) {
                item.reviewThreads.nodes.forEach(function(revThread) {
                  if (
                    revThread.comments.totalCount >
                    self.countPRs[i].reviewThreadsComments
                  ) {
                    if (revThread.comments.totalCount > 100) {
                      self.countPRs[i].reviewThreadsComments = 100;
                      alert(
                        "Se superó el limite de la API - Limitado a 100 (PR:",
                        self.countPRs[i],
                        ", reviewThreadsComments"
                      );
                    } else
                      self.countPRs[i].reviewThreadsComments =
                        revThread.comments.totalCount;
                  }
                });
                item.comments.nodes.forEach(function(comm) {
                  if (
                    comm.reactions.totalCount >
                    self.countPRs[i].commentsReactions
                  ) {
                    if (comm.reactions.totalCount > 100) {
                      self.countPRs[i].commentsReactions = 100;
                      alert(
                        "Se superó el limite de la API - Limitado a 100 (PR:",
                        self.countPRs[i],
                        ", commentsReactions"
                      );
                    } else self.countPRs[i].commentsReactions = comm.reactions.totalCount;
                  }
                });
              });
              self.progressbar();
              //NOTE:
              //Reviso si faltan cargar más Pull Requests desde la paginación de la API
              //Si estan todos los datos, Llamo a la funcion getFullPR.
              if (hasNextPage && self.cancel) self.countQuery(search);
              else {
                self.pullRequests = [];
                self.getFullPR(search, 0);
              }
            }); //repository.refetch2*/
        }); //repository.refetch
      //this.refreshQuery(search)
    }, //countQuery
    getFullPR(search, index) {
      //Esta funcion busca los datos de los Pull Request
      //analizando la lista de this.countPRs y pidiendo
      //solo la cantidad necesaria de datos a la API
      var self = this;
      let afterCursor;
      let beforeCursor;
      //si es el primer conjunto buscado
      if (index == 0) {
        afterCursor = null;
        beforeCursor = self.countPRs[index].endCursor;
      } else {
        afterCursor = self.countPRs[index - 1].endCursor;
        beforeCursor = null;
      }
      this.$apollo.queries.getPR
        .refetch({
          owner: search.owner,
          name: search.name,
          afterCursor: afterCursor,
          beforeCursor: beforeCursor,
          reactions: this.countPRs[index].reactions,
          participants: this.countPRs[index].participants,
          comments: this.countPRs[index].comments,
          rvThreads: this.countPRs[index].reviewThreads,
          rvThreadsComments: this.countPRs[index].reviewThreadsComments,
          commentsReactions: this.countPRs[index].commentsReactions,
        })
        .then(() => {
          //self.pullRequests.push(...self.getPR.pullRequests.nodes);
          self.getPR.pullRequests.nodes.forEach((PR) => {
          if (PR.participants.totalCount > 1) {
            self.pullRequests.push(PR);
          }
        });
          self.progressbar();
          //Reviso si faltan PRs por agregar a la lista
          if (index < self.countPRs.length - 1) {
            self.getFullPR(search, index + 1);
          } else {
            //LLamo a función para armar lista de participantes con sus datos
            self.setParticipantsList();
            //LLamo a función para armar lista de comentarios
            self.ListCommentsRow();

            self.countPRs = [];
            self.show = true;
            self.progress.bar = 0;
            self.loading = false;
            self.showSnackbar("Análisis Finalizado", "success", 4000);
          }
        });
    }, //getFullPR
    setParticipantsList(){
      //Creo una lista de los participantes del Repositorio
      this.participantsList = [];
      try {
        this.pullRequests.forEach((PR) => {
          PR.participants.nodes.forEach((participante) => {
            let cantParticipantes = this.participantsList.length;
            let noEncontrado = true;
            let i = 0;
            while (noEncontrado && i < cantParticipantes) {
              if (this.participantsList[i] == participante.login)
                noEncontrado = false;
              else i++;
            }
            if (noEncontrado) {
              //agrego stats como participante nuevo
              this.participantsList.push(participante.login);
              this.countRepoStatsFromUser(participante);
            }
          });
        });
      } catch (error) {
        console.log(error);
        alert("Error creando listaParticipantesRepo. ", error);
        this.showSnackbar("Ocurrió un error:" + error, "error", 4000);
      }
    },
    countRepoStatsFromUser(user){
      //TODO: FIX: ARREGLAR QUE NO ESTA TRAYENDO LOS REPOSITORIOS
      if (user.repositories) {
        user.repositories.nodes.forEach(repo => {
          this.repository.stargazers += repo.stargazers.totalCount;
          this.repository.forks += repo.forkCount;
          this.repository.watchers += repo.watchers.totalCount;
        });
        this.repository.followers += user.followers.totalCount;
      }
    },
    /*getParticipantsData(listaParticipantes) {
      //Esta funcion genera un JSON con la lista de usuarios
      //para cada usuario se recopila tambien seguidores, estrellas etc
      console.log("entra a get participants data");
      var self = this;
      listaParticipantes.forEach(participante => {
        console.log("Participante: ", participante);
        try{
        self.$apollo.queries.userStats
          .refetch({
            owner: participante.login,
          })
          .then(() => {
            //TODO:
            //FIXME:
            console.log("aka: ", self.usersData);
        });
        } catch (err) {
          alert("Hubo un error al traer lista de participantes: ", err);
        }
      });
    },*/
  },
};
</script>
