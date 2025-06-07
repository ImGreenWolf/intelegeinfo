import { execSync, spawn } from "child_process";
import EditorMode from "./BaseEditorMode";

class CppMode extends EditorMode {

    name = 'C++'
    extension: string[] = ['cpp', 'c++'];
    dockerSafeTag: string = 'cpp'
    dockerFile = 
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
         return spawn('docker', ['exec', "-i", res.imageName, "bash","-c", "./main"], {
            stdio: 'pipe'  // pipe gives you access to stdin, stdout, stderr
        });
    }

    compile(res) {
        execSync(`docker exec ${res.imageName} bash -c "g++ -g -O0 clientFiles/${res.fileName} -o main"`)
    }


}


export default CppMode


