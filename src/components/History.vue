<template>
  <div class id="baseView">
    <h2>Select variable or instance</h2>
    <div class="row">
      <div class="col-4">
        <form>
          <div class="form-group">
            <label>Variable name</label>
            <input
              v-model="variable.variableName"
              type="text"
              class="form-control"
              placeholder="applicationId"
            >
          </div>
          <div class="form-group">
            <label>Variable value</label>
            <input
              v-model="variable.variableValue"
              type="text"
              class="form-control"
              placeholder="3-MRBA8OKM"
            >
          </div>
          <b-btn
            size="sm"
            @click="findHistoryAndRuntimeInstancesByVariable"
            variant="outline-primary"
          >Find instances {{variable.variableName}}={{variable.variableValue}}</b-btn>
          <hr>
        </form>
        <form>
          <div class="form-group">
            <label>
              <b>OR</b> instance
            </label>
            <input
              v-model="processInstanceForSearch"
              type="text"
              class="form-control"
              placeholder="3-MRBA8OKM"
            >
          </div>
          <b-btn
            size="sm"
            @click="findHistoryAndRuntimeInstaancesByProcessId"
            variant="outline-primary"
          >Find {{processInstanceForSearch}} instance</b-btn>
        </form>
      </div>
      <div class="col-8">
        <h5
          v-if="variableHistoryElements.length!= 0 "
        >Total {{variableHistoryElements.length}} elements</h5>
        <h5 v-if="variableHistoryElements.length == 0 && searchTryed == true">Nothing there...
          <router-link to="/stream">check live stream.</router-link>
        </h5>
        <div
          v-bind:key="item.id"
          v-for="item in variableHistoryElements"
          v-if="variableHistoryElements.length!= 0"
          role="tablist"
        >
          <b-card no-body class="mb-1">
            <b-btn
              @click="getProcessInstanceHisoryAndCalculateActivity(item)"
              class="text-left"
              block
              v-b-toggle="'collapse2'+item.id"
              :variant="returnCssClassFromAccordion(item)"
            >
              Process
              <b>{{item.processDefinitionId}}</b>, instance
              <b>{{item.processInstanceId}}</b>
            </b-btn>
            <b-collapse v-bind:id="'collapse2'+item.id" accordion="my-accordion" role="tabpanel">
              <b-card v-if="item.needShow ==true">
                <small>
                  <div
                    :key="incident.id"
                    v-if="item.isIncident == true"
                    v-for="incident in item.incidents"
                  >
                    <b-alert show variant="warning">
                      <b-badge
                        variant="info"
                      >{{convertDateToHumanStyle(incident.incidentTimestamp)}}</b-badge>
                      <b>
                        <i>{{incident.activityId}}</i>
                        {{incident.incidentMessage}}
                      </b>
                    </b-alert>
                  </div>
                </small>
                <acitivity-list :processInstanceItem="item"></acitivity-list>
              </b-card>
            </b-collapse>
          </b-card>
        </div>
      </div>
    </div>
    <b-btn variant="outline-info" size="sm" class="mt-5 fixed-button-2" v-scroll-to="'#baseView'">⇑</b-btn>
    <b-btn
      variant="outline-info"
      size="sm"
      class="mt-5 fixed-button"
      v-scroll-to="'#variablesLine'"
    >⇓</b-btn>
    <hr id="variablesLine">
    <variable-list
      v-if="clickedToInstanceSearch==true && reshowVariablelist==false"
      :processInstanceId="processInstanceForSearch"
    ></variable-list>
  </div>
</template>
<script>
import * as api from "@/api/api";
export default {
  name: "history",
  data() {
    return {
      variable: {
        variableName: "applicationId",
        variableValue: "3-MRXJM9P0"
      },
      processInstanceForSearch: "376497",
      searchTryed: false,
      clickedToInstanceSearch: false,
      reshowVariablelist: false,
      processInstancesLoadedIds: "",
      variableHistoryElements: []
    };
  },

  methods: {
    getVariableHistory() {
      api
        .getEntity(
          "history",
          "variable-instance",
          "variableName=" +
            this.variable.variableName +
            "&&variableValue=" +
            this.variable.variableValue +
            "&&sortBy=instanceId&&sortOrder=desc"
        )
        .then(value => {
          this.variableHistoryElements = value;
          this.searchTryed = true;
        });
    },
    returnCssClassFromAccordion: function(item) {
      if (item.isIncident == true) {
        return "danger";
      }
      if (item.isActive == true && item.isIncident == false) {
        return "success";
      }
      if (item.isActive == false && item.isIncident == false) {
        return "secondary";
      }
    },
    convertDateToHumanStyle: function(date) {
      return this.$momenttrue(date)
        .startOf("second")
        .fromNow();
    },
    getVariableHistoryByProcessInstanceId() {
      this.variableHistoryElements = [];
      api
        .getEntity(
          "history",
          "variable-instance",
          "processInstanceId=" + this.processInstanceForSearch
        )
        .then(value => {
          var abc = value;
          this.variableHistoryElements.push(abc[0]);
        });
    },
    findHistoryAndRuntimeInstaancesByProcessId() {
      this.getVariableHistoryByProcessInstanceId();

      setTimeout(() => {
        this.CheckRunnedInstance();
      }, 1000);
      this.clickedToInstanceSearch = true;
    },

    findHistoryAndRuntimeInstancesByVariable() {
      this.getVariableHistory();

      setTimeout(() => {
        this.CheckRunnedInstance();
      }, 1000);
    },

    getProcessInstanceHisoryAndCalculateActivity(item) {
      if (item.needShow == true) {
        item.needShow = false;
      } else vm.$set(item, "needShow", true);
      this.processInstanceForSearch = item.processInstanceId;
      this.clickedToInstanceSearch = true;
      this.reshowVariablelist = true;
      setTimeout(() => {
        this.reshowVariablelist = false;
      }, 300);
    },

    CheckRunnedInstance() {
      var arr = this.variableHistoryElements;
      arr.forEach(function(item) {
        vm.$api()
          .get(
            "/process-instance/" +
              item.processInstanceId +
              "/activity-instances"
          )
          .then(response => {
            vm.$set(item, "isActive", true);
            vm.$api()
              .get("/incident?processInstanceId=" + item.processInstanceId)
              .then(response => {
                if (response.data.length != 0) {
                  vm.$set(item, "isIncident", true);
                  vm.$set(item, "incidents", response.data);
                } else {
                  vm.$set(item, "isIncident", false);
                }
              });
          })
          .catch();
      });
    }
  }
};
</script>

<style>
.fixed-button {
  position: fixed;
  top: 70%;
  right: 1%;
  z-index: 9999;
  border-radius: 45px;
}
.fixed-button-2 {
  position: fixed;
  top: 65%;
  right: 1%;
  z-index: 9999;
  border-radius: 45px;
}
</style>


