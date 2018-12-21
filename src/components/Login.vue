<template>
  <div>
    <b-navbar-nav class="ml-auto">
      <b-nav-form>
        <b-button
          v-b-modal.modal1
          v-if="!isAuthenticated"
          variant="outline-success"
          size="sm"
          class="ml-2 my-2 my-sm-0"
        >Login</b-button>
        <b-button
          variant="outline-primary"
          v-if="isAuthenticated"
          @click="logout"
          size="sm"
          class="ml-2 my-2 my-sm-0"
        >
          <img class="face" :src="calculatePhoto(profile.userName)">
          <b>{{profile.userName}}</b>
        </b-button>
      </b-nav-form>
    </b-navbar-nav>

    <b-modal @shown="focusMyElement" ref="myModalRef" id="modal1" hide-footer title="Login">
      <form class="login" @submit.prevent="login">
        <label for="login">Login</label>
        <b-form-input
          ref="focusThis"
          id="login"
          required
          v-model="userName"
          type="text"
          placeholder="Snoopy"
        />

        <label for="password">Password</label>
        <b-form-input
          id="password"
          required
          v-model="password"
          type="password"
          placeholder="Password"
        />

        <hr>
        <b-btn block variant="outline-success" type="submit">Login</b-btn>

        <b-alert class="mt-2" variant="danger" :show="(authStatus == 'error') ">Auth error</b-alert>
        <b-alert class="mt-2" variant="success" :show="isAuthenticated">OK</b-alert>
      </form>
    </b-modal>
  </div>
</template>

<script>
import { AUTH_REQUEST, AUTH_LOGOUT } from "@/store/actions/auth";
import { USERPHOTOLOADURL } from "@/config/settings";
export default {
  name: "Login",

  data() {
    return {
      userName: "",
      password: ""
    };
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    },
    authStatus() {
      return this.$store.getters.authStatus;
    },
    profile() {
      return this.$store.getters.getProfile;
    }
  },
  methods: {
    calculatePhoto(user) {
      return USERPHOTOLOADURL + user + ".png";
    },
    focusMyElement(e) {
      this.$refs.focusThis.focus();
    },
    login: function() {
      const { userName, password } = this;
      this.$store.dispatch(AUTH_REQUEST, { userName, password }).then(() => {
        this.$refs.myModalRef.hide();
      });
    },
    logout: function() {
      this.$store.dispatch(AUTH_LOGOUT).then(() => {
        this.$router.push("/");
      });
    }
  }
};
</script>

<style>
</style>
