<template>
  <div id="tasklist">
    <b-list-group>
      <b-card class="mb-3" bg-variant="light" text-variant="dark">
        <h5>Find task by variable</h5>
        <b-form inline>
          <label class="sr-only" for="inlineFormInputName2">Name</label>
          <b-input v-model="variableName" class="mb-2 mr-sm-2 mb-sm-0" placeholder="Variable name"/>
          <label class="sr-only" for="inlineFormInputGroupUsername2">Username</label>
          <b-input-group left="@" class="mt-2 mb-2 mr-sm-2 mb-sm-0">
            <b-input
              v-model="variableValue"
              id="inlineFormInputGroupUsername2"
              placeholder="Variable value"
            />
          </b-input-group>

          <b-button @click="getUnfinishedTasksByQuery" class="mt-2" variant="outline-primary">
            <font-awesome-icon icon="search"/>Search task
          </b-button>
        </b-form>
        <small>
          <i>Total task {{tasks.length}}</i>
        </small>
      </b-card>
      <b-btn
        class="mb-2"
        size="sm"
        variant="outline-warning"
        @click="doneAllVisibleTask"
      >Done first 25</b-btn>
      <b-list-group-item
        :active="checkIsActive(item)"
        @click="changeTaskId(item)"
        button
        :key="item.id"
        v-for="item in tasks.slice(0,25)"
        v-if="item.assignee == null || item.assignee==profile.userName"
        class="flex-column align-items-start"
      > 
        <div v-if="item.assignee == null || item.assignee==profile.userName" id="smallTask">
          <div class="d-flex justify-content-between">
            <h6 class="mb-1">{{item.name}}</h6>
            <small>{{convertDateToHumanStyle(item.created)}}</small>
          </div>
          <p class="mb-1">
            {{item.processDefinitionId}}
            <br>
            <small>
              <router-link
                :to="{name:'processdetail', params:{ processInstanceId: item.processInstanceId}}"
              >
                <b>{{item.processInstanceId}}</b>
              </router-link>
            </small>
          </p>
          <div class="d-flex justify-content-between">
            <small>{{item.assignee}}</small>
            <small>
              <router-link :to="{name:'task', params:{taskId: item.id}}">{{item.id}}</router-link>
            </small>
          </div>
        </div>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import $ from "jquery";

import * as api from "@/api/api";
library.add(faSearch);
export default {
  name: "Tasklist",
  data() {
    return {
      tasks: [],
      tasksWithCamundaSDK: [],
      variableName: "applicationId",
      variableValue: "",
      selectedTaskId: "",

      schema: {
        fields: [
          {
            type: "TCEJson",
            label: "TCEJson",
            required: true
          }
        ]
      },
      variables: {}
    };
  },
  mounted() {
    this.getCandidateGroupTasks();
  },
  computed: {
    taskId() {
      return this.$store.state.taskId;
    },
    profile() {
      return this.$store.getters.getProfile;
    },
    model() {
      var obj = {};
      obj["name"] = JSON.stringify(this.schema);
      return obj;
    },
    camundaProfile() {
      return this.$store.getters.getCamundaProfile;
    },
    isCamundaAuthenticated() {
      return this.$store.getters.isCamundaAuthenticated;
    },
  },
  watch: {
    taskId: function (newValue, OldValue) {
      if (OldValue != null && newValue == null) {
        this.tasks.splice(
          this.tasks.findIndex(function (i) {
            return i.id === OldValue;
          }),
          1
        );
        setTimeout(() => {
          this.getCandidateGroupTasks();
        }, 500);
      }
    }
  },
  methods: {
    getCandidateGroupTasks() {
      var firstRequestCount = 0;
      var searchObjByCandidate = {
        active: true,
        candidateUser: this.camundaProfile.authenticatedUser
      }
      this.$api().post("/task", searchObjByCandidate).then(response => {
        response.data.forEach(task => {
          this.tasks.push(task);
        });
        firstRequestCount = response.data.length;

      })
      var searchObjByUnassigne = {
        active: true,
        unassigned: true
      }
      this.$api().post("/task", searchObjByUnassigne).then(response => {
        response.data.forEach(task => {

          if (firstRequestCount == 0 || this.tasks.filter(e => e.id === task.id).length < 0) {
            this.tasks.push(task);
          }
        });
      })


    },

    getUnfinishedTasksByQuery() {
      api
        .getEntity(
          "task",
          "",
          "active=true&sortBy=created&sortOrder=desc&processVariables=" +
          this.variableName +
          "_eq_" +
          this.variableValue
        )
        .then(value => {
          this.tasks = value;
        });
    },



    checkIsActive: function (item) {
      if (item.id == this.taskId) {
        return true;
      } else return false;
    },
    convertDateToHumanStyle: function (date) {
      return this.$momenttrue(date)
        .startOf("second")
        .fromNow();
    },
    changeTaskId(item) {
      this.selectedTaskId = item.id;
      this.$store.commit("changeTaskId", this.selectedTaskId);
    },
    doneAllVisibleTask() {
      this.$notify({
        group: "foo",
        title: "25 task done",
        type: "success"
      });
      var variables = {};
      var index = 0;
      var BreakException = {};
      this.tasks.forEach(it => {
        this.$api()
          .post("task/" + it.id + "/submit-form", variables
          )
        setTimeout(() => {
        }, 100);
        index = index + 1;
        if (index === 25) throw BreakException;
      })
    }
  }
};
</script>

<style>
</style>
