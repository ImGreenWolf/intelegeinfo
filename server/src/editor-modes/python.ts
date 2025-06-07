import { ChildProcess, execSync, spawn } from "child_process";
import EditorMode from "./BaseEditorMode";
import path from "path";
import { rootDirName } from "../server";

class Python extends EditorMode {

    name = 'Python'
    dockerSafeTag: string = 'py'
    extension = ['py']
    isInterpreter = true;
    dockerFile = 
    // `
    // # install from python image
    // FROM python:3

    // # Set working directory inside container
    // WORKDIR /app
    // # Default command can be overridden
    // CMD [ "bash" ]`.trim();
    `FROM python:3.10

RUN apt-get update && apt-get install -y \
    xvfb x11vnc fluxbox python3-tk wget && apt-get clean


CMD bash ` 
// -c "\
//     Xvfb :1 -screen 0 1024x768x16 & \
//     export DISPLAY=:1 && fluxbox & \
//     python3 gui_app.py & \
//     x11vnc -display :1 -rfbport 5900 -rfbunixpath /vnc/vnc.sock -forever -nopw -shared"`.trim()






    async execute(res) {
        //  Xvfb :1 -screen 0 1024x768x16
        //   export DISPLAY=:1
        return spawn('docker', ['exec', "-i", res.imageName, "bash","-c", "python clientFiles/" + res.fileName], {
            stdio: 'pipe',  // pipe gives you access to stdin, stdout, stderr
            env: {DISPLAY: ':1'}
        });
                 
        return;
        
    }
    compile() {
        return;
    }

    onSpawn(sessionObj) {

        // Start websockify
        const wsProxy = spawn('websockify', [
        '--web', path.join(rootDirName, 'vnc', 'noVNC'),
        '--unix-target', `/tmp/vnc-${sessionObj.sessionId}/vnc.sock`, '8080'
        ]);
        console.log(`/tmp/vnc-${sessionObj.sessionId}/vnc.sock`)

        wsProxy.stdout.on('data', (data) => console.log(data.toString()));
    }


}


export default Python

