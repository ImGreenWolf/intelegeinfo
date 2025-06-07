import { spawn } from "child_process";
import EditorMode from "./BaseEditorMode";

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
    `FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    xvfb x11vnc fluxbox python3-tk wget && apt-get clean

# Install your Python GUI
COPY gui_app.py .

CMD bash -c "\
    Xvfb :1 -screen 0 1024x768x16 & \
    export DISPLAY=:1 && fluxbox & \
    python3 gui_app.py & \
    x11vnc -display :1 -rfbport 5900 -rfbunixpath /vnc/vnc.sock -forever -nopw -shared"`.trim()






    execute(res) {
        return spawn('docker', ['exec', "-i", res.imageName, "bash","-c", "python clientFiles/" + res.fileName], {
                stdio: 'pipe'  // pipe gives you access to stdin, stdout, stderr
            });
    }
    compile() {
        return;
    }

    onSpawn() {

        // Start websockify
        const wsProxy = spawn('websockify', [
        '--unix-target', '/tmp/vnc/vnc.sock', '6081'
        ]);

        wsProxy.stdout.on('data', (data) => console.log(data.toString()));
    }


}


export default Python

