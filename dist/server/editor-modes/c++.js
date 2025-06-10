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
        return (0, child_process_1.spawn)('docker', ['exec', "-i", res.imageName, "bash", "-c", "./main"], {
            stdio: 'pipe' // pipe gives you access to stdin, stdout, stderr
        });
    }
    compile(res) {
        (0, child_process_1.execSync)(`docker exec ${res.imageName} bash -c "g++ -g -O0 clientFiles/${res.fileName} -o main"`);
    }
    startDebugging(res) {
        return (0, child_process_1.spawn)("docker", ["exec", res.imageName, "gdb", "-q", "-interpreter=mi", 'main'], { stdio: 'pipe' }); //"-ex", "set pagination off", 
    }
    checkCodeSyntax(sessionObj, file) {
        return new Promise((resolve, reject) => {
            const exeFile = sessionObj.getClientFilesPath();
            const filePath = path_1.default.join(exeFile, "clientFiles"); //            path.join(rootDirName, "cache", sessionId);
            const codeFile = !["cpp"].includes(path_1.default.extname(file.name || "main.cpp")) ? file.name : "main.cpp";
            const compileProcess = (0, child_process_1.spawn)("g++", ["-fsyntax-only", "-fdiagnostics-format=json", path_1.default.join(filePath, codeFile || "main.cpp")], {
                windowsHide: true,
                detached: true,
            });
            compileProcess.stdout.on('data', data => {
                reject(data.toString());
            });
            compileProcess.stderr.on('data', data => {
                resolve(data.toString());
            });
            compileProcess.on('close', (code) => {
                if (code != 0)
                    reject(code);
            });
        });
    }
}
exports.default = CppMode;
