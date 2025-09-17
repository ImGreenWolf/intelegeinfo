import { createNode } from "./components.js";
import { createTabElement, EditorWindowTab } from "./windowManager.js";
import { WebSocketMessageType, ws } from "./codeEditor.js";
class TerminalTab extends EditorWindowTab {
    // terminal: Ace.Editor
    prompt = "$ ";
    terminal;
    constructor() {
        const terminalElem = createNode('div', { id: 'terminal' });
        document.head.appendChild(createNode('link', { attributes: [{ name: 'rel', value: 'stylesheet' }, { name: 'href', value: 'client/modules/@xterm/xterm/css/xterm.css' }] }));
        // let terminal = ace.edit(terminalElem, {
        //     showGutter: false,
        //     enableBasicAutocompletion: false,
        //     displayIndentGuides: false,
        //     fontSize: 16,
        //     showLineNumbers: false,
        //     highlightActiveLine: false,
        //     showPrintMargin: false,
        //     wrap: true,
        //     theme: 'ace/theme/terminal'
        // })
        // terminal.setShowPrintMargin(false)
        // terminal.renderer.setShowGutter(false)
        super('Terminal', createTabElement('Terminal'), terminalElem);
        this.terminal = new Terminal();
        this.terminal.open(terminalElem);
        this.terminal.onData((arg1, arg2) => {
            ws.send(JSON.stringify({ type: WebSocketMessageType.Console, action: 'container', body: arg1 }));
        });
        //  terminal.setValue(this.prompt, -1); // set prompt and move cursor to end
        // this.terminal = terminal
        // const prompt = this.prompt
        //   // Intercept Enter key to run command
        // terminal.commands.addCommand({
        //     name: "runTerminalCommand",
        //     bindKey: { win: "Enter", mac: "Enter" },
        //     exec: function(editor: Ace.Editor) {
        //         const lines = editor.session.getDocument().getAllLines();
        //         const lastLine = lines[lines.length - 1];
        //         const command = lastLine.slice(prompt.length).trim();
        //         // runCommand(command);
        //         if(!command)
        //             return;
        //         ws.send(JSON.stringify({type: WebSocketMessageType.Console, action: 'container', body: command}))
        //     }
        // });
        // // Prevent backspacing the prompt
        // terminal.commands.addCommand({
        //     name: "preventBackspacePrompt",
        //     bindKey: { win: "Backspace", mac: "Backspace" },
        //     exec: function(editor: Ace.Editor) {
        //         const pos = editor.getCursorPosition();
        //         const line = editor.session.getLine(pos.row);
        //         if (pos.column <= prompt.length) return;
        //         editor.remove("left");
        //     }
        // });
        // // Prevent editing previous lines
        // terminal.on("change", function(delta) {
        //     const lines = terminal.session.getDocument().getAllLines();
        //     const lastLine = lines[lines.length - 1];
        //     const cursor = terminal.getCursorPosition();
        //     if (cursor.row < lines.length - 1 || cursor.column < prompt.length) {
        //         terminal.gotoLine(lines.length, prompt.length);
        //     }
        // });
    }
    write(data) {
        // this.terminal.session.insert({row: this.terminal.session.getLength()+1, column: 0}, "\n"+data+"\n"+this.prompt)
        this.terminal.write(data);
    }
}
export default TerminalTab;
