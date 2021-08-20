<template>
  <div id="DefinitionsIncidents">
    <b-form inline>
      <label class="mr-2">Failed activity</label>
      <b-input v-model="selectedActivity" class="mb-2 mr-sm-2 mb-sm-0"/>
      <b-button @click="getDefinitionsIncidents" variant="success">Search</b-button>
      <b-button class="ml-2" v-if="this.selectedActivity"
                @click="downloadBusinessKeys"
                variant="outline-primary">Get businessKeys
      </b-button>
      <b-button @click="clear" variant="link">Clear</b-button>
    </b-form>
    <small>Total {{incidents.length}}</small>
    <table class="table table-striped table-sm indexed">
      <thead>
        <tr>
          <th>#</th>
          <th>Id</th>
          <th>Start time</th>
          <th>Failed activity</th>
          <th>Message</th>
          <th>Instance</th>
        </tr>
      </thead>
      <tbody>
        <tr :key="item.id" v-for="item in incidents">
          <td></td>
          <td>{{item.id}}</td>
          <td>{{convertDateToHumanStyle(item.incidentTimestamp)}}</td>

          <td>{{item.activityId}}</td>
          <td>{{item.incidentMessage}}</td>
          <td>
            <router-link
              :to="{name:'processdetail', params:{ processInstanceId: item.processInstanceId}, query: {baseurl}}"
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
  props: ["definitionId", "clickedActivity"],
  data() {
    return {
      incidents: [],
      selectedActivity: null
    };
  },
  watch: {
    clickedActivity() {
      this.selectedActivity = this.clickedActivity
      this.getDefinitionsIncidents()
    }
  },
  mounted() {
    this.getDefinitionsIncidents();
  },
  methods: {
    getDefinitionsIncidents() {
      this.$api()
        .get(`/incident?processDefinitionId=${this.definitionId}${this.selectedActivity ? `&activityId=${this.selectedActivity}` : ''}`)
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
    },
    downloadBusinessKeys() {
      this.$api()
      .post("/process-instance", {
        processDefinitionId: this.definitionId,
        activityIdIn: [this.selectedActivity],
        incidentType: 'failedJob'
      })
      .then(response => {
        const businessKeys = response.data.map(it => it.businessKey).join('\n')
        const url = window.URL.createObjectURL(new Blob([businessKeys]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${this.selectedActivity}-incidents`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch(error => {
        this.$notify({
          group: "foo",
          title: 'Cannot get filedJob process business keys for selected activity',
          text: error,
          type: "error"
        });
      });
    },
    clear() {
      this.selectedActivity = null
      this.getDefinitionsIncidents()
    }
  },
  computed: {
    baseurl() {
      return this.$store.state.baseurl;
    }
  }

};
</script>

<style>
.indexed {
  counter-reset: serial-number; /* Set the serial number counter to 0 */
}

.indexed td:first-child:before {
  counter-increment: serial-number; /* Increment the serial number counter */
  content: counter(serial-number); /* Display the counter */
}
</style>
