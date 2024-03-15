<template>
  <div id="addVariable">
    <b-button variant="link" v-b-modal="'modal-add-variable'">
      <font-awesome-icon icon="plus" />
    </b-button>

    <b-modal
      v-on:ok="handleOk"
      v-on:show="resetModal"
      ref="my-modal"
      :id="'modal-add-variable'"
      :title="'Add variable'"
    >
      <label for="variableName">Variable name</label>
      <b-form-input id="variableName" v-model="variableName"></b-form-input>
      <label for="variableValue">Variable value</label>
      <b-form-input id="variableValue" v-model="variableValue"></b-form-input>
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
  name: "VariableSingleAdd",
  props: ["processInstanceId"],
  data() {
    return {
      variableValue: "",
      variableName: "",
      variableType: "String"
    }
  },
  methods: {
    resetModal() {
      this.variableValue = "";
      this.variableName = "";
    },
    handleOk(bvModalEvent) {
      bvModalEvent.preventDefault();

      this.$api().get('/process-instance/' + this.processInstanceId + '/variables').then(variables => {
        if (variables.data[this.variableName]) {
          this.$notify({
            group: "foo",
            title: "Not added",
            type: "error",
            text: "Variable with this name already exists"
          });
        } else {
          this.addVariable();
        }
      })
    },
    addVariable() {
      const request = {
        value: this.variableValue,
        type: this.variableType
      }

      this.$api().put('/process-instance/' + this.processInstanceId + "/variables/" + this.variableName, request)
          .then(() => {
            this.$notify({
              group: "foo",
              title: "Modified",
              type: "success"
            });
            this.closeModal();
          }).catch(error => {
            this.$notify({
              group: "foo",
              title: "Not added",
              type: "error",
              text: error.data
            });
          })
    },
    closeModal() {
      this.$nextTick(() => {
        this.$bvModal.hide('modal-add-variable')
      })
    }
  }

}
</script>

<style>
</style>
