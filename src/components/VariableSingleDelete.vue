<template>
  <div id="deleteVariable">
    <b-button size="lg" variant="link" style="color: red" v-b-modal="'modal-delete-variable-' + variableName">
      <font-awesome-icon icon="trash"/>
    </b-button>

    <b-modal
      v-on:ok="handleOk"
      ref="my-modal"
      :id="'modal-delete-variable-' + variableName"
      :title="'Delete variable: \'' + variableName + '\''"
    >
      <label for="variableName">Variable name</label>
      <b-form-input id="variableName" v-model="variableName" disabled></b-form-input>
      <label for="variableValue">Variable value</label>
      <b-form-input id="variableValue" v-model="variableValue" disabled></b-form-input>
    </b-modal>
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
  name: "VariableSingleDelete",
  props: ["processInstanceId", "variableName", "variableValue"],
  data() {
    return {
    }
  },
  methods: {
    handleOk(bvModalEvent) {
      bvModalEvent.preventDefault();

      this.$api().delete('/process-instance/' + this.processInstanceId + '/variables/' + this.variableName)
          .then(() => {
            this.$notify({
              group: "foo",
              title: "Deleted",
              type: "success"
            });
            this.closeModal();
          }).catch(error => {
            this.$notify({
              group: "foo",
              title: "Not deleted",
              type: "error",
              text: error.data
            });
          })
    },
    closeModal() {
      this.$nextTick(() => {
        this.$bvModal.hide('modal-delete-variable-' + this.variableName);
      })
    }
  }
}
</script>
