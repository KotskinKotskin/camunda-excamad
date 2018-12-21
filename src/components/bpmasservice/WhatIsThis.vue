<template>
  <div>
    <b-jumbotron
      header="Business process as service"
      lead="A platform that will make all the rough work in process automation."
    ></b-jumbotron>
    <b-row>
      <b-col cols="3">
        <b-card title="Process creation">
          <p
            class="card-text"
          >Build business processes in your browser using the power of BPMN 2.0 and the Camunda engine. One-click deploy.</p>
        </b-card>
      </b-col>
      <b-col>
        <b-img width="900" src="bpmn2.gif" fluid alt="Responsive image"/>
      </b-col>
    </b-row>
    <hr>
    <b-row>
      <b-col>
        <b-img width="900" src="external-task-pattern.png" fluid alt="Responsive image"/>
      </b-col>
      <b-col cols="4">
        <b-card title="Your automation">
          <p
            class="card-text"
          >Use poling to get process tasks and execute them with your scripts. In python, ruby, Java, C ++, BrainFuck or any other language.</p>
        </b-card>
      </b-col>
    </b-row>
    <hr>
    <b-row>
      <b-col>
        <b-card
          overlay
          text-variant="white"
          img-src="http://placekitten.com/g/1080/150"
          title="Persist payload"
        >
          <p
            class="card-text"
          >Transfer payload data between workers and people. Define data directly inside the scripts, there is no need to define them in advance.</p>
        </b-card>
      </b-col>
    </b-row>
    <hr>
    <b-row>
      <b-col cols="3">
        <b-card title="Form generator">
          <p
            class="card-text"
          >Use the visual designer to create simple user tasks forms. Strings, JSON, dates, boolean and enum context variables are supported.</p>
        </b-card>
      </b-col>
      <b-col>
        <b-img width="900" src="form.gif" fluid alt="Responsive image"/>
      </b-col>
    </b-row>
    <hr>
    <b-row>
      <b-col>
        <b-img width="900" src="adminka.png" fluid alt="Responsive image"/>
      </b-col>
      <b-col cols="4">
        <b-card title="Extended cockpit">
          <p
            class="card-text"
          >Migrations, versioning, control of incidents, statistics in runtime, one-button deploy and detailed logs out the box.</p>
        </b-card>
      </b-col>
    </b-row>
    <hr>
    <div class="text-center my-3">
      <b-btn :to="urlToStart" class="mt-5 mb-5" size="lg" variant="success">Make first process</b-btn>
    </div>
  </div>
</template>

<script>
import { STATRTERPROCESSNAME } from "@/config/settings";
export default {
  name: "WhatIsThis",
  data() {
    return {
      starterprocess: STATRTERPROCESSNAME
    };
  },
  computed: {
    urlToStart() {
      return "/bpmasservice/newdiagram/" + this.starterprocess;
    }
  }
};
</script>

<style>
</style>
