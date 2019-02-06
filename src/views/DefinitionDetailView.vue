<template>
  <div>
    <definition-metadata
      v-on:suspended="updateComponenteKey"
      :key="componentKeyMetadata"
      :definitionId="definitionId"
    ></definition-metadata>
    <definition-diagram
      v-on:DefinitionDiagramClick="HandleClick"
      :key="componentKeyDiagram"
      :definitionId="definitionId"
    ></definition-diagram>

    <b-card class="mt-2" no-body>
      <b-tabs card>
        <b-tab title=" Runtime instances " active>
          <definition-runtime-instances
            :key="componentKeyDefinitionRuntime"
            :clickedActivity="clickedActivity"
            :definitionId="definitionId"
          ></definition-runtime-instances>
        </b-tab>
        <b-tab title="History instances">
          <definition-history-instances :definitionId="definitionId"></definition-history-instances>
        </b-tab>
        <b-tab title="Incidents" disabled>
          <br>Incidents
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "DefinitionDetailView",
  props: ["definitionId"],
  data() {
    return {
      componentKeyMetadata: 0,
      componentKeyDiagram: 1,
      componentKeyDefinitionRuntime: 2,
      clickedActivity: null
    };
  },
  methods: {
    updateComponenteKey() {
      this.componentKeyMetadata = this.componentKeyMetadata + 1;
      this.componentKeyDiagram = this.componentKeyDiagram + 1;
      this.componentKeyDefinitionRuntime =
        this.componentKeyDefinitionRuntime + 1;
    },
    HandleClick(payload) {
      this.componentKeyDefinitionRuntime =
        this.componentKeyDefinitionRuntime + 1;

      if (payload.$type != "bpmn:Participant") {
        this.clickedActivity = payload.id;
      }
    }
  }
};
</script>

<style>
</style>
