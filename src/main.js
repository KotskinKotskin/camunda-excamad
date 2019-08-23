import '@babel/polyfill';
import Vue from 'vue';
import App from './App.vue';
import router from './router/router';
import store from './store/store';
import api from '@/api/api';
import history from '@/components/History.vue';
import noConnect from '@/components/noConnect.vue';
import BaseUrl from '@/components/BaseUrl.vue';
import Diagram from '@/components/Diagram.vue';
import ActivityList from '@/components/ActivityList.vue';
import Login from '@/components/Login.vue';
import VariableModify from '@/components/VariableModify.vue';
import OldActivity from '@/components/OldActivity.vue';
import DetailDiagram from '@/components/detail-process-instance/DetailDiagram.vue';
import DeployHelp from '@/components/bpmasservice/DeployHelp.vue';
import EmbeddedDiagram from '@/components/EmbeddedDiagram.vue';
import FormEditor from '@/components/bpmasservice/FormEditor.vue';
import Deploy from '@/components/bpmasservice/Deploy.vue';
import VariableList from '@/components/VariablesList.vue';
import JiraStat from '@/components/jira-integration/JiraStat.vue';
import DetailProcessStat from '@/components/detail-process-instance/DetailProcessStat.vue';
import NewDiagram from '@/components/bpmasservice/NewDiagram.vue';
import PrepareCurrentStateAndDiagram from '@/components/detail-process-instance/PrepareCurrentStateAndDiagram.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueJsonPretty from 'vue-json-pretty';
import DetailIncident from '@/components/detail-process-instance/DetailIncident.vue';
import Notifications from 'vue-notification';
import AuditReader from '@/components/detail-process-instance/AuditReader.vue';
import DecisionGrid from '@/components/decisions/DecisionGrid.vue';
import Tasklist from '@/components/tasklist/TaskList.vue';
import DefinitionMetadata from '@/components/detail-process-definition/DefinitionMetadata.vue';
import DefinitionIncidents from '@/components/detail-process-definition/DefinitionIncidents.vue';

import VueFormGenerator from 'vue-form-generator';

import StartDefinition from '@/components/detail-process-definition/StartDefinition.vue';
Vue.component('start-definition', StartDefinition);

import TaskDetails from '@/components/tasklist/TaskDetails.vue';
import VueClipboard from 'vue-clipboard2';

import DefinitionHistoryInstances from '@/components/detail-process-definition/DefinitionHistoryInstances.vue';
Vue.component('definition-history-instances', DefinitionHistoryInstances);

import DefinitionDiagram from '@/components/detail-process-definition/DefinitionDiagram.vue';

import DefinitionRunTimeInstances from '@/components/detail-process-definition/DefinitionRunTimeInstances.vue';

import IncidentsHistory from '@/components/detail-process-instance/IncidentsHistory.vue';

Vue.component('incidents-history', IncidentsHistory);

import DetailJobs from '@/components/detail-process-instance/DetailJobs.vue';
Vue.component('detail-jobs', DetailJobs);

import ComplexMigration from '@/components/migration/ComplexMigration.vue';
Vue.component('complex-migration', ComplexMigration);

import VariableSingleEidt from '@/components/VariableSingleEdit.vue';
Vue.component('variable-single-edit', VariableSingleEidt);

import BatchTable from '@/components/batch/BatchTable.vue';
Vue.component('batch-table', BatchTable);

import Systems from '@/components/systems/Systems.vue';
Vue.component('systems', Systems);

import Search from '@/components/smart-search/Search.vue';
Vue.component('search', Search);

import DefinitionDetailView from '@/views/DefinitionDetailView.vue';
Vue.component('definition-detail', DefinitionDetailView);

import DeployTableBPMAS from '@/components/bpmasservice/DeployTable.vue';
import VueGoogleCharts from 'vue-google-charts';
import CommitFile from '@/components/bitbucket-integration/CommitFile.vue';
import vue2vis from 'vue2vis';
import networkDigaram from '@/components/detail-process-instance/NetworkDiagram.vue';
import fieldTCEDataPicker from '@/components/tasklist/customFields/fieldTCEDataPicker.vue';
import fieldTCEJson from '@/components/tasklist/customFields/fieldTCEJson.vue';
import fieldTCETable from '@/components/tasklist/customFields/fieldTCETable.vue';

import WhatIsThis from '@/components/bpmasservice/WhatIsThis.vue';
import DecisionDetails from '@/components/decisions/DecisionDetails.vue';
import DecisionDiagram from '@/components/decisions/DecisionDiagram.vue';
import DecisionItem from '@/components/decisions/DecisionItem.vue';
import VueFriendlyIframe from 'vue-friendly-iframe';
import vSuggest from 'v-suggest';
import HistoryDetails from '@/components/detail-process-instance/HistoryDetails.vue';
import { ClientTable } from 'vue-tables-2';
Vue.use(ClientTable);

import MoveToken from '@/components/detail-process-instance/MoveToken.vue';
Vue.component('move-token', MoveToken);

import { AtomSpinner } from 'epic-spinners';
Vue.component('atom-spinner', AtomSpinner);

import SendMessage from '@/components/detail-process-instance/SendMessage.vue';
Vue.component('send-message', SendMessage);

import DeployTable from '@/components/misc/DeployTable.vue';
Vue.component('deploy-table', DeployTable);

import Report from '@/components/misc/Report.vue';
Vue.component('report', Report);

import SelectedTask from '@/components/tasklist/SelectedTask.vue';
Vue.component('selectedTask', SelectedTask);

import StartDefinitions from '@/components/StartDefinitions.vue';
Vue.component('start-definitions', StartDefinitions);

import TheFooter from '@/components/footer/TheFooter.vue';
Vue.component('the-footer', TheFooter);

import Help from '@/components/help/Help.vue';
Vue.component('help', Help);

import Groups from '@/components/groups/Groups.vue';
Vue.component('groups', Groups);

import Users from '@/components/groups/Users.vue';
Vue.component('users', Users);

import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.use(BootstrapVue);

import JsonEditor from 'vue-json-edit';

Vue.use(JsonEditor);
Vue.use(vSuggest);
Vue.component('fieldTCEDataPicker', fieldTCEDataPicker);
Vue.component('fieldTCEJson', fieldTCEJson);
Vue.component('fieldTCETable', fieldTCETable);

Vue.use(VueGoogleCharts);
var moment = require('moment');
moment().locale('ru');
var VueScrollTo = require('vue-scrollto');
Vue.use(VueScrollTo);
Vue.use(require('vue-shortkey'));
Vue.use(VueFormGenerator);
Vue.config.productionTip = false;
Vue.use(Notifications);
Vue.component('vue2vis', vue2vis);
Vue.component('definition-diagram', DefinitionDiagram);
Vue.component('deploy-table-bpmas', DeployTableBPMAS);
Vue.component('history-details', HistoryDetails);
Vue.component('decision-details', DecisionDetails);
Vue.component('definition-runtime-instances', DefinitionRunTimeInstances);
Vue.component('decision-diagram', DecisionDiagram);
Vue.component('decision-item', DecisionItem);
Vue.component('commit-file', CommitFile);
Vue.component('audit-reader', AuditReader);
Vue.component('vue-friendly-iframe', VueFriendlyIframe);
Vue.component('decision-grid', DecisionGrid);
Vue.component('what-is-this', WhatIsThis);
Vue.component('definition-metadata', DefinitionMetadata);
Vue.component('definition-incidents', DefinitionIncidents);
Vue.component('new-diagram', NewDiagram);
Vue.component('deploy-help', DeployHelp);
Vue.component('deploy', Deploy);
Vue.component('login', Login);
Vue.component('jira-stat', JiraStat);
Vue.component('tasklist', Tasklist);
Vue.component('task-details', TaskDetails);
Vue.component('base-url', BaseUrl);
Vue.component('variable-list', VariableList);
Vue.component('history', history);
Vue.component('detaildiagram', DetailDiagram);
Vue.component('embeddeddiagram', EmbeddedDiagram);
Vue.component('network-diagram', networkDigaram);
Vue.component('detailprocessstat', DetailProcessStat);
Vue.component('noConnect', noConnect);
Vue.component('currentstate', PrepareCurrentStateAndDiagram);
Vue.component('Diagram', Diagram);
Vue.component('form-editor', FormEditor);
Vue.component('oldactivity', OldActivity);
Vue.component('detail-incident', DetailIncident);
Vue.component('acitivity-list', ActivityList);
Vue.component('variables-modify', VariableModify);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('VueJsonPretty', VueJsonPretty);
Vue.use(VueClipboard);
Vue.prototype.$api = api;
Vue.prototype.$momenttrue = moment;

var vm = new Vue({
  router,
  api,
  store,
  render: h => h(App)
}).$mount('#app');

global.vm = vm;

export function apii() {
  return api;
}
