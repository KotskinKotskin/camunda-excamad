<template>
  <b-card id="stream" bg-variant="light" text-variant="dark">
    <h2>Online activity stream (max 150)</h2>
    <GChart v-if="chartData.length >3" type="ColumnChart" :data="chartData"/>

    <timeline>
      <transition-group name="list" tag="p">
        <timeline-item v-for="item in activities.slice(0,150)" :key="item.id" bg-color="#33333">
          <b-card
            :header="convertDateToHumanStyle(item.endTime)"
            :title="item.activityId"
            :border-variant="calculateStyle(item.unRead)"
          >
            <b-container class="bv-example-row">
              <b-row class="text-left">
                <b-col cols="4">
                  <p class="card-text">{{item.activityName}}</p>
                  <p class="card-text">
                    <b-badge variant="info">{{item.activityType}}</b-badge>
                  </p>
                  <p class="card-text">{{item.processDefinitionId}}</p>

                  <router-link
                    :to="{name:'processdetail', params:{ processInstanceId: item.processInstanceId}, query: {baseurl}}"
                  >
                    <p class="card-text">
                      <b>{{item.processInstanceId}}</b>
                    </p>
                  </router-link>
                </b-col>
                <b-col cols="8">
                  <p>Started {{convertDateToHumanStyle(item.startTime)}}</p>
                  <p v-if="item.endTime">Ended {{convertDateToHumanStyle(item.endTime)}}</p>
                  <p v-if="item.durationInMillis">Duration (ms) {{item.durationInMillis}}</p>
                </b-col>
              </b-row>
            </b-container>
          </b-card>
        </timeline-item>
      </transition-group>
    </timeline>
  </b-card>
</template>


<script>
import { Timeline, TimelineItem } from "vue-cute-timeline";
export default {
  components: {
    Timeline,
    TimelineItem
  },
  name: "Stream",
  props: ["processInstanceId"],
  data() {
    return {
      activities: [],
      activitiesAutoLoad: [],
      uniqArray: [],
      callTime: "",

      // Array will be automatically processed with visualization.arrayToDataTable function
      chartData: [["Activity name", "Duration (minutes)"]]
    };
  },
  mounted() {
    setTimeout(() => {
      this.getLastActivity();
    }, 100);
  },
  methods: {
    getLastActivity() {
      if (!this.processInstanceId) {
        this.$api()
          .get(
            "/history/activity-instance?&&sortBy=startTime&&sortOrder=desc&&maxResults=30"
          )
          .then(response => {
            this.activities = response.data;
          });
      }

      if (this.processInstanceId) {
        this.$api()
          .get(
            "/history/activity-instance?&&sortBy=startTime&&sortOrder=desc&&processInstanceId=" +
              this.processInstanceId
          )
          .then(response => {
            this.activities = response.data;
            this.activities.forEach(element => {
              var obj = [];
              obj[0] = element.activityId;
              obj[1] = element.durationInMillis / 60000;
              if (obj[1] > 1) {
                this.chartData.push(obj);
              }
            });
          });
      }
    },
    addIfNotInArray() {
      // if (!this.processInstanceId) {
      //   this.$api()
      //     .get(
      //       "/history/activity-instance?&&sortBy=startTime&&sortOrder=desc&&maxResults=10"
      //     )
      //     .then(response => {
      //       this.activitiesAutoLoad = response.data;
      //     });
      //   var a = this.activities;
      //   var b = this.activitiesAutoLoad;
      //   this.uniqArray = b.filter(o => !a.find(o2 => o.id === o2.id));
      //   this.uniqArray.forEach(element => {
      //     this.$set(element, "unRead", true);
      //     this.activities.unshift(element);
      //   });
      // }
      // if (this.processInstanceId) {
      //   this.$api()
      //     .get(
      //       "/history/activity-instance?&&sortBy=startTime&&sortOrder=desc&&maxResults=10&&processInstanceId=" +
      //         this.processInstanceId
      //     )
      //     .then(response => {
      //       this.activitiesAutoLoad = response.data;
      //     });
      //   var a2 = this.activities;
      //   var b2 = this.activitiesAutoLoad;
      //   this.uniqArray = b2.filter(o => !a2.find(o2 => o.id === o2.id));
      //   this.uniqArray.forEach(element => {
      //     this.$set(element, "unRead", true);
      //     this.activities.unshift(element);
      //   });
      // }
    },
    calculateStyle(item) {
      if (item == true) {
        return "primary";
      } else return "";
    },
    convertDateToHumanStyle: function(date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
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
.list-item {
  display: inline-block;
  margin-right: 10px;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.5s;
}
.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>

