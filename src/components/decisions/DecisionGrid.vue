<template>
  <div>
    <table class="table table-striped table-sm">
      <thead>
        <tr>
          <th>Version</th>
          <th>Id</th>
          <th>Name</th>
          <th>DRD</th>
          <th>Done</th>
        </tr>
      </thead>
      <tbody>
        <tr :key="item.id" v-for="item in decisions.slice(0,200)">
          <td>{{item.version}}</td>
          <td>
            <router-link :to="{name:'decisiondiagram', params:{ decisionId: item.id}}">
              <b>{{item.id}}</b>
            </router-link>
          </td>
          <td>{{item.name}}</td>
          <td>{{item.decisionRequirementsDefinitionKey}}</td>
          <td>{{item.count}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import * as api from "@/api/api";
export default {
  name: "DecisionGrid",

  data() {
    return {
      decisions: ""
    };
  },
  created() {
    this.getDecisions();
  },
  mounted() {
    //   this.getDecisions();
  },
  methods: {
    getDecisions() {
      api
        .getEntity("decision-definition", "", "sortBy=version&sortOrder=desc")
        .then(value => {
          value.forEach(element => {
            api
              .getEntity(
                "history",
                "decision-instance/count",
                "decisionDefinitionId=" + element.id
              )
              .then(response => {
                this.$set(element, "count", response.count);
              });
          });
          this.decisions = value;
        });
    }
  }
};
</script>

<style>
</style>
