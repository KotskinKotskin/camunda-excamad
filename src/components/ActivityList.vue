<template>
  <div class>
    <b-btn
      v-if="processInstanceItem.isActive"
      @click="calculateWaitAndActivityAndShowModal"
      size="sm"
      v-b-modal="'modal'+processInstanceItem.id"
      variant="outline-info"
    >
      <font-awesome-icon icon="sitemap"/>
    </b-btn>
    <b-btn variant="outline-warning" size="sm" class="float-right">
      <router-link
        :to="{name:'processdetail', params:{ processInstanceId: processInstanceItem.processInstanceId}}"
      >
        <font-awesome-icon icon="info"/>
      </router-link>
    </b-btn>

    <b-modal
      class="my-modal"
      hide-footer
      size="lg"
      :id="'modal'+processInstanceItem.id"
      title="Process diagram"
    >
      <diagram
        v-if="showModal"
        :processActivityToShowArray="currentProcessActivityToShowArray"
        :processDefinitionId="currentProcessDefinitionId"
      ></diagram>
    </b-modal>
    <small>
      <div
        class="row"
        v-bind:key="historyitem.id"
        v-for="historyitem in currentProcessHistoryElements"
      >
        <div class="col-1">
          <input
            v-model="historyitem.isSelectedFrom"
            v-if="processInstanceItem.isActive && historyitem.endTime ==null "
            type="checkbox"
            @click="onClickSetActivityToMigrate(historyitem)"
          >
        </div>
        <div class="col-10">
          <b-card-body class="pt-1 pb-1 ml-1">
            <b-card
              v-bind:header="convertDateToHumanStyle(historyitem.endTime)"
              v-bind:footer="convertDateToHumanStyle(historyitem.startTime)"
              :title="historyitem.activityId"
            >
              <p class="card-text">{{historyitem.activityName}}</p>
              <p class="card-text">
                <b-badge variant="info">{{historyitem.activityType}}</b-badge>
              </p>
              <b-alert
                v-if="historyitem.endTime==null"
                show
                variant="success"
              >Current activity, created {{convertDateToHumanStyle(historyitem.startTime)}}</b-alert>
              <b class="card-text">
                <b-btn size="sm" variant="link" v-b-toggle="'collapse2'+historyitem.id">▼</b-btn>
              </b>

              <br>

              <b-collapse v-bind:id="'collapse2'+historyitem.id">
                <b-card>
                  <vue-json-pretty :data="historyitem"></vue-json-pretty>
                </b-card>
              </b-collapse>
            </b-card>
            <hr>
          </b-card-body>
        </div>
        <div class="col-1">
          <input
            v-model="historyitem.isSelectedTo"
            type="checkbox"
            v-if="processInstanceItem.isActive"
            @click="onClickSetActivityToMigrate(historyitem)"
          >
          <small>
            <b-btn
              size="sm"
              @click="moveTokenOnActivity"
              variant="secondary"
              v-if="historyitem.isSelectedTo && selectedActivityTo==historyitem.activityId "
            >⇒</b-btn>
          </small>
        </div>
      </div>
    </small>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import * as api from "@/api/api";
import {
  faInfo,
  faProjectDiagram,
  faSitemap
} from "@fortawesome/free-solid-svg-icons";

library.add(faInfo, faProjectDiagram, faSitemap);

export default {
  name: "ActivityList",
  props: ["processInstanceItem"],
  data() {
    return {
      showModal: false,
      currentProcessActivityToShowArray: [
        {
          processActivityToShow: "WaitPaymentResultMessage",
          activityHimanaizedCreateDate: "5 days"
        },
        {
          processActivityToShow: "UploadBusinessLine",
          activityHimanaizedCreateDate: "1 day"
        }
      ],
      currentProcessDefinitionId: "SMEPOST.LeasePosTerminal:32:375814",
      currentProcessHistoryElements: "",
      selectedActivityFrom: "",
      selectedActivityTo: ""
    };
  },
  mounted() {
    setTimeout(() => {
      this.getProcessInsanceHistory();
    }, 500);
  },
  methods: {
    onClickSetActivityToMigrate(item) {
      this.$nextTick(() => {
        if (item.isSelectedTo) {
          this.selectedActivityTo = item.activityId;
        }
        if (item.isSelectedFrom) {
          this.selectedActivityFrom = item.activityId;
        }
        if (item.isSelectedFrom && item.isSelectedTo) {
          item.isSelectedTo = false;
        }
      });
    },
    generateInsruction: function() {
      var foo = [
        { type: "cancel", activityId: this.selectedActivityFrom },
        { type: "startBeforeActivity", activityId: this.selectedActivityTo }
      ];

      return foo;
    },
    moveTokenOnActivity() {
      this.$nextTick(() => {
        this.$api()
          .post(
            "/process-instance/" +
              this.processInstanceItem.processInstanceId +
              "/modification",
            {
              skipCustomListeners: true,
              skipIoMappings: true,
              instructions: this.generateInsruction()
            }
          )
          .then(response => {
            this.$notify({
              group: "foo",
              title: "Token moved",
              type: "success"
            });
          })
          .catch(error => {
            this.$notify({
              group: "foo",
              title: "Token NOT moved",
              text: error,
              type: "error"
            });
          });
      });
    },

    getProcessInsanceHistory() {
      api
        .getEntity(
          "history",
          "activity-instance",
          "sortBy=startTime&sortOrder=desc&processInstanceId=" +
            this.processInstanceItem.processInstanceId
        )
        .then(value => {
          this.currentProcessHistoryElements = value;
          this.currentProcessHistoryElements.forEach(element => {
            this.$set(element, "isSelectedFrom", false);
            this.$set(element, "isSelectedTo", false);
          });
        });
    },
    calculateWaitAndActivityAndShowModal() {
      this.showModal = true;
      this.calculateWaitAndActivity();
      this.calculateIncidentsAndActivity();
    },
    convertDateToHumanStyle: function(date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    },
    calculateWaitAndActivity() {
      this.currentProcessDefinitionId = this.currentProcessHistoryElements[0].processDefinitionId;
      this.currentProcessActivityToShowArray = [];
      this.currentProcessHistoryElements.forEach(element => {
        if (!element.endTime) {
          var obj = {};
          obj["processActivityToShow"] = element.activityId;
          obj["activityHimanaizedCreateDate"] = this.convertDateToHumanStyle(
            element.startTime
          );
          this.currentProcessActivityToShowArray.push(obj);
        }
      });
    },
    calculateIncidentsAndActivity() {
      this.processInstanceItem.incidents.forEach(element => {
        var obj = {};
        obj["processActivityToShow"] = element.activityId;
        obj["activityHimanaizedCreateDate"] = this.convertDateToHumanStyle(
          element.incidentTimestamp
        );
        obj["isIncident"] = true;
        this.currentProcessActivityToShowArray.push(obj);
      });
    }
  }
};
</script>


