<template>
  <div id="detailJobs">
    <h3>Active jobs (max 300)</h3>
    <b-card id="historyDetails" bg-variant="light" text-variant="dark">
      <table class="table table-striped table-hover table-sm">
        <thead>
          <tr>
            <th>Id</th>
            <th>Retries left</th>
            <th>Due Date</th>
            <th>Suspended</th>
            <th>Exception</th>
            <th>Stacktrace</th>
            <th>Execute</th>
          </tr>
        </thead>
        <tbody>
          <tr :key="item.id" v-for="item in jobsArray.slice(0,100)">
            <td>{{item.id}}</td>
            <td>{{item.retries}}</td>
            <td>{{convertDateToHumanStyle(item.dueDate)}}</td>
            <td>{{item.suspended}}</td>
            <td>{{item.exceptionMessage}}</td>
            <td>
              <b-btn
                v-if="item.exceptionMessage"
                target="_blank"
                :href="getStackTrace(item.id)"
                size="sm"
                variant="link"
              >Stacktrace</b-btn>
            </td>
            <td>
              <b-btn @click="executeJob(item.id)" size="sm" variant="outline-danger">Execute now</b-btn>
            </td>
          </tr>
        </tbody>
      </table>
    </b-card>
    <h3 class="mt-2">History jobs</h3>
    <b-card id="historyDetails" bg-variant="light" text-variant="dark">
      <v-client-table :data="historyJobsArray" :columns="columns" :options="options"></v-client-table>
    </b-card>
  </div>
</template>
;
<script>
export default {
  name: "DetailJobs",
  props: ["processInstanceId"],

  data() {
    return {
      jobsArray: [],
      historyJobsArray: [],
      options: {
        theme: "bootstrap4",
        template: "footerPagination",
        filterByColumn: true,
        clientMultiSorting: true,
        toggleGroups: true,
        pagination: { chunk: 30, edge: true },
        perPage: 30,
        perPageValues: [30, 60, 90, 120],
        highlightMatches: true,
        skin: "table table-bordered table-hover table-sm",
        groupBy: "activityId",
        sortable: [
          "jobId",
          "id",
          "activityId",
          "timestamp",
          "jobRetries",
          "jobDefinitionType",
          "jobDueDate",
          "jobExceptionMessage",
          "creationLog",
          "failureLog",
          "successLog",
          "deletionLog"
        ],
        filterable: [
          "jobId",
          "id",
          "activityId",
          "timestamp",

          "jobDefinitionType",
          "jobDueDate",
          "creationLog",
          "successLog",
          "failureLog",
          "deletionLog"
        ]
      },
      columns: [
        "jobId",
        "id",
        "activityId",
        "timestamp",
        "jobRetries",
        "jobDefinitionType",
        "jobDueDate",
        "jobExceptionMessage",
        "creationLog",
        "failureLog",
        "successLog",
        "deletionLog"
      ],
      stackTrace: ""
    };
  },
  mounted() {
    setTimeout(() => {
      this.getCurrentJobs();
    }, 200);
    setTimeout(() => {
      this.getHistoryJobs();
    }, 200);
  },
  computed: {
    baseurl() {
      return this.$store.state.baseurl;
    }
  },
  methods: {
    convertDateToHumanStyle: function (date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return cal;
    },
    getCurrentJobs() {
      this.$api()
        .get("/job?processInstanceId=" + this.processInstanceId)
        .then(response => {
          this.jobsArray = response.data;
        });
    },
    getHistoryJobs() {
      this.$api()
        .get("/history/job-log?processInstanceId=" + this.processInstanceId)
        .then(response => {
          this.historyJobsArray = response.data;

          this.historyJobsArray.forEach(element => {
            element.timestamp = this.convertDateToHumanStyle(element.timestamp);
            for (var key in element) {
              if (typeof element[key] === "boolean") {
                if (element[key]) {
                  element[key] = element[key].toString();
                }
              }
            }
          });
        });
    },
    executeJob(jobId) {
      this.$api()
        .post("/job/" + jobId + "/execute")
        .then(() => {
          this.$notify({
            group: "foo",
            title: " Executed!",
            text: jobId,
            type: "success"
          });
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Not executed!",
            text: error,
            type: "error"
          });
        });
    },
    getStackTrace(jobId) {
      var url = this.baseurl + "job/" + jobId + "/stacktrace";
      return url;
    }
  }
};
</script>

<style scoped>
.VueTables {
  font-size: 10px;
  word-break: break-all;
}
.VueTables__filters-row {
  font-size: 10px;
}
.tr {
  font-size: 12px;
}
.form-control {
  display: block;
  width: 96%;
  height: calc(2.25rem + 2px);
  /* padding: .375rem .75rem; */
  /* font-size: 1rem;
  /* line-height: 1.5; */
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  -webkit-transition: border-color 0.15s ease-in-out,
    -webkit-box-shadow 0.15s ease-in-out;
  transition: border-color 0.15s ease-in-out,
    -webkit-box-shadow 0.15s ease-in-out;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out,
    -webkit-box-shadow 0.15s ease-in-out;
}
</style>
