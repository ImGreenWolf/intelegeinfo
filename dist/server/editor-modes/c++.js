"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const BaseEditorMode_1 = __importDefault(require("./BaseEditorMode"));
const path_1 = __importDefault(require("path"));
const ProcessTypes_1 = __importDefault(require("./ProcessTypes"));
const types_1 = require("../../../dist/shared/types");
class CppMode extends BaseEditorMode_1.default {
    static name = 'C++';
    static logoSrc = 'c++-logo.png';
    static description = 'nothing yet';
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
    sendCommand = (command) => {
        this.process.stdin?.write(command + '\n');
    };
    addDataListener = (func) => {
        console.log('ADDED DATA LISTENER');
        this.removeDataListener(func);
        this.process.stdout?.on("data", func);
    };
    removeDataListener = (func) => {
        this.process.stdout?.off("data", func);
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
                process.addListener(ev, func);
        }
        return func;
    };
    process;
    clientSession;
    inferiorProcess;
    constructor(res, clientObj, clientSession) {
        super();
        this.clientSession = clientSession;
        this.process = (0, child_process_1.spawn)("docker", ["exec", '-i', res.imageName, 'pts=$(mktemp -u /dev/pts/XXX) &&', "gdb", "-q", "-interpreter=mi", res.fileName.split('.')[0]], { stdio: 'pipe' }); //"-ex", "set pagination off", 
        console.log('Spawned debug process with id', this.process.pid);
        clientSession.replicateFunction((clientWs, id, clientObj) => {
            clientObj.sendMessage({ type: types_1.WebSocketMessageType.Debug, state: "start" }); // Send GDB output to the client
        });
        // this.inferiorProcess = spawn("docker", ['exec', '-it', res.imageName, 'bash', '-c', "tty"], {stdio: 'pipe'})
        // this.inferiorProcess.on('spawn', () => {
        // })
        this.process.stdin.write("shell tty\n");
        this.process.stdin.write("set inferior-tty /dev/pts/1\n");
        setTimeout(() => {
            (0, child_process_1.spawn)("docker", [
                "exec", "mycontainer",
                "bash", "-c", "echo 'Hello from Node!' > /dev/pts/1"
            ]);
            console.log('wrote output !!!!!!!!!');
        }, 10000);
    }
}
exports.default = CppMode;
