<template>
    <v-card flat>
        <v-layout row wrap :class="`pa-3 project ${project.status}`">
          <v-flex xs12 md6>
            <div class="caption grey--text">Titulo Proyecto</div>
            <div>{{ project.title }}</div>
          </v-flex>
          <v-flex xs6 sm4 md2>
            <div class="caption grey--text">Persona</div>
            <div>{{ project.person }}</div>
          </v-flex>
          <v-flex xs6 sm4 md2>
            <div class="caption grey--text">Fecha Creación</div>
            <div>{{ project.due }}</div>
          </v-flex>
          <v-flex xs2 sm4 md2>
            <div class="right">
              <v-chip small :class="`${project.status} white--text my-2 caption`">{{ project.status }}</v-chip>
            </div>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
    </v-card>
</template>

<script>
export default {
    props: ['project']
}
</script>

<style>
.project.complete{
  border-left: 4px solid #3CD1C2;
}
.project.ongoing{
  border-left: 4px solid orange
}
.project.overdue{
  border-left: 4px solid tomato;
}
.v-chip.complete{
  background: #3CD1C2;
}
.v-chip.ongoing{
  background: orange;
}
.v-chip.overdue{
  background: tomato;
}
</style>
