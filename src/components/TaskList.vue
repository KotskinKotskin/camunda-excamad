<template>
  <div id="tasklist">
    <b-list-group>
      <b-card class="mb-3" bg-variant="light" text-variant="dark">
        <h5>Find task by variable</h5>
        <b-form inline>
          <label class="sr-only" for="inlineFormInputName2">Name</label>
          <b-input
            v-model="variableName"
            class="mb-2 mr-sm-2 mb-sm-0"
            id="inlineFormInputName2"
            placeholder="Variable name"
          />
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
      <b-list-group-item
        :active="checkIsActive(item)"
        @click="changeTaskId(item)"
        button
        :key="item.id"
        v-for="item in tasks.slice(0,10)"
        class="flex-column align-items-start"
      >
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
          <small>{{item.id}}</small>
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
      variableName: "caseNumberSD",
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
    this.getUnfinishedTasks();
  },
  computed: {
    taskId() {
      return this.$store.state.taskId;
    },
    model() {
      var obj = {};
      obj["name"] = JSON.stringify(this.schema);
      return obj;
    }
  },
  watch: {
    taskId: function(newValue, OldValue) {
      if (OldValue != null && newValue == null) {
        this.tasks.splice(
          this.tasks.findIndex(function(i) {
            return i.id === OldValue;
          }),
          1
        );
        setTimeout(() => {
          this.getUnfinishedTasks();
        }, 500);
      }
    }
  },
  methods: {
    getUnfinishedTasks() {
      api
        .getEntity("task", "", "active=true&sortBy=created&sortOrder=desc")
        .then(value => {
          this.tasks = value;
        });
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
    checkIsActive: function(item) {
      if (item.id == this.taskId) {
        return true;
      } else return false;
    },
    convertDateToHumanStyle: function(date) {
      return this.$momenttrue(date)
        .startOf("second")
        .fromNow();
    },
    changeTaskId(item) {
      this.selectedTaskId = item.id;
      this.$store.commit("changeTaskId", this.selectedTaskId);
    }
  }
};
</script>

<style>
</style>
