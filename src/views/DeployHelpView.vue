<template>
  <div>
    <deploy-help :diagramId="diagramId" :key="componentKey"></deploy-help>
  </div>
</template>

<script>
export default {
  name: "DeployHelpView",
  props: ["diagramId"],
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
