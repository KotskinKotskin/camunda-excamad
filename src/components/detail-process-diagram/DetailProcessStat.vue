<template>
  <div id="processStat">
    <b-card bg-variant="light" text-variant="dark">
      <b-row>
        <b-col>
          <h3>
            {{processHistoryDetail.id}}
            <router-link
              :to="{name:'definition', params:{ definitionId: processHistoryDetail.processDefinitionId}}"
            >{{ processHistoryDetail.processDefinitionId }}</router-link>
          </h3>
        </b-col>
        <b-col v-if="processInstanceRuntimeData" col lg="2" class="text-right">
          <b-btn
            v-b-tooltip.hover
            title="Suspending a process instance means that the execution is stopped, so the token state will not change. However, actions that do not change token state, like setting or removing variables, etc. will still succeed.

Tasks belonging to this process instance will also be suspended. This means that any actions influencing the tasks' lifecycles will fail"
            @click="suspendCurrentId()"
            size="lg"
            class="mb-3"
            :variant="getVariantForSuspend()"
          >
            <font-awesome-icon :icon="getIcon()"/>
            {{getText()}}
          </b-btn>
        </b-col>
      </b-row>
      <h4 v-if="processHistoryDetail.superProcessInstanceId">Called from
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
import { library } from "@fortawesome/fontawesome-svg-core";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
library.add(faPlay, faPause);
export default {
  name: "DetailProcessStat",
  props: ["processInstanceId"],
  data() {
    return {
      processHistoryDetail: "",
      processInstanceRuntimeData: null
    };
  },
  methods: {
    suspendCurrentId() {
      this.$api()
        .put(
          "/process-instance/" +
            this.processInstanceRuntimeData.id +
            "/suspended",
          {
            suspended: !this.processInstanceRuntimeData.suspended
          }
        )
        .then(response => {
          this.$notify({
            group: "foo",
            title: this.processInstanceRuntimeData.suspended
              ? "Unsuspended!"
              : "Suspended",
            type: "success"
          });
          this.getProcessDetail();
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Some problem!",
            text: error.data,
            type: "error"
          });
          this.getProcessDetail();
        });
    },
    getProcessDetail() {
      this.$api()
        .get("/history/process-instance/" + this.processInstanceId)
        .then(response => {
          this.processHistoryDetail = response.data;
          if (this.processHistoryDetail.state != "COMPLETED") {
            this.getProcessRuntimeDetail();
          }
        });
    },
    getProcessRuntimeDetail() {
      this.$api()
        .get("/process-instance/" + this.processInstanceId)
        .then(response => {
          this.processInstanceRuntimeData = response.data;
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
    getVariantForSuspend() {
      if (this.processInstanceRuntimeData.suspended) {
        return "warning";
      } else return "primary";
    },
    getIcon() {
      if (this.processInstanceRuntimeData.suspended) {
        return "play";
      } else return "pause";
    },
    getText() {
      if (this.processInstanceRuntimeData.suspended) {
        return "Unsuspend";
      } else return "Suspend";
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

