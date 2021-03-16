<template>
  <div>
    <new-diagram :diagramKey="diagramKey" :key="componentKey"></new-diagram>
  </div>
</template>

<script>
export default {
  name: "newDiagramView",
  props: ["diagramKey"],
  data() {
    return {
      componentKey: 0
    };
  },
  created() {
    this.$store.commit("changeworkOnBpmasservice", true);
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
