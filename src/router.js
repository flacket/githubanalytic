import Vue from "vue";
import Router from "vue-router";
import HomePage from "./views/HomePage.vue";
import firebaseApp from "./FirebaseApp";

import repoPage from "./views/RepositorioPage.vue";
import PullRequest from "./views/PullRequest.vue";
import repoDescarga from "./views/repoDescarga.vue";
import AcercaPage from "./views/AcercaPage.vue";

Vue.use(Router);

let router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "*",
      redirect: "/",
    },
    {
      path: "/",
      name: "home",
      component: HomePage,
    },
    {
      path: "/pullrequest",
      name: "pullrequest",
      component: PullRequest,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/repositorio",
      name: "repositorio",
      component: repoPage,
    },
    {
      path: "/repodescarga",
      name: "repodescarga",
      component: repoDescarga,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/acerca",
      name: "acerca",
      component: AcercaPage,
    },
  ],
});

//Nav Royal Guards
router.beforeEach((to, from, next) => {
  //check for requireddAuth guard
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    //check if NOT logged in
    if (!firebaseApp.auth().currentUser) {
      //Go to login
      next({
        path: "/error",
        query: {
          redirect: to.fullPath,
        },
      });
    } else next();
  } else if (to.matched.some((record) => record.meta.requiresGuest)) {
    //check if logged in
    if (firebaseApp.auth().currentUser) {
      //Go to login
      next({
        path: "/",
        query: {
          redirect: to.fullPath,
        },
      });
    } else next();
  } else next();
});

export default router;
