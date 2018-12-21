<template>
 <div> 

 <oldactivity :key="componentKey" > </oldactivity>
     </div>
</template>

<script>
import store from "@/store/store";

export default {
  name: "OldActivityView",
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
