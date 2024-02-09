<template>
  <div class>
    <b-card bg-variant text-variant="dark">
      <b-nav vertical class="fixed">
        <b-btn size="sm" variant="link" v-b-toggle.collapse3 class="m-1">∨</b-btn>
        <b-collapse id="collapse3">
          <small>
            <b-nav-item href="#processStat" v-scroll-to="'#processStat'">1. Main</b-nav-item>
            <b-nav-item href="#CurrentActivity" v-scroll-to="'#CurrentActivity'">2. Current activity</b-nav-item>
            <b-nav-item href="#DecisionDetails" v-scroll-to="'#DecisionDetails'">3. Decisions</b-nav-item>
            <b-nav-item href="#variableList" v-scroll-to="'#variableList'">4. Variables</b-nav-item>
            <b-nav-item href="#variableList" v-scroll-to="'#historyDetails'">5. Variables history</b-nav-item>
            <b-nav-item href="#variableList" v-scroll-to="'#incidentsHistory'">6. Incidents history</b-nav-item>
            <b-nav-item href="#networkdiagram" v-scroll-to="'#networkdiagram'">7. History digaram</b-nav-item>
            <b-nav-item href="#stream" v-scroll-to="'#stream'">8. History stream</b-nav-item>
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
        </b-collapse>
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
      <detail-incident :processInstanceId="processInstanceId" @retryExternalTask="retryExternalTask"></detail-incident>

      <detailprocessstat :processInstanceId="processInstanceId"></detailprocessstat>
      <currentstate class="mt-5" :processInstanceId="processInstanceId"></currentstate>
      <external-task class="mt-5"
                     :processInstanceId="processInstanceId"
                     :externalTaskJobs="externalTaskJobs"
                     @retryClicked="retryExternalTask"
      > </external-task>
      <decision-details class="mt-5" :processInstanceId="processInstanceId"></decision-details>

      <variable-list class="mt-5" :processInstanceId="processInstanceId"></variable-list>
      <history-details class="mt-5" :processInstanceId="processInstanceId"></history-details>
      <incidents-history class="mt-5" :processInstanceId="processInstanceId"></incidents-history>
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
import ExternalTask from '../components/detail-process-instance/ExternalTask.vue';

export default {
  name: "DetailProcessView",
  props: ["processInstanceId"],
  components: {
    Stream,
    ExternalTask
  },
  mounted() {
    var hostname = window.location.hostname;
    var hash = SERVERVIRTALPATHPROD + "?#";
    var pathname = this.$route.path;
    var query = "?baseurl=" + this.$store.state.baseurl;
    this.message = "http://" + hostname + hash + pathname + query;
    this.loadExternalTaskJobs();
  },
  data() {
    return {
      message: "Copy These Text",
      copied: false,
      externalTaskJobs: []
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
    retryExternalTask(processInstanceId) {
      const externalJob = this.externalTaskJobs.find(externalJob => externalJob.processInstanceId === processInstanceId);

      const notifyError = (error) => this.$notify({
        group: "foo",
        title: "Retries NOT setuped",
        text: error,
        type: "error"
      });

      if (externalJob) {
        const putObj = {
          retries: 1,
          processInstanceIds: [processInstanceId],
          externalTaskIds: [externalJob.id]
        }
        this.$api().put("/external-task/retries", putObj).then(response => {

          this.$notify({
            group: "foo",
            title: " Retries setuped",
            type: "success"
          });
        }).catch(error => notifyError(error))
      } else {
        notifyError('External task not found');
      }
    },
    loadExternalTaskJobs() {
      this.$api()
          .get("/external-task?processInstanceId=" + this.processInstanceId)
          .then(response => {
            this.externalTaskJobs = response.data;
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
  top: 40%;
  left: 1%;
  z-index: 9999;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 3px;
  background-color: white;
}
</style>
