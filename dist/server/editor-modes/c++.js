"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const BaseEditorMode_1 = __importDefault(require("./BaseEditorMode"));
const path_1 = __importDefault(require("path"));
class CppMode extends BaseEditorMode_1.default {
    static name = 'C++';
    static extension = ['cpp', 'c++'];
    static dockerSafeTag = 'cpp';
    static defaultText = `//    Compilator C++ online | intelegeinfo.go.ro

#include <iostream>

using namespace std;

int main()
{
    
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
        (0, child_process_1.execSync)('docker exec -i ' + res.imageName + ' bash -c "ls"');
        return (0, child_process_1.spawn)('docker', ['exec', "-i", '-w', '/clientFiles', res.imageName, "bash", "-c", `./${res.fileName.split('.')[0]}`], {
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
                    this.sendError(data);
                });
                compile.stderr.on('data', chunk => {
                    const data = chunk.toString();
                    buffer += data;
                    this.sendError(data, true);
                });
                compile.on('close', code => {
                    if (code == 0)
                        resolve();
                    else {
                        //  this.sendError(buffer, true)
                        reject(code + ": " + buffer);
                    }
                });
            }
            catch (err) {
                this.sendError(err);
            }
        });
    }
    startDebugging(res) {
        return (0, child_process_1.spawn)("docker", ["exec", res.imageName, "gdb", "-q", "-interpreter=mi", res.fileName.split('.')[0]], { stdio: 'pipe' }); //"-ex", "set pagination off", 
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
                if (code != 1)
                    reject(code + "\n" + buffer);
                else
                    resolve(buffer);
            });
        });
    };
}
exports.default = CppMode;
