<template>
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
    <h1 class="subheading-1 blue--text">Pull Request</h1>
    <PRSelector @search-pr="refreshQuery" />
    <v-progress-linear
      v-if="$apollo.loading"
      indeterminate
      color="primary"
    ></v-progress-linear>
    <v-divider class="my-2"></v-divider>
    <!--/////////////////////////////////////////////////////-->
    <div v-if="show">
      <h1 class="headline grey--text">
        {{ repository.pullRequest.title }}
        <a
          class="subheading"
          target="_blank"
          :href="repository.pullRequest.url"
        >
          #{{ repository.pullRequest.number }}
        </a>
      </h1>
      <h4 class="mt-4">Métricas Grupales del Pull Request</h4>
      <v-card class=" pa-4 rounded-b-xl" outlined>
        <v-row>
          <v-col sm="12" md="3">
            <v-layout column>
              <v-flex>
                <p>
                  Participantes:
                  {{ repository.pullRequest.participants.totalCount }}
                </p>
              </v-flex>
              <v-flex>
                <p>
                  Tamaño PR (loc):
                  {{
                    repository.pullRequest.additions +
                      repository.pullRequest.deletions
                  }}
                </p>
              </v-flex>
              <v-flex>
                <p>Estado: {{ repository.pullRequest.state }}</p>
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

      <v-row class="mt-4">
        <v-col sm="12" md="6">
          <h4>Cohesión Individual:</h4>
          <BarChart :chart-data="chartCohe" />
        </v-col>
        <v-col sm="12" md="6">
          <h4>Colaboración Individual:</h4>
          <BarChart :chart-data="chartColab" />
        </v-col>
      </v-row>
      <v-row class="mt-2">
        <v-col sm="12" md="12">
          <h4>Estadísticas de Participantes:</h4>
          <v-data-table
            hide-default-footer
            :headers="encabezados"
            :items="estadisticas"
            :items-per-page="20"
            class="elevation-1 mt-2"
          >
          <template #cell(mimicaInd)="item">
            <v-progress-linear :value="item.mimicaInd*100" height="25">
              <strong>{{ (item.tonoInd*100).toFixed(2) }}%</strong>
            </v-progress-linear>
          </template>
          <template #cell(tonoInd)="item">
            <v-progress-linear :value="item.tonoInd*100" height="25">
              <strong>{{ (item.tonoInd*100).toFixed(2) }}%</strong>
            </v-progress-linear>
          </template>
          </v-data-table>
        </v-col>
      </v-row>

      <v-btn class="ma-2" color="primary" rounded @click="csvExport()">
        <v-icon left>mdi-file-table</v-icon>Exportar Chat</v-btn>
    </div>
  </div>
</template>

<script>
import PRSelector from "../components/PRSelector";
import BarChart from "../components/chartjs/BarChart.vue";
import { GET_REPO } from "../graphql/queries.js";
import { Parser } from "json2csv";

import {
  matrizConteoPR,
  cohesionFormula,
  colaboracionFormula,
  comunaFormula,
  mimicaFormula,
  polaridadFormula,
  getPRChat,
} from "../formulas.js";

export default {
  components: {
    PRSelector,
    BarChart,
  },
  data() {
    return {
      show: false,
      countMatrix: "",
      cohesionMatrix: "",
      colabMatrix: "",
      comunaMatrix: "",
      mimicaMatrix: "",
      repository: "",
      chat: "",
      snackbar: {
        show: false,
        text: "Bienvenido a Gitana: Analíticas de Github",
        color: "info",
        timeout: 2500,
      },
      chartCohe: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "rgba(0, 71, 255, 1)",
          },
        ],
      },
      chartColab: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "rgba(0, 71, 255, 1)",
          },
        ],
      },
      chartCoheGrupal: 0,
      chartColabGrupal: 0,
      chartMimicaGrupal: 0,
      chartTonoGrupal: 0,
      participante: {},
      participantes: [],
      chartMimica: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "rgba(0, 71, 255, 0.5)",
          },
        ],
      },
      estadisticas: [],
      encabezados: [
        { text: "Participante", sortable: false, value: "nombre" },
        { text: "Interacciones Enviadas", value: "msjEnviados" },
        { text: "Interacciones Recibidas", value: "msjRecibidos" },
        { text: "Mímica", value: "mimicaInd" },
        { text: "Polaridad", value: "tonoInd" },
      ],
      cohesionGrupal: "",
      getComuna: "",
    };
  },
  apollo: {
    repository: {
      query: GET_REPO,
      variables: { owner: "flacket", name: "githubanalytic", number: 150 },
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
    csvExport() {
      //Creo el archivo CSV
      const fields = ["Participante", "Comentario", "Fecha"];

      const json2csvParser = new Parser({ fields });
      let chat = getPRChat(
        this.repository.pullRequest.participants.totalCount,
        this.repository.pullRequest
      );
      const csv = json2csvParser.parse(chat);
      let nombreArchivo = "Chat - " + this.repository.pullRequest.title;
      //Exporto ahora el archivo CSV
      const exportName = nombreArchivo + ".csv" || "chatPR.csv";

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
    estadisticasPR() {
      try {
        var cantPersonas = this.repository.pullRequest.participants.totalCount;
        this.cohesionMatrix = cohesionFormula(cantPersonas, this.countMatrix);
        this.colabMatrix = colaboracionFormula(cantPersonas, this.countMatrix);
        this.comunaMatrix = comunaFormula(
          this.repository.pullRequest.participants
        );
        this.mimicaMatrix = mimicaFormula(
          cantPersonas,
          this.repository.pullRequest
        );
        var polaridad = polaridadFormula(
          cantPersonas,
          this.repository.pullRequest
        );
      } catch (error) {
        console.log("Error en EstadisticasPR-Creando formulas: ", error);
        this.showSnackbar(
          "Error al generar las estadisticas: " + error,
          "error",
          8000
        );
      }
      try {
        var coeInd, colabInd, mimicaInd, msjEnviados, msjRecibidos;
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
          //Me aseguro que hayan 2 o mas personas para calcular las cohesiónes
          if (cantPersonas > 1) {
            coeInd = Math.round((coeInd / cantPersonas) * 100) / 100;
            colabInd = Math.round((colabInd / cantPersonas) * 100) / 100;
            mimicaInd = Math.round((mimicaInd / cantPersonas) * 100) / 100;
          }
          //calculo Polaridad
          let tonoInd = 0,
            tonoPos = polaridad[i].positivity,
            tonoNeg = Math.abs(polaridad[i].negativity);
          if (tonoPos + tonoNeg > 0) tonoInd = tonoPos / (tonoPos + tonoNeg);
          //creo la tabla con los datos estaditicos
          let tabla = {
            nombre: this.repository.pullRequest.participants.nodes[i].login,
            coeInd: coeInd,
            colabInd: colabInd,
            mimicaInd: mimicaInd,
            tonoInd: tonoInd,
            msjEnviados: msjEnviados,
            msjRecibidos: msjRecibidos,
          };
          this.estadisticas.push(tabla);
        }
        //Doy formato a las gráficas
        this.chartsCircularGrupal()
        this.chartDataCohe();
        this.chartDataColab();

        this.show = true;
      } catch (error) {
        console.log("Error en EstadisticasPR-Haciendo la tabla: ", error);
        this.showSnackbar(
          "Error al generar las estadisticas: " + error,
          "error",
          8000
        );
      }
    },
    chartsCircularGrupal() {
      //Obtengo las estadisticas grupales para las graficas circulares
      var cant = this.estadisticas.length;
      let cohesionGrupal = 0;
      let colabGrupal = 0;
      let mimicaGrupal = 0;
      let tonoGrupal = 0;

      this.estadisticas.forEach(item => {
        cohesionGrupal += Number(item.coeInd);
        colabGrupal += Number(item.colabInd);
        mimicaGrupal += Number(item.mimicaInd);
        tonoGrupal += Number(item.tonoInd);
      });
      /*for (let i = 0; i < cant; i++) {
        cohesionGrupal += Number(this.estadisticas[i].coeInd);
        colabGrupal += Number(this.estadisticas[i].colabInd);
        mimicaGrupal += Number(this.estadisticas[i].mimicaInd);
        tonoGrupal += Number(this.estadisticas[i].tonoInd);
      }*/
      this.chartcohesionGrupal = Math.round((cohesionGrupal / cant) * 100);
      this.chartcolabGrupal = Math.round((colabGrupal / cant) * 100);
      this.chartmimicaGrupal = Math.round((mimicaGrupal / cant) * 100);
      this.chartTonoGrupal = Math.round((tonoGrupal / cant) * 100);
    },
    chartDataCohe() {
      //Genera el dataset para armar el grafico de cohesion individual
      let cantPersonas = this.repository.pullRequest.participants.totalCount;
      this.chartCohe.labels = [];
      this.chartCohe.datasets[0].data = [];
      for (let i = 0; i < cantPersonas; i++) {
        this.chartCohe.labels.push(this.estadisticas[i].nombre);
        this.chartCohe.datasets[0].data.push(
          (this.estadisticas[i].coeInd * 100).toFixed(2)
        );
      }
    },
    chartDataColab() {
      //Genera el dataset para armar el grafico de cohesion individual
      let cantPersonas = this.repository.pullRequest.participants.totalCount;
      this.chartColab.labels = [];
      this.chartColab.datasets[0].data = [];
      for (let i = 0; i < cantPersonas; i++) {
        this.chartColab.labels.push(this.estadisticas[i].nombre);
        this.chartColab.datasets[0].data.push(
          (this.estadisticas[i].colabInd * 100).toFixed(2)
        );
      }
    },
    agregarID(pullRequest) {
      //Esta funcion agrega los ID faltantes al JSON de la consulta
      try {
        //agregamos id al autor del PR
        if (pullRequest.author) {
          let encontrado = false;
          let index = 0;
          while (!encontrado) {
            if (pullRequest.participants.nodes[index].login == pullRequest.author.login) {
              pullRequest.author.id = pullRequest.participants.nodes[index].id;
              encontrado = true;
            } else if (index == pullRequest.participants.totalCount) {
              encontrado = true;
            }
            index++;
          }
        } else {
          pullRequest.author = {login: "|Usuario Borrado|", id: 0};
        }
        //agregamos id a los autores de Comentarios
        for (let c = 0; c < pullRequest.comments.totalCount; c++) {
          if (pullRequest.comments.nodes[c].author) {
            let encontrado = false;
            let index = 0;
            while (!encontrado) {
              if (pullRequest.participants.nodes[index].login == pullRequest.comments.nodes[c].author.login) {
                pullRequest.comments.nodes[c].author.id = pullRequest.participants.nodes[index].id;
                encontrado = true;
              } else if (index == pullRequest.participants.totalCount) {
                encontrado = true;
              }
              index++;
            }
          } else {
            pullRequest.comments.nodes[c].author = {login: "|Usuario Borrado|", id: 0};
          }
        }
        //agregamos id a los autores de Reviews
        for (let i = 0; i < pullRequest.reviewThreads.totalCount; i++) {
          for (let c = 0; c < pullRequest.reviewThreads.nodes[i].comments.totalCount; c++) {
            if (pullRequest.reviewThreads.nodes[i].comments.nodes[c].author) {
              let encontrado = false;
              let index = 0;
              while (!encontrado) {
                if (pullRequest.participants.nodes[index].login == pullRequest.reviewThreads.nodes[i].comments.nodes[c].author.login) {
                  pullRequest.reviewThreads.nodes[i].comments.nodes[c].author.id = pullRequest.participants.nodes[index].id;
                  encontrado = true;
                } else if (index == pullRequest.participants.totalCount) {
                  encontrado = true;
                }
                index++;
              }
            } else {
              pullRequest.reviewThreads.nodes[i].comments.nodes[c].author = {login: "|Usuario Borrado|", id: 0};
            }
          }
        }
      } catch (error) {
        console.log("Error en agregarID: ", error);
      }
    },
    refreshQuery(search) {
      this.show = false;
      if (!this.$apollo.skipAll) {
        this.$apollo.skipAll = false;
      }
      this.$apollo.queries.repository
        .refetch({
          owner: search.owner,
          name: search.name,
          number: parseInt(search.number),
        })
        .then(() => {
          if (this.repository.pullRequest.participants.totalCount > 1) {
            //Agrego informacion de IDs faltantes en el PR
            this.agregarID(this.repository.pullRequest);
            //Llamo a hacer el conteo de Interacciones
            this.countMatrix = matrizConteoPR(this.repository.pullRequest);
            //LLamo a generar las estadisticas en base al conteo
            this.estadisticasPR();
          } else {
            this.showSnackbar(
              "El Pull Request seleccionado no presenta interacciones",
              "info",
              8000
            );
          }
        }); //apollo refetch
    },
  },
};
</script>
