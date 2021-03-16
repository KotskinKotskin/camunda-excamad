<template>
  <div>
    <h1>
      Process documentation
      <i>{{diagramId}}</i>
    </h1>
    <h3>Run process thouth API</h3>
    <p>Send POST to URL.</p>
    <br>Run last version.
    <br>
    <input class="length" disabled :placeholder="lastVersionStart">
    <br>Run selected version:
    <br>

    <input class="length" disabled :placeholder="versionStart">

    <br>Add payload to process:
    <br>
    <textarea disabled class="length height">{"variables":
    {"aVariable" : {"value" : "aStringValue", "type": "String"},
     "anotherVariable" : {"value" : true, "type": "Boolean"}},
     "businessKey" : "myBusinessKey"
    }</textarea>
    <br>
    <b-link
      href="https://docs.camunda.org/manual/7.8/reference/rest/process-definition/post-start-process-instance/"
    >More info.</b-link>
    <hr>

    <h3>Run process from site</h3>
    <p>
      <router-link to="/bpmasservice/deploytable">Click there.</router-link>
    </p>
    <hr>

    <h3>External task</h3>
    <p>To perform external task you need to poll the REST API of the service.</p>

    <p>Yor external task topics:</p>
    <li :key="item" v-for="item in arrayOfTopic">{{item}}</li>Use clients on
    <b-link href="https://github.com/camunda/camunda-external-task-client-java">Java</b-link>,
    <b-link href="https://github.com/camunda/camunda-external-task-client-js">JS</b-link>.
    <br>
    <b-link
      href="https://docs.camunda.org/manual/7.7/user-guide/process-engine/external-tasks/"
    >More info.</b-link>
    <hr>

    <hr>
    <h3>User task</h3>
    <p>
      <router-link to="/tasklist">Click here.</router-link>
    </p>
    <hr>
    <h3>Statistics and logs</h3>
    <p>Turn on BPMaS mode and use this portal.</p>
    <hr>
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
export default {
  name: "DeployHelp",
  props: ["diagramId"],
  data() {
    return {
      diagramInXml: "",
      ready: false,
      elementsOfDiagram: "",

      arrayOfTopic: []
    };
  },
  mounted() {
    this.getXml().then(value => {
      this.ready = true;
      this.readModel();
    });
  },
  computed: {
    processKey() {
      var index = this.diagramId.indexOf(":");

      return this.diagramId.slice(0, index);
    },
    bpmasurl: function() {
      return this.$store.state.bpmasserviceUrl;
    },
    versionStart: function() {
      return this.bpmasurl + "process-definition/" + this.diagramId + "/start";
    },
    lastVersionStart: function() {
      return (
        this.bpmasurl + "process-definition/key/" + this.processKey + "/start"
      );
    }
  },
  methods: {
    getXml: async function() {
      var vm = this;

      return new Promise(function(resolve, reject) {
        vm.$api()
          .get("/process-definition" + vm.diagramId + "/xml")
          .then(response => {
            vm.diagramInXml = response.data.bpmn20Xml;
            resolve();
          });
      });
    },
    readModel() {
      var moddle = new BpmnModdle({ camunda: camundaModdle });
      var vm = this;
      this.moddle = moddle.fromXML(this.diagramInXml, function(
        err,
        definitions
      ) {
        vm.elementsOfDiagram = definitions;
        vm.processKey = vm.elementsOfDiagram.rootElements[0].id;

        vm.elementsOfDiagram.rootElements[0].flowElements.forEach(element => {
          if (
            element.$type == "bpmn:ServiceTask" &&
            element.type == "external"
          ) {
            vm.arrayOfTopic.push(element.topic);
          }
        });
      });
    }
  }
};
</script>

<style>
.length {
  width: 900px;
}
.height {
  height: 130px;
}
</style>
