<template>
  <v-app>
    <NavigationBar/>
    <v-main>
      <v-container fluid class="ma-2">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import NavigationBar from "@/components/NavigationBar.vue";

export default {
  name: "App",
  components: {
    NavigationBar,
  },
  data() {
    return {
      //
    };
  },
};
</script>
