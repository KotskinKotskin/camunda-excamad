<template>
  <div>
    <div class="allNavbars">
      <div class="FirstNavBar">
        <b-navbar toggleable="md" type="light">
          <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

          <router-link to="/migration">
            <b-navbar-brand>TCE</b-navbar-brand>
          </router-link>

          <b-collapse is-nav id="nav_collapse">
            <b-navbar-nav>
              <b-nav-item-dropdown text="Processes">
                <b-dropdown-item to="/migration">Stats and migration</b-dropdown-item>
                <b-dropdown-item to="/history">History and search</b-dropdown-item>
                <b-dropdown-item to="/oldactivity">Old processes</b-dropdown-item>
                <b-dropdown-item to="/embedded">Embed and share</b-dropdown-item>
              </b-nav-item-dropdown>
              <b-nav-item-dropdown text="Decisions">
                <b-dropdown-item to="/decisiondefinitions">Stats and definitions</b-dropdown-item>
                <b-dropdown-item disabled to="/migration">History and search</b-dropdown-item>
              </b-nav-item-dropdown>

              <b-nav-item to="/incident">Incidents</b-nav-item>

              <b-nav-item to="/stream">Live</b-nav-item>

              <b-nav-item to="/tasklist">Task list</b-nav-item>
              <b-nav-item-dropdown text="BPMaS" right>
                <b-dropdown-item to="/bpmasservice/wtf">What is this</b-dropdown-item>
                <b-dropdown-item
                  :disabled="!workOnBpmAsSerivce"
                  to="/bpmasservice/newdiagram/StarterProcess"
                >New process</b-dropdown-item>
                <b-dropdown-item
                  :disabled="!workOnBpmAsSerivce"
                  to="/bpmasservice/deploytable"
                >My process</b-dropdown-item>
              </b-nav-item-dropdown>
              <b-nav-item-dropdown text="Misc" right>
                <b-dropdown-item to="/deploytable">Deployments</b-dropdown-item>
              </b-nav-item-dropdown>
            </b-navbar-nav>

            <!-- Right aligned nav items -->
            <b-navbar-nav class="ml-auto">
              <input
                class="mt-1 routerinput"
                size="sm"
                placeholder="search"
                type="text"
                v-model="query"
                v-smart-routes="routes"
                v-on:keyup.enter="routes[0].handler"
              >
              <ul class="ulrouter" v-if="routes.length">
                <b-list-group>
                  <b-list-group-item
                    @click="route.handler"
                    v-for="route in routes"
                    :key="route.name + Math.random()"
                    v-html="route.title"
                  ></b-list-group-item>
                </b-list-group>
              </ul>

              <b-nav-item to="/settings">Settings</b-nav-item>
              <b-nav-item-dropdown text="Systems" right>
                <b-dropdown-item-button
                  @click="userSetBaserUrlFromBadge(item.name)"
                  :key="item.name"
                  v-for="item in list"
                >
                  <b v-if="item.name == baseurl">></b>
                  <b-badge
                    pill
                    :variant="calculatePillColorForUrl(item.name)"
                  >{{calculateEnvormentForUrl(item.name)}}</b-badge>
                  {{substringUrl(item.name)}}
                </b-dropdown-item-button>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item-button @click="clear()">Clear</b-dropdown-item-button>
                <b-nav-form>
                  <b-button
                    v-show="secretButtonPressed"
                    :pressed.sync="expertCurrent"
                    size="sm"
                    @click="commitExpertMode"
                    variant="outline-info"
                  >Expert Mode</b-button>
                </b-nav-form>
                <input class="hide" v-on:keyup.45="setVisible">
              </b-nav-item-dropdown>
            </b-navbar-nav>

            <login></login>
          </b-collapse>
        </b-navbar>
      </div>
      <div class="secondNavBar">
        <b-nav size="sm">
          <small>
            <b-nav-text>
              <b-badge class="ml-3" pill :variant="pillColorStatus">{{pillColorStatus}}</b-badge>
            </b-nav-text>
          </small>
          <small>
            <b-nav-text>
              <b-badge class="ml-2" pill :variant="pillColor">{{envortment}}</b-badge>
            </b-nav-text>
          </small>
          <small>
            <b-nav-text v-if="baseurl !=''" class="ml-2">{{baseurl}}</b-nav-text>
          </small>
          
          <small></small>
        </b-nav>
      </div>
    </div>
  </div>
</template>

<script>
import {
  PRODSUBSTRING,
  TESTSUBSTRING,
  PREFIXURLINPATHTOREMOVE,
  POSTFIXURLINPATHTOREMOVE
} from "@/config/settings";
export default {
  components: {},
  data() {
    return {
      query: "",
      routes: [],
      list: [],
      productionAlert: "",
      testAlert: "",
      privateurl: "",
      status: "",
      substringForProduction: PRODSUBSTRING,
      substringForTest: TESTSUBSTRING,
      statusDate: "",
      envortment: "",
      expertCurrent: "",
      secretButtonPressed: false
    };
  },
  mounted() {
    this.healthcheck();
    this.getList();
    setTimeout(() => {
      this.healthcheck();
      this.checkEnvortment();
    }, 30);

    setInterval(
      function growUp() {
        this.healthcheck();
        this.checkEnvortment();
      }.bind(this),
      9000
    );
    if (localStorage.privateurl) {
      this.$store.commit("setBaseUrl", localStorage.privateurl);
    }

    if (localStorage.expertCurrent) {
      this.expertCurrent = localStorage.expertCurrent == "true";
    }
  },
  computed: {
    baseurl() {
      return this.$store.state.baseurl;
    },
    workOnBpmAsSerivce() {
      return this.$store.state.workOnBpmasservice;
    },
    pillColor() {
      if (this.envortment == "PRODUCTION") {
        return "warning";
      }
      if (this.envortment == "TEST") {
        return "info";
      }
      if (this.envortment != "TEST" && this.envortment != "PRODUCTION") {
        return "secondary";
      }
    },
    pillColorStatus() {
      if (this.serverStatus == true) {
        return "success";
      }
      if (this.serverStatus != true) {
        return "danger";
      }
    },
    envortmentFromStore() {
      return this.$store.state.envortment;
    },
    expertModeFromStore() {
      return this.$store.state.expertMode;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    },
    serverStatus() {
      return this.$store.state.serverStatus;
    }
  },
  watch: {
    expertCurrent(newExpertCurrent) {
      localStorage.expertCurrent = newExpertCurrent;
    },
    baseurl(newPrivateurl) {
      this.getList();
    }
  },
  methods: {
    calculatePillColorForUrl(name) {
      var testAlert = name.indexOf(this.substringForTest);
      var productionAlert = name.indexOf(this.substringForProduction);

      if (testAlert > 0 && productionAlert > 0) {
        return "info";
      }
      if (productionAlert > 0 && testAlert < 0) {
        return "warning";
      }
      if (productionAlert < 0 && testAlert < 0) {
        return "secondary";
      }
    },
    substringUrl(name) {
      return name
        .replace(PREFIXURLINPATHTOREMOVE, "")
        .replace(POSTFIXURLINPATHTOREMOVE, "");
    },

    calculateEnvormentForUrl(name) {
      var testAlert = name.indexOf(this.substringForTest);
      var productionAlert = name.indexOf(this.substringForProduction);
      if (testAlert > 0 && productionAlert > 0) {
        return "TEST";
      }
      if (productionAlert > 0 && testAlert < 0) {
        return "PRODUCTION";
      }
      if (productionAlert < 0 && testAlert < 0) {
        return "UNKNOWN";
      }
    },

    goFirstRoute() {
      if (this.routes) {
      }
    },
    healthcheck() {
      this.$api()
        .get("/engine")
        .then(response => {
          this.status = "UP";
          this.statusDate = Date();
          this.$store.commit("changeServerStatus", true); //
        })
        .catch(response => {
          this.status = "DOWN";
          this.statusDate = Date();
          this.$store.commit("changeServerStatus", false); //
        });
    },
    checkEnvortment() {
      this.testAlert = this.baseurl.indexOf(this.substringForTest);
      this.productionAlert = this.baseurl.indexOf(this.substringForProduction);
      if (this.testAlert > 0 && this.productionAlert > 0) {
        this.envortment = "TEST";
      }
      if (this.productionAlert > 0 && this.testAlert < 0) {
        this.envortment = "PRODUCTION";
      }
      if (this.productionAlert < 0 && this.testAlert < 0) {
        this.envortment = "UNKNOWN";
      }
      this.$store.commit("changeEnvortment", this.envortment); //
    },
    clear() {
      this.list = [];
      localStorage.urllist = "";
    },
    getList() {
      if (localStorage.urllist) {
        const arr = JSON.parse(localStorage.urllist);

        var result = arr.reduce((unique, o) => {
          if (!unique.some(obj => obj.name === o.name)) {
            unique.push(o);
          }
          return unique;
        }, []);
        this.list = result;
      }
    },
    userSetBaserUrlFromBadge(item) {
      this.$notify({
        group: "foo",
        title: "Url setuped",
        text: this.privateurl,
        type: "success"
      });
      this.$store.commit("setBaseUrl", item);
      this.checkEnvortment();
    },
    commitExpertMode() {
      this.$notify({
        group: "foo",
        title: "Expert mode on",
        text: "Right now " + this.expertCurrent,
        type: "info"
      });
      setTimeout(() => {
        this.$store.commit("changeExpertMode", this.expertCurrent);
      }, 100);
      //
    },
    setVisible() {
      this.secretButtonPressed = true;
    }
  }
};
</script>

<style>
.allNavbars {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 800;
  background-color: white;
  border-bottom: solid 2px #cecece;
}
,
.hide {
  border: solid 0px;
  height: 35px;
}
.secondNavBar {
  background: #f2f2f2;
}

.routerinput {
  font-size: 0.75rem;
  padding: 0.5rem;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid rgb(230, 230, 230);
  outline: none;
  box-sizing: border-box;
}

.ulrouter {
  margin-top: 40px;
  position: absolute;
  list-style: none;
  z-index: 500;
  padding: 0;
  background-color: rgb(250, 250, 250);
  width: 145px;
}
.lirouter {
  display: block;
  z-index: 500;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
.lirouter:hover {
  background-color: #eee;
}
</style>
