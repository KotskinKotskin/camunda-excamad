<template>
  <div>
    <table v-if="ready" class="table table-striped table-sm">
      <thead>
        <tr>
          <th>Id</th>
          <th>Deploy date</th>
          <th>Deploy name</th>
          <th>Process key</th>
          <th>Verions</th>
          <th>Documentaion</th>
          <th>Edit</th>
          <th>Run</th>
        </tr>
      </thead>
      <tbody>
        <tr :key="item.id" v-for="item in deployedProcess">
          <td>{{ item.id }}</td>
          <td>{{ convertDateToHumanStyle(item.deploymentTime) }}</td>
          <td>{{ item.name }}</td>
          <td>
            <b>{{item.processDefinition[0].key}}</b>
          </td>
          <td>{{item.processDefinition[0].version}}</td>
          <td>
            <router-link
              :to="{name:'deployhelp', params:{ diagramId: item.processDefinition[0].id}}"
            >Check</router-link>
          </td>
          <td>
            <router-link
              :to="{name:'newdiagram', params:{ diagramKey: item.processDefinition[0].key}}"
            >Create new version</router-link>
          </td>
          <td>
            <b-btn
              size="sm"
              variant="outline-success"
              @click="startProcess(item.processDefinition[0].id)"
            >Run</b-btn>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import * as api from "@/api/api";
import store from "@/store/store";
import { prototype } from "ids";
export default {
  name: "DeployTable",
  data() {
    return {
      ready: false,
      deployedProcess: []
    };
  },
  created() {
    this.getDeployedProcess();
  },
  mounted() {
    setTimeout(() => {
      this.ready = true;
    }, 200);
  },
  methods: {
    getDeployedProcess() {
      api
        .getEntity(
          "deployment",
          "",
          "source=" +
            this.$store.getters.getProfile.userName +
            "&&sortBy=deploymentTime&&sortOrder=desc"
        )

        .then(value => {
          this.deployedProcess = value;
          value.forEach(element => {
            api
              .getEntity("process-definition", "", "deploymentId=" + element.id)
              .then(response => {
                this.$set(element, "processDefinition", response);
              });
          });
        });
    },
    startProcess(id) {
      this.$api()
        .post("/process-definition/" + id + "/start", {})
        .then(response => {
          this.$notify({
            group: "foo",
            title: "Process runned!",
            text: response,
            type: "success"
          });
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Process fail :(",
            text: error,
            type: "error"
          });
        });
    },
    convertDateToHumanStyle: function(date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    }
  }
};
</script>

<style>
</style>
