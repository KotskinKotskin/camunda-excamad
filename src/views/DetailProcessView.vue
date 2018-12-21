<template>
  <div class>
    <b-card bg-variant text-variant="dark">
      <b-nav vertical class="fixed">
        <small>
          <b-nav-item href="#processStat" v-scroll-to="'#processStat'">1. Main</b-nav-item>
          <b-nav-item href="#CurrentActivity" v-scroll-to="'#CurrentActivity'">2. Current activity</b-nav-item>
          <b-nav-item href="#DecisionDetails" v-scroll-to="'#DecisionDetails'">3. Decisions</b-nav-item>

          <b-nav-item href="#variableList" v-scroll-to="'#variableList'">4. Variables</b-nav-item>
          <b-nav-item href="#networkdiagram" v-scroll-to="'#networkdiagram'">5. History digaram</b-nav-item>
          <b-nav-item href="#stream" v-scroll-to="'#stream'">6. History stream</b-nav-item>
          <b-nav-item>
            <p>
              <b-btn
                v-clipboard:copy="message"
                v-clipboard:success="onCopy"
                v-clipboard:error="onError"
                size="sm"
                variant="outline-primary"
              >
                <font-awesome-icon icon="share"/>
              </b-btn>
            </p>
          </b-nav-item>
        </small>
      </b-nav>
      <p class="text-right">
        <b-btn
          v-clipboard:copy="message"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError"
          size="sm"
          variant="outline-primary"
        >
          <font-awesome-icon icon="share"/>
        </b-btn>
      </p>
      <detail-incident :processInstanceId="processInstanceId"></detail-incident>

      <detailprocessstat :processInstanceId="processInstanceId"></detailprocessstat>

      <currentstate class="mt-5" :processInstanceId="processInstanceId"></currentstate>
      <decision-details class="mt-5" :processInstanceId="processInstanceId"></decision-details>

      <variable-list class="mt-5" :processInstanceId="processInstanceId"></variable-list>
      <network-diagram class="mt-5" :processInstanceId="processInstanceId"></network-diagram>
      <stream class="mt-5" :processInstanceId="processInstanceId"></stream>
    </b-card>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faShare } from "@fortawesome/free-solid-svg-icons";
import { SERVERVIRTALPATHPROD } from "@/config/settings";

library.add(faShare);
import Stream from "@/components/Stream.vue";

export default {
  name: "DetailProcessView",
  props: ["processInstanceId"],
  components: {
    Stream
  },
  mounted() {
    var hostname = window.location.hostname;
    var hash = SERVERVIRTALPATHPROD + "?#";
    var pathname = this.$route.path;
    var query = "?baseurl=" + this.$store.state.baseurl;
    this.message = "http://" + hostname + hash + pathname + query;
  },
  data() {
    return {
      message: "Copy These Text",
      copied: false
    };
  },
  methods: {
    onCopy: function() {
      //alert("You just copied: " + e.text);
      this.$notify({
        group: "foo",
        title: "Coped!",
        type: "success"
      });
    },
    onError: function() {
      alert("sorry");
    }
  }
};
</script>

<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/vis/4.20.1/vis.min.css";
.fixed {
  position: fixed;
  top: 60%;
  left: 1%;
  z-index: 9999;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 3px;
}
</style>
