<template>
  <div>
    <deploy class="mb-2" v-if="diagramInXML" extension="bpmn" :diagramInXML="diagramInXML"></deploy>
    <diagram
      v-on:digaramInXml="onNewDiagramInXml"
      :editMode="true"
      :formMode="true"
      :diagramKey=" diagramKey ? diagramKey : starterprocess"
    ></diagram>
  </div>
</template>

<script>
import { STATRTERPROCESSNAME } from "@/config/settings";
export default {
  name: "NewDiagram",
  props: ["diagramKey"],
  data() {
    return {
      starterprocess: STATRTERPROCESSNAME,
      diagramInXML: ""
    };
  },
  mounted() {},
  methods: {
    onNewDiagramInXml: function(newDiagram) {
      this.diagramInXML = newDiagram;
    },
    currentWorkOnBPMassservice() {
      return this.$store.state.workOnBpmasservice;
    }
  }
};
</script>

<style>
</style>
