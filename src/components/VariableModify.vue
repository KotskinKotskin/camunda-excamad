<template>
  <div>
    <h2 class="mb-3">Variables batch management</h2>
    <b-card-group deck>
      <b-card header="Variables replace" header-bg-variant="info" header-text-variant="white">
        <div class="form-group">
          <label>Variable name</label>
          <input
            v-model="variablesToModify.variableName"
            type="text"
            class="form-control"
            placeholder="applicationId"
          >
        </div>
        <div class="form-group">
          <label>Old variable value</label>
          <input
            v-model="variablesToModify.variableOld"
            type="text"
            class="form-control"
            placeholder="3-MRBA8OKM"
          >
        </div>
        <b-btn
          variant="outline-info"
          @click="getRunnedProcessCounts"
        >Find all actives instance with variable</b-btn>
        <small>
          <p>{{variablesToModify.variableCount}} total</p>
        </small>
        <div class="form-group">
          <hr>
          <label>New variable value</label>
          <input
            v-model="variablesToModify.variableNewValue"
            type="text"
            class="form-control"
            placeholder="applicationId"
          >
        </div>
        <div class="form-group">
          <label>New variable type</label>
          <b-form-select
            v-model="variablesToModify.variableType"
            :options="variablesTypes"
            class="mb-3"
          />
          <b-btn
            variant="outline-success"
            @click="generateModifications"
          >Replace variable in {{variablesToModify.variableCount}} instances</b-btn>
        </div>
      </b-card>

      <b-card header="Create new variables" header-bg-variant="warning" header-text-variant="dark">
        <div class="form-group">
          <div class="form-group">
            <label>Select instance verion</label>
            <b-form-select
              v-model="newVariable.processInstanceIdToModify"
              :options="processDefinitionsStringArray"
            />
          </div>
          <b-btn
           
            variant="outline-warning"
            @click="getInstancesByDefinitions"
          >Find instances</b-btn>
          <br>
          <small>{{processInstancesToModify.length}} total</small>
          <br>
          <hr>
          <label>Variable name</label>
          <input
            v-model="newVariable.variableName"
            type="text"
            class="form-control"
            placeholder="processDefinitionsStringArray"
          >
        </div>
        <div class="form-group">
          <label>Variable value</label>
          <input
            v-model="newVariable.variableValue"
            type="text"
            class="form-control"
            placeholder="applicationId"
          >
        </div>
        <div class="form-group">
          <label>Variable type</label>
          <b-form-select v-model="newVariable.variableType" :options="variablesTypes" class="mb-3"/>

          <b-btn
            variant="outline-warning"
            @click="generateNewVariable"
          >Create variable</b-btn>
        </div>
      </b-card>
    </b-card-group>
  </div>
</template>


<script>
export default {
  name: "VariableModify",
  data() {
    return {
      processDefinitions: [],
      processDefinitionsStringArray: [],
      processInstancesToModify: [],
      variablesToModify: {
        variableName: "waitingCSSResponseAlertTimer",
        variableNewValue: "testVariable",
        variableType: "String",
        variableCount: 0,
        variableOld: "PT3600S"
      },
      newVariable: {
        variableName: "",
        variableValue: "",
        processInstanceIdToModify: "",
        variableType: "String"
      },
      modifications: {},
      variablesTypes: [
        "Boolean",
        "Date",
        "String",
        "Double",
        "Integer",
        "Long",
        "Object"
      ]
    };
  },
  created() {
    this.getProcessDefinitionsArray();
  },
  methods: {

    getProcessDefinitionsArray() {
            this.$api()
        .get("/process-definition?sortBy=version&sortOrder=desc")
        .then(response => {
          this.processDefinitions = response.data;

          response.data.forEach (element => {
            this.processDefinitionsStringArray.push(element.id)
          } )
          
        })

    },
    generateModifyAdnSendModify() {
      this.$notify({
        group: "foo",
        title: "Modification runned"
      });
      this.generateModifications();
      setTimeout(() => {
        this.modifyVariables();
      }, 500);
    },
    getRunnedProcessCounts() {
      if (isFinite(this.variablesToModify.variableOld)) {
        this.variablesToModify.variableOld = Number(this.variablesToModify.variableOld);
      }

      var postObj = {
        variableValues: [{ name: this.variablesToModify.variableName, operator: "eq", value: this.variablesToModify.variableOld }]
      }

      this.$api()
        .post(
          "/variable-instance/count", postObj
        )
        .then(responce => {
          this.variablesToModify.variableCount = responce.data.count;
        })
        .catch((this.variablesToModify.variableCount = 0));
      this.getRunnedProcessInstances();
    },
    getRunnedProcessInstances() {
      this.processInstancesToModify = [];
      if (isFinite(this.variablesToModify.variableOld)) {
        this.variablesToModify.variableOld = Number(this.variablesToModify.variableOld);
      }

      var postObj = {
        variableValues: [{ name: this.variablesToModify.variableName, operator: "eq", value: this.variablesToModify.variableOld }]
      }
      this.$api()
        .post(
          "/variable-instance", postObj
        )
        .then(responce => {
          responce.data.forEach(element => {
            this.processInstancesToModify.push(element.processInstanceId);
          });
        });
    },
    modifyVariables(item) {
      this.$api()
        .post("/process-instance/" + item + "/variables", {
          modifications: this.modifications
        })
        .then(response => {
          this.$notify({
            group: "foo",
            title: "Variable modified",
            text: "In instance " + item,
            type: "success"
          });
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Variable NOT modified",
            text: error,
            type: "error"
          });
        });
    },
    generateModifications() {
      var values = {};
      values["value"] = this.variablesToModify.variableNewValue;
      values["type"] = this.variablesToModify.variableType;
      var variableToPush = {};
      variableToPush[this.variablesToModify.variableName] = values;
      this.modifications = variableToPush;
      this.processInstancesToModify.forEach(process => {
        this.modifyVariables(process);
        setTimeout(() => {

        }, 200);
      });
    },
    generateNewVariable() {
      var value = {};
      value["value"] = this.newVariable.variableValue;
      value["type"] = this.newVariable.variableType;
      var variableToPush = {};
      variableToPush[this.newVariable.variableName] = value;
      this.modifications = variableToPush;
      this.processInstancesToModify.forEach(process => {
        this.modifyVariables(process);
      });
    },
    getInstancesByDefinitions() {
      this.processInstancesToModify = [];
      this.$api()
        .get(
          "/process-instance?processDefinitionId=" +
          this.newVariable.processInstanceIdToModify
        )
        .then(responce => {
          responce.data.forEach(element => {
            this.processInstancesToModify.push(element.id);
          });
        });
    }
  }
};
</script>
