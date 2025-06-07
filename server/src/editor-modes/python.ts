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

const proc = spawn('docker', ['exec', '-i', '-e', 'DISPLAY=:1', res.imageName, 'sh', '-c', `
  # Create the vnc directory and socket path
  VNC_SOCK="/vnc/vnc.sock"
  
  echo "[INFO] Starting Xvfb on display :1..."
  Xvfb :1 -screen 0 1024x768x16 -ac +extension GLX +render -noreset &
  XVFB_PID=$!
  
  # Wait for Xvfb to be ready (up to 10 seconds)
  echo "[INFO] Waiting for Xvfb to be ready..."
  for i in \$(seq 1 10); do
    if xdpyinfo -display :1 >/dev/null 2>&1; then
      echo "[INFO] Xvfb is ready on display :1"
      break
    fi
    echo "[INFO] Waiting for Xvfb... (\$i/10)"
    sleep 1
  done
  
  # Final check
  if ! xdpyinfo -display :1 >/dev/null 2>&1; then
    echo "[ERROR] Xvfb failed to start properly"
    exit 1
  fi
  
  echo "[INFO] Starting x11vnc..."
  x11vnc -display :1 -rfbunixpath "\$VNC_SOCK" -nopw -forever -shared -bg
  
  # Wait for VNC socket to be created
  echo "[INFO] Waiting for VNC socket..."
  for i in \$(seq 1 10); do
    if [ -S "\$VNC_SOCK" ]; then
      echo "[INFO] VNC socket created at \$VNC_SOCK"
      break
    fi
    echo "[INFO] Waiting for VNC socket... (\$i/10)"
    sleep 1
  done
  
  if [ ! -S "\$VNC_SOCK" ]; then
    echo "[ERROR] VNC socket was not created"
    exit 1
  fi
  
  echo "[INFO] Starting Python application..."
  python clientFiles/${res.fileName} &
  PYTHON_PID=$!
  
  echo "[INFO] All services started successfully"
  echo "[INFO] VNC Socket: \$VNC_SOCK"
  
  # Keep the container running
  wait \$PYTHON_PID
`], {
    stdio: 'pipe'
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

