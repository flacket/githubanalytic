<template>
  <v-card>
    <v-layout wrap class="pa-2">
      <v-flex xs4 sm1 md1>
        <v-avatar size="50" class="grey lighten-2">
          <img :src="avatarUrl">
        </v-avatar>
      </v-flex>
      <v-flex xs4 sm2 md1>
        <div>{{ login }}</div>
        <div class="caption grey--text">Reactions: {{ reactCant }}</div>
      </v-flex>
      <v-flex xs4 sm2 md1>
        <div class="caption grey--text">Fecha Creación</div>
        <div>{{ createdAt }}</div>
      </v-flex>

      <v-flex xs12 sm7 md9>
        <div>{{ body }}</div>
      </v-flex>
    </v-layout>
    <v-divider></v-divider>
  </v-card>
</template>

<script>
export default {
  props: ['avatarUrl', 'login', 'reactCant', 'createdAt', 'body']
}
</script>
