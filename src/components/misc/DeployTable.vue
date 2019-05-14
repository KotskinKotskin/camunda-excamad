<template>
  <div id="Deployments">
    <b-table hover :items="deployments" :fields="fields" striped caption-top>
      <template slot="table-caption">Total {{totalResult}}</template>

      <template slot="show_details" slot-scope="row">
        <b-button
          variant="link"
          size="sm"
          @click="rowClick(row)"
          class="mr-2"
        >{{ row.detailsShowing ? 'Hide' : 'Show'}} Details</b-button>
      </template>

      <template slot="row-details" slot-scope="row">
        <b-card>
          <li v-bind:key="resourse.name" v-for="resourse in row.item.resourses">{{resourse.name}}</li>

          <b-button variant="link" size="sm" @click="row.toggleDetails">Hide Details</b-button>
        </b-card>
      </template>
    </b-table>
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
  name: "DeployTable",
  data() {
    return {
      firstResult: 0,
      currentPage: 1,
      resourses: [],
      maxResult: 20,
      totalResult: 0,
      totalPage: 0,
      deployments: [],
      fields: ["id", "deploymentTime", "name", "source", "show_details"]
    };
  },
  watch: {
    currentPage: function(newValue) {
      if (newValue != 0) {
        this.firstResult =
          Math.round(this.currentPage * this.maxResult) - this.maxResult;

        this.getDeployments();
      }
    }
  },
  methods: {
    rowClick(row) {
      this.resourses = [];
      row.item._showDetails = !row.item._showDetails;
      this.$api()
        .get("/deployment/" + row.item.id + "/resources")
        .then(response => {
          this.$set(row.item, "resourses", response.data);
        });
    },
    getDeployments() {
      this.$api()
        .get(
          "/deployment?sortBy=deploymentTime&sortOrder=desc&firstResult=" +
            this.firstResult +
            "&maxResults=" +
            this.maxResult
        )
        .then(response => {
          this.deployments = response.data;
          this.deployments.forEach(element => {
            element.deploymentTime = this.convertDateToHumanStyle(
              element.deploymentTime
            );
            this.$set(element, "_showDetails", false);
          });
        });
    },
    getDeploymentsCount() {
      this.$api()
        .get("/deployment/count")
        .then(response => {
          this.totalResult = response.data.count;
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
    }
  },
  mounted() {
    this.getDeployments();
    this.getDeploymentsCount();
  }
};
</script>

<style>
</style>
