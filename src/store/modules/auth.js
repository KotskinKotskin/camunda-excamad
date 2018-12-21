/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import {
  AUTH_REQUEST,
  AUTH_ERROR,
  AUTH_SUCCESS,
  AUTH_LOGOUT
} from "../actions/auth";
import { USER_REQUEST, USER_SUCCESS } from "../actions/user";
import axios from "axios";
import { URLFORAUTH } from "@/config/settings";

const state = {
  token: /*localStorage.getItem("user-token") || */ "",
  status: ""
};

const getters = {
  isAuthenticated: state => !!state.token,
  authStatus: state => state.status
};
const actions = {
  [AUTH_REQUEST]: ({ commit, dispatch }, user) => {
    return new Promise((resolve, reject) => {
      // The Promise used for router redirect in login
      commit(AUTH_REQUEST);
      var bodyFormData = new FormData();
      bodyFormData.set("userName", user.userName);
      bodyFormData.set("password", user.password);
      axios({
        url: URLFORAUTH,
        data: bodyFormData,
        config: {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        },
        method: "POST"
      })
        .then(resp => {
          const token = btoa(user.userName + ":" + user.password);

          localStorage.setItem("user-token", token);
          // Here set the header of your ajax library to the token value.
          // example with axios
          // axios.defaults.headers.common['Authorization'] = resp.token
          commit(AUTH_SUCCESS, token);
          commit(USER_SUCCESS, resp.data);
          resolve(resp);
        })
        .catch(err => {
          commit(AUTH_ERROR, err);
          localStorage.removeItem("user-token"); // if the request fails, remove any possible user token if possible
          reject(err);
        });
    });
  },
  [AUTH_LOGOUT]: ({ commit, dispatch }) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_LOGOUT);
      localStorage.removeItem("user-token"); // clear your user's token from localstorage
      resolve();
    });
  }
};

const mutations = {
  [AUTH_REQUEST]: state => {
    state.status = "loading";
  },
  [AUTH_SUCCESS]: (state, resp) => {
    state.status = "success";
    state.token = resp;
    state.hasLoadedOnce = true;
  },
  [AUTH_ERROR]: state => {
    state.status = "error";
    state.hasLoadedOnce = true;
  },
  [AUTH_LOGOUT]: state => {
    state.token = "";
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
