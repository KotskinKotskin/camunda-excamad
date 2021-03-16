<template>
  <div class="historyVisew">
  <history :key="componentKey" v-if="serverStatus == true" ></history>
  <noConnect v-if="serverStatus != true"> </noConnect>
  </div>
</template>

<script>
import store from "@/store/store";

export default {
  name: "historyView",
  components: {},
  data() {
    return {
      componentKey: 0
    };
  },
  computed: {
    serverStatus() {
      return store.state.serverStatus;
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
