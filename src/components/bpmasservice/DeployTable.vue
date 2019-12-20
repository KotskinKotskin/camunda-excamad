<template>
  <div>
    <table v-if="ready" class="table table-striped table-sm">
      <thead>
        <tr>
          <th>Id</th>
          <th>Deploy date</th>
          <th>Deploy name</th>
          <th>Process id</th>
          <th>Verions</th>
          <th>Documentaion</th>
          <th>Edit</th>
        </tr>
      </thead>
      <tbody>
        <tr :key="item.id" v-for="item in deployedProcess">
          <td>{{ item.id }}</td>
          <td>{{ convertDateToHumanStyle(item.deploymentTime) }}</td>
          <td>{{ item.name }}</td>
          <td>
            <router-link
              v-if="item.processDefinition"
              :to="{name:'definition', params:{ definitionId: item.processDefinition[0].id}}"
            >{{ item.processDefinition[0].id}}</router-link>
          </td>
          <td
            v-if="item.processDefinition"
          >{{item.processDefinition[0].version ? item.processDefinition[0].version : 'error'}}</td>
          <td>
            <router-link
              v-if="item.processDefinition"
              :to="{name:'deployhelp', params:{ diagramId: item.processDefinition[0].id}}"
            >Check</router-link>
          </td>
          <td>
            <router-link
              v-if="item.processDefinition"
              :to="{name:'newdiagram', params:{ diagramKey: item.processDefinition[0].key}}"
            >Check</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import * as api from "@/api/api";

export default {
  name: "DeployTable",
  data() {
    return {
      ready: true,
      deployedProcess: []
    };
  },
  created() {
    this.getDeployedProcess();
  },
  mounted() {},
  methods: {
    getDeployedProcess() {
      api
        .getEntity(
          "deployment",
          "",
          ""
        )

        .then(value => {
          var itemsProcessed = 0;

          value.forEach(element => {
            if (element.id != null) {
              this.$api()
                .get("/process-definition?deploymentId=" + element.id)
                .then(response => {
                  itemsProcessed++;
                  if (response.data != null) {
                    this.$set(element, "processDefinition", response.data);
                    this.deployedProcess.push(element);
                  }
                  if (response.data == null) {
                    this.$set(element, "processDefinition");
                    this.deployedProcess.push(element);
                  }
                });
            }
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
