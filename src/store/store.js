import Vue from 'vue';
import Vuex from 'vuex';
// eslint-disable-next-line no-unused-vars
import createPersistedState from 'vuex-persistedstate';
import user from './modules/user';
import auth from './modules/auth';
import * as access from './modules/accessSetings';
import { BPMAASURL } from '@/config/settings';
Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    user,
    auth
  },
  strict: debug,
  state: {
    baseurl: '',
    role: '',
    bpmasserviceUrl: BPMAASURL,
    serverStatus: true,
    workOnBpmasservice: false,
    envortment: 'UNKNOWN',
    restPasswordEnabled: false,
    restUsername: null,
    restPassword: null,
    expertMode: true,
    taskId: ''
  },
  mutations: {
    setBaseUrl(state, url) {
      state.baseurl = url;
    },
    setRestPasswordEnabled(state, restPasswordEnabled) {
      state.restPasswordEnabled = restPasswordEnabled;
    },
    setRestsername(state, restUsername) {
      state.restUsername = restUsername;
    },
    setRestpassword(state, restPassword) {
      state.restPassword = restPassword;
    },
    setBpmasserviceUrl(state, url) {
      state.bpmasserviceUrl = url;
    },
    setRole(state, role) {
      state.role = role;
    },
    changeServerStatus(state, status) {
      state.serverStatus = status;
    },
    changeExpertMode(state, expertMode) {
      state.expertMode = true;
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
