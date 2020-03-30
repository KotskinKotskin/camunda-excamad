import axios from "axios";
import store from "@/store/store";
import Vue from "vue";

export default () => {
    return createApi();
};

export function createApi() {
    axios.interceptors.request.use(
        config => {
            config.headers.Authorization = `Bearer ${Vue.prototype.$keycloak.token}`;
            return config
        }, error => {
            return Promise.reject(error)
        }
    );
    var api = axios.create({
        baseURL: store.state.workOnBpmasservice
            ? store.state.bpmasserviceUrl
            : store.state.baseurl,
        withCredentials: false,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    });

    if (Vue.prototype.$keycloak && Vue.prototype.$keycloak.token){
        api.defaults.headers.common['Authorization'] = `Bearer ${Vue.prototype.$keycloak.token}`
    }
    if (store.state.restPasswordEnabled == true) {
        var hash = btoa(store.state.restUsername + ":" + store.state.restPassword)
        api.defaults.headers.common['Authorization'] = hash;
    }
    return api
}

export async function getEntity(rootEntity, additionalRoute, query) {
    return new Promise(function (resolve, reject) {
        if (rootEntity == null) {
            return "no rootEntity!";
        }
        if (rootEntity != null) {
            rootEntity = "/" + rootEntity;
        }

        if (query != null) {
            query = "?" + query;
        }
        if (query == null) {
            query = "";
        }
        if (additionalRoute == null) {
            additionalRoute = "";
        }
        if (additionalRoute != null) {
            additionalRoute = "/" + additionalRoute;
        }
        createApi()
            .get(rootEntity + additionalRoute + query)
            .then(response => {
                var enitity = "";
                enitity = response.data;
                resolve(enitity);
            })
            .catch(error => {
                reject(error);
            });
    });
}
