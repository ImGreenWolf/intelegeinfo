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
exports.sessionMap = exports.runningProcesses = exports.clients = exports.wss = exports.server = exports.rootDirName = void 0;
exports.authMiddleware = authMiddleware;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const ws_1 = __importDefault(require("ws"));
const path_1 = __importDefault(require("path"));
const types_1 = require("../../dist/shared/types");
const stream_1 = require("stream");
const types_2 = require("./types");
const qrcode = __importStar(require("qrcode"));
const archiver_1 = __importDefault(require("archiver"));
// import {RedisStore} from "connect-redis"
// // import {Redis} from "redis"
// import Redis, { Cluster } from 'ioredis';
// import session from "express-session"
// import { v4 as uuidv4 } from 'uuid';
const app = (0, express_1.default)();
const compression = require('compression');
const sessionStore_1 = __importDefault(require("./sessionStore"));
const login_js_1 = __importDefault(require("./login.js"));
const signup_js_1 = __importDefault(require("./signup.js"));
const profile_js_1 = __importDefault(require("./profile.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const users = __importStar(require("./usersManager"));
const usersManager_1 = require("./usersManager");
const guideCreator_1 = __importDefault(require("./guideCreator"));
exports.rootDirName = path_1.default.resolve("./"); //'C:\Users\radub_qd\intelegeinfo')
const publicKeyPem = fs_1.default.readFileSync(path_1.default.join(exports.rootDirName, 'public.pem'), 'utf8') || "supersecretpublickey";
;
const crypto_1 = __importDefault(require("crypto"));
const EditorModes = __importStar(require("./editor-modes/"));
app.use(compression());
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        req.rawBody = buf; // Save raw body
    }
}));
app.use('/vnc', express_1.default.static(path_1.default.join(exports.rootDirName, 'vnc', 'noVNC')));
app.post('/github/onpull', (req, res) => {
    try {
        if (!req.body)
            throw "Empty request body..";
        const signature = req.headers['x-hub-signature'];
        if (!signature) {
            res.status(400).send('No signature');
            return;
        }
        const hmac = crypto_1.default.createHmac('sha1', 'info');
        hmac.update(req.rawBody);
        const digest = 'sha1=' + hmac.digest('hex');
        const { commits } = req.body;
        console.log(commits[0].message);
        console.log(digest);
        if (crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
            const output = (0, child_process_2.execSync)('cd ' + exports.rootDirName + ' && git fetch origin && git reset --hard origin/main', { timeout: 2000 });
            res.status(200).send('pull succesful! data: ' + output.toString() ? output.toString() : '');
            console.log('pulled! data: ' + output.toString() ? output.toString() : '');
        }
        else {
            console.log('access forbidden...');
            res.status(401).send('access forbidden...');
        }
    }
    catch (err) {
        console.error('pull error: ' + err);
        res.status(500).send(err);
    }
});
// app.use('dist/public/',express.static(path.join(rootDirName,'dist', 'public')));
app.use('/client/scripts', express_1.default.static(path_1.default.join('dist', 'public')));
// app.use('dist',express.static(path.join(rootDirName,'dist')));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use('/editor/codeEditor.js', express_1.default.static(path_1.default.join(exports.rootDirName, 'dist', 'public', 'codeEditor.js')));
app.get('/editor/mode_cpp_custom.js', (req, res) => {
    res.sendFile(path_1.default.join(exports.rootDirName, 'dist', 'public', 'mode_cpp_custom.js'));
});
app.get('/editor/cpp_worker.js', (req, res) => {
    res.sendFile(path_1.default.join(exports.rootDirName, 'dist', 'public', 'cpp_worker.js'));
});
app.get('/editor/worker-base.js', (req, res) => {
    res.sendFile(path_1.default.join(exports.rootDirName, 'public', 'ace-builds-master', 'src-noconflict', 'worker-base.js.js'));
});
app.use(express_1.default.static("public"));
app.use("/guides", guideCreator_1.default);
const codeMap = new Map();
app.get('/editor/sharesession', (req, res) => {
    const sessionId = req.query.id;
    const session = exports.sessionMap[sessionId];
    const link = req.protocol + "://" + req.host + '/editor?session=' + sessionId;
    if (!sessionId) {
        res.status(500).send({ error: "session id invalid" });
        return;
    }
    if (session) {
        if (session.isPublic) {
            res.send({ qrsvg: session.qrCode, code: session.joinCode, link });
        }
    }
    const code = users.generateCode();
    qrcode.toDataURL(link + "&uri_method=qrcode", { errorCorrectionLevel: "low", type: "image/png", margin: 0, width: 100 }).then(value => {
        codeMap.set(parseInt(code), sessionId);
        if (session) {
            session.joinCode = code;
            session.qrCode = value;
        }
        res.send({ qrsvg: value, code, link });
        setTimeout(() => {
            codeMap.delete(parseInt(code));
        }, 60000);
    });
});
app.get('/editor/joinsession', (req, res) => {
    const code = parseInt(req.query.code);
    if (codeMap.has(code) && code) {
        const sessionId = codeMap.get(code);
        if (!exports.sessionMap.get(sessionId).isPublic)
            res.status(403).send("Session hasn't started yet");
        const redirect = '/editor?session=' + sessionId;
        res.status(200).send({ code, redirect });
    }
    else {
        res.status(500).send({ error: "code expired or is invalid" });
    }
});
app.post('/editor/startsession/:id', (req, res) => {
    const id = req.params.id;
    if (!req.body && !id)
        res.status(501);
    if (exports.sessionMap.has(id)) {
        const { chat, codePermission } = req.body;
        if (exports.sessionMap.get(id).isPublic) {
            exports.sessionMap.get(id).makeSessionPublic(chat === 'on' ? true : false, codePermission);
            res.status(200);
            return;
        }
        exports.sessionMap.get(id).makeSessionPublic(chat === 'on' ? true : false, codePermission);
        res.status(201).send('');
    }
    else {
        res.status(500);
        return;
    }
});
app.get('/editor/tooltipHints', (req, res) => {
    res.send(JSON.parse(fs_1.default.readFileSync(path_1.default.join(exports.rootDirName, 'server', 'data', 'tooltips.json')).toString()));
});
app.get('/editor/tooltipHints/:id', (req, res) => {
    const tooltipid = req.params.id;
    if (!tooltipid)
        res.send(JSON.parse(fs_1.default.readFileSync(path_1.default.join(exports.rootDirName, 'server', 'data', 'tooltips.json')).toString()));
    else
        res.send(JSON.parse(fs_1.default.readFileSync(path_1.default.join(exports.rootDirName, 'server', 'data', 'tooltips.json')).toString())[tooltipid]);
});
app.get('/editor/:session/file/:name', (req, res) => {
    const name = req.params.name;
    const session = req.params.session;
    if (name && session) {
        const file = fs_1.default.readFileSync(path_1.default.join(getClientFilesPath(session), name)).toString();
        if (file.length > 50)
            res.send(file.substring(0, 50) + "...");
        else
            res.send(file);
    }
});
app.get('/editor/:session/downloadFiles', (req, res) => {
    const session = req.params.session;
    if (!session || !exports.sessionMap.has(session))
        res.status(401).send('Didnt find session.');
    const folderPath = getClientFilesPath(session); // Path to folder to download
    res.setHeader('Content-Disposition', 'attachment; filename=folder.zip');
    res.setHeader('Content-Type', 'application/zip');
    const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
    archive.directory(folderPath, false);
    archive.pipe(res);
    archive.finalize();
});
// app.get('/problem', problemCreator);
app.get('/editor', (req, res) => {
    fs_1.default.readFile(path_1.default.join(exports.rootDirName, 'public', 'editor.html'), (err, file) => {
        let text;
        const userId = users.getIdFromJWT(req);
        const logged = userId != undefined;
        if (logged) {
            users.getUserData(userId).then((userdata) => {
                text = file.toString().replace('#{login}', ` <li><button class="share-session" onclick="window.editor.listProjects()" id='listProjects'>Projects</button></li>\n<li><a href='/profile'>Hey <p class='user-name'>${userdata?.username}</p><div class='focus-line'></div></a></li>`);
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
app.use((0, cookie_parser_1.default)());
const privateKeyPem = fs_1.default.readFileSync(path_1.default.join(exports.rootDirName, 'private.pem'), 'utf8');
function authMiddleware(req, res, next, role) {
    // if() return res.status(403).json({ error: 'failed reading cookies' });
    const token = req.cookies.token;
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
        res.clearCookie('token').status(403).json({ error: 'Invalid token' });
    }
}
function handle404(req, res, next) {
    res.status(404);
    if (req.accepts('html'))
        res.sendFile(path_1.default.join(exports.rootDirName, '/public/pages/notfound.html'));
    else
        res.json('Oops! Page not found.');
}
app.use('/login', login_js_1.default);
app.use('/signup', signup_js_1.default);
app.use('/profile', authMiddleware, profile_js_1.default);
app.use('/user', usersManager_1.router);
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
function onServerStart(err) {
    if (err)
        console.error("error: " + err);
    else
        console.log("Server running on port " + PORT);
    cleanUp();
}
//          GLOBAL  SERVER  VARIABLES       //
const PORT = 3000;
exports.server = app.listen(PORT, '0.0.0.0', onServerStart);
exports.wss = new ws_1.default.Server({ server: exports.server, clientTracking: true, });
exports.clients = new Map();
// const sessions: Map<UUID, UUID[]> = new Map();
exports.runningProcesses = new Map();
exports.sessionMap = new Map(); // SESSION ID / EDITOR OBJECT
const buildTag = `cpp-image`;
//                      END                      //  
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
        exports.sessionMap = new Map(Object.entries(allSessions));
    });
    // clients will be stored locally.
}
function cleanUp() {
    fs_1.default.readdir(path_1.default.join(exports.rootDirName, "cache"), (err, files) => {
        if (err) {
            console.error("Error reading cache directory:", err);
            return;
        }
        files.forEach((file) => {
            fs_1.default.rm(path_1.default.join(exports.rootDirName, "cache", file), { recursive: true, force: true }, (err) => {
                if (err) {
                    console.error("Error deleting cache folder:", err);
                }
                else {
                    console.log("Deleted cache folder for client " + file);
                }
            });
        });
        let filter = '';
        EditorModes.modes.forEach(element => {
            filter += `--filter ancestor=${buildTag}_${element.dockerSafeTag} `;
        });
        console.log("Removing previous sandbox containers: " + (0, child_process_2.execSync)(`docker ps ${filter} -q |  xargs --no-run-if-empty docker rm --force `, { timeout: 5000 }));
    });
}
function getClientFilesPath(sessionId) {
    return path_1.default.join(exports.rootDirName, "cache", sessionId, "clientFiles");
}
function compileFile(clientId, sessionId) {
    return new Promise((resolve, reject) => {
        // const clientId = req.body.clientId;
        // const sessionId = req.body.sessionId; 
        const editorSession = isShared ? shared.getSession(sessionId) || exports.sessionMap.get(sessionId) : exports.sessionMap.get(sessionId);
        // const code = req.body.code;
        const exeFile = path_1.default.join(exports.rootDirName, "cache", sessionId);
        const filePath = path_1.default.join(exeFile, "clientFiles"); //            path.join(rootDirName, "cache", sessionId);
        const codeFile = !["cpp"].includes(path_1.default.extname(editorSession?.clientsActiveFile.get(clientId) || "main.cpp")) ? editorSession?.clientsActiveFile.get(clientId) : "main.cpp";
        if (!editorSession)
            console.log(new Error("Couldnt retrieve editorSession from memory database"));
        //fs.writeFileSync(path.join(filePath,"main.cpp"), code);
        // console.log(path.extname(getThisClientSession()?.clientsActiveFile.get(clientId)||"aaa"));
        compileProcess = (0, child_process_1.spawn)("g++", ["-g", "-O0", path_1.default.join(filePath, codeFile || "main.cpp"), "-o", path_1.default.join(exeFile, "main.exe")], {
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
                    resolve({ success: true, fileName: codeFile });
                }
                else { //if(code===1) {
                    //const correctedString = errorData.replace((path.resolve(filePath)+'\\'), "")
                    // console.log((path.resolve(filePath)+'\\'))
                    reject({ errors }); //|| "Compilation failed" 
                    // } else
                    // {
                    //     res.json({ error: errorData || "Program exited with non-normal code: "+code });
                }
            });
        }
    });
}
exports.wss.addListener('connection', async (ws, req) => {
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
    let checkSyntaxTimeout;
    let dataTimeout;
    let project;
    let processInputBuffer = '';
    let spawnPromise;
    const cookies = req.headers.cookie;
    const jwtCookie = getJWTCookie(cookies);
    function getJWTCookie(cookies) {
        return cookies
            ?.split("; ")
            .find((c) => c.startsWith("token="))
            ?.split("=")[1];
    }
    const recoveredSession = cookies
        ?.split("; ")
        .find((c) => c.startsWith("session="))
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
        function loadProject(fileUUID) {
            return new Promise((resolve, reject) => {
                if (!fileUUID)
                    throw 'cant load project: no id was supplied, or is invalid';
                users.default.project.findUnique({
                    where: {
                        fileUUID
                    }
                }).then(project => {
                    resolve(project);
                }).catch(err => {
                    reject(err);
                });
            });
        }
        function handshake(req) {
            const urlParams = new URL("http://intelegeinfo.go.ro/editor" + req.url).searchParams;
            const wssessionId = urlParams.get('session') != undefined || urlParams.get('session') != undefined ? urlParams.get('session') : recoveredSession ? recoveredSession : undefined;
            //handle heartbeat
            heartbeatInterval = setInterval(() => {
                // server.getConnections(function(error, count) {
                //     console.log(Date.now + ":   " + count);
                // });
                heartbeatTimestamp = Date.now(); // Update the heartbeat timestamp when a message is received
                ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.Heartbeat, connections: exports.server.connections, expectedDelay: heartbeatTimeout })); // Send a ping message to the client every 30 seconds
                if (Date.now() - heartbeatTimestamp >= heartbeatTimeout * 2) {
                    //console.log("Client " + clientId + " timed out ");
                    //sessions.delete(sessionId);
                    if (getThisClientSession()?.clients.get(clientId))
                        console.error("Client not found in session while trying to time out client  " + sessionId);
                    else
                        getThisClientSession()?.clients.delete(clientId);
                    exports.clients.delete(clientId);
                    clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
                    ws.close(); // Close the connection if no response received within double of timeout seconds
                }
            }, heartbeatTimeout);
            // TODO Check if session exists, otherwise create a new one and make this client the host.
            if (wssessionId) {
                //client connected to existing session
                const activeSession = exports.sessionMap.has(wssessionId) || (isShared && shared.getSession(wssessionId));
                if (activeSession) // = There is an active session, join it.
                 {
                    if (isShared) {
                        if (shared.getSession(wssessionId))
                            clientSession = shared.getSession(wssessionId);
                    } // sessionMap.get(wssessionId ||  uuidv4() as UUID) || new EditorSession; 
                    if (!exports.sessionMap.get(wssessionId))
                        return console.error(new Error("Didnt find session in sessionMap while joing session"));
                    else
                        clientSession = exports.sessionMap.get(wssessionId);
                    if (!clientSession.isPublic)
                        return ws.close(3000, "This session doesn't exist or isn't puiblic. <br> <a href='/editor'>Create a new session</a>");
                    clientId = (getThisClientSession() || clientSession)?.spawnClient(ws, userData);
                    clientObj = getThisClientSession().getClientObjectById(clientId);
                    exports.clients.set(clientId, ws);
                    // printClientConsoleDebug('joining session: ' + clientSession.sessionId)
                }
                else // there is no session, create it.
                 {
                    //getThisClientSession()?.clients.push(clientId); // add client to client list.
                    clientSession = createThisClientSession(wssessionId);
                    clientId = getThisClientSession()?.spawnClient(ws, userData);
                    clientObj = getThisClientSession().getClientObjectById(clientId);
                    exports.clients.set(clientId, ws); // TODO remove this map
                    // printClientConsoleDebug('creating session: ' + clientSession.sessionId)
                    if (clientSession && !isShared) {
                        exports.sessionMap.set(clientSession.sessionId, clientSession); // TODO Implement this in EditorSession class & polish it
                    }
                }
                sessionId = getThisClientSession().sessionId;
                clientFilesPath = path_1.default.join(exports.rootDirName, "cache", sessionId, "clientFiles");
                // clients.set(clientId, ws);
                if (clientObj && isShared) {
                    shared.getSession(sessionId)?.clients.set(clientId, clientObj);
                    shared.addClient(clientId, sessionId);
                    shared.updateSession(sessionId, clientSession);
                }
                connectionReady(true, req);
            }
            else {
                //client connected to new SOLO session
                //   clientId = uuidv4(); // Generate a unique ID
                //   sessionId = clientId; // Use the generated ID as the session ID
                // sessions.set(clientId, [sessionId]);
                clientSession = createThisClientSession();
                if (getThisClientSession() != undefined) {
                    sessionId = clientSession.sessionId;
                    // getThisClientSession().sessionId = sessionId;
                    // getThisClientSession()?.clients.set(clientId); // add client to client list.
                    clientId = getThisClientSession()?.spawnClient(ws, userData);
                    clientObj = getThisClientSession().getClientObjectById(clientId);
                    clientFilesPath = path_1.default.join(exports.rootDirName, "cache", sessionId, "clientFiles");
                    exports.sessionMap.set(clientSession.sessionId, clientSession); // TODO Implement this in EditorSession class & polish it
                }
                else
                    console.error(new Error("Failed to create SOLO session"));
                if (clientObj && shared) {
                    shared.getSession(sessionId)?.clients.set(clientId, clientObj);
                    shared.addClient(clientId, sessionId);
                    shared.updateSession(sessionId, clientSession);
                }
                exports.clients.set(clientId, ws);
                // printClientConsoleDebug('solo session: ' + clientSession.sessionId)
                connectionReady(false, req);
            }
        }
        function checkCodeSyntax(code) {
            return new Promise((resolve, reject) => {
                const editorSession = isShared ? shared.getSession(sessionId) || exports.sessionMap.get(sessionId) : exports.sessionMap.get(sessionId);
                const exeFile = path_1.default.join(exports.rootDirName, "cache", sessionId);
                const filePath = path_1.default.join(exeFile, "clientFiles"); //            path.join(rootDirName, "cache", sessionId);
                const codeFile = !["cpp"].includes(path_1.default.extname(editorSession?.clientsActiveFile.get(clientId) || "main.cpp")) ? editorSession?.clientsActiveFile.get(clientId) : "main.cpp";
                compileProcess = (0, child_process_1.spawn)("g++", ["-fsyntax-only", "-fdiagnostics-format=json", path_1.default.join(filePath, codeFile || "main.cpp")], {
                    windowsHide: true,
                    detached: true,
                });
                compileProcess.stdout.on('data', data => {
                    reject(data.toString());
                });
                compileProcess.stderr.on('data', data => {
                    resolve(data.toString());
                });
                compileProcess.on('close', (code) => {
                    if (code != 0)
                        reject(code);
                });
            });
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
        function getThisClientSession(thissessionid = sessionId) {
            // if(!sessionMap.get(sessionId)) 
            // { 
            //     console.error("couldnt find session object, creating a new session instead.")
            //     return new EditorSession(sessionId);
            // } else
            if (isShared)
                return clientSession || exports.sessionMap.get(thissessionid); //||  new EditorSession(sessionId);
            else if (clientSession)
                return clientSession;
            else if (exports.sessionMap.get(thissessionid))
                return exports.sessionMap.get(thissessionid); //||  new EditorSession(sessionId);
            else
                console.error(new Error('Couldnt get this client session'));
        }
        function createThisClientSession(sessionId) {
            const newSession = new types_2.EditorSession(sessionId);
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
        function removeRunningProcessFromMap() {
            // if (runningProcesses.has(sessionId)) {
            //     runningProcesses.delete(sessionId);
            // } else console.error("Process not found in map for client " + sessionId);
            getThisClientSession().process = undefined;
        }
        function getProcessFromMap(clientSession) {
            // return runningProcesses.get(sessionId);
            if (clientSession)
                return clientSession.process;
            else
                return getThisClientSession()?.process;
        }
        function printClientConsoleError(message, cause, client) {
            const targetClientId = client?.clientId || clientId;
            const clientSocket = exports.clients.get(targetClientId);
            if (clientSocket) {
                console.error(new Error(message, { cause: cause }));
                clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Error, body: message, messageType: types_1.ConsoleMessageType.Error }));
            }
            else {
                console.error("Client not found:", clientId);
            }
        }
        function printClientConsoleInfo(message, client) {
            const targetClientId = client?.clientId || clientId;
            const clientSocket = exports.clients.get(targetClientId);
            console.log(message);
            if (clientSocket) {
                clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Chat, body: message, messageType: types_1.ConsoleMessageType.Info }));
            }
            else {
                console.error("Client not found:", targetClientId);
            }
        }
        function printClientConsoleDebug(message, client) {
            const targetClientId = client?.clientId || clientId;
            const clientSocket = exports.clients.get(targetClientId);
            if (clientSocket) {
                console.debug("DEBUG: " + message);
                clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Chat, body: message, messageType: types_1.ConsoleMessageType.Debug }));
            }
            else {
                console.error("Client not found:", targetClientId);
            }
        }
        function printClientConsoleSessionInfo(message, client) {
            const targetClientId = client?.clientId || clientId;
            const clientSocket = exports.clients.get(targetClientId);
            if (clientSocket) {
                clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Chat, body: message, messageType: types_1.ConsoleMessageType.SessionInfo }));
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
                        const clientSocket = exports.clients.get(client);
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
                    const clientSocket = exports.clients.get(client);
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
        function sendConnectionMessage() {
            // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, messageType: ConsoleMessageType.SessionInfo, body: "Client " + clientObj?.displayName + " joined!"});
            const session = clientSession.clients.size != 1 ? { isHost: clientObj.isHost, canChat: clientObj.canChat, canEdit: clientObj.canEdit } : undefined;
            const welcomeMessage = !userLoggedIn ?
                `Bine ai venit pe Intelege Info!
        Scrie niste cod, apoi apasa compile si execute code, sau ruleaza in debugger.
        Invita-ti prietenii sa editeze codul impreuna cu tine in timp real apasand butonul share`
                :
                    `Bine ai revenit ${userData?.username} pe Intelege Info!
        Poti salva codul tau apasand pe butonul save.`;
            // Send initial message to client
            ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.Handshake, clientId: clientId, messageType: types_1.ConsoleMessageType.Info, sessionId: sessionId, body: welcomeMessage, project, session, canEdit: clientObj.canEdit }));
            return session;
        }
        async function connectionReady(cooperator = false, req) {
            const urlParams = new URL("ws:/intelegeinfo.go.ro:8080" + req.url).searchParams;
            let defaultText;
            let savedProject;
            if (urlParams.has("save")) {
                try {
                    if (!getJWTCookie(req.headers.cookie))
                        throw 'not logged in';
                    const id = jsonwebtoken_1.default.verify(getJWTCookie(req.headers.cookie), privateKeyPem);
                    savedProject = (await loadProject(urlParams.get('save')));
                    if (savedProject.userId !== parseInt(id.sub))
                        throw 'not authorized';
                    fs_1.default.cpSync(path_1.default.join(exports.rootDirName, "saved", savedProject.fileUUID), path_1.default.join(exports.rootDirName, "cache", sessionId), { recursive: true });
                    project = savedProject;
                    // fs.renameSync()
                    // defaultText =  
                    // console.log(defaultText)
                }
                catch (err) {
                    printClientConsoleError("Couldn't find your saved project, sorry! Check that you're logged in or the URL is correct. Error: " + err, getThisClientSession().getClientObjectById(clientId));
                    defaultText = fs_1.default.readFileSync("user_code.cpp").toString();
                }
            }
            else
                defaultText = fs_1.default.readFileSync("user_code.cpp").toString();
            const clientFilesPath = path_1.default.join(exports.rootDirName, "cache", sessionId, "clientFiles");
            // printClientConsoleInfo("connected to worker: " + process.pid)
            //create cache folder for session if its a new one
            if (!fs_1.default.existsSync(path_1.default.join(exports.rootDirName, "cache", sessionId)) || !cooperator && defaultText) {
                // fs.mkdir(path.join(rootDirName, "cache", sessionId), { recursive: true }, (err) => {
                //     console.log("created cache folder for sessionId " + sessionId);
                //     if (err) {
                //         console.error("Error creating cache folder:", err);
                //     }
                // });
                fs_1.default.mkdir(clientFilesPath, { recursive: true }, (err) => {
                    if (err) {
                        console.error("Error creating cache folder:", err);
                        return;
                    }
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
                    if (fs_1.default.existsSync(path_1.default.join(clientFilesPath, "main.cpp")))
                        openFile("main.cpp");
                    else
                        console.error("No default file was found!"); // TODO replace with async function
                });
            }
            // display join message
            replicateFunction((clientWs, LocalclientId) => {
                printClientConsoleSessionInfo(clientObj?.displayName + " joined!", getThisClientSession().getClientObjectById(LocalclientId));
            }, clientObj);
            const session = sendConnectionMessage();
            if (getThisClientSession()?.clients.size > 1) // multiple clients connected to this session
             {
                let displayNames = [];
                getThisClientSession()?.clients.forEach((client, id) => {
                    displayNames.push(client.displayName);
                });
                replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.ColabData, colabCommand: "JOIN", clients: displayNames, thisClientId: clientId, thisSessionId: sessionId, session });
                setTimeout(() => {
                    getThisClientSession().clientCommandBuffer.forEach((cmdBuf, remoteClientid) => {
                        if (clientId != remoteClientid)
                            if (getThisClientSession().clientsActiveFile.get(remoteClientid) === getThisClientSession().clientsActiveFile.get(clientId))
                                ws.send(JSON.stringify(cmdBuf.codeSelection));
                    });
                }, 100);
            }
        }
        //  while(ws.OPEN)   
        setTimeout(() => {
            handshake(req);
        }, 100);
        //    handshake(req)
        // debug mode only for now
        async function executeCommand(childProcess, command, sessionId) {
            return new Promise((resolve, reject) => {
                let gdbBuffer = "";
                console.log("GDB Command to execute: " + command);
                const onData = (data) => {
                    gdbBuffer += data.toString();
                    // Check if the full response has arrived
                    if (gdbBuffer.includes("(gdb)")) {
                        // We have everything, remove listener
                        childProcess.stdout.removeListener("data", onData);
                        // const resMap: Map<string, string> = new Map();
                        //     if(gdbBuffer.includes("frame="))
                        // {
                        // gdbBuffer.toString().split('\n')[0].split(',').forEach((pair) => {
                        //     if(pair.includes("="))
                        //         resMap.set(pair.split('=')[0].replace("{", ""),
                        //      pair.split('=')[1].replace("}", "").replace("{", "").replaceAll('"', ""))
                        // })
                        gdbBuffer.toString().split('\n').forEach(element => {
                            if (element != '') {
                                const gdbOutput = (0, gdbUtilities_1.parseGDBString)(element);
                                console.log(gdbOutput.json + '\n' + gdbOutput.err);
                                // console.log(gdbOutput.json);
                                const response = {
                                    error: gdbOutput.err ? gdbOutput.err : false,
                                    input: false,
                                    type: types_1.WebSocketMessageType.Output,
                                    messageType: types_1.ConsoleMessageType.DebugProgram,
                                    clientId: clientId,
                                    body: gdbOutput.json ? gdbOutput.json : undefined,
                                    message: 'next', //command.toString(),
                                    msgId: clientSession.gdbProcess?.pid || -1,
                                    line: gdbOutput.json?.frame?.line ? gdbOutput.json.frame.line : undefined,
                                    variables: gdbOutput.json?.variables ? gdbOutput.json.variables : undefined
                                };
                                getThisClientSession()?.clients.forEach((client, id) => {
                                    //send response to all clients 
                                    const clientSocket = exports.clients.get(client.clientId);
                                    if (!clientSocket) {
                                        //sessions.delete(sessionId);
                                        if (getThisClientSession()?.clients.has(clientId))
                                            console.error("Client not found in session while manually replicating to client  " + sessionId);
                                        else
                                            getThisClientSession()?.clients.delete(client.clientId);
                                        exports.clients.delete(client.clientId);
                                        return console.error("\\x1b[31m Client not found, removing ids " + client + "\\x1b[0m");
                                    }
                                    clientSocket?.send(JSON.stringify(response));
                                });
                            }
                        });
                        // }
                        if (command === '-exec-quit' && childProcess)
                            closeProcess(childProcess);
                        resolve();
                    }
                };
                if (true) //childProcess && childProcess.stdin && childProcess.stdout
                 {
                    // Use .on instead of .once, because GDB output can be split
                    childProcess.stdout?.on("data", onData);
                    // console.log('command')
                    // Send the command
                    // childProcess.stdin?.write(""+'\n');
                    childProcess.stdin?.write(command + '\n');
                }
                else
                    console.error("GDB process not found for session " + sessionId);
            });
        }
        let CommandQueue = Promise.resolve();
        function queueCommand(process, command, sessionId) {
            CommandQueue = CommandQueue.then(() => executeCommand(process, command, sessionId)).catch((err) => {
                printClientConsoleError("failed to queue debugger command: " + err);
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
                            ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.FileManagement, body: { command: FileManagementCommands.List, content: targetFiles } })); // Send the list of files to the client
                        }
                    });
                });
            }
            catch (reason) {
                console.log("Failed listing files: " + reason);
                printClientConsoleDebug("Failed listing files: " + reason);
            }
        }
        function getEditorMode(fileName) {
            const ext = fileName.trim().split('.')[1];
            if (ext)
                for (const mode of EditorModes.modes) {
                    if (mode.extension.includes(ext))
                        return mode;
                }
            return;
        }
        function openFile(fileName) {
            // if(fs.existsSync(path.join(clientFilesPath, fileName)))
            // console.log("path: " + path.join(clientFilesPath || path.join(rootDirName, "cache", sessionId,"clientFiles"), fileName))
            fs_1.default.readFile(path_1.default.join(clientFilesPath, fileName), (err, data) => {
                if (err) {
                    printClientConsoleError("Error opening file: " + err.message);
                }
                else {
                    // Send the file content to the client
                    const oldFileName = getThisClientSession()?.clientsActiveFile.get(clientId);
                    replicateSocketMessage(sessionId, clientId, true, { type: types_1.WebSocketMessageType.CodeSelection, body: null }, (client) => { return getThisClientSession()?.clientsActiveFile.get(client) == oldFileName; }); // potential fix for a glitch where markers dont get deleted when switching tabs
                    clientObj.editorMode = getEditorMode(fileName);
                    clientObj.openFileName = fileName;
                    getThisClientSession()?.clientsActiveFile.set(clientId, fileName);
                    console.log(`Opened file ${fileName}, with mode ${clientObj.editorMode.name}`);
                    if (isShared)
                        shared.updateSession(sessionId, getThisClientSession());
                    ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.FileManagement, body: { command: FileManagementCommands.Open, content: data.toString(), fileName: fileName } })); // Send the list of files to the client
                }
            });
        }
        /**
         * Build and run the C++ executable in a Docker container with sandbox folder access.
         *
         * @param cppExecutablePath - The absolute path to the C++ executable.
         * @param cacheFolderPath - The path to the cache folder that contains unique exe subfolders.
         * @returns The child process running the Docker container
         */
        async function buildAndRunCppSandbox(sessionFolder, fileName, editorMode, clientId, sessionId) {
            return new Promise((resolve, reject) => {
                const sandboxFolder = path_1.default.join(sessionFolder, 'clientFiles'); // The folder the exe will access
                // Ensure that the sandbox folder exists
                if (!fs_1.default.existsSync(sandboxFolder)) {
                    console.error(`Sandbox folder does not exist: ${sandboxFolder}`);
                    reject();
                }
                if (!editorMode) {
                    printClientConsoleInfo('File cant be executed!');
                    reject('File cant be executed! Editor mode is invalid');
                }
                if (clientSession.sessionContainer && clientSession.currentbuildTag == buildTag + "_" + editorMode.dockerSafeTag) {
                    console.log('Container already running, executing command...');
                    resolve(clientSession.sessionContainer);
                    return;
                }
                // Create a temporary directory for building the Docker image
                //   const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpp-docker-'));
                if (!clientSession.currentbuildTag || clientSession.currentbuildTag != buildTag + "_" + editorMode.dockerSafeTag) {
                    clientSession.currentbuildTag = buildTag + "_" + editorMode.dockerSafeTag; // Unique image tag to avoid collisions
                    // 1. Copy the executable to the temporary folder
                    // 2. Write the Dockerfile to the temp directory
                    const dockerfileContents = editorMode.dockerFile.trim();
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
                    const dockerfilePath = path_1.default.join(sessionFolder, 'Dockerfile');
                    fs_1.default.writeFileSync(dockerfilePath, dockerfileContents);
                    // 3. Build the Docker image
                    console.log(`Building Docker image: ${clientSession.currentbuildTag}`);
                    try {
                        (0, child_process_2.execSync)(`docker build -t ${clientSession.currentbuildTag} "${sessionFolder}"`, { stdio: 'inherit' });
                    }
                    catch (error) {
                        console.error('Error building Docker image:', error);
                        return;
                    }
                }
                else
                    console.log('Skipping build stage.');
                const imageName = `session-container-${sessionId}`;
                // fs.mkdirSync(`/tmp/vnc-${sessionId}/`)
                // 4. Run the Docker container with access to the sandbox folder
                const hasGUI = clientObj.openFileName.toLowerCase().includes("gui");
                console.log(hasGUI ? 'executing with GUI' : "no gui");
                const runCommand = `docker run \
-d \
--name ${imageName} \
-v "${sessionFolder}:/app" \
${hasGUI ? `-v "/tmp/vnc-${sessionId}:/app/vnc" \ ` : ""}
-w /app \
-di \
-m 256MB \
--cpus="0.25" \
--rm \
${clientSession.currentbuildTag} \
bash `.trim(); //  --rm -c "g++ -g -v -O0 main.cpp -o main && ./main"
                console.log(`Running Docker container ${imageName} with access to ${sandboxFolder}`);
                console.log(runCommand);
                // Return the child process for external handling
                const childProcess = (0, child_process_1.spawn)(runCommand, { shell: true, stdio: 'pipe' });
                clientSession.sessionContainer = { process: childProcess, imageName, fileName, editorMode };
                childProcess?.on("spawn", () => {
                    console.log("Docker container spawned");
                    setTimeout(() => {
                        // TODO Spawn GUI on client
                        //   if(hasGUI == true) 
                        clientSession.sessionContainer.editorMode.onBuild(clientSession.sessionContainer, clientSession);
                        // else
                        console.log(hasGUI);
                        resolve(clientSession.sessionContainer); // Return the child process so it can be handled externally
                    }, 500);
                });
                childProcess.stdout.on('data', data => {
                    console.log(data.toString());
                });
            });
        }
        async function readStdio(program, messageJSON, res) {
            return new Promise((resolve, reject) => {
                async function onClosedProgram(code, message, error) {
                    let notes = "";
                    processInputBuffer = '';
                    const time = (Date.now() - spawnDate);
                    if (new Blob([gdbBuffer]).size > 64000) // 1000000 is 1Mb
                     {
                        await new Blob([gdbBuffer]).slice(0, 64000).text().then(str => {
                            notes = "buffer exceeded 64kb, output was truncated.";
                            replicateFunction((clientWs) => {
                                clientWs.send(JSON.stringify({ messageType: types_1.ConsoleMessageType.Output, type: types_1.WebSocketMessageType.Output, body: str.toString(), clientId: clientId })); // Send GDB output to the client
                            });
                        });
                    }
                    clearTimeout(programTimeout);
                    if (clientSession.program) {
                        clientSession.program.stdout.removeAllListeners();
                        clientSession.program.stderr.removeAllListeners();
                    }
                    replicateFunction((clientWs) => {
                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.End, messageType: types_1.ConsoleMessageType.Output, time, notes, body: message, clientId: clientId })); // Send GDB output to the client
                    });
                }
                addProcessToMap(sessionId, program); // add to process map
                mode = "run";
                let spawnDate = Date.now();
                let programTimeout;
                gdbBuffer = "";
                if (messageJSON.textMode)
                    programTimeout = setTimeout(() => {
                        onClosedProgram(-1, "<span style='color: red'>Program timed out!</span>");
                        closeProcess(program);
                        resolve();
                    }, 1000);
                // if(programTimeout) clearTimeout(programTimeout)
                spawnPromise = new Promise((resolve, reject) => {
                    clientSession.program?.on("spawn", () => {
                        console.log("Program spawned");
                        spawnDate = Date.now();
                        res.editorMode.onSpawn(clientSession);
                        clientObj.sendMessage({ type: types_1.WebSocketMessageType.ExecuteStatus, spawn: 1 });
                        if (clientSession.program.stdin && processInputBuffer)
                            if (clientSession.program?.stdin?.writable)
                                clientSession.program.stdin.write(processInputBuffer); // write buffer
                        dataTimeout =
                            setTimeout(() => {
                                clientObj.sendMessage({ type: types_1.WebSocketMessageType.ExecuteStatus, input: 1 });
                            }, 400);
                        resolve();
                    });
                });
                clientSession.program.stdout?.on("data", (data) => {
                    gdbBuffer += data.toString();
                    // replicateFunction((clientWs) => {
                    //     clientWs.send(JSON.stringify({messageType: ConsoleMessageType.Output, type: WebSocketMessageType.Output, body: gdbBuffer.toString(), clientId: clientId}));  // Send GDB output to the client
                    // });
                    // gdbBuffer = "";
                    replicateFunction((clientWs) => {
                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.Output, messageType: types_1.ConsoleMessageType.Output, body: data.toString(), clientId: clientId })); // Send GDB output to the client
                    });
                    clearTimeout(dataTimeout);
                    dataTimeout = setTimeout(() => {
                        clientObj.sendMessage({ type: types_1.WebSocketMessageType.ExecuteStatus, input: 1 });
                    }, 100);
                });
                clientSession.program?.stderr?.on("data", (data) => {
                    gdbBuffer += data.toString();
                    console.error(gdbBuffer);
                });
                clientSession.program?.on("close", (code) => {
                    clearTimeout(dataTimeout);
                    switch (code) {
                        case 0:
                        default:
                            onClosedProgram(code, "Program exited with code: " + code?.toString() || 0);
                            break;
                        case 136:
                        case 138:
                            onClosedProgram(code, "Program exited with errror: <a href='/guides/aritmethicoperation?session=" + sessionId + "' title=Learn how to fix here. | Error code: " + code?.toString() + ">Arithmetic devided by 0</a>", true);
                            break;
                        case 139:
                            onClosedProgram(code, "Program exited with errror: <a href='/guides/aritmethicoperation?session=" + sessionId + "' title=Learn how to fix here. | Error code: " + code?.toString() + ">Segmentation Fault</a>", true);
                            break;
                        case 3221225477:
                            onClosedProgram(code, "Program exited with errror: <a href='/guides/errors/memaccessviolation?session=" + sessionId + "' title=Learn how to fix here. | Error code: " + code?.toString() + ">MEMMORY ACCESS VIOLATION!</a>", true);
                            break;
                    }
                    gdbBuffer = "";
                    onClosedProcess();
                    resolve();
                });
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
                    case types_1.WebSocketMessageType.Heartbeat:
                        if (!clientObj)
                            break;
                        clientObj.ping = Date.now() - heartbeatTimestamp;
                        // console.log("Client ping: " + clientObj?.ping)
                        //console.log("Received heartbeat from client " + clientId);
                        break;
                    case types_1.WebSocketMessageType.Handshake:
                        sendConnectionMessage(); // TODO Implement this on client side, to ensure client received handshake message.
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
                    case types_1.WebSocketMessageType.Console:
                        if (getProcessFromMap() != undefined) {
                            getProcessFromMap()?.stdin?.write(messageJSON.command + "\n");
                            dataTimeout = setTimeout(() => {
                                clientObj.sendMessage({ type: types_1.WebSocketMessageType.ExecuteStatus, input: 1 });
                            }, 200);
                        }
                        else
                            processInputBuffer += messageJSON.command + "\n";
                        replicateFunction((clientWs) => {
                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.Console, messageType: types_1.ConsoleMessageType.Output, body: messageJSON.command, clientDisplayName: clientObj?.displayName, clientId: clientId })); // Send GDB output to the client
                        });
                        break;
                    case types_1.WebSocketMessageType.Chat:
                        if (!clientObj.canChat)
                            break;
                        // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, messageType: ConsoleMessageType.UserChat,  body: messageJSON.command, clientDisplayName: clientObj?.displayName});
                        replicateFunction((clientWs) => {
                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.Chat, id: getThisClientSession().messageIndex, messageType: types_1.ConsoleMessageType.UserChat, body: messageJSON.command, clientDisplayName: clientObj?.displayName, clientId: clientId })); // Send GDB output to the client
                        });
                        getThisClientSession().messageIndex++; // counter used to id and group console mssages.
                        // clients.forEach((client, id) => {
                        //         client.send(JSON.stringify({error: false, input: false, clientId: clientId, type: WebSocketMessageType.Chat, body: messageJSON.command})); // Send initial message to client
                        // });
                        break;
                    case types_1.WebSocketMessageType.MouseUpdate:
                        replicateFunction((thisClientWs, thisClientId) => {
                            if (clientSession.getClientObjectById(thisClientId).canEdit)
                                thisClientWs.send(JSON.stringify({ ...messageJSON, clientId, displayName: clientObj.displayName, color: clientObj.color })); // TODO Sanitize this
                        }, clientObj);
                        break;
                    case types_1.WebSocketMessageType.CodeChange:
                        if (!clientObj.canEdit)
                            break;
                        let shouldSave = messageJSON.saveFile;
                        let shouldSaveTimeout;
                        if (shouldSave == false)
                            shouldSaveTimeout = setTimeout(() => {
                                shouldSave = true;
                            }, 500);
                        const fileName = messageJSON.fileName;
                        // save code to file
                        if (shouldSave && type === types_1.WebSocketMessageType.CodeChange) // TODO replace true with shouldSave 
                         {
                            shouldSave = false;
                            //   TODO make a more efficient way of updating the file, either by streams (streaming updates to file) or a save button.
                            fs_1.default.writeFile(path_1.default.join(clientFilesPath, fileName), messageJSON.body, (err) => {
                                if (err)
                                    console.log("Failed saving file!");
                                if (checkSyntaxTimeout)
                                    clearTimeout(checkSyntaxTimeout);
                                checkSyntaxTimeout = setTimeout(() => {
                                    checkCodeSyntax(messageJSON.body).then(json => {
                                        if (!JSON.parse(json)[0])
                                            return replicateFunction((clientWs, localClientId) => {
                                                if (getThisClientSession().clientsActiveFile.get(localClientId) === getThisClientSession().clientsActiveFile.get(clientId))
                                                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.CompileResult, clientId: clientId, body: JSON.stringify([{ kind: 'success' }]) }));
                                            });
                                        replicateFunction((clientWs, localClientId) => {
                                            if (getThisClientSession().clientsActiveFile.get(localClientId) === getThisClientSession().clientsActiveFile.get(clientId))
                                                clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.CompileResult, clientId: clientId, body: json }));
                                        });
                                    }).catch(err => {
                                        console.error('syntax checker error: ' + err);
                                    });
                                }, 200);
                            });
                        }
                        // replicate changes to others
                        replicateFunction((clientWs, localClientId) => {
                            if (getThisClientSession().clientsActiveFile.get(localClientId) === getThisClientSession().clientsActiveFile.get(clientId))
                                clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.CodeChange, clientId: clientId, body: messageJSON, msgId: JSON.parse(message.toString()).msgId }));
                        }, clientObj);
                        break;
                    case types_1.WebSocketMessageType.ConsoleTyping:
                        if (!clientObj.canChat)
                            break;
                        const TypingIndicatorType = messageJSON.status;
                        replicateFunction((clientWs, localClientId) => {
                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ConsoleTyping, displayName: clientObj?.displayName, clientId: clientId, status: TypingIndicatorType }));
                        }, clientObj);
                        break;
                    case types_1.WebSocketMessageType.CodeSelection:
                        //fs.writeFileSync(path.join(rootDirName, "cache", sessionId , "user_code.cpp"), messageJSON.code);
                        // console.log(type + " for sessionId " + sessionId);
                        if (!clientObj.canEdit)
                            break;
                        const codeSelectionJSON = { type: types_1.WebSocketMessageType.CodeSelection, clientId: clientId, body: messageJSON };
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
                    case types_1.WebSocketMessageType.FileManagement:
                        // Handle folder management commands here
                        // Example: Create a new folder, delete a folder, etc.
                        /*
    
                        messageJson.command
                        messageJson.body
    
    
                        */
                        if (!clientObj.canEdit)
                            break;
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
                                            replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.FileManagement, body: { content: fileName, command: commandType || FileManagementCommands.Create } }); // Send the list of files to the client
                                            console.log("File created successfully");
                                        }
                                    });
                                else
                                    printClientConsoleError("File already exists!");
                                break;
                            case FileManagementCommands.Delete:
                                if (!clientObj.canEdit)
                                    break;
                                try {
                                    fs_1.default.unlink(path_1.default.join(clientFilesPath, messageJSON.name), (err) => {
                                        if (err) {
                                            printClientConsoleError("Error deleting file: " + err.message);
                                        }
                                        else {
                                            console.log("File deleted successfully");
                                            replicateFunction((cws) => {
                                                cws.send(JSON.stringify({ ...messageJSON }));
                                            }, clientObj);
                                        }
                                    });
                                }
                                catch (err) {
                                    printClientConsoleError(err);
                                }
                                break;
                            //  TODO Make this so it just return name and make seperate function for fle content, which will be called only when opening the file on the client. STORE IT IN CACHE, ADD A DIRTY VERIFICATION TO NOT SEND THE SAME SHI MULTIPLE TIMES DONT OPEN THE EDITOR UNTIL THE FILE HAS LOADED ON THE CLIENT SEND THE FILES ON  HANDSHAKE MAKE SURE IT IS ALL REPLICATED
                            case FileManagementCommands.List:
                                listFiles(clientFilesPath);
                                break;
                            case FileManagementCommands.Rename:
                                if (!clientObj.canEdit)
                                    break;
                                replicateFunction((cws) => {
                                    cws.send(JSON.stringify({ ...messageJSON }));
                                }, clientObj);
                                break;
                            case FileManagementCommands.Open:
                                openFile(messageJSON.body);
                                break;
                        }
                        break;
                    default:
                        if (!clientObj.canEdit)
                            break;
                        handleCommand(command, exports.clients); // pass all the clients in the session
                        async function handleCommand(command, sockets) {
                            const filePath = path_1.default.join(exports.rootDirName, "cache", sessionId);
                            try {
                                if (command == "execute") {
                                    // fs.accessSync(filePath) // disabled to auto compile
                                    async function executeProgram() {
                                        return new Promise((resolveExectute, reject) => {
                                            // const filePath = path.join(rootDirName, "cache", sessionId, "main.exe");
                                            function runProgram() {
                                                const mainPromise = new Promise((resolve, reject) => {
                                                    buildAndRunCppSandbox(filePath, clientSession.clientsActiveFile.get(clientId), clientObj.editorMode, clientId, sessionId).then(async (res) => {
                                                        //     cwd:  path.join(rootDirName, "cache", sessionId,"clientFiles"), // we must add this for the program to have the correct directory for input files.
                                                        if (res == null)
                                                            return resolve();
                                                        try {
                                                            if (!clientObj.editorMode.isInterpreter) {
                                                                replicateFunction((clientWs) => {
                                                                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compiling program.', clientId: clientId })); // Send GDB output to the client
                                                                });
                                                                //execSync(`docker exec ${res.imageName} bash -c "g++ -g -O0 clientFiles/${res.fileName} -o main"`)
                                                                clientObj.editorMode.compile(res);
                                                                replicateFunction((clientWs) => {
                                                                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compiled', clientId: clientId })); // Send GDB output to the client
                                                                });
                                                            }
                                                            // clientSession.program = spawn('docker', ['exec', "-i", res.imageName, "bash","-c", "./main"], {
                                                            //     stdio: 'pipe'  // pipe gives you access to stdin, stdout, stderr
                                                            //     });
                                                            clientSession.program = await clientObj.editorMode.execute(res);
                                                            readStdio(clientSession.program, messageJSON, res).then(() => resolve());
                                                        }
                                                        catch (err) {
                                                            console.error("Failed to run docker commands: " + err);
                                                        }
                                                    });
                                                });
                                                return [spawnPromise, mainPromise];
                                            }
                                            if (false) {
                                                fs_1.default.stat(filePath, (err, stats) => {
                                                    if (err) {
                                                        // printClientConsoleError('Please compile the program first! '+err?.code);
                                                        // return;
                                                        replicateFunction((clientWs) => {
                                                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compiling...', clientId: clientId })); // Send GDB output to the client
                                                        });
                                                        compileFile(clientId, sessionId).then(res => {
                                                            replicateFunction((clientWs) => {
                                                                clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compiled', clientId: clientId })); // Send GDB output to the client
                                                            });
                                                            const promises = runProgram();
                                                            promises[0].then(() => {
                                                                replicateFunction((clientWs) => {
                                                                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Executing...', clientId: clientId })); // Send GDB output to the client
                                                                });
                                                            });
                                                            promises[1].then(() => {
                                                                replicateFunction((clientWs) => {
                                                                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'finished', clientId: clientId })); // Send GDB output to the client
                                                                });
                                                            });
                                                        }).catch(err => {
                                                            replicateFunction((clientWs) => {
                                                                clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compile failed', error: err, clientId: clientId })); // Send GDB output to the client
                                                            });
                                                            console.error('error while compiling for execute: ' + err); // TODO Send message to client that compilation failed
                                                            return;
                                                        });
                                                    }
                                                    else {
                                                        fs_1.default.stat(path_1.default.join(exports.rootDirName, "cache", sessionId, "clientFiles", "main.cpp"), (err, codeStats) => {
                                                            if (err) {
                                                                console.error('error accessing code file: ' + err);
                                                                clientObj.sendMessage(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'ERROR: ' + err, clientId: clientId })); // Send GDB output to the client
                                                            }
                                                            console.log(stats.mtimeMs < codeStats.mtimeMs - 500);
                                                            if (stats.mtimeMs < codeStats.mtimeMs - 500) // check if file was edited after compile.
                                                                compileFile(clientId, sessionId).then(res => {
                                                                    replicateFunction((clientWs) => {
                                                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Recompiled.', clientId: clientId })); // Send GDB output to the client
                                                                    });
                                                                    // runProgram()
                                                                    const promises = runProgram();
                                                                    promises[0].then(() => {
                                                                        replicateFunction((clientWs) => {
                                                                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Executing...', clientId: clientId })); // Send GDB output to the client
                                                                        });
                                                                    });
                                                                    promises[1].then(() => {
                                                                        replicateFunction((clientWs) => {
                                                                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'finished', clientId: clientId })); // Send GDB output to the client
                                                                        });
                                                                    });
                                                                }).catch(err => {
                                                                    replicateFunction((clientWs) => {
                                                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Recompile failed!', error: err, clientId: clientId })); // Send GDB output to the client
                                                                    });
                                                                    console.log('error compiling modifed file');
                                                                    return;
                                                                });
                                                            else {
                                                                //  replicateFunction((clientWs) => {
                                                                //     clientWs.send(JSON.stringify({type: WebSocketMessageType.ExecuteStatus,body: 'Executed...', clientId: clientId}));  // Send GDB output to the client
                                                                // });
                                                                const promises = runProgram();
                                                                promises[0].then(() => {
                                                                    replicateFunction((clientWs) => {
                                                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Executing...', clientId: clientId })); // Send GDB output to the client
                                                                    });
                                                                });
                                                                promises[1].then(() => {
                                                                    replicateFunction((clientWs) => {
                                                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Execution finished.', clientId: clientId })); // Send GDB output to the client
                                                                    });
                                                                });
                                                            }
                                                        });
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
                                                runProgram()[1].then(resolveExectute);
                                        });
                                    }
                                    // execute code normally.
                                    if (getProcessFromMap()) // check if program is running
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
                                        closeProcess(clientSession.program, sessionId).then(() => {
                                            replicateFunction((clientWs) => {
                                                clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.End, messageType: types_1.ConsoleMessageType.Output, body: gdbBuffer.toString(), clientId: clientId })); // Send GDB output to the client
                                            });
                                        }).catch(err => replicateFunction((clientWs) => {
                                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.End, messageType: types_1.ConsoleMessageType.Output, body: err, clientId: clientId })); // Send GDB output to the client
                                        }));
                                    }
                                    else
                                        executeProgram(); //buildAndRunCppSandbox(filePath, path.join(rootDirName, "cache", sessionId, "clientFiles"), clientId, sessionId) //
                                }
                                else if (command == "-exec-run") {
                                    if (!getProcessFromMap()) {
                                        buildAndRunCppSandbox(filePath, clientSession.clientsActiveFile.get(clientId), clientObj.editorMode, clientId, sessionId).then(res => {
                                            mode = "debug"; //set mode to debug
                                            try {
                                                replicateFunction((clientWs) => {
                                                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compiling program.', clientId: clientId })); // Send GDB output to the client
                                                });
                                                (0, child_process_2.execSync)(`docker exec ${res.imageName} bash -c "g++ -g -O0 main.cpp -o main"`);
                                                replicateFunction((clientWs) => {
                                                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compiled', clientId: clientId })); // Send GDB output to the client
                                                });
                                                clientSession.gdbProcess = (0, child_process_1.spawn)("docker", ["exec", res.imageName, "gdb", "-q", "-interpreter=mi", 'main'], { stdio: 'pipe' }); //"-ex", "set pagination off", 
                                                addProcessToMap(sessionId, clientSession.gdbProcess);
                                            }
                                            catch (err) {
                                                printClientConsoleError("docker error: " + err);
                                            }
                                            if (!getThisClientSession().process)
                                                console.error('Invalid session while starting debug process');
                                            printClientConsoleDebug("started debugging process.");
                                            queueCommand(getProcessFromMap(), '-break-insert 1\n', sessionId);
                                            clientSession.gdbProcess.stdout.on('data', (data) => {
                                                console.log("GDB Data: " + data.toString());
                                            });
                                            clientSession.gdbProcess.stderr.on('data', (derr) => {
                                                console.error("GDB Error: " + derr.toString());
                                            });
                                        });
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
                                        app.get("/requestValue", (req, res) => {
                                            const command = req.query.value;
                                            const cmdId = parseInt(req.query.cmdId);
                                            // console.log(clientId + " " + command)
                                            if (mode != "debug")
                                                res.status(400).send('Bad Request: GDB process not active');
                                            if (!clientSession.gdbProcess)
                                                res.status(400).send('Bad Request: GDB process not active');
                                            if (!command)
                                                res.status(400).send('Bad Request: invalid command');
                                            //res.send({code: fs.readFileSync("user_code.cpp").toString()});
                                            if (mode != "debug" || !clientSession.gdbProcess || !command)
                                                return;
                                            new Promise((resolve, reject) => {
                                                let gdbBuffer = "";
                                                const onData = (data) => {
                                                    gdbBuffer += data.toString();
                                                    // Check if the full response has arrived
                                                    if (gdbBuffer.includes("(gdb)")) {
                                                        if (parseInt(gdbBuffer.toString().match(/(?<=\$)\d*/)?.[0]) === cmdId + 1) {
                                                            // We have everything, remove listener
                                                            clientSession.gdbProcess?.stdout?.removeListener("data", onData);
                                                            resolve();
                                                            return res.send(({
                                                                error: false,
                                                                input: false,
                                                                type: types_1.WebSocketMessageType.Output,
                                                                messageType: types_1.ConsoleMessageType.Debug,
                                                                body: gdbBuffer,
                                                                message: command?.toString(),
                                                                cmdId: cmdId,
                                                                msgId: clientSession.gdbProcess?.pid
                                                            }));
                                                        }
                                                        else
                                                            gdbBuffer = "";
                                                    }
                                                };
                                                if (clientSession.gdbProcess && clientSession.gdbProcess.stdin && clientSession.gdbProcess.stdout) {
                                                    // Use .on instead of .once, because GDB output can be split
                                                    clientSession.gdbProcess?.stdout?.on("data", onData);
                                                    // Send the command
                                                    clientSession.gdbProcess?.stdin?.write("print " + command + "\n");
                                                }
                                                else
                                                    console.error("GDB process not found for session " + sessionId);
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
                                    else
                                        await queueCommand(getProcessFromMap(), command, sessionId); // gdbProcess.stdin.write(message + "\n");
                                }
                                else if (command === "-exec-quit") {
                                    onClosedProcess(); //.then(() => {
                                    printClientConsoleInfo("Closed process");
                                    replicateFunction((clientWs) => {
                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.End, messageType: types_1.ConsoleMessageType.Output, body: "gdb", clientId: clientId })); // Send GDB output to the client
                                    });
                                }
                                else if (mode == "debug") {
                                    queueCommand(getProcessFromMap(), '-stack-list-variables --all-values', sessionId);
                                    // if(args.includes('console'))
                                    //     {   
                                    //         gdbProcess?.stdin?.write(command + "\n");
                                    //         console.log("executed console command " + command)
                                    //         gdbBuffer="";
                                    //         function onData()
                                    //         {
                                    //             // Use .on instead of .once, because GDB output can be split
                                    //             gdbProcess?.stdout?.on("data", (data) => {
                                    //                 gdbBuffer += data.toString();
                                    //                 console.log(clientId + " " + gdbBuffer)
                                    //                 ws.send(JSON.stringify({
                                    //                     error: false,
                                    //                     input: false,
                                    //                     type: WebSocketMessageType.Output,
                                    //                     body: gdbBuffer,
                                    //                     message: command.toString()
                                    //                 }));
                                    //                 if(data.toString().includes('(gdb)'))
                                    //                     gdbProcess?.stdout?.off("data", onData)
                                    //             });
                                    //         }
                                    //      onData();
                                    //     } 
                                    // else 
                                    queueCommand(getProcessFromMap(), command, sessionId).then(() => {
                                        console.log('COMMAND');
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
                                    if (clientSession.program) {
                                        if (clientSession.program?.stdin?.writable) {
                                            clientSession.program?.stdin?.write(command); //program.stdin.write(message + "\n");
                                            clientObj.sendMessage({ type: types_1.WebSocketMessageType.ExecuteStatus, input: 1 });
                                        }
                                        else
                                            console.error("stdin isnt writeable");
                                        // dataTimeout = setTimeout(() => {
                                        // }, 200);
                                        // console.log("sent to program")
                                    }
                                }
                            }
                            catch (err) {
                                printClientConsoleError(err);
                                console.log(err);
                            }
                        }
                }
            }
            catch (err) {
                console.error("Command execution error:", err);
                ws.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Error, message: "Execution failed." }));
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
            if (isShared)
                shared.removeProcess(sessionId);
            clientSession.program = undefined;
            // replicateFunction((thisclientWS, thisclientid) => {
            //     thisclientWS.send(JSON.stringify({type: WebSocketMessageType.Output, message: 'end'}))
            // })
            // const filePath = path.join(rootDirName, "cache", sessionId, "main.exe");
            //   fs.unlinkSync(filePath)
        }
        async function closeProcess(process, processId) {
            try {
                return await new Promise((resolve, reject) => {
                    if (process) {
                        if (!process.killed && process) {
                            process.kill();
                            process.on(('close'), (code) => {
                                onClosedProcess();
                                resolve();
                                console.log('stopped process');
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
                    resolve();
                });
            }
            catch (err) {
                console.log('caught error while closing process: ' + err);
                onClosedProcess();
            }
        }
        function onCloseSession() {
            const process = getProcessFromMap(clientSession);
            const closedClientId = clientId;
            replicateSocketMessage(sessionId, clientId, true, { type: types_1.WebSocketMessageType.CodeSelection, body: "" });
            exports.clients.delete(clientId);
            clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
            // getThisClientSession()?.clients.splice(getThisClientSession()?.clients.indexOf(clientId)||-1 , 1);
            clientSession?.removeClient(clientId);
            if (isShared)
                shared.removeClient(clientId);
            //sessions.delete(sessionId);
            // if(sessions.get(sessionId)?.indexOf(clientId) === -1)  console.error("Client not found in session " + sessionId);
            //    else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(clientId) || -1, 1);
            // console.log("clients in sessions " + clientSession.clients.size)
            if (clientSession.clients.size === 0 || clientSession == undefined) {
                // sessions.delete(sessionId);
                closeProcess(process)
                    .finally(() => {
                    if (clientSession.sessionContainer)
                        (0, child_process_1.exec)(`docker rm ${clientSession.sessionContainer.imageName} -f -v`);
                    const dirPath = path_1.default.join(exports.rootDirName, "cache", sessionId);
                    if (false) // TODO check if its okay to delete the session folder
                        if (dirPath)
                            fs_1.default.rm(dirPath, { recursive: true }, (err) => {
                                if (err)
                                    console.error(err);
                                console.log("deleted cache folder for sessionId " + sessionId);
                            });
                        else
                            console.error(new Error("Couldnt delete session folder, invalid path."));
                    exports.sessionMap.delete(sessionId);
                    if (isShared)
                        shared.removeSession(sessionId);
                });
            }
            else {
                //session is still active, send message to other clients
                // if(getThisClientSession()?.clients.size != 0)
                const session = clientSession.clients.size != 1 ? { isHost: clientObj.isHost, clients: clientSession.clients.size } : undefined;
                if (clientObj)
                    if (clientObj.isHost) {
                        const newHost = Array.from(clientSession.clients.values())[Math.floor(Math.random() * clientSession.clients.size)];
                        newHost.isHost = true;
                        clientSession.hostClient = newHost;
                        newHost.sendMessage({ type: types_1.WebSocketMessageType.ColabData, colabCommand: "HOST", body: "You're now the host of this session." });
                    }
                replicateFunction((clientWs) => {
                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ColabData, colabCommand: "DISCONECT", session, thisClientId: clientId, thisSessionId: sessionId, body: clientObj?.displayName + " has left." }));
                }, clientObj);
                console.info('session is still active');
                // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, body: "$: Client " + clientId + " disconnected!"});
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
    console.log('Server is exiting...');
    exports.wss.clients.forEach(client => {
        client.close(1012, 'server is being shut down');
    });
});
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    exports.wss.clients.forEach(client => {
        client.close(1012, 'server is being shut down');
    });
    // wss.close()
    // wss.clients.forEach(client => {
    //     client.close(1012, 'server is being shut down')
    // });
    exports.server.close(() => {
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
const gdbUtilities_1 = require("./gdbUtilities");
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
