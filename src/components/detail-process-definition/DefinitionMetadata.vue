<template>
  <div id="definitionMetadata">
    <b-card bg-variant="light" text-variant="dark">
      <atom-spinner
        v-if="!ready"
        class="spinner"
        :animation-duration="1000"
        :size="60"
        :color="'#007bff'"
      />
      <b-row>
        <b-col>
          <h3>{{definitionMetadata.id}}</h3>
          <h4>{{definitionMetadata.name}} ({{definitionMetadata.key}})</h4>
        </b-col>
        <b-col col lg="2">
          <start-definition class="mb-2 text-left" :definitionId="definitionId"></start-definition>
          <b-btn
            v-b-tooltip.hover
            title="This process definition will be suspended, so that it will not be possible to start new process instances based on this process definition."
            @click="suspendCurrentId()"
            size="sm"
            class="mb-3"
            :variant="getVariant()"
          >
            <font-awesome-icon :icon="getIcon()"/>
            {{getText()}}
          </b-btn>

          <b-form-checkbox
            v-b-tooltip.hover
            class="pull-right"
            title="All existing instance will suspend"
            size="sm"
            id="checkbox1"
            v-model="inculdeCurrentInstance"
          >Include current instances</b-form-checkbox>
        </b-col>
      </b-row>
      <b-badge
        class="mb-3"
        variant="danger"
        v-if="definitionMetadata.incidentsCount>0"
      >Active incidents: {{definitionMetadata.incidentsCount}}</b-badge>
      <b-row>
        <b-col>
          <b-dropdown id="ddown-buttons" v-on:shown="getVersionStats" size="sm" class="m-2">
            <b-dropdown-item-button v-for="item in versions" :key="item.id">
              <router-link :to="{name:'definition', params:{ definitionId: item.id}}">
                {{item.version
                }}
                <small>({{item.runtimeCount}}/{{item.historyCount - item.runtimeCount}}/{{item.historyCount}})</small>
              </router-link>
            </b-dropdown-item-button>
          </b-dropdown>
          Version {{definitionMetadata.version}}
          <br>
          {{definitionMetadata.deployTime}}
          <br>
        </b-col>
        <b-col>Running:
          <br>
          <li>All versions: {{definitionMetadata.totalCount}}</li>
          <li>
            Current version: {{definitionMetadata.currentCount}}
            <small>(Not in incidents: {{definitionMetadata.currentCount-definitionMetadata.incidentsCount}})</small>
          </li>
        </b-col>
        <b-col>History:
          <br>
          <li>All versions: {{definitionMetadata.totalHistoryCount}}</li>
          <li>Current version: {{definitionMetadata.currentHistoryCount}} (finished: {{definitionMetadata.currentHistoryCount - definitionMetadata.currentCount}})</li>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>
import * as api from "@/api/api";
import { library } from "@fortawesome/fontawesome-svg-core";
import { AtomSpinner } from "epic-spinners";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
library.add(faPlay, faPause);
export default {
  name: "DefinitionMetadata",
  props: ["definitionId"],
  components: {
    AtomSpinner
  },
  data() {
    return {
      definitionMetadata: "",
      ready: false,
      inculdeCurrentInstance: false,
      versions: ""
    };
  },
  mounted() {
    this.getMetadata();
  },
  methods: {
    getVersionStats() {
      this.versions.forEach(element => {
        this.$api()
          .post("/process-instance/count", {
            processDefinitionId: element.id
          })
          .then(response => {
            element.runtimeCount = response.data.count;
          });

        this.$api()
          .get(
            "/history/process-instance/count?processDefinitionId=" + element.id
          )
          .then(response => {
            element.historyCount = response.data.count;
          });
      });
    },

    getVersionsByKey() {
      this.$api()
        .get("/process-definition?key=" + this.definitionMetadata.key)
        .then(response => {
          var array = response.data;
          array.sort((a, b) => b.version - a.version);
          for (var i = 0; i < array.length; i++) {
            array[i]["runtimeCount"] = 0;
            array[i]["historyCount"] = 0;
          }
          this.versions = array;
        });
    },
    getMetadata() {
      this.$api()
        .get("/process-definition/" + this.definitionId)
        .then(response => {
          this.definitionMetadata = response.data;
          this.getVersionsByKey();
          this.$set(this.definitionMetadata, "deployTime", null);
          this.$set(this.definitionMetadata, "totalCount", 0);
          this.$set(this.definitionMetadata, "currentCount", 0);
          this.$set(this.definitionMetadata, "totalHistoryCount", 0);
          this.$set(this.definitionMetadata, "currentHistoryCount", 0);
          this.$set(this.definitionMetadata, "incidentsCount", null);
          this.$api()
            .get("/deployment/" + this.definitionMetadata.deploymentId)
            .then(response => {
              this.definitionMetadata.deployTime = this.convertDateToHumanStyle(
                response.data.deploymentTime
              );
            });

          this.$api()
            .post("/process-instance/count", {
              processDefinitionKey: this.definitionMetadata.key,
              withoutTenantId: true
            })
            .then(response => {
              this.definitionMetadata.totalCount = response.data.count;
            });

          this.$api()
            .post("/process-instance/count", {
              processDefinitionId: this.definitionMetadata.id
            })
            .then(response => {
              this.definitionMetadata.currentCount = response.data.count;
            });

          this.$api()
            .get(
              "/history/process-instance/count?processDefinitionId=" +
                this.definitionMetadata.id
            )
            .then(response => {
              this.definitionMetadata.currentHistoryCount = response.data.count;
            });
          this.$api()
            .get(
              "/history/process-instance/count?processDefinitionKey=" +
                this.definitionMetadata.key
            )
            .then(response => {
              this.definitionMetadata.totalHistoryCount = response.data.count;
            });

          this.$api()
            .get(
              "/incident/count?processDefinitionId=" +
                this.definitionMetadata.id
            )
            .then(response => {
              this.definitionMetadata.incidentsCount = response.data.count;
              this.ready = true;
            });
        });
    },

    suspendCurrentId() {
      this.$api()
        .put(
          "/process-definition/" + this.definitionMetadata.id + "/suspended",
          {
            executionDate: null,
            includeProcessInstances: this.inculdeCurrentInstance,
            suspended: !this.definitionMetadata.suspended
          }
        )
        .then(response => {
          this.$notify({
            group: "foo",
            title: this.definitionMetadata.suspended
              ? "Unsuspended!"
              : "Suspended",
            type: "success"
          });
          this.getMetadata();
          this.$emit("suspended");
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Some problem!",
            text: error.data,
            type: "error"
          });
          this.getMetadata();
        });
    },
    convertDateToHumanStyle: function(date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    },
    getVariant() {
      if (this.definitionMetadata.suspended) {
        return "warning";
      } else return "primary";
    },
    getIcon() {
      if (this.definitionMetadata.suspended) {
        return "play";
      } else return "pause";
    },
    getText() {
      if (this.definitionMetadata.suspended) {
        return "Unsuspend";
      } else return "Suspend";
    }
  }
};
</script>

<style>
.spinner {
  position: absolute; /*it can be fixed too*/
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;

  /*this to solve "the content will not be cut when the window is smaller than the content": */
  max-width: 100%;
  max-height: 100%;
  overflow: auto;

  z-index: 99;
}
</style>
