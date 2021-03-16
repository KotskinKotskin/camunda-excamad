<template>
  <div id="incidentsHistory">
    <h3>Incidents history</h3>
    <p v-if="incidents.length==0">No incidents in history</p>
    <b-card v-if="incidents.length>0" id="historyDetails" bg-variant="light" text-variant="dark">
      <div id="people">
        <v-client-table :data="incidents" :columns="columns" :options="options"></v-client-table>
      </div>
    </b-card>
  </div>
</template>

<script>
import * as api from "@/api/api";
export default {
  name: "IncidentsHistory",
  props: ["processInstanceId"],
  data() {
    return {
      incidents: [],
      columns: ["id", "createTime", "endTime", "activityId", "incidentMessage"],
      options: {
        theme: "bootstrap4",
        template: "footerPagination",
        filterByColumn: true,
        clientMultiSorting: true,
        pagination: { chunk: 30, edge: true },
        perPage: 30,
        perPageValues: [30, 60, 90, 120],
        highlightMatches: true,
        skin: "table table-bordered table-hover table-sm",
        sortable: ["createTime", "endTime"],
        filterable: ["createTime", "endTime", "activityId", "incidentMessage"]
      }
    };
  },
  mounted() {
    this.getIncidents();
  },
  methods: {
    convertDateToHumanStyle: function(date) {
      var cal = this.$momenttrue(date).format("DD.MM.YYYY, H:mm:ss");

      return cal;
    },
    getIncidents() {
      this.$api()
        .get(
          "/history/incident?sortBy=createTime&sortOrder=asc&processInstanceId=" +
            this.processInstanceId
        )
        .then(response => {
          this.incidents = response.data;
          this.incidents.forEach(element => {
            if (element.createTime) {
              element.createTime = this.convertDateToHumanStyle(
                element.createTime
              );
            }
            if (element.endTime) {
              element.endTime = this.convertDateToHumanStyle(element.endTime);
            }
          });
        });
    }
  }
};
</script>

<style>
</style>
