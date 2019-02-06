<template>
  <div class="JSON">
    <b-row>
      <b-col>
        <JsonEditor :objData="jsonData" v-model="value"></JsonEditor>
      </b-col>
      <b-col>
        <vue-json-pretty :data="value"></vue-json-pretty>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { abstractField } from "vue-form-generator";
export default {
  mixins: [abstractField],
  data: () => {
    return {
      jsonData: {}
    };
  },
  created() {
    this.jsonData = JSON.parse(this.value);
  }
};
</script>

<style>
.JSON {
  background-color: white;
  margin: 10px 10px 10px 10px;
  padding: 10px;
  border: 1px solid black;
  width: 600px;
}
</style>

