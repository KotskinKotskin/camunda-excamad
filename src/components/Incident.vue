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
          v-on:change="activityChanged"
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
      <div class="d-flex justify-content-end">
        <b-btn size="sm" variant="link" @click="resetFilters">Clear filters</b-btn>
        <b-btn size="sm" variant="link" @click="resetSorting">Clear sorting</b-btn>
      </div>
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
                          <input type="text" ref="filter" @keyup="headerFilterKeyUp(header.value, $event.target.value)">
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
import {library} from "@fortawesome/fontawesome-svg-core";
import {faRedo, faTrash} from "@fortawesome/free-solid-svg-icons";
import * as api from "@/api/api";
import {debounce} from "lodash";

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

const IncidentType = {
  FailedExternalTask: 'failedExternalTask'
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
      selectedActivity: null,
      containerClass: "",
      incidents: [],
      jobsIds: [],
      countOfJobs: 0,
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
      },
      debouncedUpdateFilter: null
    };
  },
  created() {
    this.debouncedUpdateFilter = debounce(this.updateFilter, 500)
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
        this.incidentsToShow = [...this.incidents];
      }
    }
  },
  methods: {
    resetSorting() {
      this.sort.header = '';
      this.sort.direction = '';
      this.incidentsToShow = this.selectedActivity ?
          [...this.incidents.filter(incident => incident.activityId === this.selectedActivity)] :
          [...this.incidents];
    },
    resetFilters() {
      this.$refs.filter.forEach(element => {
        element.value = "";
      });
      this.filters.forEach(filter => {
        filter.value = "";
      });
      this.filter();
    },
    headerFilterKeyUp(headerType, text) {
      this.debouncedUpdateFilter(headerType, text);
    },
    updateFilter(headerType, text) {
      const filter = this.filters.find(filter => filter.type === headerType);
      filter.value = text;
      this.filter();
    },
    filter() {
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
          case FieldName.Definition:
            return incidents.filter(incident => incident.processDefinitionId ? incident.processDefinitionId.toLowerCase().includes(lowerCaseText) : false);
          case FieldName.Instance:
            return incidents.filter(incident => incident.processInstanceId ? incident.processInstanceId.toLowerCase().includes(lowerCaseText) : false);
        }
      }

      let incidents = this.selectedActivity ? [...this.incidents.filter(incident => incident.activityId === this.selectedActivity)] : [...this.incidents];

      this.filters.forEach(filter => {
        incidents = applyFilter(filter, incidents);
      });

      this.incidentsToShow = incidents;
      this.countOfJobs = this.selectedActivity ? this.incidentsToShow.length : 0;
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
          this.incidentsToShow = [...this.incidents];
        });
    },
    notifyError(title, error) {
      this.$notify({
        group: "foo",
        title: title,
        text: error,
        type: "error"
      });
    },
    notifySuccess(message) {
      this.$notify({
        group: "foo",
        title: message,
        type: "success"
      });
    },
    notifyInfo(message) {
      this.$notify({
        group: "foo",
        title: message,
        type: "info"
      });
    },
    async loadExternalTaskJobs(processInstanceId) {
      return this.$api().get("/external-task?processInstanceId=" + processInstanceId);
    },
    async getExternalJobByProcessInstanceId(processInstanceId) {
      return (await this.loadExternalTaskJobs(processInstanceId)).data
          .find(externalJob => externalJob.processInstanceId === processInstanceId);
    },
    async retryExternalTask(processInstanceId) {
       const externalJobId = (await this.getExternalJobByProcessInstanceId(processInstanceId))?.id;

      if (externalJobId) {
        const putObj = {
          retries: 1,
          processInstanceIds: [processInstanceId],
          externalTaskIds: [externalJobId]
        }

        this.$api().put("/external-task/retries", putObj)
            .then(() => this.notifySuccess('External task retries setuped'))
            .catch(error => this.notifyError('External task retries failed', error));
      } else {
        this.notifyError('External task not found');
      }
    },
    retryJob(item) {
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
            const index = this.incidents.indexOf(item);
            if (index > -1) {
              this.incidents.splice(index, 1);
            }
            this.notifyInfo("Rerun started");
          });
    },
    async updateSingleJobRetry(item) {
      if (item.incidentType === IncidentType.FailedExternalTask) {
        await this.retryExternalTask(item.processInstanceId);
      } else {
        this.retryJob(item);
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
          .put("/external-task/retries", {
            retries: 1,
            externalTaskQuery: {
              withRetriesLeft: 0,
              executable: false,
              withException: true,
              noRetriesLeft: true,
              active: false
            }
          })
          .then(() => this.notifySuccess("Restarted all external tasks"))
          .catch(error => this.notifyError('Failed external task retries', error));

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
    async getFistNJobs() {
      this.jobsIds = [];
      const externalTaskProcessInstanceIds = [];

      const incidents = this.incidentsToShow.slice(0, this.countOfJobs);

      for (const incident of incidents) {
        if (incident.incidentType === IncidentType.FailedExternalTask) {
          externalTaskProcessInstanceIds.push(incident.processInstanceId)
        } else {
          this.jobsIds.push(incident.id);
        }
      }

      if (this.jobsIds.length > 0) {
        this.$api()
            .post("/job/retries", {
              retries: 1,
              jobIds: this.jobsIds
            })
            .then(() => this.notifySuccess("Restarted " + this.jobsIds.length + " jobs"))
            .catch(error => this.notifyError('Failed job retries', error));
      }

      if (externalTaskProcessInstanceIds.length > 0) {
        this.$api()
            .put("/external-task/retries", {
              retries: 1,
              externalTaskQuery: {
                activityId: this.activityIdForJobSearch,
                processInstanceIdIn: externalTaskProcessInstanceIds
              }
            })
            .then(() => this.notifySuccess("Restarted " + externalTaskProcessInstanceIds.length + " external tasks"))
            .catch(error => this.notifyError('Failed external task retries', error));
      }

      this.getAllIncidents();
    },
    activityChanged(selectedItem) {
      this.selectedActivity = selectedItem;
      this.$refs.filter.forEach(element => {
        element.value = "";
      });
      this.filters.forEach(filter => {
        filter.value = "";
      });
      this.filter();
    },
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
