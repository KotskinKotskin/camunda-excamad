<template>
  <div id="variableList">
    <h2>Instance variables (max 150)</h2>
    <small>
      <b-card no-body>
        <b-tabs pills card vertical>
          <b-tab
            v-bind:key="item.id"
            v-for="item in variables.slice(0,50)"
            :title="calculateName(item)"
            active
          >
            <variable-single-edit
              v-if="item.type != 'Object'"
              :variableOldValue="item.value"
              :variableType="item.type"
              :variableName="item.name"
              :processInstanceId="processInstanceId"
            ></variable-single-edit>
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
      var obj = item.name;

      return obj;
    },
    getVariables() {
      this.variables = [];
      this.$api()
        .get(
          `/variable-instance?processInstanceIdIn=${this.processInstanceId}`
        )
        .then(response => {
          this.variables = response.data;

          try {
            this.applicationId = response.data.filter(obj => {
              
              return obj.name === "applicationId";
            })[0].value;
          }  finally {}

          try {
            this.applicationId = response.data.filter(obj => {
              
              return obj.name === "applicationIntegrationId";
            })[0].value;
          } 
           finally {}
        });
    }
  }
};
</script>
