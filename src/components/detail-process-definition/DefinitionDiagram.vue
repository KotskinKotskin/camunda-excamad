<template>
  <div id="definitionDigaram">
  
    <diagram
      :key="diagramKey"
      class="mt-2"
      :suspendedJobs="suspendedJobs"
      :processDefinitionId="definitionId"
      :statistics="statistics"
      v-on:clickedOnDiagram="PassDiagramClick"
    ></diagram>
    <b-card
      class="mt-2"
      v-if="clickedElement !=null && clickedElement.$type !='bpmn:UserTask'"
      bg-variant="light"
      text-variant="dark"
    >
      <b-btn
        size="sm"
        v-if="clickedElement !=null"
        :disabled="!expertMode()"
        :variant="getVariant()"
        @click="suspendCurrentJobDefinition()"
      >
        <font-awesome-icon :icon="getIcon()"/>
        {{getText()}} {{clickedElement.id}} ({{clickedElement.name}})
      </b-btn>
      <b-form-checkbox
        v-b-tooltip.hover
        :disabled="!expertMode()"
        class="ml-3"
        title="When the value is set to true, all jobs of the job definitions with the given process definition id will be activated or suspended and when the value is set to false, the suspension state of all jobs of the job definitions with the given process definition id will not be updated."
        size="sm"
        v-model="includeJobs"
      >Include current jobs</b-form-checkbox>
    </b-card>
  </div>
</template>

<script>
import * as api from "@/api/api";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import { AtomSpinner } from "epic-spinners";
library.add(faPlay, faPause);
export default {
  name: "DefinitionDiagram",
  props: ["definitionId"],
  components: {
    AtomSpinner
  },
  data() {
    return {
      diagramKey: 0,
      jobDefinitions: null,
      suspendedJobs: null,
      ready: false,
      incidents: null,
      includeJobs: false,
      clickedElement: null,
      clickedJobDefinition: null,
      processActivityToShowArray: [],
      statistics: {}
    };
  },
  mounted() {
    this.getJobs();
  },
  methods: {
    expertMode() {
      return this.$store.state.expertMode;
    },
    PassDiagramClick(payload) {
      this.clickedElement = payload;
      this.clickedJobDefinition = {};
      this.getJobStatus();
      this.$emit("DefinitionDiagramClick", payload);
    },
    getJobStatus() {
      this.$api()
        .post("/job-definition", {
          activityIdIn: [this.clickedElement.id],
          processDefinitionId: this.definitionId
        })
        .then(response => {
          this.clickedJobDefinition = response.data;
        });
    },
    suspendCurrentJobDefinition() {
      this.$api()
        .put(
          "/job-definition/" + this.clickedJobDefinition[0].id + "/suspended",
          {
            executionDate: null,
            includeJobs: this.inculdeCurrentInstance,
            suspended: !this.clickedJobDefinition[0].suspended
          }
        )
        .then(response => {
          this.$notify({
            group: "foo",
            title: this.clickedJobDefinition.suspended
              ? "Unsuspended!"
              : "Suspended",
            type: "success"
          });
          this.diagramKey = this.diagramKey + 1;
          this.getJobs();
          this.clickedElement = null;
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Some problem!",
            text: error.data,
            type: "error"
          });
          this.diagramKey = this.diagramKey + 1;
          this.getJobs();
        });
    },
    getJobs() {
      this.$api()
        .post("/job-definition", {
          processDefinitionId: this.definitionId
        })
        .then(response => {
          this.suspendedJobs = [];
          this.jobDefinitions = response.data;
          this.getStatistics();

          this.jobDefinitions.forEach(element => {
            if (element.suspended == true) {
              this.suspendedJobs.push(element);
            }
          });
        });
    },
    getVariant() {
      if (this.clickedJobDefinition[0].suspended) {
        return "warning";
      } else return "primary";
    },
    getIcon() {
      if (this.clickedJobDefinition[0].suspended) {
        return "play";
      } else return "pause";
    },
    getText() {
      if (this.clickedJobDefinition[0].suspended) {
        return "Unsuspend";
      } else return "Suspend";
    },
    getStatistics() {
      this.$api()
        .get(
          "/process-definition/" +
            this.definitionId +
            "/statistics?incidents=true"
        )
        .then(response => {
          this.ready = true;
          this.processActivityToShowArray = [];
          this.statistics = response.data;
        });
    }
  }
};
</script>

<style>
</style>
