<template>
  <div id="editVariable">
    <b-button size="lg" variant="link" v-b-modal="'modal'+variableName">
      <font-awesome-icon icon="pen-square"/>
    </b-button>

    <b-modal
      v-on:ok="modifyVariable"
      :id="'modal'+variableName"
      :title="'Edit variable ' +variableName"
    >
      <label for="variableName">Variable name</label>
      <b-form-input id="variableName" v-model="variableName" disabled></b-form-input>
      <label for="variableType">Variable type</label>
      <b-form-input id="variableType" v-model="variableType" disabled></b-form-input>
      <label for="variableOldValue">Variable current value</label>
      <b-form-input id="variableOldValue" v-model="variableOldValue" disabled></b-form-input>
      <label for="variableNewValue">Variable new value</label>
      <b-form-input id="variableNewValue" v-model="variableNewValue"></b-form-input>
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
  name: "VariableSingleEdit",
  props: ["processInstanceId", "variableName", "variableType", "variableOldValue"],
  data() {
    return {
      variableNewValue: ""
    }
  },
  mounted() {
    this.variableNewValue = this.variableOldValue
  },
  methods: {
    modifyVariable() {

      var modifications = {
        [this.variableName]: {
          value: this.variableNewValue,
          type: this.variableType
        }
      }
      var postObj = {
        modifications: modifications
      }


      this.$api().post('/process-instance/' + this.processInstanceId + "/variables", postObj).
        then(response => {
          this.$notify({
            group: "foo",
            title: "Modified",
            type: "success"
          });
        }).catch(error => {
          this.$notify({
            group: "foo",
            title: "Not modified",
            type: "error",
            tetxt: error.data
          });
        })
    }
  }

}
</script>

<style>
</style>
