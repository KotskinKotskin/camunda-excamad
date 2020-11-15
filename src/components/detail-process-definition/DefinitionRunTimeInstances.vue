<template>
  <div id="definitionInstnces">
    <b-form inline>
      <b-form-select
        class="mb-2 mr-sm-2 mb-sm-0"
        v-model="selected"
        :options="options"
        id="inlineFormCustomSelectPref"
      >
        <option slot="first" :value="null">Choose...</option>
      </b-form-select>
      <b-input v-model="variable" class="mb-2 mr-sm-2 mb-sm-0" placeholder="applicationId"/>
      <b-input-group left="@" class="mb-2 mr-sm-2 mb-sm-0">
        <b-input
          :disabled="selected !='variable'"
          v-model="variableValue"
          placeholder="ultranumber"
        />
      </b-input-group>
      <b-button @click="initialGetProcessInstances" variant="success">Search</b-button>
      <b-button class="ml-2" v-if="this.selected === 'activityId' && this.variable"
                @click="downloadBusinessKeys"
                variant="outline-primary">Get all businessKeys
      </b-button>
      <b-button @click="clear" variant="link">Clear</b-button>
    </b-form>
    <small>Total: {{runtimeCount}}, Search result: {{searchCount}}</small>

    <table class="table table-striped table-sm">
      <thead>
        <tr>
          <th>Suspended</th>
          <th>Id</th>
          <th>Business key</th>
        </tr>
      </thead>
      <tbody>
        <tr :key="item.id" v-for="item in processInstances">
          <td>{{item.suspended}}</td>
          <router-link :to="{name:'processdetail', params:{ processInstanceId: item.id}}">
            <b>{{item.id}}</b>
          </router-link>
          <td>{{item.businessKey}}</td>
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
import * as api from "@/api/api";
export default {
  name: "DefinitionRunTime",
  props: ["definitionId", "clickedActivity"],
  data() {
    return {
      firstResult: 0,
      variable: "",
      variableValue: "",
      selected: null,
      options: ["businessKey", "variable", "id", "activityId"],
      currentPage: 1,
      maxResult: 20,
      totalPage: 0,
      searchCount: 0,
      runtimeCount: 0,
      historyCount: 0,
      processInstances: null,
      historyProcessInstances: null
    };
  },
  watch: {
    currentPage: function(newValue, OldValue) {
      if (newValue != 0 && this.runtimeCount > this.searchCount) {
        this.firstResult =
          Math.round(this.currentPage * this.maxResult) - this.maxResult;
        this.initialGetProcessInstancesWatch();
      }
    }
  },
  mounted() {
    this.run();
  },
  methods: {
    run() {
      this.firstResult = 0;
      this.variable = null;
      this.variableValue = null;
      this.selected = null;

      if (this.clickedActivity != null) {
        this.selected = "activityId";
        this.variable = this.clickedActivity;
        this.$api()
          .post("/process-instance/count", {
            processDefinitionId: this.definitionId,
            activityIdIn: [this.clickedActivity]
          })
          .then(response => {
            this.runtimeCount = response.data.count;
            this.calculateTotalPage();
          });
      }

      this.initialGetProcessInstancesWatch();
    },
    clear() {
      this.firstResult = 0;
      this.variable = null;
      this.variableValue = null;
      this.selected = null;

      this.initialGetProcessInstancesWatch();
      this.getRuntimeCount();
    },

    calculateRoute(pageNum) {
      return this.$route.path + "?currentPage=" + pageNum;
    },
    initialGetProcessInstancesWatch() {
      this.processInstances = [];

      var searchObj = {};
      searchObj["processDefinitionId"] = this.definitionId;
      if (this.selected == "businessKey") {
        searchObj["businessKey"] = this.variable;
        this.firstResult = 0;
      }
      if (this.selected == "id") {
        var arrayOfStrings = this.variable;

        searchObj["processInstanceIds"] = arrayOfStrings;
      }
      if (this.selected == "variable") {
        var variableArray = [];
        var elementOfArray = {
          name: this.variable,
          operator: "eq",
          value: this.variableValue
        };
        variableArray.push(elementOfArray);
        searchObj["variables"] = variableArray;
      }

      if (this.selected == "activityId") {
        var arrayOfActivity = this.variable;
        searchObj["activityIdIn"] = [arrayOfActivity];
      }

      this.$api()
        .post(
          "/process-instance?firstResult=" +
            this.firstResult +
            "&sortBy=instanceId&sortOrder=desc&maxResults=" +
            this.maxResult,
          searchObj
        )
        .then(response => {
          this.processInstances = response.data;
          this.searchCount = this.processInstances.length;
        });
    },

    initialGetProcessInstances() {
      this.processInstances = [];

      var searchObj = {};
      searchObj["processDefinitionId"] = this.definitionId;
      if (this.selected == "businessKey") {
        searchObj["businessKey"] = this.variable;
        this.firstResult = 0;
      }
      if (this.selected == "id") {
        var arrayOfStrings = this.variable;

        searchObj["processInstanceIds"] = arrayOfStrings;
      }
      if (this.selected == "variable") {
        var variableArray = [];
        var elementOfArray = {
          name: this.variable,
          operator: "eq",
          value: this.variableValue
        };
        variableArray.push(elementOfArray);
        searchObj["variables"] = variableArray;
      }

      if (this.selected == "activityId") {
        var arrayOfActivity = this.variable;
        searchObj["activityIdIn"] = [arrayOfActivity];
      }

      this.$api()
        .post(
          "/process-instance?firstResult=" +
            this.firstResult +
            "&sortBy=instanceId&sortOrder=desc&maxResults=" +
            this.maxResult,
          searchObj
        )
        .then(response => {
          this.processInstances = response.data;
          this.searchCount = this.processInstances.length;

          this.getRuntimeCount();
        });
    },
    getRuntimeCount() {
      this.$api()
        .post("/process-instance/count", {
          processDefinitionId: this.definitionId
        })
        .then(response => {
          this.runtimeCount = response.data.count;
          this.calculateTotalPage();
        });
    },
    calculateTotalPage() {
      this.totalPage = Math.round(this.runtimeCount / this.maxResult) + 1;
    },
    downloadBusinessKeys() {
      this.$api()
      .post("/process-instance", {
        processDefinitionId: this.definitionId,
        activityIdIn: [this.variable]
      })
      .then(response => {
        const businessKeys = response.data.map(it => it.businessKey).join('\n')
        const url = window.URL.createObjectURL(new Blob([businessKeys]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${this.variable}-businessKeys`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch(error => {
        this.$notify({
          group: "foo",
          title: 'Cannot get process business keys for selected activity',
          text: error,
          type: "error"
        });
      })
    }
  }
};
</script>

<style>
</style>
