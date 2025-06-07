"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const BaseEditorMode_1 = __importDefault(require("./BaseEditorMode"));
class CppMode extends BaseEditorMode_1.default {
    name = 'C++';
    extension = ['cpp', 'c++'];
    dockerFile = `
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
}
exports.default = CppMode;
