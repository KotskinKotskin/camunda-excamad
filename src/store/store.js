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
    restBearerToken: null,
    restAuthType: null,
    restAuthArray:  [],
    taskId: '',
    secureDate: null,
  },
  mutations: {
    setBaseUrl(state, url) {
      state.baseurl = url;
    },
    setSecureDate(state ,date ) {
      state.secureDate = date;
    },
    setMoreJWT(state, element) {
      
       var obj  = {
         url: 'http://bpm.tinkoff.ru',
         date: "",
         type: "BASIC/JWT",
         login:  "login",
         password: "password",
         JWT: "JWergergT"


       }
      if (state.restAuthArray.find (x =>x.url == element.url)) {
          state.restAuthArray.splice(state.restAuthArray.map(item  => item.url).indexOf(element.url))
      } 
        state.restAuthArray.push(element)
        state.secureDate = obj.date

      
      localStorage.setItem("restAuthArray", JSON.stringify(state.restAuthArray))
    },
    removeJWT(state, url) {

        state.restAuthArray.splice(state.restAuthArray.map(item  => item.url).indexOf(url))
        localStorage.setItem("restAuthArray", JSON.stringify(state.restAuthArray))
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
    setRestToken(state, restBearerToken) {
      state.restBearerToken = restBearerToken;
    },
    setRestAuthType(state, restAuthType) {
      state.restAuthType = restAuthType;
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
