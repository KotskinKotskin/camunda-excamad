<template>
  <div class="container">
    <H2 v-if="!baseurl">Start with
      <router-link to="/settings">Camunda Endpoint URL</router-link>
    </H2>
    <b-card
      v-if="baseurl"
      overlay
      img-src="https://placekitten.com/1920/300"
      text-variant="white"
      title="No access ! Check:"
      border-variant="danger"
    >
      <li>CORS enabled.</li>
      <li>URL Camunda
        <b>REST EndPoint</b> is ok.
      </li>
      <li>You have network access to Camunda server.</li>
    </b-card>
  </div>
</template>

<script>
import store from "@/store/store";
export default {
  name: "noConnect",
  computed: {
    baseurl() {
      return this.$store.state.baseurl;
    }
  }
};
</script>
<style>
.card-img-overlay {
  background: #0000006e;
}
</style>

