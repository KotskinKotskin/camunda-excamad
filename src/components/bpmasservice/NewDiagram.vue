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
  methods: {
    onNewDiagramInXml: function(newDiagram) {
      this.diagramInXML = newDiagram;
    }
  }
};
</script>

<style>
</style>
