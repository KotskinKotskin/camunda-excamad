<template>
  <div id="Report">
    <h2 v-if="!url">Dashboard not ready for this sistem</h2>
    <vue-friendly-iframe v-if="url" :src="url"></vue-friendly-iframe>
  </div>
</template>

<script>
import * as Dasboard from "@/config/dashboardUrl";
export default {
  name: "Report",
  data() {
    return {
      url: ""
    };
  },
  computed: {
    currentURL() {
      return this.$store.state.baseurl;
    }
  },
  mounted() {
    this.url = Dasboard.FindDashboardUrl(this.currentURL);
  }
};
</script>

<style>
.vue-friendly-iframe iframe {
  width: 1400px;
  height: 2000px;
  border: 0px;
}
</style>
