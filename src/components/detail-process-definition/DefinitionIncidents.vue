<template>
  <div id="DefinitionsIncidents">
    <small>Total {{incidents.length}}</small>
    <table class="table table-striped table-sm">
      <thead>
        <tr>
          <th>Id</th>
          <th>Start time</th>
          <th>Failed activity</th>
          <th>Message</th>
          <th>Instance</th>
        </tr>
      </thead>
      <tbody>
        <tr :key="item.id" v-for="item in incidents">
          <td>{{item.id}}</td>
          <td>{{convertDateToHumanStyle(item.incidentTimestamp)}}</td>

          <td>{{item.activityId}}</td>
          <td>{{item.incidentMessage}}</td>
          <td>
            <router-link
              :to="{name:'processdetail', params:{ processInstanceId: item.processInstanceId}}"
            >
              <b>{{item.processInstanceId}}</b>
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "DefinitionIncidents",
  props: ["definitionId"],
  data() {
    return {
      incidents: []
    };
  },
  mounted() {
    this.getDefinitionsIncidents();
  },
  methods: {
    getDefinitionsIncidents() {
      this.$api()
        .get("/incident?processDefinitionId=" + this.definitionId)
        .then(response => {
          this.incidents = response.data;
        });
    },
    convertDateToHumanStyle: function(date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    }
  }
};
</script>

<style>
</style>
