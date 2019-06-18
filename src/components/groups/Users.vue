<template>
  <div id="Users">
    <b-table hover :items="users" striped caption-top></b-table>
  </div>
</template>

<script>
export default {
  name: "Users",
  data() {
    return {
      users: []
    }
  },
  methods: {
    getUsers() {
      this.$api().get('/user').then(response => {
        this.users = response.data;
      })
    }
  },
  mounted() {
    this.getUsers();
  }
}
</script>

<style>
</style>
