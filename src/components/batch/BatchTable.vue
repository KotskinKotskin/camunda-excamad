<template>
  <div id="BatchTable">
    <b-table :fields="fields" small bordered striped :items="batches" caption-top>
      <template v-slot:cell(delete) >
        <b-button
          variant="outline-danger"
          size="sm"
          @click="deleteBatch(row.item.id)"
          class="mr-2"
        >Delete</b-button>
        
      </template>
      <template v-slot:cell(suspend) >
        <b-button
          variant="outline-info"
          size="sm"
          @click="suspendBatch(row.item)"
          class="mr-2"
        >Suspend</b-button>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  name: "BatchTable",
  data() {
    return {
      batches: [],
      fields: ["id", { key: "type", sortable: true }, { key: "totalJobs", sortable: true }, { key: "jobsCreated", sortable: true }, { key: "remainingJobs", sortable: true }, { key: "completedJobs", sortable: true },
        { key: "failedJobs", sortable: true },
        { key: "suspended", sortable: true },
        { key: "suspend", label: "Suspend" },
        { key: "delete", label: "Delete" },

      ]
    }
  },
  mounted() {
    this.getBatches();
  },
  methods: {
    getBatches() {
      this.$api().get('/batch/statistics').then(response => {
        this.batches = response.data;
      })
    },
    deleteBatch(batchId) {

      this.$notify({
        group: "foo",
        title: "Started, wait..",
        type: "info"
      });

      this.$api().delete('/batch/' + batchId + "?cascade=true").then(response => {
        this.$notify({
          group: "foo",
          title: "Deleted!",
          type: "success"
        });

      }).catch(error => {
        this.$notify({
          group: "foo",
          title: "Fail",
          text: error,
          type: "error"
        })
      })
    },
    suspendBatch(item) {
      var putObj = {
        suspended: true
      }
      if (item.suspended == true) {
        putObj.suspended = false
      }

      this.$notify({
        group: "foo",
        title: "Started, wait..",
        type: "info"
      });

      this.$api().put('/batch/' + item.id + "/suspended", putObj).then(response => {
        item.suspended = !item.suspended;
        this.$notify({
          group: "foo",
          title: "done!",
          type: "success"
        });

      }).catch(error => {
        this.$notify({
          group: "foo",
          title: "Fail",
          text: error,
          type: "error"
        })
      })
    }
    ,

  }
}
</script>

<style>
</style>
