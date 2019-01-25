<template>
  <div id="app">
    <navbar v-if="!dashboard"></navbar>
    <transition name="fade">
      <div id="containerOverRouter" :class="containerClass">
        <router-view :key="$route.fullPath" class="mt-3"/>
      </div>
    </transition>
    <notifications group="foo"/>
  </div>
</template>

<script>
import Navbar from "@/components/NavBar.vue";
import { AUTH_REQUEST } from "@/store/actions/auth";

export default {
  name: "home",
  components: {
    Navbar
  },
  data() {
    return {
      containerClass: "",
      dashboard: false
    };
  },
  mounted() {
    if (this.$route.query.dashboard == "true") {
      this.dashboard = true;
      this.containerClass = "container width";
    } else this.dashboard = false;

    setTimeout(() => {
      this.ContainerOrNot();
    }, 50);

    if (this.$route.query.baseurl) {
      this.$store.commit("setBaseUrl", this.$route.query.baseurl);
    }

    if (localStorage.usertoken != null) {
      var usertokenstring = atob(localStorage.usertoken).split(":");

      var userName = usertokenstring[0];
      var password = usertokenstring[1];
      this.$store.dispatch(AUTH_REQUEST, { userName, password }).then(() => {});
    }
  },
  methods: {
    ContainerOrNot: function() {
      this.containerClass = "container";
      if (this.dashboard == true) {
        this.containerClass = "";
      }
    }
  }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

#containerOverRouter {
  max-width: 1400px;
  margin-top: 110px;
}
</style>
