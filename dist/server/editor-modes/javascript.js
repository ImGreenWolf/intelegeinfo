"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseEditorMode_1 = __importDefault(require("./BaseEditorMode"));
const types_js_1 = require("../../../dist/shared/types.js");
const inspector_1 = __importDefault(require("inspector"));
const ProcessTypes_1 = __importDefault(require("./ProcessTypes"));
class javascript extends BaseEditorMode_1.default {
    static name = 'JS';
    static logoSrc = 'js-logo.png';
    static description = `Limbajul web-ului, face site-urile interactive și dinamice.
Avantaje: Rulează în browser și pe server, multe framework-uri.`;
    static color = '#F0DB4F';
    static extension = ['js'];
    static dockerSafeTag = 'js';
    static defaultText = `//    Compilator C++ online | intelegeinfo.ro

    console.log('Intelege info')
`;
    static dockerFile = '';
    static clientCompile = true;
    static isInterpreter = true;
    HandleClientInput() {
    }
    constructor() {
        super();
    }
    compile(res, file, isDebugging) {
        return undefined;
    }
    execute(res, clientObj, sessionObj) {
        sessionObj.replicateFunction((ws, id, obj) => obj.sendMessage({ status: 'spawn' }, types_js_1.WebSocketMessageType.ExecuteStatus));
        sessionObj.replicateFunction((clientWs) => {
            clientWs.send(JSON.stringify({ type: types_js_1.WebSocketMessageType.End, fileName: clientObj.openFile[0].name, sandbox: clientObj.openFile[0].content, clientId: clientObj.clientId })); // Send GDB output to the client
        });
        return undefined;
    }
    //   checkCodeSyntax = (sessionObj: EditorSession, file: EditorFile): Promise<string> =>
    // {
    // return new Promise((resolve, reject) => {
    //     const filePath = sessionObj.getClientFilesPath();//            path.join(rootDirName, "cache", sessionId);
    //     const codeFile = !["js"].includes(path.extname(file.name|| "main.js"))? file.name : "main.js";
    //     const compileProcess = spawn("npx", ["eslint", "--format json", path.join(filePath, codeFile || "main.js") ], {
    //         windowsHide: true,
    //         detached: true,
    //         shell: true,
    //     });
    //     let buffer = '';
    //     compileProcess.stdout.on('data', data => {
    //         buffer += data.toString()
    //     })
    //     compileProcess.stderr.on('data', data => {
    //         buffer += data.toString()
    //     })
    //     compileProcess.on('close', (code)=> {
    //             resolve(buffer.replace('compilation terminated.','')) // TODO check how to fix this, maybe remove it directly from stderr
    //     })
    // })
    // }
    startDebugging(res, clientObj, sessionObj) {
        return new JSDebugger(clientObj, sessionObj);
    }
}
class JSDebugger extends ProcessTypes_1.default {
    sendCommand;
    sendProgramInput = (command) => {
    };
    kill = () => {
        this.session.disconnect();
        this.session.removeAllListeners();
        this.killed = true;
    };
    addListener = function (ev, func) {
        func(0);
    };
    addDataListener = (onDataFunc) => {
    };
    removeDataListener = (onDataFunc) => {
    };
    session = new inspector_1.default.Session();
    constructor(clientObj, sessionObj) {
        super();
        clientObj.openFile[0].editorMode.execute(undefined, clientObj, sessionObj);
        const session = this.session;
        session.connect();
        // session.on('Runtime.consoleAPICalled', msg => {
        //     const args = msg.params.args.map(arg => arg.value).join(" ");
        //     console.log(msg)
        //     // console.log("🔍 console.log from user code:", args);
        // });
        session.post('Debugger.enable', () => {
            session.post('Runtime.enable', () => {
                session.post('Runtime.evaluate', {
                    expression: clientObj.openFile[0].content,
                    contextId: 1
                }, (err, params) => console.log(params));
            });
        });
        session.on('Debugger.paused', msg => {
            console.log("Paused at breakpoint:", msg.params.callFrames[0].location);
            // You can inspect variables here
            session.post('Debugger.resume'); // Continue execution
        });
    }
}
exports.default = javascript;
