<template>
  <div>
    <b-alert :show="taskDetails == null" variant="warning">{{taskDetails}}No such task!</b-alert>
    <div v-if="taskDetails != null">
      <b-alert :show="!isCamundaAuthenticated" variant="primary">
        Login to take a task.
        <b>May be your camunda didnt connected to our Active Directory</b>
      </b-alert>
      <div v-if="isCamundaAuthenticated" class="bv-example">
        <h3>{{taskDetails ? taskDetails.name : ''}}</h3>
        <b-row>
          <b-col cols="3">
            <b-card class="mb-3" bg-variant="light" text-variant="dark">
              <b>Candidate</b>
              <li
                v-bind:key="item.index"
                v-for="item in identitylinks"
              >{{item.userId ? item.userId : '' }} {{item.groupId ? item.groupId : ''}} ({{item.type}})</li>
              <hr>
              <b>Assignee</b>
              <br>
              {{taskDetails.assignee ? taskDetails.assignee : "" }}
              <b-button
                size="sm"
                @click="claimTask"
                v-if="taskDetails.assignee == null"
                variant="outline-info"
              >
                <font-awesome-icon icon="child"/>Claim to me
              </b-button>
              <b-btn
                v-if="canTakeTask && taskDetails.assignee != null"
                @click="unclaimTask"
                size="sm"
                variant="outline-secondary"
              >Unclaim</b-btn>
              <hr>
              <b>Created</b>
              <br>
              {{convertDateToHumanStyle(taskDetails.created)}}
              <hr>
              <b>Due</b>
              <br>
              {{ taskDetails.due !=null ? convertDateToHumanStyle(taskDetails.due) : "no due" }}
              <hr>
              <b>Process Instance</b>
              <br>
              <router-link
                :to="{name:'processdetail', params:{ processInstanceId: taskDetails.processInstanceId}}"
              >
                <b>{{taskDetails.processInstanceId}}</b>
              </router-link>
              <hr>
              <b>Process definition</b>
              <br>
              <router-link
                :to="{name:'definition', params:{ definitionId: taskDetails.processDefinitionId}}"
              >
                <b>{{taskDetails.processDefinitionId}}</b>
              </router-link>

              <hr>
            </b-card>
          </b-col>
          <b-col>
            <div v-if="canTakeTask ">
              <task-details></task-details>
            </div>
            <b-alert :show="!canTakeTask" variant="danger">
              You cant take this task. Task assigned to
              <b>{{taskDetails.assignee}}</b>
            </b-alert>
          </b-col>
        </b-row>

        <div id="comments1">
          <h5>Comments</h5>

          <b-card class="mb-3" text-variant="dark">
            <b-form-textarea
              v-on:keyup.enter="sendComments"
              class="mb-4"
              id="textarea"
              v-model="message"
              placeholder="Enter comment..."
              rows="1"
              max-rows="3"
            ></b-form-textarea>
            <b-button
              :disabled="message.length ==0"
              @click="sendComments"
              block
              variant="outline-primary"
            >Send</b-button>
            <hr>

            <b-card
              v-for="item in comments"
              :key="item.id"
              :header="convertDateToHumanStyle(item.time)"
              footer-tag="footer"
              class="text-left mb-3"
            >
              {{item.message}}
              <em slot="footer">
                <img class="face" :src="calculatePhoto(item.userId)">
                {{item.userId}}
              </em>
            </b-card>
          </b-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as api from "@/api/api";
import { USERPHOTOLOADURL } from "@/config/settings";
export default {
  name: "selectedTask",
  props: ["taskId"],
  data() {    return {
      taskDetails: null,
      canTakeTask: true,
      comments: [],
      identitylinks: [],
      message: '',
      inCandidateGroup: false
    }  },
  mounted() {
    setTimeout(() => {
      this.$store.commit("changeTaskId", this.taskId);
      this.getTaskDetails();
      this.getTaskIdentityLinks();
    }, 200);




  },
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    },
    isCamundaAuthenticated() {
      return this.$store.getters.isCamundaAuthenticated;
    },
    authStatus() {
      return this.$store.getters.authStatus;
    },
    profile() {
      return this.$store.getters.getProfile;
    },
    camundaProfile() {
      return this.$store.getters.getCamundaProfile;
    }
  },
  watch: {
    isCamundaAuthenticated(newValue, oldValue) {
      console.log("isCamundaAuthenticated");
      this.checkPossibilityTakeTask();
    }
  },
  methods: {
    calculatePhoto(user) {
      return USERPHOTOLOADURL + user + ".png";
    },
    getTaskDetails() {

      this.$api().get('/task/' + this.taskId).then(response => {
        this.taskDetails = response.data;

        setTimeout(() => {
          this.checkPossibilityTakeTask();
        }, 100);


        this.getComments();
      })
    },
    getComments() {
      this.comments = [];
      this.$api().get('/task/' + this.taskId + '/comment').then(response => {

        response.data.forEach(element => {
          var first = element.message.indexOf('#');
          var second = element.message.indexOf('#', first
            + 1);
          element.userId = element.message.substr(first + 1, second - first - 1);
          console.log(element.userId);
          element.message = element.message.substring(0, first);
        });
        this.comments = response.data;
      })


    },
    sendComments() {

      var userAddon = "#" + this.profile.userName + "#"
      var comment = {
        message: this.message + userAddon
      }
      this.$api().post('/task/' + this.taskId + '/comment/create', comment).then(response => {
        console.log(response.data);
        this.getComments();
      })
    },
    getTaskIdentityLinks() {
      this.$api().get('/task/' + this.taskId + '/identity-links').then(response => {
        this.identitylinks = response.data;
        this.checkCandidateGroup();
      })
    },
    convertDateToHumanStyle: function (date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    },
    checkPossibilityTakeTask() {
      if (this.taskDetails && this.taskDetails.assignee != null) {
        if (this.profile.userName == this.taskDetails.assignee) {
          this.canTakeTask = true;
        }
        else this.canTakeTask = false;
      }
      else this.canTakeTask = true;
    },
    unclaimTask() {
      this.$api().post('/task/' + this.taskId + "/unclaim").then(response => {
        this.getTaskDetails();

      })

    },
    claimTask() {
      var userId = {
        userId: this.profile.userName
      }
      this.$api().post('/task/' + this.taskId + "/claim", userId).then(response => { this.getTaskDetails(); })


    },
    checkCandidateGroup() {
      this.identitylinks.forEach(identity => {
        this.camundaProfile.groups.forEach(camundaGroup => {
          if (identity.groupId == camundaGroup.id && identity.type == "candidate") {
            this.inCandidateGroup = true;
          }
        })
      })

    }


  }

}
</script>

<style scoled>
</style>
