<template>
  <div class>
    <atom-spinner
      v-if="!(ready == true)"
      class="spinner"
      :animation-duration="1000"
      :size="60"
      :color="'#007bff'"
    />
    <div class="row">
      <div class="col-11">
        <h2>Versions</h2>
        <b-form inline class="mt-2 mb-2">
          <b-input
            class="mb-2 mr-sm-2 mb-sm-0"
            placeholder="Definition name"
            size="sm"
            v-model="nameOfProcessDefinition"
          />
          <b-form-checkbox size="sm" id="checkbox1" v-model="latestVersion">Latest Version</b-form-checkbox>
          <b-button size="sm" @click="findDefinitionByName" variant="outline-success">Search</b-button>
          <b-button
            size="sm"
            class="ml-2"
            @click="searchProcessDefinitions"
            variant="outline-secondary"
          >Clear</b-button>
          <b-button variant="link" size="sm" @click="sliceItem = 15">15</b-button>
          <b-button variant="link" size="sm" @click="sliceItem = 30">30</b-button>
          <b-button variant="link" size="sm" @click="sliceItem = 50">50</b-button>
        </b-form>
      </div>
    </div>

    <table class="table table-striped table-sm">
      <thead>
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Version</th>
          <th>Defintion</th>
          <th>Active</th>
          <th>Done</th>
          <th>Incidents</th>
        </tr>
      </thead>
      <tbody>
        <tr :key="item.id" v-for="item in processDefinitions.slice(0,sliceItem)">
          <td>
            <input
              type="checkbox"
              :disabled="!expertMode"
              v-model="item.isSelectedFrom"
              v-on:click="onClickCheck(item)"
            >
          </td>
          <td>
            <input
              type="checkbox"
              :disabled="!expertMode"
              v-model="item.isSelectedTo"
              v-on:click="onClickCheck(item)"
            >
          </td>
          <td>
            <small>
              {{ item.version }}
              <br>
              {{item.deployTimeString}}
            </small>
          </td>
          <td>
            <router-link :to="{name:'definition', params:{ definitionId: item.id}}">{{item.key}}</router-link>
            <br>
            <small>{{item.name}}</small>
          </td>

          <td>{{item.activeCount}}</td>
          <td>{{item.endedCount}}</td>
          <td>{{item.incidentCount}}</td>
        </tr>
      </tbody>
    </table>
    <hr>
    <b-form inline class="mt-2 mb-2">
      <vue-tags-input
        :disabled="migrateAll"
        placeholder="Process instances to migrate"
        v-model="tag"
        :tags="tags"
        :separators="separators"
        @tags-changed="newTags => tags = newTags"
      />
      <b-form-checkbox
        class="ml-2"
        v-on:input="nullTags"
        size="sm"
        id="migrateall"
        v-model="migrateAll"
      >Migrate all</b-form-checkbox>
      <button
        type="submit"
        :disabled="!expertMode"
        class="btn btn-outline-info"
        @click="generateMigrateAndRenew"
      >Migrate</button>
    </b-form>
    <hr>
    <b-button variant="link" size="sm" v-b-toggle.collapse2 class="m-1">Variable modify</b-button>
    <b-collapse id="collapse2">
      <variables-modify :processDefinitionsStringArray="processDefinitionsStringArray"></variables-modify>
    </b-collapse>
  </div>
</template>


<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import VueTagsInput from "@johmun/vue-tags-input";
var _ = require("lodash");
import * as api from "@/api/api";
library.add(faSearch);
export default {
  components: {
    VueTagsInput
  },
  data() {
    return {
      tag: "",
      migrateAll: false,
      separators: [";", ","],
      tags: [],
      query: "",
      routes: [],
      latestVersion: true,
      processDefinitions: [],
      updateEventTriggers: true,
      processDefinitionFrom: null,
      processDefinitionTo: null,
      processDefinitionsStringArray: [],
      arrayOfIncidents: [],
      sliceItem: 15,
      processDefinitionId: null,
      processActivityCount: [],
      nameOfProcessDefinition: null,
      finalPropsArray: [],
      processActivityCountToShow: [],
      ready: null,
      processMigrationInstructions: {}
    };
  },

  computed: {
    baseurl() {
      return this.$store.state.baseurl;
    },
    processInstanceQuery: function() {
      return {
        processDefinitionId: this.processDefinitionFrom
      };
    },
    expertMode() {
      return this.$store.state.expertMode;
    }
  },
  methods: {
    nullTags() {
      this.tag = "";
      this.tags = [];
    },
    findDefinitionByName() {
      this.ready = false;
      this.processDefinitions = [];
      this.processDefinitionsStringArray = [];
      var keyLike = "";
      if (this.nameOfProcessDefinition.length != 0) {
        keyLike = "&keyLike=" + this.nameOfProcessDefinition;
      }

      this.$api()
        .get(
          "/process-definition?sortBy=version&sortOrder=desc&latestVersion=" +
            this.latestVersion +
            keyLike
        )
        .then(response => {
          this.processDefinitions = response.data;
          this.ready = true;
          this.updateCountForeach();
        })
        .catch();
    },
    onHide(item) {
      item.showModal = false;
    },
    searchProcessDefinitions() {
      this.ready = false;
      this.nameOfProcessDefinition = "";
      this.processDefinitions = [];
      this.processDefinitionsStringArray = [];

      this.$api()
        .get(
          "/process-definition?sortBy=version&sortOrder=desc&latestVersion=" +
            this.latestVersion
        )
        .then(response => {
          this.processDefinitions = response.data;
          this.ready = true;
          this.updateCountForeach();
        })
        .catch();
    },
    getActivityAndCalculate(item) {
      item.showModal = true;

      this.getActivityByProcessDefinition(item).then(response => {
        this.calcluteUniqActivityCount();
      });
    },
    calcluteUniqActivityCount() {
      var result = this.processActivityCount.filter(function(a) {
        var key = a.activityId;
        if (!this[key]) {
          this[key] = true;
          return true;
        }
      }, Object.create(null));
      result.forEach(element => {
        element["count"] = 0;
      });

      this.processActivityCount.forEach(activity => {
        result.forEach(uniqAcitivity => {
          if (activity.activityId == uniqAcitivity.activityId) {
            uniqAcitivity.count++;
          }
        });
      });

      var finalPropsArray = [];

      result.forEach(element => {
        var obj = {};
        obj["processActivityToShow"] = element.activityId;
        obj["count"] = element.count;
        finalPropsArray.push(obj);
      });
      this.finalPropsArray = finalPropsArray;
    },
    convertDateToHumanStyle: function(date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    },

    getDeploymentTime(deploymentId) {
      this.$api()
        .get("/deployment/" + deploymentId)
        .then(response => {
          return this.convertDateToHumanStyle(response.data.deploymentTime);
        });
    },
    getActivityByProcessDefinition: async function(item) {
      var vm = this;
      return new Promise(function(resolve, reject) {
        api
          .getEntity(
            "history",
            "activity-instance",
            "unfinished=true&processDefinitionId=" + item.id
          )
          .then(value => {
            vm.processActivityCount = value;
            resolve();
          });
      });
    },
    updateCountForeach: function() {
      this.processDefinitionsStringArray = [];
      for (let index = 0; index < this.processDefinitions.length; index++) {
        this.$set(this.processDefinitions[index], "activeCount", 0);
        this.$set(this.processDefinitions[index], "endedCount", 0);
        this.$set(this.processDefinitions[index], "isSelectedFrom", false);
        this.$set(this.processDefinitions[index], "isSelectedTo", false);
        this.$set(this.processDefinitions[index], "showModal", false);
        this.$set(this.processDefinitions[index], "incidentCount", 0);
        this.$set(this.processDefinitions[index], "deployTimeString", null);
        this.$set(this.processDefinitions[index], "deployTime", null);

        this.$api()
          .get(
            "/history/process-instance/count?unfinished=true&&processDefinitionId=" +
              this.processDefinitions[index].id
          )
          .then(response => {
            this.processDefinitions[index].activeCount = response.data.count;
            if (response.data.count != 0) {
              this.processDefinitionsStringArray.push(
                this.processDefinitions[index].id
              );
            }
          });

        api
          .getEntity(
            "incident",
            "count",
            "open=true&&processDefinitionId=" +
              this.processDefinitions[index].id
          )
          .then(
            value =>
              (this.processDefinitions[index].incidentCount = value.count)
          );

        this.$api()
          .get(
            "/history/process-instance/count?finished=true&&processDefinitionId=" +
              this.processDefinitions[index].id
          )
          .then(response => {
            this.processDefinitions[index].endedCount = response.data.count;
          });

        this.$api()
          .get("/deployment/" + this.processDefinitions[index].deploymentId)
          .then(response => {
            this.processDefinitions[
              index
            ].deployTimeString = this.convertDateToHumanStyle(
              response.data.deploymentTime
            );
            this.processDefinitions[index].deployTime =
              response.data.deploymentTime;
          });
      }
    },
    /*
    TO DO 
    getIncidentsCountByActivity(item) {
      api
        .getEntity("incident", "", "processDefinitionId=" + item.id)
        .then(value => {
          this.arrayOfIncidents = value;
        });
    },
    */

    onClickCheck(item) {
      this.$nextTick(() => {
        if (item.isSelectedTo) {
          this.processDefinitionTo = item.id;
        }
        if (item.isSelectedFrom) {
          this.processDefinitionFrom = item.id;
        }
        if (item.isSelectedFrom && item.isSelectedTo) {
          item.isSelectedTo = false;
          this.processDefinitionTo = null;
        }
      });
    },
    generateMigrateAndRenew() {
      this.$notify({
        group: "foo",
        title: "Migration runned",
        type: "info"
      });

      this.generateValidation();
      setTimeout(() => {
        this.migrate();
      }, 2000);
      setTimeout(() => {
        this.updateCountForeach();
      }, 5000);
    },

    generateValidation() {
      this.$nextTick(() => {
        this.$api()
          .post("/migration/generate", {
            sourceProcessDefinitionId: this.processDefinitionFrom,
            targetProcessDefinitionId: this.processDefinitionTo,
            updateEventTriggers: this.updateEventTriggers
          })
          .then(response => {
            this.processMigrationInstructions = response.data;
          })
          .catch();
      });
    },
    migrate() {
      this.$nextTick(() => {
        var objToMigrate = {
          processInstanceQuery: this.processInstanceQuery,
          migrationPlan: this.processMigrationInstructions,
          skipCustomListeners: true
        };

        if (this.migrateAll == false) {
          var instacesToMigrate = [];
          if (this.tags.length > 0) {
            this.tags.forEach(tag => {
              instacesToMigrate.push(tag.text);
            });
            objToMigrate["processInstanceIds"] = instacesToMigrate;
          }
        }

        this.$api()
          .post("/migration/executeAsync", objToMigrate)
          .then(response => {
            if (response) {
              this.$notify({
                group: "foo",
                title: "Migration sended to server",
                text: "It work in async",
                type: "success"
              });
            }
          })
          .catch(error => {
            this.$notify({
              group: "foo",
              title: "Migration not accepted by server",
              text: error,
              type: "error"
            });
          });
      });
    }
  },
  mounted: function() {
    this.ready = false;
    this.searchProcessDefinitions();
  }
};
</script>

<style>
.ti-input {
  width: 450px;
}
</style>
