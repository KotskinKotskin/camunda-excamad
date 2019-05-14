<template>
  <div>
    <h3>Start process definitions</h3>
    <b-table hover :items="processDefinitions" :fields="fields" striped>
      <template slot="start" slot-scope="row">
        <start-definition class="mb-2 text-left" :definitionId="row.item.id"></start-definition>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  name: "StartDefinitions",
  data() {
    return {
      processDefinitions: [],
      fields: ["id", "key", "name", "name", "version", "start"]
    }
  },
  methods: {
    getProcessDefinitions() {
      this.$api()
        .get(
          "/process-definition?sortBy=version&sortOrder=desc&latestVersion=true"
        ).then(response => {
          this.processDefinitions = response.data;
        })
    }
  },

  mounted() {
    this.getProcessDefinitions();
  },

}
</script>

<style>
</style>
