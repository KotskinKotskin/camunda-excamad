<template>
  <div class="fieldTable">
    <v-client-table :data="value" :columns="columns" :options="options"></v-client-table>
  </div>
</template>

<script>
import { abstractField } from "vue-form-generator";

export default {
  mixins: [abstractField],
  data() {
    return {
      columns: ["id", "name"]
    };
  },
  created() {
    this.calculateColumns();
  },
  methods: {
    calculateColumns() {
      this.columns = [];
      if (this.value) {
        for (var key in this.value[0]) {
          this.columns.push(key);
        }
      }
    }
  },
  computed: {
    options() {
      let options = {
        theme: "bootstrap4",
        template: "footerPagination",
        filterByColumn: true,
        clientMultiSorting: true,
        pagination: { chunk: 30, edge: true },
        perPage: 30,
        perPageValues: [30, 60, 90, 120],
        highlightMatches: true,
        skin: "table table-bordered table-hover table-sm",
        sortable: this.columns,
        filterable: this.columns
      };
      return options;
    }
  }
};
</script>

<style>
</style>
