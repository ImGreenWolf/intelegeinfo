import express, { NextFunction } from "express";
import fs from "fs";
import { ChildProcess, exec, spawn } from "child_process";
import WebSocket, { WebSocketServer } from "ws";
import path from 'path';
import { ConsoleMessageType, WebSocketMessageType } from '../../dist/shared/types'
import { Readable, Writable } from "stream";
import {ClientObject, ClientPermissions, EditorFile, EditorPermission, EditorSession} from "./types"
import { QRCode } from "qrcode";
import * as qrcode from "qrcode";
import archiver from 'archiver';
export const rootDirName = path.resolve("./") //'C:\Users\radub_qd\intelegeinfo')

// import {RedisStore} from "connect-redis"
// // import {Redis} from "redis"
// import Redis, { Cluster } from 'ioredis';
// import session from "express-session"
// import { v4 as uuidv4 } from 'uuid';
const app = express();
const compression = require('compression')
var websocketReg = new Map<string, WebSocketServer>()
export const tokenCookieName = 'iiauthtoken'

import SharedStateManager from "./sessionStore"
import { Prisma, Problem } from "../../generated/prisma";
import prisma from "./dbClient";
import loginManager, { clearAuthCookies } from './login.js'
import signupManager from './signup.js'
import profileManager from './profile.js'
import { UUID } from "crypto";
import jwt from "jsonwebtoken"
import cookieParser from 'cookie-parser'
import * as users from './usersManager'
import  coursesManager  from './views/courses'
import  challanges  from './challanges/challangesManager'
import { router as usersManager } from './usersManager'
import GuideCreator from "./guideCreator"
import { privateKey } from "./login.js";
import * as nodepty from "node-pty"

import crypto from 'crypto';
import bodyParser from 'body-parser';
import * as EditorModes from './editor-modes/'
import Metrics, { wssAPI } from './metrics'
import examSubjects from './examSubjects'
import tx2 from 'tx2';
import { FileManagementCommands,sessionCookieName } from "../../dist/shared/types";
import { HandshakeMessage, WebSocketMessage } from "../../shared/src/messageTypes"
import router, { handleExecError, handleSucces, ProblemTest, testProblem } from "./problemManager";
import classManager from './classManager/classManager'
interface ResponseWRaw extends IncomingMessage 
{
    rawBody: Buffer
}
app.use(compression())

app.use(express.json({
    verify: (req, res, buf) => {
        (req as ResponseWRaw).rawBody = buf; // Save raw body
    }
}));


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use('/user', usersManager)
app.use('/login', loginManager);
app.use('/signup', signupManager);
app.use('/profile', authMiddleware, profileManager)
app.use('/vnc', express.static(path.join(rootDirName, 'vnc', 'noVNC')));
app.use('/metrics', Metrics)
app.use('/classes', classManager)
app.use('/courses', coursesManager)
app.use('/subiecte', examSubjects)
app.use('/interview', challanges)
app.post('/github/onpull', (req, res) => {
    try {
        
        if(!req.body) throw "Empty request body.."
        const signature = req.headers['x-hub-signature'] as string;
        if (!signature) {
            res.status(400).send('No signature');
            return;
        }
        const hmac = crypto.createHmac('sha1', 'info');
        hmac.update((req as unknown as ResponseWRaw).rawBody);
        const digest = 'sha1=' + hmac.digest('hex');
        const { commits } = req.body;
        console.log(commits[0].message);
        console.log(digest);
        if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
            const output = execSync('cd ' + rootDirName + ' && git fetch origin && git reset --hard origin/staging', {timeout: 2000});
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


app.use('/client/scripts',express.static(path.join(rootDirName, 'dist', 'public')));
app.use('/client/modules',express.static(path.join(rootDirName, 'node_modules')));

app.use('/editor/codeEditor.js', express.static(path.join(rootDirName,'dist', 'public', 'codeEditor.js')))
app.use('/editor/components.js', 
    (req, res) => {

        try {
             fs.readFile(path.join(rootDirName,'dist', 'public', 'components.js'), (err, data) => {
            const renderer = data.toString()
            let newRender = renderer;
                //  TODO Improve this system
            const userId =users.getIdFromJWT(req)
            if(userId)
                users.getUserData(userId).then((userdata) => {
                    if(!userdata)
                        throw 'invalid user'
                    newRender = newRender.replaceAll(`loggedIn = false`, `loggedIn = true`).replaceAll(`const username = ''`, `const username = "${userdata.username}"`)
                    res.contentType('js').send(newRender)
                    }).catch(err =>  clearAuthCookies(res).contentType('js').send(newRender))
            else
                res.contentType('js').send(newRender)

               
            
            
            })
        }
        catch (err)
        {
           console.error(err)
            return;
        }
       
        


    })

app.get('/editor', (req, res) => {
    fs.readFile(path.join(rootDirName, 'public', 'editor.html'), (err,file) => {
        let text = file.toString()
        const userId  = users.getIdFromJWT(req);
        
        const logged = userId!=undefined;
        if(logged) 
            {
                users.updateActiveAtForUser(userId as number).then((userdata) => { // getUserData( as number)
                    if(!userdata)
                    {
                        res.contentType('html').send(text);
                        return;
                     }
                    text = text.replace('#{login}',` <li><button class="share-session" onclick="window.editor.listProjects()" id='listProjects'>Projects</button></li>\n<li><a href='/profile'>Hey <p class='user-name'>${userdata?.username}</p><div class='focus-line'></div></a></li>`)
                    text = text.replace(/\*\{(.*)\}/g, '$1')
                    res.contentType('html').send(text.toString());
                })
            }
        else 
        {
            text = file.toString().replace('#{login}','<li><a id="signup" href="../signup">Sign-up</a><a id="login" href="../login">Login</a></li>')
            text = text.replace(/\*\{(.*)\}/g, '')
            res.contentType('html').send(text.toString());
        }
    })

})

app.post('/feedback', async (req,res) => {
    const {body} = req.body;
    const userId = users.getIdFromJWT(req)
    prisma.feedback.create({
        data: {
            body,
            userId
        },
        include: {
            user: true
        }
    }).then(async feedback => {
        if(!await users.transporter.verify())
        {
            res.send('Am primit feedbackul tau!')
            return 
        }
        const logoSvg = fs.readFileSync(path.join(rootDirName, 'public','media','logoText.svg'))

        const logoData = `<img src="data:image/svg+xml;base64,${logoSvg.toString('base64url')}">`
        const mailRes = await users.transporter.sendMail({
            to: 'office@intelegeinfo.ro',
            cc: 'radubitere5@gmail.com',
            from: 'Feedback <office@intelegeinfo.ro>',
            subject: 'Feedback intelegeinfo - ' + feedback.user.username,
            // text: 
            // `
            // Am primit feedback #${feedback.id} pe ${feedback.createdAt.toLocaleString()}     de la ${feedback.user.firstName} ${feedback.user.lastName} cu userId ${feedback.user.id}:

            // ${feedback.body}
            // `
            html:
            `
            ${logoData}
            <p>
                Am primit feedback #${feedback.id} pe ${feedback.createdAt.toLocaleString()} de la ${feedback.user.firstName} ${feedback.user.lastName} cu userId ${feedback.user.id}:
            </p>
            <br>
             <pre>${feedback.body}</pre>
            `
        })
            res.send('Am primit feedbackul tau! Iti multumim!')
        
    }).catch(err => res.send("Eroare.. "+err))

})

app.use('/editor/', express.static(path.join(rootDirName,'dist', 'public')))

app.get('/editor/mode_cpp_custom.js', (req, res) => {
    res.sendFile(path.join(rootDirName,'dist', 'public', 'mode_cpp_custom.js'))
})
app.get('/editor/cpp_worker.js', (req, res) => {
    res.sendFile(path.join(rootDirName,'dist', 'public', 'cpp_worker.js'))
})
app.get('/editor/worker-base.js', (req, res) => {
    res.sendFile(path.join(rootDirName,'public', 'ace-builds-master', 'src-noconflict', 'worker-base.js.js'))
})
// app.use(express.static("public"));

app.use("/guides", GuideCreator);

app.use('/shared/src/',  express.static(path.join(rootDirName,'dist', 'shared')))

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
function checkboxValue(checkbox)
{
    return checkbox==='on' ? true : false
}
app.post('/editor/startsession/:id', (req, res) => {
    try{
        const id: UUID = req.params.id as UUID;
        if(!req.body && !id) throw 'invalid input';
        if(sessionMap.has(id))
        {
            const { chat, codePermission, voice, sandbox, externals, anonymous, language } = req.body
            const session = sessionMap.get(id)
            session.makeSessionPublic({enableChat: checkboxValue(chat), 
                editorPermission: codePermission as EditorPermission,
                enableVoice: checkboxValue(voice),
                sandboxUsers: checkboxValue(sandbox),
                externalLinks: checkboxValue(externals),
                anonymousNames: checkboxValue(anonymous),
                allowedLanguage: EditorModes.modes.find(mode => mode.name == language)
            })

            if(session.isPublic)
            {
                res.status(200).send(session.joinCode)
                return;
            }
            res.status(201).send(session.joinCode)
            return
        }
        else throw ''
    }
    catch(err)
    {
        res.status(500).send(err)
    }
    
        
    
})
app.get('/editor/languages', (req, res) => {
    const languages:{name, src,ext?, description?, versions?, color?}[] = []
    for(const mode of EditorModes.modes)
    {
        languages.push({name: mode.name, src: mode.logoSrc, color: mode.color, description: mode.description, versions: mode.versions, ext: mode.extension[0], })
    }
    res.send(JSON.stringify(languages))
})

app.use('/editor/problem', router)

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



// app.get('/problem', problemCreator);
app.get('/embed/editor', (req, res) => {
    fs.readFile(path.join(rootDirName, 'public', 'embedEditor.html'), (err,file) => {
        res.send(file.toString());
    })

})



app.use(cookieParser());

const privateKeyPem = fs.readFileSync(path.join(rootDirName,'private.pem'), 'utf8');
export function authMiddleware(req, res, next:any, role?:string) {
    // if() return res.status(403).json({ error: 'failed reading cookies' });
    const token = users.getJWT(req);

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
       clearAuthCookies(res).status(403).json({ error: 'Invalid token' });
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






    //                      END                      //  
function onServerStart()
{
    const err = undefined
    if(err)
        console.error("error: "+err)
    else
    console.log("Server running on port " + PORT)

    cleanUp()

    exec('sudo turnserver -a -o -v -n', (err, stdout) => {
        if(err)
            console.error('Couldnt start turn server')
        else
            console.log('Started turn server')
        console.log(stdout)
    })

    exec('docker image prune -f -a')
}

import * as https from 'https'
import * as http from 'http'
//          GLOBAL  SERVER  VARIABLES       //
    const PORT = process.env.PORT || 3000;
    const SECPORT = process.env.SECPORT || 3443;
    try  {
        var privkey = fs.readFileSync(process.env.PRIVKEYPATH)
        var fullchain = fs.readFileSync(process.env.FULLCHAINPATH)
    }
    catch(err)
    {

    }
    const credentials = {key: process.env.NODE_ENV == 'development' ? '' : privkey || '',
        cert: process.env.NODE_ENV == 'development' ? '' :  fullchain || ''}

if(process.env.NODE_ENV == 'development')
    console.log('SERVER RUNNING IN DEV MODE')

let httpMeter = tx2.counter('http connections')
var httpsServer = https.createServer(credentials, app);

if(fullchain && privkey)
    var httpServer = http.createServer(process.env.NODE_ENV == 'development' ? app : (req,res) => {
        res.statusCode = 301;
        res.setHeader('Location', (req.headers.host == 'intelegeinfo.ro' ? 'http://' : 'https://') + req.headers.host + '/' + req.url);
        res.end();
        httpMeter.inc(1)
    });
else var httpServer = http.createServer(app);


let connectionPromise: Promise<void> | undefined;
let connectionPromiseTimeout: NodeJS.Timeout;
const codeMap: Map<number, UUID> = new Map()

const unsecureServer = httpServer.listen(PORT);
const secureServer = httpsServer.listen(SECPORT)
export const server = process.env.NODE_ENV == 'development' ? unsecureServer : secureServer;

server.on('listening', onServerStart)

    // app.listen(PORT, '0.0.0.0', onServerStart);
    // export const wss = new WebSocket.Server({server: server, clientTracking: true,  });

    export let clients: Map<UUID, WebSocket> = new Map(); // should be okay to keep local
    // const sessions: Map<UUID, UUID[]> = new Map();

    export let runningProcesses: Map<UUID, ChildProcess> = new Map();
    export let sessionMap: Map<UUID, EditorSession> = new Map<UUID, EditorSession>(); // SESSION ID / EDITOR OBJECT
    const buildTag =`cpp-image`;



    export const wss = new WebSocket.Server({noServer: true, clientTracking: true,  });
    import { wssFS, wssRTC } from "./peerConnectionManager";

    

//                      END                      //  
    export function newWSS(path)
    {
        const wss = new WebSocket.Server({noServer: true})
        if(!websocketReg)
            console.error('invalid websocket reg')
        websocketReg.set(path, wss)
        return wss;
    }


      server.on('upgrade', function upgrade(request, socket, head) {
        const { pathname } = new URL(request.url, 'wss://intelegeinfo.ro');
            switch(pathname){
        case '/api': 
            wssAPI.handleUpgrade(request, socket, head, function done(ws) {
                wssAPI.emit('connection', ws, request);
            });
            break
        case '/directSharing': 
            wssFS.handleUpgrade(request, socket, head, function done(ws) {
                wssFS.emit('connection', ws, request);
            });
            break
        case '/editor':
            wss.handleUpgrade(request, socket, head, function done(ws) {
                wss.emit('connection', ws, request);
            });
            break;
        case '/rtc':
        wss.handleUpgrade(request, socket, head, function done(ws) {
        wssRTC.emit('connection', ws, request);
        });
        break
        default:
            
            if(!websocketReg || !websocketReg.has(pathname))
                socket.destroy();
            const routedWS = websocketReg.get(pathname)
            routedWS.handleUpgrade(request, socket, head, function done(ws) {
                routedWS.emit('connection', ws, request);
            })
}
});
//@ts-ignore
let meter = tx2.counter('users')

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
    console.log("Async removing previous sandbox builds...")
    exec(`docker system prune`, {timeout: 3000}, (err, data) => console.log(data))

    console.log("Removing previous sandbox containers: " + execSync(`docker ps ${filter} -q |  xargs --no-run-if-empty docker rm --force | docker system prune`, {timeout: 5000}))
});

}




function getClientFilesPath(sessionId) // DEPRECATED
{
    return path.join(rootDirName, "cache", sessionId,"clientFiles");
}
    


function updateUserMeter()
{
    
    meter.reset()
    meter.inc(wss.clients.size)
}


const baseUrl = 'https://intelegeinfo.ro'
wss.addListener('connection', async (ws: WebSocket, req) => {

    updateUserMeter()

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
    let shouldSave:boolean = false; 
    let shouldSaveTimeout;
    const isEmbededEditor = new URL(req.url, baseUrl).searchParams.get('embeded') == 'true'  || req.headers['Sec-Fetch-User'] =='?1'
    const sameOrigin = req.headers.referer == 'intelegeinfo.ro' || req.headers.referer
    const cookies = req.headers.cookie;
    const jwtCookie = getJWTCookie(cookies)
      function getJWTCookie(cookies) { return cookies
      ?.split("; ")
      .find((c) => c.startsWith(tokenCookieName + "=")) 
      ?.split("=")[1];}
    const recoveredSession: UUID | undefined = cookies
      ?.split("; ")
      .find((c) => c.startsWith(sessionCookieName+"="))
      ?.split("=")[1] as UUID;
    let userData: users.UserNoPassword |undefined;
    let userLoggedIn: boolean = false
    users.updateActiveAtForUser(users.getClientId(jwtCookie as string) as number).then((userdata) => {
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
    
      
    }).catch(err => {
        console.error("error retrieving client data: ", err)
    })
    .finally(() => {
        
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


function endConnectionPromise()
{
    if(connectionPromiseTimeout)
        clearTimeout(connectionPromiseTimeout)
    connectionPromiseTimeout=undefined
    if(connectionPromise)
        connectionPromise=undefined
}
    awaitHandshake()
    //  TODO Improve this 
    async function awaitHandshake()
    {
        if(clientObj != undefined)
        {
            console.warn('retrying handshake')
        }

        if(connectionPromise)
        {
            console.warn('Another user is already connecting')
            var timeout = setTimeout(() => {
                awaitHandshake()
            }, 500);  

            connectionPromise.then(() => 
            {
                if(timeout)
                    clearTimeout(timeout)
                timeout=undefined
                endConnectionPromise()
                handshake(req)
                
            }).catch(err => {
                endConnectionPromise()
                console.error('kksjsjkdjsdkj on timeout', err)
            }).finally(() => {
                if(timeout)
                    clearTimeout(timeout)
                timeout=undefined
            })
                
        }
        else
        {
            handshake(req)
            if(!connectionPromise)
                throw 'invalid'
            connectionPromise.then(() => {
                endConnectionPromise()
                if(timeout)
                    clearTimeout(timeout)
                timeout=undefined
            })
            // var timeout = setTimeout(() => {
            //     awaitHandshake()
            // }, 500);
        }
                
        
    } 

    



    function handshake(req: IncomingMessage) {
        const urlParams = new URL("https://intelegeinfo.ro/editor"+ req.url).searchParams 

        // session id to connect to
        const wssessionId: UUID | undefined = urlParams.get('session') != undefined || urlParams.get('session') as UUID != undefined ? urlParams.get('session') as UUID : recoveredSession ? recoveredSession : undefined;

        let isHost = false;
        // //handle heartbeat
        // heartbeatInterval = setInterval(() => {
        //     // server.getConnections(function(error, count) {

        //     //     console.log(Date.now + ":   " + count);
            
        //     // });
        //     heartbeatTimestamp = Date.now(); // Update the heartbeat timestamp when a message is received
        //     ws.send(JSON.stringify({type: WebSocketMessageType.Heartbeat, connections: server.connections, expectedDelay: heartbeatTimeout})); // Send a ping message to the client every 30 seconds
        //     if(Date.now() - heartbeatTimestamp >= heartbeatTimeout*2) {
        //         //console.log("Client " + clientId + " timed out ");
                
                    
        //         //sessions.delete(sessionId);


        //         if(getThisClientSession()?.clients.get(clientId))  console.error("Client not found in session while trying to time out client  " + sessionId);
        //             else getThisClientSession()?.clients.delete(clientId)
        //         clients.delete(clientId);
        //         clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
        //         ws.close(); // Close the connection if no response received within double of timeout seconds
        //     }
            
        // }, heartbeatTimeout);
        if(connectionPromiseTimeout)
        clearTimeout(connectionPromiseTimeout)
    connectionPromiseTimeout=undefined
        // TODO Check if session exists, otherwise create a new one and make this client the host.
        if(connectionPromise)
            console.warn('connection promise is taken')
        try {
             connectionPromise = new Promise((resolve, reject) => {
                try {


            if(wssessionId) { 
                //client connected to existing session
                const activeSession = sessionMap.has(wssessionId) || (isShared && shared.getSession(wssessionId));
                if(activeSession) // = There is an active session, join it.
                {
                    
                    if(isShared) {if(shared.getSession(wssessionId)) clientSession = shared.getSession(wssessionId) as EditorSession;} // sessionMap.get(wssessionId ||  uuidv4() as UUID) || new EditorSession; 
                        if(!sessionMap.get(wssessionId as UUID)) return console.error(new Error("Didnt find session in sessionMap while joing session"))
                        else clientSession = sessionMap.get(wssessionId as UUID) as EditorSession;
                    if(!clientSession.isPublic) 
                    {
                        ws.close(3000,"This session doesn't exist or isn't puiblic. <br> <a href='/editor'>Create a new session</a>")
                        resolve()
                        return
                    }

                    clientId = (getThisClientSession() || clientSession)?.spawnClient(ws,urlParams.get('displayName'),userData)

                    clientObj = getThisClientSession().getClientObjectById(clientId);
                    clients.set(clientId, ws);
                    isHost = false;
                    // printClientConsoleDebug('joining session: ' + clientSession.sessionId)
                }
                else // there is no session, create it.
                {
                    
                    //getThisClientSession()?.clients.push(clientId); // add client to client list.
                    clientSession = createThisClientSession(wssessionId);
                    clientId = getThisClientSession()?.spawnClient(ws, urlParams.get('displayName'),userData)
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
                    shared.getSession(sessionId)?.clientsMap.set(clientId, clientObj)
                    shared.addClient(clientId, sessionId);
                    shared.updateSession(sessionId, clientSession)
                } 
                console.log(urlParams)
                if(urlParams.has('embeded'))
                        clientSession.isPublic = true
                
                connectionReady(!isHost, req).finally(resolve)
                return;
            } else
            {

                //client connected to new SOLO session
                clientSession = createThisClientSession();
                
                if(getThisClientSession() != undefined)
                {
                    sessionId = clientSession.sessionId;
                    clientId = getThisClientSession()?.spawnClient(ws,urlParams.get('displayName'), userData)
                    clientObj = getThisClientSession().getClientObjectById(clientId);
                    // to automatically make public if it has isPublic query
                    

                    clientFilesPath = path.join(rootDirName, "cache", sessionId,"clientFiles");
                    sessionMap.set(clientSession.sessionId, clientSession) // TODO Implement this in EditorSession class & polish it

                } else 
                    console.error(new Error("Failed to create SOLO session"))
                if(clientObj && shared)
                {
                    shared.getSession(sessionId)?.clientsMap.set(clientId, clientObj)
                    shared.addClient(clientId, sessionId);
                    shared.updateSession(sessionId, clientSession)
                }
                
                clients.set(clientId, ws);
                
                // will always be false
                connectionReady(false, req).finally(resolve)

            }
            }
            catch(err)
            {
                if(connectionPromiseTimeout)
                    clearTimeout(connectionPromiseTimeout)
                connectionPromiseTimeout=undefined
                endConnectionPromise()
            }
            
        })
        
        // connectionPromise.catch(res => {
        //     console.log(res)
        //      connectionPromise = undefined
        //      if(connectionPromiseTimeout)
        //      {
        //         clearTimeout(connectionPromiseTimeout)
        //         connectionPromiseTimeout = undefined
        //      }
        // })
        
        connectionPromise.catch(err => {
                if(connectionPromiseTimeout)
                    clearTimeout(connectionPromiseTimeout)
                connectionPromiseTimeout=undefined
                endConnectionPromise()
            }).then(() => 
            {
                
              if(connectionPromiseTimeout)
        clearTimeout(connectionPromiseTimeout)
    connectionPromiseTimeout=undefined
                
            })

        //  connectionPromiseTimeout = setTimeout(() => {
        //     console.error('CONNECTION PROMISE TIMEOUT')
        //     ws.close(1011, 'Something went wrong... Please refresh the page!')
        //     connectionPromise = undefined;
        //     if(!clientSession)
        //         console.error('Client session doesnt exist on connection promise timeout')
        //     clientSession.removeClient(clientId)
        //     clientObj = undefined;
        //     if(clientSession.clients.length == 0)
        //         sessionMap.delete(sessionId)
        // }, 5000);

        
        }catch(err)
        {
            endConnectionPromise()
            console.log("d;aa;a;;a;a",err)
        }
       
       
    }
    
    

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

    function addProcessToMap(sessionId: UUID, process: DebugProcess | ChildProcess) {
        getThisClientSession().process = process; 
    }
    
    function removeRunningProcessFromMap() {
        getThisClientSession().process = undefined;
    }
    function getProcessFromMap(clientSession?: EditorSession): DebugProcess | ChildProcess | undefined {
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
            getThisClientSession()?.clientsMap.forEach((clientObject, client) => {
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
   
                });
   }

   function isUserSandboxed(client=clientObj)
   {
    return clientSession.editorOptions.sandboxUsers == true && !client.isHost
   }

   function getFilesForClient(client=clientObj)
   {
    
        
        let files = isUserSandboxed() ?
             clientSession.files.filter(file => file.linkedUser && file.linkedUser.displayName == client.displayName)
             :
             clientSession.files

        return files
   }

   function getFilesNamesForClient(client=clientObj): string[]
   {
        return getFilesForClient(client).map(file => {return file.name})
   }

    function sendConnectionMessage(isHost, fileContent) 
    {
            // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, messageType: ConsoleMessageType.SessionInfo, body: "Client " + clientObj?.displayName + " joined!"});
            if(!clientSession) return;
    const session = clientSession.clientsMap.size!=1 ? clientObj.permissions : undefined; //clientObj.isHost
        const welcomeMessage =  isEmbededEditor ? sameOrigin ? "Editorul de cod intelegeinfo " : "Powered by <a href='https://intelegeinfo.ro'>intelegeinfo.ro</a>" : !userLoggedIn ?
    `Bine ai venit pe Intelege Info!
     Scrie cod, apoi ruleaza-ti codul apasand butonul mare auriu, sau ruleaza in debugger.
      Invita-ti elevii sau prietenii să editeze codul împreună cu tine în timp real apăsând butonul SHARE.`
        :
        `Ne pare bine sa te revedem, ${userData?.username}!<br>
        Poti salva codul tau apasand pe butonul save.`
        // await sendListFiles(clientFilesPath)
        const files = getFilesNamesForClient()
        const users = clientSession.clients.map(val => {return clientInfo(val)})
        // Send initial message to client

        const message: WebSocketMessage = 
        {type: WebSocketMessageType.Handshake, 
        ...clientInfo(),
        messageType: ConsoleMessageType.Info,
        sessionId: sessionId,
        body: welcomeMessage,
        project,
        permissions: clientObj.permissions,
        files,
        users
        }

        ws.send(JSON.stringify(message)); 
        if(files[0] && fileContent)
        sendFileContents(fileContent, files[0])
              
        return session;
    }

    function sendFileContents(fileContent, fileName) {
        if(clientObj.getFile(fileName))
            clientObj.CWebSocket.send(JSON.stringify({type: WebSocketMessageType.FileManagement, fileName: clientObj.getFile(fileName).name, body: {command: FileManagementCommands.Open ,content: fileContent}})); // Send the list of files to the client
    }  

    function clientInfo(thisclientObj?: ClientObject): HandshakeMessage['users'][number] // {clientId: typeof clientId, displayName: typeof clientObj.displayName, color: typeof clientObj.color, openFile: typeof clientObj.openFileName}
     {
        if(!clientObj && !thisclientObj)
            return;
        if(!thisclientObj)
            thisclientObj = clientObj;
        if(thisclientObj)
            return  {clientId: thisclientObj.clientId, accountId: thisclientObj.clientData ? thisclientObj.clientData.id : undefined, displayName: thisclientObj.displayName, color: thisclientObj.color, openFile: thisclientObj.getFilesName(), isHost: clientObj.isHost}
        // JSON.parse(`{"${prefix}clientId": "${thisclientObj.clientId}", "${prefix}displayName": "${thisclientObj.displayName}", "${prefix}color": "${thisclientObj.color}", "${prefix}openFile": "${thisclientObj.openFileName}"}`)
        else return {clientId: clientId, accountId: thisclientObj.clientData ? thisclientObj.clientData.id : undefined, displayName: clientObj.displayName, color: clientObj.color, openFile: clientObj.getFilesName(), isHost: clientObj.isHost}
    }

    async function loadSave(fileUUID)
    {
         try
         {
            let savedProject = (await loadProject(fileUUID)) as Project
            // if(savedProject.userId !== id) throw 'not authorized' // TODO check if project is public/shared or private (to implement)
            fs.cpSync(path.join(rootDirName,"saved", savedProject.fileUUID), path.join(rootDirName, "cache", sessionId), {recursive: true})
            project = savedProject;
            clientSession.files = fs.readdirSync(clientFilesPath).flatMap<EditorFile, string>((file) => {return new EditorFile(clientSession, file, fs.readFileSync(path.join(clientFilesPath, file)).toString())})
            // fs.renameSync()
            // defaultText =  
            // console.log(defaultText)
        }catch(err) {
            printClientConsoleError("Couldn't find your saved project, sorry! Check that you're logged in or the URL is correct. Error: " + err, getThisClientSession().getClientObjectById(clientId))
        }
    }


    async function connectionReady(cooperator: boolean = false, req: IncomingMessage) 
    {
        const sessionCheck = await new Promise<ClientPermissions>(async (resolve, reject) => {
            const urlParams = new URL("ws:/intelegeinfo.ro:8080"+req.url).searchParams
            const clientFilesPath = clientSession.getClientFilesPath();
            const isHost = !cooperator // added for readability
            let savedProject: Project | undefined;
            if(urlParams.has("save"))
            await loadSave(urlParams.get('save'))
            
            
        
        
            

            // printClientConsoleInfo("connected to worker: " + process.pid)

            //create cache folder for session if its a new one
            const cacheFolderExists = fs.existsSync(path.join(rootDirName, "cache", sessionId));

            
            if((!cacheFolderExists && isHost && clientSession.files.length==0) )
            {

                if(clientSession.files.length==0 && cacheFolderExists && isHost && savedProject == undefined)
                {
                    fs.rmSync(clientFilesPath, {recursive: true, force: true})
                    console.log('deteled existing session folder')
                }

                const err = undefined  
                fs.mkdirSync(clientFilesPath, { recursive: true })
                if (err) {
                    console.error("Error creating cache folder:", err);
                    return;
                }

                const session = sendConnectionMessage(!cooperator, '')
                resolve(session)
            
                
            } else 
            {
                // load files from existing session
                console.warn("Cache folder already exists for sessionId " + sessionId);

                // load project files
                if(cacheFolderExists && isHost && clientSession.files.length==0)
                    clientSession.files = fs.readdirSync(clientFilesPath).flatMap<EditorFile, string>((file) => {return new EditorFile(clientSession, file, fs.readFileSync(path.join(clientFilesPath, file)).toString(), {abstract: true})})

                // const session = sendConnectionMessage(!cooperator, '')
                

                if(clientSession.files[0] == undefined)
                {
                    if(savedProject)
                        openFile(fs.readdirSync(clientFilesPath)[0])
                    else
                        console.log('no file found in files: ', clientSession.files)
                    const session = sendConnectionMessage(!cooperator, '')
                    resolve(session)
                } 
                else if(!getFilesForClient()[0] && clientSession.editorOptions.sandboxUsers == true)
                        
                            {
                                const originalName = clientSession.files[0] ? clientSession.files[0].name : 'main.cpp'
                                
                                new EditorFile(clientSession,  (originalName ? originalName : 'main.cpp'), undefined, {linkedUser: clientObj, autoOpenClient: clientObj})
                                const session = sendConnectionMessage(!cooperator, '')
                                resolve(session)
                            }
                    else 
                    if(fs.existsSync(path.join(clientFilesPath, getFilesNamesForClient()[0]))) // not needed? 
                        getFilesForClient()[0].openFile(clientObj, shared)
                        .then((fileContent) => {
                            const session = sendConnectionMessage(!cooperator, fileContent)
                            console.log('Opened file')
                            resolve(session)
                        })

                        // openFile(clientSession.files[0].name) // load first file
                else 
                    
                    reject("No default file was found!") // TODO replace with async function

                    // resolve(session)
            
            }
        })
           
            

            if(getThisClientSession()?.clientsMap.size > 1) // multiple clients connected to this session
            {
                 // display join message
                replicateFunction((clientWs, LocalclientId) => {
                    printClientConsoleSessionInfo(clientObj?.displayName + " s-a alaturat sesiunii!", getThisClientSession().getClientObjectById(LocalclientId))
                }, clientObj);

                
                let displayNames:any[] = [];
                getThisClientSession()?.clientsMap.forEach((client, id) => {
                    if(!client.openFile)
                        throw 'invalid file'
                    if(client != clientObj)
                        displayNames.push({displayName: client.displayName, fileName: client.getFilesName(), clientId: client.clientId, color: client.color});
               })
               replicateFunction((clientws) => {
                   clientws.send(JSON.stringify({type: WebSocketMessageType.ColabData, colabCommand: "JOIN", client: clientInfo(clientObj), permissions: sessionCheck}));  // Send GDB output to the client

               }, clientObj)
            //    replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.ColabData, colabCommand: "JOIN", client: clientInfo(clientObj), permissions: session});

               ws.send(JSON.stringify({type: WebSocketMessageType.ColabData, colabCommand: "LIST", clients:displayNames}));  // Send GDB output to the client

               // send all other client's information
               clientSession.clientsMap.forEach((client) => {
                   ws.send(JSON.stringify({type: WebSocketMessageType.FileManagement, command:  FileManagementCommands.Open, fileName: client.getFilesName(),  name: client.displayName, color: client.color, clientId: client.clientId}));  // Send GDB output to the client
               },clientObj)

               setTimeout(() => {
                getThisClientSession().clientCommandBuffer.forEach((cmdBuf, remoteClientid) => {
                    if(clientId != remoteClientid)
                        if(getThisClientSession().clientsActiveFile.get(remoteClientid) === getThisClientSession().clientsActiveFile.get(clientId))
                             ws.send(JSON.stringify(cmdBuf.codeSelection))
                   });
               }, 100);
               
               
            }

        
   }


       const onData = (data: string) => {
                
                const buffer = sanitizeGdbOutput(data)
                console.log(buffer)
                // Check if the full response has arrived
                function sanitizeGdbOutput(buf) {
                    // Always work with a Buffer
                    if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);

                    return buf.toString('utf8')
                        // Replace NUL with \0
                        .replace(/\x00/g, '\\0')
                        // Replace other control chars (except \n, \r, \t) with hex escapes
                        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, c =>
                        '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0')
                        );
                }
                
                if(!buffer)
                    return
                if (buffer.indexOf('\0') !== -1) return false;

                const nonPrint = (buffer.match(/\\\\/g) || []).length;
                // If more than 1% non-printable, treat as binary
                console.log(nonPrint, Math.max(1, buffer.length))
                if(nonPrint / Math.max(1, buffer.length) > 0.01)
                    return 

                if (true) {
                    // We have everything, remove listener
                    // (childProcess.stdout as NodeJS.ReadableStream).removeListener("data", onData);
                    
                    for(const element of buffer.split('\n')) {
                        if(element.trim()!='')
                        {
                             const gdbOutput = parseGDBString(element);
                             if(JSON.stringify(gdbOutput.json) == '{}')
                                continue;

                        if(gdbOutput.json['exit-code']!=undefined || gdbOutput.json.reason=='exited-normally')
                            {

                            closeProcess(clientSession.process)

                                return;
                            }
                        // if(!['stopped', 'done'].some(val => gdbOutput.json.message && gdbOutput.json.message.includes(val)))
                        //     continue
                            // if( gdbOutput.ignore)
                            //     return
                            //  console.log(JSON.stringify(gdbOutput.json), gdbOutput.err)
                    
                    const response: WebSocketMessage = {
                        type:WebSocketMessageType.Debug,
                        state: "running",
                        body: gdbOutput ? gdbOutput.json : undefined,
                        line: gdbOutput.json?.frame?.line ? gdbOutput.json.frame.line : undefined,
                        variables: gdbOutput.json?.variables ? gdbOutput.json.variables : undefined,
                        raw: element
                        // error: gdbOutput.err ? gdbOutput.err : undefined,
                        // input: false,
                        // type: WebSocketMessageType.Output,
                        // messageType: ConsoleMessageType.DebugProgram,
                        // clientId: clientId,
                        // body: gdbOutput.json ? gdbOutput.json : undefined,
                        // raw: element,
                        // message: 'next', //deprecated - remove
                        // msgId: clientSession.gdbProcess?.pid || -1,
                        // line: gdbOutput.json?.frame?.line ? gdbOutput.json.frame.line : undefined,
                        // variables: gdbOutput.json?.variables ? gdbOutput.json.variables : undefined  
                    };
                    getThisClientSession()?.clientsMap.forEach((client, id) => { // TODO replace with replicateFunction()
                        //send response to all clients 
                        const clientSocket = clients.get(client.clientId);
                        if(!clientSocket)
                            {
                            
                                //sessions.delete(sessionId);
                                if(getThisClientSession()?.clientsMap.has(clientId))  console.error("Client not found in session while manually replicating to client  " + sessionId);
                                     else getThisClientSession()?.clientsMap.delete(client.clientId);
                                 clients.delete(client.clientId);

                                return console.error("\\x1b[31m Client not found, removing ids " + client + "\\x1b[0m");
                            } 
                        clientSocket?.send(JSON.stringify(response));
                    });
                        }
                   
                    };
                    
                    
                    // }
                    
                }
            };

    // debug mode only for now
    async function executeCommand( childProcess: DebugProcess, command: string, sessionId: UUID): Promise<void> {
        return new Promise((resolve, reject) => {
            
            console.log("GDB Command to execute: " + command)
            childProcess.sendCommand(command)
            if(command === '-exec-quit' && childProcess)
                        closeProcess(childProcess)
    
                    resolve(); 

        });
    }
    
    let CommandQueue = Promise.resolve();

    function queueCommand(process: ChildProcess | DebugProcess,command: string, sessionId: UUID): Promise<void> {
        CommandQueue = CommandQueue.then(() => executeCommand(process as DebugProcess, command, sessionId)).catch((err) =>
        {
            printClientConsoleError("failed to queue debugger command: " + err)
        })
        return CommandQueue;
    }
   
    function sendListFiles(dir: string): Promise<void> {
        
        try {
            return new Promise<void>((resolve, reject) => {

                clientObj.sendMessage({ type: WebSocketMessageType.FileManagement, body: { command: FileManagementCommands.List, content: getFilesNamesForClient() } }); // Send the list of files to the client
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
    
    function openFile(fileName: string, closedFile?: string)
    {
        // if(fs.existsSync(path.join(clientFilesPath, fileName)))
        // console.log("path: " + path.join(clientFilesPath || path.join(rootDirName, "cache", sessionId,"clientFiles"), fileName))
        console.log('Sent open file')
        const file = clientSession.files.find(file => file.name == fileName)
        if(!file)
        {
            console.error(new Error('Couldnt find file ' + fileName))
            return;
        }

        
        file.openFile(clientObj, shared, closedFile).then((fileContent) => onOpenFile(closedFile, fileName, fileContent))
        
    }

    function onOpenFile(oldFileName, fileName, fileContent)
    {
        sendFileContents(fileContent, fileName)
        replicateFunction((clientWs, id, thisClientObj) => {
            clientWs.send(JSON.stringify({type: WebSocketMessageType.FileManagement, command:  FileManagementCommands.Open, fileName, oldFileName,  name: clientObj.displayName, color: clientObj.color, clientId: clientId}));  // Send GDB output to the client
            if(thisClientObj.openFile && thisClientObj != clientObj)
                // if(thisClientObj.openFile.name != fileName || thisClientObj.openFile.name == oldFileName) // TODO choose one
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

        replicateFunction((ws,id, obj) => obj.sendMessage({body: 'Vă rugăm așteptați.. Pregătim mediul de rulare.'}, WebSocketMessageType.ExecuteStatus))
       
        
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
            onClosedProgram(-1, 0, `<span class="console-error">${err}</span>`)
            reject(err)
        })
    } catch (error) {
        onClosedProgram(-1, 0, `<span class="console-error">${error}</span>`)
        reject(error)
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
const hasGUI = clientObj.openFile[0].name.toLowerCase().includes("gui")
console.log(hasGUI ? 'executing with GUI' : "no gui", clientObj.openFile[0].name, clientObj.openFile)
if(clientSession.sessionContainer)
    execSync('rm -f ' + clientSession.sessionContainer.imageName)
const runCommand = 
`run \
--name ${imageName} \
-v "${sessionFolder}:/app" \ 
-w /app \
${process.env.DISABLE_CONTAINER_LIMITS == 'false' ? `-m ${256*parseInt(process.env.CONT_MEM_MUlTI||"1")}MB \
--cpus=${0.25*parseInt(process.env.CONT_MEM_MUlTI||"1")}` : ''} \
-a stdin -a stdout \
-it \
--rm \
${clientObj.openFile[0].editorMode.runParams(clientObj)} \
${clientSession.currentbuildTag} \
bash `.trim().replaceAll('\n', "")

const cmdArgs = [
  'run',
  '--name', imageName,
  '-v', `${sessionFolder}:/app`,
  '-w', '/app',
  ...(process.env.DISABLE_CONTAINER_LIMITS == 'false'
    ? [
        '-m', `${256 * parseInt(process.env.CONT_MEM_MUlTI || "1")}MB`,
        `--cpus=${0.25 * parseInt(process.env.CONT_MEM_MUlTI || "1")}`
      ]
    : []),
  '-a', 'stdin',
  '-a', 'stdout',
  '-it',
  '--rm',
  clientObj.openFile[0].editorMode.runParams(clientObj),
  clientSession.currentbuildTag?.trim(), // ✅ remove extra spaces
  'bash'
].filter(Boolean); // ✅ removes empty strings/null/undefined




//  --rm -c "g++ -g -v -O0 main.cpp -o main && ./main"
  console.log(`Running Docker container ${imageName} with access to ${sandboxFolder}`);
  console.log(runCommand)

  // Return the child process for external handling
    const childProcess = nodepty.spawn('docker', cmdArgs, {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
    });
    clientSession.sessionContainer = {process: childProcess, imageName, fileName, editorMode: clientObj.openFile[0].editorMode} 

    // childProcess.?.on("spawn", () => {
        console.log("Docker container spawned") 
        setTimeout(async () => {
                    // TODO Spawn GUI on client 
                    //   TODO maybe remove ignore self client to show when its ready and compiling
            replicateFunction((ws,id, obj) => obj.sendMessage({status: 'container-spawn'}, WebSocketMessageType.ExecuteStatus))

            if(hasGUI && clientSession.displayServer == 0) // doesnt have display server
            {
                clientSession.displayServer = await clientSession.sessionContainer.editorMode.onBuild(clientSession.sessionContainer, clientSession, clientObj)
               
            }
                
            resolve(clientSession.sessionContainer); // Return the child process so it can be handled externally
        }, 1000);        
    // })

    
    
    // childProcess.stdout.on('data', data => {
    //     // console.log("CONTAINER ID:" + data.toString())
    //     console.log(data.toString())
    //     clientObj.sendMessage({type: WebSocketMessageType.Console, action: 'container',  body: data.toString()})
    // })
    childProcess.onData(e => {
        console.log(e)
        replicateFunction((ws, client, obj) =>  obj.sendMessage({type: WebSocketMessageType.Console, action: 'container',  body: e.toString()}))
    })
    // childProcess.stderr.on('data', data => {
    //     console.log('[Docker Container Error]' + data.toString())
    //     clientObj.sendMessage({type: WebSocketMessageType.Console, action: 'container',  body: data.toString()})
    //     // onClosedProgram(1, 0, "Failed to sandbox program: " + data.toString()).then(() => console.log('fail sent to user'))
    // })


}).catch(err => [
    console.error(err)
])


 
})
  

}


async function executeProblemChecker(problemId) {
return new Promise<PromiseSettledResult<{status: string, error: boolean, index: number, score: number, time?: number ,result?: {input: string, output: string}} | undefined>[]>((resolve, reject) => { 
    console.log(problemId) 
            prisma.problem.findUnique({
                where:
                {
                    id: problemId
                }
            }).then(problem => {
                if(!problem)
                    throw 'Problem with id ' + problemId + ' is invalid!'

                if(process.env.NODE_ENV == 'development')
                {
                     testProblem(problem.tests as ProblemTest[], clientObj,clientSession, undefined)
                        .then(resolve).catch(reject)
                        .finally(() => {
                            replicateFunction((clientWs,id, clientObj) => {
                                clientObj.sendMessage({type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, clientId: clientId});  // Send GDB output to the client
                            });
                        })
                } else
                buildAndRunCppSandbox(path.join(rootDirName, "cache", sessionId), clientSession.clientsActiveFile.get(clientId),clientObj.editorMode, clientId, sessionId).then( async res => {
                    //     cwd:  path.join(rootDirName, "cache", sessionId,"clientFiles"), // we must add this for the program to have the correct directory for input files.
                    if(res == null) return resolve(undefined)
                        
                    try {
                        // const timeLimit = problem.averageTimeLimit || 0
                        // const memoryLimit =  problem.averageMemLimit || 0
                        console.log('starting compile') 
                        await clientObj.getFile(res.fileName).editorMode.compile(res, clientObj.getFile(res.fileName), false)
                        console.log('compile finished')

                        testProblem(problem.tests as ProblemTest[], clientObj,clientSession, res)
                        .then(resolve).catch(reject)
                        .finally(() => {
                            replicateFunction((clientWs,id, clientObj) => {
                                clientObj.sendMessage({type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, clientId: clientId});  // Send GDB output to the client
                            });
                        })
                        

                    }
                    catch(err)
                    {
                        console.error("Failed to run docker commands: " + err)
                        onClosedProgram(-1, 0, `<span class="console-error">${err}</span>`)
                        reject(err)
                    }
                }).catch(reject);
            }).catch((err) => reject(err+ 'ababababa'))
          
})

    
}
if(clientSession)
clientSession.executeProblemChecker = executeProblemChecker
else
    console.error('INVALID SESSION WHILE SETTING PROBLEM CHECKER')

async function onClosedProgram(code,time, message: string, error?)
    {
        let notes: string = "";
        processInputBuffer = '';
        // const time = 
        if(clientSession.program)
        {
            clientSession.program.stdout.removeAllListeners()
            clientSession.program.stderr.removeAllListeners()
        }
        replicateFunction((clientWs) => {
            clientWs.send(JSON.stringify({type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, time, notes, body:'\n'+ message.trim(), clientId: clientId}));  // Send GDB output to the client
        });


        if(code !=0)
            return;
        if(new Blob([gdbBuffer]).size > 64000) // 1000000 is 1Mb
        {
            await new Blob([gdbBuffer]).slice(0, 64000).text().then(str => {
                notes = "buffer exceeded 64kb, output was truncated."
                replicateFunction((clientWs) => {
                    clientWs.send(JSON.stringify({messageType: ConsoleMessageType.Output, type: WebSocketMessageType.Output, body: str.toString(), clientId: clientId}));  // Send GDB output to the client
                });
        })
        }

        
    }
async function readStdio(program, messageJSON, res: typeof clientSession.sessionContainer)
{
    return new Promise<void>((resolve, reject) => {
    addProcessToMap(sessionId, program); // add to process map
    mode = "run";
    let spawnDate = Date.now()
    let programTimeout;
    gdbBuffer = "";
    let errorBuffer = ''


    if(messageJSON.textMode)
        programTimeout = setTimeout(() => {
            onClosedProgram(-1, ( Date.now() - spawnDate), "<span style='color: red'>Program timed out!</span>")
            closeProcess(program)
            resolve()
        }, 1000);
    // if(programTimeout) clearTimeout(programTimeout)

    spawnPromise = new Promise<void>((resolve, reject) => {

    clientSession.program?.on("spawn", async () => {
        console.log("Program spawned")
        
        spawnDate = Date.now()
        res.editorMode.onSpawn(clientSession);
        replicateFunction((ws,id, obj) => obj.sendMessage({spawn: 1}, WebSocketMessageType.ExecuteStatus))
        // clientObj.sendMessage({type: WebSocketMessageType.ExecuteStatus, spawn: 1})
        if( clientSession.program.stdin && processInputBuffer)
            if(clientSession.program?.stdin?.writable)
                clientSession.program.stdin.write(processInputBuffer) // write buffer

        if(!clientSession.fileWatcher)
        {
            clientSession.fileWatcher = fs.watch(path.join(clientSession.getClientFilesPath()), null, (event, fileNameBuf) => {
                const fileName = fileNameBuf.toString()
                if(!fileName)
                    throw new Error('Invalid file name in watcher')
                const changedFile = clientSession.files.find(file => file.name == fileName)
                if(!changedFile)
                {
                    console.error('Couldnt find file to update in watcher.')
                    if(event == 'rename')
                        {
                            new EditorFile(clientSession, fileName, null, {abstract: true})
                            console.warn('Created new file from rename event!')
                        }
                } 
                changedFile.onFileWatched(event, clientObj)
            })
            
        }
        
        dataTimeout = 
        setTimeout(() => {
            replicateFunction((ws,id, obj) => obj.sendMessage({input: 1}, WebSocketMessageType.ExecuteStatus))
            // clientObj.sendMessage({type: WebSocketMessageType.ExecuteStatus, input: 1})
        }, 400);
        resolve()

    })

    })

    clientSession.program.stdout?.addListener("data", (data) => {
        // gdbBuffer += data.toString();
        // replicateFunction((clientWs) => {
        //     clientWs.send(JSON.stringify({messageType: ConsoleMessageType.Output, type: WebSocketMessageType.Output, body: gdbBuffer.toString(), clientId: clientId}));  // Send GDB output to the client
        // });
        // gdbBuffer = "";
        if(clientSession.program.killed)
            return;
         if(new Blob([gdbBuffer]).size > 64000) // 1000000 is 1Mb
        {
            closeProcess(program).then(() => onClosedProgram(-1, ( Date.now() - spawnDate), "<span style='color: red'>Program buffer size excedded!</span>"))        
            resolve()
         }
        replicateFunction((clientWs) => {
            clientWs.send(JSON.stringify({type: WebSocketMessageType.Output, messageType: ConsoleMessageType.Output, body: data.toString(), clientId: clientId}));  // Send GDB output to the client
         });

        clearTimeout(dataTimeout)
            dataTimeout = setTimeout(() => {
                replicateFunction((ws,id, obj) => obj.sendMessage({input: 1}, WebSocketMessageType.ExecuteStatus))
        }, 100);

    });


    clientSession.program?.stderr?.addListener("data", (data) => {
        errorBuffer += data.toString() + '\n';

        
    });

    clientSession.program?.addListener("close", (code) => {

        clearTimeout(dataTimeout);
        clearTimeout(programTimeout)
        switch(code)
        {
            default:
                if(errorBuffer)
                {
                    onClosedProgram(code, ( Date.now() - spawnDate), "Programul a iesit cu eroarea: " + errorBuffer.trim())
                    break;
                }
            case 0:
             onClosedProgram(code, ( Date.now() - spawnDate), "Programul a iesit cu codul: " + (code?.toString() || '-1'))
            break;
            case 136:
            case 138:
            onClosedProgram(code, ( Date.now() - spawnDate),"Programul a iesit cu eroare: <a href='/guides/aritmethicoperation?session="+sessionId+"' title=Learn how to fix here. | Error code: " + code?.toString()+">Arithmetic devided by 0</a>", true)
            break;
            case 139:
            onClosedProgram(code, ( Date.now() - spawnDate),"Programul a iesit cu eroare: <a href='/guides/aritmethicoperation?session="+sessionId+"' title=Learn how to fix here. | Error code: " + code?.toString()+">Segmentation Fault</a>", true)
            break;
            case 3221225477:
            onClosedProgram(code, ( Date.now() - spawnDate),"Programul a iesit cu eroare: <a href='/guides/errors/memaccessviolation?session="+sessionId+"' title=Learn how to fix here. | Error code: " + code?.toString()+">MEMMORY ACCESS VIOLATION!</a>", true)
            break;
        }

        gdbBuffer = "";
        onClosedProcess()
        resolve()
    

        })
    })
    }

    // Handle GDB session commands from client
    ws.addListener("message", async (message: Buffer, isBinary: boolean) => {  
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
                case WebSocketMessageType.Utilities:

                    switch (messageJSON.util) {
                        case 'transpile':
                            const target = messageJSON.target.split('.').at(-1)
                            if(!messageJSON.fileName)
                                break;
                            const targetMode = EditorModes.modes.find(mode => mode.name === target || mode.extension.includes(target))
                            if(targetMode)
                                transpileCode(clientObj, clientObj.openFile.find(file => file.name === messageJSON.fileName), targetMode).then(val => {
                                    ws.send(JSON.stringify({type: WebSocketMessageType.Utilities, util: messageJSON.util, response: val, fileName: messageJSON.fileName, target: messageJSON.target}))
                                })
                                
                        break;
                    }

                break;
                case WebSocketMessageType.RTC:
                    // for(const cws of clientSession.clients.values())
                    //     cws.CWebSocket.send(JSON.stringify({...messageJSON, calerId: clientId}))
                    if(!messageJSON.targetId)
                        break;
                    const cws = clientSession.clientsMap.get(messageJSON.targetId)
                    if(cws!=clientObj)
                        if(cws)
                            cws.CWebSocket.send(JSON.stringify({...messageJSON, callerId: clientId}))
                        else
                            ws.send(JSON.stringify({type: 'rtc', end: true,callerId: messageJSON.targetId}))
                break;
                case WebSocketMessageType.Canvas:

                    replicateFunction((clientWs, clientid, thisClientObj) => {
                        if(thisClientObj.checkClientsFileOpen(clientObj))
                            clientWs.send(JSON.stringify({...messageJSON}));  // Send GDB output to the client
                    }, clientObj);
                break;
                case WebSocketMessageType.WebCam:
                    // console.log(messageJSON.buffer);
                    try {
                        if(messageJSON.started)
                        {
                            clientObj.webcamid = Math.floor(Math.random()*50)
                            execSync('sudo modprobe -r v4l2loopback')
                            const video = exec(`sudo modprobe v4l2loopback video_nr=${clientObj.webcamid} card_label="${clientId}" exclusive_caps=1`)
                            video.stdout.pipe(process.stdout)
                            video.stderr.pipe(process.stdout)

                            video.on('close', data => console.log('added camera. ' + data.toString()))
                            console.log('added camera', clientObj.webcamid)
                        } else
                          (clientObj.openFile[0].editorMode as EditorModes.Python).receiveWebCam(messageJSON.buffer)
                         
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

                    sendConnectionMessage(true, '') // TODO Implement this on client side, to ensure client received handshake message.
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
                    switch(messageJSON.action) {
                        default:
                        case 'process':
                            if(getProcessFromMap()!=undefined)
                            {
                                if((getProcessFromMap() as DebugProcess).sendCommand)
                                {
                                    (getProcessFromMap() as DebugProcess).sendProgramInput(messageJSON.command + '\n')
                                    replicateFunction((ws,id, obj) => obj.sendMessage({input: 1}, WebSocketMessageType.ExecuteStatus))
                                }
                                else
                                {   
                                    if(!(getProcessFromMap() as ChildProcess).stdin)
                                    return
                                    (getProcessFromMap() as ChildProcess).stdin.write(messageJSON.command + "\n");
                                    dataTimeout = setTimeout(() => {
                                        replicateFunction((ws,id, obj) => obj.sendMessage({input: 1}, WebSocketMessageType.ExecuteStatus))
                                    }, 200);
                                }
                            
                            }
                            else
                                processInputBuffer += messageJSON.command + "\n";

                            replicateFunction((clientWs) => {
                                clientWs.send(JSON.stringify({type: WebSocketMessageType.Console, messageType: ConsoleMessageType.Console,  body: messageJSON.command, clientDisplayName: clientObj?.displayName, clientId: clientId}));  // Send GDB output to the client
                            });
                            break
                    case 'container':
                        if (!(clientObj.clientData && clientObj.clientData.emailValidated == true))
                        {
                            clientObj.sendMessage({type: WebSocketMessageType.Console, action: 'container',  body: "Va rugam sa va logati inainte de a accesa terminalul mediului de executare. Prin terminal, puteti instala orice librarie sau package, sau executati programul direct."})
                            return;
                        }
                            if(!clientSession.sessionContainer || !clientSession.sessionContainer.process)
                                {
                                    clientObj.sendMessage({type: WebSocketMessageType.Console, action: 'container',  body: "Va rugam rulati programul cel putin o data inainte sa puteti executa comenzi!"})
                                    break
                                }
                            if(!messageJSON.body)
                                console.error('invalid body')
                            clientSession.sessionContainer.process.write(messageJSON.body as string)
                               
                    }
                     
                    break;
                case WebSocketMessageType.Chat:

                

                    if(!clientObj.permissions.canChat) break;
                

                    // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, messageType: ConsoleMessageType.UserChat,  body: messageJSON.command, clientDisplayName: clientObj?.displayName});
                    replicateFunction((clientWs) => {
                        clientWs.send(JSON.stringify({type: WebSocketMessageType.Chat, id: getThisClientSession().messageIndex,
                            messageType: ConsoleMessageType.UserChat,  body: messageJSON.command.replaceAll("<", "&lt").replaceAll(">", "&gt"),
                            clientDisplayName: clientObj?.displayName,
                            clientId: clientId, userId: clientObj.clientData ? clientObj.clientData.id : undefined,
                            color: clientObj.color}));  // Send GDB output to the client
                    });
                    getThisClientSession().messageIndex++; // counter used to id and group console mssages.
                    // clients.forEach((client, id) => {
                        
                    //         client.send(JSON.stringify({error: false, input: false, clientId: clientId, type: WebSocketMessageType.Chat, body: messageJSON.command})); // Send initial message to client
                        
                    // });
                    break;
                
                case WebSocketMessageType.MouseUpdate:
                    if(!clientObj.openFile)
                        throw "Client open file is invalid"
                        replicateFunction((thisClientWs, thisClientId, thisClientObj) => {
                            if(!thisClientObj.openFile)
                                throw "this client obj has invalid file";
                            if(clientSession.getClientObjectById(thisClientId).permissions.canEdit && thisClientObj.checkClientsFileOpen(clientObj))
                                thisClientWs.send(JSON.stringify({ ...messageJSON, ...clientInfo(clientObj)})) // TODO Sanitize this
                        }, clientObj)
                break;
                case WebSocketMessageType.CodeChange:
                    if(!clientObj.permissions.canEdit) break;
                        const fileName: string = messageJSON.fileName;

                        const file = clientObj.getFile(fileName)
                        if(!file)
                            return 

                         const delta = messageJSON.delta
                        file.changeContent({content: messageJSON.body, delta, clientChecksum: messageJSON.checksum}, clientObj)

                        shouldSave=false 
                        if(checkSyntaxTimeout) clearTimeout(checkSyntaxTimeout)
                            checkSyntaxTimeout = setTimeout(() => {
                                file.updateFile(clientObj)
                            }, 200);
                   
                    
                    break;
                
                case WebSocketMessageType.ConsoleTyping:
                    if(!clientObj.permissions.canChat) break;
                    const TypingIndicatorType = messageJSON.status;
                    replicateFunction((clientWs, localClientId) => {
                            clientWs.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping,displayName: clientObj?.displayName, clientId: clientId, status: TypingIndicatorType}))
                        }, clientObj)
                break;
                    
                case WebSocketMessageType.CodeSelection:
                    //fs.writeFileSync(path.join(rootDirName, "cache", sessionId , "user_code.cpp"), messageJSON.code);
                   // console.log(type + " for sessionId " + sessionId);
                   if(!clientObj.permissions.canEdit) break;
                    const codeSelectionJSON = {type: WebSocketMessageType.CodeSelection, clientId: clientId, body: messageJSON, color: clientObj.color, fileName: messageJSON.fileName}
                    getThisClientSession().clientCommandBuffer.set(clientId, {codeSelection: codeSelectionJSON})

                                                                                // rename this to something more apropriate eg guily client idk
                //    replicateSocketMessage(sessionId, clientId, true, {type: type, clientId: clientId, body: messageJSON}, (client) => { let filter = getThisClientSession()?.clientsActiveFile.get(client) != fileName; console.log(getThisClientSession()?.clientsActiveFile.get(client) + fileName); return filter;});
                   
                   replicateFunction((clientWs, localClientId, thisClientObj) => {
                        if(clientObj.checkClientsFileOpen(thisClientObj))
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
                    
                    const commandType: FileManagementCommands = messageJSON.command;
                    // Let only open command through
                    if(!clientObj.permissions.canEdit && commandType !== FileManagementCommands.Open) break;
                    
                    switch (commandType) {


                     case FileManagementCommands.Open:
                        
                        openFile(messageJSON.body, messageJSON.closedFile)
                        console.log('clientId', clientId, 'sessionid', sessionId)
                    break;
                        case FileManagementCommands.Create:
                            new EditorFile(clientSession, messageJSON.name, messageJSON.body)
                        break;
                    case FileManagementCommands.Delete:
                        if(!clientObj.permissions.canEdit) break;
                        clientSession.files.find(file => file.name == messageJSON.name).delete(clientObj)
                       
                    break;

                    //  TODO Make this so it just return name and make seperate function for fle content, which will be called only when opening the file on the client. STORE IT IN CACHE, ADD A DIRTY VERIFICATION TO NOT SEND THE SAME SHI MULTIPLE TIMES DONT OPEN THE EDITOR UNTIL THE FILE HAS LOADED ON THE CLIENT SEND THE FILES ON  HANDSHAKE MAKE SURE IT IS ALL REPLICATED
                    case FileManagementCommands.List:                   
                        sendListFiles(clientFilesPath);
                    break;
                    case FileManagementCommands.Rename:
                        if(!clientObj.permissions.canEdit) break;
                        const file = clientSession.files.find(file => file.name == messageJSON.name)
                        file.rename(messageJSON.newName, clientObj)

                        //  const targetMode = EditorModes.modes.find(mode => mode.extension.includes(messageJSON.newName.split('.').at(-1)))
                        //     if(targetMode)
                        //         transpileCode(clientObj, file, targetMode).then(val => {
                        //             ws.send(JSON.stringify({type: WebSocketMessageType.Utilities, util: 'transpile', response: val, fileName: messageJSON.newName}))
                        //         })
                       
                        
                    break;

                   
                    }
                    break;
                
                default:
                    
                 if(!clientObj.permissions.canEdit) break;
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
                                    if(clientSession.files.length == 0)
                                        resolveExectute()
                                    
                                    const mainPromise = new Promise<void>((resolve, reject) => {   
                                        if(!clientSession.clientsActiveFile.get(clientId))
                                        {
                                            onClosedProgram(-1, 0, `<span class="console-error">Please open a file first!</span>`)
                                            return reject('Client appears to not have an active open file')
                                        }

                                        if(!clientObj.editorMode.clientCompile)
                                        buildAndRunCppSandbox(filePath, clientSession.clientsActiveFile.get(clientId),clientObj.editorMode, clientId, sessionId).then( async res => {
                                            //     cwd:  path.join(rootDirName, "cache", sessionId,"clientFiles"), // we must add this for the program to have the correct directory for input files.
                                            if(res == null) return resolve()
                                            if(!clientObj.getFile(res.fileName))
                                            {
                                                onClosedProgram(-1, 0, `<span class="console-error">Please open a file first!</span>`)
                                                return reject('No client active file for '+ res.fileName)
                                            }
                                                    
                                            try {
                                                
                                                clientObj.getFile(res.fileName).editorMode.sendError = (err, fatal)  => {
                                                    // printClientConsoleError(err)
                                                    if(fatal)
                                                    {
                                                        // closeProcess(clientSession.process)
                                                        onClosedProgram(-1, 0, `<span class="console-error">Compile error: ${err}</span>`)
                                                        resolve()
                                                    }
                                                        
                                                } 


                                                if(!clientObj.editorMode.isInterpreter)
                                                {
                                                    replicateFunction((clientWs) => {
                                                        clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Compilăm programul.', clientId: clientId}));  // Send GDB output to the client
                                                    });

                                                    //execSync(`docker exec ${res.imageName} bash -c "g++ -g -O0 clientFiles/${res.fileName} -o main"`)
                                                    await clientObj.getFile(res.fileName).editorMode.compile(res, clientObj.getFile(res.fileName), false)
                                                    
                                                    replicateFunction((clientWs) => {
                                                        clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Compilat!', clientId: clientId}));  // Send GDB output to the client
                                                    });
                                                }
                                                
                                                clientSession.program = await clientObj.getFile(res.fileName).editorMode.execute(res, clientObj, clientSession)



                                                readStdio(clientSession.program, messageJSON, res).then(()=> resolve())



                                            }
                                            catch(err)
                                            {
                                                console.error("Failed to run docker commands: " + err)
                                                onClosedProgram(-1, 0, `<span class="console-error">${err}</span>`)
                                                reject(err)
                                            }
                                        });
                                        else 
                                        {
                                            clientObj.openFile[0].editorMode.execute(undefined, clientObj, clientSession) 
                                            resolve()
                                        }
                                       })
                                       
                                       return [spawnPromise, mainPromise]

                                  }

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
                                
                                closeProcess(clientSession.program,sessionId)
                                // .then(() => {
                                //     replicateFunction((clientWs) => {
                                //         clientWs.send(JSON.stringify({type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, body: gdbBuffer.toString(), clientId: clientId}));  // Send GDB output to the client
                                //         });
                                // }).catch(err => replicateFunction((clientWs) => {
                                //         clientWs.send(JSON.stringify({type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, body: err, clientId: clientId}));  // Send GDB output to the client
                                //         }))
                        
                            } else executeProgram(); //buildAndRunCppSandbox(filePath, path.join(rootDirName, "cache", sessionId, "clientFiles"), clientId, sessionId) //
                    
                            
                        }
                        else if(command == "-exec-run")
                        {
                            
                            if(!getProcessFromMap()) {
                                if(!clientObj.editorMode.clientCompile)
                                buildAndRunCppSandbox(filePath, clientSession.clientsActiveFile.get(clientId),clientObj.editorMode, clientId, sessionId).then(async res => {
                                               
                                    mode="debug"; //set mode to debug
                                    try {
                                        clientObj.getFile(res.fileName).editorMode.sendError = (err, fatal)  => {
                                            // printClientConsoleError(err)
                                            if(fatal)
                                            {
                                                // closeProcess(clientSession.process)
                                                onClosedProgram(-1, 0, `<span class="console-error">Compile error: ${err}</span>`)
                                                return
                                            }
                                                    
                                        }      
                                        replicateFunction((clientWs) => {
                                            clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Compilăm programul.', clientId: clientId}));  // Send GDB output to the client
                                        });

                                        // execSync(`docker exec ${res.imageName} bash -c "g++ -g -O0 clientFiles/main.cpp -o main"`)
                                        await clientObj.getFile(res.fileName).editorMode.compile(res, clientObj.getFile(res.fileName), true)
                                        
                                        replicateFunction((clientWs) => {
                                            clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Compilat!', clientId: clientId}));  // Send GDB output to the client
                                        });

                                        clientSession.gdbProcess = clientObj.getFile(res.fileName).editorMode.startDebugging(res, clientObj, clientSession)
                                        await new Promise(resolve =>  setTimeout(resolve, 100))
                                        clientSession.gdbProcess.addDataListener(onData)
                                        if(!clientSession.gdbProcess)
                                            throw 'invalid debug process'

                                        addProcessToMap(sessionId, clientSession.gdbProcess);
                                        replicateFunction((ws,id, obj) => obj.sendMessage({input: 1}, WebSocketMessageType.ExecuteStatus))
                                    } catch (err){
                                        printClientConsoleError("docker error: " + err)
                                    }

                                    if(!getThisClientSession().process) console.error('Invalid session while starting debug process')
                                    // printClientConsoleDebug("started debugging process.")
                               
                                    queueCommand(getProcessFromMap(),'-break-insert 1\n', sessionId);
                                    // queueCommand(getProcessFromMap(),'-exec-run\n', sessionId);  

                                    

                                })
                                else 
                                {
                                    clientSession.process = clientSession.gdbProcess = clientObj.getFile(clientObj.openFile[0].name).editorMode.startDebugging(undefined, clientObj, clientSession)
                                    // clientObj.openFile[0].editorMode.execute(undefined, clientObj, clientSession) 
                                }


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
                                // app.get("/requestValue", (req,res) => {
                                //     const command = req.query.value;
                                //     const cmdId: number = parseInt(req.query.cmdId as string);
                                //     // console.log(clientId + " " + command)
                                //     if(mode != "debug") res.status(400).send('Bad Request: GDB process not active');
                                //     if(!clientSession.gdbProcess)  res.status(400).send('Bad Request: GDB process not active');
                                //     if(!command)     res.status(400).send('Bad Request: invalid command');
                                //     //res.send({code: fs.readFileSync("user_code.cpp").toString()});
                                //     if(mode != "debug" || !clientSession.gdbProcess || !command) return;
                                    
                                //     new Promise<void>((resolve, reject) => {
                                //         let gdbBuffer = "";
                                
                                //         const onData = (data: Buffer) => {
                                           
                                //                 gdbBuffer += data.toString();
                                //                     // Check if the full response has arrived
                                //             if (gdbBuffer.includes("(gdb)")) {
                                //                 if(parseInt((gdbBuffer.toString().match(/(?<=\$)\d*/)?.[0] as string)) === cmdId+1) {
                                                    
                                //                 // We have everything, remove listener
                                //                 clientSession.gdbProcess?.stdout?.removeListener("data", onData);
                                //                 resolve();
                                //                  res.send(({
                                //                     error: false,
                                //                     input: false,
                                //                     type: WebSocketMessageType.Output,
                                //                     messageType: ConsoleMessageType.Debug,
                                //                     body: gdbBuffer,
                                //                     message: command?.toString(),
                                //                     cmdId: cmdId,
                                //                     msgId: clientSession.gdbProcess?.pid
                                //                 }));

                                //                 } else gdbBuffer = "";
                                
                                //             }
                                            
                                
                                        
                                                
                                            
                                //         };
                                //         if(clientSession.gdbProcess && clientSession.gdbProcess.stdin && clientSession.gdbProcess.stdout) 
                                //         {
                                //             // Use .on instead of .once, because GDB output can be split
                                //             clientSession.gdbProcess?.stdout?.on("data", onData);
                                    
                                //             // Send the command
                                //             clientSession.gdbProcess?.stdin?.write("print " + command + "\n");
                                //         } else console.error("GDB process not found for session " + sessionId);
                                //     });
                    
                                // });
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
                            else {
                            closeProcess(clientSession.process)
                            //  onClosedProcess()//.then(() => {
                           
                            
                        }// else  await queueCommand(getProcessFromMap() as ChildProcess,'-exec-quit', sessionId);// gdbProcess.stdin.write(message + "\n");
                                
                                
                
                        } else if(command==="-exec-quit") {
                            closeProcess(clientSession.process)
                            //  onClosedProcess()//.then(() => {
                            
                        } else if(clientSession.gdbProcess!=undefined)
                        {
                            console.log('queue command')
                            // executeCommand(getProcessFromMap() as ChildProcess,'-stack-list-variables --all-values',sessionId).catch(err => console.error('queue command err: ' + err))
                            
                                executeCommand(getProcessFromMap() as DebugProcess,command,sessionId).then(() => {

                                console.log('COMMAND')
                            }).catch(err => console.error('queue command err: ' + err))
                        } else if(clientSession.program!=undefined)
                            {
                                if(clientSession.program?.stdin?.writable)
                                {
                                        clientSession.program?.stdin?.write(command); //program.stdin.write(message + "\n");
                                        replicateFunction((ws,id, obj) => obj.sendMessage({input: 1}, WebSocketMessageType.ExecuteStatus))
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

        if(clientSession.fileWatcher)
        {
            clientSession.fileWatcher.close()
            clientSession.fileWatcher = undefined
            console.log('stopped file watcher')
        }
            
    // replicateFunction((thisclientWS, thisclientid) => {
    //     thisclientWS.send(JSON.stringify({type: WebSocketMessageType.Output, message: 'end'}))
    // })
            // const filePath = path.join(rootDirName, "cache", sessionId, "main.exe");
        //   fs.unlinkSync(filePath)
    }

    async function closeProcess(process: DebugProcess | ChildProcess, processId?: UUID): Promise<void>
    {
        try {
            return await new Promise<void>((resolve, reject) => {
                if (clientSession.process) {
                    let timer;
                    if (!process.killed) {
                        process.kill(9);
                        
                        process.addListener(('close'), (code) => {
                            if(timer)
                                clearTimeout(timer)
                            onClosedProcess();
                            resolve();
                            console.log('stopped process')
                        });

                        timer = setTimeout(() => {
                            onClosedProcess();
                            reject('timed out closing process');
                            
                        }, 3000);
                    }
                    else {
                        if(timer)
                                clearTimeout(timer)
                        onClosedProcess();
                        resolve();
                    }

                }
                // resolve()
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
        endConnectionPromise()
      
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
        if(clientSession.clientsMap.size == 0 || clientSession==undefined) 
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
            const session = clientSession.clientsMap.size!=1 ? {isHost: clientObj.isHost, clients: clientSession.clientsMap.size} : undefined;
            if(clientObj)
                if(clientObj.isHost)
                {
                    const newHost = Array.from(clientSession.clientsMap.values())[Math.floor(Math.random()*clientSession.clientsMap.size)]
                    newHost.isHost = true;
                    clientSession.hostClient = newHost;
                     
                    newHost.sendMessage({type: WebSocketMessageType.ColabData, colabCommand: "HOST", body: "Acum esti proprietarul acestei sesiuni."})
                }

            replicateFunction((clientWs) => {
                clientWs.send(JSON.stringify({type: WebSocketMessageType.ColabData, ...clientInfo(clientObj), colabCommand: "DISCONECT", session, body: clientObj?.displayName + " a iesit din sesiune."}))
            }, clientObj)
            console.info('session is still active')
            // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, body: "$: Client " + clientId + " disconnected!"});
        }

    }

    // Handle WebSocket disconnection
    ws.addEventListener("close", () => {
        updateUserMeter()
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
                callback(thisClientWs as WebSocket, thisClientId as UUID, clientSession.clientsMap.get(thisClientId));
        });
    }
    
});



})

process.addListener('exit', () => {
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

import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import { Project, User } from "../../generated/prisma";
import { IncomingMessage } from "http";
import { cwd, permission, stdin } from "process";
import { parseGDBString } from "./gdbUtilities";
import { run } from "googleapis/build/src/apis/run";
import e from "express";
import { JsonArray } from "../../generated/prisma/runtime/library";
import DebugProcess from "./editor-modes/ProcessTypes";
import { transpileCode } from "./aiIntegration";





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
        


 let translation = undefined;
const defaultLang = 'ro-RO'
 fs.readFile(path.join(rootDirName,'server', 'data', 'translations.json'), (err, data) => {
    if(err)
        throw err;

    translation = JSON.parse(data.toString())
    console.log('translations loaded, bytes:', data.byteLength)
 })
export function sendFile(path: string, res, req, params?)
{
    if(path.split('.').at(-1) != 'html')
        return res.status(500).send('Input file isnt HTML.')
    try {
        fs.readFile(path, (err, file) => {
            if(err || !file)
               throw err
            
            return res.contentType('html').send(parseText(file.toString(), req, params))
        })
    } catch (err)
    {
        console.error(err)
        return res.status(500).send('Error:' + err)
    }
}

export function parseText(file: string, req: any, params?)
{
    // ^{%...} - translation
    // ^{&file:...} - include file
    // ^{*...} - custom parameter
    if(!req || !req.cookies)
    {
        console.error('YOU FORGOT TO ADD COOKIE PARSER!')
                return file;
    }

    if(!translation)
        throw 'invalid translation json'
    const matches = file.matchAll(/\^{[%&*](.*)}/g)
    let text = file
    const locale =  function () {
        const accLang = req.cookies.ii_lang ? req.cookies.ii_lang : req.headers["accept-language"] as string;
        if(!accLang)
            return defaultLang
        return accLang.split(',').map(param => param.split(';')[0])
    }()[0]
    const keyDictionary = translation
    for(const matchobj of matches)
    {
        const match = (matchobj[1] as string)
        const key = (matchobj[0] as string)
        if(key.startsWith('^{%')) {
             if(!keyDictionary[match])
                continue;

            const expr = keyDictionary[match][locale] ? keyDictionary[match][locale] : keyDictionary[match][defaultLang] ? keyDictionary[match][defaultLang] : '' as string;
            if(expr != '' && expr !== undefined)
                text = text.replaceAll(key, expr)
            else if(keyDictionary[match][defaultLang])
                text = text.replaceAll(key, keyDictionary[match][defaultLang])
            else
                console.error('invalid translation id', match)
        } else if(key.startsWith('^{&file:'))
        {
            const filePath = match.split(":")[1]
            if(!filePath)
                throw 'invalid file path'
            if(filePath.includes('_header.html') &&  req.get('sec-fetch-dest') == 'iframe')
            {
                text =  text.replaceAll(key, '')
                continue
            }  
            const file = fs.readFileSync(path.resolve(rootDirName, 'public', filePath)).toString()
            text = text.replaceAll(key, parseText(file, req)) // recursivly parse file text
        } else if(key.startsWith('^{*'))
        {
            const keys = match.split('.')
            let obj = params;
            for(const key2 of keys)
                if(obj && obj[key2])
                {
                    
                     obj = obj[key2]
                     
                }
                else 
                {
                    obj = undefined;
                    break
                }

            if(obj)
                text = text.replaceAll(key, obj)
            else 
                text = text.replaceAll(key, '')
        }
    }
    return text;
            
}
export function parseHTML(req,res, next)
{
    const filePath = req.path.endsWith('/') || req.path.endsWith('\\') ? req.path + '/index.html' : req.path;
    const fullPath = path.join(rootDirName,'public', filePath)
    const ext = filePath.split('.').at(-1) ?  filePath.split('.').at(-1) : 'text'
    if(ext != 'html')
    {
        // res.sendFile(fullPath)
        next()
        return
    }
    // fs.createReadStream(fullPath) // use read streams
   

    try {
        fs.readFile(fullPath, (err, file) => {
            if(err || !file)
               return next()

            res.contentType(ext).send(parseText(file.toString(), req))
        })
    } catch (err)
    {
        console.error(err)
        // res.statusCode(404).send(err)
        // res.sendFile(fullPath)
        next()
        return
    }
    
    
    

}
    
app.use(parseHTML, express.static('public'),handle404)




process.on('unhandledRejection', (reason: any, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

