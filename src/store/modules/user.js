import {
  USER_CAMUNDA_SUCCESS,
  USER_CAMUNDA_ERROR,
  USER_REQUEST,
  USER_ERROR,
  USER_SUCCESS
} from "../actions/user";
import Vue from "vue";
import { AUTH_LOGOUT } from "../actions/auth";

const state = {
  status: "",
  profile: {},
  camundaStatus: "",
  camundaProfile: {}
};

const getters = {
  getProfile: state => state.profile,
  isProfileLoaded: state => !!state.profile.userName,
  getCamundaProfile: state => state.camundaProfile,
  isCamundaProfileLoaded: state => !!state.camundaProfile
};

const mutations = {
  [USER_REQUEST]: state => {
    state.status = "loading";
  },
  [USER_SUCCESS]: (state, resp) => {
    state.status = "success";
    Vue.set(state, "profile", resp);
  },
  [USER_CAMUNDA_SUCCESS]: (state, resp) => {
    state.camundaStatus = "success";
    Vue.set(state, "camundaProfile", resp);
  },
  [USER_CAMUNDA_ERROR]: (state, resp) => {
    state.camundaStatus = "error";
  },

  [USER_ERROR]: state => {
    state.status = "error";
  },
  [AUTH_LOGOUT]: state => {
    state.profile = {};
    state.camundaProfile = {};
  }
};

export default {
  state,
  getters,
  mutations
};
