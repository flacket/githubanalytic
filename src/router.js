import Vue from "vue";
import Router from "vue-router";
import HomePage from "./views/HomePage.vue";
import firebaseApp from "./FirebaseApp";

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
      component: () => import('./views/PullRequest.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/repositorio",
      name: "repositorio",
      component: () => import('./views/RepositorioPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    /*{
      path: "/repodescarga",
      name: "repodescarga",
      component: () => import('./views/repoDescarga.vue'),
      meta: {
        requiresAuth: true,
      },
    },*/
    {
      path: "/acerca",
      name: "acerca",
      component: () => import('./views/AcercaPage.vue'),
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
