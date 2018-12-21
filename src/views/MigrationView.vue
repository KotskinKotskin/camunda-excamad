<template>
  <div class="migrationView">
    <migration  :key="componentKey" v-if="serverStatus == true"></migration>
      <noConnect v-if="serverStatus != true"> </noConnect>
  </div>
</template>

<script>
// @ is an alias to /src
import Migration from "@/components/Migration.vue";
import store from "@/store/store";

export default {
  name: "migrationView",
  components: {
    Migration
  },
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
