import * as vscode from "vscode";
import { getNonce } from "./util";

export class FormEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    console.log("registering");
    const provider = new FormEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      FormEditorProvider.viewType,
      provider
    );
    return providerRegistration;
  }

  private static viewType = "form-editor.form-editor";

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Called when our custom editor is opened.
   *
   *
   */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: "update",
        text: document.getText(),
      });
    }

    // const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
    //   (e) => {
    //     if (e.document.uri.toString() === document.uri.toString()) {
    //       updateWebview();
    //     }
    //   }
    // );

    // // Make sure we get rid of the listener when our editor is closed.
    // webviewPanel.onDidDispose(() => {
    //   changeDocumentSubscription.dispose();
    // });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage((e) => {
      if (e.type === "updateDocument") {
        console.log("Recieved update");
        const edit = new vscode.WorkspaceEdit();

        // Just replace the entire document every time for this example extension.
        // A more complete extension should compute minimal edits instead.
        edit.replace(
          document.uri,
          new vscode.Range(0, 0, document.lineCount, 0),
          JSON.stringify(e.data, null, 2)
        );

        return vscode.workspace.applyEdit(edit);
      }
    });

    updateWebview();
  }

  /**
   * Get the static html used for the editor webviews.
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
    //Local path to script and css for the webview

    const styleFormJsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "form-js.css")
    );

    const styleFormEditorJsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "media",
        "form-js-editor.css"
      )
    );

    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "main.css")
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "media",
        "form-editor.bundle.js"
      )
    );

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleMainUri}" rel="stylesheet" />
				<link href="${styleFormJsUri}" rel="stylesheet" />
				<link href="${styleFormEditorJsUri}" rel="stylesheet" />


					<title>Form Editor</title>
			</head>
			<body>
                
                <div id="form-editor"></div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }

  async saveCustomDocument(
    document: vscode.CustomDocument,
    cancellation: vscode.CancellationToken
  ): Promise<void> {
    // This gets called whenever the user saves the document
    console.log("User saved the document:", document.uri.toString());

    // You are responsible for writing the contents to disk
    // const data = this.getSerializedDocument(document);
    // await vscode.workspace.fs.writeFile(document.uri, data);
  }
  /**
   * Try to get a current document as json text.
   */
  private getDocumentAsJson(document: vscode.TextDocument): any {
    const text = document.getText();
    if (text.trim().length === 0) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        "Could not get document as json. Content is not valid json"
      );
    }
  }

  /**
   * Write out the json to a given document.
   */
  private updateTextDocument(document: vscode.TextDocument, json: any) {
    const edit = new vscode.WorkspaceEdit();

    // Just replace the entire document every time for this example extension.
    // A more complete extension should compute minimal edits instead.
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      JSON.stringify(json, null, 2)
    );

    return vscode.workspace.applyEdit(edit);
  }
}
