declare global {
  interface Window {
    formEditor: any; // or whatever type you need
  }
}

import { FormEditor } from "@bpmn-io/form-js-editor";
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  async function updateContent(text: string) {
    let json;
    try {
      if (!text) {
        text = "{}";
      }
      json = JSON.parse(text);
      window.formEditor.importSchema(json);
    } catch {
      return;
    }

    // Render the json doc as form
    try {
      await window.formEditor.importSchema(json);
    } catch (err) {
      console.log("importing form failed", err);
    }
  }

  const editor = new FormEditor({
    container: "#form-editor",
  });

  editor.on("changed", (event: any) => {
    const schema = editor.saveSchema();
    vscode.setState({ text: JSON.stringify(schema) });
    vscode.postMessage({
      type: "updateDocument",
      data: schema,
    });
  });

  //ts-ignore
  window.formEditor = editor;

  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "update":
        const text = message.text;
        updateContent(text);

        // Then persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState({ text });

        return;
    }
  });

  const state = vscode.getState();
  if (state) {
    updateContent(state.text);
  }
})();
