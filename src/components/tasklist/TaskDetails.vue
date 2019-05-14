<template>
  <div id="TaskDetails" v-if="taskId != null">
    <p class="text-right">
      <b-button-group v-show="!fieldsOk" size="sm">
        <b-button @click="generateAndUpdate" :disabled="fieldsOk" variant="outline-success">
          <font-awesome-icon icon="check"/>Done
        </b-button>
      </b-button-group>
    </p>
    <b-card v-if="ready" bg-variant="light" text-variant="dark">
      <form>
        <vue-form-generator :schema="schema" :model="model" :options="formOptions"></vue-form-generator>
      </form>
    </b-card>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import { faChild } from "@fortawesome/free-solid-svg-icons";
import { faSync } from "@fortawesome/free-solid-svg-icons";

import * as api from "@/api/api";
library.add(faCheck, faChild, faSync);

export default {
  name: "taskDetails",
  data() {
    return {
      generatedForm: "",
      variables: {},
      formVariables: "",
      model: {},
      formProps: [],
      fieldsOk: false,
      ready: false,
      schema: {},
      fields: [],
      formOptions: {
        validateAfterLoad: true,
        validateAfterChanged: true
      }
    };
  },
  computed: {
    taskId() {
      return this.$store.state.taskId;
    }
  },
  mounted() {
    this.fieldsOk = false;
    this.ready = false;


    this.getTaskProps().then(() => {
      this.getFormVariables().then(() => {
        this.addPropsToSchema()
      });
    }).catch(() => {

      this.getFormVariables().then(() => {
        this.generateDefaultForm();
      });

    });


  },
  methods: {
    isJson(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    },
    getTaskProps() {
      var vm = this;
      return new Promise(function (resolve, reject) {
        api
          .getEntity("taskfields/" + vm.taskId, null, null)
          .then(value => {

            if (value != null && value != "" && value.length > 0) {
              vm.formProps = value;
              vm.fieldsOk = true;
              resolve();
            }
            else if (value == null || value.length == 0 || value == "") {
              reject();
            }

          })
          .catch(() => {
            reject();
            vm.fieldsOk = false;
          });

      });
    },
    getFormVariables() {

      var vm = this;
      return new Promise(function (resolve, reject) {
        api
          .getEntity("task/" + vm.taskId, "form-variables", null)
          .then(value => {
            vm.formVariables = value;
            for (var key in value) {
              if (value[key].type != "Object") {
                var obj = {};
                obj["model"] = key;

                var testobj = vm.formProps.find(x => x.id === key);
                if (testobj) {
                  if (vm.isJson(value[key].value)) {
                    vm.$set(vm.model, key, JSON.parse(value[key].value));
                  } else vm.$set(vm.model, key, value[key].value);



                  vm.fields.push(obj);
                }
              }

            }
            vm.$set(vm.schema, "fields", vm.fields);
            resolve();
          }).catch(error => { reject(error) });
      });
    },
    addPropsToSchema() {
      this.ready = false;

      var vm = this;
      return new Promise(function (resolve) {
        if (vm.fieldsOk == true) {
          for (var index = 0; index < vm.formProps.length; index++) {


            const props = vm.formProps[index];
            var result = vm.schema.fields.find(obj => {
              return obj.model === props.id;
            });

            const field = result;

            for (var property in props.properties) {
              field["label"] = props.label;
              field["default"] = props.defaultValue;
              if (
                props.properties[property] == "true" ||
                props.properties[property] == "false"
              ) {
                field[property] = props.properties[property] === "true";
              } else {
                field[property] = props.properties[property];
              }
            }
            if (props.type.name == "enum" && props.type.values) {
              var arrayOfvalues = [];
              for (var key in props.type.values) {
                var obj = {};
                obj["value"] = key;
                obj["name"] = props.type.values[key];
                arrayOfvalues.push(obj);
              }
              field["values"] = arrayOfvalues;
            }


            if (Object.entries(props.properties).length === 0 && props.properties.constructor === Object) {
              vm.$notify({
                group: "foo",
                title: "Problem with generate form",
                text: "No properties in field description " + props.id,
                type: "error"
              });

            }
          }


          var button = {};
          button["type"] = "submit";
          button["buttonText"] = "Done";
          button["validateBeforeSubmit"] = true;
          button["onSubmit"] = vm.generateAndUpdate;

          vm.fields.push(button);
        }

        if (vm.fieldsOk == false) {
          vm.fields.forEach(element => {
            element["label"] = element.model;
            element["readonly"] = true;
            element["type"] = "input";
            element["inputType"] = "text";
            element["disabled"] = true;
          });
        }

        vm.ready = true;
        resolve();
      });
    },
    generateAndUpdate() {
      this.generateVariables();
      this.updateSimpleVariables();
      this.$store.commit("changeTaskId", null);
    },
    updateSimpleVariables() {
      console.log(this.variables);
      this.$api()
        .post("task/" + this.taskId + "/submit-form", {
          variables: this.variables
        })

    },
    generateVariables() {
      this.variables = {};
      if (this.fieldsOk == true) {
        for (var key in this.model) {



          var localvalue = Array.isArray(this.model[key]) ? JSON.stringify(this.model[key]) : this.model[key];

          var localtype = this.formVariables[key].type;


          var date = this.$momenttrue(localvalue);
          if (date._isValid) {
            localvalue = this.$momenttrue(localvalue).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
            localvalue = localvalue.substring(0, localvalue.length - 4) + "030";
            localtype = "date";
          }



          var obj = {};
          this.variables[key] = {
            value: localvalue,
            type: localtype
          };


        }

      }
    },
    generateDefaultForm() {
      this.ready = false;
      for (var key in this.formVariables) {

        if (this.formVariables[key].type != "Object") {
          this.model[key] = this.formVariables[key].value;
        }
        if (this.formVariables[key].type == "Object") {
          this.model[key] = JSON.stringify(this.formVariables[key].value);
        }
      }

      for (var keyModel in this.model) {
        var defaultField = {
          readonly: true,
          label: keyModel,
          model: keyModel,
          type: "input",
          inputType: "text"
        };
        this.schema.fields.push(defaultField);
      }
      this.ready = true;



    }


  }}

</script>

<style>
@charset "UTF-8";

/*!
 * Pikaday
 * Copyright © 2014 David Bushell | BSD & MIT license | https://dbushell.com/
 */

.pika-single {
  z-index: 9999;
  display: block;
  position: relative;
  color: #333;
  background: #fff;
  border: 1px solid #ccc;
  border-bottom-color: #bbb;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

/*
clear child float (pika-lendar), using the famous micro clearfix hack
http://nicolasgallagher.com/micro-clearfix-hack/
*/
.pika-single:before,
.pika-single:after {
  content: " ";
  display: table;
}
.pika-single:after {
  clear: both;
}
.pika-single {
  *zoom: 1;
}

.pika-single.is-hidden {
  display: none;
}

.pika-single.is-bound {
  position: absolute;
  box-shadow: 0 5px 15px -5px rgba(0, 0, 0, 0.5);
}

.pika-lendar {
  float: left;
  width: 240px;
  margin: 8px;
}

.pika-title {
  position: relative;
  text-align: center;
}

.pika-label {
  display: inline-block;
  *display: inline;
  position: relative;
  z-index: 9999;
  overflow: hidden;
  margin: 0;
  padding: 5px 3px;
  font-size: 14px;
  line-height: 20px;
  font-weight: bold;
  background-color: #fff;
}
.pika-title select {
  cursor: pointer;
  position: absolute;
  z-index: 9998;
  margin: 0;
  left: 0;
  top: 5px;
  filter: alpha(opacity=0);
  opacity: 0;
}

.pika-prev,
.pika-next {
  display: block;
  cursor: pointer;
  position: relative;
  outline: none;
  border: 0;
  padding: 0;
  width: 20px;
  height: 30px;
  /* hide text using text-indent trick, using width value (it's enough) */
  text-indent: 20px;
  white-space: nowrap;
  overflow: hidden;
  background-color: transparent;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 75% 75%;
  opacity: 0.5;
  *position: absolute;
  *top: 0;
}

.pika-prev:hover,
.pika-next:hover {
  opacity: 1;
}

.pika-prev,
.is-rtl .pika-next {
  float: left;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAeCAYAAAAsEj5rAAAAUklEQVR42u3VMQoAIBADQf8Pgj+OD9hG2CtONJB2ymQkKe0HbwAP0xucDiQWARITIDEBEnMgMQ8S8+AqBIl6kKgHiXqQqAeJepBo/z38J/U0uAHlaBkBl9I4GwAAAABJRU5ErkJggg==");
  *left: 0;
}

.pika-next,
.is-rtl .pika-prev {
  float: right;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAeCAYAAAAsEj5rAAAAU0lEQVR42u3VOwoAMAgE0dwfAnNjU26bYkBCFGwfiL9VVWoO+BJ4Gf3gtsEKKoFBNTCoCAYVwaAiGNQGMUHMkjGbgjk2mIONuXo0nC8XnCf1JXgArVIZAQh5TKYAAAAASUVORK5CYII=");
  *right: 0;
}

.pika-prev.is-disabled,
.pika-next.is-disabled {
  cursor: default;
  opacity: 0.2;
}

.pika-select {
  display: inline-block;
  *display: inline;
}

.pika-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  border: 0;
}

.pika-table th,
.pika-table td {
  width: 14.285714285714286%;
  padding: 0;
}

.pika-table th {
  color: #999;
  font-size: 12px;
  line-height: 25px;
  font-weight: bold;
  text-align: center;
}

.pika-button {
  cursor: pointer;
  display: block;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  outline: none;
  border: 0;
  margin: 0;
  width: 100%;
  padding: 5px;
  color: #666;
  font-size: 12px;
  line-height: 15px;
  text-align: right;
  background: #f5f5f5;
}

.pika-week {
  font-size: 11px;
  color: #999;
}

.is-today .pika-button {
  color: #33aaff;
  font-weight: bold;
}

.is-selected .pika-button,
.has-event .pika-button {
  color: #fff;
  font-weight: bold;
  background: #33aaff;
  box-shadow: inset 0 1px 3px #178fe5;
  border-radius: 3px;
}

.has-event .pika-button {
  background: #005da9;
  box-shadow: inset 0 1px 3px #0076c9;
}

.is-disabled .pika-button,
.is-inrange .pika-button {
  background: #d5e9f7;
}

.is-startrange .pika-button {
  color: #fff;
  background: #6cb31d;
  box-shadow: none;
  border-radius: 3px;
}

.is-endrange .pika-button {
  color: #fff;
  background: #33aaff;
  box-shadow: none;
  border-radius: 3px;
}

.is-disabled .pika-button {
  pointer-events: none;
  cursor: default;
  color: #999;
  opacity: 0.3;
}

.is-outside-current-month .pika-button {
  color: #999;
  opacity: 0.3;
}

.is-selection-disabled {
  pointer-events: none;
  cursor: default;
}

.pika-button:hover,
.pika-row.pick-whole-week:hover .pika-button {
  color: #fff;
  background: #ff8000;
  box-shadow: none;
  border-radius: 3px;
}

/* styling for abbr */
.pika-table abbr {
  border-bottom: none;
  cursor: help;
}

/*!
 * Datetimepicker for Bootstrap 3
 * version : 4.17.42
 * https://github.com/Eonasdan/bootstrap-datetimepicker/
 */
.bootstrap-datetimepicker-widget {
  list-style: none;
}
.bootstrap-datetimepicker-widget.dropdown-menu {
  margin: 2px 0;
  padding: 4px;
  width: 19em;
}
@media (min-width: 768px) {
  .bootstrap-datetimepicker-widget.dropdown-menu.timepicker-sbs {
    width: 38em;
  }
}
@media (min-width: 992px) {
  .bootstrap-datetimepicker-widget.dropdown-menu.timepicker-sbs {
    width: 38em;
  }
}
@media (min-width: 1200px) {
  .bootstrap-datetimepicker-widget.dropdown-menu.timepicker-sbs {
    width: 38em;
  }
}
.bootstrap-datetimepicker-widget.dropdown-menu:before,
.bootstrap-datetimepicker-widget.dropdown-menu:after {
  content: "";
  display: inline-block;
  position: absolute;
}
.bootstrap-datetimepicker-widget.dropdown-menu.bottom:before {
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 7px solid #ccc;
  border-bottom-color: rgba(0, 0, 0, 0.2);
  top: -7px;
  left: 7px;
}
.bootstrap-datetimepicker-widget.dropdown-menu.bottom:after {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid white;
  top: -6px;
  left: 8px;
}
.bootstrap-datetimepicker-widget.dropdown-menu.top:before {
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid #ccc;
  border-top-color: rgba(0, 0, 0, 0.2);
  bottom: -7px;
  left: 6px;
}
.bootstrap-datetimepicker-widget.dropdown-menu.top:after {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
  bottom: -6px;
  left: 7px;
}
.bootstrap-datetimepicker-widget.dropdown-menu.pull-right:before {
  left: auto;
  right: 6px;
}
.bootstrap-datetimepicker-widget.dropdown-menu.pull-right:after {
  left: auto;
  right: 7px;
}
.bootstrap-datetimepicker-widget .list-unstyled {
  margin: 0;
}
.bootstrap-datetimepicker-widget a[data-action] {
  padding: 6px 0;
}
.bootstrap-datetimepicker-widget a[data-action]:active {
  box-shadow: none;
}
.bootstrap-datetimepicker-widget .timepicker-hour,
.bootstrap-datetimepicker-widget .timepicker-minute,
.bootstrap-datetimepicker-widget .timepicker-second {
  width: 54px;
  font-weight: bold;
  font-size: 1.2em;
  margin: 0;
}
.bootstrap-datetimepicker-widget button[data-action] {
  padding: 6px;
}
.bootstrap-datetimepicker-widget .btn[data-action="incrementHours"]::after {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  content: "Increment Hours";
}
.bootstrap-datetimepicker-widget .btn[data-action="incrementMinutes"]::after {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  content: "Increment Minutes";
}
.bootstrap-datetimepicker-widget .btn[data-action="decrementHours"]::after {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  content: "Decrement Hours";
}
.bootstrap-datetimepicker-widget .btn[data-action="decrementMinutes"]::after {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  content: "Decrement Minutes";
}
.bootstrap-datetimepicker-widget .btn[data-action="showHours"]::after {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  content: "Show Hours";
}
.bootstrap-datetimepicker-widget .btn[data-action="showMinutes"]::after {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  content: "Show Minutes";
}
.bootstrap-datetimepicker-widget .btn[data-action="togglePeriod"]::after {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  content: "Toggle AM/PM";
}
.bootstrap-datetimepicker-widget .btn[data-action="clear"]::after {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  content: "Clear the picker";
}
.bootstrap-datetimepicker-widget .btn[data-action="today"]::after {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  content: "Set the date to today";
}
.bootstrap-datetimepicker-widget .picker-switch {
  text-align: center;
}
.bootstrap-datetimepicker-widget .picker-switch::after {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  content: "Toggle Date and Time Screens";
}
.bootstrap-datetimepicker-widget .picker-switch td {
  padding: 0;
  margin: 0;
  height: auto;
  width: auto;
  line-height: inherit;
}
.bootstrap-datetimepicker-widget .picker-switch td span {
  line-height: 2.5;
  height: 2.5em;
  width: 100%;
}
.bootstrap-datetimepicker-widget table {
  width: 100%;
  margin: 0;
}
.bootstrap-datetimepicker-widget table td,
.bootstrap-datetimepicker-widget table th {
  text-align: center;
  border-radius: 4px;
}
.bootstrap-datetimepicker-widget table th {
  height: 20px;
  line-height: 20px;
  width: 20px;
}
.bootstrap-datetimepicker-widget table th.picker-switch {
  width: 145px;
}
.bootstrap-datetimepicker-widget table th.disabled,
.bootstrap-datetimepicker-widget table th.disabled:hover {
  background: none;
  color: #777777;
  cursor: not-allowed;
}
.bootstrap-datetimepicker-widget table th.prev::after {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  content: "Previous Month";
}
.bootstrap-datetimepicker-widget table th.next::after {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  content: "Next Month";
}
.bootstrap-datetimepicker-widget table thead tr:first-child th {
  cursor: pointer;
}
.bootstrap-datetimepicker-widget table thead tr:first-child th:hover {
  background: #eeeeee;
}
.bootstrap-datetimepicker-widget table td {
  height: 54px;
  line-height: 54px;
  width: 54px;
}
.bootstrap-datetimepicker-widget table td.cw {
  font-size: 0.8em;
  height: 20px;
  line-height: 20px;
  color: #777777;
}
.bootstrap-datetimepicker-widget table td.day {
  height: 20px;
  line-height: 20px;
  width: 20px;
}
.bootstrap-datetimepicker-widget table td.day:hover,
.bootstrap-datetimepicker-widget table td.hour:hover,
.bootstrap-datetimepicker-widget table td.minute:hover,
.bootstrap-datetimepicker-widget table td.second:hover {
  background: #eeeeee;
  cursor: pointer;
}
.bootstrap-datetimepicker-widget table td.old,
.bootstrap-datetimepicker-widget table td.new {
  color: #777777;
}
.bootstrap-datetimepicker-widget table td.today {
  position: relative;
}
.bootstrap-datetimepicker-widget table td.today:before {
  content: "";
  display: inline-block;
  border: solid transparent;
  border-width: 0 0 7px 7px;
  border-bottom-color: #337ab7;
  border-top-color: rgba(0, 0, 0, 0.2);
  position: absolute;
  bottom: 4px;
  right: 4px;
}
.bootstrap-datetimepicker-widget table td.active,
.bootstrap-datetimepicker-widget table td.active:hover {
  background-color: #337ab7;
  color: #fff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
}
.bootstrap-datetimepicker-widget table td.active.today:before {
  border-bottom-color: #fff;
}
.bootstrap-datetimepicker-widget table td.disabled,
.bootstrap-datetimepicker-widget table td.disabled:hover {
  background: none;
  color: #777777;
  cursor: not-allowed;
}
.bootstrap-datetimepicker-widget table td span {
  display: inline-block;
  width: 54px;
  height: 54px;
  line-height: 54px;
  margin: 2px 1.5px;
  cursor: pointer;
  border-radius: 4px;
}
.bootstrap-datetimepicker-widget table td span:hover {
  background: #eeeeee;
}
.bootstrap-datetimepicker-widget table td span.active {
  background-color: #337ab7;
  color: #fff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
}
.bootstrap-datetimepicker-widget table td span.old {
  color: #777777;
}
.bootstrap-datetimepicker-widget table td span.disabled,
.bootstrap-datetimepicker-widget table td span.disabled:hover {
  background: none;
  color: #777777;
  cursor: not-allowed;
}
.bootstrap-datetimepicker-widget.usetwentyfour td.hour {
  height: 27px;
  line-height: 27px;
}
.bootstrap-datetimepicker-widget.wider {
  width: 21em;
}
.bootstrap-datetimepicker-widget .datepicker-decades .decade {
  line-height: 1.8em !important;
}
.input-group.date .input-group-addon {
  cursor: pointer;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
/**
 * vue-form-generator v2.0.0
 * https://github.com/icebob/vue-form-generator
 * Released under the MIT License.
 */

.vue-form-generator * {
  box-sizing: border-box;
}

.vue-form-generator .form-control {
  display: block;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.vue-form-generator .form-control:not([class*=" col-"]) {
  width: 100%;
}

.vue-form-generator span.help {
  margin-left: 0.3em;
  position: relative;
}

.vue-form-generator span.help .icon {
  display: inline-block;
  width: 16px;
  height: 14px;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAA+UlEQVQ4ja3TS0oDQRAG4C8+lq7ceICICoLGK7iXuNBbeAMJuPVOIm7cqmDiIncIggg+cMZFaqCnZyYKWtB0df31V1VXdfNH6S2wD9CP8xT3KH8T9BiTcE7XBMOfyBcogvCFO9ziLWwFRosyV+QxthNsA9dJkEYlvazsQdi3sBv6Ol6TBLX+HWT3fcQZ3vGM5fBLk+ynAU41m1biCXvhs4OPBDuBpa6GxF0P8YAj3GA1d1qJfdoS4DOIcIm1DK9x8iaWeDF/SP3QU6zRROpjLDFLsFlibx1jJaMkSIGrWKntvItcyTBKzCcybsvc9ZmYz3kz9Ooz/b98A8yvW13B3ch6AAAAAElFTkSuQmCC");
  background-repeat: no-repeat;
  background-position: 50%;
}

.vue-form-generator span.help .helpText {
  background-color: #444;
  bottom: 30px;
  color: #fff;
  display: block;
  left: 0;
  opacity: 0;
  padding: 20px;
  pointer-events: none;
  position: absolute;
  text-align: justify;
  width: 300px;
  transition: all 0.25s ease-out;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
  border-radius: 6px;
}

.vue-form-generator span.help .helpText a {
  font-weight: 700;
  text-decoration: underline;
}

.vue-form-generator span.help .helpText:before {
  bottom: -20px;
  content: " ";
  display: block;
  height: 20px;
  left: 0;
  position: absolute;
  width: 100%;
}

.vue-form-generator span.help:hover .helpText {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.vue-form-generator .field-wrap {
  display: flex;
}

.vue-form-generator .field-wrap .buttons {
  white-space: nowrap;
  margin-left: 4px;
}

.vue-form-generator .field-wrap button,
.vue-form-generator .field-wrap input[type="submit"] {
  display: inline-block;
  padding: 6px 12px;
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  touch-action: manipulation;
  cursor: pointer;
  user-select: none;
  color: #333;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.vue-form-generator .field-wrap button:not(:last-child),
.vue-form-generator .field-wrap input[type="submit"]:not(:last-child) {
  margin-right: 4px;
}

.vue-form-generator .field-wrap button:hover,
.vue-form-generator .field-wrap input[type="submit"]:hover {
  color: #333;
  background-color: #e6e6e6;
  border-color: #adadad;
}

.vue-form-generator .field-wrap button:active,
.vue-form-generator .field-wrap input[type="submit"]:active {
  color: #333;
  background-color: #d4d4d4;
  border-color: #8c8c8c;
  outline: 0;
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}

.vue-form-generator .field-wrap button:disabled,
.vue-form-generator .field-wrap input[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.vue-form-generator .hint {
  font-style: italic;
  font-size: 0.8em;
}

.vue-form-generator .form-group {
  display: inline-block;
  vertical-align: top;
  width: 100%;
  margin-bottom: 1rem;
}

.vue-form-generator .form-group label {
  font-weight: 400;
}

.vue-form-generator .form-group.featured > label {
  font-weight: 700;
}

.vue-form-generator .form-group.required > label:after {
  content: "*";
  font-weight: 400;
  color: red;
  padding-left: 0.2em;
  font-size: 1em;
}

.vue-form-generator .form-group.disabled > label {
  color: #666;
  font-style: italic;
}

.vue-form-generator .form-group.error input:not([type="checkbox"]),
.vue-form-generator .form-group.error select,
.vue-form-generator .form-group.error textarea {
  border: 1px solid red;
  background-color: rgba(255, 0, 0, 0.15);
}

.vue-form-generator .form-group.error .errors {
  color: red;
  font-size: 0.8em;
}

.vue-form-generator .form-group.error .errors span {
  display: block;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAiklEQVR4Xt2TMQoCQQxF3xdhu72MpZU3GU/meBFLOztPYrVWsQmEWSaMsIXgK8P8RyYkMjO2sAN+K9gTIAmDAlzoUzE7p4IFytvDCQWJKSStYB2efcAvqZFM0BcstMx5naSDYFzfLhh/4SmRM+6Agw/xIX0tKEDFufeDNRUc4XqLRz3qabVIf3BMHwl6Ktexn3nmAAAAAElFTkSuQmCC");
  background-repeat: no-repeat;
  padding-left: 17px;
  padding-top: 0;
  margin-top: 0.2em;
  font-weight: 600;
}

.vue-form-generator .field-checkbox input {
  margin-left: 12px;
}

.vue-form-generator .field-checklist .dropList,
.vue-form-generator .field-checklist .listbox {
  height: auto;
  max-height: 150px;
  overflow: auto;
}

.vue-form-generator .field-checklist .dropList .list-row label,
.vue-form-generator .field-checklist .listbox .list-row label {
  font-weight: 400;
}

.vue-form-generator .field-checklist .dropList .list-row input,
.vue-form-generator .field-checklist .listbox .list-row input {
  margin-right: 0.3em;
}

.vue-form-generator .field-checklist .combobox {
  height: auto;
  overflow: hidden;
}

.vue-form-generator .field-checklist .combobox .mainRow {
  cursor: pointer;
  position: relative;
  padding-right: 10px;
}

.vue-form-generator .field-checklist .combobox .mainRow .arrow {
  position: absolute;
  right: -9px;
  top: 3px;
  width: 16px;
  height: 16px;
  transform: rotate(0deg);
  transition: transform 0.5s;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAGdJREFUOI3tzjsOwjAURNGDUqSgTxU5K2AVrJtswjUsgHSR0qdxAZZFPrS+3ZvRzBsqf9MUtBtazJk+oMe0VTriiZCFX8nbpENMgfARjsn74vKj5IFruhfc8d6zIF9S/Hyk5HS4spMVeFcOjszaOwMAAAAASUVORK5CYII=");
  background-repeat: no-repeat;
}

.vue-form-generator .field-checklist .combobox .mainRow.expanded .arrow {
  transform: rotate(-180deg);
}

.vue-form-generator .field-checklist .combobox .dropList {
  transition: height 0.5s;
}

.vue-form-generator .field-input .wrapper,
.vue-form-generator .field-input input[type="radio"] {
  width: 100%;
}

.vue-form-generator .field-input input[type="color"] {
  width: 60px;
}

.vue-form-generator .field-input input[type="range"] {
  padding: 0;
}

.vue-form-generator .field-input .helper {
  margin: auto 0.5em;
}

.vue-form-generator .field-label span {
  display: block;
  width: 100%;
  margin-left: 12px;
}

.vue-form-generator .field-radios .radio-list label {
  display: block;
}

.vue-form-generator .field-radios .radio-list label input[type="radio"] {
  margin-right: 5px;
}

.vue-form-generator .field-submit input {
  color: #fff !important;
  background-color: #337ab7 !important;
  border-color: #2e6da4 !important;
}

.vue-form-generator .field-input .wrapper {
  width: 100%;
}

.vue-form-generator .field-input .helper {
  margin: auto 0.5em;
}

.vue-form-generator .field-image .wrapper {
  width: 100%;
}

.vue-form-generator .field-image .preview {
  position: relative;
  margin-top: 5px;
  height: 100px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: 50%;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
}

.vue-form-generator .field-image .preview .remove {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAXUlEQVR42u2SwQoAIAhD88vVLy8KBlaS0i1oJwP3piGVg0Skmpq8HjqZrWl9uwCbGAmwKYGZs/6iqgMyAdJuM8W2QmYKpLt/0AG9ASCv/oAnANd3AEjmAlFT1BypAV+PnRH5YehvAAAAAElFTkSuQmCC");
  width: 16px;
  height: 16px;
  font-size: 1.2em;
  position: absolute;
  right: 0.2em;
  bottom: 0.2em;
  opacity: 0.7;
}

.vue-form-generator .field-image .preview .remove:hover {
  opacity: 1;
  cursor: pointer;
}

.vue-form-generator .field-noUiSlider .field-wrap {
  display: block;
}

.vue-form-generator .field-noUiSlider .contain-pips {
  margin-bottom: 30px;
}

.vue-form-generator .field-noUiSlider .contain-tooltip {
  margin-top: 30px;
}

.vue-form-generator .field-noUiSlider .noUi-vertical {
  height: 200px;
  margin: 10px 0;
}

.vue-form-generator .field-rangeSlider .irs {
  width: 100%;
}

.vue-form-generator
  .field-selectEx
  .bootstrap-select
  .dropdown-menu
  li.selected
  .text {
  font-weight: 700;
}

.vue-form-generator .field-staticMap img {
  display: block;
  width: auto;
  max-width: 100%;
}

.vue-form-generator .field-switch .field-wrap label {
  position: relative;
  display: block;
  width: 120px;
  height: 30px;
  padding: 0;
  margin: 0 10px 10px 0;
  border-radius: 15px;
  box-shadow: inset 0 -1px #fff, inset 0 1px 1px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.vue-form-generator .field-switch input {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}

.vue-form-generator .field-switch .label {
  position: relative;
  display: block;
  height: inherit;
  font-size: 10px;
  text-transform: uppercase;
  background: #eceeef;
  border-radius: inherit;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.12),
    inset 0 0 2px rgba(0, 0, 0, 0.15);
}

.vue-form-generator .field-switch .label:after,
.vue-form-generator .field-switch .label:before {
  position: absolute;
  top: 50%;
  margin-top: -0.5em;
  line-height: 1;
  -webkit-transition: inherit;
  -moz-transition: inherit;
  -o-transition: inherit;
  transition: inherit;
}

.vue-form-generator .field-switch .label:before {
  content: attr(data-off);
  right: 11px;
  color: #aaa;
  text-shadow: 0 1px hsla(0, 0%, 100%, 0.5);
}

.vue-form-generator .field-switch .label:after {
  content: attr(data-on);
  left: 11px;
  color: #fff;
  text-shadow: 0 1px rgba(0, 0, 0, 0.2);
  opacity: 0;
}

.vue-form-generator .field-switch input:checked ~ .label {
  background: #e1b42b;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15),
    inset 0 0 3px rgba(0, 0, 0, 0.2);
}

.vue-form-generator .field-switch input:checked ~ .label:before {
  opacity: 0;
}

.vue-form-generator .field-switch input:checked ~ .label:after {
  opacity: 1;
}

.vue-form-generator .field-switch .handle {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 28px;
  height: 28px;
  background: linear-gradient(180deg, #fff 40%, #f0f0f0);
  background-image: -webkit-linear-gradient(top, #fff 40%, #f0f0f0);
  border-radius: 100%;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
}

.vue-form-generator .field-switch .handle:before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  margin: -6px 0 0 -6px;
  width: 12px;
  height: 12px;
  background: linear-gradient(180deg, #eee, #fff);
  background-image: -webkit-linear-gradient(top, #eee, #fff);
  border-radius: 6px;
  box-shadow: inset 0 1px rgba(0, 0, 0, 0.02);
}

.vue-form-generator .field-switch .handle,
.vue-form-generator .field-switch .label {
  transition: all 0.3s ease;
}
</style>
