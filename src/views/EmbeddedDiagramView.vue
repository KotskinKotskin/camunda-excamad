<template>
<div> 
<embeddeddiagram :key="componentKey" > </embeddeddiagram>


</div>
</template>

<script>
export default {
  name: "EmbeddedDiagramView",
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
