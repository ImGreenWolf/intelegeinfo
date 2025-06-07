import { spawn } from "child_process";
import EditorMode from "./BaseEditorMode";

class Python extends EditorMode {

    name = 'Python'
    dockerSafeTag: string = 'py'
    extension = ['py']
    isInterpreter = true;
    dockerFile = 
    `
    # install from python image
    FROM python:3

    # Set working directory inside container
    WORKDIR /app
    # Default command can be overridden
    CMD [ "bash" ]`.trim();


    execute(res) {
        return spawn('docker', ['exec', "-i", res.imageName, "bash","-c", "python " + res.fileName], {
                stdio: 'pipe'  // pipe gives you access to stdin, stdout, stderr
            });
    }
    compile() {
        return;
    }


}


export default Python

