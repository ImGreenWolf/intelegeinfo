import express, { NextFunction } from "express";
import fs from "fs";
import { ChildProcess, exec, spawn } from "child_process";
import WebSocket from "ws";
import path from 'path';
import { ConsoleMessageType, WebSocketMessageType } from '../../dist/shared/types'
import { Readable, Writable } from "stream";
import {ClientObject, EditorFile, EditorPermission, EditorSession} from "./types"
import { QRCode } from "qrcode";
import * as qrcode from "qrcode";
import archiver from 'archiver';
// import {RedisStore} from "connect-redis"
// // import {Redis} from "redis"
// import Redis, { Cluster } from 'ioredis';
// import session from "express-session"
// import { v4 as uuidv4 } from 'uuid';
const app = express();
const compression = require('compression')
import SharedStateManager from "./sessionStore"


import problemCreator from './problemCreator.js'
import loginManager from './login.js'
import signupManager from './signup.js'
import profileManager from './profile.js'
import { UUID } from "crypto";
import jwt from "jsonwebtoken"
import cookieParser from 'cookie-parser'
import * as users from './usersManager'
import { router as usersManager } from './usersManager'
import GuideCreator from "./guideCreator"
import { privateKey } from "./login.js";
export const rootDirName = path.resolve("./") //'C:\Users\radub_qd\intelegeinfo')
const publicKeyPem = fs.readFileSync(path.join(rootDirName,'public.pem'), 'utf8') || "supersecretpublickey";;
import crypto from 'crypto';
import bodyParser from 'body-parser';
import * as EditorModes from './editor-modes/'
import Metrics, { wssAPI } from './metrics'
import tx2 from 'tx2';
import { FileManagementCommands } from "../../dist/shared/types";
interface ResponseWRay extends IncomingMessage 
{
    rawBody: Buffer
}
app.use(compression())
app.use(express.json({
    verify: (req, res, buf) => {
        (req as ResponseWRay).rawBody = buf; // Save raw body
    }
}));
app.use('/vnc', express.static(path.join(rootDirName, 'vnc', 'noVNC')));
app.use('/metrics', Metrics)
app.post('/github/onpull', (req, res) => {
    try {
        
        if(!req.body) throw "Empty request body.."
        const signature = req.headers['x-hub-signature'] as string;
        if (!signature) {
            res.status(400).send('No signature');
            return;
        }
        const hmac = crypto.createHmac('sha1', 'info');
        hmac.update((req as unknown as ResponseWRay).rawBody);
        const digest = 'sha1=' + hmac.digest('hex');
        const { commits } = req.body;
        console.log(commits[0].message);
        console.log(digest);
        if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
            const output = execSync('cd ' + rootDirName + ' && git fetch origin && git reset --hard origin/main', {timeout: 2000});
            res.status(200).send('pull succesful! data: ' + output.toString() ? output.toString() : '');
            console.log('pulled! data: ' + output.toString() ? output.toString() : '')
        } else {
            console.log('access forbidden...')
            res.status(401).send('access forbidden...');
        }
    } catch (err) {
        console.error('pull error: ' + err);
         res.status(500).send(err);
    }
   
});


app.use('/client/scripts',express.static(path.join('dist', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use('/editor/codeEditor.js', express.static(path.join(rootDirName,'dist', 'public', 'codeEditor.js')))
app.use('/editor/components', 
    (req, res) => {


        fs.readFile(path.join(rootDirName,'dist', 'public', 'components.js'), (err, data) => {
            const renderer = data.toString()
            let newRender = renderer;

            if(req.cookies.token)
                newRender = newRender.replaceAll(`loggedIn = false`, `loggedIn = true`)
            res.contentType('js').send(newRender)
        })


    })

app.get('/editor/mode_cpp_custom.js', (req, res) => {
    res.sendFile(path.join(rootDirName,'dist', 'public', 'mode_cpp_custom.js'))
})
app.get('/editor/cpp_worker.js', (req, res) => {
    res.sendFile(path.join(rootDirName,'dist', 'public', 'cpp_worker.js'))
})
app.get('/editor/worker-base.js', (req, res) => {
    res.sendFile(path.join(rootDirName,'public', 'ace-builds-master', 'src-noconflict', 'worker-base.js.js'))
})
app.use(express.static("public"));
app.use("/guides", GuideCreator);

const codeMap: Map<number, UUID> = new Map()


app.get('/editor/sharesession', (req, res) => {
    const sessionId = req.query.id as UUID;
    const session = sessionMap[sessionId];
    const link = req.protocol + "://" + req.host+'/editor?session='+sessionId
    if(!sessionId)
    {
        res.status(500).send({error: "session id invalid"})
        return;
    }
    if(session)
    {
        if(session.isPublic) 
        {
            
            res.send({qrsvg: session.qrCode, code: session.joinCode, link})
        }
    }
    
    const code = users.generateCode()
    
    qrcode.toDataURL(link+"&uri_method=qrcode", {errorCorrectionLevel: "low", type: "image/png", margin: 0, width: 100}).then(value => {
        codeMap.set(parseInt(code), sessionId)
        if(session)
        {
            session.joinCode = code;
            session.qrCode = value;
        }

        res.send({qrsvg: value, code, link})
        setTimeout(() => {
            codeMap.delete(parseInt(code))
        }, 60000);
    })
})
app.get('/editor/joinsession', (req, res) => {
    const code = parseInt(req.query.code as string);

    if(codeMap.has(code) && code)
    {
        
        const sessionId = codeMap.get(code);
        if(!sessionMap.get(sessionId).isPublic)
            res.status(403).send("Session hasn't started yet")
        const redirect = '/editor?session='+sessionId
        res.status(200).send({code, redirect})
    }
    else
    {
   
    res.status(500).send({error: "code expired or is invalid"})
    }
   
})
app.post('/editor/startsession/:id', (req, res) => {
    const id: UUID = req.params.id as UUID;
    if(!req.body && !id) res.status(501)
    if(sessionMap.has(id))
    {
        const { chat, codePermission } = req.body

        if(sessionMap.get(id).isPublic)
        {
            sessionMap.get(id).makeSessionPublic(chat==='on' ? true : false, codePermission as EditorPermission)
            res.status(200)
            return;
        }

        sessionMap.get(id).makeSessionPublic(chat==='on' ? true : false, codePermission as EditorPermission)
        res.status(201).send('')
    }
    else {
        res.status(500)
        return;
    }
        
    
})

app.get('/editor/tooltipHints', (req, res) => {

        res.send(JSON.parse(fs.readFileSync(path.join(rootDirName, 'server', 'data','tooltips.json')).toString()))

})
app.get('/editor/tooltipHints/:id', (req, res) => {
    const tooltipid = req.params.id;
    if(!tooltipid)
        res.send(JSON.parse(fs.readFileSync(path.join(rootDirName, 'server', 'data','tooltips.json')).toString()))
    else
        res.send(JSON.parse(fs.readFileSync(path.join(rootDirName, 'server', 'data','tooltips.json')).toString())[tooltipid])
})
app.get('/editor/:session/file/:name', (req, res) => {
        const name = req.params.name;
        const session = req.params.session;
        if(name && session)
        {
            const file = fs.readFileSync(path.join(getClientFilesPath(session), name)).toString()
            if(file.length>50)
                res.send(file.substring(0, 50)+"...")
            else
                res.send(file)
        }
            

    })
app.get('/editor/:session/downloadFiles', (req, res) => {
    const session = req.params.session;
    
    if(!session || !sessionMap.has(session as UUID)) res.status(401).send('Didnt find session.')
  const folderPath = getClientFilesPath(session); // Path to folder to download

  res.setHeader('Content-Disposition', 'attachment; filename=folder.zip');
  res.setHeader('Content-Type', 'application/zip');

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.directory(folderPath, false);
  archive.pipe(res);

  archive.finalize();
});


// app.get('/problem', problemCreator);
app.get('/editor', (req, res) => {
    fs.readFile(path.join(rootDirName, 'public', 'editor.html'), (err,file) => {
        let text;
        const userId  = users.getIdFromJWT(req);
        
        const logged = userId!=undefined;
        if(logged) 
            {
                    users.getUserData(userId as number).then((userdata) => {
                    text = file.toString().replace('#{login}',` <li><button class="share-session" onclick="window.editor.listProjects()" id='listProjects'>Projects</button></li>\n<li><a href='/profile'>Hey <p class='user-name'>${userdata?.username}</p><div class='focus-line'></div></a></li>`)
                    text = text.replace(/\*\{(.*)\}/g, '$1')
                    
                    
                    res.send(text.toString());
                    
                    // for(const match of text.matchAll(/\*{(.*)}/g))
                    // {
                    //     match[1]
                    // }
                })
            }
        else 
        {
            text = file.toString().replace('#{login}','<li><a id="signup" href="../signup">Sign-up</a><a id="login" href="../login">Login</a></li>')
            text = text.replace(/\*\{(.*)\}/g, '')
            res.send(text.toString());
        }
    })

})

app.use(cookieParser());

const privateKeyPem = fs.readFileSync(path.join(rootDirName,'private.pem'), 'utf8');
export function authMiddleware(req, res, next:any, role?:string) {
    // if() return res.status(403).json({ error: 'failed reading cookies' });
    const token = req.cookies.token;

    if (!token)  
    {
        res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = jwt.verify(token, privateKeyPem);
        if(JSON.parse(user as string).role == role || !role)
        // req.user = user;
        next();
    } catch (err) {
        res.clearCookie('token').status(403).json({ error: 'Invalid token' });
    }
}
function handle404(req:any, res:any, next:NextFunction) 
{
    res.status(404);

    if (req.accepts('html')) 
      res.sendFile(path.join(rootDirName,'/public/pages/notfound.html'));
     else 
      res.json('Oops! Page not found.' );
}

  


app.use('/login', loginManager);
app.use('/signup', signupManager);
app.use('/profile', authMiddleware, profileManager)
app.use('/user', usersManager)



interface CompileRequestBody {
    code: string;
    clientId: UUID;
    sessionId: UUID;
}

type errorObject = {
    row: Number,
    column: Number,
    error: String,
}

interface CompileResponse {
    success?: boolean;
    error?: errorObject[];
    fileName?: string;
}






    //          LOCAL  SERVER  VARIABLES       //

let compileProcess: ChildProcess;

    //                      END                      //  
function onServerStart(err)
{
    if(err)
        console.error("error: "+err)
    else
    console.log("Server running on port " + PORT)

    cleanUp()
}

//          GLOBAL  SERVER  VARIABLES       //
            const PORT = 3000;
    export const server = app.listen(PORT, '0.0.0.0', onServerStart);
    // export const wss = new WebSocket.Server({server: server, clientTracking: true,  });

    export let clients: Map<UUID, WebSocket> = new Map();
    // const sessions: Map<UUID, UUID[]> = new Map();

    export let runningProcesses: Map<UUID, ChildProcess> = new Map();
    export let sessionMap: Map<UUID, EditorSession> = new Map<UUID, EditorSession>(); // SESSION ID / EDITOR OBJECT
    const buildTag =`cpp-image`;



    export const wss = new WebSocket.Server({noServer: true, clientTracking: true,  });
    


//                      END                      //  

      server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = new URL(request.url, 'ws://intelegeinfo.go.ro');
    switch(pathname){
  case '/api': 
    wssAPI.handleUpgrade(request, socket, head, function done(ws) {
      wssAPI.emit('connection', ws, request);
    });
    break
   case '/editor':
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
    break;
  default:
    socket.destroy();
  
}
});
//@ts-ignore
let meter = tx2.meter({
  name      : 'skisjdj/sec',
  samples   : 1,
  timeframe : 60
})

    server.on('connection', listener => {
        meter.mark()
    })
//  server.on('upgrade', function upgrade(request, socket, head) {
//   })
 

//     let redisClient = new Redis({
//         host: "host.docker.internal",
//         port: 6379
//       });
// redisClient.connect().catch(console.error)

// // Initialize store.
// let redisStore = new RedisStore({
//   client: redisClient,
//   prefix: "myapp:",
// })

// // Initialize session storage.
// app.use(
//   session({
//     store: redisStore,
//     resave: false, // required: force lightweight session keep alive (touch)
//     saveUninitialized: false, // recommended: only save session when data exists
//     secret: "keyboard cat",
//   }),
// )



  

// redisClient.hmset('sessionMap', {Dog: 'wuff wuff'}, (err, reply) => {
//     if(err) {
//       console.error(err);
//     } else {
//       console.log(reply);
//     }
//   });

//   redisClient.hgetall('sessionMap', (err, object )=>
//   {
//     if(!object) return;
//     //  runningProcesses = object;
//      console.log(object)
// })
// redisClient.hgetall('sessionMap', (err, object )=>
// {
//     if(!object) return;
//     // clients = object
//     console.log(object)
// })
// redisClient.hgetall('sessionMap', (err, object )=>
// {
//     if(!object) return;
//     // sessionMap = object
//     console.log(object)
// })
let shared: SharedStateManager
const isShared = false;
if(isShared) {
    shared = SharedStateManager.getInstance();



    // shared.onUpdate('PROCESSES_UPDATED', async () => {
    //   // Processes can't be serialized, so we just clear the list and track new ones as they’re added
    //   runningProcesses = new Map(); // Or keep any still-running ones if you have a way to validate
    // });

    shared.onUpdate('SESSIONS_UPDATED', async () => {
    const allSessions = await shared.getAllSessions();
    sessionMap = new Map(Object.entries(allSessions) as [UUID, EditorSession][]);
    });
    // clients will be stored locally.

}



function cleanUp() {
    fs.readdir(path.join(rootDirName, "cache"), (err, files) => {

    if (err) {
        console.error("Error reading cache directory:", err);
        return;
    }

    files.forEach((file) => {
        fs.rm(path.join(rootDirName, "cache", file), { recursive: true, force: true }, (err) => {
            if (err) {
                console.error("Error deleting cache folder:", err);
            } else {
                console.log("Deleted cache folder for client " + file);
            }
        });
    });


    if(process.env.NODE_ENV == 'development') return;
    let filter = '';
    EditorModes.modes.forEach(element => {
        filter += `--filter ancestor=${buildTag}_${element.dockerSafeTag} `
    });
    console.log("Removing previous sandbox containers: " + execSync(`docker ps ${filter} -q |  xargs --no-run-if-empty docker rm --force `, {timeout: 5000}))
});

}



    


function getClientFilesPath(sessionId)
{
    return path.join(rootDirName, "cache", sessionId,"clientFiles");
}
    

function compileFile(clientId, sessionId): Promise<any>
{

    return new Promise<any>((resolve, reject) => {


        // const clientId = req.body.clientId;
    // const sessionId = req.body.sessionId; 
    const editorSession = isShared ? shared.getSession(sessionId) || sessionMap.get(sessionId): sessionMap.get(sessionId);
    
    // const code = req.body.code;
    const exeFile = path.join(rootDirName, "cache", sessionId);
    const filePath = path.join(exeFile,"clientFiles");//            path.join(rootDirName, "cache", sessionId);
    const codeFile = !["cpp"].includes(path.extname(editorSession?.clientsActiveFile.get(clientId)|| "main.cpp"))? editorSession?.clientsActiveFile.get(clientId) : "main.cpp";
    if(!editorSession)
        console.log(new Error("Couldnt retrieve editorSession from memory database"))
    //fs.writeFileSync(path.join(filePath,"main.cpp"), code);
    // console.log(path.extname(getThisClientSession()?.clientsActiveFile.get(clientId)||"aaa"));
   
    compileProcess = spawn("g++", ["-g", "-O0", path.join(filePath, codeFile || "main.cpp"), "-o", path.join(exeFile,"main.exe")], {
        windowsHide: true,
        detached: true,
    });
    let errorData = "";
    
    const errors: errorObject[] = [];
    if(compileProcess != null) {
        

        compileProcess.stdin?.end();
        compileProcess?.stderr?.on("data", (data: Buffer) => {

            data.toString().split('\n').forEach(errorString => {
                if(!errorString) return;
                errorData = errorString.replace((path.resolve(filePath)+'\\'), "")
                const regex = errorData.match(/((?!:)\d*):((?!:)\d*)/) || [];
                const column = parseInt(regex[2] || "-1")
                const row = parseInt(regex[1] || "-1")
                errors.push({column: column, row: row, error: errorData})
            });
            
//                    data.toString();
        });

        compileProcess?.stdout?.on("data", (data: Buffer) => {

            console.log("stdout: " + data.toString());
        });

        compileProcess.on("close", (code: number) => {
            if (code === 0) {
               resolve({ success: true , fileName: codeFile});
            } else {//if(code===1) {
                //const correctedString = errorData.replace((path.resolve(filePath)+'\\'), "")
                
            
                // console.log((path.resolve(filePath)+'\\'))
                reject({errors}); //|| "Compilation failed" 
            // } else
            // {
            //     res.json({ error: errorData || "Program exited with non-normal code: "+code });

            }
            
        });

    }



    })
    
}


    

wss.addListener('connection', async (ws: WebSocket, req) => {
    let sessionId: UUID;
    let clientId: UUID;
    let clientObj: ClientObject | undefined
    let sessionType: boolean; // true for session, false for "local" client
    let clientFilesPath: string;
    let heartbeatTimestamp: number = Date.now();
    const heartbeatTimeout = 30000; // 1 second timeout for heartbeat
    let heartbeatInterval: any;
    let clientSession: EditorSession;
    let gdbBuffer = "";
    let checkSyntaxTimeout;
    let dataTimeout;
    let project;
    let processInputBuffer = '';
    let spawnPromise;
    const cookies = req.headers.cookie;
    const jwtCookie = getJWTCookie(cookies)
      function getJWTCookie(cookies) { return cookies
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];}
    const recoveredSession: UUID | undefined = cookies
      ?.split("; ")
      .find((c) => c.startsWith("session="))
      ?.split("=")[1] as UUID;
    let userData: users.UserNoPassword |undefined;
    let userLoggedIn: boolean = false
    users.getUserData(users.getClientId(jwtCookie as string) as number).then((userdata) => {
        if(userdata)
        {
            userData= userdata;
            userLoggedIn = true
        }
        else
        {
            // not logged in
            userData = undefined;
            userLoggedIn = false;
            if(req.headers.cookie)
            req.headers.cookie.replace(jwtCookie, '')
        }
    
      
    }).finally(() => {
        
        function loadProject(fileUUID)
        {
            return new Promise<Project|string>((resolve, reject) => {
                if(!fileUUID) throw 'cant load project: no id was supplied, or is invalid';
                users.default.project.findUnique({
                where:
                {
                    fileUUID
                }
                }).then(project => {
                    resolve(project)
                            
            }).catch(err => {
                reject(err)
            })
            })
        

        }




    



    function handshake(req: IncomingMessage) {
        const urlParams = new URL("http://intelegeinfo.go.ro/editor"+ req.url).searchParams
        const wssessionId: UUID | undefined = urlParams.get('session') != undefined || urlParams.get('session') as UUID != undefined ? urlParams.get('session') as UUID : recoveredSession ? recoveredSession : undefined;
        let isHost = false;
        //handle heartbeat
        heartbeatInterval = setInterval(() => {
            // server.getConnections(function(error, count) {

            //     console.log(Date.now + ":   " + count);
            
            // });
            heartbeatTimestamp = Date.now(); // Update the heartbeat timestamp when a message is received
            ws.send(JSON.stringify({type: WebSocketMessageType.Heartbeat, connections: server.connections, expectedDelay: heartbeatTimeout})); // Send a ping message to the client every 30 seconds
            if(Date.now() - heartbeatTimestamp >= heartbeatTimeout*2) {
                //console.log("Client " + clientId + " timed out ");
                
                    
                //sessions.delete(sessionId);


                if(getThisClientSession()?.clients.get(clientId))  console.error("Client not found in session while trying to time out client  " + sessionId);
                    else getThisClientSession()?.clients.delete(clientId)
                clients.delete(clientId);
                clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
                ws.close(); // Close the connection if no response received within double of timeout seconds
            }
            
        }, heartbeatTimeout);
        
            // TODO Check if session exists, otherwise create a new one and make this client the host.

        if(wssessionId) { 
            //client connected to existing session

            const activeSession = sessionMap.has(wssessionId) || (isShared && shared.getSession(wssessionId));
            if(activeSession) // = There is an active session, join it.
            {
                
                if(isShared) {if(shared.getSession(wssessionId)) clientSession = shared.getSession(wssessionId) as EditorSession;} // sessionMap.get(wssessionId ||  uuidv4() as UUID) || new EditorSession; 
                    if(!sessionMap.get(wssessionId as UUID)) return console.error(new Error("Didnt find session in sessionMap while joing session"))
                    else clientSession = sessionMap.get(wssessionId as UUID) as EditorSession;
                if(!clientSession.isPublic) return ws.close(3000,"This session doesn't exist or isn't puiblic. <br> <a href='/editor'>Create a new session</a>")

                clientId = (getThisClientSession() || clientSession)?.spawnClient(ws,userData)

                clientObj = getThisClientSession().getClientObjectById(clientId);
                clients.set(clientId, ws);
                isHost = false;
                // printClientConsoleDebug('joining session: ' + clientSession.sessionId)
            }
            else // there is no session, create it.
            {
                
                //getThisClientSession()?.clients.push(clientId); // add client to client list.
                clientSession = createThisClientSession(wssessionId);
                clientId = getThisClientSession()?.spawnClient(ws, userData)
                clientObj = getThisClientSession().getClientObjectById(clientId);
                clients.set(clientId, ws); // TODO remove this map

                // printClientConsoleDebug('creating session: ' + clientSession.sessionId)
                if(clientSession && !isShared) {
                    sessionMap.set(clientSession.sessionId, clientSession) // TODO Implement this in EditorSession class & polish it
                }
                isHost = true

                
            }
                sessionId = getThisClientSession().sessionId;
                clientFilesPath = path.join(rootDirName, "cache", sessionId,"clientFiles");

            // clients.set(clientId, ws);
            if(clientObj && isShared)
            {
                shared.getSession(sessionId)?.clients.set(clientId, clientObj)
                shared.addClient(clientId, sessionId);
                shared.updateSession(sessionId, clientSession)
            } 
            
            connectionReady(!isHost, req)
        } else
        {

            //client connected to new SOLO session
            clientSession = createThisClientSession();
            
            if(getThisClientSession() != undefined)
            {
                sessionId = clientSession.sessionId;
                clientId = getThisClientSession()?.spawnClient(ws, userData)
                clientObj = getThisClientSession().getClientObjectById(clientId);

                clientFilesPath = path.join(rootDirName, "cache", sessionId,"clientFiles");
                sessionMap.set(clientSession.sessionId, clientSession) // TODO Implement this in EditorSession class & polish it

            } else 
            console.error(new Error("Failed to create SOLO session"))
            if(clientObj && shared)
            {
                shared.getSession(sessionId)?.clients.set(clientId, clientObj)
                shared.addClient(clientId, sessionId);
                shared.updateSession(sessionId, clientSession)
            }
            
            clients.set(clientId, ws);
            
                // will always be false
            connectionReady(false, req)
        }
    }
    
   



    // TODO add session map 
    // if (gdbProcess) {
    //     gdbProcess.kill(); // Ensure only one GDB session runs at a time
    // }

    // if (program) {
    //     program.kill(); // Ensure only one GDB session runs at a time
    // }
   
    const customStream = new Writable({
        write(chunk, encoding, callback) {
          console.log(`Received from WebSocket, sending to C++ stdin: ${chunk.toString()}`);
          clientSession.program?.stdin?.write(chunk, encoding, callback); // Forward to child stdin
        },
        final(callback) {
            clientSession.program?.stdin?.end(); // Close stdin when done
          callback();
        }
      });

    //   function getSessionMap(): Map<UUID, EditorSession>
    //   {
    //     state.getClient
    //   }

      function getThisClientSession(thissessionid=sessionId): EditorSession
      {
        // if(!sessionMap.get(sessionId)) 
        // { 
        //     console.error("couldnt find session object, creating a new session instead.")
        //     return new EditorSession(sessionId);
        // } else
        if(isShared ) return clientSession || sessionMap.get(thissessionid) as EditorSession //||  new EditorSession(sessionId);
        else if(clientSession)
                return clientSession;
            else if(sessionMap.get(thissessionid))
                    return sessionMap.get(thissessionid) as EditorSession //||  new EditorSession(sessionId);
                else console.error(new Error('Couldnt get this client session'))
        
      }


      function createThisClientSession(sessionId?:UUID): EditorSession
      {
        const newSession = new EditorSession(sessionId)
        if(isShared) shared.updateSession(newSession.sessionId, newSession);
        // sessionMap.set(newSession.sessionId , newSession)
        return newSession;
        
      }

      function addProcessToMap(sessionId: UUID, process: ChildProcess) {
        // if (runningProcesses.has(sessionId)) {
        // } else


        // runningProcesses.set(sessionId, process);
        // if(isShared) shared.addProcess(sessionId, process);
        getThisClientSession().process = process;
        
    }
    
    function removeRunningProcessFromMap() {
        // if (runningProcesses.has(sessionId)) {
        //     runningProcesses.delete(sessionId);
        // } else console.error("Process not found in map for client " + sessionId);
        getThisClientSession().process = undefined;
    }
    function getProcessFromMap(clientSession?: EditorSession): ChildProcess | undefined {
        // return runningProcesses.get(sessionId);
        if(clientSession)
            return clientSession.process;
        else
         return getThisClientSession()?.process;
    }
    

    function printClientConsoleError(message: string, cause?:any, client?:ClientObject) {
        const targetClientId = client?.clientId || clientId;
        const clientSocket = clients.get(targetClientId);
        if (clientSocket) {
            console.error(new Error(message, {cause: cause}))
            clientSocket.send(JSON.stringify({ error: true, type: WebSocketMessageType.Error, body: message, messageType: ConsoleMessageType.Error }));
        } else {
            console.error("Client not found:", clientId);
        }
    }

    function printClientConsoleInfo(message: string, client?:ClientObject) {
        const targetClientId = client?.clientId || clientId;
        const clientSocket = clients.get(targetClientId);
        console.log(message)
        if (clientSocket) {
            clientSocket.send(JSON.stringify({ error: true, type: WebSocketMessageType.Chat, body: message, messageType: ConsoleMessageType.Info }));
        } else {
            console.error("Client not found:", targetClientId);
        }
    }

    function printClientConsoleDebug(message: string, client?:ClientObject) {
        const targetClientId = client?.clientId || clientId;
        const clientSocket = clients.get(targetClientId);
        if (clientSocket) {
            console.debug("DEBUG: " + message)
            clientSocket.send(JSON.stringify({ error: true, type: WebSocketMessageType.Chat, body: message, messageType: ConsoleMessageType.Debug }));
        } else {
            console.error("Client not found:", targetClientId);
        }
    }

    function printClientConsoleSessionInfo(message: string, client?:ClientObject) {
        const targetClientId = client?.clientId || clientId;
        const clientSocket = clients.get(targetClientId);
        if (clientSocket) {
            clientSocket.send(JSON.stringify({ error: true, type: WebSocketMessageType.Chat, body: message, messageType: ConsoleMessageType.SessionInfo }));
        } else {
            console.error("Client not found:", targetClientId);
        }
    }
    
    
        

    let mode: "run" | "debug" | "stopped" = "run"; //debug
        // TODO Replace with replicate function.
   function replicateSocketMessage(sessionId: UUID, senderId: UUID, ignoreSender: boolean, response: Record<string, any>, filterFunction?: (clientId:UUID) => Boolean ) //{type: WebSocketMessageType; body: string | any; message?: string, }
   {
            getThisClientSession()?.clients.forEach((clientObject, client) => {
                // for(const client of getThisClientSession()?.clients.keys()) {
                    //send response to all clients
                    if(ignoreSender && clientId == client) return;
                    if(filterFunction != undefined)
                    {       // use filter function

                            if(filterFunction(client) == false)
                        {
                            const clientSocket = clients.get(client);
                            if(!clientSocket) {
                                // if(sessions.get(sessionId)?.indexOf(client) === -1)  console.error("Client not found in session while trying to time out client  " + sessionId);
                                //                      else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(client) || -1, 1);
                                //                  clients.delete(client);
                
                                                return console.error("\\x1b[31m Client not found while replicating message " + client + "\\x1b[0m");
                            }
                            // } return console.error("Client not found " + client);
                            clientSocket?.send(JSON.stringify(response));
                        }
                    } else 
                        {
                            const clientSocket = clients.get(client);
                            if(!clientSocket) {
                                // if(sessions.get(sessionId)?.indexOf(client) === -1)  console.error("Client not found in session while trying to time out client  " + sessionId);
                                //                      else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(client) || -1, 1);
                                //                  clients.delete(client);
                
                                                return console.error("\\x1b[31m Client not found while replicating message " + client + "\\x1b[0m");
                            }
                            // } return console.error("Client not found " + client);
                            clientSocket?.send(JSON.stringify(response));
                        }
                
            // ;
                });
   }

    function sendConnectionMessage() 
    {
            // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, messageType: ConsoleMessageType.SessionInfo, body: "Client " + clientObj?.displayName + " joined!"});
            if(!clientSession) return;
    const session = clientSession.clients.size!=1 ? {isHost: clientObj.isHost, canChat: clientObj.canChat, canEdit: clientObj.canEdit} : undefined;
        const welcomeMessage =  !userLoggedIn ?
    `Bine ai venit pe Intelege Info!
        Scrie niste cod, apoi apasa compile si execute code, sau ruleaza in debugger.
        Invita-ti prietenii sa editeze codul impreuna cu tine in timp real apasand butonul share`
        :
        `Bine ai revenit ${userData?.username} pe Intelege Info!
        Poti salva codul tau apasand pe butonul save.`
        
        // Send initial message to client
        ws.send(JSON.stringify({type: WebSocketMessageType.Handshake, ...clientInfo(), messageType: ConsoleMessageType.Info, sessionId: sessionId, body: welcomeMessage, project,  session, canEdit: clientObj.canEdit})); 
        return session;
    }

    function clientInfo(thisclientObj?: ClientObject , prefix: string = '') {
        if(!clientObj)
            return;
        if(!thisclientObj)
            thisclientObj = clientObj;
        if(thisclientObj)
            return JSON.parse(`{"${prefix}clientId": "${thisclientObj.clientId}", "${prefix}displayName": "${thisclientObj.displayName}", "${prefix}color": "${thisclientObj.color}"}`)
        else if(prefix)
            JSON.parse(`{${prefix}clientId: "${clientId}", ${prefix}displayName: "${clientObj.displayName}", ${prefix}color: "${clientObj.color}"}`)
        else return {clientId: clientId, displayName: clientObj.displayName, color: clientObj.color}
    }

   async function connectionReady(cooperator: boolean = false, req: IncomingMessage) 
   {
        const urlParams = new URL("ws:/intelegeinfo.go.ro:8080"+req.url).searchParams
        let defaultText: string;
        const clientFilesPath = clientSession.getClientFilesPath();
        let savedProject: Project | undefined;
        if(urlParams.has("save"))
        {
            try{
                if(!getJWTCookie(req.headers.cookie)) throw 'not logged in';
                const id = jwt.verify(getJWTCookie(req.headers.cookie), privateKeyPem)
                
                savedProject = (await loadProject(urlParams.get('save'))) as Project
                if(savedProject.userId !== parseInt(id.sub as string)) throw 'not authorized'
                fs.cpSync(path.join(rootDirName,"saved", savedProject.fileUUID), path.join(rootDirName, "cache", sessionId), {recursive: true})
                project = savedProject;
                clientSession.files = fs.readdirSync(clientFilesPath).flatMap<EditorFile, string>((file) => {return new EditorFile(clientSession, file, fs.readFileSync(path.join(clientFilesPath, file)).toString())})
                console.log(clientSession.files)
                // fs.renameSync()
                // defaultText =  
                // console.log(defaultText)
                    }catch(err) {
                        printClientConsoleError("Couldn't find your saved project, sorry! Check that you're logged in or the URL is correct. Error: " + err, getThisClientSession().getClientObjectById(clientId))
                        defaultText = fs.readFileSync("user_code.cpp").toString();
                    }
        }
            else defaultText = fs.readFileSync("user_code.cpp").toString();
    
       
        console.log(clientSession.files)

        // printClientConsoleInfo("connected to worker: " + process.pid)

        //create cache folder for session if its a new one
        const cacheFolderExists = fs.existsSync(path.join(rootDirName, "cache", sessionId));

                console.log(!cacheFolderExists)
        console.log(!cooperator)
        console.log(clientSession.files.length)
        if((!cacheFolderExists && !cooperator && clientSession.files.length==0) )
        {

            if(clientSession.files.length==0 && cacheFolderExists && !cooperator && savedProject == undefined)
            {
                fs.rmSync(clientFilesPath, {recursive: true, force: true})
                console.log('deteled existing session folde')
            }

            fs.mkdir(clientFilesPath, { recursive: true }, (err) => {
                if (err) {
                    console.error("Error creating cache folder:", err);
                    return;
                }
                const defaultFileName = 'main.cpp'
                console.log('created file')
                new EditorFile(clientSession, defaultFileName, undefined, function () {
                    this.openFile(clientObj, shared).then(() => onOpenFile(undefined, defaultFileName))                 
                })

                // fs.writeFile(path.join(clientFilesPath, "main.cpp"), defaultText, (err) => {
                //     listFiles(clientFilesPath).then(() => {
                //         openFile("main.cpp")

                //     })
                //     });
            })
        } else 
        {
            console.warn("Cache folder already exists for sessionId " + sessionId);
            if(cacheFolderExists && !cooperator && clientSession.files.length==0)
                clientSession.files = fs.readdirSync(clientFilesPath).flatMap<EditorFile, string>((file) => {return new EditorFile(clientSession, file, fs.readFileSync(path.join(clientFilesPath, file)).toString())})

            sendListFiles(clientFilesPath).then(()=>{
                if(clientSession.files[0] == undefined)
                {
                    if(savedProject)
                        openFile(fs.readdirSync(clientFilesPath)[0])
                    else
                    return console.log('no file found in files: ' + clientSession.files)
                } else if(fs.existsSync(path.join(clientFilesPath, clientSession.files[0].name))) 
                    openFile(clientSession.files[0].name)
                else 
                    console.error("No default file was found!") // TODO replace with async function
            })
          
        }
           
           
            const session = sendConnectionMessage()

            if(getThisClientSession()?.clients.size > 1) // multiple clients connected to this session
            {
                 // display join message
                replicateFunction((clientWs, LocalclientId) => {
                    printClientConsoleSessionInfo(clientObj?.displayName + " joined!", getThisClientSession().getClientObjectById(LocalclientId))
                }, clientObj);

                
                let displayNames:any[] = [];
                getThisClientSession()?.clients.forEach((client, id) => {
                    if(client != clientObj)
                    displayNames.push({displayName: client.displayName, fileName: client.openFile.name, clientId: client.clientId, color: client.color});
               })

               replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.ColabData, colabCommand: "JOIN", ...clientInfo(clientObj), session});
               ws.send(JSON.stringify({type: WebSocketMessageType.ColabData, colabCommand: "LIST", clients:displayNames}));  // Send GDB output to the client

               // send all other client's information
               clientSession.clients.forEach((client) => {
                if(client != clientObj)
                   ws.send(JSON.stringify({type: WebSocketMessageType.FileManagement, command:  FileManagementCommands.Open, fileName: client.openFile.name,  name: client.displayName, color: client.color, clientId: client.clientId}));  // Send GDB output to the client

               })
               setTimeout(() => {
                getThisClientSession().clientCommandBuffer.forEach((cmdBuf, remoteClientid) => {
                    if(clientId != remoteClientid)
                        if(getThisClientSession().clientsActiveFile.get(remoteClientid) === getThisClientSession().clientsActiveFile.get(clientId))
                             ws.send(JSON.stringify(cmdBuf.codeSelection))
                   });
               }, 100);
               
               
            }

            
   }

    //  while(ws.OPEN)   
   setTimeout(() => {
       handshake(req)
   }, 100);
//    handshake(req)

       

    // debug mode only for now
    async function executeCommand( childProcess: ChildProcess, command: string, sessionId: UUID): Promise<void> {
        return new Promise((resolve, reject) => {
            let gdbBuffer = "";
            console.log("GDB Command to execute: " + command)
            const onData = (data: Buffer) => {
                gdbBuffer += data.toString();
                // Check if the full response has arrived
                if (gdbBuffer.includes("(gdb)")) {
                    // We have everything, remove listener
                    (childProcess.stdout as NodeJS.ReadableStream).removeListener("data", onData);
                    
                    // const resMap: Map<string, string> = new Map();
                //     if(gdbBuffer.includes("frame="))
                // {
                    // gdbBuffer.toString().split('\n')[0].split(',').forEach((pair) => {
                    //     if(pair.includes("="))
                    //         resMap.set(pair.split('=')[0].replace("{", ""),
                    //      pair.split('=')[1].replace("}", "").replace("{", "").replaceAll('"', ""))
                    // })

                    gdbBuffer.toString().split('\n').forEach(element => {
                        if(element!='')
                        {
                             const gdbOutput = parseGDBString(element);
                             console.log(JSON.stringify(gdbOutput.json) + '\n' + gdbOutput.err)
                    // console.log(gdbOutput.json);
                
                    const response: {
                        error: boolean;
                        input: string | boolean;
                        type: WebSocketMessageType,
                        messageType: ConsoleMessageType,
                        clientId: UUID,
                        body: string;
                        message: string;
                        msgId: number;
                        line: number;
                        variables: any[];
                    } = {
                        error: gdbOutput.err ? gdbOutput.err : false,
                        input: false,
                        type: WebSocketMessageType.Output,
                        messageType: ConsoleMessageType.DebugProgram,
                        clientId: clientId,
                        body: gdbOutput.json ? gdbOutput.json : undefined,
                        message: 'next', //command.toString(),
                        msgId: clientSession.gdbProcess?.pid || -1,
                        line: gdbOutput.json?.frame?.line ? gdbOutput.json.frame.line : undefined,
                        variables: gdbOutput.json?.variables ? gdbOutput.json.variables : undefined  
                    };
                    getThisClientSession()?.clients.forEach((client, id) => { // TODO replace with replicateFunction()
                        //send response to all clients 
                        const clientSocket = clients.get(client.clientId);
                        if(!clientSocket)
                            {
                            
                                //sessions.delete(sessionId);
                                if(getThisClientSession()?.clients.has(clientId))  console.error("Client not found in session while manually replicating to client  " + sessionId);
                                     else getThisClientSession()?.clients.delete(client.clientId);
                                 clients.delete(client.clientId);

                                return console.error("\\x1b[31m Client not found, removing ids " + client + "\\x1b[0m");
                            } 
                        clientSocket?.send(JSON.stringify(response));
                    });
                        }
                   
                    });
                    

                    // }
                    if(command === '-exec-quit' && childProcess)
                        closeProcess(childProcess)
    
                    resolve(); 
                }
            };
           
            if(true)//childProcess && childProcess.stdin && childProcess.stdout
            {
            // Use .on instead of .once, because GDB output can be split
            childProcess.stdout?.on("data", onData);
                        // console.log('command')
            // Send the command
            // childProcess.stdin?.write(""+'\n');
            childProcess.stdin?.write(command+'\n');
            } else console.error("GDB process not found for session " + sessionId);

        });
    }
    
    let CommandQueue = Promise.resolve();

    function queueCommand(process: ChildProcess,command: string, sessionId: UUID): Promise<void> {
        CommandQueue = CommandQueue.then(() => executeCommand(process, command, sessionId)).catch((err) =>
        {
            printClientConsoleError("failed to queue debugger command: " + err)
        })
        return CommandQueue;
    }
   
    function sendListFiles(dir: string): Promise<void> {
        
        try {
            return new Promise<void>((resolve, reject) => {

                ws.send(JSON.stringify({ type: WebSocketMessageType.FileManagement, body: { command: FileManagementCommands.List, content: clientSession.files.map(file => {return file.name}) } })); // Send the list of files to the client
                resolve();

                // fs.readdir(dir, (err, files) => {
                //     if (err) {
                //         printClientConsoleError("Error listing files: " + err.message);
                //         reject();
                //     } else {
                //         // const fileContentMap: Map<string, string> = new Map<string, string>();
                //         // files.forEach(element => {
                //         //     fileContentMap.set(element, fs.readFileSync(path.join(clientFilesPath, element)).toString());
                //         // });
                //         if (!files) return reject();
                //         const targetFiles = files.filter(file => {
                //             return ![".exe", ".o"].includes(path.extname(file).toLowerCase());
                //         });
                //         resolve();
                //         ws.send(JSON.stringify({ type: WebSocketMessageType.FileManagement, body: { command: FileManagementCommands.List, content: targetFiles } })); // Send the list of files to the client
                //     }
                // });
            });
        } catch (reason) {
            console.log("Failed listing files: " + reason);
            printClientConsoleDebug("Failed listing files: " + reason);
        }
    }
    
    function openFile(fileName: string)
    {
        // if(fs.existsSync(path.join(clientFilesPath, fileName)))
        // console.log("path: " + path.join(clientFilesPath || path.join(rootDirName, "cache", sessionId,"clientFiles"), fileName))
        const file = clientSession.files.find(file => file.name == fileName)
        if(!file)
            {
                console.error(new Error('Couldnt find file ' + fileName))
                return;
            }

        const oldFileName = clientObj.openFile ? clientObj.openFile.name : undefined;
        file.openFile(clientObj, shared)
        onOpenFile(oldFileName, fileName)
    }

    function onOpenFile(oldFileName, fileName)
    {
        replicateFunction((clientWs, id, thisClientObj) => {
            clientWs.send(JSON.stringify({type: WebSocketMessageType.FileManagement, command:  FileManagementCommands.Open, fileName, oldFileName,  name: clientObj.displayName, color: clientObj.color, clientId: clientId}));  // Send GDB output to the client
            if(thisClientObj.openFile && thisClientObj != clientObj)
                if(thisClientObj.openFile.name != fileName || thisClientObj.openFile.name == oldFileName) // TODO choose one
                    clientWs.send(JSON.stringify({type: WebSocketMessageType.MouseUpdate, fileName, oldFileName,  ...clientInfo(clientObj)}));  // Send GDB output to the client  
        });
    }
    
/**
 * Build and run the C++ executable in a Docker container with sandbox folder access.
 * 
 * @param cppExecutablePath - The absolute path to the C++ executable.
 * @param cacheFolderPath - The path to the cache folder that contains unique exe subfolders.
 * @returns The child process running the Docker container
 */
async function buildAndRunCppSandbox(sessionFolder: string, fileName: string, editorMode: typeof EditorModes.EditorMode, clientId, sessionId): Promise<typeof clientSession.sessionContainer>{

return new Promise(async (resolve, reject) => { // Folder containing .exe
  const sandboxFolder = path.join(sessionFolder, 'clientFiles'); // The folder the exe will access
  
  // Ensure that the sandbox folder exists
  if (!fs.existsSync(sandboxFolder)) {
    console.error(`Sandbox folder does not exist: ${sandboxFolder}`);
    reject()
  }

if(!editorMode)
{
    printClientConsoleInfo('File cant be executed!')
    reject('File cant be executed! Editor mode is invalid')
}

if(clientSession.sessionContainer && clientSession.currentbuildTag == buildTag + "_" + editorMode.dockerSafeTag)
{
    console.log('Container already running, executing command...')
    replicateFunction((ws,id, obj) => obj.sendMessage({status: 'spawn'}, WebSocketMessageType.ExecuteStatus))
    resolve(clientSession.sessionContainer)
    return;
}
  // Create a temporary directory for building the Docker image
//   const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpp-docker-'));

new Promise<void>((resolve,reject) => {
if(!clientSession.currentbuildTag || clientSession.currentbuildTag != buildTag + "_" + editorMode.dockerSafeTag)
{
  clientSession.currentbuildTag = buildTag + "_" + editorMode.dockerSafeTag // Unique image tag to avoid collisions

  // 1. Copy the executable to the temporary folder
  // 2. Write the Dockerfile to the temp directory
  const dockerfileContents = editorMode.dockerFile.trim()
// `
// # Base image with GCC
// FROM gcc:bookworm

// # Set working directory inside container
// WORKDIR /app
// RUN apt-get update && \
//     apt-get install -y gdb && \
//     apt-get clean && \
//     rm -rf /var/lib/apt/lists/*
// # Default command can be overridden
// CMD [ "bash" ]
//   `.trim();
  const dockerfilePath = path.join(sessionFolder, 'Dockerfile');
  fs.writeFileSync(dockerfilePath, dockerfileContents);


    // 3. Build the Docker image
  console.log(`Building Docker image: ${clientSession.currentbuildTag}`);
  
    try {
        const builder = spawn(`docker`, ["build" ,"-t", clientSession.currentbuildTag,, '"' +sessionFolder+'"'], { stdio: 'pipe', shell: true });
        builder.on('exit', code => {
        if(code == 0)
            resolve()
        else
            reject('Failed to build Docker image')
        })
        builder.stdout.on('data', data => console.log(data.toString()))
        builder.stderr.on('data', data => console.error(data.toString()))
        builder.on('error', err => {
            reject('Error building Docker image:' + err)
        })
    } catch (error) {
        console.error('Error building Docker image:', error);
        return;
    }
  


}
else
console.log('Skipping build stage.')
}).then(val => {

    // -m 256MB \
// --cpus="0.25" \
  const imageName = `session-container-${sessionId}`;
// fs.mkdirSync(`/tmp/vnc-${sessionId}/`)
  // 4. Run the Docker container with access to the sandbox folder
const hasGUI = clientObj.openFileName.toLowerCase().includes("gui")
console.log(hasGUI ? 'executing with GUI' : "no gui")
if(clientSession.sessionContainer)
    execSync('docker rm -f ' + clientSession.sessionContainer.imageName)
const runCommand = 
`docker run \
-d \
--name ${imageName} \
-v "${sessionFolder}:/app" \ 
-w /app \
-m 256MB \
--cpus="0.25" \
-di \
--rm \
${clientObj.openFile.editorMode.runParams(clientObj)} \
${clientSession.currentbuildTag} \
bash `.trim().replaceAll('\n', "")




//  --rm -c "g++ -g -v -O0 main.cpp -o main && ./main"
  console.log(`Running Docker container ${imageName} with access to ${sandboxFolder}`);
  console.log(runCommand)

  // Return the child process for external handling
    const childProcess = spawn(runCommand, { shell: true, stdio: 'pipe'});
    clientSession.sessionContainer = {process: childProcess as ChildProcess, imageName, fileName, editorMode: clientObj.openFile.editorMode} 

     childProcess?.on("spawn", () => {
        console.log("Docker container spawned")
            
    })
    childProcess.stdout.on('data', data => {
        console.log("CONTAINER ID:" + data.toString())
        setTimeout(async () => {
                    // TODO Spawn GUI on client 
                    //   TODO maybe remove ignore self client to show when its ready and compiling
            replicateFunction((ws,id, obj) => obj.sendMessage({status: 'spawn'}, WebSocketMessageType.ExecuteStatus))

            if(hasGUI && clientSession.displayServer == 0) // doesnt have display server
            {
                clientSession.displayServer = await clientSession.sessionContainer.editorMode.onBuild(clientSession.sessionContainer, clientSession)
                replicateFunction((ws,id, obj) => obj.sendMessage({status: 'spawnGUI'}, WebSocketMessageType.ExecuteStatus))

            }
                
            resolve(clientSession.sessionContainer); // Return the child process so it can be handled externally
        }, 1000);    
    })
    
    childProcess.stderr.on('data', data => {
        console.log('[Docker Container Error]' + data.toString())
        // onClosedProgram(1, 0, "Failed to sandbox program: " + data.toString()).then(() => console.log('fail sent to user'))
    })


}).catch(err => [
    console.error(err)
])


 
})
  

}
async function onClosedProgram(code,time, message, error?)
    {
        let notes: string = "";
        processInputBuffer = '';
        // const time = 
        if(new Blob([gdbBuffer]).size > 64000) // 1000000 is 1Mb
        {
            await new Blob([gdbBuffer]).slice(0, 64000).text().then(str => {
                notes = "buffer exceeded 64kb, output was truncated."
                replicateFunction((clientWs) => {
                    clientWs.send(JSON.stringify({messageType: ConsoleMessageType.Output, type: WebSocketMessageType.Output, body: str.toString(), clientId: clientId}));  // Send GDB output to the client
                });
        })
        }

        
        if(clientSession.program)
        {
            clientSession.program.stdout.removeAllListeners()
            clientSession.program.stderr.removeAllListeners()
        }
        if(code || code!=9)
        replicateFunction((clientWs) => {
            clientWs.send(JSON.stringify({type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, time, notes, body: message, clientId: clientId}));  // Send GDB output to the client
        });

    }
async function readStdio(program, messageJSON, res: typeof clientSession.sessionContainer)
    {
    return new Promise<void>((resolve, reject) => {
    addProcessToMap(sessionId, program); // add to process map
    mode = "run";
    let spawnDate = Date.now()
    let programTimeout;
    gdbBuffer = "";

    if(messageJSON.textMode)
        programTimeout = setTimeout(() => {
            onClosedProgram(-1, ( Date.now() - spawnDate), "<span style='color: red'>Program timed out!</span>")
            closeProcess(program)
            resolve()
        }, 1000);
    // if(programTimeout) clearTimeout(programTimeout)

    spawnPromise = new Promise<void>((resolve, reject) => {
    clientSession.program?.on("spawn", () => {
        console.log("Program spawned")
        spawnDate = Date.now()
        res.editorMode.onSpawn(clientSession);
        clientObj.sendMessage({type: WebSocketMessageType.ExecuteStatus, spawn: 1})
        if( clientSession.program.stdin && processInputBuffer)
            if(clientSession.program?.stdin?.writable)
            clientSession.program.stdin.write(processInputBuffer) // write buffer
        dataTimeout = 
        setTimeout(() => {
            clientObj.sendMessage({type: WebSocketMessageType.ExecuteStatus, input: 1})
        }, 400);
        resolve()

    })

    })

    clientSession.program.stdout?.on("data", (data) => {
        gdbBuffer += data.toString();
        // replicateFunction((clientWs) => {
        //     clientWs.send(JSON.stringify({messageType: ConsoleMessageType.Output, type: WebSocketMessageType.Output, body: gdbBuffer.toString(), clientId: clientId}));  // Send GDB output to the client
        // });
        // gdbBuffer = "";
        replicateFunction((clientWs) => {
        clientWs.send(JSON.stringify({type: WebSocketMessageType.Output, messageType: ConsoleMessageType.Output, body: data.toString(), clientId: clientId}));  // Send GDB output to the client
    });

    clearTimeout(dataTimeout)
        dataTimeout = setTimeout(() => {
        clientObj.sendMessage({type: WebSocketMessageType.ExecuteStatus, input: 1})
    }, 100);

    });


    clientSession.program?.stderr?.on("data", (data) => {
    gdbBuffer += data.toString();
    replicateFunction((clientWs) => {
        clientWs.send(JSON.stringify({type: WebSocketMessageType.Output, messageType: ConsoleMessageType.Output, body: data.toString(), clientId: clientId}));  // Send GDB output to the client
    });
    });

    clientSession.program?.on("close", (code) => {

        clearTimeout(dataTimeout);
        clearTimeout(programTimeout)
        switch(code)
        {
            case 0:
            default:
            onClosedProgram(code, ( Date.now() - spawnDate), "Program exited with code: " + code?.toString() || -1)
            break;
            case 136:
            case 138:
            onClosedProgram(code, ( Date.now() - spawnDate),"Program exited with errror: <a href='/guides/aritmethicoperation?session="+sessionId+"' title=Learn how to fix here. | Error code: " + code?.toString()+">Arithmetic devided by 0</a>", true)
            break;
            case 139:
            onClosedProgram(code, ( Date.now() - spawnDate),"Program exited with errror: <a href='/guides/aritmethicoperation?session="+sessionId+"' title=Learn how to fix here. | Error code: " + code?.toString()+">Segmentation Fault</a>", true)
            break;
            case 3221225477:
            onClosedProgram(code, ( Date.now() - spawnDate),"Program exited with errror: <a href='/guides/errors/memaccessviolation?session="+sessionId+"' title=Learn how to fix here. | Error code: " + code?.toString()+">MEMMORY ACCESS VIOLATION!</a>", true)
            break;
        }

        gdbBuffer = "";
        onClosedProcess()
        resolve()
    

        })
    })
    }

    // Handle GDB session commands from client
    ws.on("message", async (message: Buffer, isBinary: boolean) => {  
        try {
            let messageJSON;    
            if(JSON.parse(message.toString()).data != undefined)
             messageJSON = JSON.parse(message.toString()).data;
            else messageJSON = JSON.parse(message.toString());
            // console.log(messageJSON)

            const command = messageJSON.command
            const args = messageJSON.args;
            const type: WebSocketMessageType = messageJSON.type;
            // console.log("Received message from client: ", messageJSON);
            //console.log("Received message from client: ", type);
            
            // if(type!= WebSocketMessageType.Heartbeat)
            //     {
            //         console.log(getThisClientSession())

            //     }


            switch (type) {
                case WebSocketMessageType.Canvas:

                    replicateFunction((clientWs) => {
                        clientWs.send(JSON.stringify({...messageJSON}));  // Send GDB output to the client
                    }, clientObj);
                break;
                case WebSocketMessageType.WebCam:
                    // console.log(messageJSON.buffer);
                    try {
                        if(messageJSON.started)
                        {
                            execSync('sudo modprobe -r v4l2loopback')
                            const video = exec('sudo modprobe v4l2loopback video_nr=10 card_label="virtualcam" exclusive_caps=1')
                            video.stdout.pipe(process.stdout)
                            video.stderr.pipe(process.stdout)

                            video.on('close', data => console.log('added camera. ' + data.toString()))
                            console.log('added camera')
                        } else
                          (clientObj.openFile.editorMode as EditorModes.Python).receiveWebCam(messageJSON.buffer)
                         
                    } catch(err)
                    {
                        /// ......
                    }
                  
                break;
                case WebSocketMessageType.Heartbeat:
                    if(!clientObj) break;
                    clientObj.ping =  Date.now() - heartbeatTimestamp;
                    // console.log("Client ping: " + clientObj?.ping)
                   
                    //console.log("Received heartbeat from client " + clientId);
                    break;
                
                case WebSocketMessageType.Handshake:

                    sendConnectionMessage() // TODO Implement this on client side, to ensure client received handshake message.
                            /*
                    //handle heartbeat
                    heartbeatInterval = setInterval(() => {
                        server.getConnections(function(error, count) {

                            console.log(count);
                        
                        });
                        heartbeatTimestamp = Date.now(); // Update the heartbeat timestamp when a message is received
                        ws.send(JSON.stringify({type: WebSocketMessageType.Heartbeat, connections: server.connections, expectedDelay: heartbeatTimeout})); // Send a ping message to the client every 30 seconds
                        if(Date.now() - heartbeatTimestamp >= heartbeatTimeout*2) {
                            //console.log("Client " + clientId + " timed out ");
                            
                                
                            //sessions.delete(sessionId);


                            if(getThisClientSession()?.clients.get(clientId))  console.error("Client not found in session while trying to time out client  " + sessionId);
                                else getThisClientSession()?.clients.delete(clientId)
                            clients.delete(clientId);
                            clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
                            ws.close(); // Close the connection if no response received within double of timeout seconds
                        }
                        
                    }, heartbeatTimeout);
                   
                        // TODO Check if session exists, otherwise create a new one and make this client the host.
                    if(messageJSON.sessionId) { 
                        //client connected to existing session


                     //   sessionId = messageJSON.sessionId;
                     //   clientId = uuidv4();

                        // console.log("Client " + clientId + " connected to session " + sessionId);
                        //   if(sessions.has(sessionId))
                        //     sessions.get(sessionId)?.push(clientId);
                        // else 
                        //     {
                        //         sessions.set(sessionId, [clientId]);
                        //         getThisClientSession()?.clientsActiveFile
                        //     }
                        const activeSession = sessionMap.has(messageJSON.sessionId) || (isShared && shared.getSession(messageJSON.sessionId));
                        if(activeSession) // = There is an active session, join it.
                        {
                            
                            if(isShared) {if(shared.getSession(messageJSON.sessionId)) clientSession = shared.getSession(messageJSON.sessionId) as EditorSession;} // sessionMap.get(messageJSON.sessionId ||  uuidv4() as UUID) || new EditorSession; 
                             if(!sessionMap.get(messageJSON.sessionId as UUID)) return console.error(new Error("Didnt find session in sessionMap while joing session"))
                                else clientSession = sessionMap.get(messageJSON.sessionId as UUID) as EditorSession;
                            
                            clientId = (getThisClientSession() || clientSession)?.spawnClient(ws,userData)

                            clientObj = getThisClientSession().getClientObjectById(clientId);
                            clients.set(clientId, ws);

                            // printClientConsoleDebug('joining session: ' + clientSession.sessionId)
                        }
                        else // there is no session, create it.
                        {
                            //getThisClientSession()?.clients.push(clientId); // add client to client list.
                            clientSession = createThisClientSession(messageJSON.sessionId);
                            clientId = getThisClientSession()?.spawnClient(ws, userData)
                            clientObj = getThisClientSession().getClientObjectById(clientId);
                            clients.set(clientId, ws);

                            // printClientConsoleDebug('creating session: ' + clientSession.sessionId)
                            if(clientSession && !isShared) {
                                sessionMap.set(clientSession.sessionId, clientSession) // TODO Implement this in EditorSession class & polish it
                            }
                        }

                            sessionId = getThisClientSession().sessionId;
                            clientFilesPath = path.join(rootDirName, "cache", sessionId,"clientFiles");

                        // clients.set(clientId, ws);
                        if(clientObj && isShared)
                        {
                            shared.getSession(sessionId)?.clients.set(clientId, clientObj)
                            shared.addClient(clientId, sessionId);
                            shared.updateSession(sessionId, clientSession)
                        } 
                        
                        connectionReady(true)
                    } else
                    {

                        //client connected to new SOLO session


                     //   clientId = uuidv4(); // Generate a unique ID
                     //   sessionId = clientId; // Use the generated ID as the session ID
                        // sessions.set(clientId, [sessionId]);
                         clientSession = createThisClientSession();
                        
                        if(getThisClientSession() != undefined)
                        {
                            sessionId = clientSession.sessionId;

                            // getThisClientSession().sessionId = sessionId;
                            // getThisClientSession()?.clients.set(clientId); // add client to client list.
                            clientId = getThisClientSession()?.spawnClient(ws, userData)
                            clientObj = getThisClientSession().getClientObjectById(clientId);

                            clientFilesPath = path.join(rootDirName, "cache", sessionId,"clientFiles");
                            sessionMap.set(clientSession.sessionId, clientSession) // TODO Implement this in EditorSession class & polish it

                        } else 
                        console.error(new Error("Failed to create SOLO session"))
                        if(clientObj && shared)
                            {
                                shared.getSession(sessionId)?.clients.set(clientId, clientObj)
                                shared.addClient(clientId, sessionId);
                                shared.updateSession(sessionId, clientSession)
                            }
                        
                        clients.set(clientId, ws);
                        // printClientConsoleDebug('solo session: ' + clientSession.sessionId)

                        connectionReady(false)
                    }

                    
                //    if(fs.existsSync(path.join(rootDirName, "cache", sessionId)))
                  //      fs.writeFileSync(path.join(rootDirName, "cache", sessionId , "user_code.cpp"), "// C++ code here\n");

               
                // printClientConsoleDebug('joined session: ' + clientSession.sessionId)

                     */
                    break;
                   

                case WebSocketMessageType.Console:
                     if(getProcessFromMap()!=undefined)
                     {
                        getProcessFromMap()?.stdin?.write(messageJSON.command + "\n");
                        dataTimeout = setTimeout(() => {
                            clientObj.sendMessage({type: WebSocketMessageType.ExecuteStatus, input: 1})
                        }, 200);
                     }
                     else
                        processInputBuffer += messageJSON.command + "\n";

                    replicateFunction((clientWs) => {
                        clientWs.send(JSON.stringify({type: WebSocketMessageType.Console, messageType: ConsoleMessageType.Output,  body: messageJSON.command, clientDisplayName: clientObj?.displayName, clientId: clientId}));  // Send GDB output to the client
                    });
                    break;
                case WebSocketMessageType.Chat:

                

                    if(!clientObj.canChat) break;
                   
                    // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, messageType: ConsoleMessageType.UserChat,  body: messageJSON.command, clientDisplayName: clientObj?.displayName});
                    replicateFunction((clientWs) => {
                        clientWs.send(JSON.stringify({type: WebSocketMessageType.Chat, id: getThisClientSession().messageIndex, messageType: ConsoleMessageType.UserChat,  body: messageJSON.command, clientDisplayName: clientObj?.displayName, clientId: clientId}));  // Send GDB output to the client
                    });
                    getThisClientSession().messageIndex++; // counter used to id and group console mssages.
                    // clients.forEach((client, id) => {
                        
                    //         client.send(JSON.stringify({error: false, input: false, clientId: clientId, type: WebSocketMessageType.Chat, body: messageJSON.command})); // Send initial message to client
                        
                    // });
                    break;

                case WebSocketMessageType.MouseUpdate:
                    if(clientObj.openFile)
                        replicateFunction((thisClientWs, thisClientId, thisClientObj) => {
                            if(!thisClientObj.openFile.name)
                                return;
                            if(clientSession.getClientObjectById(thisClientId).canEdit && thisClientObj.openFile.name == clientObj.openFile.name)
                                thisClientWs.send(JSON.stringify({ ...messageJSON, ...clientInfo(clientObj)})) // TODO Sanitize this
                        }, clientObj)
                break;
                case WebSocketMessageType.CodeChange:
                    if(!clientObj.canEdit) break;
                let shouldSave:boolean = messageJSON.saveFile;
                let shouldSaveTimeout;
                if(shouldSave==false)
                    shouldSaveTimeout = setTimeout(() => {
                        shouldSave=true;
                    }, 500);
                const fileName: string = messageJSON.fileName;
                    // save code to file
                if(shouldSave) // TODO replace true with shouldSave 
                    {
                        shouldSave=false 
                        
                        //   TODO make a more efficient way of updating the file, either by streams (streaming updates to file) or a save button.
                        fs.writeFile(path.join(clientFilesPath , fileName), messageJSON.body, (err) => {
                            if(err) console.log("Failed saving file! " + err)
                            if(checkSyntaxTimeout) clearTimeout(checkSyntaxTimeout)

                            checkSyntaxTimeout = setTimeout(() => {
                                if(clientObj.openFile.editorMode.checkCodeSyntax)
                                    clientObj.openFile.editorMode.checkCodeSyntax(clientSession, clientObj.openFile).then(json => {
                                        if(!JSON.parse(json)[0])
                                            return  replicateFunction((clientWs, localClientId) => {
                                                if(getThisClientSession().clientsActiveFile.get(localClientId) === getThisClientSession().clientsActiveFile.get(clientId))
                                                    clientWs.send(JSON.stringify({type: WebSocketMessageType.CompileResult, clientId: clientId, body: JSON.stringify(    [   {kind: 'success'} ]     )}))
                                                })
                                    replicateFunction((clientWs, localClientId) => {
                                        if(getThisClientSession().clientsActiveFile.get(localClientId) === getThisClientSession().clientsActiveFile.get(clientId))
                                            clientWs.send(JSON.stringify({type: WebSocketMessageType.CompileResult, clientId: clientId, body: json}))
                                        })
                                    }).catch(err => {
                                        console.error('syntax checker error: ' + err)
                                    })
                                
                            }, 400);

                        });
                    }
                    clientObj.openFile.changeContent(messageJSON.body)
                        // replicate changes to others
                    replicateFunction((clientWs, localClientId) => {
                        if(getThisClientSession().clientsActiveFile.get(localClientId) === getThisClientSession().clientsActiveFile.get(clientId))
                            clientWs.send(JSON.stringify({type: WebSocketMessageType.CodeChange, clientId: clientId,delta: messageJSON.delta, body: messageJSON.body, msgId: JSON.parse(message.toString()).msgId}))
                        }, clientObj)
                    
                    break;
                
                case WebSocketMessageType.ConsoleTyping:
                    if(!clientObj.canChat) break;
                    const TypingIndicatorType = messageJSON.status;
                    replicateFunction((clientWs, localClientId) => {
                            clientWs.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping,displayName: clientObj?.displayName, clientId: clientId, status: TypingIndicatorType}))
                        }, clientObj)
                break;
                    
                case WebSocketMessageType.CodeSelection:
                    //fs.writeFileSync(path.join(rootDirName, "cache", sessionId , "user_code.cpp"), messageJSON.code);
                   // console.log(type + " for sessionId " + sessionId);
                   if(!clientObj.canEdit) break;
                    const codeSelectionJSON = {type: WebSocketMessageType.CodeSelection, clientId: clientId, body: messageJSON}
                    getThisClientSession().clientCommandBuffer.set(clientId, {codeSelection: codeSelectionJSON})

                                                                                // rename this to something more apropriate eg guily client idk
                //    replicateSocketMessage(sessionId, clientId, true, {type: type, clientId: clientId, body: messageJSON}, (client) => { let filter = getThisClientSession()?.clientsActiveFile.get(client) != fileName; console.log(getThisClientSession()?.clientsActiveFile.get(client) + fileName); return filter;});
                   
                   replicateFunction((clientWs, localClientId) => {
                        if(getThisClientSession().clientsActiveFile.get(localClientId) === getThisClientSession().clientsActiveFile.get(clientId))
                             clientWs.send(JSON.stringify(codeSelectionJSON))
                    }, clientObj)
                
                    // clients.forEach((client, id) => {
                    //     if(clientId!=id)
                    //         client.send(JSON.stringify({error: false, type: type, body: messageJSON})); // Send initial message to client
                    // });
                    break;
                
                case WebSocketMessageType.FileManagement:
                    // Handle folder management commands here
                    // Example: Create a new folder, delete a folder, etc.
                    

                    /*

                    messageJson.command
                    messageJson.body


                    */
                    if(!clientObj.canEdit) break;
                    const commandType: FileManagementCommands = messageJSON.command;
                    

                    switch (commandType) {
                        case FileManagementCommands.Create:
                            new EditorFile(clientSession, messageJSON.name)


                    break;
                    case FileManagementCommands.Delete:
                        if(!clientObj.canEdit) break;
                        clientSession.files.find(file => file.name == messageJSON.name).delete(clientObj)
                       
                    break;

                    //  TODO Make this so it just return name and make seperate function for fle content, which will be called only when opening the file on the client. STORE IT IN CACHE, ADD A DIRTY VERIFICATION TO NOT SEND THE SAME SHI MULTIPLE TIMES DONT OPEN THE EDITOR UNTIL THE FILE HAS LOADED ON THE CLIENT SEND THE FILES ON  HANDSHAKE MAKE SURE IT IS ALL REPLICATED
                    case FileManagementCommands.List:                   
                        sendListFiles(clientFilesPath);
                    break;
                    case FileManagementCommands.Rename:
                        if(!clientObj.canEdit) break;
                         clientSession.files.find(file => file.name == messageJSON.name).rename(messageJSON.newName, clientObj)
                       
                        
                    break;

                    case FileManagementCommands.Open:
                        
                        openFile(messageJSON.body)
                        
                    break;
                    }
                    break;
                
                default:
                    
                 if(!clientObj.canEdit) break;
                    handleCommand(command, clients); // pass all the clients in the session
                            

                    async function handleCommand(command: string, sockets: Map<UUID, WebSocket>) {
                        const filePath = path.join(rootDirName, "cache", sessionId);
                    try {
                        console.log('handle command: ' + command)
                        if(command == "execute")
                        {
                            // fs.accessSync(filePath) // disabled to auto compile

                            async function executeProgram(): Promise<void> {
                                return new Promise<void>((resolveExectute, reject) => {
                                        // const filePath = path.join(rootDirName, "cache", sessionId, "main.exe");
                                         function runProgram(): Promise<void>[]
                                  {
                                    
                                    
                                    const mainPromise = new Promise<void>((resolve, reject) => {   
                                                buildAndRunCppSandbox(filePath, clientSession.clientsActiveFile.get(clientId),clientObj.editorMode, clientId, sessionId).then( async res => {
                                                    //     cwd:  path.join(rootDirName, "cache", sessionId,"clientFiles"), // we must add this for the program to have the correct directory for input files.
                                                    if(res == null) return resolve()
                                                        
                                                    try {
                                                        clientObj.openFile.editorMode.sendError = (err, fatal)  => {
                                                            // printClientConsoleError(err)
                                                            if(fatal)
                                                            {
                                                                // closeProcess(clientSession.process)
                                                                onClosedProgram(-1, 0, `<span class="console-error">${err}</span>`)
                                                                reject(err)
                                                            }
                                                                
                                                        } 


                                                        if(!clientObj.openFile.editorMode.isInterpreter)
                                                        {
                                                            replicateFunction((clientWs) => {
                                                                clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Compiling program.', clientId: clientId}));  // Send GDB output to the client
                                                            });

                                                            //execSync(`docker exec ${res.imageName} bash -c "g++ -g -O0 clientFiles/${res.fileName} -o main"`)
                                                            await clientObj.openFile.editorMode.compile(res, clientObj.openFile, false)
                                                            
                                                            replicateFunction((clientWs) => {
                                                                clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Compiled', clientId: clientId}));  // Send GDB output to the client
                                                            });
                                                        }
                                                        
                                                        // clientSession.program = spawn('docker', ['exec', "-i", res.imageName, "bash","-c", "./main"], {
                                                        //     stdio: 'pipe'  // pipe gives you access to stdin, stdout, stderr
                                                        //     });
                                                        clientSession.program = await clientObj.openFile.editorMode.execute(res)

                                                        readStdio(clientSession.program, messageJSON, res).then(()=> resolve())
                                                    }
                                                    catch(err)
                                                    {
                                                        console.error("Failed to run docker commands: " + err)
                                                    }
                                            });
                                       })
                                       
                                       return [spawnPromise, mainPromise]

                                  }

                                  
                                        if(false)
                                        {
                                            fs.stat(filePath, (err, stats) => {
                                            
                                            if (err) {
                                                // printClientConsoleError('Please compile the program first! '+err?.code);
                                                // return;
                                                replicateFunction((clientWs) => {
                                                        clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Compiling...', clientId: clientId}));  // Send GDB output to the client
                                                    });

                                                compileFile(clientId, sessionId).then(res => {

                                                            replicateFunction((clientWs) => {
                                                                    clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Compiled', clientId: clientId}));  // Send GDB output to the client
                                                                });

                                                            const promises = runProgram()

                                                            promises[0].then(() => {
                                                                replicateFunction((clientWs) => {
                                                                    clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Executing...', clientId: clientId}));  // Send GDB output to the client
                                                                });
                                                            })


                                                            promises[1].then(() => {
                                                                replicateFunction((clientWs) => {
                                                                    clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'finished', clientId: clientId}));  // Send GDB output to the client
                                                                });
                                                            })
                                                    
                                                }).catch(err => {
                                                    replicateFunction((clientWs) => {
                                                        clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Compile failed', error: err, clientId: clientId}));  // Send GDB output to the client
                                                    });
                                                    console.error('error while compiling for execute: ' + err) // TODO Send message to client that compilation failed
                                                    return
                                                })
                                                
                                            }
                                            else {
                                               
                                                fs.stat(path.join(rootDirName, "cache", sessionId, "clientFiles", "main.cpp"), (err, codeStats) => {
                                                    if(err)
                                                    {
                                                        console.error('error accessing code file: ' + err)
                                                        clientObj.sendMessage(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'ERROR: ' +err, clientId: clientId}));  // Send GDB output to the client

                                                    }
                                                    console.log(stats.mtimeMs < codeStats.mtimeMs - 500)
                                                    if(stats.mtimeMs < codeStats.mtimeMs - 500) // check if file was edited after compile.
                                                        compileFile(clientId, sessionId).then(res => {
                                                                replicateFunction((clientWs) => {
                                                                    clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Recompiled.', clientId: clientId}));  // Send GDB output to the client
                                                                });
                                                                // runProgram()

                                                                    const promises = runProgram()

                                                                    promises[0].then(() => {
                                                                        replicateFunction((clientWs) => {
                                                                            clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Executing...', clientId: clientId}));  // Send GDB output to the client
                                                                        });
                                                                    })


                                                                    promises[1].then(() => {
                                                                        replicateFunction((clientWs) => {
                                                                            clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'finished', clientId: clientId}));  // Send GDB output to the client
                                                                        });
                                                                    })


                                                            }).catch(err => {
                                                                replicateFunction((clientWs) => {
                                                                    clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Recompile failed!', error: err, clientId: clientId}));  // Send GDB output to the client
                                                                });
                                                                console.log('error compiling modifed file')
                                                                return
                                                            })
                                                      else  
                                                      {
                                                        //  replicateFunction((clientWs) => {
                                                        //     clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Executed...', clientId: clientId}));  // Send GDB output to the client
                                                        // });
                                                        const promises = runProgram()

                                                            promises[0].then(() => {
                                                                replicateFunction((clientWs) => {
                                                                    clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Executing...', clientId: clientId}));  // Send GDB output to the client
                                                                });
                                                            })


                                                            promises[1].then(() => {
                                                                replicateFunction((clientWs) => {
                                                                    clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Execution finished.', clientId: clientId}));  // Send GDB output to the client
                                                                });
                                                            })
                                                      }
                                                        

                                                })
                                                // fs.readFile(path.join(rootDirName, "cache", sessionId, "clientFiles", "main.cpp"), (err, data)=>{
                                                //     if(!err && data.toString() !== code)
                                                //         compileFile(clientId, sessionId).then(res => {
                                                //             runProgram()
                                                //         })
                                                //       else  
                                                //         runProgram()

                                                // })
                                                
                                            }



                                 




                                     });
                                        }
                                        else
                                        runProgram()[1].then(resolveExectute)
                                        .catch(err => {})
                                        
                                })
                                
                                    
                            }



                            // execute code normally.
                            if(getProcessFromMap()) // check if program is running
                            {
                                // printClientConsoleInfo('Restarting program...') // await queueCommand(program,command, sessionId);
                                // getProcessFromMap(sessionId)?.kill(); // kill the program
                                // removeProcessFromMap(sessionId);
                                // closeProcess(getProcessFromMap(sessionId)).catch(() => {
                                //     console.error("failed closing process.")
                                // }).then(() => {
                                    
                                //     executeProgram(); // now async execute the program
                                //  })


                                // onClosedProcess(sessionId);  // TODO Figure out why this was uncommented
                                // executeProgram();
                                closeProcess(clientSession.program,sessionId).then(() => {
                                    replicateFunction((clientWs) => {
                                        clientWs.send(JSON.stringify({type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, body: gdbBuffer.toString(), clientId: clientId}));  // Send GDB output to the client
                                        });
                                }).catch(err => replicateFunction((clientWs) => {
                                        clientWs.send(JSON.stringify({type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, body: err, clientId: clientId}));  // Send GDB output to the client
                                        }))
                        
                            } else executeProgram(); //buildAndRunCppSandbox(filePath, path.join(rootDirName, "cache", sessionId, "clientFiles"), clientId, sessionId) //
                    
                            
                        }
                        else if(command == "-exec-run")
                        {
                            
                            if(!getProcessFromMap()) {
                                buildAndRunCppSandbox(filePath, clientSession.clientsActiveFile.get(clientId),clientObj.editorMode, clientId, sessionId).then(async res => {
                                               
                                    mode="debug"; //set mode to debug
                                    try {
                                                                
                                        replicateFunction((clientWs) => {
                                            clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Compiling program.', clientId: clientId}));  // Send GDB output to the client
                                        });

                                        // execSync(`docker exec ${res.imageName} bash -c "g++ -g -O0 clientFiles/main.cpp -o main"`)
                                        await clientObj.openFile.editorMode.compile(res, clientObj.openFile, true)
                                        
                                        replicateFunction((clientWs) => {
                                            clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Compiled', clientId: clientId}));  // Send GDB output to the client
                                        });

                                        clientSession.gdbProcess = clientObj.openFile.editorMode.startDebugging(res)
                                        if(!clientSession.gdbProcess)
                                            return;
                                        addProcessToMap(sessionId, clientSession.gdbProcess);
                                    } catch (err){
                                        printClientConsoleError("docker error: " + err)
                                    }

                                    if(!getThisClientSession().process) console.error('Invalid session while starting debug process')
                                    printClientConsoleDebug("started debugging process.")
                               
                                    queueCommand(getProcessFromMap() as ChildProcess,'-break-insert 1\n', sessionId);
                                       
                                    clientSession.gdbProcess.stdout.on('data', (data) => {
                                        console.log("GDB Data: " + data.toString())
                                    })

                                    clientSession.gdbProcess.stderr.on('data', (derr) => {
                                        console.error("GDB Error: " + derr.toString())
                                    }) 

                                })


                            //     fs.accessSync(filePath)
                            //     mode="debug"; //set mode to debug
                            //     gdbProcess = spawn("gdb", ["-q",  "-interpreter=mi", filePath]); //"-ex", "set pagination off", 
                            //     addProcessToMap(sessionId, gdbProcess);
                                
                            //     if(!getThisClientSession().process) console.error('Invalid session while starting debug process')
                            //     printClientConsoleDebug("started debugging process.")
                            //     // gdbProcess.on('close', (code) => {
                            //     //     console.log('CLOSED DEBUG PROCESS')
                            //     //     onClosedProcess();
                            //     //     gdbProcess = undefined;
                            //     // })
                            //     // process.stdin.pipe(gdbProcess.stdin)
                                
                            //         // gdbProcess.stdin.write('-file-exec-and-symbols'+filePath+'\n');
                            //         // gdbProcess.stdin.write();
                                    
                            //         queueCommand(getProcessFromMap() as ChildProcess,'-break-insert 1\n', sessionId);
                            //         // gdbProcess.stdin.write('-exec-run\n');
                            //     gdbProcess.stdout.on('data', (derr) => {
                            //         console.log(derr.toString())
                            //     })

                            // gdbProcess.stderr.on('data', (derr) => {
                            //         console.error(derr.toString())
                            //     })
                                app.get("/requestValue", (req,res) => {
                                    const command = req.query.value;
                                    const cmdId: number = parseInt(req.query.cmdId as string);
                                    // console.log(clientId + " " + command)
                                    if(mode != "debug") res.status(400).send('Bad Request: GDB process not active');
                                    if(!clientSession.gdbProcess)  res.status(400).send('Bad Request: GDB process not active');
                                    if(!command)     res.status(400).send('Bad Request: invalid command');
                                    //res.send({code: fs.readFileSync("user_code.cpp").toString()});
                                    if(mode != "debug" || !clientSession.gdbProcess || !command) return;
                                    
                                    new Promise<void>((resolve, reject) => {
                                        let gdbBuffer = "";
                                
                                        const onData = (data: Buffer) => {
                                           
                                                gdbBuffer += data.toString();
                                                    // Check if the full response has arrived
                                            if (gdbBuffer.includes("(gdb)")) {
                                                if(parseInt((gdbBuffer.toString().match(/(?<=\$)\d*/)?.[0] as string)) === cmdId+1) {
                                                    
                                                // We have everything, remove listener
                                                clientSession.gdbProcess?.stdout?.removeListener("data", onData);
                                                resolve();
                                                return res.send(({
                                                    error: false,
                                                    input: false,
                                                    type: WebSocketMessageType.Output,
                                                    messageType: ConsoleMessageType.Debug,
                                                    body: gdbBuffer,
                                                    message: command?.toString(),
                                                    cmdId: cmdId,
                                                    msgId: clientSession.gdbProcess?.pid
                                                }));

                                                } else gdbBuffer = "";
                                
                                            }
                                            
                                
                                        
                                                
                                            
                                        };
                                        if(clientSession.gdbProcess && clientSession.gdbProcess.stdin && clientSession.gdbProcess.stdout) 
                                        {
                                            // Use .on instead of .once, because GDB output can be split
                                            clientSession.gdbProcess?.stdout?.on("data", onData);
                                    
                                            // Send the command
                                            clientSession.gdbProcess?.stdin?.write("print " + command + "\n");
                                        } else console.error("GDB process not found for session " + sessionId);
                                    });
                    
                                });
                                // try {
                                //     // gdbProcess.stdout?.on("data", (data) => {
                                //     //     console.log(data.toString())
                                //     // });
                                //     // getThisClientSession().process?.stdin?.write("-break-insert main\n-exec-run\n")
                                    

                                // } catch 
                                // {
                                //     console.error(new Error('failed executing starting commands'))
                                // }
                                // queueCommand(getProcessFromMap(sessionId) as ChildProcess,command, sessionId);// gdbProcess.stdin.write(message + "\n");
                                // queueCommand(getProcessFromMap(sessionId) as ChildProcess,"break main", sessionId);// gdbProcess.stdin.write(message + "\n");
                                // queueCommand(getProcessFromMap() as ChildProcess,'run', sessionId);
                                //  queueCommand(getProcessFromMap() as ChildProcess,'run', sessionId);
                                // queueCommand(getProcessFromMap() as ChildProcess,command, sessionId);
                                // gdbProcess.stdout.on("data", (data) => {
                                //     gdbBuffer += data.toString();
                                //     ws.send(JSON.stringify({error: false,  input: false, body: gdbBuffer.toString()}));  // Send GDB output to the client
                                //     gdbBuffer = "";
                            
                                // });
                            
                            
                                // gdbProcess.stderr.on("data", (data) => {
                                //     const errorMsg = "Error: " + data.toString();
                                //     ws.send(JSON.stringify({error: true,  input: false, body: errorMsg}));
                                // });
                                // process.stdin.resume()
                                // process.stdin.on('data', function (chunk) {
                                //     process.stdout.write('data: ' + chunk);
                                // });
                            }
                            else  await queueCommand(getProcessFromMap() as ChildProcess,command, sessionId);// gdbProcess.stdin.write(message + "\n");
                                
                                
                
                        } else if(command==="-exec-quit") {
                            
                             onClosedProcess()//.then(() => {
                                printClientConsoleInfo("Closed process")
                                replicateFunction((clientWs) => {
                                    clientWs.send(JSON.stringify({type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, body: "gdb", clientId: clientId}));  // Send GDB output to the client
                                    });
                           
                            
                        } else if(clientSession.gdbProcess!=undefined)
                        {
                            console.log('queue command')
                            // executeCommand(getProcessFromMap() as ChildProcess,'-stack-list-variables --all-values',sessionId).catch(err => console.error('queue command err: ' + err))
                            
                                executeCommand(getProcessFromMap() as ChildProcess,command,sessionId).then(() => {

                                console.log('COMMAND')
                            }).catch(err => console.error('queue command err: ' + err))
                        } else if(clientSession.program!=undefined)
                            {
                                if(clientSession.program?.stdin?.writable)
                                {
                                        clientSession.program?.stdin?.write(command); //program.stdin.write(message + "\n");
                                        clientObj.sendMessage({type: WebSocketMessageType.ExecuteStatus, input: 1})
                                }
                                else
                                    console.error("stdin isnt writeable")
                                // dataTimeout = setTimeout(() => {
                                                            
                                                        // }, 200);
                                // console.log("sent to program")
                            }
                            else
                            console.error('no process was found')
                        
                    
                 
                    } catch(err)
                    {
                        printClientConsoleError(err)
                        console.log(err)
                    }
        }}
    } catch (err) {
        console.error("Command execution error:", err);
        ws.send(JSON.stringify({ error: true,type: WebSocketMessageType.Error, body: "Server execution failed: " + new Error(err) }));
    }
    }); 
    
    // First time, setup breakpoints manually and run
    // ws.on("open", () => {
    //     // Set breakpoint at main() and start the program

    //   //  gdbProcess.stdin.write("break main\n");
    //    // gdbProcess.stdin.write("run\n");
    //    console.log("Client " + clientId + " connected to GDB server dkkkkkkkkkkk");
    // });

    function onClosedProcess() {
        removeRunningProcessFromMap();
        if(isShared) shared.removeProcess(sessionId)
        clientSession.program = undefined
    // replicateFunction((thisclientWS, thisclientid) => {
    //     thisclientWS.send(JSON.stringify({type: WebSocketMessageType.Output, message: 'end'}))
    // })
            // const filePath = path.join(rootDirName, "cache", sessionId, "main.exe");
        //   fs.unlinkSync(filePath)
    }

    async function closeProcess(process: ChildProcess | undefined, processId?: UUID): Promise<void>
    {
        try {
            return await new Promise<void>((resolve, reject) => {

                if (process) {

                    if (!process.killed && process) {
                        process.kill(9);
                        
                        process.on(('close'), (code) => {


                            onClosedProcess();
                            resolve();
                            console.log('stopped process')
                        });

                        setTimeout(() => {
                            onClosedProcess();
                            reject('timed out closing process');
                            
                        }, 3000);
                    }

                    else {
                        onClosedProcess();
                        resolve();
                    }

                }
                resolve()
            });
        } catch (err) {
            console.log('caught error while closing process: ' + err);
            onClosedProcess();
            
        }
        
    }

    function onCloseSession() {

        const process = getProcessFromMap(clientSession);
        const closedClientId = clientId;
        replicateSocketMessage(sessionId, clientId, true, {type: WebSocketMessageType.CodeSelection, body: ""});
        clients.delete(clientId);
        
        clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
        // getThisClientSession()?.clients.splice(getThisClientSession()?.clients.indexOf(clientId)||-1 , 1);
        clientSession?.removeClient(clientId)
        if(isShared) shared.removeClient(clientId);
        //sessions.delete(sessionId);
        // if(sessions.get(sessionId)?.indexOf(clientId) === -1)  console.error("Client not found in session " + sessionId);
        //    else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(clientId) || -1, 1);
        
          
        // console.log("clients in sessions " + clientSession.clients.size)
        if(!clientSession)
            return;
        if(clientSession.clients.size == 0 || clientSession==undefined) 
            {
                   // sessions.delete(sessionId);
                closeProcess(process)
                .finally(() => {
                    if(clientSession.sessionContainer)
                        exec(`docker rm ${clientSession.sessionContainer.imageName} -f -v`)
                    const dirPath = path.join(rootDirName, "cache", sessionId); 
                    if(false) // TODO check if its okay to delete the session folder
                        if(dirPath) 
                            fs.rm(dirPath, { recursive: true }, (err) => { // TODO Implement a way to unlink files so, if a process is running, it will unlink so the files can be properly deleted.
                                if(err)
                                    console.error(err)
                                console.log("deleted cache folder for sessionId " + sessionId);
                            });
                        else 
                            console.error(new Error("Couldnt delete session folder, invalid path."))
                    
                    sessionMap.delete(sessionId);
                    if(isShared) shared.removeSession(sessionId);
                    

                })



        } else
        {
            //session is still active, send message to other clients
            // if(getThisClientSession()?.clients.size != 0)
            const session = clientSession.clients.size!=1 ? {isHost: clientObj.isHost, clients: clientSession.clients.size} : undefined;
            if(clientObj)
                if(clientObj.isHost)
                {
                    const newHost = Array.from(clientSession.clients.values())[Math.floor(Math.random()*clientSession.clients.size)]
                    newHost.isHost = true;
                    clientSession.hostClient = newHost;
                     
                    newHost.sendMessage({type: WebSocketMessageType.ColabData, colabCommand: "HOST", body: "You're now the host of this session."})
                }

            replicateFunction((clientWs) => {
                clientWs.send(JSON.stringify({type: WebSocketMessageType.ColabData, ...clientInfo(clientObj), colabCommand: "DISCONECT", session, body: clientObj?.displayName + " has left."}))
            }, clientObj)
            console.info('session is still active')
            // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, body: "$: Client " + clientId + " disconnected!"});
        }

    }

    // Handle WebSocket disconnection
    ws.on("close", () => {
        onCloseSession();
        console.log("Client " + clientId + " disconnected");
    });
    
    function replicateFunction(callback: (thisClientWs: WebSocket, thisClientId: UUID, clientObj: ClientObject) => void, excludeClientObj?:ClientObject) {
        // if(!getThisClientSession() || !getThisClientSession().clientsSockets) return console.error(new Error("invalid session or client sockers"));
        let excludeClientId: UUID | undefined;
        if(excludeClientObj)
             excludeClientId = getThisClientSession().getClientId(excludeClientObj);
        if(!getThisClientSession()) return console.error('invqlid session')
        getThisClientSession().clientsSockets.forEach((thisClientWs, thisClientId) => {

    
            if(!thisClientWs) return;
            if(excludeClientId != thisClientId)
                callback(thisClientWs as WebSocket, thisClientId as UUID, clientSession.clients.get(thisClientId));
        });
    }
    
});



})

process.on('exit', () => {
    console.log('Server is exiting...')
    wss.clients.forEach(client => {
        client.close(1012, 'server is being shut down')
    });
})
 


process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server')
    wss.clients.forEach(client => {
        client.close(1012, 'server is being shut down')
    });
    // wss.close()
    // wss.clients.forEach(client => {
    //     client.close(1012, 'server is being shut down')
    // });
    server.close(() => {
        if(isShared) shared.close()
    })
})



process.on('SIGUSR2', () => {
	console.log('Recv. SIGUSR2');

	setTimeout(() => (console.log('Exiting now.'), process.exit(0)), 5000);
});




function windowsPathToDocker(path: string): string {
    const drive = path[0].toLowerCase();
    return `/${drive}${path.slice(2).replace(/\\/g, '/')}`;
  }

import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import { Project, User } from "../../generated/prisma";
import { IncomingMessage } from "http";
import { cwd, stdin } from "process";
import { parseGDBString } from "./gdbUtilities";
import { run } from "googleapis/build/src/apis/run";




// server.on("connection", (socket) => {

            
//             server.getConnections(function(error, count) {
//                 if(error)
//                     console.log(error)
//                 if(count)
//                     console.log(new Date().toLocaleTimeString() + " $   " + count);
            
//             });

// })


// server.on("request", () => {
//             server.connections
//             server.getConnections(function(error, count) {
//                 if(error)
//                     console.log(error)
//                 if(count)
//                     console.log(new Date().toLocaleTimeString() + " $   " + count);
            
//             });

// })
        
    


app.use(handle404);




