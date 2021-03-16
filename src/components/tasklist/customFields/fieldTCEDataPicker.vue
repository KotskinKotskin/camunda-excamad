<template>
  <div class="superz">
    <vue-datepicker-local
      :local="local"
      clearable
      :placeholder="schema.placeholder"
      :disabled="disabled"
      format="YYYY-MM-DDTHH:mm:ss"
      v-model="value"
    />
  </div>
</template>

<script>
import { abstractField } from "vue-form-generator";
import VueDatepickerLocal from "vue-datepicker-local";
import moment from "vue-moment";

export default {
  mixins: [abstractField],
  components: { VueDatepickerLocal },
  data: () => ({
    date: "2019-01-01 14:30",
    local: {
      dow: 1, // Monday is the first day of the week
      hourTip: "Hour", // tip of select hour
      minuteTip: "Minutes", // tip of select minute
      secondTip: "Seconds", // tip of select second
      yearSuffix: " y.", // format of head
      monthsHead: "1 Jan_2 Feb_3 Mar_4 Apr_5 May_6 June_7 July8 Aug_9 Sept_10 Oct_11 Ov_12 Dec".split(
        "_"
      ), // months of head
      months: "1 Jan_2 Feb_3 Mar_4 Apr_5 May_6 June_7 July8 Aug_9 Sept_10 Oct_11 Ov_12 Dec".split(
        "_"
      ), // months of panel
      weeks: "Mon_Tue_Wed_Thu_Fri_Sat_Sun".split("_"), // weeks
      cancelTip: "Cancel" // default text for cancel button  submitTip: '提交' // default text for submit button
    }
  }),
  created() {
    if (this.value != null && this.value.split(' ').length - 1 > 4) {
      this.value = this.value.substr(this.value.indexOf(" ") + 1);


      var lastIndex = this.value.lastIndexOf(" ");
      this.value = this.value.substring(0, lastIndex);

      lastIndex = this.value.lastIndexOf(" ");
      this.value = this.value.substring(0, lastIndex);

      this.value = this.$momenttrue(this.value).format();
    }

  }
};
</script>
