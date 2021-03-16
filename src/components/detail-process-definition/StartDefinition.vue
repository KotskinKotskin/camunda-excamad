<template>
  <div id="startDefinition">
    <b-btn
     
      size="sm"
      v-b-modal="'Start process' + definitionId"
      variant="success"
      @click="getActivityList()"
    >Start process</b-btn>
    <b-modal
      v-on:ok="startProcess"
      centered
      ok-variant="success"
      ok-title="Run process"
      size="lg"
      :title="'Start process ' + definitionId"
      :id="'Start process' + definitionId"
    >
      <b-form-checkbox disabled v-model="startWithVariable">Start with variables</b-form-checkbox>
      <div v-if="startWithVariable" id="variables">
        <b-btn @click="addVariable()" class="mt-1 mb-1" variant="link" size="sm">
          <font-awesome-icon icon="plus"/>Add
        </b-btn>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Value</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr :key="index" v-for="(item,index) in arrayOfVaribales">
              <td>
                <b-form-input
                  :disabled="arrayOfVaribales[index].name == 'initiator'"
                  v-model="arrayOfVaribales[index].name"
                  type="text"
                  placeholder="Enter variable"
                ></b-form-input>
              </td>
              <td>
                <b-form-select
                  :disabled="arrayOfVaribales[index].name == 'initiator'"
                  v-model="arrayOfVaribales[index].type"
                  :options="variablesTypes"
                  class="mb-3"
                />
              </td>
              <td>
                <b-form-input
                  :disabled="arrayOfVaribales[index].name == 'initiator'"
                  v-model="arrayOfVaribales[index].value"
                  type="text"
                  placeholder="Enter variable"
                ></b-form-input>
              </td>
              <td>
                <b-btn
                  :disabled="arrayOfVaribales[index].name == 'initiator'"
                  @click="removeItem(index)"
                  class="mt-1"
                  variant="link"
                  size="sm"
                >
                  <font-awesome-icon icon="minus"/>
                </b-btn>
              </td>
            </tr>
          </tbody>
        </table>Copy variables from history
        <b-form inline>
          <b-form-input v-model="instanceToCopyVariables" placeholder="Enter processInstanceId"></b-form-input>
          <b-button class="ml-2" @click="getVariableHistory" variant="secondary">Copy</b-button>
        </b-form>
        <br>Business key
        <b-form inline>
          <b-form-input v-model="businessKey" placeholder="Enter businessKey"></b-form-input>
        </b-form>
      </div>

      <br>
      <b-form-checkbox v-model="startFromSpecificActivity">Start from specific activity</b-form-checkbox>
      <div v-if="startFromSpecificActivity">
        <vue-bootstrap-typeahead
          style="width:700px"
          @hit="selectedActivity =$event"
          :serializer="serialazier"
          v-model="query"
          :data="activityList"
        />
        <small>Activity count: {{activityList.length}}</small>
      </div>
    </b-modal>
  </div>
</template>

<script>
import * as api from "@/api/api";
import BpmnModdle from "bpmn-moddle";
import camundaModdle from "camunda-bpmn-moddle/resources/camunda";
import camundaExtensionModule from "camunda-bpmn-moddle/lib";

import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda";
import BpmnViewer from "bpmn-js/lib/NavigatedViewer";
import BpmnModeler from "bpmn-js/lib/Modeler";
import { library } from "@fortawesome/fontawesome-svg-core";

import VueBootstrapTypeahead from "vue-bootstrap-typeahead";
import { faMinus, faPlus, faPause } from "@fortawesome/free-solid-svg-icons";
library.add(faMinus, faPlus);
export default {
  name: "StartDevinition",
  props: ["definitionId"],
  components: {
    VueBootstrapTypeahead
  },
  data() {
    return {
      query: "",
      businessKey: "",
      arrayOfVaribales: [{ name: "initiator", type: "String", value: "" }],
      activityList: [],
      instanceToCopyVariables: "",
      variablesFromHistory: "",
      variablesTypes: [
        "Boolean",
        "Date",
        "String",
        "Double",
        "Integer",
        "Long",
        "Object"
      ],
      selectedActivity: "",
      startWithVariable: true,
      startFromSpecificActivity: false,
      definitionInXml: "",
      ready: false
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
  methods: {
    getStartFormVariables() {
      this.$api().get("/process-definition/" + this.definitionId + "/form-variables").then(response => {
        if (response.data != null) {


          for (var key in response.data) {
            if (response.data[key].type != "Object") {
              var obj = {
                name: key,
                type: response.data[key].type,
                value: response.data[key].value
              }
            }
            if (obj.name != "initiator") {
              this.arrayOfVaribales.push(obj);
            }
          }
        }

      })
    },
    removeItem(item) {
      this.arrayOfVaribales.splice(item, 1);
    },
    getUserName() {
      return this.profile.userName;
    },

    startProcess() {
      var objectToRun = {};

      if (this.startWithVariable) {
        var variables = {};
        this.arrayOfVaribales.forEach(element => {
          variables[element.name] = {
            value: element.value,
            type: element.type
          };
          if ("valueInfo" in element) {
            variables[element.name]["valueInfo"] = element.valueInfo;
          }
        });
        objectToRun["variables"] = variables;
      }
      if (this.startFromSpecificActivity) {
        var startInstructions = [];
        var elementOfInstructions = {
          type: "startBeforeActivity",
          activityId: this.selectedActivity.id
        };
        startInstructions.push(elementOfInstructions);
        objectToRun["startInstructions"] = startInstructions;
      }
      if (this.businessKey != "") {
        objectToRun["businessKey"] = this.businessKey
      }

      this.$api()
        .post(
          "/process-definition/" + this.definitionId + "/start",
          objectToRun
        )
        .then(response => {

          var url =
            ' <a href="#/processdetail/' +
            response.data.id +
            '">Go to process instance </a>';
          this.$notify({
            group: "foo",
            title: "Process started!",
            duration: 15000,
            text: url,
            type: "success"
          });
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Process NOT started",
            text: error,
            type: "error"
          });
        });

    },
    serialazier(item) {
      var searchobj = "";
      searchobj = item.id;
      if ("name" in item) {
        searchobj = searchobj + " (" + item.name + ")";
      }
      if ("delegateExpression" in item) {
        searchobj = searchobj + " (" + item.delegateExpression + ")";
      }
      return searchobj;
    },
    getActivityList() {
      this.$api()
        .get("/process-definition/" + this.definitionId + "/xml")
        .then(response => {
          this.definitionInXml = response.data.bpmn20Xml;
          this.readModel();
        });
    },
    addVariable() {
      var obj = {
        name: "",
        type: "String",
        value: ""
      };
      this.arrayOfVaribales.push(obj);
    },
    getVariableHistory() {
      this.$api()
        .get(
          "/history/variable-instance?processInstanceId=" +
          this.instanceToCopyVariables
        )
        .then(response => {
          this.variablesFromHistory = response.data;
          if (
            this.variablesFromHistory != null &&
            this.variablesFromHistory.length > 0
          )
            this.arrayOfVaribales = [];
          {
            this.variablesFromHistory.forEach(element => {
              var obj = {
                name: element.name ? element.name : "",
                type: element.type ? element.type : "",
                value: this.SerializeObjects(element.value)
              };
              if (
                "valueInfo" in element &&
                element.valueInfo.objectTypeName != null &&
                element.valueInfo.serializationDataFormat != null
              ) {
                var valueInfo = {
                  objectTypeName: element.valueInfo.objectTypeName,
                  serializationDataFormat: "application/json"
                };
                obj["valueInfo"] = valueInfo;
              }

              this.arrayOfVaribales.push(obj);
            });
          }
        });
    },
    SerializeObjects(value) {
      if (value && typeof value === "object" && value.constructor === Object) {
        return JSON.stringify(value);
      }
      if (value instanceof Array) {
        return JSON.stringify(value);
      } else return value;
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
              }
            });
          }
        });
      });
    }
  },
  mounted() {
    this.getActivityList();
    this.arrayOfVaribales[0].value = this.getUserName();
    this.getStartFormVariables();
  },
  watch: {
    isAuthenticated(newValue, OldValue) {
      this.arrayOfVaribales[0].value = this.getUserName();
    }
  }
};
</script>

<style>
</style>
