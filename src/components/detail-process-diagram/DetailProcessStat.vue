<template>
  <div id="processStat">
    <b-card bg-variant="light" text-variant="dark">
      <h3>
        {{processHistoryDetail.id}}
        <router-link
          :to="{name:'diagram', params:{ diagramKey: processHistoryDetail.processDefinitionKey}}"
        >{{processHistoryDetail.processDefinitionKey}}</router-link>
      </h3>
      <h4 v-if="processHistoryDetail.superProcessInstanceId">Вызван из процесса
        <router-link
          :to="{name:'processdetail', params:{ processInstanceId: processHistoryDetail.superProcessInstanceId}}"
        >
          <b>{{processHistoryDetail.superProcessInstanceId}}</b>
        </router-link>
      </h4>
      <b-badge class="mb-3" :variant="getVariant()">{{processHistoryDetail.state}}</b-badge>

      <b-container class="bv-example-row">
        <b-row>
          <b-col>
            <h6>Stared {{convertDateToHumanStyle(processHistoryDetail.startTime)}}</h6>
          </b-col>
          <b-col>
            <h6
              v-if="processHistoryDetail.endTime"
            >Ended {{convertDateToHumanStyle(processHistoryDetail.endTime)}}</h6>
          </b-col>
          <b-col>
            <h6
              v-if="processHistoryDetail.durationInMillis"
            >Duration {{durationInHour(processHistoryDetail.durationInMillis)}}</h6>
          </b-col>
        </b-row>
      </b-container>

      <hr>
      <b-container class="bv-example-row">
        <b-row>
          <b-col>Business key {{processHistoryDetail.businessKey}}</b-col>
          <b-col>Version {{processHistoryDetail.processDefinitionVersion}}</b-col>
        </b-row>
      </b-container>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "DetailProcessStat",
  props: ["processInstanceId"],
  data() {
    return {
      processHistoryDetail: ""
    };
  },
  methods: {
    getProcessDetail() {
      this.$api()
        .get("/history/process-instance/" + this.processInstanceId)
        .then(response => {
          this.processHistoryDetail = response.data;
        });
    },
    durationInHour: function(duration) {
      var timeInHour = duration / 3600000;
      var abc = Math.round(timeInHour * 100) / 100;
      var toReturn = abc + " hours";
      return toReturn;
    },
    getVariant: function() {
      if (this.processHistoryDetail.state == "ACTIVE") {
        return "success";
      }
      if (this.processHistoryDetail.state == "SUSPENDED") {
        return "warning";
      }
      if (this.processHistoryDetail.state == "COMPLETED") {
        return "primary";
      }
      if (
        (this.processHistoryDetail.state == "EXTERNALLY_TERMINATED") |
        "INTERNALLY_TERMINATED"
      ) {
        return "danger";
      }
    },

    convertDateToHumanStyle: function(date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    }
  },
  mounted() {
    if (this.$route.query.processId) {
      this.$route.query.processId = this.$route.push({
        name: "DetailProcessView",
        params: { processInstanceId: this.$route.query.processId }
      });
    }
    this.getProcessDetail();
  }
};
</script>

