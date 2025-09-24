import { ChildProcess, exec, execSync, spawn } from "child_process";
import EditorMode, { executeOptions } from "./BaseEditorMode";
import path from "path";
import { rootDirName } from "../server";
import * as fs from 'fs'
import { ClientObject, EditorFile, EditorSession } from "../types";
import { WebSocketMessageType } from '../../../dist/shared/types';
import * as Nodepty from "node-pty"

class Python extends EditorMode {

    static name = 'Python'
    static logoSrc: string = 'python-logo.webp';
    static description: string = `Simplu și ușor de învățat, ideal pentru web, AI și automatizare.
Avantaje: Sintaxă clară, multe biblioteci, comunitate mare.`;
    static color: string = 'linear-gradient(145deg, #4B8BBE, #FFD43B)'
    static versions

    static dockerSafeTag: string = 'py'
    static extension = ['py']
    wsProxy: ChildProcess
    isInterpreter = true;
    hasGUI = false;
    runParams = (clientObj: ClientObject) => {
      this.hasGUI = clientObj.openFileName[0].toLowerCase().includes("gui")
      let buffer = '';
      if(clientObj.webcamid)
        buffer += `--device=/dev/video${clientObj.webcamid}:/dev/video0`
      if(this.hasGUI)
      return buffer+ ` -v "/tmp/vnc-${clientObj.sessionId}:/app/vnc"`
      else 
      return ""
    }
    static defaultText: string =
    `#    Compilator Python online | intelegeinfo.ro

x = input("Scrie ceva: ")

print("Intelege Info: " + x)`
    static dockerFile = 
    // `
    // # install from python image
    // FROM python:3

    // # Set working directory inside container
    // WORKDIR /app
    // # Default command can be overridden
    // CMD [ "bash" ]`.trim();
    `FROM python:3
    WORKDIR /app
    RUN apt-get update && apt-get install -y \
    xvfb x11vnc fluxbox python3-tk wget python3-opencv && apt-get clean
    RUN pip install opencv-python ultralytics numpy
    
CMD bash ` 

    vcam: ChildProcess
// -c "\
//     Xvfb :1 -screen 0 1024x768x16 & \
//     export DISPLAY=:1 && fluxbox & \
//     python3 gui_app.py & \
//     x11vnc -display :1 -rfbport 5900 -rfbunixpath /vnc/vnc.sock -forever -nopw -shared"`.trim()




async onBuild(res, clientSession: EditorSession, clientObj: ClientObject): Promise<number> {
  return new Promise((resolve) => {
        console.log('spawn gui')
        const proc = spawn('docker', ['exec', '-i', '-e', 'DISPLAY=:1', res.imageName, 'sh', '-c', `
      # Use the mounted vnc directory (relative to /app workdir)
      VNC_SOCK="vnc/vnc.sock"
      Xvfb :1 -screen 0 640x480x16 -ac +extension GLX +render -noreset &
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
                try {

                  //  TODO create a global webosckify instance for all connections, not attempt
                  // to create one for each editor session, it wont work anyways
             this.wsProxy = spawn('websockify', [
            '--web', path.join(rootDirName, 'vnc', 'noVNC'),
            '--token-plugin=TokenFile',
            '--token-source='+path.resolve('/tmp/tokens.txt'),
            '--unix-target', `/tmp/vnc-${clientSession.sessionId}/vnc.sock`, 
            '--cert', process.env.FULLCHAINPATH,
            '--key', process.env.PRIVKEYPATH,
            '8080'
            
            
            ], {stdio: 'pipe'});

            this.wsProxy.stdout.on('data', (data) => {
            console.log('[ws stdout]', data.toString());
            });

            this.wsProxy.stderr.on('data', (data) => {
            console.error('[ws stderr]', data.toString());
            });

            this.wsProxy.on('exit', (code) => {
            console.log(`[ws exit] Process exited with code ${code}`);
            });
                try {
                    fs.accessSync(`/tmp/vnc-${clientSession.sessionId}/vnc.sock`)
                }catch(err)
                {
                  console.log("Cant acesss socket: " + err)
                }



                }
                catch(err)
                {
                  console.warn(err)
                }




              
              
            }, 3000);
        } else
        pid = parseInt(data);

            if( clientObj.webcamid)
            {
              this.vcam = spawn('python3', ['camera.py'], {stdio: 'pipe', env: {INDEX: clientObj.webcamid.toString()}})

            
                this.vcam.stdout.on('data', (data) => {
              console.log('[this.vcam stdout]', data.toString());
              });

              this.vcam.stderr.on('data', (data) => {
              console.error('[this.vcam stderr]', data.toString());
              });

              this.vcam.on('exit', (code) => {
              console.log(`[this.vcam exit] Process exited with code ${code}`);
              });
            }
           
        })


          setTimeout(() => {
            resolve(proc.pid || 0)
        }, 60000);

      })
}

  receiveWebCam(rawData)
  {
    if(this.vcam)
      if (this.vcam.stdin.writable) {
        const data = Buffer.from(rawData, 'base64');
        const length = Buffer.alloc(4);
        length.writeUInt32BE(data.length, 0);
        this.vcam.stdin.write(length);
        this.vcam.stdin.write(data);
      }
  }
    async execute(res, clientObj: ClientObject, sessionObj: EditorSession) {
        //  Xvfb :1 -screen 0 1024x768x16
        //   export DISPLAY=:1
        // execSync('docker exec -i '+res.imageName + ' sh -c "pip install opencv-python"')
         
        const proc = Nodepty.spawn('docker', ['exec', "-i", '-e', 'DISPLAY=:1', res.imageName, "sh","-c","(cd ./clientFiles && python -u "+ res.fileName + ")"], executeOptions);
        if(sessionObj && this.hasGUI)
           sessionObj.replicateFunction((ws,id, obj) => obj.sendMessage({status: 'spawnGUI'}, WebSocketMessageType.ExecuteStatus))

        // proc.addListener('close', code => {
        //   if(this.wsProxy)
        //     this.wsProxy.kill()
        // })

        return proc;
       
    }

    directExecute(res: any, clientObj: any, sessionObj: any) {
      return spawn('docker', ['exec', "-i", '-e', 'DISPLAY=:1', res.imageName, "sh","-c","(cd ./clientFiles && python -u "+ res.fileName + ")"], {
            stdio: 'pipe',  // pipe gives you access to stdin, stdout, stderr
        });
    }
    compile(res) {
      //  setTimeout(() => {
      //    return spawn('docker', ['exec', "-i", '-e', 'DISPLAY=:1', res.imageName, "sh","-c","pip install opencv-python"], {
      //        stdio: 'pipe',  // pipe gives you access to stdin, stdout, stderr
      //    });
      //  }, 500);
    }

    onSpawn(sessionObj) {

    
    }


}


export default Python

