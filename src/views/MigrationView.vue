<template>
  <div class="migrationView">
    <migration :key="componentKey"></migration>
  </div>
</template>

<script>
import Migration from "@/components/Migration.vue";
import store from "@/store/store";

export default {
  name: "migrationView",
  components: {
    Migration
  },
  data() {
    return {
      componentKey: 0,
      ready: false
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
