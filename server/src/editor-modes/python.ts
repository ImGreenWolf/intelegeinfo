import { ChildProcess, exec, execSync, spawn } from "child_process";
import EditorMode from "./BaseEditorMode";
import path from "path";
import { rootDirName } from "../server";
import * as fs from 'fs'
import { EditorSession } from "../types";
class Python extends EditorMode {

    name = 'Python'
    dockerSafeTag: string = 'py'
    extension = ['py']
    isInterpreter = false;
    runParams = '--device=/dev/video10'
    dockerFile = 
    // `
    // # install from python image
    // FROM python:3

    // # Set working directory inside container
    // WORKDIR /app
    // # Default command can be overridden
    // CMD [ "bash" ]`.trim();
    `FROM python:3.10
    WORKDIR /app
    RUN apt-get update && apt-get install -y \
    xvfb x11vnc fluxbox python3-tk wget python3-opencv && apt-get clean


CMD bash ` 
// -c "\
//     Xvfb :1 -screen 0 1024x768x16 & \
//     export DISPLAY=:1 && fluxbox & \
//     python3 gui_app.py & \
//     x11vnc -display :1 -rfbport 5900 -rfbunixpath /vnc/vnc.sock -forever -nopw -shared"`.trim()




async onBuild(res, clientSession: EditorSession): Promise<number> {
  return new Promise((resolve) => {
        console.log('spawn gui')
        const proc = spawn('docker', ['exec', '-i', '-e', 'DISPLAY=:1', res.imageName, 'sh', '-c', `
      # Use the mounted vnc directory (relative to /app workdir)
      VNC_SOCK="vnc/vnc.sock"

      Xvfb :1 -screen 0 1024x768x16 -ac +extension GLX +render -noreset &
      XVFB_PID=$!
      
      # Wait for Xvfb to be ready
      for i in \$(seq 1 10); do
        if xdpyinfo -display :1 >/dev/null 2>&1; then

          break
        fi
        sleep 1
      done

      x11vnc -display :1 -unixsock "\$VNC_SOCK" -nopw -forever -shared &
      X11VNC_PID=$! &
      echo $X11VNC_PID

      # Wait for socket creation

      for i in \$(seq 1 15); do
        if [ -S "\$VNC_SOCK" ]; then

          break
        fi
        sleep 1
        if [ \$i -eq 10 ] || [ \$i -eq 20 ]; then
          echo "[DEBUG] Still waiting... (attempt \$i/30)"
          ls -la vnc/ 2>/dev/null || echo "vnc directory not accessible"
        fi
      done

      sleep 2
    `], {
        stdio: 'pipe'
    });
    let pid=0;

    proc.on('close', err => {
      console.log('finally stopped')
      resolve(pid==0 ? pid : proc.pid)
    })

    proc.stdout.on('data', (data: string) => {
        console.log("VNC SERVER: " + data.toString())
        if(data.includes('PORT')) {
          fs.appendFileSync(path.resolve('/tmp/tokens.txt'), `${clientSession.sessionId}: unix_socket:/tmp/vnc-${clientSession.sessionId}/vnc.sock \ \n`)
        setTimeout(() => {
                // Start websockify
            const wsProxy = spawn('websockify', [
            '--web', path.join(rootDirName, 'vnc', 'noVNC'),
            '--token-plugin=TokenFile',
            '--token-source='+path.resolve('/tmp/tokens.txt'),
            '--unix-target', `/tmp/vnc-${clientSession.sessionId}/vnc.sock`, 
            '8080'
            
            
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
                    fs.accessSync(`/tmp/vnc-${clientSession.sessionId}/vnc.sock`)
                }catch(err)
                {
                  console.log("Cant acesss socket: " + err)
                }
            }, 3000);
        } else
        pid = parseInt(data);
        
        })


          setTimeout(() => {
          resolve(proc.pid || 0)
        }, 60000);

      })
}

    async execute(res) {
        //  Xvfb :1 -screen 0 1024x768x16
        //   export DISPLAY=:1
        return spawn('docker', ['exec', "-i", '-e', 'DISPLAY=:1', res.imageName, "sh","-c","python clientFiles/" + res.fileName], {
            stdio: 'pipe',  // pipe gives you access to stdin, stdout, stderr
        });

       
    }
    compile(res) {
       setTimeout(() => {
         return spawn('docker', ['exec', "-i", '-e', 'DISPLAY=:1', res.imageName, "sh","-c","pip install opencv-python"], {
             stdio: 'pipe',  // pipe gives you access to stdin, stdout, stderr
         });
       }, 500);
    }

    onSpawn(sessionObj) {

    
    }


}


export default Python

