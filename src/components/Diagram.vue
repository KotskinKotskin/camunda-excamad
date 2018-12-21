<template>
  <div :key="componentKey">
    <fullscreen ref="fullscreen" @change="fullscreenChange">
      <b-card bg-variant="light" text-variant="dark">
        <link rel="stylesheet" href="https://unpkg.com/bpmn-js@2.5.2/dist/assets/diagram-js.css">
        <link
          rel="stylesheet"
          href="https://unpkg.com/bpmn-js@2.5.2/dist/assets/bpmn-font/css/bpmn.css"
        >
        <b-btn class="incanvas" @click="toggle" size="sm" variant="outline-success">
          <font-awesome-icon icon="arrows-alt"/>
        </b-btn>
        <div id="canvas" :style="defaultstyle"></div>

        <div v-if="editMode" class="properties-panel-parent" id="js-properties-panel"></div>
        <ul class="buttons" v-if="editMode">
          <li>
            <a
              @mouseover="saveXML"
              variant="outline-primary"
              @click="saveXML"
              :href="hrefAndDownload.href"
              :download="hrefAndDownload.download"
            >Download .bpmn</a>
          </li>
          <li>
            <a
              @mouseover="saveSVG"
              id="js-download-svg"
              @click="saveSVG"
              :href="hrefAndDownload.href"
              :download="hrefAndDownload.download"
            >Download .svg</a>
          </li>
        </ul>
      </b-card>
      <jira-stat
        class="mt-2"
        :key="jiraKey"
        v-if="jiraMode"
        :activityId="activityId"
        :processId="processId"
      ></jira-stat>
      <form-editor
        :key="formEditorKey"
        class="mt-2"
        v-if="editMode && formMode && fieldsToPass && fieldsToPass.length > 0 "
        :fields="fieldsToPass "
      ></form-editor>
    </fullscreen>
  </div>
</template>

    


<script src="https://unpkg.com/bpmn-js@2.5.2/dist/bpmn-modeler.development.js"></script>
<script src="https://unpkg.com/jquery@3.3.1/dist/jquery.js"></script>

<script>
import BpmnModdle from "bpmn-moddle";
import camundaModdle from "camunda-bpmn-moddle/resources/camunda";
import camundaExtensionModule from "camunda-bpmn-moddle/lib";
import propertiesPanelModule from "./bpmn-js-properties-panel";
import propertiesProviderModule from "./bpmn-js-properties-panel/lib/provider/camunda";
import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda";
import BpmnViewer from "bpmn-js/lib/NavigatedViewer";
import BpmnModeler from "bpmn-js/lib/Modeler";
import $ from "jquery";
import fullscreen from "vue-fullscreen";
import Vue from "vue";
import axios from "axios";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faArrowsAlt, faEdit } from "@fortawesome/free-solid-svg-icons";
library.add(faArrowsAlt);
library.add(faEdit);
Vue.use(fullscreen);

export default {
  name: "Diagram",
  props: [
    "processDefinitionId",
    "processActivityToShowArray",
    "diagramKey",
    "editMode",
    "jiraMode",
    "formMode"
  ],
  watch: {
    fullscreen: function(val) {
      if (val == false) {
        this.toggleback();
      }
    }
  },

  data() {
    return {
      // processDefinitionId: "SMEPOST.LeasePosTerminal:36:380214",
      formEditorKey: 0,
      processDefinitionInXml: "",
      globalViewer: "",
      elementsOfDiagram: "",
      elementDetails: "",
      jiraKey: 0,
      componentKey: "",
      activityId: "",
      moddleElement: "",
      processId: "",
      defaultstyle: "height: 600px",
      fullscreen: false,
      hrefAndDownload: {
        href: "",
        download: ""
      },

      wasBuiled: false,
      fieldsToPass: {}
    };
  },
  mounted() {
    this.getAndBuild();
  },

  methods: {
    readModdle() {
      vm = this;
      var moddle = new BpmnModdle();
      moddle.fromXML(this.processDefinitionInXml, function(err, definitions) {
        vm.elementsOfDiagram = definitions;
      });
    },

    changeExpertMode() {
      this.wasBuiled = false;
      this.editMode = !this.editMode;
      this.componentKey = this.componentKey + 1;
    },
    toggle() {
      this.$refs["fullscreen"].toggle(); // recommended
      this.defaultstyle = "height: 1200px";
    },
    toggleback() {
      // this.$refs["fullscreen"].toggle(); // recommended
      this.defaultstyle = "height: 600px";
    },
    fullscreenChange(fullscreen) {
      this.fullscreen = fullscreen;
    },

    saveXML() {
      var stringXml = "";
      this.globalViewer.saveXML({ format: true }, function(err, xml) {
        stringXml = xml;
      });
      var encodedData = encodeURIComponent(stringXml);
      var name = this.diagramKey.split(".").join("") + ".bpmn";
      this.hrefAndDownload.href =
        "data:application/bpmn20-xml;charset=UTF-8," + stringXml;
      this.hrefAndDownload.download = name;
    },
    saveSVG() {
      var stringSVG = "";
      this.globalViewer.saveSVG({ format: true }, function(err, svg) {
        stringSVG = svg;
      });
      var encodedDataSVG = encodeURIComponent(stringSVG);
      var nameSVG = this.diagramKey.split(".").join("") + ".svg";
      this.hrefAndDownload.href =
        "data:application/bpmn20-xml;charset=UTF-8," + stringSVG;
      this.hrefAndDownload.download = nameSVG;
    },

    getAndBuild() {
      if (this.wasBuiled == false) {
        this.getXml().then(response => {
          var viewer = this.buildViewer();
          this.globalViewer = viewer;
          this.wasBuiled = true;

          this.importXML(viewer);
          this.eventBusDispatcher(viewer);
        });
      }
    },
    getXml: async function() {
      var vm = this;

      return new Promise(function(resolve, reject) {
        if (vm.diagramKey == null) {
          vm.$api()
            .get("/process-definition/" + vm.processDefinitionId + "/xml")
            .then(response => {
              vm.processDefinitionInXml = response.data.bpmn20Xml;
              resolve();
            });
        }
        if (vm.diagramKey != null) {
          vm.$api()
            .get("/process-definition/key/" + vm.diagramKey + "/xml")
            .then(response => {
              vm.processDefinitionInXml = response.data.bpmn20Xml;
              resolve();
            });
        }
      });
    },
    returnAllarm: function(item) {},
    buildViewer: function() {
      if (this.editMode != true) {
        var viewer = new BpmnViewer({
          container: "#canvas"
        });
      }

      if (this.editMode == true) {
        this.readModdle();
        var viewer = new BpmnModeler({
          container: "#canvas",
          propertiesPanel: {
            parent: "#js-properties-panel"
          },
          additionalModules: [propertiesPanelModule, propertiesProviderModule],
          moddleExtensions: {
            camunda: camundaModdleDescriptor
          }
        });
      }

      return viewer;
    },

    eventBusDispatcher: function(viewer) {
      if (this.jiraMode == true || this.editMode == true) {
        vm = this;
        var eventBus = viewer.get("eventBus");

        // you may hook into any of the following events
        var events = [
          // "element.hover",
          // "element.out",
          "element.click"
          // "element.dblclick",
          // "element.mousedown",
          // "element.mouseup"
        ];

        events.forEach(function(event) {
          eventBus.on(event, function(e) {
            // e.element = the model element
            // e.gfx = the graphical element

            vm.moddleElement = e.element.businessObject;
            var stringXml = "";
            vm.globalViewer.saveXML({ format: true }, function(err, xml) {
              stringXml = xml;
            });
            vm.$emit("digaramInXml", stringXml);
            var moddle = new BpmnModdle({ camunda: camundaModdle });

            if (vm.moddleElement.$type == "bpmn:UserTask") {
              vm.fieldsToPass =
                vm.moddleElement.extensionElements.values[0].fields;
              /*    var newField = moddle.create("camunda:FormField");
              newField.id = "girerg";
              newField.label = "testLabel";
              newField.type = "string";
              newField.defaultValue = "hihi";
              vm.moddleElement.extensionElements.values[0].fields.push(
                newField
              ); */
            }

            if (vm.moddleElement.$type != "bpmn:UserTask") {
              vm.formEditorKey = vm.formEditorKey + 1;
              vm.fieldsToPass = {};
            }

            vm.elementDetails = e.element;
            vm.activityId = e.element.id;
            vm.processId = e.element.businessObject.$parent.id;
            vm.jiraKey = vm.jiraKey + 1;
          });
        });
      }
    },

    makePrettyHtml: function(item) {
      return;
    },
    drawOverlays: function(bpmnViewer) {
      var canvas = bpmnViewer.get("canvas"),
        overlays = bpmnViewer.get("overlays");
      canvas.zoom("fit-viewport");
      this.processActivityToShowArray.forEach(item => {
        if (item.activityHimanaizedCreateDate) {
          overlays.add(item.processActivityToShow, {
            position: {
              bottom: 0,
              left: 0
            },
            html:
              '<div class="diagram-note">' +
              item.activityHimanaizedCreateDate +
              "</div"
          });
        }
        if (item.count) {
          overlays.add(item.processActivityToShow, {
            position: {
              top: -20,
              left: 0
            },
            html: '<div class="count"> ' + item.count + "</div"
          });
        }
        if (item.isIncident) {
          overlays.add(item.processActivityToShow, {
            position: {
              bottom: -35,
              left: 0
            },
            html: '<div class="problem"> Incident' + "</div"
          });
        }
        if (item.isJob) {
          overlays.add(item.processActivityToShow, {
            position: {
              top: -35,
              left: 0
            },
            html: '<div class="job"> Job' + "</div"
          });
        }
      });
    },

    importXML: function(bpmnViewer) {
      bpmnViewer.importXML(this.processDefinitionInXml);
      if (this.processActivityToShowArray != null) {
        setTimeout(() => {
          this.drawOverlays(bpmnViewer);
        }, 500);
      }
    }
  }
};
</script>

<style lang="less">
@import "styles/properties";
html,
body,
#canvas {
  height: 100%;
  padding: 0;
  margin: 0;
}

.diagram-note {
  background-color: green;
  color: White;
  border-radius: 25px;
  font-family: Arial;
  font-size: 12px;
  padding: 0px;
  min-height: 16px;
  width: 100px;
  text-align: center;
}
.true {
  background-color: red;
}
.count {
  background-color: blueviolet;
  color: white;
  width: 45px;
  border-radius: 25px;
  padding-left: 5px;
}
.job {
  background-color: goldenrod;
  color: white;
  width: 45px;
  border-radius: 25px;
  padding-left: 5px;
}
.problem {
  background-color: red;
  color: white;
  width: 90px;
  border-radius: 25px;
  padding-left: 5px;
}
.buttons {
  position: fixed;
  bottom: 20px;
  left: 20px;

  padding: 0;
  margin: 0;
  list-style: none;
}

.buttons > li {
  display: inline-block;
  margin-right: 10px;
}
.properties-panel-parent {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: white;
  width: 260px;
  z-index: 10;
  border-left: 1px solid #ccc;
  overflow: auto;
}
.djs-properties-panel {
  padding-bottom: 70px;
  min-height: 100%;
}
.buttons > li > a {
  background: #ddd;
  border: solid 1px #666;
  display: inline-block;
  padding: 5px;
}

.buttons a {
  opacity: 0.3;
}

.buttons a.active {
  opacity: 1;
}
</style>
