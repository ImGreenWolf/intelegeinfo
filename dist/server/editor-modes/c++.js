"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const BaseEditorMode_1 = __importStar(require("./BaseEditorMode"));
const path_1 = __importDefault(require("path"));
const ProcessTypes_1 = __importDefault(require("./ProcessTypes"));
const types_1 = require("../../../dist/shared/types");
const nodepty = __importStar(require("node-pty"));
class CppMode extends BaseEditorMode_1.default {
    static name = 'C++';
    static logoSrc = 'c++-logo.png';
    static description = `Limbaj rapid și puternic, folosit la jocuri, sisteme și aplicații complexe.
Avantaje: Viteză mare, control total, folosit în industrie.`;
    static color = '#659AD2';
    static extension = ['cpp', 'c++'];
    static dockerSafeTag = 'cpp';
    static defaultText = `//    Compilator C++ online | intelegeinfo.ro

#include <iostream>

using namespace std;

int main() {
    
    cout << "Intelege info" << endl;
    
    return 0;

}`;
    static dockerFile = `
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
    constructor() {
        super();
    }
    execute(res) {
        // execSync('docker exec -i ' + res.imageName + ' bash -c "ls"', {stdio: 'inherit'})
        return nodepty.spawn('docker', ['exec', "-it", res.imageName, "bash", "-c", `(cd ./clientFiles && exec ../${res.fileName.split('.')[0]})`], BaseEditorMode_1.executeOptions);
    }
    directExecute(res) {
        return (0, child_process_1.spawn)('docker', ['exec', "-i", res.imageName, "bash", "-c", `(cd ./clientFiles && exec ../${res.fileName.split('.')[0]})`], {
            stdio: 'pipe' // pipe gives you access to stdin, stdout, stderr
        });
    }
    compile(res, file, isDebugging = false) {
        return new Promise((resolve, reject) => {
            try {
                const compile = (0, child_process_1.spawn)(`docker`, ['exec', res.imageName, 'bash', '-c', `g++ ${isDebugging ? '-g' : ""} -O0 clientFiles/${res.fileName} -o ${res.fileName.split('.')[0]}`], { stdio: 'pipe' });
                let buffer = '';
                compile.stdout.on('data', chunk => {
                    const data = chunk.toString();
                    buffer += data;
                    // this.sendError(data)
                });
                compile.stderr.on('data', chunk => {
                    const data = chunk.toString();
                    buffer += data;
                    // this.sendError(data, true)
                });
                compile.on('close', code => {
                    if (code == 0)
                        resolve();
                    else {
                        this.sendError(buffer, true);
                        //  reject(code + ": " + buffer, true)
                    }
                });
            }
            catch (err) {
                this.sendError(err);
            }
        });
    }
    startDebugging(res, clientObj, clientSession) {
        return new CPPDebugger(res, clientObj, clientSession);
    }
    checkCodeSyntax = (sessionObj, file) => {
        return new Promise((resolve, reject) => {
            const filePath = sessionObj.getClientFilesPath(); //            path.join(rootDirName, "cache", sessionId);
            const codeFile = !["cpp"].includes(path_1.default.extname(file.name || "main.cpp")) ? file.name : "main.cpp";
            const compileProcess = (0, child_process_1.spawn)("g++", ["-fsyntax-only", "-fdiagnostics-format=json", path_1.default.join(filePath, codeFile || "main.cpp")], {
                windowsHide: true,
                detached: true,
            });
            let buffer = '';
            compileProcess.stdout.on('data', data => {
                buffer += data.toString();
            });
            compileProcess.stderr.on('data', data => {
                buffer += data.toString();
            });
            compileProcess.on('close', (code) => {
                resolve(buffer.replace('compilation terminated.', '')); // TODO check how to fix this, maybe remove it directly from stderr
            });
        });
    };
}
class CPPDebugger extends ProcessTypes_1.default {
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
    sendCommand = (command) => {
        this.process.write(command + ' \n');
    };
    sendProgramInput = (command) => {
        this.process.write(command);
    };
    addDataListener = (func) => {
        console.log('ADDED DATA LISTENER');
        // this.removeDataListener(func)
        this.dataListeners.set(func, this.process.onData(func));
    };
    removeDataListener = (func) => {
        if (this.dataListeners.has(func))
            this.dataListeners.get(func).dispose();
    };
    kill = (code) => {
        this.process.kill(code);
        this.killed = true;
        this.clientSession.replicateFunction((clientWs, id, clientObj) => {
            clientObj.sendMessage({ type: types_1.WebSocketMessageType.Debug, state: "end", code }); // Send GDB output to the client
        });
    };
    addListener = function (ev, func) {
        switch (ev) {
            case 'close':
                this.process.onExit(func);
        }
        return func;
    };
    process;
    clientSession;
    inputTerminal;
    dataListeners = new Map();
    constructor(res, clientObj, clientSession) {
        super();
        this.clientSession = clientSession;
        this.inputTerminal = nodepty.spawn("docker", [
            "exec", "-it", res.imageName, 'bash'
        ], BaseEditorMode_1.executeOptions);
        if (!nodepty)
            throw 'invalid pty module';
        this.process = nodepty.spawn("docker", ["exec", '-it', res.imageName, "gdb", "-q", "-interpreter=mi", res.fileName.split('.')[0]], {
            // cwd: './clientFiles'
            handleFlowControl: true,
        });
        this.sendCommand('-break-insert 1');
        this.sendCommand('-exec-run');
        // this.inputTerminal.write('tty\n\r')
        // let loaded= false
        // this.inputTerminal.onData((data) => {
        //     if(loaded)
        //         if(data.includes('to set controlling terminal') || data.includes('/app#') || (data.includes('not found') && data.includes('bash')))
        //             return;
        //         else
        //             return clientSession.replicateFunction((clientWs, id, clientObj) => {
        //                 clientObj.sendMessage({type: WebSocketMessageType.Console, messageType: ConsoleMessageType.Debug, body: data, data});  // Send GDB output to the client
        //             });
        //     else if(!data.toString().includes('/dev/'))
        //         return;
        //     console.log('tty:', data.toString())
        //     this.sendCommand('set inferior-tty ' +data.toString())
        //     this.sendCommand('-break-insert 1')
        //     this.sendCommand('-exec-run')
        //     loaded=true
        // })
        this.process.onData((data) => {
            let buffer = '';
            for (const row of data.split('\n'))
                if (row && !['^', '*', '=', '&', '-'].includes(row.trim()[0]) && row != '(gdb)')
                    buffer += row + '\n';
            clientSession.replicateFunction((clientWs, id, clientObj) => {
                clientObj.sendMessage({ type: types_1.WebSocketMessageType.Console, messageType: types_1.ConsoleMessageType.Debug, body: buffer, data: buffer }); // Send GDB output to the client
            });
        });
        // this.inputTerminal.onExit((e) => {
        //     console.error('TTY EXITED WITH CODE', e)
        // })
        // this.process.onExit((code) => {
        //     this.inputTerminal.kill()
        // })
        // this.process = spawn("docker", ["exec", '-i', res.imageName, "gdb","-q",  "-interpreter=mi", "tty ./input" res.fileName.split('.')[0]], {stdio: 'pipe'}); //"-ex", "set pagination off", 
        console.log('Spawned debug process with id', this.process.pid);
        clientSession.replicateFunction((clientWs, id, clientObj) => {
            clientObj.sendMessage({ type: types_1.WebSocketMessageType.Debug, state: "start" }); // Send GDB output to the client
        });
        // this.process.onData((data) => console.log(data))
    }
}
exports.default = CppMode;
