</<template>
<div class="jumbotron-fluid">
   <div class="container">
     <div class="row">

   <div class="col-11">
   </div>
   </div>

        <b-card>
      <div id="root">


      <form>
      <div class="form-group">
          <label for="exampleInputEmail1"></label>URL Camunda Engine REST </label>
            <br>
             
               <b-form-checkbox id="checkbox1"
                     v-model="workOnBpmasservicePrivate" :click="setWorkOnBPMasSerivce(workOnBpmasservicePrivate)">
      BPMaS
    </b-form-checkbox>

          <div class="row">
            <div class="col-10">
          <div class="input-group mb-3">
<vue-bootstrap-typeahead style="width: 500px"
v-on:keyup.enter="userSetBaseUrl()" 
  v-model="privateurl"
  @hit="userSetBaseUrl()"
  :data="possibleUrl"
/>


          <div class="input-group-append">
            
          <button type="button" class="btn btn-primary" @click="userSetBaseUrl()">Save</button>

          
           </div>
            </div>
               <b-badge v-if="list.length >1" :variant="calculateVariant(item.name)" class="mr-2 mt-0" href="#" @click="userSetBaserUrlFromBadge(item.name)" pill v-for="item in list">{{item.name}}</b-badge>

            </div>
            
             </div>
              <small> <b-link href="#" @click="clear">Clear</b-link> </small>
              <b-form-group label="My role">
      <b-form-radio-group stacked  id="radios1" v-model="role" :options="roleOptions" name="radioOptions" />
    </b-form-group>
      </div>
      
      </form>    
       <div class="form-check">
  
      </div>
     </div>
  </b-card>


       
       </div>
      
    </div>
</template>

<script>
import * as URLs from "@/config/camundasUrl";
import {
  AUTH_REQUEST,
  AUTH_LOGOUT,
  AUTH_CAMUNDA_REQUEST
} from "@/store/actions/auth";
import * as access from "@/store/modules/accessSetings";
import VueBootstrapTypeahead from "vue-bootstrap-typeahead";

export default {
  name: "BaseURL",
  components: {
    VueBootstrapTypeahead
  },
  data() {
    return {
      workOnBpmasservicePrivate: false,
      list: [],
      role: "",
      privateurl: "",
      privateBpmasUrl: "",
      candidateToSuggest: "",
      productionAlert: "",
      testAlert: "",
      envortment: "",
      status: "",
      statusTime: "",
      downTime: "",
      upTime: "",
      visible: true,
      substringForProduction: "bpm-cloud",
      substringForTest: "test",
      possibleUrl: []
    };
  },

  mounted() {
    this.possibleUrl = URLs.generatePossibleUrl();
    this.checkEnvortment();
    this.healthcheck();

    setInterval(
      function growUp() {
        this.healthcheck();
      }.bind(this),
      5000
    );
  },
  watch: {
    role(newValue, oldValue) {
      this.$store.commit("setRole", newValue);
    }
  },
  computed: {
    baseurl() {
      return this.$store.state.baseurl;
    },
    roleOptions() {
      return access.roles;
    },
    bpmasserviceUrl() {
      return this.$store.state.bpmasserviceUrl;
    }
  },
  methods: {
    ///

    clear() {
      this.list = [];
      access.CheckPermission("Migration view");
    },
    setWorkOnBPMasSerivce(workOnBpmasservicePrivate) {
      this.$store.commit("changeworkOnBpmasservice", workOnBpmasservicePrivate);
    },
    setCustomBPMasUrl(privateUrl) {
      this.privateurl = this.privateBpmasUrl;
      this.$store.commit("setBpmasserviceUrl", this.privateBpmasUrl);
    },

    calculateVariant: function (item) {
      if (
        item.indexOf(this.substringForTest) > 0 &&
        item.indexOf(this.substringForProduction) > 0
      ) {
        return "info";
      }
      if (
        item.indexOf(this.substringForTest) < 0 &&
        item.indexOf(this.substringForProduction) > 0
      ) {
        return "warning";
      }
      if (
        item.indexOf(this.substringForTest) < 0 &&
        item.indexOf(this.substringForProduction) < 0
      ) {
        return "secondary";
      }
    },

    addToSuggest() {
      var obj = {};
      obj["name"] = this.privateurl;
      this.list.push(obj);
      const arr = this.list;
      var result = arr.reduce((unique, o) => {
        if (!unique.some(obj => obj.name === o.name)) {
          unique.push(o);
        }
        return unique;
      }, []);
      this.list = result;
    },
    userSetBaserUrlFromBadge(item) {
      if (this.workOnBpmasservicePrivate == true) {
        this.privateBpmasUrl = item;
        if (localStorage.usertoken != null) {
          var usertokenstring = atob(localStorage.usertoken).split(":");

          var userName = usertokenstring[0];
          var password = usertokenstring[1];
          this.$store
            .dispatch(AUTH_REQUEST, { userName, password })
            .then(() => { });
          this.$store
            .dispatch(AUTH_CAMUNDA_REQUEST, { userName, password })
            .then(() => { });
        }
        this.setCustomBPMasUrl(this.privateurl);

        this.$notify({
          group: "foo",
          title: " BPMaS URL setuped",
          text: item,
          type: "success"
        });
      } else {
        this.$notify({
          group: "foo",
          title: "URL setuped",
          text: this.privateurl,
          type: "success"
        });
        this.privateurl = item;
        this.privateurl = this.privateurl.replace(/\s+/g, "");
        this.setBaseUrl();
      }
    },

    userSetBaseUrl() {




      if (this.workOnBpmasservicePrivate == true) {

        this.privateBpmasUrl = this.privateurl;
        this.setCustomBPMasUrl(this.privateurl);

        this.$notify({
          group: "foo",
          title: "BPMaS URL",
          text: this.privateurl,
          type: "success"
        });
      } else {
        this.$notify({
          group: "foo",
          title: "URL setuped",
          text: this.privateurl,
          type: "success"
        });
        this.privateurl = this.privateurl.replace(/\s+/g, "");
        var lastsimbol = this.privateurl[this.privateurl.length - 1];
        if (lastsimbol != "/") {
          this.privateurl = this.privateurl + "/";
        }
        this.setBaseUrl();
        this.addToSuggest();
        localStorage.lastUrl = this.privateurl;
      }

      if (localStorage.usertoken != null) {
        var usertokenstring = atob(localStorage.usertoken).split(":");

        var userName = usertokenstring[0];
        var password = usertokenstring[1];
        this.$store
          .dispatch(AUTH_REQUEST, { userName, password })
          .then(() => { });
        this.$store
          .dispatch(AUTH_CAMUNDA_REQUEST, { userName, password })
          .then(() => { });
      }
    },
    setBaseUrl() {
      this.$store.commit("setBaseUrl", this.privateurl);
      this.checkEnvortment();
      setTimeout(() => {
        this.healthcheck();
      }, 100);
    },
    healthcheck() {
      this.$api()
        .get("/engine")
        .then(() => {
          this.status = "UP";
          this.statusDate = Date();
          this.$store.commit("changeServerStatus", true); //
        })
        .catch(() => {
          this.status = "DOWN";
          this.statusDate = Date();
          this.$store.commit("changeServerStatus", false); //
        });
    },
    checkEnvortment() {
      this.testAlert = this.privateurl.indexOf(this.substringForTest);
      this.productionAlert = this.privateurl.indexOf(
        this.substringForProduction
      );
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
    }
  }
};
</script>
<style>
.jumbotron {
  min-height: 110px;
}
</style>

