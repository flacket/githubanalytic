<template>
  <div>
    <v-snackbar
      right
      v-model="snackbar.show"
      :timeout="snackbar.timeout"
      :color="snackbar.color"
    >
      {{ snackbar.text }}
      <v-btn dark text @click="snackbar.show = false">Close</v-btn>
    </v-snackbar>
    <h1 class="subheading-1 blue--text">Pull Request</h1>
    <PRSelector v-on:searchPR="refreshQuery"></PRSelector>
    <v-progress-linear
      v-if="$apollo.loading"
      indeterminate
      color="primary"
    ></v-progress-linear>
    <v-divider class="mb-2"></v-divider>
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
      <v-container>
        <v-row>
          <v-col sm="12" md="2">
            <v-layout column>
              <v-flex class="mb-3">
                <h4>Cohesión Grupal:</h4>
                <Doughnut :chartData="chartCoheGrupal" />
              </v-flex>
              <v-flex>
                <p>
                  Participantes:
                  {{ this.repository.pullRequest.participants.totalCount }}
                </p>
              </v-flex>
              <v-flex>
                <p>
                  Tamaño PR:
                  {{
                    this.repository.pullRequest.additions +
                      this.repository.pullRequest.deletions
                  }}
                </p>
              </v-flex>
              <v-flex>
                <p>Estado: {{ this.repository.pullRequest.state }}</p>
              </v-flex>
            </v-layout>
          </v-col>

          <v-col sm="12" md="5">
            <h4>Cohesión Individual:</h4>
            <BarChart :chartData="chartCohe" />
          </v-col>
          <v-col sm="12" md="5">
            <h4>Colaboración Individual:</h4>
            <BarChart :chartData="chartColab" />
          </v-col>
          <!--<v-col sm="12" md="5">
            <h4>Polaridad:</h4>
            <BarChart :chartData='chartPolarity'/>
          </v-col>-->
        </v-row>
        <v-row>
          <v-col sm="12" md="12">
            <h4>Cantidad de Mensajes:</h4>
            <v-data-table
              hide-default-footer
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
import PRSelector from "../components/PRSelector";
import BarChart from "../components/chartjs/BarChart.vue";
import Doughnut from "../components/chartjs/Doughnut.vue";
import { GET_REPO } from "../graphql/queries.js";
import {
  matrizConteoPR,
  cohesionFormula,
  colaboracionFormula
  //mimicaFormula,
  //tonoPositivoFormula,
} from "../formulas.js";

export default {
  components: {
    PRSelector,
    BarChart,
    Doughnut
  },
  data() {
    return {
      show: false,
      countMatrix: "",
      cohesionMatrix: "",
      colaboracionMatrix: "",
      mimicaMatrix: "",
      repository: "",
      snackbar: {
        show: false,
        text: "Bienvenido a Gitana: Analíticas de Github",
        color: "info",
        timeout: 2500
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
      chartCohe: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "rgba(0, 71, 255, 1)"
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
      chartPolarity: {
        type: "horizontalBar",
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "rgba(0, 71, 255, 1)"
          }
        ]
      },
      estadisticas: "",
      encabezados: [
        { text: "Participante", sortable: false, value: "nombre" },
        { text: "Msj. Enviados", value: "msjEnviados" },
        { text: "Msj. Recibidos", value: "msjRecibidos" }
      ],
      cohesionGrupal: ""
    };
  },
  apollo: {
    repository: {
      query: GET_REPO,
      variables: { owner: "flacket", name: "githubanalytic", number: 150 }
    }
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
    estadisticasPR() {
      try {
        var cantPersonas = this.repository.pullRequest.participants.totalCount;
        this.cohesionMatrix = cohesionFormula(cantPersonas, this.countMatrix);
        this.colaboracionMatrix = colaboracionFormula(
          cantPersonas,
          this.countMatrix
        );
        //this.mimicaMatrix = mimicaFormula(cantPersonas, this.repository.pullRequest)
        //tonoPositivoFormula(cantPersonas, this.repository.pullRequest)
      } catch (error) {
        console.log("Error en EstadisticasPR-Creando formulas: ", error);
        this.showSnackbar(
          "Error al generar las estadisticas: " + error,
          "error",
          8000
        );
      }
      try {
        var tabla = "[";
        var coeInd, colabInd, msjEnviados, msjRecibidos;
        for (let i = 0; i < cantPersonas; i++) {
          coeInd = 0;
          colabInd = 0;
          msjEnviados = 0;
          msjRecibidos = 0;
          for (let j = 0; j < cantPersonas; j++) {
            coeInd += this.cohesionMatrix[i][j];
            colabInd += this.colaboracionMatrix[i][j];
            msjEnviados += this.countMatrix[i][j];
            msjRecibidos += this.countMatrix[j][i];
          }
          //Me aseguro que hayan mas de 2 personas para calcular las cohesiónes
          if (cantPersonas > 1) {
            coeInd = Math.round((coeInd / cantPersonas) * 100) / 100;
            colabInd = Math.round((colabInd / cantPersonas) * 100) / 100;
          }
          //creo la tabla con los datos estaditicos
          tabla +=
            '{"nombre": "' +
            this.repository.pullRequest.participants.nodes[i].login +
            '", "coeInd": ' +
            coeInd +
            ', "colabInd": ' +
            colabInd +
            ', "msjEnviados": ' +
            msjEnviados +
            ', "msjRecibidos": ' +
            msjRecibidos +
            "}";
          if (i + 1 < cantPersonas) tabla += ",";
        }
        tabla += "]";
        this.estadisticas = JSON.parse(tabla);
        //Doy formato a las gráficas
        this.chartDataCoheGrupal();
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
    chartDataCoheGrupal() {
      //Obtengo la cohesión grupal
      let cohesionGrupal = 0;
      this.estadisticas.forEach(item => {
        cohesionGrupal += item.coeInd;
      });
      cohesionGrupal = (cohesionGrupal / this.estadisticas.length) * 100;
      //Doy formato al valor de CohesionGrupal para el gráfico
      this.chartCoheGrupal.labels[0] = cohesionGrupal.toFixed(2) + "%";
      this.chartCoheGrupal.datasets[0].data[0] = cohesionGrupal;
      this.chartCoheGrupal.datasets[0].data[1] = 100 - cohesionGrupal;
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
    refreshQuery(search) {
      this.show = false;
      if (!this.$apollo.skipAll) {
        this.$apollo.skipAll = false;
      }
      this.$apollo.queries.repository
        .refetch({
          owner: search.owner,
          name: search.name,
          number: parseInt(search.number)
        })
        .then(() => {
          //Llamo a hacer el conteo de Interacciones
          this.countMatrix = matrizConteoPR(this.repository.pullRequest);
          //LLamo a generar las estadisticas en base al conteo
          this.estadisticasPR();
        }); //apollo refetch
    }
  }
};
</script>
