import axios from "axios";
import store from "@/store/store";

export default () => {
  return createApi();
};

export function createApi() {
  var api =  axios.create({
    baseURL: store.state.workOnBpmasservice
      ? store.state.bpmasserviceUrl
      : store.state.baseurl,
    withCredentials: false,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
 
  if (store.state.restPasswordEnabled == true && store.state.restAuthType == "Basic") {

    var hash = btoa(store.state.restUsername + ":" +store.state.restPassword)
    api.defaults.headers.common['Authorization'] = "Basic " + hash;
  }
  if (store.state.restPasswordEnabled == true && store.state.restAuthType == "Bearer") {
    api.defaults.headers.common['Authorization'] = "Bearer " + store.state.restBearerToken;
  }
  return api 
}

export async function getEntity(rootEntity, additionalRoute, query) {
  return new Promise(function(resolve, reject) {
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
