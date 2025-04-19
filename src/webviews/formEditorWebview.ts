import { FormEditor } from "@bpmn-io/form-js-editor";

const schema = {
  components: [
    {
      text: "Example\n",
      type: "text",
      layout: {
        row: "Row_12tugsb",
        columns: null,
      },
      id: "Field_0sxtbxn",
    },
    {
      label: "Number",
      type: "number",
      layout: {
        row: "Row_01flj8p",
        columns: null,
      },
      id: "Field_1ftwcq0",
      key: "number_978aj",
    },
    {
      subtype: "date",
      dateLabel: "Date",
      type: "datetime",
      layout: {
        row: "Row_0rih328",
        columns: null,
      },
      id: "Field_07a291v",
      key: "datetime_sw1j3a",
    },
  ],
  type: "default",
  id: "Form_0k7zwsf",
  exporter: {
    name: "form-js (https://demo.bpmn.io)",
    version: "1.14.0",
  },
  schemaVersion: 18,
};

const editor = new FormEditor({
  container: "#form-editor",
});

editor.importSchema(schema);
