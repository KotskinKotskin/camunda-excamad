<template>
  <div id="selectedTaskView">
    <selectedTask :taskId="taskId"></selectedTask>
  </div>
</template>

<script>
export default {
  name: "selectedTaskView",
  props: ["taskId"]
};
</script>

<style>
</style>
