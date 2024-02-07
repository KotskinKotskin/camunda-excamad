<template>
  <div class>
    <b-alert v-if="incidents.length < 0" show variant="primary">No incidents</b-alert>
    <b-alert v-if="incidents.length > 0" show variant="danger">
      <li :key="item.id" v-for="item in incidents">
        <b>
          <i>{{convertDateToHumanStyle(item.incidentTimestamp)}}</i>
          {{item.activityId}}
        </b>
        : {{item.incidentMessage}}.
        <br>
        <a :href="getStacktraceUrl(item)" target="_black">Stacktrace.</a>
        <b-btn size="xl" class="ml-2" variant="secondary" @click="retryClicked(item)">
          <font-awesome-icon icon="redo"/>
        </b-btn>
      </li>
    </b-alert>
  </div>
</template>


<script>
import * as api from "@/api/api";
export default {
  name: "DetailIncident",
  props: ["processInstanceId"],
  data() {
    return {
      incidents: [],
      retries: 1,
      jobQuerySelected: {
        processInstanceId: [],
        activityId: []
      }
    };
  },
  mounted() {
    setTimeout(() => {
      this.getAllIncidents();
    }, 200);
  },
  methods: {
    getAllIncidents() {
      api
        .getEntity(
          "incident",
          "",
          "sortBy=incidentTimestamp&sortOrder=desc&&processInstanceId=" +
            this.processInstanceId
        )
        .then(value => (this.incidents = value));
    },
    convertDateToHumanStyle: function(date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    },

    retryClicked(item) {
      if (item.incidentType === "failedExternalTask") {
        this.$emit('retryExternalTask', item.processInstanceId);
      } else {
        this.updateSingleJobRetry(item);
      }
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
          this.$notify({
            group: "foo",
            title: "Incident retryed",
            text: "Wait retry",
            type: "success"
          });
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Something bad happend",
            text: error,
            type: "error"
          });
        });
      setTimeout(() => {
        this.getAllIncidents();
      }, 500);
    },
    getStacktraceUrl: function(item) {
      var str = this.$store.state.baseurl;
      var stacktrackeurl =
        str +
        "job/" +
        item.configuration +
        "/stacktrace";
      return stacktrackeurl;
    }
  }
};
</script>
