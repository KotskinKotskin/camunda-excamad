<template>
  <b-card id="networkdiagram" bg-variant="light" text-variant="dark">
    <h2>History duration diagram</h2>

    <p class="text-left">
      <b-btn size="sm" @click="setVertical">strict</b-btn>
    </p>
    <network
      class="network"
      ref="network"
      :nodes="network.nodes"
      :edges="network.edges"
      :options="network.options"
    ></network>
  </b-card>
</template>

<script>
import { Timeline, Graph2d, Network } from "vue2vis";
export default {
  data() {
    return {
      networkEvents: "",
      network: {
        nodes: [],
        edges: [],
        options: {
          autoResize: true,

          height: "100%",
          layout: {
            hierarchical: false
          }
        }
      }
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
  },
  methods: {
    setVertical() {
      this.network.options.layout.hierarchical = !this.network.options.layout
        .hierarchical;
    },

    returnShape: function(item) {
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
    returnColor: function(item) {
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

    returnLabel: function(item) {
      var name = item.activityId;
      var duratonInMinutes =
        Math.round((item.durationInMillis / 60000) * 100) / 100;
      if (duratonInMinutes == 0) {
        duratonInMinutes = "";
      }
      var delimiter = "\n";
      return name + delimiter + duratonInMinutes;
    },
    convertDateToHumanStyle: function(date) {
      var cal = this.$momenttrue(date).format("DD.MM.YYYY, H:mm:ss");

      return cal;
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
    },
    addEdge() {
      const n1 = Math.floor(Math.random() * this.network.nodes.length);
      const n2 = Math.floor(Math.random() * this.network.nodes.length);
      this.network.edges.push({
        id: `${this.network.nodes[n1].id}-${this.network.nodes[n2].id}`,
        from: this.network.nodes[n1].id,
        to: this.network.nodes[n2].id
      });
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