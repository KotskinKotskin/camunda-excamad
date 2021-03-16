<template>
  <div>
    <deploy-table-bpmas :key="componentKey"></deploy-table-bpmas>
  </div>
</template>

<script>
export default {
  name: "DeployTableBPMaS",
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
