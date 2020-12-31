<template>
<div class>
    <atom-spinner v-if="!(ready == true)" class="spinner" :animation-duration="1000" :size="60" :color="'#007bff'" />
    <h3>Process definitions and migration tool</h3>
    <b-form inline class="mt-2 mb-2">
        <b-input-group class="mr-2">
            <b-form-input size="sm" v-model="filter" placeholder="Type to Search"></b-form-input>
            <b-input-group-append>
                <b-button size="sm" :disabled="!filter" @click="filter = ''">Clear</b-button>
            </b-input-group-append>
        </b-input-group>
        <b-input class="mb-2 mr-sm-2 mb-sm-0" placeholder="Definition name" size="sm" v-model="maxResult" />
        <b-form-checkbox size="sm" id="checkbox1" v-model="latestVersion">Latest Version</b-form-checkbox>
        <b-button size="sm" @click="searchAndCount" variant="outline-success">Search</b-button>
    </b-form>

    <b-table small :busy="!(ready == true)" bordered striped :filter="filter" :fields="fields" :items="processDefinitions" caption-top>
        <template slot="table-caption">
            Total on server {{totalResult}}
            <div v-if="totalPage>1">
                <b-pagination-nav align="center" size="sm" base-url="#" number-of-pages="totalPage" v-model="currentPage" />
            </div>
        </template>
        <template v-slot:cell(show_details)="row">
            <b-button variant="link" size="sm" @click="rowClick(row)" class="mr-2">{{ row.detailsShowing ? 'Less' : 'More'}}</b-button>
        </template>

        <template v-slot:row-details="row">
            <definition-detail :definitionId="row.item.id"></definition-detail>
        </template>

        <template v-slot:cell(key)="data">
            <router-link :to="{name:'definition', params:{ definitionId: data.item.id}}">
                <b>{{data.item.key}}</b>
                , v{{data.item.version}}
            </router-link>
            <br>
            <small>{{data.item.deployTimeString}}</small>
        </template>
    </b-table>
    <div v-if="totalPage>1">
        <b-pagination-nav align="center" size="sm" base-url="#" number-of-pages="totalPage" v-model="currentPage" />
    </div>
</div>
</template>

<script>
import {
    library
} from "@fortawesome/fontawesome-svg-core";
import {
    faSearch
} from "@fortawesome/free-solid-svg-icons";

var _ = require("lodash");
import * as api from "@/api/api";
library.add(faSearch);
export default {
    data() {
        return {
            firstResult: 0,
            currentPage: 1,
            maxResult: 100,
            totalResult: 0,
            filter: null,
            totalPage: 0,
            statistics: null,
            tag: "",
            fields: [{
                    key: "key",
                    sortable: true
                }, "name", {
                    key: "activeCount",
                    label: "Active",
                    sortable: true
                }, {
                    key: "incidentCount",
                    label: "Incident",
                    sortable: true
                }, {
                    key: "humanTaskCount",
                    label: "Human task",
                    sortable: true
                },
                /* {
                               key: "endedCount",
                               label: "Finished",
                               sortable: true
                           }, */
                {
                    key: "show_details",
                    label: "More"
                }
            ],
            migrateAll: false,
            separators: [";", ","],
            tags: [],
            query: "",
            routes: [],
            latestVersion: true,
            processDefinitions: [],
            updateEventTriggers: true,
            processDefinitionFrom: null,
            processDefinitionTo: null,
            processDefinitionsStringArray: [],
            arrayOfIncidents: [],
            sliceItem: 15,
            processDefinitionId: null,
            processActivityCount: [],
            nameOfProcessDefinition: null,
            finalPropsArray: [],
            processActivityCountToShow: [],
            ready: null,
            processMigrationInstructions: {}
        };
    },

    computed: {
        baseurl() {
            return this.$store.state.baseurl;
        },
        processInstanceQuery: function () {
            return {
                processDefinitionId: this.processDefinitionFrom
            };
        }
    },
    watch: {
        currentPage: function (newValue) {
            if (newValue != 0) {
                this.firstResult =
                    Math.round(this.currentPage * this.maxResult) - this.maxResult;

                this.searchProcessDefinitions();
            }
        }
    },
    methods: {
        nullTags() {
            this.tag = "";
            this.tags = [];
        },
        getProcessInstanceStatistics() {
            this.$api().get("/process-definition/statistics?failedJobs=true&incidents=true").then(response => {

                this.statistics = response.data;

                for (let index = 0; index < this.processDefinitions.length; index++) {
                    var currentStat = this.statistics.filter(it => {
                        return it.id == this.processDefinitions[index].id
                    })[0];

                    this.$set(this.processDefinitions[index], "activeCount", currentStat.instances);
                    if (currentStat.incidents.length > 0) {
                        this.$set(this.processDefinitions[index], "incidentCount", currentStat.incidents[0].incidentCount);
                    } else {
                        this.$set(this.processDefinitions[index], "incidentCount", 0);
                    }
                    var dangerKoef = 0;
                    var cellVar = {
                        incidentCount: ""
                    }
                    if (currentStat.instances != 0 && this.processDefinitions[index].incidentCount != 0) {
                        dangerKoef = this.processDefinitions[index].incidentCount / currentStat.instances;
                    }

                    if (dangerKoef > 0 && dangerKoef < 0.15) {
                        cellVar.incidentCount = "warning";
                        this.$set(this.processDefinitions[index], "_cellVariants", cellVar);
                    }

                    if (dangerKoef >= 0.15) {
                        cellVar.incidentCount = "danger";
                        this.$set(this.processDefinitions[index], "_cellVariants", cellVar);
                    }

                }

            })
        },
        rowClick(row) {
            row.item._showDetails = !row.item._showDetails;
        },
        getDefinitionsCount() {
            this.$api()
                .get("/process-definition/count?latestVersion=" + this.latestVersion)
                .then(response => {
                    this.totalResult = response.data.count != null ? response.data.count : 0;
                    this.totalPage = this.calculateTotalPage(this.totalResult);
                });
        },
        calculateTotalPage(total) {
            if (total == 0 || total == null) {
                return 1
            } else {

                var result = Math.round(total / this.maxResult);
                if (result <= 0) {
                    result = 1;
                }
                if (result * this.maxResult < total) {
                    result = result + 1;
                }
                return result;
            }
        },
        findDefinitionByName() {
            this.ready = false;
            this.processDefinitions = [];
            this.processDefinitionsStringArray = [];
            var keyLike = "";
            if (this.nameOfProcessDefinition.length != 0) {
                keyLike = "&nameLike=" + this.nameOfProcessDefinition;
            }

            this.$api()
                .get(
                    "/process-definition?sortBy=version&sortOrder=desc&latestVersion=" +
                    this.latestVersion +
                    keyLike
                )
                .then(response => {
                    this.processDefinitions = response.data;
                    this.ready = true;

                    this.updateCountForeach();
                })
                .catch();
        },
        onHide(item) {
            item.showModal = false;
        },
        searchProcessDefinitions() {
            this.ready = false;
            this.nameOfProcessDefinition = "";
            this.processDefinitions = [];
            this.processDefinitionsStringArray = [];

            this.$api()
                .get(
                    "/process-definition?sortBy=version&sortOrder=desc&latestVersion=" +
                    this.latestVersion + "&firstResult=" + this.firstResult + "&maxResults=" + this.maxResult
                )
                .then(response => {
                    this.processDefinitions = response.data;
                    this.processDefinitions.forEach(element => {
                        this.$set(element, "_showDetails", false);
                    });
                    this.ready = true;
                    this.getProcessInstanceStatistics();
                    this.updateCountForeach();
                })
                .catch();
        },
        getActivityAndCalculate(item) {
            item.showModal = true;

            this.getActivityByProcessDefinition(item).then(response => {
                this.calcluteUniqActivityCount();
            });
        },
        convertDateToHumanStyle: function (date) {
            var rel = this.$momenttrue(date)
                .startOf("second")
                .fromNow();

            var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

            var output = rel + " (" + cal + ") ";
            return output;
        },

        getDeploymentTime(deploymentId) {
            this.$api()
                .get("/deployment/" + deploymentId)
                .then(response => {
                    return this.convertDateToHumanStyle(response.data.deploymentTime);
                });
        },
        getActivityByProcessDefinition: async function (item) {
            var vm = this;
            return new Promise(function (resolve, reject) {
                api
                    .getEntity(
                        "history",
                        "activity-instance",
                        "unfinished=true&processDefinitionId=" + item.id
                    )
                    .then(value => {
                        vm.processActivityCount = value;
                        resolve();
                    });
            });
        },
        updateCountForeach: function () {
            this.processDefinitionsStringArray = [];
            for (let index = 0; index < this.processDefinitions.length; index++) {

                //this.$set(this.processDefinitions[index], "endedCount", 0);
                this.$set(this.processDefinitions[index], "humanTaskCount", 0);
                this.$set(this.processDefinitions[index], "isSelectedFrom", false);
                this.$set(this.processDefinitions[index], "isSelectedTo", false);
                this.$set(this.processDefinitions[index], "showModal", false);

                this.$set(this.processDefinitions[index], "deployTimeString", null);
                this.$set(this.processDefinitions[index], "deployTime", null);

                /*   this.$api()
          .get(
            "/history/process-instance/count?finished=true&&processDefinitionId=" +
            this.processDefinitions[index].id
          )
          .then(response => {
            this.processDefinitions[index].endedCount = response.data.count;
          });
 */
                index
                this.$api()
                    .get(
                        "/task/count?active=true&&processDefinitionId=" +
                        this.processDefinitions[index].id
                    )
                    .then(response => {
                        this.processDefinitions[index].humanTaskCount = response.data.count;
                    });

                this.$api()
                    .get("/deployment/" + this.processDefinitions[index].deploymentId)
                    .then(response => {
                        this.processDefinitions[
                            index
                        ].deployTimeString = this.convertDateToHumanStyle(
                            response.data.deploymentTime
                        );
                        this.processDefinitions[index].deployTime =
                            response.data.deploymentTime;
                    });
            }
        },
        /*
        TO DO 
        getIncidentsCountByActivity(item) {
          api
            .getEntity("incident", "", "processDefinitionId=" + item.id)
            .then(value => {
              this.arrayOfIncidents = value;
            });
        },
        */

        onClickCheck(item) {
            this.$nextTick(() => {
                if (item.isSelectedTo) {
                    this.processDefinitionTo = item.id;
                }
                if (item.isSelectedFrom) {
                    this.processDefinitionFrom = item.id;
                }
                if (item.isSelectedFrom && item.isSelectedTo) {
                    item.isSelectedTo = false;
                    this.processDefinitionTo = null;
                }
            });
        },

        generateMigrateAndRenew() {
            this.$notify({
                group: "foo",
                title: "Migration runned",
                type: "info"
            });

            this.generateValidation();
            setTimeout(() => {
                this.migrate();
            }, 2000);
            setTimeout(() => {
                this.updateCountForeach();
            }, 5000);
        },

        generateValidation() {
            this.$nextTick(() => {
                this.$api()
                    .post("/migration/generate", {
                        sourceProcessDefinitionId: this.processDefinitionFrom,
                        targetProcessDefinitionId: this.processDefinitionTo,
                        updateEventTriggers: this.updateEventTriggers
                    })
                    .then(response => {
                        this.processMigrationInstructions = response.data;
                    })
                    .catch();
            });
        },
        migrate() {
            this.$nextTick(() => {
                var objToMigrate = {
                    processInstanceQuery: this.processInstanceQuery,
                    migrationPlan: this.processMigrationInstructions,
                    skipCustomListeners: true
                };

                if (this.migrateAll == false) {
                    var instacesToMigrate = [];
                    if (this.tags.length > 0) {
                        this.tags.forEach(tag => {
                            instacesToMigrate.push(tag.text);
                        });
                        objToMigrate["processInstanceIds"] = instacesToMigrate;
                    }
                }

                this.$api()
                    .post("/migration/executeAsync", objToMigrate)
                    .then(response => {
                        if (response) {
                            this.$notify({
                                group: "foo",
                                title: "Migration sended to server",
                                text: "It work in async",
                                type: "success"
                            });
                        }
                    })
                    .catch(error => {
                        this.$notify({
                            group: "foo",
                            title: "Migration not accepted by server",
                            text: error,
                            type: "error"
                        });
                    });
            });
        },
        searchAndCount() {
            this.ready = false;
            this.searchProcessDefinitions();
            this.getDefinitionsCount();

        }
    },
    mounted: function () {
        this.searchAndCount();
    }
};
</script>

<style>
.ti-input {
    width: 450px;
}
</style>
