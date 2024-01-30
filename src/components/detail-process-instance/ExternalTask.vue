<template>
<div>
    <h2> External task </h2>
    <v-client-table :data="externalTaskJobs" :columns="columns" :options="options">
        <template slot="actions" slot-scope="{ row }">
            <b-btn size="sm" @click="retryExtTask(row.processInstanceId, row.id)">
                <font-awesome-icon icon="redo" />Retry</b-btn>
            <b-btn v-if="row.lockExpirationTime !== null" size="sm" class="ml-2" @click="unlockExtTask(row.id)">
                Unlock
            </b-btn>
        </template>

    </v-client-table>
</div>
</template>

<script>
export default {
    name: "ExternalTask",
    props: ["processInstanceId"],
    data() {
        return {
            externalTaskJobs: [],
            columns: [
                "activityId",
                "errorMessage",
                "lockExpirationTime",
                "retries",
                "suspended",
                "workerId",
                "topicName",
                "actions"
            ],
            options: {
                theme: "bootstrap4",
                template: "footerPagination",
                filterByColumn: false,
                clientMultiSorting: true,
                toggleGroups: false,
                pagination: {
                    chunk: 30,
                    edge: true
                },
                perPage: 30,
                perPageValues: [30, 60, 90, 120],
                highlightMatches: true,
                skin: "table table-bordered table-hover table-sm"
            }
        };
    },
    methods: {
        getExternalTask() {
            this.$api()
                .get("/external-task?processInstanceId=" + this.processInstanceId)
                .then(response => {
                    this.externalTaskJobs = response.data;
                });
        },
        retryExtTask(processInstanceId, extId) {
            var putObj = {
                retries: 1,
                processInstanceIds: [processInstanceId],
                externalTaskIds: [extId]
            }
            this.$api().put("/external-task/retries", putObj).then(response => {

                this.$notify({
                    group: "foo",
                    title: " Retries setuped",
                    type: "success"
                });
            }).catch(error => {
                this.$notify({
                    group: "foo",
                    title: "Retries NOT setuped",
                    text: error,
                    type: "error"
                });
            })
        },
        unlockExtTask(extId) {
            this.$api().post(`/external-task/${extId}/unlock`).then(response => {
                this.$notify({
                    group: "foo",
                    title: "Task unlocked",
                    type: "success"
                });
            }).catch(error => {
                this.$notify({
                    group: "foo",
                    title: "Task NOT unlocked",
                    text: error,
                    type: "error"
                });
            })
        }
    },
    mounted() {
        this.getExternalTask();
    }

}
</script>

<style>

</style>
