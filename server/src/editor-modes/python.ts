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
  
  # Wait for Xvfb to be ready
  echo "[INFO] Waiting for Xvfb to be ready..."
  for i in \$(seq 1 10); do
    if xdpyinfo -display :1 >/dev/null 2>&1; then
      echo "[INFO] Xvfb is ready on display :1"
      break
    fi
    echo "[INFO] Waiting for Xvfb... (\$i/10)"
    sleep 1
  done
  
  # Check if Xvfb is actually working
  if ! xdpyinfo -display :1 >/dev/null 2>&1; then
    echo "[ERROR] Xvfb failed to start properly"
    exit 1
  fi
  
  echo "[DEBUG] Directory permissions:"
  ls -la /tmp/vnc/
  
  echo "[INFO] Starting x11vnc with verbose output..."
  echo "[DEBUG] VNC Socket path: \$VNC_SOCK"
  
  # Start x11vnc with more verbose output and without -bg to see errors
  x11vnc -display :1 -rfbunixpath "\$VNC_SOCK" -nopw -forever -shared -verbose &
  X11VNC_PID=$!
  
  # Give x11vnc time to start
  sleep 3
  
  echo "[DEBUG] Checking if x11vnc process is running:"
  ps aux | grep x11vnc | grep -v grep
  
  echo "[DEBUG] Checking socket creation:"
  ls -la /tmp/vnc/
  
  # Check if socket exists with different approach
  if [ -e "\$VNC_SOCK" ]; then
    echo "[INFO] Socket file exists: \$VNC_SOCK"
    file "\$VNC_SOCK"
  else
    echo "[ERROR] Socket file does not exist: \$VNC_SOCK"
  fi
  
  # Try alternative socket path (maybe x11vnc creates it elsewhere)
  echo "[DEBUG] Searching for any vnc sockets:"
  find /tmp -name "*.sock" -type s 2>/dev/null || echo "No .sock files found"
  find /tmp -name "*vnc*" 2>/dev/null || echo "No vnc files found"
  
  # Check x11vnc logs/errors
  echo "[DEBUG] Checking if x11vnc is still running:"
  if kill -0 \$X11VNC_PID 2>/dev/null; then
    echo "[INFO] x11vnc process is running (PID: \$X11VNC_PID)"
  else
    echo "[ERROR] x11vnc process died"
  fi
  
  echo "[INFO] Starting Python application anyway..."
  python clientFiles/${res.fileName} &
  PYTHON_PID=$!
  
  echo "[INFO] Keeping container alive for debugging..."
  sleep 30
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

