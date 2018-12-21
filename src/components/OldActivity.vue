<template>
  <div>
    <h2>{{oldActivites.length}} instances, waited more 1 week on single activity</h2>

    <table class="table table-striped table-hover table-sm">
      <thead>
        <tr>
          <th>Stared</th>
          <th>Process</th>
          <th>Activity</th>
          <th>Activity type</th>
          <th>Instance</th>
        </tr>
      </thead>
      <tbody>
        <tr :key="item.id" v-for="item in oldActivites">
          <td style="word-break:break-all;">{{convertDateToHumanStyle(item.startTime)}}</td>
          <td style="word-break:break-all;">{{item.processDefinitionKey}}</td>
          <td style="word-break:break-all;">{{item.activityId}}</td>
          <td style="word-break:break-all;">{{item.activityType}}</td>
          <td style="word-break:break-all;">
            <router-link
              :to="{name:'processdetail', params:{ processInstanceId: item.processInstanceId}}"
            >
              <p class="card-text">
                <b>{{item.processInstanceId}}</b>
              </p>
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import * as api from "@/api/api";

export default {
  name: "OldActivity",
  data() {
    return {
      oldActivites: [],
      momentdays: ""
    };
  },
  mounted() {
    this.findSubtractDate();

    setTimeout(() => {
      this.getOldActivites();
    }, 150);
  },
  methods: {
    getOldActivites() {
      api
        .getEntity(
          "history",
          "activity-instance",
          "unfinished=true&startedBefore=" +
            this.momentdays +
            "&sortBy=startTime&sortOrder=asc&maxResults=200"
        )
        .then(value => (this.oldActivites = value));
    },
    findSubtractDate: function() {
      var date = new Date();

      var tendaysago = this.$momenttrue(date)
        .subtract(7, "days")
        .calendar();
      var momentdays = this.$momenttrue(tendaysago).format(
        "YYYY-MM-DD[T]H:mm:ss.sss[UTC]"
      );

      this.momentdays = momentdays;
    },

    convertDateToHumanStyle: function(date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    }
  }
};
</script>
