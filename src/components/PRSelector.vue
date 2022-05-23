<template>
  <v-form>
    <v-container class="ml-0">
      <v-row>
        <v-col class="py-0" cols="12" sm="3">
          <v-text-field
            v-model="search.owner"
            :rules="emptyRules"
            label="Usuario / Organización"
            placeholder="ej: twitter"
            required
          ></v-text-field>
        </v-col>

        <v-col class="py-0" cols="12" sm="4">
          <v-text-field
            v-model="search.name"
            :rules="emptyRules"
            label="Repositorio"
            placeholder="ej: serial"
            required
          ></v-text-field>
        </v-col>

        <v-col class="py-0" cols="12" sm="3" :hidden="hideNumber">
          <v-text-field
            v-model="search.number"
            :rules="emptyRules"
            label="Pull Request #"
            required
            placeholder="ej: 23"
            :disabled="hideNumber"
          ></v-text-field>
        </v-col>
        <v-col class="py-0" cols="12" sm="2">
          <v-btn color="primary" rounded @click="$emit('search-pr', search)">
            <v-icon left>mdi-magnify</v-icon>Buscar</v-btn
          >
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  props: {
    hideNumber: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['search-pr'],
  data() {
    return {
      //search: { owner: "twitter", name: "serial", number: "" },
      //search: { owner: "cdr", name: "code-server", number: "154" },
      search: { owner: "", name: "", number: "" },
      emptyRules: [(v) => !!v || "Ingrese algun valor"],
    };
  },
};
</script>
