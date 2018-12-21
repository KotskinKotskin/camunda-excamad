<template>
  <div class="streamView">

 <stream :key="componentKey" v-if="serverStatus == true"> </stream>
 <noConnect v-if="serverStatus != true"> </noConnect>
  </div>
</template>

<script>
// @ is an alias to /src
import Stream from "@/components/Stream.vue";
import store from "@/store/store";

export default {
  name: "StreamView",
  components: {
    Stream
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
