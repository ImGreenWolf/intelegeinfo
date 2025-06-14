import { execSync, spawn } from "child_process";
import EditorMode from "./BaseEditorMode";
import { EditorFile, EditorSession } from "../types";
import path from "path";
import { rootDirName } from "../server";

class CppMode extends EditorMode {

    static name = 'C++'
    static extension: string[] = ['cpp', 'c++'];
    static dockerSafeTag: string = 'cpp'
    static defaultText: string =
    `//    Compilator C++ online | intelegeinfo.go.ro

#include <iostream>

using namespace std;

int main()
{
    
    cout<<"Intelege info";
    
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
         return spawn('docker', ['exec', "-i", res.imageName, "bash","-c", `./${res.fileName.split('.')[0]}`], {
            stdio: 'pipe'  // pipe gives you access to stdin, stdout, stderr
        });
    }

    compile(res, file:EditorFile, isDebugging=false) {
        return new Promise<void>((resolve, reject) => {
            try {
                 const compile = spawn(`docker`, ['exec', res.imageName, 'bash','-c', `g++ ${isDebugging? '-g' : ""} -O0 clientFiles/${res.fileName} -o ${res.fileName.split('.')[0]}`], {stdio: 'pipe'})
                compile.stdout.on('data', chunk => {
                    const data = chunk.toString()
                    this.sendError(data)
                })
                compile.stderr.on('data', chunk => {
                    const data = chunk.toString()
                    this.sendError(data, true)
                })
                compile.on('close', code => {
                    if(code==0)
                        resolve()
                    else 
                    {
                         this.sendError(code.toString(), true)
                         reject(code)
                    }
                        
                })
            }
            catch (err)
            {
                this.sendError(err)
            }
        })
    }

    startDebugging(res) {
        return spawn("docker", ["exec", res.imageName, "gdb","-q",  "-interpreter=mi", res.fileName.split('.')[0]], {stdio: 'pipe'}); //"-ex", "set pagination off", 
    }

      checkCodeSyntax = (sessionObj: EditorSession, file: EditorFile): Promise<string> =>
        {
            return new Promise((resolve, reject) => {
                const exeFile = sessionObj.getClientFilesPath();
                const filePath = path.join(exeFile,"clientFiles");//            path.join(rootDirName, "cache", sessionId);
                const codeFile = !["cpp"].includes(path.extname(file.name|| "main.cpp"))? file.name : "main.cpp";
                const compileProcess = spawn("g++", ["-fsyntax-only", "-fdiagnostics-format=json",path.join(filePath, codeFile || "main.cpp") ], {
                    windowsHide: true,
                    detached: true,
                });
    
                compileProcess.stdout.on('data', data => {
                    
                    reject(data.toString())
                })
    
                compileProcess.stderr.on('data', data => {
                    
                    resolve(data.toString())
                })
    
                compileProcess.on('close', (code)=> {
                    if(code!=0)
                        reject(code)
                })
            })
    
            
        
        }

}


export default CppMode


