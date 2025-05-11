"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const ws_1 = __importDefault(require("ws"));
const path_1 = __importDefault(require("path"));
const types_js_1 = require("../shared/src/types.js");
const stream_1 = require("stream");
const types_1 = require("./types");
// import {RedisStore} from "connect-redis"
// // import {Redis} from "redis"
// import Redis, { Cluster } from 'ioredis';
// import session from "express-session"
// import { v4 as uuidv4 } from 'uuid';
const app = (0, express_1.default)();
const compression = require('compression');
const sessionStore_1 = __importDefault(require("./sessionStore"));
const os = require('os');
const login_js_1 = __importDefault(require("./src/routes/login.js"));
const signup_js_1 = __importDefault(require("./src/routes/signup.js"));
const profile_js_1 = __importDefault(require("./src/routes/profile.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const users = __importStar(require("./usersManager"));
const usersManager_1 = require("./usersManager");
app.use(compression());
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
/* IMPORTS */
// FileManagement.ts
function createFile() {
}
/*END IMPORTS*/
// app.get('/problem', problemCreator);
app.post('/editor/saveProject', authMiddleware, (req, res) => {
    const { name, sessionId: saveSessionId } = req.body;
    console.log(saveSessionId);
    if (!sessionMap.has(saveSessionId))
        return;
    // sessionMap.get(saveSessionId).
    fs_1.default.cp(path_1.default.join(__dirname, "cache", saveSessionId), path_1.default.join(__dirname, "saved", saveSessionId), { recursive: true }, (() => {
        try {
            if (!users.getIdFromJWT(req))
                throw 'not logged in';
            users.addProject(users.getIdFromJWT(req), { name: name, fileUUID: saveSessionId });
            res.status(200).json({ message: "sucsess" });
        }
        catch (err) {
            if (err.code)
                res.status(err.code).json({ message: err.message });
            else
                res.status(401).json('error: ' + err);
        }
    }));
});
app.get('/editor/loadProject/:id', authMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    // const { name, sessionId:saveSessionId } = req.body;
    // console.log(saveSessionId)
    // if(!sessionMap.has(saveSessionId)) return
    // // sessionMap.get(saveSessionId).
    users.default.project.findFirst({
        where: {
            id
        }
    }).then(project => {
        // res.json({project})
        // res.redirect('/editor?session=' + project?.fileUUID)
        fs_1.default.cp(path_1.default.join(__dirname, "saved", project?.fileUUID), path_1.default.join(__dirname, "cache", project?.fileUUID), { recursive: true }, (() => {
            res.status(200).json({ redirectTo: '/editor?save=' + project?.fileUUID });
        }));
    }).catch((err) => {
        res.status(401).send(err);
    });
});
app.get('/editor/listProjects', authMiddleware, (req, res) => {
    // if(!users.getIdFromJWT(req)) res.status(401).send('no user')//json({message: "couldnt get user id"})
    // try {
    users.default.project.findMany({
        where: {
            userId: users.getIdFromJWT(req)
        }
    }).then(projects => {
        // if(!projects) res.status(403).send('')
        res.json({ projects });
    })
        .catch(err => {
        if (err.code)
            res.status(err.code).json({ message: err.message });
        else
            res.status(401).send(err); //json({message: 'error: ' + err})
    });
    // } catch (err: any) {
    //     // if(err.code) res.status(err.code).json({message: err.message})
    //         // else
    //      res.status(401).json('err')//json({message: 'error: ' + err})
    // }
});
// app.get('/problem', problemCreator);
app.get('/editor', (req, res) => {
    fs_1.default.readFile(path_1.default.join(__dirname, 'public', 'editor.html'), (err, file) => {
        let text;
        const userId = users.getIdFromJWT(req);
        const logged = userId != undefined;
        if (logged) {
            users.getUserData(userId).then((userdata) => {
                text = file.toString().replace('#{login}', ` <li><button class="share-session" onclick="listProjects()">Projects</button></li>\n<li><a href='/profile'>Hey <p class='user-name'>${userdata?.name}</p><div class='focus-line'></div></a></li>`);
                text = text.replace(/\*\{(.*)\}/g, '$1');
                res.send(text.toString());
                // for(const match of text.matchAll(/\*{(.*)}/g))
                // {
                //     match[1]
                // }
            });
        }
        else {
            text = file.toString().replace('#{login}', '<li><a id="signup" href="../signup">Sign-up</a><a id="login" href="../login">Login</a></li>');
            text = text.replace(/\*\{(.*)\}/g, '');
            res.send(text.toString());
        }
    });
});
const privateKeyPem = fs_1.default.readFileSync('../private.pem', 'utf8');
function authMiddleware(req, res, next, role) {
    // if() return res.status(403).json({ error: 'failed reading cookies' });
    const token = req.cookies.token;
    // console.log(token)
    console.log('authing');
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const user = jsonwebtoken_1.default.verify(token, privateKeyPem);
        if (JSON.parse(user).role == role || !role)
            // req.user = user;
            next();
    }
    catch (err) {
        res.status(403).json({ error: 'Invalid token' });
    }
}
function handle404(req, res, next) {
    res.status(404);
    if (req.accepts('html'))
        res.sendFile(path_1.default.join(__dirname, '/public/pages/notfound.html'));
    else
        res.json('Oops! Page not found.');
}
app.set('view engine', 'ejs');
app.use('/login', login_js_1.default);
app.use('/signup', signup_js_1.default);
app.use('/profile', authMiddleware, profile_js_1.default);
app.use('/user', usersManager_1.router);
const server = app.listen(3000, '0.0.0.0', () => console.log("Server running on port 3000"));
var FileManagementCommands;
(function (FileManagementCommands) {
    FileManagementCommands["Create"] = "create";
    FileManagementCommands["Delete"] = "delete";
    FileManagementCommands["List"] = "list";
    FileManagementCommands["Rename"] = "rename";
    FileManagementCommands["Open"] = "open";
})(FileManagementCommands || (FileManagementCommands = {}));
//          LOCAL  SERVER  VARIABLES       //
let compileProcess;
//                      END                      //  
//          GLOBAL  SERVER  VARIABLES       //
const wss = new ws_1.default.Server({ port: 8080, });
let clients = new Map();
// const sessions: Map<UUID, UUID[]> = new Map();
let runningProcesses = new Map();
let sessionMap = new Map(); // SESSION ID / EDITOR OBJECT
//                      END                      //  
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
let shared;
const isShared = false;
if (isShared) {
    shared = sessionStore_1.default.getInstance();
    // shared.onUpdate('PROCESSES_UPDATED', async () => {
    //   // Processes can't be serialized, so we just clear the list and track new ones as they’re added
    //   runningProcesses = new Map(); // Or keep any still-running ones if you have a way to validate
    // });
    shared.onUpdate('SESSIONS_UPDATED', async () => {
        const allSessions = await shared.getAllSessions();
        sessionMap = new Map(Object.entries(allSessions));
    });
    // clients will be stored locally.
}
fs_1.default.readdir(path_1.default.join(__dirname, "cache"), (err, files) => {
    if (err) {
        console.error("Error reading cache directory:", err);
        return;
    }
    files.forEach((file) => {
        fs_1.default.rm(path_1.default.join(__dirname, "cache", file), { recursive: true, force: true }, (err) => {
            if (err) {
                console.error("Error deleting cache folder:", err);
            }
            else {
                console.log("Deleted cache folder for client " + file);
            }
        });
    });
});
// SESSION //
// class EditorSession {
//     sessionId: UUID;
//     clientsActiveFile: Map<UUID, string> = new Map<UUID, string>(); // client , file name
//     clients: Map<UUID,ClientObject> = new Map<UUID,ClientObject>();
//     clientsDisplayNames: string[];
//     public constructor(sessionId?: UUID) {
//         this.sessionId = sessionId || uuidv4();
//         this.clientsDisplayNames = this.getDisplayNames();
//         sessionMap.set(this.sessionId , this);
//         state.updateSession(this.sessionId, this);
//     }
//     private getDisplayNames(): string[]
//     {
//         const nouns = ["lup", "leu", "raton", "pisică", "caine", "maimută"]; // const nouns = ["lupul", "leul", "ratonul", "pisica", "cainele", "maimuta"];
//         const prefixAdjFem = ["rapida", "curajoasa", "frumoasa", "destepta"];
//         const prefixAdjMasc = ["rapid", "curajos", "frumos", "destept"];
//         const suffixAdjMasc = ["copilul", "beta", "micul", "curajosul", "marele"];
//         const suffixAdjFem = ["copilul", "beta", "mica", "curajoasa", "marea"];
//         const formedNouns: string[] = [];
//         let adj: string;
//         let i=0,j=0;
//         nouns.forEach(noun => {
//             const isFemale = noun.endsWith("a") || noun.endsWith("ă");
//             const suffixAdj = isFemale ? suffixAdjFem : suffixAdjMasc;
//             const prefixAdj = isFemale ? prefixAdjFem : prefixAdjMasc;
//             if(Math.random() > (prefixAdj.length/suffixAdj.length/2%2))
//             {
//                 let newNown = noun;
//                 ["ul", "le"].forEach(termination => {
//                     if(noun.endsWith(termination))
//                         return newNown = noun.replace(termination, "")
//                 });
//                 adj = suffixAdj[Math.floor(Math.random() * suffixAdj.length)] || "";
//                 formedNouns.push(adj + " " + newNown)
//                 // suffixAdj.splice(suffixAdj.indexOf(adj),1);
//             }
//             else 
//             { 
//                 let newNown = noun;
//                 console.log(noun.substring(noun.length-1))
//                 switch(noun.substring(noun.length-1)) {
//                     case "e":
//                     newNown = noun + "le"
//                     break;
//                     case "a":
//                     case "ă":
//                     newNown = noun.slice(noun.length) + "a"
//                     default:
//                         if(noun.endsWith('u')) newNown = noun + "l"
//                     else newNown = noun + "ul"
//                     break;
//                 }
//                 adj = prefixAdj[Math.floor(Math.random() * prefixAdj.length)] || "";
//                 formedNouns.push(newNown + " " + adj)
//                 // prefixAdj.splice(prefixAdj.indexOf(adj),1);
//             }
//         });
//         return formedNouns;
//     }
//     public getClientId(ClientObject: ClientObject): UUID
//     {
//     return ClientObject.clientId;
//     }
//     public getClientObjectById(clientId: UUID): ClientObject | undefined
//     {
//     return this.clients.get(clientId);
//     }
//     public onRemoveClient(clientId: UUID)
//     {
//         this.clients.delete(clientId);
//         this.clientsActiveFile.delete(clientId)
//     }
//     public spawnClient(ws: WebSocket): UUID
//     {
//         const newClient = new ClientObject(this.sessionId, this);
//         console.log("spawning new client with id: " + newClient.clientId)
//         this.clients.set(newClient.clientId, newClient);
//         return newClient.clientId;
//     }
//     public replicateFunction(callback: Function, ignoreClient?: ClientObject, ) {
//         this.clients.forEach(client => {
//             if(client!=ignoreClient || !ignoreClient)
//              callback(client);
//         });
//     }
//   }
var commandType;
(function (commandType) {
    commandType["Show"] = "sessions";
    commandType["Clients"] = "clients";
    commandType["Processes"] = "processes";
})(commandType || (commandType = {}));
// TODO Improve this a lot, find a better way of calling these functions
process.stdin.on('data', (commandString) => {
    const command = commandString.toString().toLowerCase().trim().split(' ');
    console.log(command);
    const params = command.splice(0);
    function showProcesses() {
        console.log(runningProcesses);
    }
    function showSessions() {
        console.log(sessionMap);
    }
    function showClients() {
        if (!params[1])
            return console.error("Please provide session id.");
        console.log(sessionMap.get(params[1])?.clients);
    }
    switch (commandString.toString().split(' ')[0].toLowerCase().trim()) {
        case commandType.Show:
            showSessions();
            break;
        case commandType.Clients:
            showClients();
        case commandType.Processes:
            showProcesses();
            break;
        default:
            console.log("Unrecognized command: " + command);
            break;
    }
});
app.post("/compile", (req, res) => {
    // res.setHeader('Cache-Control', 'no-cache')
    // if(compileProcess) 
    //     {
    //         compileProcess.kill(); // kill the process if it is running
    //          console.error("Compile process already running for session " + sessionId);
    //     }
    // if(!sessionId) return;
    // if(!fs.existsSync(path.join(__dirname, "cache", sessionId))) return;
    const clientId = req.body.clientId;
    const sessionId = req.body.sessionId;
    const editorSession = isShared ? shared.getSession(sessionId) || sessionMap.get(sessionId) : sessionMap.get(sessionId);
    console.log(process.pid + "$: " + editorSession);
    const code = req.body.code;
    const exeFile = path_1.default.join(__dirname, "cache", sessionId);
    const filePath = path_1.default.join(exeFile, "clientFiles"); //            path.join(__dirname, "cache", sessionId);
    const codeFile = !["cpp"].includes(path_1.default.extname(editorSession?.clientsActiveFile.get(clientId) || "main.cpp")) ? editorSession?.clientsActiveFile.get(clientId) : "main.cpp";
    if (!editorSession)
        console.log(new Error("Couldnt retrieve editorSession from memory database"));
    //fs.writeFileSync(path.join(filePath,"main.cpp"), code);
    // console.log(path.extname(getThisClientSession()?.clientsActiveFile.get(clientId)||"aaa"));
    compileProcess = (0, child_process_1.spawn)("g++", ["-g", path_1.default.join(filePath, codeFile || "main.cpp"), "-o", path_1.default.join(exeFile, "main.exe")], {
        windowsHide: true,
        detached: true,
    });
    let errorData = "";
    const errors = [];
    if (compileProcess != null) {
        compileProcess.stdin?.end();
        compileProcess?.stderr?.on("data", (data) => {
            data.toString().split('\n').forEach(errorString => {
                if (!errorString)
                    return;
                errorData = errorString.replace((path_1.default.resolve(filePath) + '\\'), "");
                const regex = errorData.match(/((?!:)\d*):((?!:)\d*)/) || [];
                const column = parseInt(regex[2] || "-1");
                const row = parseInt(regex[1] || "-1");
                errors.push({ column: column, row: row, error: errorData });
            });
            //                    data.toString();
        });
        compileProcess?.stdout?.on("data", (data) => {
            console.log("stdout: " + data.toString());
        });
        compileProcess.on("close", (code) => {
            if (code === 0) {
                res.json({ success: true, fileName: codeFile });
            }
            else { //if(code===1) {
                //const correctedString = errorData.replace((path.resolve(filePath)+'\\'), "")
                console.log((path_1.default.resolve(filePath) + '\\'));
                res.json({ error: errors || "Compilation failed" });
                // } else
                // {
                //     res.json({ error: errorData || "Program exited with non-normal code: "+code });
            }
        });
    }
});
wss.on("connection", (ws, req) => {
    let gdbProcess;
    let program;
    let sessionId;
    let clientId;
    let clientObj;
    let sessionType; // true for session, false for "local" client
    let clientFilesPath;
    let heartbeatTimestamp = Date.now();
    const heartbeatTimeout = 30000; // 1 second timeout for heartbeat
    let heartbeatInterval;
    let clientSession;
    let gdbBuffer = "";
    const cookies = req.headers.cookie;
    const jwtCookie = cookies
        ?.split("; ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];
    let userData;
    let userLoggedIn = false;
    users.getUserData(users.getClientId(jwtCookie)).then((userdata) => {
        userData = userdata;
        userLoggedIn = true;
    }).catch(err => {
        // not logged in
        userData = undefined;
        userLoggedIn = false;
    }).finally(() => {
        function handshake(req) {
            const wssessionId = req.url?.split('session=')[1] != "null" || req.url?.split('session=')[1] != undefined ? req.url?.split('session=')[1] : undefined;
            console.log(wssessionId);
            //handle heartbeat
            heartbeatInterval = setInterval(() => {
                server.getConnections(function (error, count) {
                    console.log(count);
                });
                heartbeatTimestamp = Date.now(); // Update the heartbeat timestamp when a message is received
                ws.send(JSON.stringify({ type: types_js_1.WebSocketMessageType.Heartbeat, connections: server.connections, expectedDelay: heartbeatTimeout })); // Send a ping message to the client every 30 seconds
                if (Date.now() - heartbeatTimestamp >= heartbeatTimeout * 2) {
                    //console.log("Client " + clientId + " timed out ");
                    //sessions.delete(sessionId);
                    if (getThisClientSession()?.clients.get(clientId))
                        console.error("Client not found in session while trying to time out client  " + sessionId);
                    else
                        getThisClientSession()?.clients.delete(clientId);
                    clients.delete(clientId);
                    clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
                    ws.close(); // Close the connection if no response received within double of timeout seconds
                }
            }, heartbeatTimeout);
            // TODO Check if session exists, otherwise create a new one and make this client the host.
            if (wssessionId) {
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
                const activeSession = sessionMap.has(wssessionId) || (isShared && shared.getSession(wssessionId));
                if (activeSession) // = There is an active session, join it.
                 {
                    if (isShared) {
                        if (shared.getSession(wssessionId))
                            clientSession = shared.getSession(wssessionId);
                    } // sessionMap.get(wssessionId ||  uuidv4() as UUID) || new EditorSession; 
                    if (!sessionMap.get(wssessionId))
                        return console.error(new Error("Didnt find session in sessionMap while joing session"));
                    else
                        clientSession = sessionMap.get(wssessionId);
                    clientId = (getThisClientSession() || clientSession)?.spawnClient(ws, userData);
                    clientObj = getThisClientSession().getClientObjectById(clientId);
                    clients.set(clientId, ws);
                    // printClientConsoleDebug('joining session: ' + clientSession.sessionId)
                }
                else // there is no session, create it.
                 {
                    //getThisClientSession()?.clients.push(clientId); // add client to client list.
                    clientSession = createThisClientSession(wssessionId);
                    clientId = getThisClientSession()?.spawnClient(ws, userData);
                    clientObj = getThisClientSession().getClientObjectById(clientId);
                    clients.set(clientId, ws);
                    // printClientConsoleDebug('creating session: ' + clientSession.sessionId)
                    if (clientSession && !isShared) {
                        sessionMap.set(clientSession.sessionId, clientSession); // TODO Implement this in EditorSession class & polish it
                    }
                }
                sessionId = getThisClientSession().sessionId;
                clientFilesPath = path_1.default.join(__dirname, "cache", sessionId, "clientFiles");
                console.log("sesh id" + sessionId);
                // clients.set(clientId, ws);
                if (clientObj && isShared) {
                    shared.getSession(sessionId)?.clients.set(clientId, clientObj);
                    shared.addClient(clientId, sessionId);
                    shared.updateSession(sessionId, clientSession);
                }
                connectionReady(true);
            }
            else {
                //client connected to new SOLO session
                //   clientId = uuidv4(); // Generate a unique ID
                //   sessionId = clientId; // Use the generated ID as the session ID
                // sessions.set(clientId, [sessionId]);
                clientSession = createThisClientSession();
                if (getThisClientSession() != undefined) {
                    sessionId = clientSession.sessionId;
                    console.log("sesh id" + getThisClientSession());
                    // getThisClientSession().sessionId = sessionId;
                    // getThisClientSession()?.clients.set(clientId); // add client to client list.
                    clientId = getThisClientSession()?.spawnClient(ws, userData);
                    clientObj = getThisClientSession().getClientObjectById(clientId);
                    clientFilesPath = path_1.default.join(__dirname, "cache", sessionId, "clientFiles");
                    sessionMap.set(clientSession.sessionId, clientSession); // TODO Implement this in EditorSession class & polish it
                }
                else
                    console.error(new Error("Failed to create SOLO session"));
                if (clientObj && shared) {
                    shared.getSession(sessionId)?.clients.set(clientId, clientObj);
                    shared.addClient(clientId, sessionId);
                    shared.updateSession(sessionId, clientSession);
                }
                clients.set(clientId, ws);
                // printClientConsoleDebug('solo session: ' + clientSession.sessionId)
                connectionReady(false);
            }
        }
        // TODO add session map 
        // if (gdbProcess) {
        //     gdbProcess.kill(); // Ensure only one GDB session runs at a time
        // }
        // if (program) {
        //     program.kill(); // Ensure only one GDB session runs at a time
        // }
        const customStream = new stream_1.Writable({
            write(chunk, encoding, callback) {
                console.log(`Received from WebSocket, sending to C++ stdin: ${chunk.toString()}`);
                program?.stdin?.write(chunk, encoding, callback); // Forward to child stdin
            },
            final(callback) {
                program?.stdin?.end(); // Close stdin when done
                callback();
            }
        });
        //   function getSessionMap(): Map<UUID, EditorSession>
        //   {
        //     state.getClient
        //   }
        function getThisClientSession() {
            // if(!sessionMap.get(sessionId)) 
            // { 
            //     console.error("couldnt find session object, creating a new session instead.")
            //     return new EditorSession(sessionId);
            // } else
            if (isShared)
                return clientSession || sessionMap.get(sessionId); //||  new EditorSession(sessionId);
            else if (sessionMap.get(sessionId))
                return sessionMap.get(sessionId); //||  new EditorSession(sessionId);
            else
                console.error(new Error('Couldnt get this client session'));
            return clientSession;
        }
        function createThisClientSession(sessionId) {
            const newSession = new types_1.EditorSession(sessionId);
            if (isShared)
                shared.updateSession(newSession.sessionId, newSession);
            // sessionMap.set(newSession.sessionId , newSession)
            return newSession;
        }
        function addProcessToMap(sessionId, process) {
            // if (runningProcesses.has(sessionId)) {
            // } else
            // runningProcesses.set(sessionId, process);
            // if(isShared) shared.addProcess(sessionId, process);
            getThisClientSession().process = process;
        }
        function removeProcessFromMap(sessionId) {
            // if (runningProcesses.has(sessionId)) {
            //     runningProcesses.delete(sessionId);
            // } else console.error("Process not found in map for client " + sessionId);
            getThisClientSession().process = undefined;
        }
        function getProcessFromMap(sessionId) {
            // return runningProcesses.get(sessionId);
            return getThisClientSession()?.process;
        }
        function printClientConsoleError(message, cause, client) {
            const targetClientId = client?.clientId || clientId;
            const clientSocket = clients.get(targetClientId);
            if (clientSocket) {
                console.error(new Error(message, { cause: cause }));
                clientSocket.send(JSON.stringify({ error: true, type: types_js_1.WebSocketMessageType.Error, body: message, messageType: types_js_1.ConsoleMessageType.Error }));
            }
            else {
                console.error("Client not found:", clientId);
            }
        }
        function printClientConsoleInfo(message, client) {
            const targetClientId = client?.clientId || clientId;
            const clientSocket = clients.get(targetClientId);
            console.log(message);
            if (clientSocket) {
                clientSocket.send(JSON.stringify({ error: true, type: types_js_1.WebSocketMessageType.Console, body: message, messageType: types_js_1.ConsoleMessageType.Info }));
            }
            else {
                console.error("Client not found:", targetClientId);
            }
        }
        function printClientConsoleDebug(message, client) {
            const targetClientId = client?.clientId || clientId;
            const clientSocket = clients.get(targetClientId);
            if (clientSocket) {
                console.debug("DEBUG: " + message);
                clientSocket.send(JSON.stringify({ error: true, type: types_js_1.WebSocketMessageType.Console, body: message, messageType: types_js_1.ConsoleMessageType.Debug }));
            }
            else {
                console.error("Client not found:", targetClientId);
            }
        }
        function printClientConsoleSessionInfo(message, client) {
            const targetClientId = client?.clientId || clientId;
            const clientSocket = clients.get(targetClientId);
            if (clientSocket) {
                clientSocket.send(JSON.stringify({ error: true, type: types_js_1.WebSocketMessageType.Console, body: message, messageType: types_js_1.ConsoleMessageType.SessionInfo }));
            }
            else {
                console.error("Client not found:", targetClientId);
            }
        }
        let mode = "run"; //debug
        // TODO Replace with replicate function.
        function replicateSocketMessage(sessionId, senderId, ignoreSender, response, filterFunction) {
            getThisClientSession()?.clients.forEach((clientObject, client) => {
                // for(const client of getThisClientSession()?.clients.keys()) {
                //send response to all clients
                if (ignoreSender && clientId == client)
                    return;
                if (filterFunction != undefined) { // use filter function
                    if (filterFunction(client) == false) {
                        const clientSocket = clients.get(client);
                        if (!clientSocket) {
                            // if(sessions.get(sessionId)?.indexOf(client) === -1)  console.error("Client not found in session while trying to time out client  " + sessionId);
                            //                      else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(client) || -1, 1);
                            //                  clients.delete(client);
                            return console.error("\\x1b[31m Client not found while replicating message " + client + "\\x1b[0m");
                        }
                        // } return console.error("Client not found " + client);
                        clientSocket?.send(JSON.stringify(response));
                    }
                }
                else {
                    const clientSocket = clients.get(client);
                    if (!clientSocket) {
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
        function connectionReady(cooperator = false) {
            const clientFilesPath = path_1.default.join(__dirname, "cache", sessionId, "clientFiles");
            // printClientConsoleInfo("connected to worker: " + process.pid)
            //create cache folder for session if its a new one
            if (!fs_1.default.existsSync(path_1.default.join(__dirname, "cache", sessionId)) || !cooperator) {
                // fs.mkdir(path.join(__dirname, "cache", sessionId), { recursive: true }, (err) => {
                //     console.log("created cache folder for sessionId " + sessionId);
                //     if (err) {
                //         console.error("Error creating cache folder:", err);
                //     }
                // });
                fs_1.default.mkdir(clientFilesPath, { recursive: true }, (err) => {
                    console.log("created cache and client Files folder for sessionId " + sessionId);
                    if (err) {
                        console.error("Error creating cache folder:", err);
                    }
                    const defaultText = fs_1.default.readFileSync("user_code.cpp").toString();
                    fs_1.default.writeFile(path_1.default.join(clientFilesPath, "main.cpp"), defaultText, (err) => {
                        listFiles(clientFilesPath).then(() => {
                            openFile("main.cpp");
                        });
                    });
                });
            }
            else {
                console.error("Cache folder already exists for sessionId " + sessionId);
                listFiles(clientFilesPath).then(() => {
                    if (!fs_1.default.existsSync(path_1.default.join(clientFilesPath, "main.cpp")))
                        console.error("No default file was found!"); // TODO replace with async function
                    openFile("main.cpp");
                });
            }
            // display join message
            replicateFunction((clientWs, LocalclientId) => {
                printClientConsoleSessionInfo(clientObj?.displayName + " joined!", getThisClientSession().getClientObjectById(LocalclientId));
            }, clientObj);
            // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Console, messageType: ConsoleMessageType.SessionInfo, body: "Client " + clientObj?.displayName + " joined!"});
            console.log("Client connected to GDB server" + clientId);
            const welcomeMessage = !userLoggedIn ?
                `Bine ai venit pe Intelege Info!
            Scrie niste cod, apoi apasa compile si execute code, sau ruleaza in debugger.
            Invita-ti prietenii sa editeze codul impreuna cu tine in timp real apasnd butonul share`
                :
                    `Bine ai revenit ${userData?.name} pe Intelege Info!
            Poti salva codul tau apasand pe butonul save.`;
            // Send initial message to client
            ws.send(JSON.stringify({ type: types_js_1.WebSocketMessageType.Handshake, clientId: clientId, messageType: types_js_1.ConsoleMessageType.Info, sessionId: sessionId, body: welcomeMessage }));
            if (getThisClientSession()?.clients.size > 1) // multiple clients connected to this session
             {
                let displayNames = [];
                getThisClientSession()?.clients.forEach((client, id) => {
                    displayNames.push(client.displayName);
                });
                replicateSocketMessage(sessionId, clientId, false, { type: types_js_1.WebSocketMessageType.ColabData, clients: displayNames, thisClientId: clientId, thisSessionId: sessionId });
                console.log(getThisClientSession().clientCommandBuffer);
                setTimeout(() => {
                    getThisClientSession().clientCommandBuffer.forEach((cmdBuf, remoteClientid) => {
                        if (clientId != remoteClientid)
                            if (getThisClientSession().clientsActiveFile.get(remoteClientid) === getThisClientSession().clientsActiveFile.get(clientId))
                                ws.send(JSON.stringify(cmdBuf.codeSelection));
                    });
                }, 100);
            }
        }
        handshake(req);
        // debug mode only for now
        async function executeCommand(childProcess, command, sessionId) {
            return new Promise((resolve, reject) => {
                let gdbBuffer = "";
                const onData = (data) => {
                    gdbBuffer += data.toString();
                    console.log(gdbBuffer);
                    // Check if the full response has arrived
                    if (gdbBuffer.includes("(gdb)")) {
                        // We have everything, remove listener
                        childProcess.stdout.removeListener("data", onData);
                        const response = {
                            error: false,
                            input: false,
                            type: types_js_1.WebSocketMessageType.Output,
                            messageType: types_js_1.ConsoleMessageType.DebugProgram,
                            clientId: clientId,
                            body: gdbBuffer,
                            message: command.toString(),
                            msgId: gdbProcess?.pid || -1,
                        };
                        getThisClientSession()?.clients.forEach((client, id) => {
                            //send response to all clients
                            const clientSocket = clients.get(client.clientId);
                            if (!clientSocket) {
                                //sessions.delete(sessionId);
                                if (getThisClientSession()?.clients.has(clientId))
                                    console.error("Client not found in session while manually replicating to client  " + sessionId);
                                else
                                    getThisClientSession()?.clients.delete(client.clientId);
                                clients.delete(client.clientId);
                                return console.error("\\x1b[31m Client not found, removing ids " + client + "\\x1b[0m");
                            }
                            clientSocket?.send(JSON.stringify(response));
                        });
                        if (command === 'quit' && childProcess)
                            closeProcess(childProcess);
                        resolve();
                    }
                };
                if (childProcess && childProcess.stdin && childProcess.stdout) {
                    // Use .on instead of .once, because GDB output can be split
                    childProcess.stdout?.on("data", onData);
                    // Send the command
                    childProcess.stdin?.write(command + "\n");
                }
                else
                    console.error("GDB process not found for session " + sessionId);
            });
        }
        let CommandQueue = Promise.resolve();
        function queueCommand(process, command, sessionId) {
            CommandQueue = CommandQueue.then(() => executeCommand(process, command, sessionId)).catch(() => {
                printClientConsoleError("failed to queue debugger command");
            });
            return CommandQueue;
        }
        async function listFiles(dir) {
            try {
                return await new Promise((resolve, reject) => {
                    fs_1.default.readdir(dir, (err, files) => {
                        if (err) {
                            printClientConsoleError("Error listing files: " + err.message);
                            reject();
                        }
                        else {
                            // const fileContentMap: Map<string, string> = new Map<string, string>();
                            // files.forEach(element => {
                            //     fileContentMap.set(element, fs.readFileSync(path.join(clientFilesPath, element)).toString());
                            // });
                            if (!files)
                                return reject();
                            const targetFiles = files.filter(file => {
                                return ![".exe", ".o"].includes(path_1.default.extname(file).toLowerCase());
                            });
                            resolve();
                            ws.send(JSON.stringify({ type: types_js_1.WebSocketMessageType.FileManagement, body: { command: FileManagementCommands.List, content: targetFiles } })); // Send the list of files to the client
                        }
                    });
                });
            }
            catch (reason) {
                console.log("Failed listing files: " + reason);
                printClientConsoleDebug("Failed listing files: " + reason);
            }
        }
        function openFile(fileName) {
            // if(fs.existsSync(path.join(clientFilesPath, fileName)))
            // console.log("path: " + path.join(clientFilesPath || path.join(__dirname, "cache", sessionId,"clientFiles"), fileName))
            fs_1.default.readFile(path_1.default.join(clientFilesPath, fileName), (err, data) => {
                if (err) {
                    printClientConsoleError("Error opening file: " + err.message);
                }
                else {
                    // Send the file content to the client
                    console.log("File opened successfully");
                    const oldFileName = getThisClientSession()?.clientsActiveFile.get(clientId);
                    replicateSocketMessage(sessionId, clientId, true, { type: types_js_1.WebSocketMessageType.CodeSelection, body: null }, (client) => { return getThisClientSession()?.clientsActiveFile.get(client) === oldFileName; }); // potential fix for a glitch where markers dont get deleted when switching tabs
                    getThisClientSession()?.clientsActiveFile.set(clientId, fileName);
                    if (isShared)
                        shared.updateSession(sessionId, getThisClientSession());
                    ws.send(JSON.stringify({ type: types_js_1.WebSocketMessageType.FileManagement, body: { command: FileManagementCommands.Open, content: data.toString(), fileName: fileName } })); // Send the list of files to the client
                }
            });
        }
        // Handle GDB session commands from client
        ws.on("message", async (message, isBinary) => {
            try {
                let messageJSON;
                if (JSON.parse(message.toString()).data != undefined)
                    messageJSON = JSON.parse(message.toString()).data;
                else
                    messageJSON = JSON.parse(message.toString());
                const command = messageJSON.command;
                const args = messageJSON.args;
                const type = messageJSON.type;
                // console.log("Received message from client: ", messageJSON);
                //console.log("Received message from client: ", type);
                // if(type!= WebSocketMessageType.Heartbeat)
                //     {
                //         console.log(getThisClientSession())
                //     }
                switch (type) {
                    case types_js_1.WebSocketMessageType.Heartbeat:
                        if (!clientObj)
                            break;
                        clientObj.ping = Date.now() - heartbeatTimestamp;
                        console.log("Client ping: " + clientObj?.ping);
                        //console.log("Received heartbeat from client " + clientId);
                        break;
                    /*
                    case WebSocketMessageType.Handshake:
    
    
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
                                clientFilesPath = path.join(__dirname, "cache", sessionId,"clientFiles");
    
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
    
                                clientFilesPath = path.join(__dirname, "cache", sessionId,"clientFiles");
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
    
                        
                    //    if(fs.existsSync(path.join(__dirname, "cache", sessionId)))
                      //      fs.writeFileSync(path.join(__dirname, "cache", sessionId , "user_code.cpp"), "// C++ code here\n");
    
                   
                    // printClientConsoleDebug('joined session: ' + clientSession.sessionId)
    
                        
                        break;
                        */
                    case types_js_1.WebSocketMessageType.Console:
                        if (getProcessFromMap(sessionId) != undefined)
                            getProcessFromMap(sessionId)?.stdin?.write(messageJSON.command + "\n");
                        // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Console, messageType: ConsoleMessageType.UserChat,  body: messageJSON.command, clientDisplayName: clientObj?.displayName});
                        replicateFunction((clientWs) => {
                            clientWs.send(JSON.stringify({ type: types_js_1.WebSocketMessageType.Console, id: getThisClientSession().messageIndex, messageType: types_js_1.ConsoleMessageType.UserChat, body: messageJSON.command, clientDisplayName: clientObj?.displayName, clientId: clientId })); // Send GDB output to the client
                        });
                        getThisClientSession().messageIndex++; // counter used to id and group console mssages.
                        // clients.forEach((client, id) => {
                        //         client.send(JSON.stringify({error: false, input: false, clientId: clientId, type: WebSocketMessageType.Console, body: messageJSON.command})); // Send initial message to client
                        // });
                        break;
                    case types_js_1.WebSocketMessageType.CodeChange:
                        const shouldSave = messageJSON.saveFile;
                        const fileName = messageJSON.fileName;
                        if (true && type === types_js_1.WebSocketMessageType.CodeChange) // TODO replace true with shouldSave 
                         {
                            //   TODO make a more efficient way of updating the file, either by streams (streaming updates to file) or a save button.
                            fs_1.default.writeFile(path_1.default.join(clientFilesPath, fileName), messageJSON.body, (err) => {
                                if (err)
                                    console.log("Failed saving file!");
                                console.log("saved file");
                            });
                        }
                        replicateFunction((clientWs, localClientId) => {
                            if (getThisClientSession().clientsActiveFile.get(localClientId) === getThisClientSession().clientsActiveFile.get(clientId))
                                clientWs.send(JSON.stringify({ type: types_js_1.WebSocketMessageType.CodeChange, clientId: clientId, body: messageJSON, msgId: JSON.parse(message.toString()).msgId }));
                        }, clientObj);
                        break;
                    case types_js_1.WebSocketMessageType.ConsoleTyping:
                        const TypingIndicatorType = messageJSON.status;
                        replicateFunction((clientWs, localClientId) => {
                            clientWs.send(JSON.stringify({ type: types_js_1.WebSocketMessageType.ConsoleTyping, displayName: clientObj?.displayName, clientId: clientId, status: TypingIndicatorType }));
                        }, clientObj);
                        break;
                    case types_js_1.WebSocketMessageType.CodeSelection:
                        //fs.writeFileSync(path.join(__dirname, "cache", sessionId , "user_code.cpp"), messageJSON.code);
                        // console.log(type + " for sessionId " + sessionId);
                        const codeSelectionJSON = { type: types_js_1.WebSocketMessageType.CodeSelection, clientId: clientId, body: messageJSON };
                        getThisClientSession().clientCommandBuffer.set(clientId, { codeSelection: codeSelectionJSON });
                        // rename this to something more apropriate eg guily client idk
                        //    replicateSocketMessage(sessionId, clientId, true, {type: type, clientId: clientId, body: messageJSON}, (client) => { let filter = getThisClientSession()?.clientsActiveFile.get(client) != fileName; console.log(getThisClientSession()?.clientsActiveFile.get(client) + fileName); return filter;});
                        replicateFunction((clientWs, localClientId) => {
                            if (getThisClientSession().clientsActiveFile.get(localClientId) === getThisClientSession().clientsActiveFile.get(clientId))
                                clientWs.send(JSON.stringify(codeSelectionJSON));
                        }, clientObj);
                        // clients.forEach((client, id) => {
                        //     if(clientId!=id)
                        //         client.send(JSON.stringify({error: false, type: type, body: messageJSON})); // Send initial message to client
                        // });
                        break;
                    case types_js_1.WebSocketMessageType.FileManagement:
                        // Handle folder management commands here
                        // Example: Create a new folder, delete a folder, etc.
                        /*
    
                        messageJson.command
                        messageJson.body
    
    
                        */
                        const commandType = messageJSON.command;
                        switch (commandType) {
                            case FileManagementCommands.Create:
                                if (!fs_1.default.existsSync(path_1.default.join(clientFilesPath, messageJSON.body)))
                                    fs_1.default.writeFile(path_1.default.join(clientFilesPath, messageJSON.body), "", (err) => {
                                        if (err) {
                                            printClientConsoleError("Error creating file: " + err.message);
                                        }
                                        else {
                                            const fileName = messageJSON.body.toString();
                                            ;
                                            replicateSocketMessage(sessionId, clientId, false, { type: types_js_1.WebSocketMessageType.FileManagement, body: { content: fileName, command: commandType || FileManagementCommands.Create } }); // Send the list of files to the client
                                            console.log("File created successfully");
                                        }
                                    });
                                else
                                    printClientConsoleError("File already exists!");
                                break;
                            case FileManagementCommands.Delete:
                                fs_1.default.unlink(path_1.default.join(clientFilesPath, messageJSON.body), (err) => {
                                    if (err) {
                                        printClientConsoleError("Error deleting file: " + err.message);
                                    }
                                    else {
                                        console.log("File deleted successfully");
                                        replicateSocketMessage(sessionId, clientId, false, { type: types_js_1.WebSocketMessageType.FileManagement, body: ({ command: commandType, content: messageJSON.fileName, }) });
                                    }
                                });
                                break;
                            //  TODO Make this so it just return name and make seperate function for fle content, which will be called only when opening the file on the client. STORE IT IN CACHE, ADD A DIRTY VERIFICATION TO NOT SEND THE SAME SHI MULTIPLE TIMES DONT OPEN THE EDITOR UNTIL THE FILE HAS LOADED ON THE CLIENT SEND THE FILES ON  HANDSHAKE MAKE SURE IT IS ALL REPLICATED
                            case FileManagementCommands.List:
                                listFiles(clientFilesPath);
                                break;
                            case FileManagementCommands.Rename:
                                break;
                            case FileManagementCommands.Open:
                                openFile(messageJSON.body);
                                break;
                        }
                    default:
                        if (clientId === sessionId) //  TODO Remove because this isnt used anymore
                            // handle case when client is the session owner
                            handleCommand(command, [[clientId, ws]]);
                        else
                            // handle case when client is a collaborator
                            handleCommand(command, clients); // pass all the clients in the session
                        async function handleCommand(command, sockets) {
                            const filePath = path_1.default.join(__dirname, "cache", sessionId, "main.exe");
                            try {
                                fs_1.default.accessSync(filePath);
                                if (command == "execute") {
                                    async function executeProgram() {
                                        return new Promise((resolve, reject) => {
                                            console.log("executing program");
                                            // const filePath = path.join(__dirname, "cache", sessionId, "main.exe");
                                            fs_1.default.stat(filePath, (err, stats) => {
                                                if (err) {
                                                    printClientConsoleError('Please compile the program first! ' + err?.code);
                                                    return;
                                                }
                                                // Example usage:
                                                // Example usage:
                                                const cacheFolder = path_1.default.join(__dirname, "cache", sessionId); // Folder containing .exe and sandbox_folder
                                                const cppExe = path_1.default.resolve(cacheFolder, 'main.exe');
                                                // Run and capture the child process
                                                //program = buildAndRunCppSandbox(cppExe, cacheFolder);
                                                // if(!program) return console.error('invalid program')
                                                program = (0, child_process_1.spawn)(filePath, {
                                                    cwd: path_1.default.join(__dirname, "cache", sessionId, "clientFiles"), // we must add this for the program to have the correct directory for input files.
                                                }); // start program
                                                addProcessToMap(sessionId, program); // add to process map
                                                mode = "run";
                                                // program.stdin?.on('finish', function () {
                                                // console.log("await input")
                                                // });
                                                // const onProgramOut = new Writable({
                                                //     write(chunk, encoding, callback) {
                                                //       ws.send(JSON.stringify({error: false, input: false, type: WebSocketMessageType.Output, body: chunk.toString()})); // Send GDB output to the client
                                                //     //  console.log("stdout: " + chunk.toString());
                                                //       callback(); // Tell Node you're done processing this chunk
                                                //     }
                                                //   });
                                                // const onProgramOut = new Readable({
                                                //     read(size: 0) {
                                                //         ws.send(JSON.stringify({error: false, input: false, type: WebSocketMessageType.Console, body: "$: Awaiting input: \n"})); // Send GDB output to the client
                                                //     }
                                                // });
                                                // onProgramOut.on("data", (data) => {
                                                //     printClientConsoleError("Awaiting input: " + data.toString())
                                                //      ws.send(JSON.stringify({error: false, input: false, type: WebSocketMessageType.Console, body: "$: Awaiting input: \n"})); // Send GDB output to the client
                                                // })
                                                //   program.stdout?.pipe(onProgramOut) //TODO Try and figure out a way to pipe input from the program to the client
                                                // if(program.stdin)
                                                //     onProgramOut.pipe(program.stdin); // pipe stdin to program stdin
                                                // const clientFilesPath = path.join(__dirname, "cache", sessionId,"clientFiles");
                                                // fs.readdir(clientFilesPath,  (err, files) => {
                                                //     if (err) {
                                                //         console.error("Error reading client files directory:", err);
                                                //         return;
                                                //     }
                                                //     files.forEach((file) => {
                                                // })
                                                program.stdout?.on("data", (data) => {
                                                    gdbBuffer += data.toString();
                                                    replicateFunction((clientWs) => {
                                                        clientWs.send(JSON.stringify({ messageType: types_js_1.ConsoleMessageType.Output, type: types_js_1.WebSocketMessageType.Output, body: gdbBuffer.toString(), clientId: clientId })); // Send GDB output to the client
                                                    });
                                                    gdbBuffer = "";
                                                });
                                                program?.on("spawn", () => {
                                                    console.log("Program started successfully");
                                                });
                                                program?.stderr?.on("data", (data) => {
                                                    gdbBuffer += data.toString();
                                                    replicateFunction((clientWs) => {
                                                        clientWs.send(JSON.stringify({ error: true, input: false, type: types_js_1.WebSocketMessageType.Error, body: gdbBuffer.toString(), messageType: types_js_1.ConsoleMessageType.Output, clientId: clientId })); // Send GDB output to the client
                                                    });
                                                    gdbBuffer = "";
                                                });
                                                program?.on("close", (code) => {
                                                    if (code === null)
                                                        return ws.send("Program exited with invalid code");
                                                    gdbBuffer = "Program exited with code: " + code?.toString();
                                                    replicateFunction((clientWs) => {
                                                        clientWs.send(JSON.stringify({ type: types_js_1.WebSocketMessageType.End, messageType: types_js_1.ConsoleMessageType.Output, body: gdbBuffer.toString(), clientId: clientId })); // Send GDB output to the client
                                                    });
                                                    gdbBuffer = "";
                                                    // removeProcessFromMap(sessionId);
                                                    onClosedProcess(sessionId);
                                                    // closeProcess(program,sessionId).then(() => {
                                                    //     replicateFunction((clientWs) => {
                                                    //         clientWs.send(JSON.stringify({type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, body: gdbBuffer.toString(), clientId: clientId}));  // Send GDB output to the client
                                                    //         });
                                                    //     resolve()
                                                    //     console.log('finished program')
                                                    // })
                                                    // resolve(); // Resolve the promise when the process closes
                                                });
                                                //await queueCommand(program,message);
                                            });
                                        });
                                    }
                                    // execute code normally.
                                    if (getProcessFromMap(sessionId)) // check if program is running
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
                                        closeProcess(program, sessionId).then(() => {
                                            replicateFunction((clientWs) => {
                                                clientWs.send(JSON.stringify({ type: types_js_1.WebSocketMessageType.End, messageType: types_js_1.ConsoleMessageType.Output, body: gdbBuffer.toString(), clientId: clientId })); // Send GDB output to the client
                                            });
                                        });
                                    }
                                    else
                                        executeProgram();
                                }
                                else if (command == "run") {
                                    if (!getProcessFromMap(sessionId)) {
                                        mode = "debug"; //set mode to debug
                                        gdbProcess = (0, child_process_1.spawn)("gdb", ["-q", "-ex", "set pagination off", /*"set print thread-events off", "-interpreter= mi", */ filePath]);
                                        addProcessToMap(sessionId, gdbProcess);
                                        if (!getThisClientSession().process)
                                            console.error('Invalid session while starting debug process');
                                        printClientConsoleDebug("started debugging process.");
                                        // gdbProcess.on('close', (code) => {
                                        //     console.log('CLOSED DEBUG PROCESS')
                                        //     onClosedProcess();
                                        //     gdbProcess = undefined;
                                        // })
                                        app.get("/requestValue", (req, res) => {
                                            const command = req.query.value;
                                            const cmdId = parseInt(req.query.cmdId);
                                            // console.log(clientId + " " + command)
                                            if (mode != "debug")
                                                res.status(400).send('Bad Request: GDB process not active');
                                            if (!gdbProcess)
                                                res.status(400).send('Bad Request: GDB process not active');
                                            if (!command)
                                                res.status(400).send('Bad Request: invalid command');
                                            //res.send({code: fs.readFileSync("user_code.cpp").toString()});
                                            if (mode != "debug" || !gdbProcess || !command)
                                                return;
                                            new Promise((resolve, reject) => {
                                                let gdbBuffer = "";
                                                const onData = (data) => {
                                                    gdbBuffer += data.toString();
                                                    // Check if the full response has arrived
                                                    if (gdbBuffer.includes("(gdb)")) {
                                                        if (parseInt(gdbBuffer.toString().match(/(?<=\$)\d*/)?.[0]) === cmdId + 1) {
                                                            // We have everything, remove listener
                                                            gdbProcess?.stdout?.removeListener("data", onData);
                                                            resolve();
                                                            return res.send(({
                                                                error: false,
                                                                input: false,
                                                                type: types_js_1.WebSocketMessageType.Output,
                                                                messageType: types_js_1.ConsoleMessageType.Debug,
                                                                body: gdbBuffer,
                                                                message: command?.toString(),
                                                                cmdId: cmdId,
                                                                msgId: gdbProcess?.pid
                                                            }));
                                                        }
                                                        else
                                                            gdbBuffer = "";
                                                    }
                                                };
                                                if (gdbProcess && gdbProcess.stdin && gdbProcess.stdout) {
                                                    // Use .on instead of .once, because GDB output can be split
                                                    gdbProcess?.stdout?.on("data", onData);
                                                    // Send the command
                                                    gdbProcess?.stdin?.write("print " + command + "\n");
                                                }
                                                else
                                                    console.error("GDB process not found for session " + sessionId);
                                            });
                                        });
                                        try {
                                            getThisClientSession().process?.stdin?.write("break main\nrun\n");
                                        }
                                        catch {
                                            console.error(new Error('failed executing starting commands'));
                                        }
                                        // queueCommand(getProcessFromMap(sessionId) as ChildProcess,command, sessionId);// gdbProcess.stdin.write(message + "\n");
                                        // queueCommand(getProcessFromMap(sessionId) as ChildProcess,"break main", sessionId);// gdbProcess.stdin.write(message + "\n");
                                        queueCommand(getProcessFromMap(sessionId), command, sessionId);
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
                                    else
                                        await queueCommand(getProcessFromMap(sessionId), command, sessionId); // gdbProcess.stdin.write(message + "\n");
                                }
                                else if (command === "quit") {
                                    onClosedProcess(sessionId); //.then(() => {
                                    printClientConsoleInfo("Closed process");
                                    replicateFunction((clientWs) => {
                                        clientWs.send(JSON.stringify({ type: types_js_1.WebSocketMessageType.End, messageType: types_js_1.ConsoleMessageType.Output, body: "gdb", clientId: clientId })); // Send GDB output to the client
                                    });
                                }
                                else {
                                    if (mode == "debug") {
                                        if (args.includes('console')) {
                                            gdbProcess?.stdin?.write(command + "\n");
                                            console.log("executed console command " + command);
                                            gdbBuffer = "";
                                            function onData() {
                                                // Use .on instead of .once, because GDB output can be split
                                                gdbProcess?.stdout?.on("data", (data) => {
                                                    gdbBuffer += data.toString();
                                                    console.log(clientId + " " + gdbBuffer);
                                                    ws.send(JSON.stringify({
                                                        error: false,
                                                        input: false,
                                                        type: types_js_1.WebSocketMessageType.Output,
                                                        body: gdbBuffer,
                                                        message: command.toString()
                                                    }));
                                                    if (data.toString().includes('(gdb)'))
                                                        gdbProcess?.stdout?.off("data", onData);
                                                });
                                            }
                                            onData();
                                        }
                                        else
                                            queueCommand(getProcessFromMap(sessionId), command, sessionId).then(() => {
                                                // console.log('jjjjjjjjjjjjjjjjjjjjjj')
                                            }).catch(() => {
                                                console.log('jj;jhvbgoujgfhvhg');
                                            });
                                        /*
            
                                            if (gdbProcess) {
                                                gdbProcess.stdin.write(message + "\n");
            
                                                // After next/continue, fetch local variables
                                                if ((message.toString() === "next" || message.toString()  === "continue") && false) {
                                                    localsToWrite = true;
                                                    
                                                        gdbProcess.stdin.write("info locals\n");  // Fetch local variables after stepping
            
                                                        // localsWritten = false;
                                    // Small delay to ensure execution completes
                                                }
                                            }
                                                */
                                    }
                                    else {
                                        if (program) {
                                            program?.stdin?.write(command); //program.stdin.write(message + "\n");
                                            console.log("sent to program");
                                        }
                                        console.log('oooooooooooo');
                                    }
                                }
                            }
                            catch (err) {
                                printClientConsoleInfo("please compile program");
                                console.log(err);
                            }
                        }
                }
            }
            catch (err) {
                console.error("Command execution error:", err);
                ws.send(JSON.stringify({ error: true, type: types_js_1.WebSocketMessageType.Error, message: "Execution failed." }));
            }
        });
        // First time, setup breakpoints manually and run
        // ws.on("open", () => {
        //     // Set breakpoint at main() and start the program
        //   //  gdbProcess.stdin.write("break main\n");
        //    // gdbProcess.stdin.write("run\n");
        //    console.log("Client " + clientId + " connected to GDB server dkkkkkkkkkkk");
        // });
        function onClosedProcess(processId) {
            removeProcessFromMap(processId || sessionId);
            if (isShared)
                shared.removeProcess(processId || sessionId);
            processId = undefined;
            program = undefined;
            // replicateFunction((thisclientWS, thisclientid) => {
            //     thisclientWS.send(JSON.stringify({type: WebSocketMessageType.Output, message: 'end'}))
            // })
            // const filePath = path.join(__dirname, "cache", sessionId, "main.exe");
            //   fs.unlinkSync(filePath)
        }
        async function closeProcess(process, processId) {
            try {
                return await new Promise((resolve, reject) => {
                    if (process) {
                        if (!process.killed && process) {
                            process.kill();
                            process.on(('close'), (code) => {
                                onClosedProcess(processId || sessionId);
                                resolve();
                                console.log('stopped process');
                            });
                            setTimeout(() => {
                                onClosedProcess(processId);
                                reject('timed out closing process');
                            }, 3000);
                        }
                        else {
                            onClosedProcess(processId);
                            resolve();
                        }
                    }
                    else {
                        console.log("invalid process, cant kill");
                    }
                });
            }
            catch (err) {
                console.log('caught error while closing process: ' + err);
                onClosedProcess(processId);
            }
        }
        function onCloseSession() {
            const process = getProcessFromMap(sessionId);
            replicateSocketMessage(sessionId, clientId, true, { type: types_js_1.WebSocketMessageType.CodeSelection, body: "" });
            clients.delete(clientId);
            clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
            // getThisClientSession()?.clients.splice(getThisClientSession()?.clients.indexOf(clientId)||-1 , 1);
            getThisClientSession()?.removeClient(clientId);
            if (isShared)
                shared.removeClient(clientId);
            //sessions.delete(sessionId);
            // if(sessions.get(sessionId)?.indexOf(clientId) === -1)  console.error("Client not found in session " + sessionId);
            //    else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(clientId) || -1, 1);
            console.log("clients in sessions " + getThisClientSession()?.clients.size);
            if (getThisClientSession()?.clients.size == 0 || getThisClientSession() === undefined) {
                // sessions.delete(sessionId);
                closeProcess(process).finally(() => {
                    const dirPath = path_1.default.join(__dirname, "cache", sessionId);
                    if (dirPath)
                        fs_1.default.rm(dirPath, { recursive: true }, (err) => {
                            if (err)
                                console.error(err);
                            console.log("deleted cache folder for sessionId " + sessionId);
                        });
                    else
                        console.error(new Error("Couldnt delete session folder, invalid path."));
                    sessionMap.delete(sessionId);
                    if (isShared)
                        shared.removeSession(sessionId);
                    console.log("Deleted session " + sessionId);
                });
            }
            else {
                //session is still active, send message to other clients
                if (getThisClientSession()?.clients.size != 0)
                    replicateSocketMessage(sessionId, clientId, false, { type: types_js_1.WebSocketMessageType.ColabData, body: JSON.stringify({ clients: getThisClientSession()?.clients }) });
                replicateFunction((clientWs) => {
                    clientWs.send(JSON.stringify({ type: types_js_1.WebSocketMessageType.ColabData, colabCommand: "DISCONECT", thisClientId: clientId, thisSessionId: sessionId, body: clientObj?.displayName + " has left." }));
                }, clientObj);
                console.info('session is still active');
                // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Console, body: "$: Client " + clientId + " disconnected!"});
            }
        }
        // Handle WebSocket disconnection
        ws.on("close", () => {
            onCloseSession();
            console.log("Client " + clientId + " disconnected");
        });
        function replicateFunction(callback, excludeClientObj) {
            // if(!getThisClientSession() || !getThisClientSession().clientsSockets) return console.error(new Error("invalid session or client sockers"));
            let excludeClientId;
            if (excludeClientObj)
                excludeClientId = getThisClientSession().getClientId(excludeClientObj);
            if (!getThisClientSession())
                return console.error('invqlid session');
            getThisClientSession().clientsSockets.forEach((thisClientWs, thisClientId) => {
                if (!thisClientWs)
                    return;
                if (excludeClientId != thisClientId)
                    callback(thisClientWs, thisClientId);
            });
        }
    });
});
process.on('exit', () => {
    console.log('exiting');
    wss.clients.forEach(client => {
        client.close(1012, 'server is being shut down');
    });
});
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    // wss.close()
    // wss.clients.forEach(client => {
    //     client.close(1012, 'server is being shut down')
    // });
    server.close(() => {
        if (isShared)
            shared.close();
    });
});
process.on('SIGUSR2', () => {
    console.log('Recv. SIGUSR2');
    setTimeout(() => (console.log('Exiting now.'), process.exit(0)), 5000);
});
function windowsPathToDocker(path) {
    const drive = path[0].toLowerCase();
    return `/${drive}${path.slice(2).replace(/\\/g, '/')}`;
}
const child_process_2 = require("child_process");
const crypto_1 = require("crypto");
/**
 * Build and run the C++ executable in a Docker container with sandbox folder access.
 *
 * @param cppExecutablePath - The absolute path to the C++ executable.
 * @param cacheFolderPath - The path to the cache folder that contains unique exe subfolders.
 * @returns The child process running the Docker container
 */
function buildAndRunCppSandbox(cppExecutablePath, cacheFolderPath) {
    const exeFolder = path_1.default.dirname(cppExecutablePath); // Folder containing .exe
    const exeName = path_1.default.basename(cppExecutablePath); // .exe filename
    const sandboxFolder = path_1.default.join(exeFolder, 'clientFiles'); // The folder the exe will access
    // Ensure that the sandbox folder exists
    if (!fs_1.default.existsSync(sandboxFolder)) {
        console.error(`Sandbox folder does not exist: ${sandboxFolder}`);
        return;
    }
    // Create a temporary directory for building the Docker image
    //   const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpp-docker-'));
    const dockerfilePath = path_1.default.join(cacheFolderPath, 'Dockerfile');
    const containerExePath = `${exeName}`;
    const imageTag = `cpp-tool-${(0, crypto_1.randomUUID)()}`; // Unique image tag to avoid collisions
    // 1. Copy the executable to the temporary folder
    // 2. Write the Dockerfile to the temp directory
    const dockerfileContents = `
FROM mcr.microsoft.com/windows/servercore:ltsc2022
WORKDIR .
COPY ${exeName} .
COPY . .
#CMD ["${containerExePath.replace(/\\/g, '\\\\')}"]

ENTRYPOINT CMD ["./main.exe"]
  `.trim();
    fs_1.default.writeFileSync(dockerfilePath, dockerfileContents);
    // 3. Build the Docker image
    console.log(`Building Docker image: ${imageTag}`);
    try {
        (0, child_process_2.execSync)(`docker build -t ${imageTag} "${cacheFolderPath}"`, { stdio: 'inherit' });
    }
    catch (error) {
        console.error('Error building Docker image:', error);
        return;
    }
    const dockerSandboxPath = windowsPathToDocker(cacheFolderPath);
    // 4. Run the Docker container with access to the sandbox folder
    const runCommand = `docker run --rm -v "${dockerSandboxPath}":"${dockerSandboxPath}" -w "${dockerSandboxPath}" ${imageTag}`;
    console.log(`Running Docker container with access to ${sandboxFolder}`);
    // Return the child process for external handling
    const childProcess = (0, child_process_1.spawn)(runCommand, { shell: true });
    // const childProcess = spawn('docker', ['run', '--rm', ])
    childProcess.stdout.on('data', (data) => {
        console.log(`Output: ${data}`);
    });
    childProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
    });
    childProcess.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
        // Cleanup the Docker image after the process finishes
        console.log(`Cleaning up image: ${imageTag}`);
        try {
            (0, child_process_2.execSync)(`docker rmi ${imageTag}`, { stdio: 'ignore' });
        }
        catch (error) {
            console.error('Error cleaning up Docker image:', error);
        }
    });
    return childProcess; // Return the child process so it can be handled externally
}
app.use(handle404);
