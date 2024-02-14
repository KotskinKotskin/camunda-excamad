<template>
<div id="BatchTable">
    <div v-if="loading" style="text-align: center; margin-bottom: 10px">
      Sending {{requestCounter}}/{{batches.length}}
    </div>

    <div v-else class="main-buttons">
      <b-button variant="outline-info" size="sm" @click="suspendAllBatches()" class="mr-2">Suspend All</b-button>
      <b-button variant="outline-danger" size="sm" @click="deleteAllBatches()" class="mr-2">Delete All</b-button>
    </div>

    <b-table :fields="fields" small bordered striped :items="batches" caption-top>
        <template v-slot:cell(delete)="data">
            <b-button variant="outline-danger" size="sm" @click="deleteBatch(data.item.id)" class="mr-2"> Delete</b-button>

        </template>
        <template v-slot:cell(suspend)="data">
            <b-button variant="outline-info" size="sm" @click="suspendBatch(data.item)" class="mr-2">Suspend</b-button>
        </template>
    </b-table>
</div>
</template>

<script>
export default {
    name: "BatchTable",
    data() {
        return {
            loading: false,
            requestCounter: 0,
            batches: [],
            fields: ["id", {
                    key: "type",
                    sortable: true
                }, {
                    key: "totalJobs",
                    sortable: true
                }, {
                    key: "jobsCreated",
                    sortable: true
                }, {
                    key: "remainingJobs",
                    sortable: true
                }, {
                    key: "completedJobs",
                    sortable: true
                },
                {
                    key: "failedJobs",
                    sortable: true
                },
                {
                    key: "suspended",
                    sortable: true
                },
                {
                    key: "suspend",
                    label: "Suspend"
                },
                {
                    key: "delete",
                    label: "Delete"
                },
            ]
        }
    },
    mounted() {
        this.getBatches();
    },
    methods: {
        deleteAllBatches() {
          if (!window.confirm("Do you really want to delete all branches?")) {
            return;
          }

          this.loading = true;
          this.requestCounter = 0;
          const total = this.batches.length;

          this.$notify({
            group: "foo",
            title: "Deleting batches...",
            type: "info"
          });

          Promise.allSettled(this.batches.map(batch => {
            return this.$api().delete('/batch/' + batch.id + "?cascade=true").then(() => {
              this.requestCounter++;
            });
          })).then((response) => {
            const failed = response.filter(r => r.status === "rejected").length;
            if (failed > 0) {
              this.$notify({
                group: "foo",
                title: "Failed to delete batches",
                text: `${failed} out of ${total} failed.`,
                type: "warn",
                duration: 5000
              });
            } else {
              this.$notify({
                group: "foo",
                title: "All batches deleted!",
                type: "success",
                duration: 5000
              });
            }
            this.getBatches();
          }).catch(error => {
            this.$notify({
              group: "foo",
              title: "Unexpected error occurred while deleting all batches",
              text: error.message,
              type: "error"
            });
          }).finally(() => this.loading = false);
        },
        suspendAllBatches() {
          if (!window.confirm("Do you really want to suspend all branches?")) {
            return;
          }

          this.requestCounter = 0;
          this.loading = true;
          const unsuspendedBatches = this.batches.filter(batch => !batch.suspended);
          const total = unsuspendedBatches.length;

          this.$notify({
            group: "foo",
            title: "Suspending batches...",
            type: "info"
          });

          Promise.allSettled(unsuspendedBatches.map(batch => {
            return this.$api().put('/batch/' + batch.id + "/suspended", {suspended: true}).then(() => {
              this.requestCounter++;
            });
          })).then((response) => {
            const failed = response.filter(r => r.status === "rejected").length;
            if (failed > 0) {
              this.$notify({
                group: "foo",
                title: "Failed to suspend batches",
                text: `${failed} out of ${total} failed.`,
                type: "warn",
                duration: 5000
              });
            } else {
              this.$notify({
                group: "foo",
                title: "All batches suspended!",
                type: "success",
                duration: 5000
              });
            }
            this.getBatches();
          }).catch(error => {
            this.$notify({
              group: "foo",
              title: "Unexpected error occurred while suspending all batches",
              text: error.message,
              type: "error"
            });
          }).finally(() => this.loading = false);
        },
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
        },

    }
}
</script>

<style>
.main-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  gap: 10px;
}
</style>
