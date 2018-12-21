<template>
  <div class>
    <div class="row">
      <div class="col-11">
        <h2>Versions</h2>
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
          <th>Online stat</th>
        </tr>
      </thead>
      <tbody>
        <tr :key="item.id" v-for="item in processDefinitions.slice(0,15)">
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
          <td>{{ item.version }}</td>
          <td>
            <router-link :to="{name:'diagram', params:{ diagramKey: item.key}}">{{ item.id }}</router-link>
          </td>
          <td>{{item.activeCount}}</td>
          <td>{{item.endedCount}}</td>
          <td>{{item.incidentCount}}</td>
          <td>
            <b-btn
              size="sm"
              v-b-modal="'modal'+item.id"
              variant="outline-info"
              @click="getActivityAndCalculate(item)"
            >
              <font-awesome-icon icon="search"/>
            </b-btn>
          </td>
          <b-modal
            @hidden="onHide(item)"
            class="my-modal"
            hide-footer
            size="lg"
            :id="'modal'+item.id"
            title="Statistic"
          >
            <diagram
              v-if="item.showModal"
              :processActivityToShowArray="finalPropsArray"
              :processDefinitionId="item.id"
            ></diagram>
          </b-modal>
        </tr>
      </tbody>
    </table>
    <hr>
    <button
      type="submit"
      :disabled="!expertMode"
      class="btn btn-outline-info mb-2 mr-2"
      @click="generateMigrateAndRenew"
    >Migrate</button>
    <hr>
    <variables-modify :processDefinitionsStringArray="processDefinitionsStringArray"></variables-modify>
  </div>
</template>


<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import * as api from "@/api/api";
library.add(faSearch);
export default {
  data() {
    return {
      query: "",
      routes: [],
      processDefinitions: [],
      updateEventTriggers: true,
      processDefinitionFrom: null,
      processDefinitionTo: null,
      processDefinitionsStringArray: [],
      arrayOfIncidents: [],
      processDefinitionId: null,
      processActivityCount: [],
      finalPropsArray: [],
      processActivityCountToShow: [],
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
    onHide(item) {
      item.showModal = false;
    },
    searchProcessDefinitions() {
      this.processDefinitions = [];
      this.processDefinitionsStringArray = [];

      this.$api()
        .get("/process-definition?sortBy=version&sortOrder=desc")
        .then(response => {
          this.processDefinitions = response.data;

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
        this.$api()
          .post("/migration/executeAsync", {
            processInstanceQuery: this.processInstanceQuery,
            migrationPlan: this.processMigrationInstructions,
            skipCustomListeners: true
          })
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
    this.searchProcessDefinitions();
  }
};
</script>