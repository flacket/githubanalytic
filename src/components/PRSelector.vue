
<template>
  <v-form>
    <v-container>
      <v-row>
        <v-col class="py-0" cols="12" sm="3">
          <v-text-field
            v-model="search.owner"
            :rules="emptyRules"
            label="Organización"
            required
          ></v-text-field>
        </v-col>

        <v-col class="py-0" cols="12" sm="4">
          <v-text-field
            v-model="search.name"
            :rules="emptyRules"
            label="Repositorio"
            required
          ></v-text-field>
        </v-col>

        <v-col class="py-0" cols="12" sm="3">
          <v-text-field
            v-model="search.number"
            :rules="emptyRules"
            label="Pull Request #"
            required
          ></v-text-field>
        </v-col>

        <v-col class="py-0" cols="12" sm="2">
          <v-btn color="primary" v-on:click="$emit('searchPR', search)">
            <v-icon left>mdi-magnify</v-icon>Buscar</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  data() {
    return {
      //search: {owner: 'cdr', name: 'code-server', number: '154'},
      search: {owner: '', name: '', number: ''},
      emptyRules: [
        v => !!v || 'Ingrese algun valor',
      ]
    }
  }
}
</script>