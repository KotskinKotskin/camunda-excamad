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
      <b-form class="mb-2" inline>
        <b-form-input
          v-on:change="countErrorJobs"
          v-model="activityIdForJobSearch"
          list="my-list-id"
        ></b-form-input>

        <datalist id="my-list-id">
          <option v-bind:key="item" v-for="item in filterFailedActivity">{{ item }}</option>
        </datalist>

        <b-form-input class="ml-1" v-model="countOfJobs" type="number"></b-form-input>
        <b-btn class="ml-1" variant="warning" @click="getFistNJobs">Rerun {{countOfJobs}} jobs</b-btn>
        <b-btn
          class="ml-1"
          variant="danger"
          @click="healAndRetry"
        >Rerun all activities</b-btn>
      </b-form>
      <small>
        <div class="row">
          <div class="col-md-12">
            <div class="panel-body">
              <table class="table table-striped table-hover table-sm">
                <thead>
                  <tr>
                    <th v-for="header in headers" :key="header.text" class="sortable-header table-header">
                      <div>
                        <div @click="headerClicked(header.value)">
                          {{ header.text }}
                          <span>{{ getSortArrow(header.value) }}</span>
                        </div>
                        <div v-if="header.hasFilter">
                          <input type="text" @keyup.enter="updateFilter(header.value, $event.target.value)">
                        </div>
                      </div>
                    </th>
                    <th class="table-header">Fix</th>
                    <th class="table-header">Delete instance</th>
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
                        <font-awesome-icon icon="redo" />
                      </b-btn>
                    </td>
                    <td style="word-break:break-all;">
                      <b-btn
                        size="sm"
                        class="ml-2"
                        variant="warning"
                        @click="DeleteProccessInstance(item)"
                      >
                        <font-awesome-icon icon="trash" />
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
    <hr />
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTrash, faRedo } from "@fortawesome/free-solid-svg-icons";
import * as api from "@/api/api";

library.add(faTrash);
library.add(faRedo);

const FieldName = {
  FailedActivity: 'FailedActivity',
  ErrorText: 'ErrorText',
  Root: 'Root',
  Cause: 'Cause',
  Time: 'Time',
  Definition: 'Definition',
  Instance: 'Instance'
};

export default {
  data() {
    return {
      headers: [
        { text: 'Failed activity', value: FieldName.FailedActivity, hasFilter: true },
        { text: 'Error text', value: FieldName.ErrorText, hasFilter: true },
        { text: 'Root', value: FieldName.Root, hasFilter: true },
        { text: 'Cause', value: FieldName.Cause, hasFilter: true },
        { text: 'Time', value: FieldName.Time, hasFilter: false },
        { text: 'Definition', value: FieldName.Definition, hasFilter: true },
        { text: 'Instance', value: FieldName.Instance, hasFilter: true }
      ],
      filters: [
        { type: FieldName.FailedActivity, value: null },
        { type: FieldName.ErrorText, value: null },
        { type: FieldName.Root, value: null },
        { type: FieldName.Cause, value: null },
        { type: FieldName.Definition, value: null },
        { type: FieldName.Instance, value: null }
      ],
      containerClass: "",
      incidents: [],
      jobsIds: [],
      countOfJobs: 25,
      activityIdForJobSearch: null,
      incidentsToShow: [],
      incidentsGlobalRoot: [],
      incidentsNotGlobalRoot: [],
      hideParentIncidents: false,
      sort: {
        header: '',
        direction: ''
      },
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
    hideParentIncidents(newValue) {
      this.incidentsGlobalRoot = this.incidents.filter(function (obj) {
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
    updateFilter(headerType, text) {
      const filter = this.filters.find(filter => filter.type === headerType);
      filter.value = text;
      this.filter();
    },
    filter() {
      let incidents = [...this.incidents];
      const applyFilter = (filter, incidents) => {
        if (!filter.value) {
          return incidents;
        }

        const lowerCaseText = filter.value.toLowerCase();
        switch (filter.type) {
          case FieldName.FailedActivity:
            return incidents.filter(incident => incident.activityId ? incident.activityId.toLowerCase().includes(lowerCaseText) : false);
          case FieldName.ErrorText:
            return incidents.filter(incident => incident.incidentMessage ? incident.incidentMessage.toLowerCase().includes(lowerCaseText) : false);
          case FieldName.Root:
            return incidents.filter(incident => incident.rootCauseIncidentId ? incident.rootCauseIncidentId.toLowerCase().includes(lowerCaseText) : false);
          case FieldName.Cause:
            return incidents.filter(incident => incident.causeIncidentId ? incident.causeIncidentId.toLowerCase().includes(lowerCaseText) : false);
        }
      }

      this.filters.forEach(filter => {
        incidents = applyFilter(filter, incidents);
      });

      this.incidentsToShow = incidents;
    },
    getSortArrow(header) {
      if (header === this.sort.header) {
        return this.sort.direction === "asc" ? "↑" : "↓";
      } else {
        return '';
      }
    },
    headerClicked(header) {
      if (this.sort.header === header) {
        this.sort.direction = this.sort.direction === "asc" ? "desc" : "asc";
      } else {
        this.sort.header = header;
        this.sort.direction = "desc";
      }

      this.sortIncidents();
    },
    sortIncidents() {
      const propMapping = new Map([
        [FieldName.FailedActivity, "activityId"],
        [FieldName.ErrorText, "incidentMessage"],
        [FieldName.Root, "rootCauseIncidentId"],
        [FieldName.Cause, "causeIncidentId"],
        [FieldName.Time, "incidentTimestamp"],
        [FieldName.Definition, "processDefinitionId"],
        [FieldName.Instance, "processInstanceId"]
      ]);

      const sortKey = propMapping.get(this.sort.header);

      if (!sortKey) {
        this.$notify({
          group: "foo",
          title: "Error occurred",
          text: `Unknown sort key: ${this.sort.header}`,
          type: "error"
        })
        return;
      }

      this.incidentsToShow.sort((a, b) => {
        const aValue = a[sortKey] || "";
        const bValue = b[sortKey] || "";
        return this.sort.direction === "asc" ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue) ;
      });
    },
    getAllIncidents() {
      api
        .getEntity("incident", "", "sortBy=incidentTimestamp&sortOrder=desc")
        .then(value => {
          this.incidents = value;
          var vm = this;
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
    async loadExternalTaskJobs(processInstanceId) {
      return this.$api()
          .get("/external-task?processInstanceId=" + processInstanceId);
    },
    async updateSingleJobRetry(item) {
      if (item.incidentType === "failedExternalTask") {
        const externalTaskJobs = (await this.loadExternalTaskJobs(item.processInstanceId)).data;
        const externalJob = externalTaskJobs.find(externalJob => externalJob.processInstanceId === item.processInstanceId);

        const notifyError = (error) => this.$notify({
          group: "foo",
          title: "Retries NOT setuped",
          text: error,
          type: "error"
        });

        if (externalJob) {
          const putObj = {
            retries: 1,
            processInstanceIds: [item.processInstanceId],
            externalTaskIds: [externalJob.id]
          }
          this.$api().put("/external-task/retries", putObj).then(response => {

            this.$notify({
              group: "foo",
              title: " Retries setuped",
              type: "success"
            });
          }).catch(error => notifyError(error))
        } else {
          notifyError('External task not found');
        }
      } else {
        this.jobQuerySelected.processInstanceId = [];
        this.jobQuerySelected.activityId = [];
        this.jobQuerySelected.processInstanceId = item.processInstanceId;
        this.jobQuerySelected.activityId = item.activityId;
        this.$api()
          .post("/job/retries", {
            retries: this.retries,
            jobQuery: this.jobQuerySelected
          })
          .then(() => {
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
      }
    },
    healAndRetry() {
      this.retryAllIncidents();

      setTimeout(() => {
        this.getAllIncidents();
      }, 5000);
    },
    convertDateToHumanStyle: function (date) {
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
    },
    getFistNJobs() {
      if (this.countOfJobs > 100) {
        this.countOfJobs = 100
      }
      this.jobsIds = [];
      var postBody = {
        withException: true,
        noRetriesLeft: true,
        activityId: this.activityIdForJobSearch
      };
      this.$api().post("/job?maxResults=" + this.countOfJobs, postBody).then(response => {
        if (response.data != null && response.data.length > 0) {
          response.data.forEach(element => {
            this.jobsIds.push(element.id);
          });
          var postBodyJobsId = {
            jobIds: this.jobsIds,
            retries: 1
          }
          this.$api().post("/job/retries", postBodyJobsId).then(() => {

            this.$notify({
              group: "foo",
              title: "Restarted " + this.jobsIds.length + " jobs",
              type: "success"
            });
            this.getAllIncidents();
          }).catch(error => {
            this.$notify({
              group: "foo",
              title: "Fail",
              text: error,
              type: "error"
            })
          })
        }
      })
    },
    countErrorJobs: function (selectedItem) {
      this.$api().get("job/count?activityId=" + selectedItem).then(response => {
        this.countOfJobs = response.data.count;
      })
    }
  },

  mounted: function () {
    this.getAllIncidents();
  },
  computed: {
    filterFailedActivity() {
      var array = [];
      this.incidents.forEach(element => {
        array.push(element.activityId);
      })

      var uniqueArray = array.filter(function (item, pos) {
        return array.indexOf(item) == pos;
      })

      return uniqueArray
    },
  }
};
</script>

<style>
.router-link-exact-active {
  font-style: bold;
  font-size: 24px;
}
.sortable-header {
  cursor: pointer;
}
.table thead th.table-header {
  vertical-align: top;
}
</style>
