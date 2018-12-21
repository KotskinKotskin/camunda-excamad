<template>
  <div id="variableList">
    <h2>Instance variables</h2>
    <small>
      <b-card no-body>
        <b-tabs pills card vertical>
          <b-tab v-bind:key="item.id" v-for="item in variables" :title="calculateName(item)" active>
            <vue-json-pretty :data="item"></vue-json-pretty>
          </b-tab>
        </b-tabs>
        <audit-reader v-if="applicationId" :applicationId="applicationId"></audit-reader>
      </b-card>
    </small>
  </div>
</template>

<script>
export default {
  name: "VariablesList",
  props: ["processInstanceId"],
  data() {
    return {
      variables: [],
      applicationId: ""
    };
  },

  mounted() {
    setTimeout(() => {
      this.getVariables();
    }, 500);
  },

  methods: {
    calculateName(item) {
      return item.name + " = " + item.value;
    },
    getVariables() {
      this.variables = [];
      this.$api()
        .get(
          "/history/variable-instance?processInstanceId=" +
            this.processInstanceId
        )
        .then(response => {
          this.variables = response.data;

          this.applicationId = response.data.filter(obj => {
            return obj.name === "applicationId";
          })[0].value;
        });
    }
  }
};
</script>
