<template>
  <div id="ProcessInstances">
    <b-form inline>
      <b-input
        v-model="userSearchObj.name"
        class="mb-2 mr-sm-2 mb-sm-0"
        placeholder="applicationId"
      />
      <b-input-group left="@" class="mb-2 mr-sm-2 mb-sm-0">
        <b-input v-model="userSearchObj.value" placeholder="20190201133328115IBL329027" v-if="variableType === 'text'"/>
        <b-input v-model.number="userSearchObj.value" placeholder="20000" v-if="variableType === 'number'"/>
        <b-form-select v-model="userSearchObj.value" v-if="variableType === 'boolean'">
          <b-form-select-option :value=false>False</b-form-select-option>
          <b-form-select-option :value=true>True</b-form-select-option>
        </b-form-select>
      </b-input-group>
      <b-form-select
        v-model="variableType"
        class="mb-2 mr-sm-2 mb-sm-0"
        :options="variableTypeOptions"
        @change="changeType"
      />
      <b-button @click="clickSearch" variant="success">Search</b-button>
      <b-button @click="clear" variant="link">Clear</b-button>
    </b-form>
    <small>Total {{totalResult}}</small>
    <table class="table table-striped table-sm indexed">
      <thead>
        <tr>
          <th>#</th>
          <th>Start time</th>
          <th>Duration (in h)</th>
          <th>End time</th>
          <th>Business key</th>
          <th>Id</th>
          <th>Parent id</th>
        </tr>
      </thead>
      <tbody>
        <tr :key="item.id" v-for="item in historyProcessInstances">
          <td></td>
          <td>{{convertDateToHumanStyle(item.startTime)}}</td>
          <td>{{Math.round(item.durationInMillis/(1000*60*60))}}</td>
          <td>{{convertDateToHumanStyle(item.endTime)}}</td>
          <td>{{item.businessKey}}</td>
          <td>
            <router-link :to="{name:'processdetail', params:{ processInstanceId: item.id}, query: {baseurl}}">
              <b>{{item.id}}</b>
            </router-link>
          </td>
          <td>
            <router-link
              v-if="item.superProcessInstanceId"
              :to="{name:'processdetail', params:{ processInstanceId: item.superProcessInstanceId}, query: {baseurl}}"
            >
              <b>{{item.superProcessInstanceId}}</b>
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
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
export default {
  name: "DefinitionHistoryInstances",
  props: ["definitionId"],
  data() {
    return {
      firstResult: 0,
      currentPage: 1,
      maxResult: 20,
      totalResult: 0,
      totalPage: 0,
      userSearchObj: {
        name: "",
        operator: "eq",
        value: ""
      },
      variableType: "text",
      variableTypeOptions: [
        { value: "text", text: "Text"},
        { value: "number", text: "Number"},
        { value: "boolean", text: "Boolean"}
      ],

      historyProcessInstances: null
    };
  },
  mounted() {
    this.initialSearch();
  },
  watch: {
    currentPage: function(newValue) {
      if (newValue != 0) {
        this.firstResult =
          Math.round(this.currentPage * this.maxResult) - this.maxResult;
        if (this.userSearchObj.name != "" && this.userSearchObj.value != "") {
          this.clickSearch();
        } else this.getHistoryBySearchObj(this.generateDefaultSearchObj());
      }
    }
  },
  methods: {
    changeType() {
      if (this.variableType === 'boolean') {
        this.userSearchObj.value = false;
      } else {
        this.userSearchObj.value = "";
      }
    },
    clear() {
      this.userSearchObj.name = "";
      this.userSearchObj.value = "";
      this.variableType = "text"
      this.initialSearch();
    },
    clickSearch() {
      var variables = [];
      variables.push(this.userSearchObj);

      var searchObj = {
        processDefinitionId: this.definitionId,
        finished: true,
        variables: variables
      };
      this.getHistoryBySearchObj(searchObj);
      this.getHistoryCount(searchObj).then(response => {
        this.totalResult = response;
        this.totalPage = this.calculateTotalPage(this.totalResult);
      });
    },
    initialSearch() {
      this.getHistoryBySearchObj(this.generateDefaultSearchObj());

      var searchObj = {
        processDefinitionId: this.definitionId,
        finished: true
      };
      this.getHistoryCount(searchObj).then(response => {
        this.totalResult = response;
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

    convertDateToHumanStyle: function(date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    },
    generateDefaultSearchObj() {
      var sortingObj = {
        sortBy: "startTime",
        sortOrder: "desc"
      };
      var sortArray = [sortingObj];

      var searchObj = {
        processDefinitionId: this.definitionId,
        finished: true,
        sorting: sortArray
      };
      return searchObj;
    },
    getHistoryBySearchObj(searchObj) {
      this.$api()
        .post(
          "/history/process-instance?firstResult=" +
            this.firstResult +
            "&&maxResults=" +
            this.maxResult,
          searchObj
        )
        .then(response => {
          this.historyProcessInstances = response.data;
        });
    },
    getHistoryCount(searchObj) {
      var vm = this;
      return new Promise(function(resolve) {
        vm.$api()
          .post("/history/process-instance/count", searchObj)
          .then(response => {
            resolve(response.data.count);
          });
      });
    }
  },
  computed: {
    baseurl() {
      return this.$store.state.baseurl;
    }
  }
};
</script>

<style>
.indexed {
  counter-reset: serial-number; /* Set the serial number counter to 0 */
}

.indexed td:first-child:before {
  counter-increment: serial-number; /* Increment the serial number counter */
  content: counter(serial-number); /* Display the counter */
}
</style>
