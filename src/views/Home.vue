<template>
  <div class="container">
    <div class="mt-5 mb-5">
      <noConnect v-if="serverStatus != true"></noConnect>
    </div>

    <b-card-group columns>
      <b-card
        title="Migration"
        img-src="https://placekitten.com/700/400"
        img-top
        style="max-width: 20rem;"
        class="mb-2"
      >
        <p class="card-text">Migrate process instance version.</p>
        <router-link to="/migration">
          <b-button variant="outline-primary">Go to migration</b-button>
        </router-link>
      </b-card>
      <b-card
        title="Incidents"
        img-src="http://placekitten.com/g/650/400"
        img-top
        style="max-width: 20rem;"
        class="mb-2"
      >
        <p class="card-text">Fix all incidents in one click.</p>
        <router-link to="/incident">
          <b-button variant="outline-info">Go to incidents</b-button>
        </router-link>
      </b-card>
      <b-card
        title="Instance history and token management"
        img-src="http://placekitten.com/g/700/350"
        img-top
        style="max-width: 20rem;"
        class="mb-2"
      >
        <p class="card-text">Query history and manage tokens on active instances.</p>
        <router-link to="/history">
          <b-button variant="outline-success">Go to processes</b-button>
        </router-link>
      </b-card>

      <b-card
        title="Live"
        img-src="http://placekitten.com/g/500/400"
        img-top
        style="max-width: 20rem;"
        class="mb-2"
      >
        <p class="card-text">Watch what's happening in the system right now.</p>
        <router-link to="/stream">
          <b-button variant="outline-success">Watch</b-button>
        </router-link>
      </b-card>
      <b-card
        title="Old active processes"
        img-src="http://placekitten.com/g/700/300"
        img-top
        style="max-width: 20rem;"
        class="mb-2"
      >
        <p class="card-text">Check old active processes</p>
        <router-link to="/oldactivity">
          <b-button variant="outline-danger">Check</b-button>
        </router-link>
      </b-card>
      <b-card
        title="Process definitions in BPMN"
        img-src="http://placekitten.com/g/600/400"
        img-top
        style="max-width: 20rem;"
        class="mb-2"
      >
        <p class="card-text">Look at the diagrams from the system in the browser</p>
        <router-link to="/embedded">
          <b-button variant="outline-secondary">Look</b-button>
        </router-link>
      </b-card>
    </b-card-group>
  </div>
</template>

<script>
// @ is an alias to /src
import store from "@/store/store";

export default {
  name: "incidentView",
  components: {},
  computed: {
    serverStatus() {
      return store.state.serverStatus;
    }
  }
};
</script>

