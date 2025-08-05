import { ChildProcess, execSync, spawn } from "child_process";
import EditorMode from "./BaseEditorMode";
import { ClientObject, EditorFile, EditorSession } from "../types";
import { WebSocketMessageType } from "../../../dist/shared/types.js";
import inspector from 'inspector'
import DebugProcess from "./ProcessTypes";

class javascript extends EditorMode {

    static name = 'JS'
    static logoSrc: string = 'js-logo.png'
    static description: string = 'nothing yet'


    static extension: string[] = ['js'];
    static dockerSafeTag: string = 'js'
    static defaultText: string =
`//    Compilator C++ online | intelegeinfo.ro

    console.log('Intelege info')
`
    static dockerFile = ''
    static clientCompile = true
    static isInterpreter: boolean =true
    HandleClientInput() {
    
    }

    constructor()
    {
        super()
    }

    compile(res: any, file: EditorFile, isDebugging?: boolean) {
        return undefined
    }
    execute(res: any, clientObj: ClientObject, sessionObj: EditorSession): ChildProcess | Promise<ChildProcess> {
        sessionObj.replicateFunction((ws,id, obj) => obj.sendMessage({status: 'spawn'}, WebSocketMessageType.ExecuteStatus))
        sessionObj.replicateFunction((clientWs) => {
            clientWs.send(JSON.stringify({type: WebSocketMessageType.End, fileName: clientObj.openFile[0].name, sandbox: clientObj.openFile[0].content, clientId: clientObj.clientId}));  // Send GDB output to the client
        });
        return undefined
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
   
    startDebugging(res: any, clientObj: ClientObject, sessionObj: EditorSession): JSDebugger {
        return new JSDebugger(clientObj, sessionObj)
    }
}
 class JSDebugger extends DebugProcess
    {
        sendCommand: (string: any) => void;
        kill: () => void = () =>
        {
            this.session.disconnect()
            this.session.removeAllListeners()
            this.killed = true
        }
        addListener: (ev: any, func: (code: any) => void) => void 
        = function (ev, func) 
        {
            func(0)
        }
        addDataListener = (onDataFunc: typeof this.onResponse) => {
           
        };
        removeDataListener = (onDataFunc: typeof this.onResponse) => {
            
        };

        session = new inspector.Session();


        constructor(clientObj: ClientObject, sessionObj) {
            super()
            clientObj.openFile[0].editorMode.execute(undefined, clientObj, sessionObj)
            const session = this.session
            
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
                    },(err, params) => console.log(params));

               
                });

            });

            session.on('Debugger.paused', msg => {
                console.log("Paused at breakpoint:", msg.params.callFrames[0].location);
                // You can inspect variables here
                session.post('Debugger.resume'); // Continue execution
            });
        }
    }

export default javascript


