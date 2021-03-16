<template>
  <div id="deploy">
    <b-btn
      size="sm"
     
      @click="deployXML"
      variant="outline-success"
    >Deploy</b-btn>
  </div>
</template>

<script>
import axios from "axios";

import store from "@/store/store";
import str from "string-to-stream";
export default {
  props: ["diagramInXML", "extension"],
  name: "Deploy",
  data() {
    return {
      image: null
    };
  },
  computed: {
    profile() {
      return this.$store.getters.getProfile;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  methods: {
    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.createImage(files[0]);
    },
    createImage(file) {},
    removeImage: function(e) {
      this.image = "";
    },

    deployXML() {
      var bodyFormData = new FormData();
      bodyFormData.append("deployment-name", "somename");
      bodyFormData.append(
        "deployment-source",
        this.profile ? this.profile.userName : "anonymous"
      );

      var blob = new Blob(this.diagramInXML.split(""), {
        type: "application/octet-stream"
      });

      bodyFormData.append("processBPMaSS", blob, "deploy." + this.extension);

      axios({
        url: store.state.workOnBpmasservice
          ? store.state.bpmasserviceUrl + "deployment/create"
          : store.state.baseurl + "deployment/create",
        data: bodyFormData,
        config: {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        },
        method: "POST"
      })
        .then(response => {
          this.$notify({
            group: "foo",
            title: "Deploy success!",
            text: response,
            type: "success"
          });
          // this.$router.push("/bpmasservice/deploytable/");
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Deploy fails :(",
            text: error,
            type: "error"
          });
        });
    }
  }
};
</script>

<style>
</style>
