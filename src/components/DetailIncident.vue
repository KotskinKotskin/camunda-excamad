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
      incidents: []
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
    getStacktraceUrl: function(item) {
      var str = this.$store.state.baseurl.slice(0, -6);
      var stacktrackeurl =
        str +
        "/api/engine/engine/default/job/" +
        item.configuration +
        "/stacktrace";
      return stacktrackeurl;
    }
  }
};
</script>
