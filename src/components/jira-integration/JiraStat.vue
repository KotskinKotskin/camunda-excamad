<template>
  <div>
    <b-card class="mb-2" bg-variant="light" text-variant="dark">
      Global process statistic
      <b>{{processId}}</b> from Jira. Total tasks -
      <b>{{globalIssues.length}}</b>
      <br>
      <b-btn v-b-toggle.collapse1_inner size="sm" variant="link">See</b-btn>
      <b-collapse id="collapse1_inner" class="mt-2">
        <li :key="item.key" v-for="item in globalStat">
          Task
          <a :href="calculateJiraUrl(item.key) " target="_blank">{{item.key}}</a>
          <b-badge
            class="ml-1"
            variant="secondary"
            :key="label"
            v-for="label in item.labels"
          >Activity {{label}}</b-badge>
        </li>
      </b-collapse>
    </b-card>

    <b-alert v-if="issues.length < 1" show variant="warning">
      No data in Jira about activity
      <b>{{activityId}}</b> and process
      <b>{{processId}}</b>
    </b-alert>
    <b-alert v-if="issues.length > 0" show variant="success">
      Info about activity
      <b>{{activityId}}</b> and process
      <b>{{processId}}</b>
    </b-alert>

    <b-list-group v-if="issues.length > 0">
      <b-list-group-item class="pt-5 pb-5" :key="item.id" v-for="item in issues">
        <b-card
          :title="item.fields.summary"
          :footer=" 'Updated ' + convertDateToHumanStyle(item.fields.updated)     "
        >
          <b-container class="bv-example-row">
            <b-row class="mb-3">
              <b-col cols="8">
                <img class="face" :src="calculateUserPhotoSource(item.fields.creator.key)"> Author:
                <b>{{item.fields.creator.displayName}} ({{item.fields.creator.emailAddress}})</b>
              </b-col>

              <b-col cols="4">{{convertDateToHumanStyle(item.fields.created)}}</b-col>
            </b-row>

            <b-row>
              <b-col cols="8">
                <b-card bg-variant="light" text-variant="dark">
                  {{shortDescription(item.fields.description)}}
                  <a
                    :href="calculateJiraUrl(item.key) "
                    target="_blank"
                  >look in Jira</a>
                </b-card>

                <img class="face mt-3" :src="calculateUserPhotoSource(item.fields.assignee.key)"> Assignee:
                <b>{{item.fields.assignee.displayName}} ({{item.fields.assignee.emailAddress}})</b>
              </b-col>
              <b-col cols="4">
                <small>
                  <h6>
                    <a :href="calculateJiraUrl(item.key)" target="_blank">{{item.key}}</a>
                  </h6>Status:
                  <b-badge variant="info">{{item.fields.status.name}}</b-badge>
                  <br>Components:
                  <b
                    :key="component.id"
                    v-for="component in item.fields.components"
                  >{{component.name}}</b>
                  <br>Fix verion:
                  <b
                    :key="fixVersion.id"
                    v-for="fixVersion in item.fields.fixVersions"
                  >{{fixVersion.name}}</b>
                  <br>Priority:
                  <b>{{item.fields.priority.name}}</b>
                  <br>Project:
                  <b>{{item.fields.project.name}}</b>
                  <br>Progress:
                  <b>{{item.fields.progress.total}}</b>
                  <br>Subtask:
                  <a
                    :key="subtask.key"
                    v-for="subtask in item.fields.subtasks"
                    :href="calculateJiraUrl(subtask.key)"
                    target="_blank"
                  >{{subtask.key}},</a>
                  <br>Labels:
                  <b-badge
                    class="ml-1"
                    variant="secondary"
                    :key="label"
                    v-for="label in item.fields.labels"
                  >{{label}}</b-badge>
                </small>
              </b-col>
            </b-row>
          </b-container>
        </b-card>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import axios from "axios";
import { REVERSPROXYURL, JIRAPATH, USERPHOTOLOADURL } from "@/config/settings";
export default {
  name: "JiraStat",
  props: ["activityId", "processId"],
  data() {
    return {
      issues: [],
      globalIssues: [],
      globalStat: []
    };
  },
  mounted() {
    this.getIssuesFromJira(this.activityId, this.processId);
    this.getGlobalIssuesFromJira(this.processId);
  },
  computed: {
    token: function() {
      return "Basic " + this.$store.state.auth.token;
    }
  },

  methods: {
    calculateUserPhotoSource(user) {
      return USERPHOTOLOADURL + user + ".png";
    },

    calculateJiraUrl(key) {
      return JIRAPATH + "/browse/" + key;
    },

    shortDescription: function(value) {
      return value.substring(0, 250) + "...";
    },
    convertDateToHumanStyle: function(date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = cal + " (" + rel + ") ";
      return output;
    },
    getIssuesFromJira: function(ActivityId, ProcessId) {
      axios
        .get(
          REVERSPROXYURL +
            JIRAPATH +
            "/rest/api/latest/search?jql=labels = " +
            ActivityId +
            "&labels =" +
            ProcessId,
          { headers: { Authorization: this.token } }
        )
        .then(response => {
          this.issues = response.data.issues;
        });
    },
    getGlobalIssuesFromJira: function(ProcessId) {
      axios
        .get(
          REVERSPROXYURL +
            JIRAPATH +
            "/rest/api/latest/search?jql=labels = " +
            ProcessId +
            "&",
          { headers: { Authorization: this.token } }
        )
        .then(response => {
          this.globalIssues = response.data.issues;
          this.globalStat = [];
          this.globalIssues.forEach(element => {
            var obj = {};
            obj["labels"] = [];
            obj.labels = element.fields.labels;
            obj["key"] = element.key;
            this.globalStat.push(obj);
          });
        });
    }
  }
};
</script>

<style>
.face {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  -ms-flex-item-align: start;
  align-self: flex-start;
  z-index: 1;
}
</style>
