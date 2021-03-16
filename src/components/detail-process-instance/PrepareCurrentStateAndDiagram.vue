<template>
  <div id="CurrentActivity">
    <b-card bg-variant="light" text-variant="dark">
      <h3>Current activity</h3>

      <b-container class="bv-example-row mb-3">
        <b-row>
          <b-col>
            <li
              class="mt-2"
              :key="item.processActivityToShow"
              v-for="(item,index) in currentProcessActivityToShowArray"
            >
              <b-btn
                v-if="checkButtons(index)"
                @click="skipActivity(item)"
                size="sm"
                variant="outline-danger"
              >Skip</b-btn>
              {{item.processActivityToShow}}
              <b>{{item.activityHimanaizedCreateDate}}</b>
            </li>
          </b-col>
        </b-row>
      </b-container>
      <b-btn
        size="sm"
        variant="outline-info"
        class="mb-2"
        :pressed="showDiagramAttirbutes"
        @click="updateDiagram"
      >Show attributes</b-btn>
      <diagram
        :key="digagramkey"
        :editMode="showDiagramAttirbutes"
        v-if="readyToShowDiagram"
        :processActivityToShowArray="currentProcessActivityToShowArray"
        :processDefinitionId="processDefinition"
        :loadHistory="loadHistory"
        :processInstanceIdForLoadHistory="processInstanceId"
      ></diagram>
      <br>
      <move-token
        v-if="currentProcessActivityToShowArray.length >0 && currentProcessActivityToShowArray.length>0"
        :processDefinitionId="processDefinition"
        :currentActivity="currentActivity"
        :currentJobs="currentProcessActivityToShowArray"
        :processInstanceId="processInstanceId"
      ></move-token>

      <send-message
        v-if="currentProcessActivityToShowArray.length >0 && currentProcessActivityToShowArray.length>0"
        :processDefinitionId="processDefinition"
        :processInstanceId="processInstanceId"
      ></send-message>
      <detail-jobs :processInstanceId="processInstanceId"></detail-jobs>
      <br>
    </b-card>
  </div>
</template>


<script>
import * as api from "@/api/api";
export default {
  name: "PrepareCurrentStateAndDiagram",
  props: ["processInstanceId"],
  data() {
    return {
      processDefinition: "",
      readyToShowDiagram: false,
      incidents: [],
      showDiagramAttirbutes: false,
      loadHistory: true,
      digagramkey: 0,
      currentActivity: [],
      currentProcessActivityToShowArray: []
    };
  },

  mounted() {
    this.loadData();
  },
  methods: {
    checkButtons: function (index) {
      if (index == 0) {
        return true;
      } else return false;
    },
    updateDiagram() {
      this.digagramkey = this.digagramkey + 1;
      this.showDiagramAttirbutes = !this.showDiagramAttirbutes;
      this.loadHistory = !this.loadHistory;

    },
    skipActivity(item) {
      var processInstanceIdsArray = [];
      processInstanceIdsArray.push(this.processInstanceId);
      var instructionsCancel = {};
      instructionsCancel["type"] = "cancel";
      instructionsCancel["activityId"] = item.processActivityToShow;
      var instructionsStartAfter = {};
      instructionsStartAfter["type"] = "startAfterActivity";
      instructionsStartAfter["activityId"] = item.processActivityToShow;
      var instructions = [];
      //===
      instructions.push(instructionsStartAfter);
      //===
      this.$api()
        .post("/modification/execute", {
          processDefinitionId: this.processDefinition,
          skipCustomListeners: true,
          processInstanceIds: processInstanceIdsArray,
          instructions: instructions
        })
        .then(() => {
          instructions = [];
          instructions.push(instructionsCancel);
          //===
          setTimeout(() => {
            this.$api()
              .post("/modification/execute", {
                processDefinitionId: this.processDefinition,
                skipCustomListeners: true,
                processInstanceIds: processInstanceIdsArray,
                instructions: instructions
              })
              .then(() => {
                this.loadData();
                this.digagramkey = this.digagramkey + 1;
              });
          }, 400);
        });
    },
    loadData() {
      setTimeout(() => {
        this.getProcessDefinitionById();
      }, 200);
      setTimeout(() => {
        this.findCurrentActivity();
      }, 400);
      setTimeout(() => {
        this.calculateWaitAndActivity();
      }, 600);
      setTimeout(() => {
        this.readyToShowDiagram = true;
      }, 800);
    },
    convertDateToHumanStyle: function (date) {
      return this.$momenttrue(date)
        .startOf("second")
        .fromNow();
    },
    getProcessDefinitionById() {
      this.$api()
        .get("/history/process-instance/" + this.processInstanceId)
        .then(response => {
          this.processDefinition = response.data.processDefinitionId;
        })
        .catch(() => {
          this.$api()
          .get("/process-instance/" + this.processInstanceId)
          .then(response => {
            this.processDefinition = response.data.definitionId;
          })
        });
    },
    calculateWaitAndActivity() {
      // this.currentProcessActivityToShowArray = [];
      this.currentActivity.forEach(element => {
        var obj = {};
        obj["processActivityToShow"] = element.activityId;
        obj["activityHimanaizedCreateDate"] = this.convertDateToHumanStyle(
          element.startTime
        );
        this.currentProcessActivityToShowArray.push(obj);
      });
      this.incidents.forEach(incident => {
        var obj = {};
        obj["processActivityToShow"] = incident.activityId;
        obj["isIncident"] = true;
        obj["activityHimanaizedCreateDate"] = this.convertDateToHumanStyle(
          incident.incidentTimestamp
        );
        this.currentProcessActivityToShowArray.push(obj);
      });

      var arr = this.currentProcessActivityToShowArray;
      var prop = "processActivityToShow";
      var obj = {};
      for (var i = 0, len = arr.length; i < len; i++) {
        if (!obj[arr[i][prop]]) obj[arr[i][prop]] = arr[i];
      }
      var newArr = [];
      for (var key in obj) newArr.push(obj[key]);

      this.currentProcessActivityToShowArray = newArr;
    },
    findCurrentActivity: async function () {
      var vm = this;
      return new Promise(function (resolve, reject) {
        //blabla
        {
          vm.$api()
            .get(
              "/history/activity-instance?unfinished=true&&processInstanceId=" +
              vm.processInstanceId
            )
            .then(response => {
              vm.currentActivity = response.data;
            })
            .catch(error => {
              reject(error);
            });

          api
            .getEntity(
              "process-instance/" + vm.processInstanceId,
              "activity-instances",
              ""
            )
            .then(value => {
              value.childActivityInstances.forEach(element => {
                var obj = {};
                obj["processActivityToShow"] = element.activityId;
                obj["isJob"] = true;
                obj["activityHimanaizedCreateDate"] = "check now";
                vm.currentProcessActivityToShowArray.push(obj);
              });
              value.childTransitionInstances.forEach(element => {
                var obj = {};
                obj["processActivityToShow"] = element.activityId;
                obj["isJob"] = true;
                obj["activityHimanaizedCreateDate"] = "check now";
                vm.currentProcessActivityToShowArray.push(obj);
              });
            });

          api
            .getEntity(
              "incident",
              "",
              "sortBy=incidentTimestamp&sortOrder=desc&&processInstanceId=" +
              vm.processInstanceId
            )
            .then(value => {
              vm.incidents = value;
              resolve();
            });
        }
      });
    }
  }
};
</script>
