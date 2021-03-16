<template>
  <div>
    <b-btn  size="sm" variant="outline-warning" @click="push">Push</b-btn>
    <br />
    <small>Project - {{projectKey}}, reposity slug - {{repositySlug}}, path to file- {{pathToFile}}</small>
  </div>
</template>

<script>
import axios from "axios";
import { REVERSPROXYURL, BITBUCKETURL } from "@/config/settings";
export default {
  props: ["FileInString", "projectKey", "repositySlug", "pathToFile"],
  name: "CommitFile",
  data() {
    return {
      branch: "",
      sourceCommitId: "",
      branchResponse: ""
    };
  },
  computed: {
    token: function () {
      return "Basic " + this.$store.state.auth.token;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  methods: {
    push() {
      this.createBranch();
      setTimeout(() => {
        this.putFile();
      }, 1000);
    },

    putFile() {
      var bodyFormData = new FormData();
      bodyFormData.append("content", this.FileInString);
      bodyFormData.append("branch", this.branch);
      bodyFormData.append("sourceCommitId", this.sourceCommitId);
      bodyFormData.append("message", "this is commit from excamad");
      axios
        .put(
          REVERSPROXYURL +
          BITBUCKETURL +
          "/rest/api/1.0/projects/" +
          this.projectKey +
          "/repos/" +
          this.repositySlug +
          "/browse/" +
          this.pathToFile,
          bodyFormData,
          { headers: { Authorization: this.token } }
        )
        .then(() => {
          this.$notify({
            group: "foo",
            title: "File uploaded",
            type: "success"
          });
          this.$emit("fileAddedToStash", this.FileInString);
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "File NOT uploaded",
            text: error,
            type: "error"
          });
        });
    },
    createBranch() {
      axios
        .post(
          REVERSPROXYURL +
          BITBUCKETURL +
          "/rest/api/1.0/projects/" +
          this.projectKey +
          "/repos/" +
          this.repositySlug +
          "/branches/",
          {
            name: "userdeploy/" + Number(new Date()),
            startPoint: "refs/heads/develop"
          },
          {
            headers: {
              Authorization: this.token
            }
          }
        )
        .then(response => {
          this.branchResponse = response.data;
          this.branch = response.data.displayId;
          this.sourceCommitId = response.data.latestCommit;
          this.$notify({
            group: "foo",
            title: "Brach in stash created",
            type: "success"
          });
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Branch in stash NOT created",
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
