
<template>
  <v-form>
    <v-container>
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="search.owner"
            :rules="emptyRules"
            label="Compañia"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="search.name"
            :rules="emptyRules"
            label="Repositorio"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model="search.number"
            :rules="emptyRules"
            label="Pull Request #"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="2">
          <v-btn color="primary" v-on:click="$emit('searchPR', search)">Buscar</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  props: ['owner', 'name', 'number'],
  data() {
    return {
      search: {
        owner: '',
        name: '',
        number: ''
      },
      emptyRules: [
        v => !!v || 'Ingrese algun valor',
      ]
    }
  }
}
</script>