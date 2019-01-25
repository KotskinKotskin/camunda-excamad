import "@babel/polyfill";
import Vue from "vue";
import App from "./App.vue";
import router from "./router/router";
import store from "./store/store";
import api from "@/api/api";
import history from "@/components/History.vue";
import noConnect from "@/components/noConnect.vue";
import BaseUrl from "@/components/BaseUrl.vue";
import Diagram from "@/components/Diagram.vue";
import ActivityList from "@/components/ActivityList.vue";
import Login from "@/components/Login.vue";
import VariableModify from "@/components/VariableModify.vue";
import OldActivity from "@/components/OldActivity.vue";
import DetailDiagram from "@/components/detail-process-diagram/DetailDiagram.vue";
import DeployHelp from "@/components/bpmasservice/DeployHelp.vue";
import EmbeddedDiagram from "@/components/EmbeddedDiagram.vue";
import FormEditor from "@/components/bpmasservice/FormEditor.vue";
import Deploy from "@/components/bpmasservice/Deploy.vue";
import VariableList from "@/components/VariablesList.vue";
import JiraStat from "@/components/jira-integration/JiraStat.vue";
import DetailProcessStat from "@/components/detail-process-diagram/DetailProcessStat.vue";
import NewDiagram from "@/components/bpmasservice/NewDiagram.vue";
import PrepareCurrentStateAndDiagram from "@/components/PrepareCurrentStateAndDiagram.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import VueJsonPretty from "vue-json-pretty";
import DetailIncident from "@/components/detail-process-diagram/DetailIncident.vue";
import Notifications from "vue-notification";
import AuditReader from "@/components/detail-process-diagram/AuditReader.vue";
import DecisionGrid from "@/components/decisions/DecisionGrid.vue";
import Tasklist from "@/components/TaskList.vue";
import DefinitionMetadata from "@/components/detail-process-definition/DefinitionMetadata.vue";
import VueFormGenerator from "vue-form-generator";

import StartDefinition from "@/components/detail-process-definition/StartDefinition.vue";
Vue.component("start-definition", StartDefinition);

import TaskDetails from "@/components/TaskDetails.vue";
import VueClipboard from "vue-clipboard2";

import DefinitionDiagram from "@/components/detail-process-definition/DefinitionDiagram.vue";

import DefinitionRunTimeInstances from "@/components/detail-process-definition/DefinitionRunTimeInstances.vue";

import DeployTable from "@/components/bpmasservice/DeployTable.vue";
import VueGoogleCharts from "vue-google-charts";
import CommitFile from "@/components/bitbucket-integration/CommitFile.vue";
import vue2vis from "vue2vis";
import networkDigaram from "@/components/detail-process-diagram/NetworkDiagram.vue";
import fieldTCEDataPicker from "@/customFields/fieldTCEDataPicker.vue";
import fieldTCEJson from "@/customFields/fieldTCEJson.vue";
import WhatIsThis from "@/components/bpmasservice/WhatIsThis.vue";
import DecisionDetails from "@/components/decisions/DecisionDetails.vue";
import DecisionDiagram from "@/components/decisions/DecisionDiagram.vue";
import DecisionItem from "@/components/decisions/DecisionItem.vue";
import VueFriendlyIframe from "vue-friendly-iframe";
import vSuggest from "v-suggest";
import HistoryDetails from "@/components/detail-instance/HistoryDetails.vue";
import { ClientTable } from "vue-tables-2";
Vue.use(ClientTable);

import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.use(BootstrapVue);

import JsonEditor from "vue-json-edit";

Vue.use(JsonEditor);
Vue.use(vSuggest);
Vue.component("fieldTCEDataPicker", fieldTCEDataPicker);
Vue.component("fieldTCEJson", fieldTCEJson);

Vue.use(VueGoogleCharts);
var moment = require("moment");
moment().locale("ru");
var VueScrollTo = require("vue-scrollto");
Vue.use(VueScrollTo);
Vue.use(VueFormGenerator);
Vue.config.productionTip = false;
Vue.use(Notifications);
Vue.component("vue2vis", vue2vis);
Vue.component("definition-diagram", DefinitionDiagram);
Vue.component("deploy-table", DeployTable);
Vue.component("history-details", HistoryDetails);
Vue.component("decision-details", DecisionDetails);
Vue.component("definition-runtime-instances", DefinitionRunTimeInstances);
Vue.component("decision-diagram", DecisionDiagram);
Vue.component("decision-item", DecisionItem);
Vue.component("commit-file", CommitFile);
Vue.component("audit-reader", AuditReader);
Vue.component("vue-friendly-iframe", VueFriendlyIframe);
Vue.component("decision-grid", DecisionGrid);
Vue.component("what-is-this", WhatIsThis);
Vue.component("definition-metadata", DefinitionMetadata);
Vue.component("new-diagram", NewDiagram);
Vue.component("deploy-help", DeployHelp);
Vue.component("deploy", Deploy);
Vue.component("login", Login);
Vue.component("jira-stat", JiraStat);
Vue.component("tasklist", Tasklist);
Vue.component("task-details", TaskDetails);
Vue.component("base-url", BaseUrl);
Vue.component("variable-list", VariableList);
Vue.component("history", history);
Vue.component("detaildiagram", DetailDiagram);
Vue.component("embeddeddiagram", EmbeddedDiagram);
Vue.component("network-diagram", networkDigaram);
Vue.component("detailprocessstat", DetailProcessStat);
Vue.component("noConnect", noConnect);
Vue.component("currentstate", PrepareCurrentStateAndDiagram);
Vue.component("Diagram", Diagram);
Vue.component("form-editor", FormEditor);
Vue.component("oldactivity", OldActivity);
Vue.component("detail-incident", DetailIncident);
Vue.component("acitivity-list", ActivityList);
Vue.component("variables-modify", VariableModify);
Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.component("VueJsonPretty", VueJsonPretty);
Vue.use(VueClipboard);
Vue.prototype.$api = api;
Vue.prototype.$momenttrue = moment;

var vm = new Vue({
  router,
  api,
  store,
  render: h => h(App)
}).$mount("#app");

global.vm = vm;

export function apii() {
  return api;
}
