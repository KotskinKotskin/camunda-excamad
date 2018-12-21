import axios from "axios";
import store from "@/store/store";

export default () => {
  return createApi();
};

export function createApi() {
  return axios.create({
    baseURL: store.state.workOnBpmasservice
      ? store.state.bpmasserviceUrl
      : store.state.baseurl,
    withCredentials: false,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
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
