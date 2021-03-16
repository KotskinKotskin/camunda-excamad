<template>
  <div>
    <table class="table table-striped table-sm">
      <thead>
        <tr>
          <th>Version</th>
          <th>Id</th>
          <th>Key</th>
          <th>Name</th>
          <th>Iframe</th>
          <th>Emedded url</th>
        </tr>
      </thead>

      <tbody>
        <tr :key="item.id" v-for="item in processDefinitions">
          <td>{{item.version}}</td>
          <td>{{item.id}}</td>
          <td>
            <router-link :to="{name:'diagram', params:{ diagramKey: item.key}}">
              <p class="card-text">
                <b>{{item.key}}</b>
              </p>
            </router-link>
          </td>
          <td>{{ item.name }}</td>
          <td>
            <p class="text-center">
              <b-btn
                v-clipboard:copy="item.iframeurl"
                v-clipboard:success="onCopy"
                v-clipboard:error="onError"
                size="sm"
                variant="outline-primary"
              >
                <font-awesome-icon icon="share"/>
              </b-btn>
            </p>
          </td>
          <td>
            <p class="text-center">
              <b-btn
                v-clipboard:copy="item.url"
                v-clipboard:success="onCopy"
                v-clipboard:error="onError"
                size="sm"
                variant="outline-primary"
              >
                <font-awesome-icon icon="share"/>
              </b-btn>
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import * as api from "@/api/api";
import { SERVERVIRTALPATHPROD } from "@/config/settings";
export default {
  name: "EmbeddedDigaram",

  data() {
    return {
      // processDefinitionId: "SMEPOST.LeasePosTerminal:36:380214",
      processDefinitions: []
    };
  },
  mounted: function() {
    this.getAllProcessDefinitions();
  },
  methods: {
    onCopy: function() {
      //alert("You just copied: " + e.text);
      this.$notify({
        group: "foo",
        title: "Copied!",
        type: "success"
      });
    },
    onError: function() {
      alert("sorry");
    },
    getAllProcessDefinitions() {
      api
        .getEntity("process-definition", "", "sortBy=version&sortOrder=desc")
        .then(value => {
          this.processDefinitions = value;

          this.processDefinitions.forEach(element => {
            var hostname = window.location.hostname;
            var hash = SERVERVIRTALPATHPROD + "?#";
            var pathname = "/diagram/" + element.key;
            var query = "?dashboard=true&baseurl=" + this.$store.state.baseurl;
            var url = "http://" + hostname + hash + pathname + query;

            var iframeurl =
              '<iframe src="' +
              url +
              '" style="border:1px #f2f2f2 none;" name="extAdmin" scrolling="yes" frameborder="1"  height="100%" width="100%" allowfullscreen></iframe>';

            vm.$set(element, "iframeurl", iframeurl);
            vm.$set(element, "url", url);
          });
        });
    }
  }
};
</script>
