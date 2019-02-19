import Vue from "vue";
import Vuex from "vuex";
// eslint-disable-next-line no-unused-vars
import createPersistedState from "vuex-persistedstate";
import user from "./modules/user";
import auth from "./modules/auth";
import { BPMAASURL } from "@/config/settings";
Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
  modules: {
    user,
    auth
  },
  strict: debug,
  state: {
    baseurl: "",
    bpmasserviceUrl: BPMAASURL,
    serverStatus: true,
    workOnBpmasservice: false,
    envortment: "UNKNOWN",
    expertMode: false,
    taskId: ""
  },
  //plugins: [createPersistedState()],
  mutations: {
    setBaseUrl(state, url) {
      state.baseurl = url;
    },
    setBpmasserviceUrl(state, url) {
      state.bpmasserviceUrl = url;
    },
    changeServerStatus(state, status) {
      state.serverStatus = status;
    },
    changeExpertMode(state, expertMode) {
      state.expertMode = expertMode;
    },
    changeTaskId(state, taskId) {
      state.taskId = taskId;
    },
    changeEnvortment(state, envortment) {
      state.envortment = envortment;
    },
    changeworkOnBpmasservice(state, workOnBpmasservice) {
      state.workOnBpmasservice = workOnBpmasservice;
      if (workOnBpmasservice == true) {
        state.bpmasserviceUrl = state.baseurl;
      }
    }
  },
  actions: {}
});
