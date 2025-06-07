import { ChildProcess, execSync, spawn } from "child_process";
import EditorMode from "./BaseEditorMode";
import path from "path";
import { rootDirName } from "../server";
import * as fs from 'fs'
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
        // return spawn('docker', ['exec', "-i", res.imageName, "sh","-c",
        //      "Xvfb :1 -screen 0 1024x768x16 && sleep 1 && export DISPLAY=:1 && python clientFiles/" + res.fileName +
        //       " & x11vnc -display :1 -rfbunixpath /vnc/vnc.sock -forever -nopw -shared && echo 'started'"], {
        //     stdio: 'pipe',  // pipe gives you access to stdin, stdout, stderr
        //     env: {DISPLAY: ':1'}
        // });

        const proc = spawn('docker', ['exec', '-i', res.imageName, 'sh', '-c', `
  echo "[INFO] Starting Xvfb..." &&
  Xvfb :1 -screen 0 1024x768x16 &
  sleep 2 &&
  ps aux | grep Xvfb &&
  echo "[INFO] Starting x11vnc..." &&
  export DISPLAY=:1 &&
  x11vnc -display :1 -rfbunixpath ../vnc/vnc.sock -nopw -forever -shared &
  python clientFiles/${res.fileName} &
  echo "[INFO] Started successfully"
`], {
    stdio: 'pipe',  // pipe gives you access to stdin, stdout, stderr
    env: {...process.env, DISPLAY: ':1'}
});

proc.stdout.on('data', (data) => {
  console.log('[stdout]', data.toString());
});

proc.stderr.on('data', (data) => {
  console.error('[stderr]', data.toString());
});

proc.on('exit', (code) => {
  console.log(`[exit] Process exited with code ${code}`);
});
        return proc;         
    }
    compile() {
        return;
    }

    onSpawn(sessionObj) {

        


        setTimeout(() => {
            // Start websockify
        const wsProxy = spawn('websockify', [
        '--web', path.join(rootDirName, 'vnc', 'noVNC'),
        '--unix-target', `/tmp/vnc-${sessionObj.sessionId}/vnc.sock`, '8080'
        ], {stdio: 'pipe'});

        wsProxy.stdout.on('data', (data) => {
        console.log('[ws stdout]', data.toString());
        });

        wsProxy.stderr.on('data', (data) => {
        console.error('[ws stderr]', data.toString());
        });

        wsProxy.on('exit', (code) => {
        console.log(`[ws exit] Process exited with code ${code}`);
        });
            try {
                fs.accessSync(`/tmp/vnc-${sessionObj.sessionId}/vnc.sock`)
            }catch(err)
            {
                        console.log("Cant acesss socket: " + err)
            }
        }, 4000);

        // setTimeout(() => {
        //     console.log(fs.readFileSync(`/tmp/vnc-${sessionObj.sessionId}/vnc.sock`).toString())
        // }, 1000);
        // wsProxy.stdout.on('data', (data) => console.log(data.toString()));
    }


}


export default Python

