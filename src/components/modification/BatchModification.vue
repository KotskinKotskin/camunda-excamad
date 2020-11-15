<template>
  <div id="batch-modification">
    <h2>Batch modification</h2>
    <b-card title="1. Select process and activities">
      <div class="form-group">
        <label>Process Definition Key</label>
        <vue-bootstrap-typeahead
            style="width:100%"
            @hit="selectedDefinition =$event"
            :serializer="serialazier"
            v-model="selectedDefinition.id"
            :data="processDefinitions"
        />
      </div>
      <div class="form-group">
        <label>Process Definition Version</label>
        <b-form-select
            v-on:change="refreshComponentKey"
            id="select"
            v-model="processDefinition.id"
            :options="processDefinition.versions"
        />
      </div>
      <definition-diagram
          :hideSuspend="true"
          :key="componentKey"
          :definitionId="processDefinition.id"
          v-on:DefinitionDiagramClick="handleClick"
      ></definition-diagram>
      <b-container fluid="false" v-if="processDefinition.id.length !== 0">
        <b-row class="mt-3">
          <b-col md="auto">
            <b-btn variant="outline-primary" @click="assignFromActivity">From</b-btn>
          </b-col>
          <b-col md="auto" align-self="center">
            <p v-if="activityFrom != null">{{ activityFrom }}</p>
            <p v-if="activityFrom == null">Please, select activity and press <b>From</b> button</p>
          </b-col>
          <b-col md="auto">
            <b-btn class="mb-2" variant="link" @click="activityFrom = null">x</b-btn>
          </b-col>
        </b-row>
        <b-row class="mt-3">
          <b-col md="auto">
            <b-btn variant="outline-primary" @click="assignToActivity">To</b-btn>
          </b-col>
          <b-col md="auto" align-self="center">
            <p v-if="activityTo != null">{{ activityTo }}</p>
            <p v-if="activityTo == null">Please, select activity and press <b>To</b> button</p>
          </b-col>
          <b-col md="auto">
            <b-btn class="mb-2" variant="link" @click="activityTo = null">x</b-btn>
          </b-col>
        </b-row>
        <b-row class="mt-3">
          <b-col md="auto">
            <b-form-radio v-model="startActivityOption" value="before">Start <b>Before</b> activity
            </b-form-radio>
            <b-form-radio v-model="startActivityOption" value="after">Start <b>After</b> activity
            </b-form-radio>
          </b-col>
        </b-row>
      </b-container>
    </b-card>
    <b-card title="2. Filter processes">
      <div class="form-group">
        <b-form-checkbox
            id="only-incidents-checkbox"
            v-model="onlyIncidents"
            value="true"
            unchecked-value="false"
        >
          Only filedJob incidents
        </b-form-checkbox>
        <b-form-checkbox
            id="by-business-key-checkbox"
            v-model="byBusinessKey"
            value="true"
            unchecked-value="false"
        >
          By businessKey
        </b-form-checkbox>
        <b-container fluid="false" v-if="byBusinessKey === 'true'">
          <b-row class="mt-3">
            <b-col>
              <b-form-textarea
                  id="business-key-list"
                  v-model="businessKeysText"
                  placeholder="Enter list of businessKeys, one per row"
                  rows="10"
                  no-resize
              ></b-form-textarea>
            </b-col>
          </b-row>
        </b-container>
      </div>
    </b-card>
    <b-card title="3. Generate request">
      <div class="form-group">
        <b-btn @click="generateRequest">Generate</b-btn>
        <vue-json-editor v-if="request != null" v-model="request"
                         :show-btns="true"></vue-json-editor>
      </div>
    </b-card>
    <b-card title="4. Run modification">
      <div class="form-group">
        <b-btn v-bind:disabled="isRunDisabled" @click="runModification">Run</b-btn>
      </div>
    </b-card>
  </div>
</template>

<script>
import VueBootstrapTypeahead from "vue-bootstrap-typeahead";
import vueJsonEditor from 'vue-json-editor'

const START_ACTIVITY_OPTION = {
  BEFORE: 'startBeforeActivity',
  AFTER: 'startAfterActivity',
}

export default {
  name: "batch-modification",
  components: {
    VueBootstrapTypeahead, vueJsonEditor
  },
  data() {
    return {
      processKey: "",
      selectedDefinition: "",
      processDefinitions: [],
      componentKey: 0,
      processDefinition: {
        id: "",
        xml: "",
        versions: [],
        statistics: []
      },
      selectedActivity: null,
      activityFrom: null,
      activityTo: null,
      startActivityOption: "before",
      onlyIncidents: false,
      byBusinessKey: false,
      businessKeysText: "",
      request: null,
      isRunDisabled: false
    }
  },
  mounted() {
    this.getDefinitions();
  },
  watch: {
    selectedDefinition(newValue, oldValue) {
      this.getVersions(newValue.key);
      this.refreshComponentKey()
      this.processDefinition.id = ""
      this.processDefinition.xml = ""
      this.processDefinition.statistics = []
    },
    request(newValue, oldValue) {
      this.isRunDisabled = false
    }
  },
  methods: {
    handleClick(payload) {
      if (payload.$type !== "bpmn:Participant" && payload.$type !== "bpmn:SequenceFlow"
          && payload.$type !== "bpmn:Collaboration") {
        this.selectedActivity = payload.id;
      }
    },
    assignFromActivity() {
      this.activityFrom = this.selectedActivity
    },
    assignToActivity() {
      this.activityTo = this.selectedActivity
    },
    generateRequest() {
      this.$api()
      .get(
          `/process-instance?processDefinitionId=${this.processDefinition.id}&activityIdIn=${this.activityFrom}${this.onlyIncidents
          === "true" ? '&incidentType=failedJob' : ''}`
      )
      .then(response => {
        const processInstanceIds = this.applyFilters(response.data).map(process => process.id)
        this.request = {
          skipCustomListeners: true,
          skipIoMappings: true,
          processDefinitionId: this.processDefinition.id,
          processInstanceIds: processInstanceIds,
          instructions: this.createInstructions()
        };
      })
      .catch(error => {
        this.request = null
        this.$notify({
          group: "foo",
          title: 'Cannot get process instance ids for selected filters',
          text: error,
          type: "error"
        });
      });
    },
    createInstructions() {
      let instructions = []
      if (this.activityFrom !== null) {
        instructions.push({
          type: "cancel",
          activityId: this.activityFrom
        })
      }
      if (this.activityTo !== null) {
        instructions.push({
          type: this.startActivityOption === "before" ? START_ACTIVITY_OPTION.BEFORE
              : START_ACTIVITY_OPTION.AFTER,
          activityId: this.activityTo
        })
      }
      return instructions
    },
    applyFilters(processes) {
      if (this.byBusinessKey !== "true") {
        return processes
      }
      const businessKeys = new Set(this.businessKeysText.match(/[^\r\n]+/g))
      return processes.filter(process => businessKeys.has(process.businessKey))
    },
    runModification() {
      this.$api()
      .post(
          "/modification/executeAsync",
          this.request
      )
      .then(() => {
        this.$notify({
          group: "foo",
          title: "Batch created",
          text: "Modification batch created",
          type: "success"
        });
        this.isRunDisabled = true
      })
      .catch(error => {
        this.$notify({
          group: "foo",
          title: "Not moved",
          text: error,
          type: "error"
        });
      });
    },
    refreshComponentKey() {
      this.activityTo = null
      this.activityFrom = null
      this.componentKey = this.componentKey + 1;

    },
    getDefinitions() {
      this.$api().get('/process-definition?latestVersion=true').then(response => {
        this.processDefinitions = response.data;
      })
    },
    getVersions(processKey) {
      this.$api().get('/process-definition?key=' + processKey).then(response => {
        this.processDefinition.versions = response.data.map(element => (
            {
              value: element.id,
              text: `v${element.version} (${element.id})`
            }
        ))
      })
      .catch(error => {
        this.processDefinition.versions = []
        this.$notify({
          group: "foo",
          title: "Error during fetching process definition versions",
          text: error,
          type: "error"
        });
      });
    },
    serialazier(item) {
      if (!item.name) {
        return item.key
      }
      return `${item.key} (${item.name})`
    }
  }

}
</script>

<style>
.jsoneditor {
  height: 600px;
}
</style>
