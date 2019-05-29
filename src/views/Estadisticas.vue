<template>
  <div class="estadisticas">
  <h1 class="subheading grey--text">Estadísticas</h1>
  <v-container>

    <v-layout row class="pb-3">
      <v-btn-toggle class="transparent" v-model="btn_toggle">
        <v-tooltip top>
          <v-btn small flat @click="sortBy('title')" slot="activator">
            <v-icon small left>folder</v-icon>
            <span class="caption text-lowercase">Por proyecto</span>
          </v-btn>
          <span>Ordena la lista por proyectos</span>
        </v-tooltip> 
        <v-tooltip top>
          <v-btn small flat @click="sortBy('person')" slot="activator">
            <v-icon small left>person</v-icon>
            <span class="caption text-lowercase">Por persona</span>
          </v-btn>
          <span>Ordena la lista por persona</span>
        </v-tooltip> 
        <v-tooltip top>
          <v-btn small flat @click="sortBy('status')" slot="activator">
            <v-icon small left>check_circle</v-icon>
            <span class="caption text-lowercase">Por estado</span>
          </v-btn>
          <span>Ordena la lista por estado</span>
        </v-tooltip> 
      </v-btn-toggle>
    </v-layout>


    <CardProyecto v-for="item in projects" 
    v-bind:project="item" v-bind:key="item.title">
              <v-divider></v-divider>
    </CardProyecto>

  </v-container>
  </div>
</template>

<script>
import CardProyecto from '../components/CardProyecto'

export default {
  components: {
    CardProyecto
  },
  data() {
    return {
      btn_toggle: 0,
      projects: [
        { title: 'Design a new website', person: 'The Net Ninja', due: '1st Jan 2019', status: 'ongoing', content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt consequuntur eos eligendi illum minima adipisci deleniti, dicta mollitia enim explicabo fugiat quidem ducimus praesentium voluptates porro molestias non sequi animi!'},
        { title: 'Code up the homepage', person: 'Chun Li', due: '10th Jan 2019', status: 'complete', content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt consequuntur eos eligendi illum minima adipisci deleniti, dicta mollitia enim explicabo fugiat quidem ducimus praesentium voluptates porro molestias non sequi animi!'},
        { title: 'Design video thumbnails', person: 'Ryu', due: '20th Dec 2018', status: 'complete', content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt consequuntur eos eligendi illum minima adipisci deleniti, dicta mollitia enim explicabo fugiat quidem ducimus praesentium voluptates porro molestias non sequi animi!'},
        { title: 'Create a community forum', person: 'Gouken', due: '20th Oct 2018', status: 'overdue', content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt consequuntur eos eligendi illum minima adipisci deleniti, dicta mollitia enim explicabo fugiat quidem ducimus praesentium voluptates porro molestias non sequi animi!'},
      ]
    }
  },
  methods: {
    sortBy(prop) {
      this.projects.sort((a,b) => a[prop] < b[prop] ? -1 : 1)
    }
  }
}
</script>