<template>
  <div>
    <b-input-group>
      <b-form-input v-model="filter" placeholder="Type to Search"></b-form-input>
      <b-input-group-append>
        <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
      </b-input-group-append>
    </b-input-group>

    <br />
    <b-table
      v-on:row-dblclicked="userSetBaserUrlFromBadge"
      hover
      :fields="fields"
      :filter="filter"
      small
      :items="items"
    >
      <template slot="favorite" slot-scope="row">
        <b-button :pressed="row.value" size="sm" active variant="light" @click="setFavorite(row)">
          <font-awesome-icon icon="star" />
        </b-button>
      </template>
    </b-table>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faStar } from "@fortawesome/free-solid-svg-icons";
library.add(faStar);

import * as URLs from "@/config/camundasUrl";
export default {
  name: "Systems",
  data() {
    return {
      items: [],
      filter: "true",
      localStorageItems: [],
      fields: [
        { key: 'system', sortable: true },
        //  { key: 'environment', sortable: true },
        { key: 'favorite', sortable: true }

      ]
    }
  },
  created() {
    this.getFavoritesFromLocalStorage();
    if (this.localStorageItems.length == 0) {
      this.filter = null
    }
    this.getSystemsUrl();

  },
  methods: {
    getFavoritesFromLocalStorage() {
      if ("favorites" in localStorage && localStorage.favorites.length > 0) {
        this.localStorageItems = JSON.parse(localStorage.favorites);
      }
    },
    setFavorite(row) {

      this.items.find(o => o.system === row.item.system).favorite = !this.items.find(o => o.system === row.item.system).favorite;

      localStorage.favorites = JSON.stringify(this.items);
    },
    getSystemsUrl() {
      var URLItems = URLs.generatePossibleUrl();
      var array = [];
      URLItems.forEach(element => {
        var obj = {
          system: element,
          // environment: null,
          favorite: false
        }
        array.push(obj);
      })

      this.localStorageItems.forEach(element => {
        if (element.favorite == true) {

          array.find(o => o.system === element.system).favorite = true;
          //   array.push(element);
        }
      })

      this.items = array;
    },
    userSetBaserUrlFromBadge: function (item) {

      this.$notify({
        group: 'foo',
        title: 'Url setuped',
        text: item.system,
        type: 'success'
      })
      this.$store.commit('setBaseUrl', item.system)

    },
  }
}
</script>

<style>
</style>
