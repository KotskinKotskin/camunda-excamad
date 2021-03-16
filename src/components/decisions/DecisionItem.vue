<template>
  <div class="mt-2">
    <b-card bg-variant="light" text-variant="dark">
      <h4>{{decisionItem.decisionDefinitionKey}}({{decisionItem.decisionDefinitionName}})</h4>
      <h5>{{convertDateToHumanStyle(decisionItem.evaluationTime)}}</h5>
      <b-row>
        <b-col>Input variables:
          <br>
          <li
            v-for="item in decisionItem.inputs"
            v-bind:key="item.id"
          >{{item.clauseName}} - {{item.type}} - {{item.value}}</li>
        </b-col>
        <b-col>Output variables:
          <br>
          <li
            v-for="item in decisionItem.outputs"
            v-bind:key="item.id"
          >{{item.ruleOrder}} - {{item.clauseName}} - {{item.type}} - {{item.value}}</li>
          <br>
        </b-col>
      </b-row>
      <router-link
        :to="{name:'decisiondiagram', params:{ decisionId: decisionItem.decisionDefinitionId}}"
      >
        <b>See definition {{decisionItem.decisionDefinitionId}}</b>
      </router-link>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "DecisionItem",
  props: ["decisionItem"],
  data() {
    return {
      randomdDivId: 0
    };
  },
  mounted() {
    var min = 4;
    var max = 500;
    var random = Math.floor(Math.random() * (+max - +min)) + +min;

    this.randomdDivId = "collapse" + random;
  },
  methods: {
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
