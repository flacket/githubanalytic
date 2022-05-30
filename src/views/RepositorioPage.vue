<template>
  <div>
    <div class="text-center">
      <v-snackbar
        v-model="snackbar.show"
        right
        :timeout="snackbar.timeout"
        :color="snackbar.color"
      >
        {{ snackbar.text }}
        <v-btn dark rounded text @click="snackbar.show = false">Close</v-btn>
      </v-snackbar>
    </div>
    <h1 class="subheading-1 blue--text">Repositorio</h1>
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
    <v-btn
      v-if="loading"
      class="mb-2"
      rounded
      :color="colorCancel"
      @click="toggleCancelar"
    >
      <v-icon left>mdi-cancel</v-icon>Detener Busqueda</v-btn
    >

    <v-btn v-if="!show && !loading" color="primary" rounded @click="btnLoadFile">
      <v-icon left>mdi-download</v-icon>Cargar json</v-btn
    >

    <div v-if="show">
      <h4 class="mt-4">Métricas Grupales de Proyecto</h4>
      <v-card class=" pa-4 rounded-b-xl" outlined>
        <v-row >
          <v-col sm="12" md="3">
            <v-layout column>
              <v-flex>
                <p>Miembros: {{ datosRepo.miembros }}</p>
              </v-flex>
              <v-flex>
                <p>Colaboradores: {{ datosRepo.colaboradores }}</p>
              </v-flex>
              <v-flex>
                <p>Participantes: {{ datosRepo.participantes }}</p>
              </v-flex>
              <v-flex>
                <p>PR Merged: {{ datosRepo.PRmerged }}</p>
              </v-flex>
              <v-flex>
                <p>PR Cerrados: {{ datosRepo.PRclosed }}</p>
              </v-flex>
              <v-flex>
                <p>PR Total: {{ datosRepo.PRtotal }}</p>
              </v-flex>
            </v-layout>
          </v-col>
          <v-col class="mb-3" sm="2">
            <h4>Cohesión:</h4>
            <v-progress-circular 
            :rotate="-90" :size="90" :width="15" color="primary"
              :value="chartCoheGrupal"
            >
              {{ chartCoheGrupal }}%
            </v-progress-circular>
          </v-col>
          <v-col class="mb-3" sm="2">
            <h4>Colaboración:</h4>
            <v-progress-circular 
            :rotate="-90" :size="90" :width="15" color="primary"
              :value="chartColabGrupal"
            >
              {{ chartColabGrupal }}%
            </v-progress-circular>
          </v-col>
          <v-col class="mb-3" sm="2">
            <h4>Mímica:</h4>
            <v-progress-circular 
            :rotate="-90" :size="90" :width="15" color="primary"
              :value="chartMimicaGrupal"
            >
              {{ chartMimicaGrupal }}%
            </v-progress-circular>
          </v-col>
          <v-col class="mb-3" sm="2">
            <h4>Polaridad:</h4>
            <v-progress-circular 
            :rotate="-90" :size="90" :width="15" color="primary"
              :value="chartTonoGrupal"
            >
              {{ chartTonoGrupal }}%
            </v-progress-circular>
          </v-col>
        </v-row>
      </v-card>

      <v-btn class="ma-2" color="primary" rounded @click="csvExport()">
        <v-icon left>mdi-file-table</v-icon>Exportar CSV</v-btn
      >
      <v-btn class="mx-2" color="primary" rounded @click="btnLoadFile">
        <v-icon left>mdi-download</v-icon>Cargar json</v-btn
      >
      <v-btn color="primary" rounded @click="saveFile()">
        <v-icon left>mdi-upload</v-icon>Guardar json</v-btn
      >
      <h4 class="mt-4">Tabla de Pull Request</h4>
      <v-data-table
        :headers="encabezados"
        :items="estadisticas"
        :items-per-page="20"
        class="elevation-1 mt-2"
      >#cell(tonoInd)="item"
      <template #cell(cohesionGrupal)="item">
        <v-progress-linear :value="item.cohesionGrupal*100" height="25">
          <strong>{{ (item.cohesionGrupal*100).toFixed(2) }}%</strong>
        </v-progress-linear>
      </template> 
      <template #cell(colaboracionGrupal)="item">
        <v-progress-linear :value="item.colaboracionGrupal*100" height="25">
          <strong>{{ (item.colaboracionGrupal*100).toFixed(2) }}%</strong>
        </v-progress-linear>
      </template> 
      <template #cell(mimicaGrupal)="item">
        <v-progress-linear :value="item.mimicaGrupal*100" height="25">
          <strong>{{ (item.mimicaGrupal*100).toFixed(2) }}%</strong>
        </v-progress-linear>
      </template> 
      <template #cell(tonoGrupal)="item">
        <v-progress-linear :value="item.tonoGrupal*100" height="25">
          <strong>{{ (item.tonoGrupal*100).toFixed(2) }}%</strong>
        </v-progress-linear>
      </template> 
      <template #cell(estado)="item">
      <v-chip :color="getColor(item.estado)" dark>
        {{ item.estado }}
      </v-chip>
      </template>
      </v-data-table>
      <h4 class="mt-4">Tabla de Personas</h4>
      <v-data-table
        :headers="encabezadosPersona"
        :items="estadisticasPersona"
        :items-per-page="20"
        class="elevation-1 mt-2"
      >
      <template #cell(rol)="item">
      <v-chip :color="getColor(item.rol)" dark>
        {{ item.rol }}
      </v-chip>
      </template>
      <template #cell(coheInd)="item">
        <v-progress-linear :value="item.coheInd*100" height="25">
          <strong>{{ (item.coheInd*100).toFixed(2) }}%</strong>
        </v-progress-linear>
      </template> 
      <template #cell(habilidad)="item">
        <v-progress-linear :value="item.habilidad*100" height="25">
          <strong>{{ (item.habilidad*100).toFixed(2) }}%</strong>
        </v-progress-linear>
      </template> 
      <template #cell(mimicaInd)="item">
        <v-progress-linear :value="item.mimicaInd*100" height="25">
          <strong>{{ (item.mimicaInd*100).toFixed(2) }}%</strong>
        </v-progress-linear>
      </template> 
      <template #cell(tonoInd)="item">
        <v-progress-linear :value="item.tonoInd*100" height="25">
          <strong>{{ (item.tonoInd*100).toFixed(2) }}%</strong>
        </v-progress-linear>
      </template>
      </v-data-table>
      <v-btn class="ma-2" color="primary" rounded @click="csvExportPersonas()">
        <v-icon left>mdi-file-table</v-icon>Exportar a CSV</v-btn
      >
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
import { GET_REPOS, REPOSITORY_PRS, ORG_MEMBERS } from "../graphql/queries.js";
import { Parser } from "json2csv";
import {
  matrizConteoPR,
  cohesionFormula,
  colaboracionFormula,
  duracionPRdias,
  mimicaFormula,
  polaridadFormula,
  getParticipantesRepoStat,
} from "../formulas.js";

export default {
  components: { PRSelector },
  data() {
    return {
      loading: false,
      search: "",
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
      OrgMembers: "",
      countMatrix: "",
      cohesionMatrix: "",
      colabMatrix: "",
      mimicaMatrix: "",
      encabezados: [
        { text: "PR#", sortable: false, value: "PR" },
        { text: "Cohesión Grupal", value: "cohesionGrupal" },
        { text: "CG Varianza", value: "cohesionGrupalVarianza" },
        { text: "Colaboración Grupal", value: "colaboracionGrupal" },
        { text: "Mímica Grupal", value: "mimicaGrupal" },
        { text: "Polaridad Grupal", value: "tonoGrupal" },
        { text: "Participantes", value: "participantes" },
        { text: "Fecha Inicio", value: "fechaInicio" },
        { text: "Fecha Cierre", value: "fechaCierre" },
        { text: "Duración Horas", value: "duraccionDias" },
        { text: "Código Agregado", value: "codigoAdd" },
        { text: "Código Quitado", value: "codigoRem" },
        { text: "Total Cambios", value: "sizePR" },
        { text: "Estado", value: "estado" },
      ],
      encabezadosPersona: [
        { text: "Usuario", sortable: false, value: "login" },
        { text: "Rol", value: "rol" },
        { text: "Cant. PR Author", value: "cantPRAuthor" },
        { text: "Cant. PR Participa", value: "cantPRParticipa" },
        //{ text: "Mensajes Enviados", value: "msjEnviados" },
        //{ text: "Mensajes Recibidos", value: "msjRecibidos" },
        { text: "Cohesión Individual", value: "coheInd" },
        { text: "Habilidad", value: "habilidad" },
        { text: "Mimica", value: "mimicaInd" },
        { text: "Polaridad", value: "tonoInd" },
      ],
      estadisticasPersona: "",
      pullRequests: [],
      repository: "",
      estadisticas: [],
      datosRepo: {
        participantes: 0,
        miembros: 0,
        colaboradores: 0,
        PRmerged: 0,
        PRclosed: 0,
        PRtotal: 0,
      },
      chartCoheGrupal: 0,
      chartColabGrupal: 0,
      chartMimicaGrupal: 0,
      chartTonoGrupal: 0,
    };
  },
  apollo: {
    getPR: {
      query: GET_REPOS,
      variables: {
        owner: "microsoft",
        name: "vscode",
        reactions: 1,
        participants: 1,
        comments: 1,
        commentsReactions: 1,
        rvThreads: 1,
        rvThreadsComments: 1,
      },
      update: (data) => data.repository,
    },
    getPRcant: {
      query: REPOSITORY_PRS,
      variables: {
        owner: "microsoft",
        name: "vscode",
      },
      update: (data) => data.repository.pullRequests,
    },
    getOrgMembers: {
      query: ORG_MEMBERS,
      variables: {
        owner: "microsoft",
      },
      update: (data) => data.organization.membersWithRole.nodes,
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
    getColor (estado) {
      switch(estado) {
        case "MERGED": return '#6f42c1'
        case "CLOSED": return '#d73a49'
        case "OPEN": return '#d73a49'
        case "participante": return '#8fc2f5'
        case "colaborador": return '#489bec'
        case "miembro": return '#0653a0'
        default: return '#999999'
      }
    },
    progressbar() {
      if (this.progress.bar == 0) {
        this.progress.text = "Cargando " + this.progress.totalPR + " PR's.";
        this.progress.bartotal = 0;
        this.progress.bar = 100 / (Math.ceil(this.progress.totalPR / 10) * 2);
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
    btnLoadFile() {
      document.getElementById("file-upload").click();
    },
    csvExport() {
      //Creo el archivo CSV
      const fields = [
        "PR",
        "cohesionGrupal",
        "cohesionGrupalVarianza",
        "colaboracionGrupal",
        "participantes",
        "fechaInicio",
        "fechaCierre",
        "duraccionDias",
        "codigoAdd",
        "codigoRem",
        "sizePR",
        "estado",
      ];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(this.estadisticas);
      //Exporto ahora el archivo CSV
      const exportName = this.search.owner + " - " + this.search.name + 
      " - informePRs.csv" || "export.csv";
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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
    csvExportPersonas() {
      //Creo el archivo CSV
      const fields = [
        "login",
        "rol",
        "cantPRAuthor",
        "cantPRParticipa",
        "Cohesión Individual",
        //"msjEnviados",
        //"msjRecibidos",
        "coheInd",
        "habilidad",
        "mimicaInd",
        "tonoInd",
      ];

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(this.estadisticasPersona);
      //Exporto ahora el archivo CSV
      const exportName = this.search.owner + " - " + this.search.name + 
      " - informePersonas.csv" || "export.csv";
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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
    loadFile() {
      let file = this.$refs.myFile.files[0];
      if (!file) return;
      this.show = false;
      this.loading = true;
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
        this.agregarID();
        this.setAnalytics(this.search);
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
      const repo ={
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
        //console.log("Habilidad del participante:", listPersonas);
      } catch (error) {
        console.log("Error en EstadisticasPR-Creando formulas: ", error);
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

        let login;
        if (pullRequest.participants.nodes[i])
          login = pullRequest.participants.nodes[i].login;
        else login = "|Usuario Borrado|";

        //creo la tabla con los datos estaditicos
        tabla.push({
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
      let cantMimicaNull = 0;
      tabla.forEach((item) => {
        cohesionGrupal += item.coeInd;
        colabGrupal += item.coeInd;
        if(!Number.isNaN(item.mimicaInd)) mimicaGrupal += item.mimicaInd;
        else cantMimicaNull++;
        tonoGrupal += item.tonoInd;
      });
      cohesionGrupal = cohesionGrupal / tabla.length;
      colabGrupal = colabGrupal / tabla.length;
      mimicaGrupal = mimicaGrupal / (tabla.length - cantMimicaNull);
      tonoGrupal = tonoGrupal / tabla.length;

      //Obtengo la varianza de cohesión
      let coheGrupalVarianza = 0;
      tabla.forEach((item) => {
        coheGrupalVarianza +=
          (item.coeInd - cohesionGrupal) * (item.coeInd - cohesionGrupal);
      });
      coheGrupalVarianza = coheGrupalVarianza / tabla.length;

      //Obtengo la duracion del PR en días
      let duracionDias = duracionPRdias(
        pullRequest.createdAt,
        pullRequest.closedAt
      );

      //Calculo el estado del PR
      let estado = pullRequest.state;

      let author;
      if (pullRequest.author
      ) author = pullRequest.author.login;
      else author = "|Usuario Borrado|";

      //Adjunto las estadisticas a los datos del Pull Request
      let estadisticaPR = {
        //TODO:id: index,
        PR: pullRequest.number,
        statsIndividuales: tabla,
        cohesionGrupal: cohesionGrupal.toFixed(2),
        cohesionGrupalVarianza: coheGrupalVarianza.toFixed(2),
        colaboracionGrupal: colabGrupal.toFixed(2),
        mimicaGrupal: mimicaGrupal.toFixed(2),
        tonoGrupal: tonoGrupal.toFixed(2),
        fechaInicio: duracionDias.createdAt,
        fechaCierre: duracionDias.closedAt,
        duraccionDias: duracionDias.diff || "-",
        codigoAdd: pullRequest.additions,
        codigoRem: pullRequest.deletions,
        sizePR: pullRequest.additions + pullRequest.deletions,
        estado: estado,
        cohesionMatrix: this.cohesionMatrix,
        countMatrix: this.countMatrix,
        participantes: cantPersonas,
        autor: author,
      };
      this.estadisticas.push(estadisticaPR);
    },
    chartsDataGrupal() {
      //Obtengo las estadisticas grupales para las graficas circulares
      var cant = this.estadisticas.length;
      let cohesionGrupal = 0;
      let colabGrupal = 0;
      let mimicaGrupal = 0;
      let tonoGrupal = 0;
      let cantMimicaNull = 0;

      for (let i = 0; i < cant; i++) {
        cohesionGrupal += Number(this.estadisticas[i].cohesionGrupal);
        colabGrupal += Number(this.estadisticas[i].colaboracionGrupal);
        if(!Number.isNaN(this.estadisticas[i].mimicaGrupal)) mimicaGrupal += Number(this.estadisticas[i].mimicaGrupal);
        else cantMimicaNull++;
        tonoGrupal += Number(this.estadisticas[i].tonoGrupal);
      }
      this.chartCoheGrupal = Math.round((cohesionGrupal / cant) * 100);
      this.chartColabGrupal = Math.round((colabGrupal / cant) * 100);
      this.chartmimicaGrupal = Math.round((mimicaGrupal / (cant - cantMimicaNull)) * 100);
      this.chartTonoGrupal = Math.round((tonoGrupal / cant) * 100);
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
                  //console.log("rev: ", i, "com: ", c, " | login: ", this.pullRequests[r].reviewThreads.nodes[i].comments.nodes[c].author.login)
                  //console.log("author: ", this.pullRequests[r].participants.nodes[index].login)
                  //console.log("id: ", this.pullRequests[r].participants.nodes[index].id)
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
      self.countPRs = [];
      //Hago la consulta
      if (!this.$apollo.skipAll) {
        this.$apollo.skipAll = false;
      }
      this.search = search;
      this.$apollo.queries.getPRcant
        .refetch({
          owner: search.owner,
          name: search.name,
        })
        .then(() => {
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
      this.datosRepo = {
        participantes: 0,
        miembros: 0,
        colaboradores: 0,
        PRmerged: 0,
        PRclosed: 0,
        PRtotal: 0,
      };
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
                console.log(
                  "Se superó el limite de la API - Limitado a 100 (PR:", self.countPRs[i],", comments"
                );
              } else self.countPRs[i].comments = item.comments.totalCount;
            }
            if (
              item.reviewThreads.totalCount > self.countPRs[i].reviewThreads
            ) {
              if (item.reviewThreads.totalCount > 100) {
                self.countPRs[i].reviewThreads = 100;
                console.log(
                  "Se superó el limite de la API - Limitado a 100 (PR:", self.countPRs[i], ", reviewThreads"
                );
              } else
                self.countPRs[i].reviewThreads = item.reviewThreads.totalCount;
            }
            if (item.reactions.totalCount > self.countPRs[i].reactions) {
              if (item.reactions.totalCount > 100) {
                self.countPRs[i].reactions = 100;
                console.log(
                  "Se superó el limite de la API - Limitado a 100 (PR:", self.countPRs[i], ", reactions"
                );
              } else self.countPRs[i].reactions = item.reactions.totalCount;
            }
            if (item.participants.totalCount > self.countPRs[i].participants) {
              if (item.participants.totalCount > 100) {
                self.countPRs[i].participants = 100;
                console.log(
                  "Se superó el limite de la API - Limitado a 100 (PR:", self.countPRs[i], ", participants"
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
                      console.log(
                        "Se superó el limite de la API - Limitado a 100 (PRº:", self.countPRs[i].number, ", reviewThreadsComments"
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
                      console.log(
                        "Se superó el limite de la API - Limitado a 100 (PR:", self.countPRs[i], ", commentsReactions"
                      );
                    } else
                      self.countPRs[i].commentsReactions =
                        comm.reactions.totalCount;
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
            //Agrego información de IDs faltantes en los PR
            self.agregarID();
            self.setAnalytics(search);
          }
        });
    }, //getFullPR
    setAnalytics(search){
      var self = this;
      //Calculo la matriz de conteo y estadisticas para cada PR
      self.estadisticas = [];
      self.pullRequests.forEach((PR) => {
        self.countMatrix = matrizConteoPR(PR);
        self.getEstadisticas(PR);
      });

      if (!self.$apollo.skipAll) {
        self.$apollo.skipAll = false;
      }
      self.$apollo.queries.getOrgMembers
      .refetch({
        owner: search.owner
      })
      .then(() => {
        self.OrgMembers = self.getOrgMembers;
        
        //llamo a crear la tabla de estadisticas de cada persona
        self.estadisticasPersona = getParticipantesRepoStat(
          self.estadisticas, self.OrgMembers
        );

        //Calculo las estadisticas generales del tablero principal
        self.estadisticasPersona.forEach((persona) => {
          switch(persona.rol) {
            case "miembro":
              self.datosRepo.miembros++;
              break;
            case "colaborador":
              self.datosRepo.colaboradores++;
              break;
            default:
              self.datosRepo.participantes++;
          }
        });

        self.estadisticas.forEach((PR) => {
          switch(PR.estado) {
            case "MERGED":
              self.datosRepo.PRmerged++;
              break;
            case "CLOSED":
              self.datosRepo.PRclosed++;
              break;
          }
        });
        self.datosRepo.PRtotal = self.datosRepo.PRclosed + self.datosRepo.PRmerged;

        //Doy formato a las gráficas
        self.chartsDataGrupal();

        self.show = true;
        self.progress.bar = 0;
        self.loading = false;
        
        self.showSnackbar("Análisis Finalizado", "success", 4000);
      });
    }
  },
};
</script>