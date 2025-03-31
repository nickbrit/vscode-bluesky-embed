import * as vscode from "vscode";
import axios from "axios";

async function getBlueskyEmbed(url: string): Promise<string | null> {
    try {
        const response = await axios.get(
            `https://embed.bsky.app/oembed?url=${encodeURIComponent(
                url
            )}&format=json`
        );
        return response.data.html;
    } catch (error) {
        console.error("Error fetching embed:", error);
        return null;
    }
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        "blueskyEmbed.replaceUrl",
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return vscode.window.showInformationMessage(
                    "No active editor found."
                );
            }

            const selection = editor.selection;
            const text = editor.document.getText(selection);

            const blueskyUrlPattern =
                /https:\/\/bsky\.app\/profile\/[a-zA-Z0-9\-\.]+\/post\/[a-zA-Z0-9\-]+/g;
            const matches = text.match(blueskyUrlPattern);

            if (!matches || matches.length === 0) {
                return vscode.window.showInformationMessage(
                    "No Bluesky URLs found."
                );
            }

            for (let url of matches) {
                const embedCode = await getBlueskyEmbed(url);
                if (embedCode) {
                    const range = new vscode.Range(
                        editor.document.positionAt(selection.start.character),
                        editor.document.positionAt(selection.end.character)
                    );
                    editor.edit((editBuilder) => {
                        editBuilder.replace(range, embedCode);
                    });
                }
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
