<template>
  <v-card>
    <v-layout row wrap class="pa-2">
      <v-flex xs4 sm1 md1>
        <v-avatar size="50" class="grey lighten-2">
          <img :src="item.author.avatarUrl">
        </v-avatar>
      </v-flex>
      <v-flex xs4 sm2 md1>
        <div>{{ item.author.login }}</div>
        <div class="caption grey--text">Reactions: {{ item.reactions.edges.length }}</div>
      </v-flex>
      <v-flex xs4 sm2 md1>
        <div class="caption grey--text">Fecha Creación</div>
        <div>{{ item.createdAt }}</div>
      </v-flex>

      <v-flex xs12 sm7 md9>
        <div>{{ item.body }}</div>
      </v-flex>
    </v-layout>
    <v-divider></v-divider>
  </v-card>
</template>

<script>
export default {
  props: ['item']
}
</script>
