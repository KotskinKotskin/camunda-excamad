<template>
  <div>
    <h4>Definition {{diagramKey}}</h4>
    <b-btn
      @click="changeEditMode"
      :pressed="editMode"
      size="sm"
      variant="outline-info"
      class="mb-2 down"
    >
      <font-awesome-icon icon="pen-square" />Edit mode
    </b-btn>
    <b-btn
      @click="changeJiraMode"
      :pressed="jiraMode"
      size="sm"
      variant="outline-success"
      class="mb-2 down ml-3"
    >
      <font-awesome-icon icon="file-alt" />Info from Jira
    </b-btn>

    <diagram
      :key="componentKey"
      :jiraMode="jiraMode"
      :processDefinitionId="checkKeyOrDefinitionId"
      :diagramKey="diagramKey"
      :editMode="editMode"
    ></diagram>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowsAlt,
  faPenSquare,
  faFileAlt
} from "@fortawesome/free-solid-svg-icons";
library.add(faArrowsAlt);
library.add(faFileAlt);
library.add(faPenSquare);

export default {
  props: ["diagramKey", "processDefinitionId", "definitionId"],
  data() {
    return {
      editMode: false,
      jiraMode: false,
      componentKey: 0
    };
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  methods: {
    checkKeyOrDefinitionId() {
      if (this.diagramKey != null && this.processDefinitionId != null) {
        return this.processDefinitionId;
      } else return null;
    },
    changeEditMode() {
      this.editMode = !this.editMode;
      this.componentKey = this.componentKey + 1;
    },
    changeJiraMode() {
      this.jiraMode = !this.jiraMode;
      this.componentKey = this.componentKey + 1;
    }
  }
};
</script>

<style>
</style>
