<template>
  <div id="MoveToken">
    <h3>Move token</h3>
    <b-card id="historyDetails" bg-variant="light" text-variant="dark">
      <b-form inline>
        <b-form-input v-model="selectedFrom" list="my-list-id"></b-form-input>

        <datalist id="my-list-id">
          <option v-bind:key="item" v-for="item in currentActivitySimpleArray">{{ item }}</option>
        </datalist>

        <b-form-input v-model="selectedTo" list="my-list-id1"></b-form-input>

        <datalist id="my-list-id1">
          <option v-bind:key="item" v-for="item in possibleActivitySimpleArray">{{ item }}</option>
        </datalist>

        <b-button @click="moveToken" variant="outline-danger">Move</b-button>
        <br />
      </b-form>
      <small>{{calculateHelp()}}</small>
    </b-card>
  </div>
</template>

<script>

import BpmnModdle from "bpmn-moddle";
import camundaModdle from "camunda-bpmn-moddle/resources/camunda";

export default {
  name: "MoveToken",
  props: [
    "currentJobs",
    "processInstanceId",
    "currentActivity",
    "processDefinitionId"
  ],
  data() {
    return {
      definitionInXml: "",
      currentActivitySimpleArray: [],
      possibleActivitySimpleArray: [],
      selectedActivity: "",
      selectedFrom: "",
      selectedTo: "",
      activityList: []
    };
  },
  computed: {
    profile() {
      return this.$store.getters.getProfile;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  mounted() {
    setTimeout(() => {
      this.getActivityList();
      this.currentActivity.forEach(element => {
        this.currentActivitySimpleArray.push(element.activityId);
      });
      this.currentJobs.forEach(element => {
        this.currentActivitySimpleArray.push(element.processActivityToShow);
      });
    }, 700);
  },
  methods: {
    calculateHelp() {
      var fromObj = {};
      var fromObjString = "";
      if (this.currentActivity.find(x => x.activityId === this.selectedFrom)) {
        fromObj = this.currentActivity.find(
          x => x.activityId === this.selectedFrom
        );
        fromObjString = fromObj.activityId;
        if (fromObj.activityName) {
          fromObjString = fromObjString + "(" + fromObj.activityName + ")";
        }
      }
      var toObj = {};
      var toObjString = "";
      if (this.activityList.find(x => x.id === this.selectedTo)) {
        toObj = this.activityList.find(x => x.id === this.selectedTo);
        toObjString = toObj.id;
        if (toObj.name) {
          toObjString = toObjString + "(" + toObj.name + ")";
        }
      }
      var arrow = "";
      if (fromObjString != "" && toObjString != "") {
        arrow = "=>";
      }
      return fromObjString + arrow + toObjString;
    },
    getActivityList() {
      this.$api()
        .get("/process-definition/" + this.processDefinitionId + "/xml")
        .then(response => {
          this.definitionInXml = response.data.bpmn20Xml;
          this.readModel();
        });
    },

    readModel() {
      var moddle = new BpmnModdle({ camunda: camundaModdle });
      var vm = this;
      vm.activityList = [];
      this.moddle = moddle.fromXML(this.definitionInXml, function (
        err,
        definitions
      ) {
        definitions.rootElements.forEach(element => {
          if (element.$type == "bpmn:Process" && element.isExecutable == true) {
            element.flowElements.forEach(flowelement => {
              if (flowelement.$type != "bpmn:SequenceFlow") {
                vm.activityList.push(flowelement);
                vm.possibleActivitySimpleArray.push(flowelement.id);
              }
            });
          }
        });
      });
    },
    moveToken() {
      var moveTokenObj = {
        skipCustomListeners: true,
        skipIoMappings: true,
        instructions: [
          {
            type: "cancel",
            activityId: this.selectedFrom
          },
          {
            type: "startBeforeActivity",
            activityId: this.selectedTo
          }
        ]
      };
      this.$api()
        .post(
          "/process-instance/" + this.processInstanceId + "/modification",
          moveTokenObj
        )
        .then(() => {
          this.$notify({
            group: "foo",
            title: " Moved!",
            text: "token moved",
            type: "success"
          });
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Not moved",
            text: error,
            type: "error"
          });
        });
    }
  }
};
</script>

<style>
</style>
