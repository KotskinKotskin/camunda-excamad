<template>
<div id="DecisionDetails">
    <h3>Decisions</h3>
    <p v-if="arrayOfDecisions.length == 0">No decisions</p>
    <div v-if="arrayOfDecisions.length > 0">
        <decision-item class="mt-2" v-for="item in  arrayOfDecisions" :decisionItem="item" v-bind:key="item.id"></decision-item>
    </div>
</div>
</template>

<script>
import * as api from "@/api/api";
export default {
    name: "DecisionDetail",
    props: ["processInstanceId"],
    data() {
        return {
            arrayOfDecisions: []
        };
    },
    mounted() {
        this.getHistoryDecisions();
    },
    methods: {
        getHistoryDecisions: async function () {
            var vm = this;
            return new Promise(function (resolve, reject) {
                api
                    .getEntity(
                        "history",
                        "decision-instance",
                        "processInstanceId=" + vm.processInstanceId
                    )
                    .then(value => {
                        var array = value;

                        array.forEach(element => {
                            api
                                .getEntity(
                                    "history",
                                    "decision-instance/" + element.id,
                                    "includeInputs=true&includeOutputs=true"
                                )
                                .then(response => {
                                    vm.arrayOfDecisions.push(response);
                                });
                        });
                        resolve();
                    });
            });
        }
    }
};
</script>

<style>
</style>
