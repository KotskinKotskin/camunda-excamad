<template>
  <div>
    <deploy-table :key="componentKey"></deploy-table>
  </div>
</template>

<script>
export default {
  name: "DeployTableView",
  data() {
    return {
      componentKey: 0
    };
  },
  computed: {
    serverStatus: function() {
      return this.$store.state.serverStatus;
    },
    BaseUrl: function() {
      return this.$store.state.baseurl;
    }
  },
  watch: {
    BaseUrl: function() {
      this.componentKey += 1;
    }
  }
};
</script>
