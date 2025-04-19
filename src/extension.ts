import * as vscode from "vscode";
import { FormEditorProvider } from "./FormEditorProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("🟢 Extension activated");
  context.subscriptions.push(FormEditorProvider.register(context));
}

// This method is called when your extension is deactivated
export function deactivate() {}
