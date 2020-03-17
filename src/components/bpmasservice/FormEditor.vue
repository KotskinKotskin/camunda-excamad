<template>
  <div id="form-editor">
    <b-card bg-variant="light" text-variant="dark">
      <b-container class="bv-example-row">
        <b-row class="text-left">
          <b-col cols="3">
            <b-list-group>
              <b-list-group-item
                button
                :key="item.id"
                @click="select(item)"
                v-for="item in fields"
              >{{item.id}}</b-list-group-item>
            </b-list-group>
            <b-button
              size="sm"
              @click="generatePreview()"
              class="mt-2 ml-2"
              variant="outline-success"
            >Preview</b-button>
          </b-col>
          <b-col cols="4">
            <b-card bg-variant="light" text-variant="dark">
              <b-form @submit="onSubmit">
                <b-form-group id="exampleInputGroup2" label="Variable id" label-for="exampleInput2">
                  <b-form-input
                    size="sm"
                    id="exampleInput2"
                    type="text"
                    v-model="selectedField.id"
                    required
                    placeholder="Input unic variable id"
                  ></b-form-input>
                </b-form-group>

                <b-form-group
                  id="exampleInputGroup2"
                  label="Label on form"
                  label-for="exampleInput2"
                >
                  <b-form-input
                    size="sm"
                    id="exampleInput2"
                    type="text"
                    v-model="selectedField.label"
                    required
                    placeholder="Input label on form"
                  ></b-form-input>
                </b-form-group>

                <b-form-group
                  id="exampleInputGroup4"
                  label="Default value"
                  label-for="exampleInput4"
                >
                  <b-form-textarea
                    size="sm"
                    id="exampleInput4"
                    type="textarea"
                    :rows="3"
                    v-model="selectedField.defaultValue"
                    required
                    placeholder="Default value"
                  ></b-form-textarea>
                </b-form-group>
                <b-form-group id="exampleInputGroup3" label="Type" label-for="exampleInput3">
                  <b-form-select
                    size="sm"
                    id="exampleInput3"
                    :options="typeOptions"
                    v-model="selectedType"
                    required
                  ></b-form-select>
                </b-form-group>

                <b-form-checkbox size="sm" :disabled="required" v-model="readOnly">Read only</b-form-checkbox>
                <b-form-checkbox size="sm" :disabled="readOnly" v-model="required">Required</b-form-checkbox>

                <br>
              </b-form>
            </b-card>
          </b-col>
          <b-col cols="5">
            <form v-if="previewDone">
              <vue-form-generator
                :key="formGeneratorKey"
                :schema="schema"
                :model="model"
                :options="formOptions"
              ></vue-form-generator>
            </form>
          </b-col>
        </b-row>
      </b-container>
    </b-card>
  </div>
</template>
<script>
import { validators } from "vue-form-generator";
import BpmnModdle from "bpmn-moddle";
import camundaModdle from "camunda-bpmn-moddle/resources/camunda";
import camundaExtensionModule from "camunda-bpmn-moddle/lib";
export default {
  name: "FormEditor",
  props: ["fields"],
  data() {
    return {
      model: {},
      schema: {
        fields: []
      },
      formGeneratorKey: 0,
      formOptions: {
        validateAfterLoad: true,
        validateAfterChanged: true
      },
      selectedField: {},
      selectedType: "",
      selectedEnum: [],
      readOnly: false,
      testObj: "",
      required: false,
      selectedProps: [],
      previewDone: false,
      typeOptions: ["Time", "String", "JSON", "boolean", "Enum", "Table"],
      propsByType: [
        {
          type: "Time",
          typeForVariable: "string",
          props: [{ type: "TCEDataPicker" }, { validator: "date" }]
        },
        {
          type: "Table",
          typeForVariable: "string",
          props: [{ type: "TCETable" }]
        },
        {
          type: "String",
          typeForVariable: "string",
          props: [
            { inputType: "text" },
            { validator: "string" },
            { type: "input" }
          ]
        },
        {
          type: "JSON",
          typeForVariable: "string",
          props: [{ type: "TCEJson" }]
        },
        {
          type: "boolean",
          typeForVariable: "boolean",
          props: [{ type: "switch" }, { textOn: "True" }, { textOff: "False" }]
        },
        {
          type: "Enum",
          typeForVariable: "enum",
          props: [{ type: "checklist" }]
        }
      ]
    };
  },
  watch: {
    idSelectedField: function(newValue, oldValue) {
      if (oldValue.selectedFieldId == newValue.selectedFieldId) {
        var defaultProps = this.getDefaultProps(newValue.selectedType);

        var currentField = this.fields.find(
          x => x.id === newValue.selectedFieldId
        );
        currentField.type = defaultProps.typeForVariable;

        if (!currentField.properties) {
          var moddle = new BpmnModdle({ camunda: camundaModdle });

          var properties = moddle.create("camunda:Properties");

          var values = [];
          properties["values"] = values;
          currentField["properties"] = properties;
        }
        if (currentField.properties && currentField.properties.values) {
          if (currentField.properties.values.find(y => y.id === "readonly")) {
            currentField.properties.values.find(
              y => y.id === "readonly"
            ).value = newValue.readonly.toString();
          } else {
            moddle = new BpmnModdle({ camunda: camundaModdle });

            var readonlyproperty = moddle.create("camunda:Property");
            readonlyproperty["id"] = "readonly";
            readonlyproperty["value"] = newValue.readonly.toString();
            currentField.properties.values.push(readonlyproperty);
          }

          if (currentField.properties.values.find(c => c.id === "required")) {
            currentField.properties.values.find(
              c => c.id === "required"
            ).value = newValue.required.toString();
          } else {
            moddle = new BpmnModdle({ camunda: camundaModdle });

            var requiredproperty = moddle.create("camunda:Property");

            requiredproperty["id"] = "required";
            requiredproperty["value"] = newValue.required.toString();
            currentField.properties.values.push(requiredproperty);
          }

          defaultProps.props.forEach(element => {
            for (var key in element) {
              if (currentField.properties.values.find(a => a.id === key)) {
                currentField.properties.values.find(
                  a => a.id === key
                ).value = element[key].toString();
              } else {
                var moddle = new BpmnModdle({ camunda: camundaModdle });

                var obj = moddle.create("camunda:Property");

                obj["id"] = key;
                obj["value"] = element[key].toString();
                currentField.properties.values.push(obj);
              }
            }
          });
        }

        if (newValue.selectedType != "String") {
          try {
            var propToDel = currentField.properties.values.find(
              x => x.id === "inputType"
            );
            var index = currentField.properties.values.indexOf(propToDel);
            if (index > -1) {
              currentField.properties.values.splice(index, 1);
            }
          } finally {}
        }
      }
    }
  },
  created() {
    this.fields.forEach(element => {
      if (element.type == null) {
        element.type = "string";

        var moddle = new BpmnModdle({ camunda: camundaModdle });
        var newField = moddle.create("camunda:Properties");

        element["properties"] = newField;
        element.properties["values"] = [];
      }
    });
  },
  computed: {
    idSelectedField() {
      var obj = {
        selectedType: this.selectedType,
        selectedFieldId: this.selectedField.id,
        readonly: this.readOnly,
        required: this.required
      };
      return obj;
    }
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
    whatToAddToModel(element) {
      if (element.defaultValue) {
        if (this.isJson(element.defaultValue)) {
         

          var obj = JSON.parse(element.defaultValue);
          return obj;
        } else return element.defaultValue;
      } else return "";
    },
    generatePreview() {
      this.formGeneratorKey = this.formGeneratorKey + 1;
      this.model = {};
      this.schema.fields = [];
      this.previewDone = false;
      var fieldsToSchema = [];
      this.fields.forEach(element => {
        var obj = this.whatToAddToModel(element);
    
        this.$set(this.model, element.id, obj);

        var field = {};
        field["model"] = element.id;
        field["label"] = element.label;

        if (element.properties.values.find(y => y.id === "readonly")) {
          field["readonly"] =
            element.properties.values.find(x => x.id === "readonly").value ===
            "true";
        }
        if (element.properties.values.find(y => y.id === "required")) {
          field["required"] =
            element.properties.values.find(y => y.id === "required").value ===
            "true";
        }

        field["type"] = element.properties.values.find(
          z => z.id === "type"
        ).value;

        var complexType = this.checkComplexType(
          element.type,
          element.properties.values.find(q => q.id === "inputType")
            ? element.properties.values.find(q => q.id === "inputType").value
            : element.properties.values.find(q => q.id === "type").value
        );
       
        var defaultProps = this.getDefaultProps(complexType);
     
        defaultProps.props.forEach(element => {
          for (var key in element) {
            field[key] = element[key];
          }
        });

        fieldsToSchema.push(field);
      });
      this.schema.fields = fieldsToSchema;
      this.previewDone = true;
    },
    checkComplexType: function(type, inputType) {
      if (type == "string" && inputType == "TCEDataPicker") {
        return "Time";
      } else if (type == "string" && inputType == null) {
        return "String";
      } else if (type == "string" && inputType == "text") {
        return "String";
      } else if (type == "string" && inputType == "TCEJson") {
        return "JSON";
      } else if (type == "boolean" && inputType == "switch") {
        return "boolean";
      } else if (type == "enum" && inputType == "checklist") {
        return "Enum";
      } else if (type == "string" && inputType == "TCETable") {
        return "Table";
      }
    },
    getDefaultProps: function(complexType) {
      var obj = {};
      obj = this.propsByType.find(x => x.type === complexType);
      return obj;
    },

    select(item) {
      this.selectEnum = [];
      this.selectedType = "";
      this.selectedField = {};
      this.selectedField = this.fields.find(x => x.id === item.id);
      
      if (
        this.selectedField.type == "string" &&
        this.selectedField.properties.values.find(
          x => x.value === "TCEDataPicker"
        )
      ) {
        this.selectedType = "Time";
      } else if (
        this.selectedField.type == "string" &&
        this.selectedField.properties.values.find(x => x.value === "text")
      ) {
        this.selectedType = "String";
      } else if (
        this.selectedField.type == "string" &&
        this.selectedField.properties.values.find(x => x.value === "TCEJson")
      ) {
        this.selectedType = "JSON";
      } else if (
        this.selectedField.type == "boolean" &&
        this.selectedField.properties.values.find(x => x.value === "switch")
      ) {
        this.selectedType = "boolean";
      } else if (
        this.selectedField.type == "enum" &&
        this.selectedField.properties.values.find(x => x.value === "checklist")
      ) {
        this.selectedType = "Enum";
      } else if (
        this.selectedField.type == "string" &&
        this.selectedField.properties.values.find(x => x.value === "TCETable")
      ) {
        this.selectedType = "Table";
      }
      try {
        this.readOnly =
          this.selectedField.properties.values.find(y => y.id === "readonly")
            .value == "true";
      } finally {}

      try {
        this.required =
          this.selectedField.properties.values.find(z => z.id === "required")
            .value == "true";
      } catch (error) {
        
      }

      if (this.selectedType == "Enum") {
        this.selectedField.values.forEach(element => {
          var obj = {};
          obj["key"] = element.id;
          obj["value"] = element.name;

          this.selectedEnum.push(obj);
        });
      }
    },
    onSubmit(evt) {
      evt.preventDefault();
      alert(JSON.stringify(this.form));
    }
  }
};
</script>

<style>
</style>
