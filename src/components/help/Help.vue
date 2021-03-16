<template>
  <div>
    <H1>FAQ and Manual</H1>
    <b-card no-body>
      <b-tabs pills card vertical>
        <b-tab title="1. FAQ" active>
          <md-viewer src="help/FAQ.md"></md-viewer>
        </b-tab>
        <b-tab title="2. Processes">
          <md-viewer src="help/Processes.md"></md-viewer>
        </b-tab>
        <b-tab title="3. Decisions">
          <md-viewer src="help/Decisions.md"></md-viewer>
        </b-tab>
        <b-tab title="4. Incidents">
          <md-viewer src="help/Incidents.md"></md-viewer>
        </b-tab>
        <b-tab title="5. Live">
          <md-viewer src="help/Live.md"></md-viewer>
        </b-tab>
        <b-tab title="6. Task list">
          <md-viewer src="help/Tasklist.md"></md-viewer>
        </b-tab>
        <b-tab title="7. Process instance">
          <md-viewer src="help/ProcessInstance.md"></md-viewer>
        </b-tab>

        <b-tab title="8. Process definition">
          <md-viewer src="help/ProcessDefinition.md"></md-viewer>
        </b-tab>
        <b-tab title="9. Others">Ignore other links and tabs.</b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import mdViewer from '@/components/help/md-viewer'
export default {
  name: "Help",
  components: {
    mdViewer,
  },
  data() {
    return {
      source: ":)"
    }
  }
}
</script>

<style>
</style>
