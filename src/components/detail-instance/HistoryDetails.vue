<template>
  <div>
    <h3>Variables history</h3>
    <b-card id="historyDetails" bg-variant="light" text-variant="dark">
      <div id="people">
        <v-client-table :data="historyElements" :columns="columns" :options="options"></v-client-table>
      </div>
    </b-card>
  </div>
</template>

<script>
import * as api from "@/api/api";
export default {
  name: "HistoryDetails",
  props: ["processInstanceId"],
  data() {
    return {
      historyElements: [],
      columns: [
        "id",
        "time",
        "variableName",
        "value",
        "activityInstanceId",
        "revision"
      ],
      options: {
        theme: "bootstrap4",
        template: "footerPagination",
        filterByColumn: true,
        clientMultiSorting: true,
        toggleGroups: true,
        pagination: { chunk: 30, edge: true },
        perPage: 30,
        perPageValues: [30, 60, 90, 120],
        highlightMatches: true,
        skin: "table table-bordered table-hover table-sm",
        groupBy: "activityInstanceId",
        sortable: [
          "time",
          " variableName",
          "value",
          "activityInstanceId",
          "revision"
        ],
        filterable: ["variableName", "value", "activityInstanceId"]
      }
    };
  },

  mounted() {
    this.getHistoryDetails();
  },
  methods: {
    convertDateToHumanStyle: function(date) {
      var cal = this.$momenttrue(date).format("DD.MM.YYYY, H:mm:ss");

      return cal;
    },
    getHistoryDetails() {
      this.$api()
        .get(
          "/history/detail?historicVariableUpdates=true&sortBy=time&sortOrder=desc&processInstanceId=" +
            this.processInstanceId
        )
        .then(response => {
          this.historyElements = response.data;

          this.historyElements.forEach(element => {
            element.time = this.convertDateToHumanStyle(element.time);
            if (element.value instanceof Object == true) {
              element.value = JSON.stringify(element.value)
                .replace(/,/g, ",\n")
                .replace(/}/g, "}\n");
            }
          });
        });
    }
  }
};
</script>

<style scoled>
tr.info {
  background: #6c757d;
  color: white;
}
.btn-secondary {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
  font-size: small;
}
.table-bordered td,
.table-bordered th {
  /* border: 1px solid #dee2e6; */
  font-size: small;
}
.VueTables__search {
  display: none;
}
.form-inline {
  display: -ms-flexbox;
  display: -webkit-box;
  display: flex;
  -ms-flex-flow: row wrap;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  flex-flow: row wrap;
  -ms-flex-align: center;
  -webkit-box-align: center;
  align-items: center;
  font-size: small;
}
.form-control {
  display: block;
  width: 100%;
  /* height: calc(2.25rem + 2px); */
  padding: 0.375rem 0.75rem;
  /* font-size: 1rem; */
  /* line-height: 1.5; */
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  -webkit-transition: border-color 0.15s ease-in-out,
    -webkit-box-shadow 0.15s ease-in-out;
  transition: border-color 0.15s ease-in-out,
    -webkit-box-shadow 0.15s ease-in-out;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out,
    -webkit-box-shadow 0.15s ease-in-out;
}
</style>
