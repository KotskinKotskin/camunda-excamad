<template>
  <fullscreen ref="fullscreen" @change="fullscreenChange">
    <b-card id="networkdiagram" bg-variant="light" text-variant="dark">
      <h2>History duration diagram</h2>

      <b-btn class="incanvas" @click="toggle" size="sm" variant="outline-success">
        <font-awesome-icon icon="arrows-alt"/>
      </b-btn>

      <b-btn class="ml-3" size="sm" @click="setVertical">strict</b-btn>

      <network
        class="network"
        ref="network"
        :nodes="network.nodes"
        :edges="network.edges"
        :options="network.options"
      ></network>
    </b-card>
  </fullscreen>
</template>

<script>
import {Network } from "vue2vis";
import fullscreen from "vue-fullscreen";

export default {
  data() {
    return {
      fullscreen: false,
      networkEvents: "",
      network: {
        nodes: [],
        edges: [],
        options: {
          autoResize: true,
          // edges: {
          //   smooth: {
          //     type: "discrete",

          //     roundness: 1
          //   }
          // },1
          physics: {
            hierarchicalRepulsion: {
              centralGravity: 0,
              springLength: 180,
              springConstant: 0,
              nodeDistance: 160,
              damping: 0.12
            },
            minVelocity: 0.75,
            solver: "hierarchicalRepulsion",
            timestep: 0.49
          },
          height: "100%",
          layout: {
            hierarchical: true
          }
        }
      },
      historyDetails: []
    };
  },
  props: ["processInstanceId"],
  components: {
    Timeline,
    Graph2d,
    Network
  },
  mounted() {
    setTimeout(() => {
      this.addNodesFromArray();
    }, 500);
    setTimeout(() => {
      this.getHistoryDetails();
    }, 1500);
  },
  watch: {
    fullscreen: function (val) {
      if (val == false) {
        this.toggleback();
      }
    }
  },
  methods: {
    fullscreenChange(fullscreen) {
      this.fullscreen = fullscreen;
    },
    setVertical() {
      this.network.options.layout.hierarchical = !this.network.options.layout
        .hierarchical;
    },
    toggle() {
      this.$refs["fullscreen"].toggle(); // recommended
      // this.defaultstyle = "height: 1200px";
    },
    toggleback() {
      this.$refs["fullscreen"].toggle(); // recommended
      // this.defaultstyle = "height: 600px";
    },
    returnShape: function (item) {
      if (item.indexOf("Event") !== -1 || item.indexOf("event") !== -1) {
        return "dot";
      }
      if (item.indexOf("Task") !== -1 || item.indexOf("task") !== -1) {
        return "box";
      }
      if (item.indexOf("Gateway") !== -1 || item.indexOf("gateway") !== -1) {
        return "diamond";
      }
      if (item.indexOf("Boundary") !== -1 || item.indexOf("boundary") !== -1) {
        return "ellipse";
      } else return "triangle";
    },
    returnColor: function (item) {
      if (item.indexOf("Event") !== -1 || item.indexOf("event") !== -1) {
        return "#83d0f2";
      }
      if (item.indexOf("Task") !== -1 || item.indexOf("task") !== -1) {
        return "#06d00a";
      }
      if (item.indexOf("Gateway") !== -1 || item.indexOf("gateway") !== -1) {
        return "#7ba4fb";
      }
      if (item.indexOf("Boundary") !== -1 || item.indexOf("boundary") !== -1) {
        return "#dddddd";
      }
    },

    returnLabel: function (item) {
      var name = item.id;
      var duratonInMinutes =
        Math.round((item.durationInMillis / 60000) * 100) / 100;
      if (duratonInMinutes == 0) {
        duratonInMinutes = "";
      }
      var delimiter = "\n";
      return name;
    },
    convertDateToHumanStyle: function (date) {
      var cal = this.$momenttrue(date).format("DD.MM.YYYY, H:mm:ss");

      return cal;
    },

    getIdByInstance(item) { },
    getHistoryDetails() {
      this.$api()
        .get(
          "/history/detail?historicVariableUpdates=true&sortBy=time&sortOrder=desc&processInstanceId=" +
          this.processInstanceId
        )
        .then(response => {
          this.historyDetails = response.data.slice(-100);
          for (var i = 0; i < this.historyDetails.length; i++) {
            var currenti = i + 1;

            this.network.nodes.push({
              id: currenti + this.activities.length,
              font: { multi: "md", size: 11, align: "left" },
              shape: "box",
              color: "#007bff80",
              heightConstraint: { minimum: 30 },
              shapeProperties: { borderDashes: [5, 5] },
              margin: 5,
              size: 40,
              label: this.prepareHistoryDetailsLabel(this.historyDetails[i])
            });

            var result = "";
            this.network.nodes.forEach(element => {
              if (element.label == this.historyDetails[i].activityInstanceId) {
                result = element.id;
              }
            });

            this.network.edges.push({
              id: currenti + this.activities.length,
              from: result,
              length: 300,
              dashes: true,
              color: { color: "grey", opacity: 0.3 },
              arrows: "to",
              to: currenti + this.activities.length
            });
          }
        });
    },

    prepareHistoryDetailsLabel(item) {
      var time = "*" + this.convertDateToHumanStyle(item.time) + "*";
      var variableName = "*" + item.variableName + "*";

      if (item.value instanceof Object == false) {
        var value = "*" + item.value + "*";
      }
      if (item.value instanceof Object == true) {
         value =
          "`\n" +
          JSON.stringify(item.value)
            .replace(/,/g, ",\n\n")
            .replace(/}/g, "}\n") +
          "`";
      }
      var revision = "*" + item.revision + "*";

      var label =
        "Update time: " +
        time +
        "\n" +
        "variable: " +
        variableName +
        "\n" +
        "New value: " +
        value +
        "\n";

      if (revision > 0) {
        label = label + "Revision:" + revision + "\n";
      }

      return label;
    },
    addNodesFromArray() {
      {
        this.$api()
          .get(
            "/history/activity-instance?&&sortBy=startTime&&sortOrder=asc&&processInstanceId=" +
            this.processInstanceId
          )
          .then(response => {
            this.activities = response.data;
            for (var i = 0; i < this.activities.length; i++) {
              var currenti = i + 1;
              var nexti = i + 2;
              this.network.nodes.push({
                id: currenti,
                shape: this.returnShape(this.activities[i].activityType),
                color: this.returnColor(this.activities[i].activityType),
                margin: 5,
                label: this.returnLabel(this.activities[i])
              });
              if (nexti <= this.activities.length) {
                this.network.edges.push({
                  id: currenti,
                  from: currenti,
                  label: this.convertDateToHumanStyle(
                    this.activities[i].endTime
                  ),
                  length: 135,
                  to: nexti,
                  arrows: "to"
                });
              }
            }
          });
      }
    }
  }
};
</script>

<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/vis/4.20.1/vis.min.css";

.events {
  text-align: left;
  height: 70px;
}
.network {
  height: 1100px;
}
</style>