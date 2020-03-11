<template>
  <div id="taskQuery">
    <b-row>
      <b-col cols="6">
        <b-card>
          <b-form>
            <label for="processInstanceBusinessKeyLike">Business key</label>
            <b-form-input
              id="processInstanceBusinessKeyLike"
              v-model="processInstanceBusinessKeyLike"
              placeholder="Enter business key"
            ></b-form-input>
            <label for="processDefinitionKeyLike">Process definition key</label>
            <b-form-input
              id="processDefinitionKeyLike"
              list="my-list-id"
              v-model="processDefinitionKeyLike"
              placeholder="Choose process definition name"
            ></b-form-input>
            <datalist id="my-list-id">
              <option v-bind:key="procDef" v-for="procDef in processDefinitionKeyArray">{{ procDef }}</option>
            </datalist>
            <label for="nameLike">Task name</label>
            <b-form-input id="nameLike" v-model="nameLike" placeholder="Enter task name"></b-form-input>
            <b-row>
              <b-col cols="4">
                <label for="createdBefore">Create before</label>
                <br />
                <vue-datepicker-local
                  id="createdBefore"
                  :local="local"
                  clearable
                  format="YYYY-MM-DDTHH:mm:ss"
                  v-model="createdBefore"
                />
              </b-col>
              <b-col cols="4">
                <label for="createdAfter">Create after</label>
                <br />
                <vue-datepicker-local
                  id="createdAfter"
                  :local="local"
                  clearable
                  format="YYYY-MM-DDTHH:mm:ss"
                  v-model="createdAfter"
                />
              </b-col>
            </b-row>
            <b-form-checkbox v-model="withVariables">With variables</b-form-checkbox>
            <div id="variables" v-show="withVariables">
              <b-btn @click="addVariable()" class="mt-1 mb-1" variant="link" size="sm">
                <font-awesome-icon icon="plus" />Add
              </b-btn>
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Opearator</th>
                    <th>Value</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr :key="index" v-for="(item,index) in processVariables">
                    <td>
                      <b-form-input
                        v-model="processVariables[index].name"
                        type="text"
                        placeholder="Enter variable name"
                      ></b-form-input>
                    </td>
                    <td>
                      <b-form-select
                        v-model="processVariables[index].operator"
                        :options="operatorType"
                        class="mb-3"
                      />
                    </td>
                    <td>
                      <b-form-input
                        v-model="processVariables[index].value"
                        type="text"
                        placeholder="Enter variable value"
                      ></b-form-input>
                    </td>
                    <td>
                      <b-btn @click="removeItem(index)" class="mt-1" variant="link" size="sm">
                        <font-awesome-icon icon="minus" />
                      </b-btn>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </b-form>
          <div class="mt-3" id="buttons">
            <b-btn size="sm" variant="outline-success" @click="getCount">Search</b-btn>
            <b-btn
              class="ml-2"
              size="sm"
              variant="outline-primary"
              @click="getTasks"
            > Complete {{ maxResults ? taskCount : maxResults}} tasks</b-btn>
            <b-btn class="ml-2" size="sm" variant="outline-secondary" @click="clearFilter">Clear</b-btn>
            <b-btn class="ml-2" size="sm" variant="outline-warning" v-b-modal.modal-1>Save as filter</b-btn>
            <b-modal v-on:ok="saveFilter" v-model="showModal" id="modal-1" title="Save filter">
              <label for="filterName">Filter name</label>
              <b-form-input id="filterName" v-model="filterName" placeholder="Enter filter name"></b-form-input>
            </b-modal>
          </div>
          <h5 class="mt-3">Found {{taskCount}} tasks</h5>
        </b-card>
      </b-col>
      <b-col>
        <b-card>
          <b-list-group>
            <b-list-group-item
              @click="selectFilter(item)"
              button
              :key="index"
              v-for="(item,index) in filters"
            >
              {{item.name}}
              <b-btn @click="removeFilter(index)" class="mt-1" variant="link" size="sm">
                <font-awesome-icon icon="minus" />
              </b-btn>
              <br />
              <small>{{convertDateToHumanStyle(item.created)}}</small>
              <br />
              <b-button v-b-toggle="'collapse2'+index" variant="link" size="sm">Show details</b-button>
              <b-collapse v-bind:id="'collapse2'+index" class="mt-2">
                <small>
                  <pre> {{item}} </pre>
                </small>
              </b-collapse>
            </b-list-group-item>
          </b-list-group>
        </b-card>
      </b-col>
    </b-row>
    <b-alert :show="currentPossition != 0 " variant="danger">
      <h4>Don`t leave the page!</h4>
      <b-progress animated show-value :value="currentPossition" :max="maxResults" class="mb-3"></b-progress>
    </b-alert>
  </div>
</template>


<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import VueDatepickerLocal from "vue-datepicker-local";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
library.add(faMinus, faPlus);

export default {
  name: "TaskQuery",
  components: { VueDatepickerLocal },
  data() {
    return {
      local: {
        dow: 1, // Monday is the first day of the week
        hourTip: "Hour", // tip of select hour
        minuteTip: "Minutes", // tip of select minute
        secondTip: "Seconds", // tip of select second
        yearSuffix: " y.", // format of head
        monthsHead: "1 Jan_2 Feb_3 Mar_4 Apr_5 May_6 June_7 July8 Aug_9 Sept_10 Oct_11 Ov_12 Dec".split(
          "_"
        ), // months of head
        months: "1 Jan_2 Feb_3 Mar_4 Apr_5 May_6 June_7 July8 Aug_9 Sept_10 Oct_11 Ov_12 Dec".split(
          "_"
        ), // months of panel
        weeks: "Mon_Tue_Wed_Thu_Fri_Sat_Sun".split("_"), // weeks
        cancelTip: "Cancel" // default text for cancel button  submitTip: '提交' // default text for submit button
      },
      firstResult: 0,
      taskCount: 0,
      operatorType: [
        "eq",
        "neq",
        "gt",
        "gteq",
        "lt",
        "lteg",
        "like"
      ],
      maxResults: 150,
      processInstanceBusinessKeyLike: null,
      withVariables: false,
      processDefinitionKeyLike: null,
      processDefinitionKeyArray: [],
      nameLike: null,
      createdAfter: null,
      createdBefore: null,
      processVariables: [{ name: "", value: "", operator: "eq" }],
      tasks: [],
      filters: [],
      currentPossition: 0,
      showModal: false,
      filterName: null
    }
  },
  mounted() {
    this.getProcessDefinitions();
  },
  created() {
    this.loadFiltersLocalStorage();
  },
  methods: {
    convertDateToHumanStyle: function (date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    },
    buildSearchObject() {
      var postObj = {};
      if (this.processInstanceBusinessKeyLike) {
        postObj['processInstanceBusinessKeyLike'] = this.addLikeOptions(this.processInstanceBusinessKeyLike)
      }
      if (this.processDefinitionKeyLike) {
        postObj['processDefinitionKey'] = this.processDefinitionKeyLike
      }
      if (this.nameLike) {
        postObj['nameLike'] = this.addLikeOptions(this.nameLike);
      }
      if (this.createdAfter) {
        postObj['createdAfter'] = this.convertDate(this.createdAfter);
      }
      if (this.createdBefore) {
        postObj['createdBefore'] = this.convertDate(this.createdBefore);
      }
      if (this.withVariables && this.processVariables.length > 0) {
        var variablesArr = [];
        this.processVariables.forEach(element => {
          variablesArr.push(element);
        });
        postObj['processVariables'] = variablesArr;
      }

      return postObj;
    },
    addVariable() {
      var obj = {
        name: "",
        operator: "eq",
        value: ""
      };
      this.processVariables.push(obj);
    },
    removeItem(item) {
      this.processVariables.splice(item, 1);
    },
    addLikeOptions(string) {
      return "%" + string + "%"
    },
    convertDate(date) {
      // var result = this.$momenttrue(date).format("YYYY-MM-DDTHH:mm:ss");
      var result = this.$momenttrue(date).format();

      result = result.substring(0, result.length - 6);
      result = result + ".001+0200";

      return result;
    },
    getProcessDefinitions() {
      this.$api().get('/process-definition/').then(response => {
        var arr = [];

        response.data.forEach(element => {
          arr.push(element.key);
        });

        var unique = arr.filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        })
        this.processDefinitionKeyArray = unique;
      })
    },
    getCount() {
      this.$api().post('/task/count', this.buildSearchObject()).then(response => {
        this.taskCount = response.data.count;
      })
    },
    getTasks() {
      this.$api().post('/task?firstResult=' + this.firstResult + "&&maxResults=" + this.maxResults, this.buildSearchObject()).then(response => {
        this.tasks = response.data;
        this.completeTasks();
      })
    },
    clearFilter() {
      this.processVariables = [];
      this.processInstanceBusinessKeyLike = null;
      this.processDefinitionKeyLike = null;
      this.withVariables = false;
      this.nameLike = null;
      this.createdAfter = null;
      this.createdBefore = null;
      this.taskCount = 0;
      this.tasks = [];

    },
    saveFilter() {
      var obj = {
        name: this.filterName,
        created: new Date(),
        processInstanceBusinessKeyLike: this.processInstanceBusinessKeyLike,
        processDefinitionKeyLike: this.processDefinitionKeyLike,
        nameLike: this.nameLike,
        processVariables: this.processVariables,
        createdAfter: this.createdAfter,
        createdBefore: this.createdBefore
      }
      this.filters.push(obj);
      localStorage.taskFilters = JSON.stringify(this.filters);
    },
    removeFilter(item) {
      this.filters.splice(item, 1);
      localStorage.taskFilters = JSON.stringify(this.filters);
    },
    selectFilter(item) {
      this.processInstanceBusinessKeyLike = item.processInstanceBusinessKeyLike;
      this.processDefinitionKeyLike = item.processDefinitionKeyLike;
      this.nameLike = item.nameLike;
      this.processVariables = [];

      item.processVariables.forEach(element => {
        this.withVariables = true;
        this.processVariables.push(element)
      });

      this.createdAfter = item.createdAfter;
      this.createdBefore = item.createdBefore;
      this.getCount();
    },
    completeTasks() {
      var vm = this;
      this.tasks.forEach(function (obj, index) {
        setTimeout(function () {
          var variables = {};
          vm.$api().post('/task/' + obj.id + '/submit-form', variables).then(() => {

          })
          vm.currentPossition = index;

          if (index == vm.tasks.length - 1) {
            vm.$notify({
              group: "foo",
              title: "Done",
              type: "success"
            });
          }
        }, 500 * (index + 1));

      });

    },
    loadFiltersLocalStorage() {
      var array = JSON.parse(localStorage.taskFilters);
      array.forEach(element => {
        this.filters.push(element);
      });


    }
  }

}
</script>

