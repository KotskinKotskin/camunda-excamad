<template>
  <div id="sendMessage">
    <h3>Send message</h3>
    <b-card id="historyDetails" bg-variant="light" text-variant="dark">
      <b-form inline>
        <b-form-select
          v-model="selectedMessage"
          :options="messageList"
          class="mb-2 mr-sm-2 mb-sm-0"
        />
        <b-button @click="sendMessage" variant="outline-danger">Send</b-button>
        <br>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import BpmnModdle from "bpmn-moddle";
import camundaModdle from "camunda-bpmn-moddle/resources/camunda";

export default {
  name: "SendMessage",
  props: ["processInstanceId", "processDefinitionId"],
  data() {
    return {
      definitionInXml: "",
      selectedMessage: "",
      messageList: []
    };
  },
  computed: {
    profile() {
      return this.$store.getters.getProfile;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  mounted() {
    setTimeout(() => {
      this.getMessageList();
    }, 300);
  },
  methods: {
    getMessageList() {
      this.$api()
        .get("/process-definition/" + this.processDefinitionId + "/xml")
        .then(response => {
          this.definitionInXml = response.data.bpmn20Xml;
          this.readModel();
        });
    },
    readModel() {
      var moddle = new BpmnModdle({ camunda: camundaModdle });
      var vm = this;
      vm.activityList = [];
      this.moddle = moddle.fromXML(this.definitionInXml, function(
        err,
        definitions
      ) {
        definitions.rootElements.forEach(element => {
          if (element.$type == "bpmn:Process" && element.isExecutable == true) {
            element.flowElements.forEach(flowelement => {
              if (
                flowelement.$type &&
                flowelement.messageRef &&
                flowelement.messageRef.name
              ) {
                vm.messageList.push(flowelement.messageRef.name);
              }
            });
          }
        });
      });
    },
    sendMessage() {
      var sendObj = {
        messageName: this.selectedMessage,
        processInstanceId: this.processInstanceId,
        resultEnabled: true
      };
      this.$api()
        .post("/message", sendObj)
        .then(response => {
          this.$notify({
            group: "foo",
            title: "Sended!",
            text: "Message" + this.selectedMessage + " sended" + response.data,
            type: "success"
          });
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Not sended!",
            text: error,
            type: "error"
          });
        });
    }
  }
};
</script>

<style>
</style>
