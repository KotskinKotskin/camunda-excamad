<template>
<div class="taskListView" >

<b-container class="bv-example">
    <b-row>
        <b-col cols="4"><tasklist :key="componentKeyTasklist"></tasklist></b-col>
        <b-col><task-details :key="componentKeyTaskDetails"> </task-details></b-col>
    </b-row>
</b-container>


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
    serverStatus: function() {
      return this.$store.state.serverStatus;
    },
    BaseUrl: function() {
      return this.$store.state.baseurl;
    },
    TaskId: function() {
      return this.$store.state.taskId;
    }
  },
  watch: {
    BaseUrl: function() {
      this.$store.commit("changeTaskId", null);
      this.componentKeyTasklist += 1;
      this.componentKeyTaskDetails += 1;
    },
    TaskId: function() {
      this.componentKeyTaskDetails += 1;
    }
  }
};
</script>

<style>
</style>
