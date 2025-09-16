import { ChildProcess, execSync, spawn } from "child_process";
import EditorMode from "./BaseEditorMode";
import { ClientObject, EditorFile, EditorSession } from "../types";
import path from "path";
import DebugProcess from "./ProcessTypes";
import { WebSocketMessageType } from "../../../dist/shared/types";
import * as nodepty from "node-pty"


class CppMode extends EditorMode {

    static name = 'C++'
    static logoSrc: string = 'c++-logo.png'
    static description: string = `Limbaj rapid și puternic, folosit la jocuri, sisteme și aplicații complexe.
Avantaje: Viteză mare, control total, folosit în industrie.`
    static color: string = '#659AD2'

    static extension: string[] = ['cpp', 'c++'];
    static dockerSafeTag: string = 'cpp'
    static defaultText: string =
`//    Compilator C++ online | intelegeinfo.ro

#include <iostream>

using namespace std;

int main() {
    
    cout << "Intelege info" << endl;
    
    return 0;

}`
    static dockerFile = 
    `
    # Base image with GCC
    FROM gcc:bookworm

    # Set working directory inside container
    WORKDIR /app
    RUN apt-get update && \
        apt-get install -y gdb && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*
    # Default command can be overridden
    CMD [ "bash" ]
    `.trim();


    HandleClientInput() {
    
    }

    constructor()
    {
        super()
    }

    execute(res) {
        // execSync('docker exec -i ' + res.imageName + ' bash -c "ls"', {stdio: 'inherit'})
         return spawn('docker', ['exec', "-i", res.imageName, "bash","-c", `(cd ./clientFiles && exec ../${res.fileName.split('.')[0]})`], {
            stdio: 'pipe'  // pipe gives you access to stdin, stdout, stderr
        });
    }

    compile(res, file:EditorFile, isDebugging=false) {
        return new Promise<void>((resolve, reject) => {
            try {

                const compile = spawn(`docker`, ['exec', res.imageName, 'bash','-c', `g++ ${isDebugging? '-g' : ""} -O0 clientFiles/${res.fileName} -o ${res.fileName.split('.')[0]}`], {stdio: 'pipe'})
                let buffer = ''

                compile.stdout.on('data', chunk => {
                    const data = chunk.toString()
                    buffer += data
                    // this.sendError(data)
                })
                compile.stderr.on('data', chunk => {
                    const data = chunk.toString()
                    buffer += data
                    // this.sendError(data, true)
                })
                compile.on('close', code => {
                    if(code==0)
                        resolve()
                    else 
                    {
                         this.sendError(buffer, true)
                        //  reject(code + ": " + buffer, true)
                    }
                        
                })
            }
            catch (err)
            {
                this.sendError(err)
            }
        })
    }

    startDebugging(res, clientObj, clientSession) {
        return new CPPDebugger(res, clientObj, clientSession)
    }

    checkCodeSyntax = (sessionObj: EditorSession, file: EditorFile): Promise<string> =>
    {
        return new Promise((resolve, reject) => {
            const filePath = sessionObj.getClientFilesPath();//            path.join(rootDirName, "cache", sessionId);
            const codeFile = !["cpp"].includes(path.extname(file.name|| "main.cpp"))? file.name : "main.cpp";
            const compileProcess = spawn("g++", ["-fsyntax-only", "-fdiagnostics-format=json",path.join(filePath, codeFile || "main.cpp") ], {
                windowsHide: true,
                detached: true,
            });
            let buffer = '';
            compileProcess.stdout.on('data', data => {
                
                buffer += data.toString()
            })

            compileProcess.stderr.on('data', data => {
                
                buffer += data.toString()
            })

            compileProcess.on('close', (code)=> {
                    resolve(buffer.replace('compilation terminated.','')) // TODO check how to fix this, maybe remove it directly from stderr
            })
        })

        
    
    }

}
 class CPPDebugger extends DebugProcess
    {
        // sendCommand: (command: string) => void = (command) => {

        //     this.process.stdin?.write(command+'\n');
        // }
        
        // addDataListener: (onDataFunc: typeof this.onResponse) => void = (func) => {
        //     console.log('ADDED DATA LISTENER')
        //     this.removeDataListener(func)
        //     this.process.stdout?.on("data", func);
        // }
        // removeDataListener: (onDataFunc: typeof this.onResponse) => void = (func) => {

        //     this.process.stdout?.off("data", func);
        // }
        // kill: (code) => void = (code) => {
        //     this.process.kill(code)
        //     this.killed = true
        //     this.clientSession.replicateFunction((clientWs, id, clientObj) => {
        //         clientObj.sendMessage({type: WebSocketMessageType.Debug, state: "end", code});  // Send GDB output to the client
        //     });
        // };
        // addListener: (ev: any, func: (code: any) => void) => void 
        // = function (ev, func) {
        //     switch (ev) 
        //     { 
        //         case 'close':
        //             this.process.addListener(ev, func)
        //     }
        //     return func
        // }

        sendCommand: (command: string) => void = (command) => {

            this.process.write(command+' \n')
        }
        
        addDataListener: (onDataFunc: (data: string) => void) => void = (func) => {
            console.log('ADDED DATA LISTENER')
            // this.removeDataListener(func)
            this.dataListeners.set(func, this.process.onData(func))
        }

        removeDataListener = (func) => {

            this.dataListeners.get(func).dispose()
        }

        kill: (code) => void = (code) => {
            this.process.kill(code)
            this.killed = true
            this.clientSession.replicateFunction((clientWs, id, clientObj) => {
                clientObj.sendMessage({type: WebSocketMessageType.Debug, state: "end", code});  // Send GDB output to the client
            });
        };

        addListener: (ev: any, func: (code: any) => void) => void 
        = (function (this:CPPDebugger, ev, func) {
            switch (ev) 
            { 
                case 'close':
                    this.process.onExit(func)
            }
            return func
        }).call(this)

        process: nodepty.IPty
        clientSession: EditorSession
        private dataListeners = new Map<Function, nodepty.IDisposable>()
        constructor(res, clientObj:ClientObject, clientSession: EditorSession) {
            super()
            this.clientSession = clientSession;
            
            
            
                if(!nodepty)
                    throw 'invalid pty module'
                 this.process = nodepty.spawn("docker", ["exec", '-it', res.imageName, "gdb","-q",  "-interpreter=mi", res.fileName.split('.')[0]],
                {
                    cwd: './clientFiles'
                })
                // this.process = spawn("docker", ["exec", '-i', res.imageName, "gdb","-q",  "-interpreter=mi", "tty ./input" res.fileName.split('.')[0]], {stdio: 'pipe'}); //"-ex", "set pagination off", 
                console.log('Spawned debug process with id', this.process.pid)

                clientSession.replicateFunction((clientWs, id, clientObj) => {
                    clientObj.sendMessage({type: WebSocketMessageType.Debug, state: "start"});  // Send GDB output to the client
                });

                this.process.onData((data) => console.log(data))
            
           

            
        }
    }

export default CppMode


