<template>
  <div class id="baseView">
    <h2>Find instances in history by business key</h2>
    <b-form inline>
      <b-input
        v-model="variable.variableName"
        disabled
        class="mb-2 mr-sm-2 mb-sm-0"
        id="inlineFormInputName2"
        placeholder="Variable name"
      />

      <b-input
        class="width: 300px"
        v-model="variable.variableValue"
        id="inlineFormInputGroupUsername2"
        placeholder="Variable value"
      />
      <b-form-checkbox class="ml-2" id="checkbox-1" v-model="unfinished">Unfinished</b-form-checkbox>
      <b-btn
        class="ml-3"
        @click="search"
        variant="outline-primary"
      >Find instances {{variable.variableName}}={{variable.variableValue}}</b-btn>
    </b-form>
    <small
      class="mt-2"
      v-if="variableHistoryElements.length!= 0 "
    >Total {{variableHistoryElements.length}} elements</small>
    <h5 v-if="findedProcessInstances.length == 0 && searchTryed == true">
      Nothing there...
      <router-link to="/stream">check live stream.</router-link>
    </h5>
    <atom-spinner
      v-if="!(ready == true)"
      class="spinner"
      :animation-duration="1000"
      :size="60"
      :color="'#007bff'"
    />
    <b-table
      caption-top
      class="mt-2"
      small
      hover
      :fields="fields"
      :items="findedProcessInstances"
      striped
    >
      <template slot="table-caption">Total {{totalResult}}</template>
      <template v-slot:cell(id)="data">
        <router-link :to="{name:'processdetail', params:{ processInstanceId: data.item.id}}">
          <b>{{data.item.id.substring(0,5)}}...</b>
        </router-link>
      </template>
      <template v-slot:cell(superProcessInstanceId)="data">
        <router-link
          :to="{name:'processdetail', params:{ processInstanceId: data.item.superProcessInstanceId}}"
        >
          <b>{{ data.item.superProcessInstanceId ? data.item.superProcessInstanceId.substring(0,5)+'...' : ''}}</b>
        </router-link>
      </template>
      <template v-slot:cell(processDefinitionKey)="data">
        <router-link
          :to="{name:'definition', params:{ definitionId: data.item.processDefinitionId}}"
        >{{data.item.processDefinitionKey}}</router-link>
        <br>
        <small>{{data.item.processDefinitionName}}</small>
      </template>

      <template v-slot:cell(startTime)="data">{{convertDateToHumanStyle(data.item.startTime)}}</template>
      <template v-slot:cell(endTime)="data">{{data.item.endTime ? convertDateToHumanStyle(data.item.endTime) : ''}}</template>
      <template v-slot:cell(show_details)="row">
        <b-button
          variant="link"
          size="sm"
          @click="rowClick(row)"
          class="mr-2"
        >{{ row.detailsShowing ? 'Hide' : 'Show'}} Details</b-button>
      </template>

      <template v-slot:row-details="row">
        <DetailProcessView :processInstanceId="row.item.id"></DetailProcessView>
      </template>
    </b-table>
    <b-pagination-nav
      align="center"
      size="sm"
      base-url="#"
      :number-of-pages="totalPage"
      v-model="currentPage"
    />
  </div>
</template>
<script>
import * as api from "@/api/api";
import DetailProcessView from "@/views/DetailProcessView.vue";

export default {
  name: "history",
  components: {
    DetailProcessView
  },
  data() {
    return {
      firstResult: 0,
      currentPage: 1,
      maxResult: 20,
      totalResult: 0,
      unfinished: false,
      totalPage: 0,

      variable: {
        variableName: "businessKey",
        variableValue: "CD-"
      },
      processInstanceForSearch: "376497",
      searchTryed: false,
      clickedToInstanceSearch: false,
      ready: true,
      reshowVariablelist: false,
      findedProcessInstances: [],
      variableHistoryElements: [],
      fields: [
        "id",
        "processDefinitionKey",
        "startTime",
        "state",
        "endTime",
        "superProcessInstanceId",
        "show_details"
      ]
    };
  },
  watch: {
    currentPage: function (newValue) {
      if (newValue != 0) {
        this.firstResult =
          Math.round(this.currentPage * this.maxResult) - this.maxResult;

        this.getProcessInstanceHistoryByVariable();
      }
    }
  },
  methods: {
    rowClick(row) {
      row.item._showDetails = !row.item._showDetails;
    },
    convertDateToHumanStyle: function (date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    },
    getProcessInstanceHistoryByVariable() {
      this.ready = false;
      var searchObj = {};
      this.$api()
        .get(
          "/history/process-instance?processInstanceBusinessKeyLike=" +
          // this.variable.variableName +
          // "_eq_" +
          this.variable.variableValue +
          "&sortBy=startTime&sortOrder=desc" +
          "&firstResult=" +
          this.firstResult +
          "&maxResults=" +
          this.maxResult +
          "&unfinished=" +
          this.unfinished
        )
        .then(response => {
          this.findedProcessInstances = response.data;
          this.ready = true;
          this.findedProcessInstances.forEach(element => {
            this.$set(element, "_showDetails", false);
          });
          this.searchTryed = true;
        });
    },
    getProcessInstanceHistoryByVariableCount() {
      this.$api()
        .get(
          "/history/process-instance/count?processInstanceBusinessKeyLike=" +
          // this.variable.variableName +
          // "_eq_" +
          this.variable.variableValue +
          "&sortBy=startTime&sortOrder=desc"
        )
        .then(response => {
          this.totalResult = response.data.count;
          this.totalPage = this.calculateTotalPage(this.totalResult);
        });
    },
    calculateTotalPage(total) {
      var result = Math.round(total / this.maxResult);
      if (result <= 0) {
        result = 1;
      }
      if (result * this.maxResult < total) {
        result = result + 1;
      }
      return result;
    },

    search() {
      this.getProcessInstanceHistoryByVariable();
      this.getProcessInstanceHistoryByVariableCount();
    }
  }
};
</script>

<style scoped>
.form-inline .form-control {
  display: inline-block;
  width: 300px;
  vertical-align: middle;
}

.fixed-button {
  position: fixed;
  top: 70%;
  right: 1%;
  z-index: 9999;
  border-radius: 45px;
}
.fixed-button-2 {
  position: fixed;
  top: 65%;
  right: 1%;
  z-index: 9999;
  border-radius: 45px;
}
</style>


