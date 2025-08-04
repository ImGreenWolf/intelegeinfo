import { ChildProcess, execSync, spawn } from "child_process";
import EditorMode from "./BaseEditorMode";
import { EditorFile, EditorSession } from "../types";
import path from "path";
import DebugProcess from "./ProcessTypes";
class CppMode extends EditorMode {

    static name = 'C++'
    static logoSrc: string = 'c++-logo.png'
    static description: string = 'nothing yet'


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

    startDebugging(res, clientObj) {
        return new CPPDebugger(res, clientObj)
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
        sendCommand: (command: string) => void = (command) => {

            this.process.stdin?.write(command+'\n');
        }
        
        onResponse: (response) => void;
        addDataListener: (onDataFunc: typeof this.onResponse) => void = (func) => {

            this.process.stdout?.addListener("data", func);
        }
        removeDataListener: (onDataFunc: typeof this.onResponse) => void = (func) => {

            this.process.stdout?.removeListener("data", func);
        }
        kill: () => void;
        addListener: (ev: any, func: (code: any) => void) => void 
        = function (ev, func) {
            switch (ev) 
            { 
                case 'close':
                    process.addListener(ev, func)
            }
            return func
        }
        process: ChildProcess

        constructor(res, clientObj) {
            super()

            this.process = spawn("docker", ["exec", '-i', res.imageName, "gdb","-q",  "-interpreter=mi", res.fileName.split('.')[0]], {stdio: 'pipe'}); //"-ex", "set pagination off", 
            console.log('Spawned debug process with id', this.process.pid)
            
        }
    }

export default CppMode


