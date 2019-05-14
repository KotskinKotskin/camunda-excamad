<template>
  <div class="taskListView1">
    <b-alert :show="!isAuthenticated" variant="danger">Please login</b-alert>
    <b-alert
      :show="isAuthenticated && !isCamundaAuthenticated"
      variant="warning"
    >Your profile didn`t connected to current Camunda. You can see and done only unassigned task.</b-alert>
    <div class="bv-example" v-if="isAuthenticated">
      <b-row>
        <b-col cols="3">
          <tasklist :key="componentKeyTasklist"></tasklist>
        </b-col>
        <b-col>
          <task-details :key="componentKeyTaskDetails"></task-details>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
export default {
  name: "TaskListView",
  data() {
    return {
      componentKeyTasklist: 0,
      componentKeyTaskDetails: 1
    };
  },
  computed: {
    serverStatus: function () {
      return this.$store.state.serverStatus;
    },
    BaseUrl: function () {
      return this.$store.state.baseurl;
    },
    TaskId: function () {
      return this.$store.state.taskId;
    },
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
    },
  },
  watch: {
    BaseUrl: function () {
      this.$store.commit("changeTaskId", null);
      this.componentKeyTasklist += 1;
      this.componentKeyTaskDetails += 1;
    },
    TaskId: function () {
      this.componentKeyTaskDetails += 1;
    }
  }
};
</script>

<style>
</style>
