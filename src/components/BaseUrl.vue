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
              
      </div>
      </form>    
       <div class="form-check">
    <input v-model="workOnBpmasservicePrivate" :click="setWorkOnBPMasSerivce(workOnBpmasservicePrivate)" type="checkbox" class="form-check-input" id="exampleCheck1">
    <label class="form-check-label" for="exampleCheck1">BPMaS</label> <br>
    <small> Current url {{bpmasserviceUrl}} </small> <br>
      </div>
     </div>
     <b-form v-if="workOnBpmasservicePrivate" inline>
       
      <label class="sr-only" for="inlineFormInputName2">Name</label>
      <b-input v-model="privateBpmasUrl" class="mb-2 mr-sm-2 mb-sm-0" id="inlineFormInputName2" placeholder="Jane Doe" />
      <label class="sr-only"  for="inlineFormInputGroupUsername2">Username</label>

      <b-button @click="setCustomBPMasUrl(privateBpmasUrl)" variant="primary">Save as BPMas URL</b-button>
    </b-form>
  </b-card>


       
       </div>
      
    </div>
</template>

<script>
import * as URLs from "@/config/camundasUrl";
import VueBootstrapTypeahead from "vue-bootstrap-typeahead";
export default {
  components: {
    VueBootstrapTypeahead
  },
  data() {
    return {
      workOnBpmasservicePrivate: false,
      list: [],
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
    if (localStorage.privateurl) {
      this.privateurl = localStorage.privateurl;
      this.setBaseUrl();
    }
    if (this.$route.query.baseurl) {
      this.privateurl = this.$route.query.baseurl;
      this.setBaseUrl();
    }
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
    privateurl(newPrivateurl) {
      localStorage.privateurl = newPrivateurl;
    }
  },
  computed: {
    baseurl() {
      return this.$store.state.baseurl;
    },
    bpmasserviceUrl() {
      return this.$store.state.bpmasserviceUrl;
    }
  },
  methods: {
    ///

    clear() {
      this.list = [];
      localStorage.urllist = "";
    },
    setWorkOnBPMasSerivce(workOnBpmasservicePrivate) {
      this.$store.commit("changeworkOnBpmasservice", workOnBpmasservicePrivate);
    },
    setCustomBPMasUrl(privateUrl) {
      this.$store.commit("setBpmasserviceUrl", this.privateBpmasUrl);
    },

    calculateVariant: function(item) {
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
      localStorage.urllist = JSON.stringify(this.list);
    },
    userSetBaserUrlFromBadge(item) {
      this.$notify({
        group: "foo",
        title: "URL setuped",
        text: this.privateurl,
        type: "success"
      });
      this.privateurl = item;
      this.privateurl = this.privateurl.replace(/\s+/g, "");
      this.setBaseUrl();
    },

    userSetBaseUrl() {
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

