/* eslint-disable no-unused-vars */
import Vue from 'vue';
import Router from 'vue-router';
import MigrationView from '@/views/MigrationView.vue';
import IncidentView from '@/views/IncidentView.vue';
import HistoryView from '@/views/HistoryView.vue';
import StreamView from '@/views/StreamView.vue';
import DetailProcessView from '@/views/DetailProcessView.vue';
import DetailDiagramView from '@/views/DetailDiagramView.vue';
import EmbeddedDiagramView from '@/views/EmbeddedDiagramView.vue';
import OldActivityView from '@/views/OldActivityView.vue';
import TaskListView from '@/views/TaskListView.vue';
import NewDiagramView from '@/views/NewDiagramView.vue';
import Baseurl from '@/components/BaseUrl.vue';
import DicisionDiagram from '@/components/decisions/DecisionDiagram.vue';
import LoginView from '@/views/LoginView.vue';
import DefinitionDetailView from '@/views/DefinitionDetailView.vue';
import DeployView from '@/views/DeployView.vue';
import DeployTableBPMaSView from '@/views/DeployTableBPMaSView.vue';
import DeployHelpView from '@/views/DeployHelpView.vue';
import WhatIsThisView from '@/views/WhatIsThisView.vue';
import DecisionDefinitionsView from '@/views/DecisionDefinitionsView.vue';
import Home from '@/views/Home.vue';
import store from '@/store/store';
import VueSmartRoute from 'vue-smart-route';
import DeployTableView from '@/views/DeployTableView.vue';
import HelpView from '@/views/HelpView.vue';
import ReportView from '@/views/ReportView.vue';
import SelectedTaskView from '@/views/SelectedTaskView.vue';
import BatchView from '@/views/BatchView.vue';
import StartDefinitionView from '@/views/StartDefinitionView.vue';
import ComplexMigrationView from '@/views/ComplexMigrationView.vue';
import GroupsView from '@/views/GroupsView.vue';
import UsersView from '@/views/UsersView.vue';
import SystemsView from '@/views/SystemsView.vue';

import VariableBatchModifyView from '@/views/VariableBatchModifyView.vue';

Vue.use(Router);
Vue.use(VueSmartRoute);

const ifNotAuthenticated = (to, from, next) => {
  if (!store.getters.isAuthenticated) {
    next();
    return;
  }
  next('/');
};

const ifAuthenticated = (to, from, next) => {
  if (store.getters.isAuthenticated) {
    next();
    return;
  }
  next('/login');
};

function hasQueryParams(route) {
  if (route.query.baseurl) {
    return true;
  } else return false;
}

const router = new Router({
  //mode: "history",
  routes: [
    {
      path: '/tasklist',
      name: 'tasklist',
      component: TaskListView
    },
    {
      path: '/variablebatch',
      name: 'variablebatch',
      component: VariableBatchModifyView
    },
    
    {
      path: '/migration',
      name: 'migration',
      component: MigrationView,
      smart: {
        matcher: {
          search: [/mig/],
          title: () => 'Migration'
        }
      }
    },
    {
      path: '/decisiondefinitions',
      name: 'decisiondefinitions',
      component: DecisionDefinitionsView,
      smart: {
        matcher: {
          search: [/dec/],
          title: () => 'Decisions'
        }
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: ifNotAuthenticated,
      smart: {
        matcher: {
          search: [/log/],
          title: () => 'Login'
        }
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Baseurl,
      smart: {
        matcher: {
          search: [/(set)/],
          title: () => 'Settings'
        }
      }
    },
    {
      path: '/bpmasservice/newdiagram/:diagramKey',
      name: 'newdiagram',
      props: true,
      component: NewDiagramView,
      beforeEnter: ifAuthenticated
    },

    {
      path: '/bpmasservice/wtf',
      name: 'whatisthis',
      component: WhatIsThisView
    },
    {
      path: '/bpmasservice/deploy/',
      name: 'newdiagram',
      component: DeployView,
      beforeEnter: ifAuthenticated
    },
    {
      path: '/bpmasservice/deployhelp/:diagramId',
      name: 'deployhelp',
      props: true,
      component: DeployHelpView,
      beforeEnter: ifAuthenticated
    },
    {
      path: '/bpmasservice/deploytable/',
      name: 'deploytable',
      component: DeployTableBPMaSView,
      beforeEnter: ifAuthenticated
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
      smart: {
        matcher: {
          search: [/his/],
          title: () => 'History'
        }
      }
    },
    {
      path: '',
      name: 'home',
      component: Home
    },
    {
      path: '/incident',
      name: 'incident',
      component: IncidentView,
      smart: {
        matcher: {
          search: [/inc/],
          title: () => 'Incidents'
        }
      }
    },
    {
      path: '/stream',
      name: 'stream',
      component: StreamView
    },
    {
      path: '/help',
      name: 'help',
      component: HelpView
    },
    {
      path: '/oldactivity',
      name: 'oldactivity',
      component: OldActivityView
    },
    {
      path: '/embedded',
      name: 'embedded',
      component: EmbeddedDiagramView
    },
    {
      path: '/batch',
      name: 'batch',
      component: BatchView
    },
    {
      path: '/ComplexMigration',
      name: 'ComplexMigration',
      component: ComplexMigrationView
    },
    {
      path: '/processdetail/:processInstanceId',
      name: 'processdetail',
      props: true,
      component: DetailProcessView
    },
    {
      path: '/decisiondiagram/:decisionId',
      name: 'decisiondiagram',
      props: true,
      component: DicisionDiagram
    },

    {
      path: '/diagram/:diagramKey',
      name: 'diagram',
      props: true,
      component: DetailDiagramView
    },
    {
      path: '/definition/:definitionId',
      name: 'definition',
      props: true,
      component: DefinitionDetailView
    },
    {
      path: '/task/:taskId',
      name: 'task',
      props: true,
      component: SelectedTaskView
    },
    {
      path: '/deploytable/',
      name: 'deploytable',
      component: DeployTableView
    },
    {
      path: '/report/',
      name: 'report',
      component: ReportView
    },
    {
      path: '/startdefinition/',
      name: 'startdefinition',
      component: StartDefinitionView
    },
    {
      path: '/systems/',
      name: 'systems',
      component: SystemsView
    },
    {
      path: '/groups',
      name: 'groups',
      component: GroupsView,
      beforeEnter: ifAuthenticated
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      beforeEnter: ifAuthenticated
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (!hasQueryParams(to) && hasQueryParams(from)) {
    console.log(to);
    console.log(from);
    next({ name: to.name, query: from.query, params: to.params });
  } else {
    next();
  }
});

export default router;
