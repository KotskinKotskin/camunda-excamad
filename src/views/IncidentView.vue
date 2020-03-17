<template>
  <div id="incidentView" class="incidentView">
  <incident :key="componentKey" v-if="serverStatus == true"> </incident>
  <noConnect v-if="serverStatus != true"> </noConnect>
  </div>
</template>

<script>
// @ is an alias to /src
import Incident from "@/components/Incident.vue";
export default {
  name: "incidentView",
  components: {
    Incident
  },
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
