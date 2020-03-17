<template>
  <div id="groups">
    <b-table hover :items="groupsFromBackEnd" :fields="fields" striped caption-top>
      <template slot="show_details" slot-scope="row">
        <b-button
          variant="link"
          size="sm"
          @click="rowClick(row)"
          class="mr-2"
        >{{ row.detailsShowing ? 'Hide' : 'Show'}} users</b-button>
      </template>

      <template slot="row-details">
        <b-card>
          <li v-bind:key="item" v-for="item in singleTonUsers">
            <b>{{item.id}}</b>
            - {{item.email}}
          </li>
        </b-card>
      </template>
    </b-table>
  </div>
</template>

<script>
import * as GROUPS from "@/config/groupRoles";
export default {
  name: "Groups",
  data() {
    return {
      groupsFromBackEnd: [],
      singleTonUsers: [],
      fields: ["name",
        { key: "delete", label: "Delete" },
        { key: "show_details", label: "Show users" }]
    }
  },
  methods: {

    rowClick(row) {
      this.singleTonUsers = [];
      this.getMembers(row.item.id);
      row.item._showDetails = !row.item._showDetails;

    },
    createDefaultGroups() {
      GROUPS.defaultGroups.forEach(element => {
        var postObj = {
          id: element,
          name: element,
          type: "Organizational Unit"
        }
        this.$api().post('/group/create', postObj).then(response => {

        })
      });
    },
    getGroups() {
      this.groupsFromBackEnd = [];
      this.$api().get('/group').then(response => {
        this.groupsFromBackEnd = response.data;
        this.groupsFromBackEnd.forEach(element => {
          this.$set(element, "_showDetails", false);
        })
      })
    },
    getMembers(id) {
      this.$api().get('/user?memberOfGroup=' + id).then(response => {
        this.singleTonUsers = response.data;
      })
    }
  },
  mounted() {
    this.getGroups();
  }
}
</script>

<style>
</style>
