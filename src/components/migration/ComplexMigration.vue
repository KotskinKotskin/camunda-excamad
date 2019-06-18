<template>
  <div id="complex-migration">
    <h2>Complex migration tool</h2>
    <b-card title="1. Select process key">
      <b-card-text>
        <vue-bootstrap-typeahead
          style="width:100%"
          @hit="selectedDefinition =$event"
          :serializer="serialazier"
          v-model="query"
          :data="processDefinitions"
        />
      </b-card-text>
    </b-card>
    <br>

    <b-card title="2. From">
      <b-card-text>
        <label for="select">Select version</label>
        <b-form-select
          v-on:change="refreshOldComponentKey"
          id="select"
          v-model="oldProcessDefinition.id"
          :options="oldProcessDefinition.versions"
        ></b-form-select>
      </b-card-text>
      <br>Select activities to migrate
      <definition-diagram
        :hideSuspend="true"
        :key="componentKeyold"
        :definitionId="oldProcessDefinition.id"
        v-on:DefinitionDiagramClick="HandleClick"
      ></definition-diagram>
      <small>Selected activities</small>
      <li v-bind:key="item" v-for="(item,index) in oldProcessDefinition.activities">
        {{item}}
        <b-btn
          class="mb-2"
          variant="link"
          @click="oldProcessDefinition.activities.splice(index,1)"
        >x</b-btn>
      </li>
    </b-card>
    <br>
    <b-card title="3. To">
      <label for="select">Select version</label>
      <b-form-select
        v-on:change="refreshNewComponentKey"
        id="select"
        v-model="newProcessDefinition.id"
        :options="oldProcessDefinition.versions"
      ></b-form-select>
    </b-card>
    <br>
    <b-card title="4.Check and run">
      <b-btn variant="outline-success" @click="generateAndMigrate">Generate request</b-btn>
      <vue-json-editor v-if="migrationBody != null" v-model="migrationBody" :show-btns="true"></vue-json-editor>

      <b-btn variant="outline-primary" v-if="migrationBody != null" @click="runMigration">Migrate</b-btn>
    </b-card>
  </div>
</template>

<script>
import VueBootstrapTypeahead from "vue-bootstrap-typeahead";
import vueJsonEditor from 'vue-json-editor'
export default {
  name: "complex-migration",
  components: {
    VueBootstrapTypeahead,
    vueJsonEditor
  },
  data() {
    return {
      processKey: "",
      processInstanceQuery: {},
      query: "",
      jsonData: null,
      jsonDataMigrationPlan: null,
      validationError: {},
      selectedDefinition: "",
      processDefinitions: [],
      componentKeyold: 0,
      componentKeynew: 0,
      oldProcessDefinition: {
        id: "",
        xml: "",
        versions: [],
        activities: [],
        statistics: []
      },
      newProcessDefinition: {
        id: "",
        version: [],
        xml: "",
        activities: [],
        statistics: []
      },
      migrationBody: null

    }
  },
  mounted() {
    this.getDefinitions();
  },
  watch: {
    selectedDefinition(newValue, oldValue) {

      this.getVersions(newValue.key);
    }
  },
  methods: {
    HandleClick(payload) {
      if (payload.$type != "bpmn:Participant" && payload.$type != "bpmn:SequenceFlow" && payload.$type != "bpmn:Collaboration") {
        console.log(payload.$type);
        if (this.oldProcessDefinition.activities.indexOf(payload.id) === -1) {
          this.oldProcessDefinition.activities.push(payload.id);
        }
      }
    },
    refreshOldComponentKey() {
      this.oldProcessDefinition.activities = [];
      this.componentKeyold = this.componentKeyold + 1;

    },
    refreshNewComponentKey() {
      this.componentKeynew = this.componentKeynew + 1;
    },
    getDefinitions() {
      this.$api().get('/process-definition?latestVersion=true').then(response => {
        this.processDefinitions = response.data;
      })
    },
    getVersions(processKey) {
      this.oldProcessDefinition.versions = [];
      var localProcessdef = [];
      this.$api().get('/process-definition?key=' + processKey).then(response => {

        response.data.forEach(element => {
          element['value'] = element.id;
          element['text'] = "v" + element.version + " (" + element.id + ")";
          this.oldProcessDefinition.versions.push(element);
        });


      })

    },
    serialazier(item) {
      var value = item.key;

      if (item.name != null) {
        value = value + " (" + item.name + ")";
      }
      return value;
    },
    generateInstructions() {
      var migrationObj = {
        sourceProcessDefinitionId: this.oldProcessDefinition.id,
        targetProcessDefinitionId: this.newProcessDefinition.id,
        updateEventTriggers: true
      }
      this.$api().post('/migration/generate', migrationObj).then(response => {
        this.instrucions = response.data.instructions;
        this.jsonData = this.instrucions;
        var validateObj = {
          sourceProcessDefinitionId: this.oldProcessDefinition.id,
          targetProcessDefinitionId: this.newProcessDefinition.id,
          instrucions: this.instrucions
        }
        this.migrationPlan = validateObj;

      })

    },
    validateInstrucions() {
      var validateObj = {
        sourceProcessDefinitionId: this.oldProcessDefinition.id,
        targetProcessDefinitionId: this.newProcessDefinition.id,
        instrucions: this.instrucions
      }
      this.migrationPlan = validateObj

      this.$api().post('/migration/validate', this.migrationPlan).then(response => {
        this.validationError = response.data;
        this.$notify({
          group: "foo",
          title: "It`s ok",
          type: "success"
        });
      }).catch(error => {
        this.$notify({
          group: "foo",
          title: error,
          type: "error"
        });
      })
    },
    generateMigrationBody() {

      var processInstanceQuery = {
        processDefinitionId: this.oldProcessDefinition.id
      };


      if (this.oldProcessDefinition.activities.length > 0) {
        var listOfActivities = [];
        this.oldProcessDefinition.activities.forEach(element => {
          listOfActivities.push(element);
        });
        processInstanceQuery['activityIdIn'] = listOfActivities

      }
      this.processInstanceQuery = processInstanceQuery;
      this.migratonBody.migrationPlan = this.migrationPlan;
      this.migratonBody.processInstanceQuery = this.processInstanceQuery;
      this.jsonDataMigrationPlan = this.migratonBody;
      console.log(migratonBody);
    },
    generateAndMigrate() {
      var migrationBody = {
        migrationPlan: {
          sourceProcessDefinitionId: this.oldProcessDefinition.id,
          targetProcessDefinitionId: this.newProcessDefinition.id,
          instructions: [],
        },
        processInstanceQuery: {
          processDefinitionId: this.oldProcessDefinition.id
        },
        skipCustomListeners: true
      }
      var generateObj = {
        sourceProcessDefinitionId: this.oldProcessDefinition.id,
        targetProcessDefinitionId: this.newProcessDefinition.id,
        updateEventTriggers: false
      }

      if (this.oldProcessDefinition.activities.length > 0) {
        migrationBody.processInstanceQuery.activityIdIn = []
        this.oldProcessDefinition.activities.forEach(element => {
          migrationBody.processInstanceQuery.activityIdIn.push(element);
        });
      }

      this.$api().post('/migration/generate', generateObj).then(response => {
        migrationBody.migrationPlan.instructions = response.data.instructions;
        this.migrationBody = migrationBody;

      })
    },
    runMigration() {
      this.$api().post('/migration/executeAsync', this.migrationBody).then(response => {
        this.$notify({
          group: "foo",
          title: "It`s ok",
          type: "success"
        });
      }).catch(error => {        this.$notify({
          group: "foo",
          title: error.message,
          text: error.validatonReports,
          type: "error"
        });      });
    },
  }

}
</script>

<style>
.jsoneditor {
  height: 600px;
}
</style>
