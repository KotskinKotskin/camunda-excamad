<template>
  <div>
    <div id="PushAndDeploy">
      <b-btn
        size="sm"
        variant="outline-success"
        :pressed="editMode"
        @click="changeEditMode"
      >Edit mode</b-btn>
      <b-btn
        class="ml-2"
        :disabled="!editMode"
        size="sm"
        variant="outline-primary"
        @click="SaveXML"
      >Save</b-btn>
      <hr>
      <commit-file
        projectKey="BPMCL"
        v-if="newSavedXML"
        v-on:fileAddedToStash="setCommited"
        :FileInString="newSavedXML"
        :repositySlug="projectName"
        :pathToFile="pathToFile"
      ></commit-file>
      <hr>
      <deploy
        class="mb-2"
        v-if="(newSavedXML && wasCommited) || editMode "
        extension="dmn"
        :diagramInXML="newSavedXML"
      ></deploy>
    </div>
    <div id="canvasDes" :key="componentKey" :style="defaultstyle"></div>
  </div>
</template>



<script>
import * as api from "@/api/api";
import DmnJS from "dmn-js";
import DmnModdle from "dmn-moddle";
import camundaModdle from "camunda-dmn-moddle/resources/camunda";
import Modeler from "dmn-js/lib/Modeler";
import $ from "jquery";

export default {
  name: "DecisionDiagram",
  props: ["decisionId"],
  data() {
    return {
      decisionInXml: "",
      decisionMeta: "",
      editMode: false,
      newSavedXML: "",
      componentKey: 0,
      globalModeler: "",
      projectKey: "projectKey",
      repositySlug: "repositySlug",
      defaultstyle: "height: 600px",
      wasCommited: false,
      dmnModdle: ""
    };
  },
  computed: {
    projectName() {
      var prjName = this.$store.state.baseurl.replace("/rest/", "");
      var lastIndex = prjName.lastIndexOf("/");
      prjName = prjName.substring(lastIndex + 1, prjName.length);
      return prjName;
    },
    pathToFile() {
      return this.projectName + "/src/main/resources" + this.decisionMeta.resource.replace("BOOT-INF/classes", "");
    }
  },
  watch: {
    editMode: function (newValue, OldValue) {
      this.getDecisionInXml().then(() => {
        this.BuildViewerDiagram();
        this.readXML();
      });
    }
  },

  methods: {
    changeEditMode() {
      this.editMode = !this.editMode;
      this.componentKey = this.componentKey + 1;
    },
    setCommited() {
      this.wasCommited = true;
    },
    readXML() {
      var moddle = new DmnModdle({ camunda: camundaModdle });
      var vm = this;
      var result = moddle.fromXML(
        this.decisionInXml.dmnXml,
        "dmn:Definitions",
        "",
        function (err, proc) {
          if (err) {
          }
          if (!err) {
            vm.dmnModdle = proc;
          }
        }
      );
    },

    getDecisionInXml: async function () {
      var vm = this;
      return new Promise(function (resolve, reject) {
        api
          .getEntity("decision-definition/" + vm.decisionId, "xml", "")
          .then(value => {
            vm.decisionInXml = value;
            resolve();
          });
      });
    },

    getDeicionsMeta() {
      this.$api().get("/decision-definition/" + this.decisionId).then(response => {
        this.decisionMeta = response.data;
      })
    },
    SaveXML() {
      var vm = this;
      this.globalModeler.saveXML({ format: true }, function (err, xml) {
        if (err) {
          return console.error("could not save DMN 1.1 diagram", err);
        }

        vm.newSavedXML = xml;
        vm.$notify({
          group: "foo",
          title: "Definitions saved and ready to deploy",
          type: "success"
        });
      });
    },

    BuildViewerDiagram() {
      var vm = this;
      if (this.editMode == false) {
        var dmnViewer = new DmnJS({
          container: "#canvasDes"
        });
      }
      if (this.editMode == true) {
         dmnViewer = new Modeler({
          container: "#canvasDes"
        });
        this.globalModeler = dmnViewer;
      }

      dmnViewer.importXML(vm.decisionInXml.dmnXml, function (err) {
        // access active viewer components
        var activeViewer = dmnViewer.getActiveViewer();
        // access active editor components
        var canvas = activeViewer.get("canvasDes");
        // zoom to fit full viewport
        canvas.zoom("fit-viewport");
      });
    }
  },
  mounted() {
    this.getDecisionInXml().then(() => {
      this.BuildViewerDiagram();
      this.readXML();
      this.getDeicionsMeta();
    });
  }
};
</script>

<style>
html,
body,
#canvas {
  height: 900px;
  padding: 0;
  margin: 0;
}
.dmn-drd-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.dmn-drd-container * {
  box-sizing: border-box;
  padding-top: 40px;
}

.djs-overlay .drill-down-overlay {
  font-size: 16px;
  background: #52b415;
  color: white;
  text-align: left;
  border-radius: 1px;
  padding: 0 2px;
}

.dmn-definitions {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #fafafa;
  border: solid 1px #ccc;
  border-radius: 2px;
  padding: 4px;
  margin-bottom: 15px;
}

.dmn-definitions .dmn-definitions-name {
  font-size: 1.5em;
  padding: 3px;
}

.dmn-definitions .dmn-definitions-name:focus {
  outline: none;
}

.dmn-definitions .dmn-definitions-id {
  font-family: monospace;
  margin-top: 2px;
  padding: 3px;
}

.dmn-definitions .dmn-definitions-id:focus {
  outline: none;
}

.dmn-definitions > [contenteditable]:hover,
.dmn-definitions > [contenteditable]:focus {
  padding: 2px;
  background-color: white;
  border-radius: 2px;
  border: 1px solid #aaaaaa;
}

.djs-container.with-palette .dmn-definitions {
  left: 80px;
}

.djs-container.with-palette-two-column .dmn-definitions {
  left: 130px;
}
.dmn-decision-table-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.dmn-decision-table-container .input-cell .input-label,
.dmn-decision-table-container .input-cell .input-expression,
.dmn-decision-table-container .input-cell .output-label,
.dmn-decision-table-container .input-cell .output-name {
  display: block;
}

.dmn-decision-table-container * {
  box-sizing: border-box;
}

/** actionable icon */
.dmn-decision-table-container .action-icon {
  border-radius: 2px;
  color: #52b415;
  margin-left: 5px;
}

.dmn-decision-table-container .action-icon:before {
  margin-left: 0.1em;
  margin-right: 0.1em;
}

.dmn-decision-table-container .actionable:hover .action-icon {
  background-color: #52b415;
  color: white;
}

/** end actionable icon */

/* basic styles */

.dmn-decision-table-container {
  color: #444;

  max-height: 100%;
}

.dmn-decision-table-container .tjs-table {
  min-width: 100%;
}

/* end basic styles */

/* basic table styles */

.dmn-decision-table-container {
  font-family: "Arial", sans-serif;
  font-size: 14px;
}

.dmn-decision-table-container .tjs-table {
  table-layout: fixed;
  border-collapse: collapse;

  border: solid 1px #444;
}

.dmn-decision-table-container table thead {
  border-bottom: 3px double #444;
}

.dmn-decision-table-container td,
.dmn-decision-table-container th {
  border: solid 1px #444;
  padding: 4px;
}

.dmn-decision-table-container .tjs-table tr .output-cell {
  border-left: 3px double #444;
}

.dmn-decision-table-container .tjs-table tr .output-cell + .output-cell {
  border-left: 1px solid #444;
}

.dmn-decision-table-container th {
  min-width: 192px;
}

.dmn-decision-table-container th,
.dmn-decision-table-container td {
  white-space: pre;
}

.dmn-decision-table-container th.hit-policy {
  width: 40px;
  min-width: 40px;

  vertical-align: top;
}

.dmn-decision-table-container th {
  font-weight: normal;
}

.dmn-decision-table-container th.header {
  text-align: center;
  font-weight: bold;
}

.dmn-decision-table-container th.annotation.header {
  vertical-align: bottom;
}

.dmn-decision-table-container td.rule-index {
  text-align: right;
  padding-right: 8px;
}

.dmn-decision-table-container thead .input-expression,
.dmn-decision-table-container thead .input-variable,
.dmn-decision-table-container thead .output-name,
.dmn-decision-table-container thead .type-ref,
.dmn-decision-table-container .script-editor {
  font-family: monospace;
}

/* end basic table styles */

/* selection styles */

.dmn-decision-table-container th,
.dmn-decision-table-container td,
.dmn-decision-table-container h3,
.dmn-decision-table-container h5 {
  position: relative;
}

.dmn-decision-table-container .selected:after {
  content: "";
  display: block;
  position: absolute;
  top: -1px;
  left: -1px;
  bottom: -1px;
  right: -1px;
  border: solid 2px #4285f4;
  z-index: 1;
  pointer-events: none;
}

.dmn-decision-table-container th.selected:not(.focussed) {
  background: #e9f1ff;
}

/* end selection styles */

/* footer styles */

.dmn-decision-table-container tfoot.add-rule td.add-rule-add {
  text-align: right;
}

.dmn-decision-table-container tfoot.add-rule td {
  border-color: #aaa;
  color: #aaa;
}

.dmn-decision-table-container tfoot.add-rule:hover td {
  border-color: #444;
  color: #444;
}

/* end footer styles */

/* content editable styles */

.dmn-decision-table-container [contenteditable],
.dmn-decision-table-container [tabindex] {
  outline: none;
}

/* end content editable styles */

/* context menu styles */

.dmn-decision-table-container {
  overflow: auto;
  position: relative;
}

/* decision table properties */
.dmn-decision-table-container .decision-table-properties {
  color: #444;
  background-color: #fff;
  display: inline-block;
  border: solid 1px #444;
  margin-bottom: -1px;
  position: relative;
  min-width: 100px;
  max-width: 50%;
}

.dmn-decision-table-container .decision-table-name,
.dmn-decision-table-container .decision-table-id {
  margin: 0;
  padding: 3px 6px;
  text-align: center;
  white-space: pre;
}

.dmn-decision-table-container .decision-table-id.invalid {
  background: #f4cecd;
  color: #c9302c;
}

.dmn-decision-table-container .decision-table-name {
  font-size: 24px;
  line-height: 30px;
  padding: 0.3em;
  font-weight: bold;
}

.dmn-decision-table-container .decision-table-id {
  border-top: 1px solid #444;
  font-family: monospace;
  font-size: 18px;
}

/* end decision table properties */

/* view drd */
.dmn-decision-table-container .view-drd {
  float: right;

  margin-right: 10px;
}

.dmn-decision-table-container .view-drd .view-drd-button {
  background: #fff;
  padding: 8px;
  border: solid 1px #ccc;
  border-radius: 2px;
  font-size: 14px;
  color: #444;
  font-weight: bold;
  cursor: pointer;
  outline: none;
}

.dmn-decision-table-container .view-drd .view-drd-button:hover {
  background: #f6f6f6;
}

/* end view drd */

/* powered by */
.dmn-decision-table-container .powered-by-logo {
  float: right;
  width: 38px;
  z-index: 10;
  cursor: pointer;
}

.dmn-decision-table-container .powered-by-logo .logo {
  width: 100%;
}

.dmn-decision-table-container .powered-by-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.dmn-decision-table-container .powered-by-overlay .powered-by-overlay-content {
  background: #fff;
  padding: 8px;
  border: solid 1px #ccc;
  border-radius: 2px;
  font-size: 14px;
  color: #444;
  display: flex;
  flex-direction: row;
  max-width: 260px;
}

.dmn-decision-table-container
  .powered-by-overlay
  .powered-by-overlay-content
  div:first-child {
  margin-right: 8px;
}

/* end powered by */

/* simple mode */

.dmn-decision-table-container .simple-mode-button {
  color: #444;
  background-color: #f6f6f6;
  position: absolute;
  background: #fff;
  padding: 4px;
  border-radius: 2px;
  border: solid 1px #ccc;
  cursor: pointer;
  font-size: 14px;
  z-index: 2;
  opacity: 0.8;
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
}

.dmn-decision-table-container .simple-mode-button:hover {
  opacity: 1;
}

.dmn-decision-table-container .simple-mode-button.disabled,
.dmn-decision-table-container .simple-mode-button.disabled:hover {
  color: #ccc;
}

/* end simple mode  */

/**
 * badges
 */
.dms-badge {
  border-radius: 2px;
  padding: 3px 6px;
  font-size: 0.8em;
  height: 19px;
}

.dms-badge-icon + .dms-badge-label {
  margin-left: 3px;
}

.dms-badge.dmn-variable-name {
  background: #9e9e9e;
  color: white;
}

.dms-badge.dmn-expression-language {
  background: rgba(84, 146, 250, 0.3);
  color: white;
}

.dms-badge + .dms-badge {
  margin-left: 3px;
}

.dmn-decision-table-container .dmn-expression-language .dms-badge-label {
  display: none;
}

.dmn-decision-table-container
  .input-cell:hover
  .dmn-expression-language
  .dms-badge-label,
.dmn-decision-table-container
  .output-cell:hover
  .dmn-expression-language
  .dms-badge-label {
  display: inline-block;
}

.dmn-decision-table-container .input-editor .dmn-variable-name,
.dmn-decision-table-container .input-editor .dmn-expression-language {
  margin-top: 4px;
  display: inline-block;
}

.dmn-decision-table-container .cell:hover .dms-badge.dmn-expression-language {
  background: #92b9fc;
  z-index: 1;
}

.dmn-decision-table-container .cell .dms-badge.dmn-expression-language {
  z-index: -1;
}

/* cell expression language */

.dmn-decision-table-container .cell .dmn-expression-language {
  display: flex;
  align-items: center;
  position: absolute;
  top: 2px;
  right: 2px;
  pointer-events: none;
}

/* end cell expression language */

/* drag and drop */
.dmn-decision-table-container .dragover:before {
  content: "";
  display: block;
  position: absolute;
  background-color: #666;
  border-radius: 5px;
  z-index: 2;
  pointer-events: none;
}

.dmn-decision-table-container .dragover.top:before {
  left: -6px;
  right: -6px;
  height: 5px;

  top: -3px;
}

.dmn-decision-table-container .dragover.right:before {
  top: -6px;
  bottom: -6px;
  width: 5px;

  right: -3px;
}

.dmn-decision-table-container .dragover.bottom:before {
  left: -6px;
  right: -6px;
  height: 5px;

  bottom: -3px;
}

.dmn-decision-table-container .dragover.left:before {
  top: -6px;
  bottom: -6px;
  width: 5px;

  left: -3px;
}

.dmn-decision-table-container .dragged {
  color: #999;
}

/* cell description */

.dmn-decision-table-container .description-indicator {
  position: absolute;
  top: 0;
  right: -4px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid black;
  transform: rotate(45deg);
  transform-origin: top;
}

/* end cell description */
.dmn-literal-expression-container {
  font-family: "Arial", sans-serif;
  position: relative;
  color: #444;

  width: 100%;
  height: 100%;
  position: relative;
}

.dmn-literal-expression-container * {
  box-sizing: border-box;
}

/* decision properties */
.dmn-literal-expression-container .decision-properties {
  color: #444;
  background-color: #fff;
  display: inline-block;
  border: 1px solid #444;
  border-bottom: none;
  position: relative;
  min-width: 192px;
  max-width: 50%;
}

.dmn-literal-expression-container .decision-name:not(.editor),
.dmn-literal-expression-container .decision-id:not(.editor) {
  cursor: default;
}

.dmn-literal-expression-container .decision-name.editor,
.dmn-literal-expression-container .decision-id.editor {
  cursor: text;
}

.dmn-literal-expression-container .decision-name,
.dmn-literal-expression-container .decision-id {
  margin: 0;
  padding: 3px 6px;
  text-align: center;
  white-space: pre;
}

.dmn-literal-expression-container .decision-name div,
.dmn-literal-expression-container .decision-id div {
  outline: none;
}

.dmn-literal-expression-container .decision-name.editor:not(.focussed):hover,
.dmn-literal-expression-container .decision-id.editor:not(.focussed):hover {
  cursor: text;
}

.dmn-literal-expression-container .decision-name {
  font-size: 24px;
  line-height: 30px;
  padding: 0.3em;
  font-weight: bold;
}

.dmn-literal-expression-container .decision-id {
  border-top: 1px solid #444;
  font-family: monospace;
  font-size: 18px;
}

/* textarea */
.dmn-literal-expression-container .textarea {
  box-sizing: border-box;
  width: 100%;
  font-family: monospace;
  border: 1px solid #444;
  border-bottom-width: 1px;
  white-space: pre;
  font-size: 14px;
  color: #444;
  height: 250px;
}

.dmn-literal-expression-container .textarea .content,
.dmn-literal-expression-container .textarea .content-editable {
  padding: 12px;
}

.dmn-literal-expression-container .textarea .content-editable {
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.dmn-literal-expression-container .textarea div:focus {
  outline: none;
}

.dmn-literal-expression-container .textarea.editor {
  cursor: text;
}

.dmn-literal-expression-container .textarea:not(.editor) {
  cursor: default;
}

/* literal expression properties */
.dmn-literal-expression-container .literal-expression-properties {
  box-sizing: border-box;
  width: 100%;
  padding: 0;
  border: 1px solid #444;
  border-top: none;
  font-size: 14px;
  color: #444;
}

.dmn-literal-expression-container .literal-expression-properties table {
  border-spacing: 8px;
}

.dmn-literal-expression-container
  .literal-expression-properties
  table
  tr
  td:first-child {
  font-weight: bold;
}

.dmn-literal-expression-container
  .literal-expression-properties
  table
  tr
  td:last-child {
  min-width: 100px;
}

/* view drd */
.dmn-literal-expression-container .view-drd {
  float: right;
  margin-right: 10px;
}

.dmn-literal-expression-container .view-drd .view-drd-button {
  background: #fff;
  padding: 8px;
  border: solid 1px #ccc;
  border-radius: 2px;
  font-size: 14px;
  color: #444;
  font-weight: bold;
  cursor: pointer;
  outline: none;
}

.dmn-literal-expression-container .view-drd .view-drd-button:hover {
  background: #f6f6f6;
}

/* powered by */
.dmn-literal-expression-container .powered-by-logo {
  float: right;
  width: 38px;
  z-index: 10;
  cursor: pointer;
}

.dmn-literal-expression-container .powered-by-logo .logo {
  width: 100%;
}

.dmn-literal-expression-container .powered-by-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.dmn-literal-expression-container
  .powered-by-overlay
  .powered-by-overlay-content {
  background: #fff;
  padding: 8px;
  border: solid 1px #ccc;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  color: #444;
  display: flex;
  flex-direction: row;
  max-width: 260px;
}

.dmn-literal-expression-container
  .powered-by-overlay
  .powered-by-overlay-content
  div:first-child {
  margin-right: 8px;
}

.dmn-decision-table-container p.dms-hint {
  font-size: 0.85em;
  margin-top: 5px;
  color: #888;
}

/* Chrome hack: SVG is rendered more smooth in Windozze. 100% magic, uncomment if you need it. */
/* Note, that will break hinting! In other OS-es font will be not as sharp as it could be */
/*
@media screen and (-webkit-min-device-pixel-ratio:0) {
  @font-face {
    font-family: 'dmn';
    src: url('../font/dmn.svg?37326370#dmn') format('svg');
  }
}
*/

[class^="dmn-icon-"]:before,
[class*=" dmn-icon-"]:before {
  font-family: "dmn";
  font-style: normal;
  font-weight: normal;

  display: inline-block;
  text-decoration: inherit;
  width: 1em;
  text-align: center;
  /* opacity: .8; */

  /* For safety - reset parent styles, that can break glyph codes*/
  font-variant: normal;
  text-transform: none;

  /* fix buttons height, for twitter bootstrap */
  line-height: 1em;

  /* you can be more comfortable with increased icons size */
  /* font-size: 120%; */

  /* Font smoothing. That was taken from TWBS */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  /* Uncomment for 3D effect */
  /* text-shadow: 1px 1px 1px rgba(127, 127, 127, 0.3); */
}

.dmn-icon-up:before {
  content: "\e800";
} /* '' */
.dmn-icon-down:before {
  content: "\e801";
} /* '' */
.dmn-icon-clear:before {
  content: "\e802";
} /* '' */
.dmn-icon-plus:before {
  content: "\e803";
} /* '' */
.dmn-icon-minus:before {
  content: "\e804";
} /* '' */
.dmn-icon-info:before {
  content: "\e805";
} /* '' */
.dmn-icon-left:before {
  content: "\e806";
} /* '' */
.dmn-icon-decision:before {
  content: "\e807";
} /* '' */
.dmn-icon-right:before {
  content: "\e808";
} /* '' */
.dmn-icon-input:before {
  content: "\e809";
} /* '' */
.dmn-icon-output:before {
  content: "\e80a";
} /* '' */
.dmn-icon-copy:before {
  content: "\e80b";
} /* '' */
.dmn-icon-keyboard:before {
  content: "\e80c";
} /* '' */
.dmn-icon-undo:before {
  content: "\e80d";
} /* '' */
.dmn-icon-redo:before {
  content: "\e80e";
} /* '' */
.dmn-icon-menu:before {
  content: "\e80f";
} /* '' */
.dmn-icon-setting:before {
  content: "\e810";
} /* '' */
.dmn-icon-wrench:before {
  content: "\e811";
} /* '' */
.dmn-icon-eraser:before {
  content: "\e812";
} /* '' */
.dmn-icon-attention:before {
  content: "\e813";
} /* '' */
.dmn-icon-resize-big:before {
  content: "\e814";
} /* '' */
.dmn-icon-resize-small:before {
  content: "\e815";
} /* '' */
.dmn-icon-file-code:before {
  content: "\e816";
} /* '' */
.dmn-icon-business-knowledge:before {
  content: "\e817";
} /* '' */
.dmn-icon-knowledge-source:before {
  content: "\e818";
} /* '' */
.dmn-icon-input-data:before {
  content: "\e819";
} /* '' */
.dmn-icon-text-annotation:before {
  content: "\e81a";
} /* '' */
.dmn-icon-connection:before {
  content: "\e81b";
} /* '' */
.dmn-icon-connection-multi:before {
  content: "\e81c";
} /* '' */
.dmn-icon-drag:before {
  content: "\e81d";
} /* '' */
.dmn-icon-lasso-tool:before {
  content: "\e81e";
} /* '' */
.dmn-icon-screw-wrench:before {
  content: "\e81f";
} /* '' */
.dmn-icon-trash:before {
  content: "\e820";
} /* '' */
.dmn-icon-bpmn-io:before {
  content: "\e821";
} /* '' */
.dmn-icon-decision-table:before {
  content: "\e822";
} /* '' */
.dmn-icon-literal-expression:before {
  content: "\e823";
} /* '' */
.dmn-icon-edit:before {
  content: "\e824";
} /* '' */
.dmn-icon-cut:before {
  content: "\e825";
} /* '' */
.dmn-icon-paste:before {
  content: "\f0ea";
} /* '' */
.dmn-js-parent {
  border: solid 1px #ccc;
}

.editor-tabs .tab {
  display: block;
  white-space: nowrap;
  background: white;
  padding: 5px;
  margin: -1px 2px 2px 2px;
  border: solid 1px #ccc;
  border-radius: 0 0 2px 2px;
  padding: 8px;
  font-family: "Arial", sans-serif;
  font-weight: bold;
  cursor: default;
  font-size: 14px;
  color: #444;
  flex: 0 0 1%;
}

.editor-tabs {
  display: flex;
  flex-direction: row;
  position: relative;
}

.editor-tabs .tab:first-child {
  margin-left: 5px;
}

.editor-tabs .tab.active {
  border-top-color: white;
}

.editor-tabs .tab.active,
.editor-tabs .tab:hover {
  border-bottom: solid 3px #52b415;
  margin-bottom: 0;
}
/**
 * outline styles
 */

.djs-outline {
  fill: none;
  visibility: hidden;
}

.djs-element.hover .djs-outline,
.djs-element.selected .djs-outline {
  visibility: visible;
  shape-rendering: crispEdges;
  stroke-dasharray: 3, 3;
}

.djs-element.selected .djs-outline {
  stroke: #8888ff;
  stroke-width: 1px;
}

.djs-element.hover .djs-outline {
  stroke: #ff8888;
  stroke-width: 1px;
}

.djs-shape.connect-ok .djs-visual > :nth-child(1) {
  fill: #dcfecc /* light-green */ !important;
}

.djs-shape.connect-not-ok .djs-visual > :nth-child(1),
.djs-shape.drop-not-ok .djs-visual > :nth-child(1) {
  fill: #f9dee5 /* light-red */ !important;
}

.djs-shape.new-parent .djs-visual > :nth-child(1) {
  fill: #f7f9ff !important;
}

svg.drop-not-ok {
  background: #f9dee5 /* light-red */ !important;
}

svg.new-parent {
  background: #f7f9ff /* light-blue */ !important;
}

.djs-connection.connect-ok .djs-visual > :nth-child(1),
.djs-connection.drop-ok .djs-visual > :nth-child(1) {
  stroke: #90dd5f /* light-green */ !important;
}

.djs-connection.connect-not-ok .djs-visual > :nth-child(1),
.djs-connection.drop-not-ok .djs-visual > :nth-child(1) {
  stroke: #e56283 /* light-red */ !important;
}

.drop-not-ok,
.connect-not-ok {
  cursor: not-allowed;
}

.djs-element.attach-ok .djs-visual > :nth-child(1) {
  stroke-width: 5px !important;
  stroke: rgba(255, 116, 0, 0.7) !important;
}

/**
* Selection box style
*
*/
.djs-lasso-overlay {
  fill: rgb(255, 116, 0);
  fill-opacity: 0.1;

  stroke-dasharray: 5 1 3 1;
  stroke: rgb(255, 116, 0);

  shape-rendering: crispEdges;
  pointer-events: none;
}

/**
 * Resize styles
 */
.djs-resize-overlay {
  fill: none;

  stroke-dasharray: 5 1 3 1;
  stroke: rgb(255, 116, 0);

  pointer-events: none;
}

.djs-resizer-hit {
  fill: none;
  pointer-events: all;
}

.djs-resizer-visual {
  fill: white;
  stroke-width: 1px;
  stroke: black;
  shape-rendering: crispEdges;
  stroke-opacity: 0.2;
}

.djs-cursor-resize-nwse,
.djs-resizer-nw,
.djs-resizer-se {
  cursor: nwse-resize;
}

.djs-cursor-resize-nesw,
.djs-resizer-ne,
.djs-resizer-sw {
  cursor: nesw-resize;
}

.djs-shape.djs-resizing > .djs-outline {
  visibility: hidden !important;
}

.djs-shape.djs-resizing > .djs-resizer {
  visibility: hidden;
}

.djs-dragger > .djs-resizer {
  visibility: hidden;
}

/**
 * drag styles
 */
.djs-dragger .djs-visual circle,
.djs-dragger .djs-visual path,
.djs-dragger .djs-visual polygon,
.djs-dragger .djs-visual polyline,
.djs-dragger .djs-visual rect,
.djs-dragger .djs-visual text {
  fill: none !important;
  stroke: rgb(255, 116, 0) !important;
}

.djs-dragging {
  opacity: 0.3;
}

.djs-dragging,
.djs-dragging > * {
  pointer-events: none !important;
}

.djs-dragging .djs-context-pad,
.djs-dragging .djs-outline {
  display: none !important;
}

/**
 * no pointer events for visual
 */
.djs-visual,
.djs-outline {
  pointer-events: none;
}

/**
 * all pointer events for hit shape
 */
.djs-shape .djs-hit {
  pointer-events: all;
}

.djs-connection .djs-hit {
  pointer-events: stroke;
}

/**
 * shape / connection basic styles
 */
.djs-connection .djs-visual {
  stroke-width: 2px;
  fill: none;
}

.djs-cursor-grab {
  cursor: -webkit-grab;
  cursor: -moz-grab;
  cursor: grab;
}

.djs-cursor-grabbing {
  cursor: -webkit-grabbing;
  cursor: -moz-grabbing;
  cursor: grabbing;
}

.djs-cursor-crosshair {
  cursor: crosshair;
}

.djs-cursor-move {
  cursor: move;
}

.djs-cursor-resize-ns {
  cursor: ns-resize;
}

.djs-cursor-resize-ew {
  cursor: ew-resize;
}

/**
 * snapping
 */
.djs-snap-line {
  stroke: rgb(255, 195, 66);
  stroke: rgba(255, 195, 66, 0.5);
  stroke-linecap: round;
  stroke-width: 2px;
  pointer-events: none;
}

/**
 * snapping
 */
.djs-crosshair {
  stroke: #555;
  stroke-linecap: round;
  stroke-width: 1px;
  pointer-events: none;
  shape-rendering: crispEdges;
  stroke-dasharray: 5, 5;
}

/**
 * palette
 */

.djs-palette {
  position: absolute;
  left: 20px;
  top: 20px;

  box-sizing: border-box;
  width: 48px;
}

.djs-palette .separator {
  margin: 0 5px;
  padding-top: 5px;

  border: none;
  border-bottom: solid 1px #ddd;

  clear: both;
}

.djs-palette .entry:before {
  vertical-align: middle;
}

.djs-palette .djs-palette-toggle {
  cursor: pointer;
}

.djs-palette .entry,
.djs-palette .djs-palette-toggle {
  color: #333;
  font-size: 30px;

  text-align: center;
}

.djs-palette .entry {
  float: left;
}

.djs-palette .entry img {
  max-width: 100%;
}

.djs-palette .djs-palette-entries:after {
  content: "";
  display: table;
  clear: both;
}

.djs-palette .djs-palette-toggle:hover {
  background: #666;
}

.djs-palette .entry:hover {
  color: rgb(255, 116, 0);
}

.djs-palette .highlighted-entry {
  color: rgb(255, 116, 0) !important;
}

.djs-palette .entry,
.djs-palette .djs-palette-toggle {
  width: 46px;
  height: 46px;
  line-height: 46px;
  cursor: default;
}

/**
 * Palette open / two-column layout is controlled via
 * classes on the palette. Events to hook into palette
 * changed life-cycle are available in addition.
 */
.djs-palette.two-column.open {
  width: 94px;
}

.djs-palette:not(.open) .djs-palette-entries {
  display: none;
}

.djs-palette:not(.open) {
  overflow: hidden;
}

.djs-palette.open .djs-palette-toggle {
  display: none;
}

/**
 * context-pad
 */
.djs-overlay-context-pad {
  width: 72px;
}

.djs-context-pad {
  position: absolute;
  display: none;
  pointer-events: none;
}

.djs-context-pad .entry {
  width: 22px;
  height: 22px;
  text-align: center;
  display: inline-block;
  font-size: 22px;
  margin: 0 2px 2px 0;

  border-radius: 3px;

  cursor: default;

  background-color: #fefefe;
  box-shadow: 0 0 2px 1px #fefefe;
  pointer-events: all;
}

.djs-context-pad .entry:before {
  vertical-align: top;
}

.djs-context-pad .entry:hover {
  background: rgb(255, 252, 176);
}

.djs-context-pad.open {
  display: block;
}

/**
 * popup styles
 */
.djs-popup .entry {
  line-height: 20px;
  white-space: nowrap;
  cursor: default;
}

/* larger font for prefixed icons */
.djs-popup .entry:before {
  vertical-align: middle;
  font-size: 20px;
}

.djs-popup .entry > span {
  vertical-align: middle;
  font-size: 14px;
}

.djs-popup .entry:hover,
.djs-popup .entry.active:hover {
  background: rgb(255, 252, 176);
}

.djs-popup .entry.disabled {
  background: inherit;
}

.djs-popup .djs-popup-header .entry {
  display: inline-block;
  padding: 2px 3px 2px 3px;

  border: solid 1px transparent;
  border-radius: 3px;
}

.djs-popup .djs-popup-header .entry.active {
  color: rgb(255, 116, 0);
  border: solid 1px rgb(255, 116, 0);
  background-color: #f6f6f6;
}

.djs-popup-body .entry {
  padding: 4px 10px 4px 5px;
}

.djs-popup-body .entry > span {
  margin-left: 5px;
}

.djs-popup-body {
  background-color: #fefefe;
}

.djs-popup-header {
  border-bottom: 1px solid #ddd;
}

.djs-popup-header .entry {
  margin: 1px;
  margin-left: 3px;
}

.djs-popup-header .entry:last-child {
  margin-right: 3px;
}

/**
 * popup / palette styles
 */
.djs-popup,
.djs-palette {
  background: #fafafa;
  border: solid 1px #ccc;
  border-radius: 2px;
}

/**
 * touch
 */

.djs-shape,
.djs-connection {
  touch-action: none;
}

.djs-segment-dragger,
.djs-bendpoint {
  display: none;
}

/**
 * bendpoints
 */
.djs-segment-dragger .djs-visual {
  fill: rgba(255, 255, 121, 0.2);
  stroke-width: 1px;
  stroke-opacity: 1;
  stroke: rgba(255, 255, 121, 0.3);
}

.djs-bendpoint .djs-visual {
  fill: rgba(255, 255, 121, 0.8);
  stroke-width: 1px;
  stroke-opacity: 0.5;
  stroke: black;
}

.djs-segment-dragger:hover,
.djs-bendpoints.hover .djs-segment-dragger,
.djs-bendpoints.selected .djs-segment-dragger,
.djs-bendpoint:hover,
.djs-bendpoints.hover .djs-bendpoint,
.djs-bendpoints.selected .djs-bendpoint {
  display: block;
}

.djs-drag-active .djs-bendpoints * {
  display: none;
}

.djs-bendpoints:not(.hover) .floating {
  display: none;
}

.djs-segment-dragger:hover .djs-visual,
.djs-segment-dragger.djs-dragging .djs-visual,
.djs-bendpoint:hover .djs-visual,
.djs-bendpoint.floating .djs-visual {
  fill: yellow;
  stroke-opacity: 0.5;
  stroke: black;
}

.djs-bendpoint.floating .djs-hit {
  pointer-events: none;
}

.djs-segment-dragger .djs-hit,
.djs-bendpoint .djs-hit {
  pointer-events: all;
  fill: none;
}

.djs-segment-dragger.horizontal .djs-hit {
  cursor: ns-resize;
}

.djs-segment-dragger.vertical .djs-hit {
  cursor: ew-resize;
}

.djs-segment-dragger.djs-dragging .djs-hit {
  pointer-events: none;
}

.djs-updating,
.djs-updating > * {
  pointer-events: none !important;
}

.djs-updating .djs-context-pad,
.djs-updating .djs-outline,
.djs-updating .djs-bendpoint,
.connect-ok .djs-bendpoint,
.connect-not-ok .djs-bendpoint,
.drop-ok .djs-bendpoint,
.drop-not-ok .djs-bendpoint {
  display: none !important;
}

.djs-segment-dragger.djs-dragging,
.djs-bendpoint.djs-dragging {
  display: block;
  opacity: 1;
}

.djs-segment-dragger.djs-dragging .djs-visual,
.djs-bendpoint.djs-dragging .djs-visual {
  fill: yellow;
  stroke-opacity: 0.5;
}

/**
 * tooltips
 */
.djs-tooltip-error {
  font-size: 11px;
  line-height: 18px;
  text-align: left;

  padding: 5px;

  opacity: 0.7;
}

.djs-tooltip-error > * {
  width: 160px;

  background: rgb(252, 236, 240);
  color: rgb(158, 76, 76);
  padding: 3px 7px;
  border-radius: 5px;
  border-left: solid 5px rgb(174, 73, 73);
}

.djs-tooltip-error:hover {
  opacity: 1;
}

/**
 * search pad
 */
.djs-search-container {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;

  width: 25%;
  min-width: 300px;
  max-width: 400px;
  z-index: 10;

  font-size: 1.05em;
  opacity: 0.9;
  background: #fafafa;
  border: solid 1px #ccc;
  border-radius: 2px;
}

.djs-search-container:not(.open) {
  display: none;
}

.djs-search-input input {
  font-size: 1.05em;
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ccc;
}

.djs-search-input input:focus {
  outline: none;
  border-color: #52b415;
}

.djs-search-results {
  position: relative;
  overflow-y: auto;
  max-height: 200px;
}

.djs-search-results:hover {
  /*background: #fffdd7;*/
  cursor: pointer;
}

.djs-search-result {
  width: 100%;
  padding: 6px 10px;
  background: white;
  border-bottom: solid 1px #aaa;
  border-radius: 1px;
}

.djs-search-highlight {
  color: black;
}

.djs-search-result-primary {
  margin: 0 0 10px;
}

.djs-search-result-secondary {
  font-family: monospace;
  margin: 0;
}

.djs-search-result:hover {
  background: #fdffd6;
}

.djs-search-result-selected {
  background: #fffcb0;
}

.djs-search-result-selected:hover {
  background: #f7f388;
}

.djs-search-overlay {
  background: yellow;
  opacity: 0.3;
}

/**
 * hidden styles
 */
.djs-element-hidden,
.djs-element-hidden .djs-hit,
.djs-element-hidden .djs-outline,
.djs-label-hidden .djs-label {
  display: none !important;
}
.dms-list-component .items {
  margin: 0;
  padding: 0;
  list-style: none;
  line-height: 1.7em;
}

.dms-list-component .items .item .remove {
  float: right;
}

.dms-fill-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.dms-fill-row > * {
  flex: 0 0 auto;
}

.dms-fill-row > :last-child {
  flex: 1 1 auto;
}

.dms-label {
  font-weight: bold;
  white-space: nowrap;
  margin-right: 5px;
}

.dms-hrule {
  border: 0;
  border-top: dotted 1px #ddd;

  margin: 10px auto;
}

.dms-heading {
  margin: 12px 0 8px;
  font-weight: bold;
}

p.dms-hint a {
  color: #3960a2;
  text-decoration: none;
}

p.dms-hint a:hover {
  color: #4285f4;
}

/* validated input */
p.dms-validation-warning {
  color: #c9302c;
}

h3.dms-heading {
  font-size: 16px;
}

h4.dms-heading {
  font-size: 14px;
}

.dms-validated-input.dms-block .dms-input,
.dms-block {
  display: block;
  width: 100%;
}

.dms-input,
.dms-select {
  outline: none;
  padding: 3px 6px;
  border: 1px solid #ccc;
  background: none;
  font-size: 14px;
  color: #444;
  min-height: 26px;
}

.dms-input {
  min-height: 26px;
  white-space: pre-wrap;
}

.dms-select {
  height: 26px;
}

.dms-input:focus,
.dms-select:focus {
  border-color: #52b415;
}

.dms-select.invalid:focus,
.dms-input.invalid:focus {
  border-color: #c9302c;
}

.dms-input.invalid,
.dms-select.invalid {
  background: #f4cecd;
  border-color: #c9302c;
  color: #c9302c;
}

.dms-script-input {
  height: 150px;

  white-space: pre-wrap;

  overflow: auto;
}

.dms-input-select {
  display: inline-block;
  position: relative;
  min-width: 128px;
}

.dms-input-select .dms-input {
  padding-right: 24px;
}

.dms-input-select .dms-input-select-icon {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
}

.dms-input-select .options {
  background: #fff;
}

.dms-select-options {
  position: fixed;
  background-color: #fff;
  border: solid 1px #ccc;
  border-radius: 2px;
  font-size: 14px;
  color: #444;
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
  z-index: 20;
  cursor: pointer;
}

.dms-select-options .option {
  padding: 4px 9px 4px 9px;
}

.dms-select-options .option.active {
  background: #fafaf0;
}

.dms-select-options .option:focus,
.dms-select-options .option:hover {
  color: #52b415;
}
.dmn-drd-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.dmn-drd-container * {
  box-sizing: border-box;
}

.djs-overlay .drill-down-overlay {
  font-size: 16px;
  background: #52b415;
  color: white;
  text-align: left;
  border-radius: 1px;
  padding: 0 2px;
}

.dmn-definitions {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #fafafa;
  border: solid 1px #ccc;
  border-radius: 2px;
  padding: 4px;
}

.dmn-definitions .dmn-definitions-name {
  font-size: 1.5em;
  padding: 3px;
}

.dmn-definitions .dmn-definitions-name:focus {
  outline: none;
}

.dmn-definitions .dmn-definitions-id {
  font-family: monospace;
  margin-top: 2px;
  padding: 3px;
}

.dmn-definitions .dmn-definitions-id:focus {
  outline: none;
}

.dmn-definitions > [contenteditable]:hover,
.dmn-definitions > [contenteditable]:focus {
  padding: 2px;
  background-color: white;
  border-radius: 2px;
  border: 1px solid #aaaaaa;
}

.djs-container.with-palette .dmn-definitions {
  left: 80px;
}

.djs-container.with-palette-two-column .dmn-definitions {
  left: 130px;
}
.dmn-decision-table-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.dmn-decision-table-container .input-cell .input-label,
.dmn-decision-table-container .input-cell .input-expression,
.dmn-decision-table-container .input-cell .output-label,
.dmn-decision-table-container .input-cell .output-name {
  display: block;
}

.dmn-decision-table-container * {
  box-sizing: border-box;
}

/** actionable icon */
.dmn-decision-table-container .action-icon {
  border-radius: 2px;
  color: #52b415;
  margin-left: 5px;
}

.dmn-decision-table-container .action-icon:before {
  margin-left: 0.1em;
  margin-right: 0.1em;
}

.dmn-decision-table-container .actionable:hover .action-icon {
  background-color: #52b415;
  color: white;
}

/** end actionable icon */

/* basic styles */

.dmn-decision-table-container {
  color: #444;

  max-height: 100%;
}

.dmn-decision-table-container .tjs-table {
  min-width: 100%;
}

/* end basic styles */

/* basic table styles */

.dmn-decision-table-container {
  font-family: "Arial", sans-serif;
  font-size: 14px;
}

.dmn-decision-table-container .tjs-table {
  table-layout: fixed;
  border-collapse: collapse;

  border: solid 1px #444;
}

.dmn-decision-table-container table thead {
  border-bottom: 3px double #444;
}

.dmn-decision-table-container td,
.dmn-decision-table-container th {
  border: solid 1px #444;
  padding: 4px;
}

.dmn-decision-table-container .tjs-table tr .output-cell {
  border-left: 3px double #444;
}

.dmn-decision-table-container .tjs-table tr .output-cell + .output-cell {
  border-left: 1px solid #444;
}

.dmn-decision-table-container th {
  min-width: 192px;
}

.dmn-decision-table-container th,
.dmn-decision-table-container td {
  white-space: pre;
}

.dmn-decision-table-container th.hit-policy {
  width: 40px;
  min-width: 40px;

  vertical-align: top;
}

.dmn-decision-table-container th {
  font-weight: normal;
}

.dmn-decision-table-container th.header {
  text-align: center;
  font-weight: bold;
}

.dmn-decision-table-container th.annotation.header {
  vertical-align: bottom;
}

.dmn-decision-table-container td.rule-index {
  text-align: right;
  padding-right: 8px;
}

.dmn-decision-table-container thead .input-expression,
.dmn-decision-table-container thead .input-variable,
.dmn-decision-table-container thead .output-name,
.dmn-decision-table-container thead .type-ref,
.dmn-decision-table-container .script-editor {
  font-family: monospace;
}

/* end basic table styles */

/* selection styles */

.dmn-decision-table-container th,
.dmn-decision-table-container td,
.dmn-decision-table-container h3,
.dmn-decision-table-container h5 {
  position: relative;
}

.dmn-decision-table-container .selected:after {
  content: "";
  display: block;
  position: absolute;
  top: -1px;
  left: -1px;
  bottom: -1px;
  right: -1px;
  border: solid 2px #4285f4;
  z-index: 1;
  pointer-events: none;
}

.dmn-decision-table-container th.selected:not(.focussed) {
  background: #e9f1ff;
}

/* end selection styles */

/* footer styles */

.dmn-decision-table-container tfoot.add-rule td.add-rule-add {
  text-align: right;
}

.dmn-decision-table-container tfoot.add-rule td {
  border-color: #aaa;
  color: #aaa;
}

.dmn-decision-table-container tfoot.add-rule:hover td {
  border-color: #444;
  color: #444;
}

/* end footer styles */

/* content editable styles */

.dmn-decision-table-container [contenteditable],
.dmn-decision-table-container [tabindex] {
  outline: none;
}

/* end content editable styles */

/* context menu styles */

.dmn-decision-table-container {
  overflow: auto;
  position: relative;
}

/* decision table properties */
.dmn-decision-table-container .decision-table-properties {
  color: #444;
  background-color: #fff;
  display: inline-block;
  border: solid 1px #444;
  margin-bottom: -1px;
  position: relative;
  min-width: 100px;
  max-width: 50%;
}

.dmn-decision-table-container .decision-table-name,
.dmn-decision-table-container .decision-table-id {
  margin: 0;
  padding: 3px 6px;
  text-align: center;
  white-space: pre;
}

.dmn-decision-table-container .decision-table-id.invalid {
  background: #f4cecd;
  color: #c9302c;
}

.dmn-decision-table-container .decision-table-name {
  font-size: 24px;
  line-height: 30px;
  padding: 0.3em;
  font-weight: bold;
}

.dmn-decision-table-container .decision-table-id {
  border-top: 1px solid #444;
  font-family: monospace;
  font-size: 18px;
}

/* end decision table properties */

/* view drd */
.dmn-decision-table-container .view-drd {
  float: right;

  margin-right: 10px;
}

.dmn-decision-table-container .view-drd .view-drd-button {
  background: #fff;
  padding: 8px;
  border: solid 1px #ccc;
  border-radius: 2px;
  font-size: 14px;
  color: #444;
  font-weight: bold;
  cursor: pointer;
  outline: none;
}

.dmn-decision-table-container .view-drd .view-drd-button:hover {
  background: #f6f6f6;
}

/* end view drd */

/* powered by */
.dmn-decision-table-container .powered-by-logo {
  float: right;
  width: 38px;
  z-index: 10;
  cursor: pointer;
}

.dmn-decision-table-container .powered-by-logo .logo {
  width: 100%;
}

.dmn-decision-table-container .powered-by-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.dmn-decision-table-container .powered-by-overlay .powered-by-overlay-content {
  background: #fff;
  padding: 8px;
  border: solid 1px #ccc;
  border-radius: 2px;
  font-size: 14px;
  color: #444;
  display: flex;
  flex-direction: row;
  max-width: 260px;
}

.dmn-decision-table-container
  .powered-by-overlay
  .powered-by-overlay-content
  div:first-child {
  margin-right: 8px;
}

/* end powered by */

/* simple mode */

.dmn-decision-table-container .simple-mode-button {
  color: #444;
  background-color: #f6f6f6;
  position: absolute;
  background: #fff;
  padding: 4px;
  border-radius: 2px;
  border: solid 1px #ccc;
  cursor: pointer;
  font-size: 14px;
  z-index: 2;
  opacity: 0.8;
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
}

.dmn-decision-table-container .simple-mode-button:hover {
  opacity: 1;
}

.dmn-decision-table-container .simple-mode-button.disabled,
.dmn-decision-table-container .simple-mode-button.disabled:hover {
  color: #ccc;
}

/* end simple mode  */

/**
 * badges
 */
.dms-badge {
  border-radius: 2px;
  padding: 3px 6px;
  font-size: 0.8em;
  height: 19px;
}

.dms-badge-icon + .dms-badge-label {
  margin-left: 3px;
}

.dms-badge.dmn-variable-name {
  background: #9e9e9e;
  color: white;
}

.dms-badge.dmn-expression-language {
  background: rgba(84, 146, 250, 0.3);
  color: white;
}

.dms-badge + .dms-badge {
  margin-left: 3px;
}

.dmn-decision-table-container .dmn-expression-language .dms-badge-label {
  display: none;
}

.dmn-decision-table-container
  .input-cell:hover
  .dmn-expression-language
  .dms-badge-label,
.dmn-decision-table-container
  .output-cell:hover
  .dmn-expression-language
  .dms-badge-label {
  display: inline-block;
}

.dmn-decision-table-container .input-editor .dmn-variable-name,
.dmn-decision-table-container .input-editor .dmn-expression-language {
  margin-top: 4px;
  display: inline-block;
}

.dmn-decision-table-container .cell:hover .dms-badge.dmn-expression-language {
  background: #92b9fc;
  z-index: 1;
}

.dmn-decision-table-container .cell .dms-badge.dmn-expression-language {
  z-index: -1;
}

/* cell expression language */

.dmn-decision-table-container .cell .dmn-expression-language {
  display: flex;
  align-items: center;
  position: absolute;
  top: 2px;
  right: 2px;
  pointer-events: none;
}

/* end cell expression language */

/* drag and drop */
.dmn-decision-table-container .dragover:before {
  content: "";
  display: block;
  position: absolute;
  background-color: #666;
  border-radius: 5px;
  z-index: 2;
  pointer-events: none;
}

.dmn-decision-table-container .dragover.top:before {
  left: -6px;
  right: -6px;
  height: 5px;

  top: -3px;
}

.dmn-decision-table-container .dragover.right:before {
  top: -6px;
  bottom: -6px;
  width: 5px;

  right: -3px;
}

.dmn-decision-table-container .dragover.bottom:before {
  left: -6px;
  right: -6px;
  height: 5px;

  bottom: -3px;
}

.dmn-decision-table-container .dragover.left:before {
  top: -6px;
  bottom: -6px;
  width: 5px;

  left: -3px;
}

.dmn-decision-table-container .dragged {
  color: #999;
}

/* cell description */

.dmn-decision-table-container .description-indicator {
  position: absolute;
  top: 0;
  right: -4px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid black;
  transform: rotate(45deg);
  transform-origin: top;
}

/* end cell description */

/* simple string edit */
.dmn-decision-table-container .simple-string-edit,
.dmn-decision-table-container .simple-date-edit {
  width: 250px;
}

.dmn-decision-table-container .input-expression-edit {
  width: 300px;
}

.dmn-decision-table-container .allowed-values-edit .values {
  display: flex;
  flex-wrap: wrap;
}

.dmn-decision-table-container .allowed-values-edit .placeholder {
  color: #ccc;
}

/** create inputs **/
.dmn-decision-table-container .create-inputs {
  white-space: normal;
  border-color: #aaa;
  color: #aaa;
  min-width: 50px;
  width: 50px;
}

.dmn-decision-table-container .create-inputs .add-input {
  margin-left: 0;
  margin-top: 15px;
  display: inline-block;
}

.dmn-decision-table-container .create-inputs:hover {
  border-color: #444;
  color: #444;
}

.dmn-decision-table-container th.create-inputs {
  vertical-align: top;
}
/** end create inputs **/

/* TODO(nikku): namespace and refactor context menu styles */
.dmn-decision-table-container .context-menu {
  position: absolute;
  background: #fff;
  border: solid 1px #ccc;
  border-radius: 2px;
  font-size: 14px;
  color: #444;
  z-index: 10;
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
}

.dmn-decision-table-container .context-menu .context-menu-container {
  margin: 8px;
}

.dmn-decision-table-container .context-menu p {
  margin: 10px 0;
}

.dmn-decision-table-container .context-menu .context-menu-flex {
  display: flex;
}

.dmn-decision-table-container .context-menu.vertical .context-menu-flex {
  flex-direction: column;
}

.dmn-decision-table-container .context-menu.horizontal .context-menu-flex {
  flex-direction: row;
}

.dmn-decision-table-container .context-menu.vertical .context-menu-group {
  padding-bottom: 6px;
  margin-bottom: 6px;
  border-bottom: solid 1px #ccc;
}

.dmn-decision-table-container
  .context-menu.vertical
  .context-menu-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.dmn-decision-table-container .context-menu.horizontal .context-menu-group {
  border-right: solid 1px #ccc;
}

.dmn-decision-table-container
  .context-menu.horizontal
  .context-menu-group:last-child {
  border-right: none;
}

.dmn-decision-table-container
  .context-menu
  .context-menu-group
  .context-menu-group-title {
  font-weight: bold;
  color: #444;
  margin: 6px 9px 6px 9px;
}

.dmn-decision-table-container
  .context-menu
  .context-menu-group
  .context-menu-group-entry {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  white-space: nowrap;
  padding: 4px 9px 4px 9px;
  cursor: pointer;
}

.dmn-decision-table-container
  .context-menu
  .context-menu-group
  .context-menu-group-entry.disabled {
  pointer-events: none;
  color: #ccc;
}

.dmn-decision-table-container
  .context-menu
  .context-menu-group
  .context-menu-group-entry:hover {
  color: #52b415;
}

.dmn-decision-table-container
  .context-menu
  .context-menu-group
  .context-menu-group-entry
  .context-menu-group-entry-icon {
  display: inline-block;
  text-align: center;
  width: 14px;
  margin-right: 6px;
}

.dmn-decision-table-container
  .context-menu
  .context-menu-group
  .context-menu-group-entry
  .context-menu-group-entry-icon:before {
  margin: 0;
}

/* expression language */
.dmn-decision-table-container
  .context-menu
  .context-menu-group
  .context-menu-entry-set-expression-language {
  flex-direction: column;
}

.dmn-decision-table-container
  .context-menu
  .context-menu-group
  .context-menu-entry-set-expression-language
  .expression-language {
  margin-top: 8px;
}

.dmn-decision-table-container p.dms-hint {
  font-size: 0.85em;
  margin-top: 5px;
  color: #888;
}

/* drag and drop */
.dmn-icon-drag {
  color: transparent;
}

.dmn-decision-table-container th .dmn-icon-drag {
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
}

.dmn-decision-table-container th:hover .dmn-icon-drag,
.dmn-decision-table-container td:hover .dmn-icon-drag {
  color: #999;
}

.dmn-icon-drag.horizontal,
.dmn-icon-drag.vertical {
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}

.dmn-icon-drag:hover {
  color: #444;
}

/* description editor */

.dmn-decision-table-container .context-menu .description-editor {
  margin: 0;
  padding: 5px 0;
  width: 192px;
  border-left: solid 3px #444;
}

.dmn-decision-table-container .description-editor .dms-input {
  border: none;
  min-height: 0;
}
.dmn-literal-expression-container {
  font-family: "Arial", sans-serif;
  position: relative;
  color: #444;

  width: 100%;
  height: 100%;
  position: relative;
}

.dmn-literal-expression-container * {
  box-sizing: border-box;
}

/* decision properties */
.dmn-literal-expression-container .decision-properties {
  color: #444;
  background-color: #fff;
  display: inline-block;
  border: 1px solid #444;
  border-bottom: none;
  position: relative;
  min-width: 192px;
  max-width: 50%;
}

.dmn-literal-expression-container .decision-name:not(.editor),
.dmn-literal-expression-container .decision-id:not(.editor) {
  cursor: default;
}

.dmn-literal-expression-container .decision-name.editor,
.dmn-literal-expression-container .decision-id.editor {
  cursor: text;
}

.dmn-literal-expression-container .decision-name,
.dmn-literal-expression-container .decision-id {
  margin: 0;
  padding: 3px 6px;
  text-align: center;
  white-space: pre;
}

.dmn-literal-expression-container .decision-name div,
.dmn-literal-expression-container .decision-id div {
  outline: none;
}

.dmn-literal-expression-container .decision-name.editor:not(.focussed):hover,
.dmn-literal-expression-container .decision-id.editor:not(.focussed):hover {
  cursor: text;
}

.dmn-literal-expression-container .decision-name {
  font-size: 24px;
  line-height: 30px;
  padding: 0.3em;
  font-weight: bold;
}

.dmn-literal-expression-container .decision-id {
  border-top: 1px solid #444;
  font-family: monospace;
  font-size: 18px;
}

/* textarea */
.dmn-literal-expression-container .textarea {
  box-sizing: border-box;
  width: 100%;
  font-family: monospace;
  border: 1px solid #444;
  border-bottom-width: 1px;
  white-space: pre;
  font-size: 14px;
  color: #444;
  height: 250px;
}

.dmn-literal-expression-container .textarea .content,
.dmn-literal-expression-container .textarea .content-editable {
  padding: 12px;
}

.dmn-literal-expression-container .textarea .content-editable {
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.dmn-literal-expression-container .textarea div:focus {
  outline: none;
}

.dmn-literal-expression-container .textarea.editor {
  cursor: text;
}

.dmn-literal-expression-container .textarea:not(.editor) {
  cursor: default;
}

/* literal expression properties */
.dmn-literal-expression-container .literal-expression-properties {
  box-sizing: border-box;
  width: 100%;
  padding: 0;
  border: 1px solid #444;
  border-top: none;
  font-size: 14px;
  color: #444;
}

.dmn-literal-expression-container .literal-expression-properties table {
  border-spacing: 8px;
}

.dmn-literal-expression-container
  .literal-expression-properties
  table
  tr
  td:first-child {
  font-weight: bold;
}

.dmn-literal-expression-container
  .literal-expression-properties
  table
  tr
  td:last-child {
  min-width: 100px;
}

/* view drd */
.dmn-literal-expression-container .view-drd {
  float: right;
  margin-right: 10px;
}

.dmn-literal-expression-container .view-drd .view-drd-button {
  background: #fff;
  padding: 8px;
  border: solid 1px #ccc;
  border-radius: 2px;
  font-size: 14px;
  color: #444;
  font-weight: bold;
  cursor: pointer;
  outline: none;
}

.dmn-literal-expression-container .view-drd .view-drd-button:hover {
  background: #f6f6f6;
}

/* powered by */
.dmn-literal-expression-container .powered-by-logo {
  float: right;
  width: 38px;
  z-index: 10;
  cursor: pointer;
}

.dmn-literal-expression-container .powered-by-logo .logo {
  width: 100%;
}

.dmn-literal-expression-container .powered-by-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.dmn-literal-expression-container
  .powered-by-overlay
  .powered-by-overlay-content {
  background: #fff;
  padding: 8px;
  border: solid 1px #ccc;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  color: #444;
  display: flex;
  flex-direction: row;
  max-width: 260px;
}

.dmn-literal-expression-container
  .powered-by-overlay
  .powered-by-overlay-content
  div:first-child {
  margin-right: 8px;
}

.dmn-decision-table-container p.dms-hint {
  font-size: 0.85em;
  margin-top: 5px;
  color: #888;
}

/* Chrome hack: SVG is rendered more smooth in Windozze. 100% magic, uncomment if you need it. */
/* Note, that will break hinting! In other OS-es font will be not as sharp as it could be */
/*
@media screen and (-webkit-min-device-pixel-ratio:0) {
  @font-face {
    font-family: 'dmn';
    src: url('../font/dmn.svg?37326370#dmn') format('svg');
  }
}
*/

[class^="dmn-icon-"]:before,
[class*=" dmn-icon-"]:before {
  font-family: "dmn";
  font-style: normal;
  font-weight: normal;

  display: inline-block;
  text-decoration: inherit;
  width: 1em;
  text-align: center;
  /* opacity: .8; */

  /* For safety - reset parent styles, that can break glyph codes*/
  font-variant: normal;
  text-transform: none;

  /* fix buttons height, for twitter bootstrap */
  line-height: 1em;

  /* you can be more comfortable with increased icons size */
  /* font-size: 120%; */

  /* Font smoothing. That was taken from TWBS */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  /* Uncomment for 3D effect */
  /* text-shadow: 1px 1px 1px rgba(127, 127, 127, 0.3); */
}

.dmn-icon-up:before {
  content: "\e800";
} /* '' */
.dmn-icon-down:before {
  content: "\e801";
} /* '' */
.dmn-icon-clear:before {
  content: "\e802";
} /* '' */
.dmn-icon-plus:before {
  content: "\e803";
} /* '' */
.dmn-icon-minus:before {
  content: "\e804";
} /* '' */
.dmn-icon-info:before {
  content: "\e805";
} /* '' */
.dmn-icon-left:before {
  content: "\e806";
} /* '' */
.dmn-icon-decision:before {
  content: "\e807";
} /* '' */
.dmn-icon-right:before {
  content: "\e808";
} /* '' */
.dmn-icon-input:before {
  content: "\e809";
} /* '' */
.dmn-icon-output:before {
  content: "\e80a";
} /* '' */
.dmn-icon-copy:before {
  content: "\e80b";
} /* '' */
.dmn-icon-keyboard:before {
  content: "\e80c";
} /* '' */
.dmn-icon-undo:before {
  content: "\e80d";
} /* '' */
.dmn-icon-redo:before {
  content: "\e80e";
} /* '' */
.dmn-icon-menu:before {
  content: "\e80f";
} /* '' */
.dmn-icon-setting:before {
  content: "\e810";
} /* '' */
.dmn-icon-wrench:before {
  content: "\e811";
} /* '' */
.dmn-icon-eraser:before {
  content: "\e812";
} /* '' */
.dmn-icon-attention:before {
  content: "\e813";
} /* '' */
.dmn-icon-resize-big:before {
  content: "\e814";
} /* '' */
.dmn-icon-resize-small:before {
  content: "\e815";
} /* '' */
.dmn-icon-file-code:before {
  content: "\e816";
} /* '' */
.dmn-icon-business-knowledge:before {
  content: "\e817";
} /* '' */
.dmn-icon-knowledge-source:before {
  content: "\e818";
} /* '' */
.dmn-icon-input-data:before {
  content: "\e819";
} /* '' */
.dmn-icon-text-annotation:before {
  content: "\e81a";
} /* '' */
.dmn-icon-connection:before {
  content: "\e81b";
} /* '' */
.dmn-icon-connection-multi:before {
  content: "\e81c";
} /* '' */
.dmn-icon-drag:before {
  content: "\e81d";
} /* '' */
.dmn-icon-lasso-tool:before {
  content: "\e81e";
} /* '' */
.dmn-icon-screw-wrench:before {
  content: "\e81f";
} /* '' */
.dmn-icon-trash:before {
  content: "\e820";
} /* '' */
.dmn-icon-bpmn-io:before {
  content: "\e821";
} /* '' */
.dmn-icon-decision-table:before {
  content: "\e822";
} /* '' */
.dmn-icon-literal-expression:before {
  content: "\e823";
} /* '' */
.dmn-icon-edit:before {
  content: "\e824";
} /* '' */
.dmn-icon-cut:before {
  content: "\e825";
} /* '' */
.dmn-icon-paste:before {
  content: "\f0ea";
} /* '' */
/* end description editor */
</style>
