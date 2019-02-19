<template>
  <vue-simple-suggest @select="onSelect" v-model="chosen" :list="getList" :filter-by-query="true">
    <input placeholder="Search anything" type="search">
    <atom-spinner
      v-if="ready==false"
      class="spinner"
      :animation-duration="1000"
      :size="30"
      :color="'#007bff'"
    />
    <div slot="suggestion-item" slot-scope="{suggestion}">
      <div>{{suggestion}}</div>
    </div>
  </vue-simple-suggest>
</template>


<script>
import * as URLs from "@/config/camundasUrl";
import VueSimpleSuggest from "vue-simple-suggest";
import { AtomSpinner } from "epic-spinners";
import "vue-simple-suggest/dist/styles.css"; // Optional CSS

export default {
  components: {
    VueSimpleSuggest,
    AtomSpinner
  },
  data() {
    return {
      chosen: "",
      ready: null
    };
  },
  methods: {
    tryCheckBusinessKeyInRuntime(businessKey) {
      var vm = this;
      var arrayOfProcess = [];
      return new Promise(function(resolve, reject) {
        vm.$api()
          .get("/process-instance?businessKeyLike=" + businessKey)
          .then(response => {
            if (response.data && response.data.length > 0) {
              response.data.forEach(element => {
                arrayOfProcess.push(
                  "Runtime " + element.id + " (" + businessKey + ")"
                );
              });
            }
            resolve(arrayOfProcess);
          })
          .catch(error => {
            reject();
          });
      });
    },
    tryCheckBusinessKeyInHistory(businessKey) {
      var vm = this;
      var arrayOfProcess = [];
      return new Promise(function(resolve, reject) {
        vm.$api()
          .get(
            "/history/process-instance?processInstanceBusinessKeyLike=" +
              businessKey
          )
          .then(response => {
            if (response.data && response.data.length > 0) {
              response.data.forEach(element => {
                arrayOfProcess.push(
                  "History " + element.id + " (" + businessKey + ")"
                );
              });
            }
            resolve(arrayOfProcess);
          })
          .catch(error => {
            reject();
          });
      });
    },
    tryCheckInstanceInRuntime(instance) {
      var vm = this;
      var arrayOfProcess = [];
      return new Promise(function(resolve, reject) {
        vm.$api()
          .get("/process-instance?processInstanceIds=" + instance)
          .then(response => {
            if (response.data && response.data.length > 0) {
              response.data.forEach(element => {
                arrayOfProcess.push(
                  "Runtime " + element.id + " (" + instance + ")"
                );
              });
            }
            resolve(arrayOfProcess);
          })
          .catch(error => {
            reject();
          });
      });
    },
    tryCheckInstanceInHistory(instance) {
      var vm = this;
      var arrayOfProcess = [];
      return new Promise(function(resolve, reject) {
        vm.$api()
          .get("/history/process-instance?processInstanceIds=" + instance)
          .then(response => {
            if (response.data && response.data.length > 0) {
              response.data.forEach(element => {
                arrayOfProcess.push(
                  "History " + element.id + " (" + instance + ")"
                );
              });
            }
            resolve(arrayOfProcess);
          })
          .catch(error => {
            reject();
          });
      });
    },

    tryCheckUrl(url) {
      var possibleUrl = URLs.generatePossibleUrl();
      var matchedUrl = [];
      possibleUrl.forEach(element => {
        if (element.includes(url)) {
          matchedUrl.push(element);
        }
      });
      return matchedUrl;
    },

    getList(inputValue) {
      this.ready = false;
      var vm = this;
      var array = [];
      return new Promise((resolve, reject) => {
        vm.tryCheckBusinessKeyInRuntime(inputValue)
          .then(response => {
            array.push.apply(array, vm.tryCheckUrl(inputValue));
            array.push.apply(array, response);
            vm.tryCheckBusinessKeyInHistory(inputValue)
              .then(responseHistory => {
                array.push.apply(array, responseHistory);
                vm.tryCheckInstanceInRuntime(inputValue).then(
                  responseInstanceRuntime => {
                    array.push.apply(array, responseInstanceRuntime);
                    vm.tryCheckInstanceInHistory(inputValue).then(
                      responseInstanceHistory => {
                        array.push.apply(array, responseInstanceHistory);
                        vm.ready = true;
                        resolve(array);
                      }
                    );
                  }
                );
              })
              .catch(error => {
                this.ready = true;
                resolve(vm.tryCheckUrl(inputValue));
              });
          })
          .catch(error => {
            this.ready = true;
            resolve(vm.tryCheckUrl(inputValue));
          });
      });
    },
    onSelect(suggest) {
     
      if (suggest) {
        if (suggest.includes("Runtime") || suggest.includes("History")) {
          var firstSpace = suggest.indexOf(" ");
          var secondSpace = suggest.indexOf(" ", firstSpace + 1);
          var myString = suggest.substring(firstSpace + 1, secondSpace);

          this.$router.push({
            name: "processdetail",
            params: { processInstanceId: myString }
          });
        }
        if (suggest.includes("http")) {
        
          this.$emit("setUrlFromSearch", suggest);
        }
      }
    }
  }
};
</script>

<style>
.vue-simple-suggest.designed,
.vue-simple-suggest.designed * {
  width: 550px;
}
.vue-simple-suggest.designed .suggestions .suggest-item,
.vue-simple-suggest.designed .suggestions .misc-item {
  padding: 5px 10px;
  border-bottom: solid 1px #d4d4d4;
  font-size: 14px;
}
</style>
