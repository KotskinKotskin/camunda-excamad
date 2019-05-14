/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import {
  AUTH_REQUEST,
  AUTH_ERROR,
  AUTH_SUCCESS,
  AUTH_LOGOUT,
  AUTH_CAMUNDA_REQUEST,
  AUTH_CAMUNDA_SUCCESS,
  AUTH_CAMUNDA_ERROR
} from '../actions/auth';
import {
  USER_REQUEST,
  USER_CAMUNDA_ERROR,
  USER_SUCCESS,
  USER_CAMUNDA_SUCCESS
} from '../actions/user';
import axios from 'axios';
import * as api from '@/api/api';
import { URLFORAUTH } from '@/config/settings';

const state = {
  token: /*localStorage.getItem("user-token") || */ '',
  status: '',
  camundaStatus: '',
  camundaToken: ''
};

const getters = {
  isAuthenticated: state => !!state.token,
  authStatus: state => state.status,
  authCamundaStatus: state => state.camundaStatus,
  isCamundaAuthenticated: state => !!state.camundaToken
};
const actions = {
  [AUTH_REQUEST]: ({ commit, dispatch }, user) => {
    return new Promise((resolve, reject) => {
      // The Promise used for router redirect in login
      commit(AUTH_REQUEST);
      var bodyFormData = new FormData();
      bodyFormData.set('userName', user.userName);
      bodyFormData.set('password', user.password);
      axios({
        url: URLFORAUTH,
        data: bodyFormData,
        config: {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        },
        method: 'POST'
      })
        .then(resp => {
          const token = btoa(user.userName + ':' + user.password);

          localStorage.setItem('usertoken', token);

          commit(AUTH_SUCCESS, token);
          commit(USER_SUCCESS, resp.data);
          resolve(resp);
        })
        .catch(err => {
          commit(AUTH_ERROR, err);
          localStorage.removeItem('usertoken'); // if the request fails, remove any possible user token if possible
          reject(err);
        });
    });
  },
  [AUTH_LOGOUT]: ({ commit, dispatch }) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_LOGOUT);
      localStorage.removeItem('usertoken'); // clear your user's token from localstorage
      resolve();
    });
  },
  [AUTH_CAMUNDA_REQUEST]: ({ commit, dispatch }, user) => {
    return new Promise((resolve, reject) => {
      const camundatoken = btoa(user.userName + ':' + user.password);
      commit(AUTH_CAMUNDA_REQUEST);
      var identityObj = {
        username: user.userName,
        password: user.password
      };

      api
        .createApi()
        .post('/identity/verify', identityObj)
        .then(response => {
          if (response.data.authenticated) {
            commit(AUTH_CAMUNDA_SUCCESS, camundatoken);
            commit(USER_CAMUNDA_SUCCESS, response.data);
            api
              .createApi()
              .get('/identity/groups?userId=' + response.data.authenticatedUser)
              .then(responseGroups => {
                response.data['groups'] = responseGroups.data.groups;
                commit(AUTH_CAMUNDA_SUCCESS, camundatoken);
                commit(USER_CAMUNDA_SUCCESS, response.data);
              });
          }
          if (!response.data.authenticated) {
            commit(AUTH_CAMUNDA_ERROR);
            commit(USER_CAMUNDA_ERROR, response.data);
          }
          resolve(response.data);
        })
        .catch(error => {
          commit(AUTH_CAMUNDA_ERROR, error);
          reject(error);
        });
    });
  }
};

const mutations = {
  [AUTH_REQUEST]: state => {
    state.status = 'loading';
  },
  [AUTH_CAMUNDA_REQUEST]: state => {
    state.camundaStatus = 'loading';
  },
  [AUTH_SUCCESS]: (state, resp) => {
    state.status = 'success';
    state.token = resp;
    state.hasLoadedOnce = true;
  },
  [AUTH_ERROR]: state => {
    state.status = 'error';
    state.hasLoadedOnce = true;
  },
  [AUTH_CAMUNDA_ERROR]: state => {
    state.camundaStatus = 'error';
    state.camundaToken = null;
    state.hasLoadedOnce = true;
  },
  [AUTH_LOGOUT]: state => {
    state.token = '';
  },
  [AUTH_CAMUNDA_SUCCESS]: (state, resp) => {
    state.camundaStatus = 'success';
    state.camundaToken = resp;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
