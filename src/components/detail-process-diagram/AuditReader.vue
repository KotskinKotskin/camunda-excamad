<template>
  <div v-if="applicationId">
    <b-btn
      size="sm"
      class="mt-2 mb-2 ml-3"
      v-b-toggle.collapse1
      variant="warning"
    >Audit {{applicationId}}</b-btn>
    <b-link class="mb-2 ml-3" target="blank" :href="splunkUrl">Splunk {{applicationId}}</b-link>
    <b-collapse id="collapse1" class="mt-2">
      <vue-friendly-iframe :src="auditUrl"></vue-friendly-iframe>
    </b-collapse>
  </div>
</template>

<script>
import * as api from "@/api/api";
import axios from "axios";
import {
  TESTSPLUNKURL,
  PRODSPLUNKURL,
  TESTAUDITURL,
  PRODAUDITURL
} from "@/config/settings";
export default {
  name: "AuditReader",
  props: ["applicationId"],
  data() {
    return {
      auditReaderHtml: ""
    };
  },
  computed: {
    currentEnv() {
      return this.$store.state.envortment;
    },
    splunkUrl() {
      var splunkUrlbase = "";

      if (this.currentEnv == "PRODUCTION") {
        splunkUrlbase =
          PRODSPLUNKURL +
          "/en-US/app/search/search?q=" +
          this.applicationId +
          "%20index%3D*";
      } else {
        splunkUrlbase =
          TESTSPLUNKURL +
          "/en-US/app/search/search?q=" +
          this.applicationId +
          "%20index%3D*";
      }
      return splunkUrlbase;
    },
    auditUrl() {
      var auditUrl = "";

      if (this.currentEnv == "PRODUCTION") {
        auditUrl =
          PRODAUDITURL + "/audit-reader-prod/records/?maxAmount=100&entityId=";
      } else {
        auditUrl =
          TESTAUDITURL + "/audit-reader/records/?maxAmount=100&entityId=";
      }

      return auditUrl + this.applicationId;
    }
  },
  mounted() {},
  methods: {}
};
</script>

<style>
.vue-friendly-iframe iframe {
  width: 1000px;
  height: 1000px;
}
</style>
