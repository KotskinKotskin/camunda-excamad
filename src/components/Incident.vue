<template>
  <div id="incident">
    <atom-spinner
      v-if="!(ready == true)"
      class="spinner"
      :animation-duration="1000"
      :size="60"
      :color="'#007bff'"
    />

    <h2>Incidents count: {{incidentsToShow.length}}</h2>
    <b-form-checkbox
      id="checkbox1"
      name="checkbox1"
      v-model="hideParentIncidents"
    >Hide parent incidents</b-form-checkbox>
    <div v-if="incidents.length != 0">
      <button
        type="button"
        class="btn btn-danger mb-2"
        :disabled="!expertMode"
        @click="healAndRetry"
      >Rerun all activities</button>
      <small>
        <div class="row">
          <div class="col-md-12">
            <div class="panel-body">
              <table class="table table-striped table-hover table-sm">
                <thead>
                  <tr>
                    <th>Failed activity</th>
                    <th>Error text</th>
                    <th>Root</th>
                    <th>Cause</th>
                    <th>Time</th>
                    <th>Definition</th>
                    <th>Instance</th>
                    <th>Fix</th>
                    <th>Delete instance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr :key="item.id" v-for="item in incidentsToShow">
                    <td style="word-break:break-all;">{{item.activityId}}</td>
                    <td
                      style="word-break:break-all;"
                    >{{ item.incidentMessage ? item.incidentMessage.substring(0,100)+'...' : ''}}</td>
                    <td>{{item.rootCauseIncidentId}}</td>
                    <td>{{item.causeIncidentId}}</td>
                    <td
                      style="word-break:break-all;"
                    >{{convertDateToHumanStyle(item.incidentTimestamp)}}</td>
                    <td style="word-break:break-all;">{{item.processDefinitionId}}</td>
                    <td style="word-break:break-all;">
                      <router-link
                        :to="{name:'processdetail', params:{ processInstanceId: item.processInstanceId}}"
                      >
                        <p class="card-text">
                          <b>{{item.processInstanceId}}</b>
                        </p>
                      </router-link>
                    </td>
                    <td style="word-break:break-all;">
                      <b-btn
                        size="sm"
                        class="ml-2"
                        variant="info"
                        @click="updateSingleJobRetry(item)"
                      >
                        <font-awesome-icon icon="redo"/>
                      </b-btn>
                    </td>
                    <td style="word-break:break-all;">
                      <b-btn
                        :disabled="!expertMode"
                        size="sm"
                        class="ml-2"
                        variant="warning"
                        @click="DeleteProccessInstance(item)"
                      >
                        <font-awesome-icon icon="trash"/>
                      </b-btn>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </small>
    </div>
    <div
      v-if="incidents.length == 0 && ready==true"
      class="alert alert-primary"
      role="alert"
    >No incidents!</div>
    <hr>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTrash, faRedo } from "@fortawesome/free-solid-svg-icons";
import * as api from "@/api/api";

library.add(faTrash);
library.add(faRedo);

export default {
  data() {
    return {
      containerClass: "",
      incidents: [],
      incidentsToShow: [],
      incidentsGlobalRoot: [],
      incidentsNotGlobalRoot: [],
      hideParentIncidents: false,
      ready: null,
      retries: 3,
      jobQuery: {
        withRetriesLeft: 0,
        executable: false,
        withException: true,
        noRetriesLeft: true,
        active: false
      },
      jobQuerySelected: {
        processInstanceId: [],
        activityId: []
      }
    };
  },
  watch: {
    hideParentIncidents(newValue, OldValue) {
      this.incidentsGlobalRoot = this.incidents.filter(function(obj) {
        return obj.globalRoot === true;
      });
      if (newValue == true) {
        this.incidentsToShow = this.incidentsGlobalRoot;
      }

      if (newValue == false) {
        this.incidentsToShow = this.incidents;
      }
    }
  },
  methods: {
    getAllIncidents() {
      api
        .getEntity("incident", "", "sortBy=incidentTimestamp&sortOrder=desc")
        .then(value => {
          this.incidents = value;
          this.ready = true;
          this.incidents.forEach(incident => {
            if (!incident.incidentMessage) {
              vm.$set(incident, "globalRoot", false);
            } else {
              vm.$set(incident, "globalRoot", true);
              this.incidentsToShow.push(incident);
            }
          });
          this.incidentsToShow = this.incidents;
        });
    },
    updateSingleJobRetry(item) {
      this.jobQuerySelected.processInstanceId = [];
      this.jobQuerySelected.activityId = [];
      this.jobQuerySelected.processInstanceId = item.processInstanceId;
      this.jobQuerySelected.activityId = item.activityId;
      this.$api()
        .post("/job/retries", {
          retries: this.retries,
          jobQuery: this.jobQuerySelected
        })
        .then(response => {
          var index = this.incidents.indexOf(item);
          if (index > -1) {
            this.incidents.splice(index, 1);
          }
          this.$notify({
            group: "foo",
            title: "Rerun started",
            type: "info"
          });
        });
    },
    healAndRetry() {
      this.retryAllIncidents();

      setTimeout(() => {
        this.getAllIncidents();
      }, 5000);
    },
    convertDateToHumanStyle: function(date) {
      return this.$momenttrue(date)
        .startOf("second")
        .fromNow();
    },
    retryAllIncidents() {
      this.$api()
        .post("/job/retries/", {
          retries: this.retries,
          jobQuery: this.jobQuery
        })
        .then(response => {
          if (response) {
            this.$notify({
              group: "foo",
              title: "Rerun started",
              type: "info"
            });
          }
        })
        .catch(error => {
          if (error) {
            this.$notify({
              group: "foo",
              title: "Rerun cant start :(",
              type: "error"
            });
          }
        });
    },
    DeleteProccessInstance(item) {
      this.$api()
        .delete("/process-instance/" + item.processInstanceId)
        .then(response => {
          if (response) {
            this.$notify({
              group: "foo",
              title: "Instance deleted",
              text: item.processInstanceId,
              type: "success"
            });
          }
          var index = this.incidents.indexOf(item);
          if (index > -1) {
            this.incidents.splice(index, 1);
          }
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Instance NOT deleted",
            text: error,
            type: "error"
          });
        });
    }
  },

  mounted: function() {
    this.getAllIncidents();
  },
  computed: {
    expertMode() {
      return this.$store.state.expertMode;
    }
  }
};
</script>

<style>
.router-link-exact-active {
  font-style: bold;
  font-size: 24px;
}
</style>
