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
exports.wss = exports.sessionMap = exports.runningProcesses = exports.clients = exports.server = exports.rootDirName = void 0;
exports.authMiddleware = authMiddleware;
exports.parseText = parseText;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const ws_1 = __importDefault(require("ws"));
const path_1 = __importDefault(require("path"));
const types_1 = require("../../dist/shared/types");
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
const dbClient_1 = __importDefault(require("./dbClient"));
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
const metrics_1 = __importStar(require("./metrics"));
const examSubjects_1 = __importDefault(require("./examSubjects"));
const tx2_1 = __importDefault(require("tx2"));
const types_3 = require("../../dist/shared/types");
const problemManager_1 = __importStar(require("./problemManager"));
app.use(compression());
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        req.rawBody = buf; // Save raw body
    }
}));
function templateManager(req, res, next) {
}
app.use('/vnc', express_1.default.static(path_1.default.join(exports.rootDirName, 'vnc', 'noVNC')));
app.use('/metrics', metrics_1.default);
app.use('/subiecte', examSubjects_1.default);
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
            const output = (0, child_process_2.execSync)('cd ' + exports.rootDirName + ' && git fetch origin && git reset --hard origin/staging', { timeout: 2000 });
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
app.use('/client/scripts', express_1.default.static(path_1.default.join('dist', 'public')));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use('/editor/codeEditor.js', express_1.default.static(path_1.default.join(exports.rootDirName, 'dist', 'public', 'codeEditor.js')));
app.use('/editor/components', (req, res) => {
    try {
        fs_1.default.readFile(path_1.default.join(exports.rootDirName, 'dist', 'public', 'components.js'), (err, data) => {
            const renderer = data.toString();
            let newRender = renderer;
            //  TODO Improve this system
            const userId = users.getIdFromJWT(req);
            console.log(userId);
            if (req.cookies.token && userId)
                users.getUserData(userId).then((userdata) => {
                    if (!userdata)
                        throw 'invalid user';
                    newRender = newRender.replaceAll(`loggedIn = false`, `loggedIn = true`).replaceAll(`const username = ''`, `const username = "${userdata.username}"`);
                    res.contentType('js').send(newRender);
                }).catch(err => res.clearCookie('token').contentType('js').send(newRender));
            else
                res.contentType('js').send(newRender);
        });
    }
    catch (err) {
        console.error(err);
        return;
    }
});
app.get('/editor', (req, res) => {
    fs_1.default.readFile(path_1.default.join(exports.rootDirName, 'public', 'editor.html'), (err, file) => {
        let text;
        const userId = users.getIdFromJWT(req);
        const logged = userId != undefined;
        if (logged) {
            users.getUserData(userId).then((userdata) => {
                text = file.toString().replace('#{login}', ` <li><button class="share-session" onclick="window.editor.listProjects()" id='listProjects'>Projects</button></li>\n<li><a href='/profile'>Hey <p class='user-name'>${userdata?.username}</p><div class='focus-line'></div></a></li>`);
                text = text.replace(/\*\{(.*)\}/g, '$1');
                res.contentType('html').send(text.toString());
            });
        }
        else {
            text = file.toString().replace('#{login}', '<li><a id="signup" href="../signup">Sign-up</a><a id="login" href="../login">Login</a></li>');
            text = text.replace(/\*\{(.*)\}/g, '');
            res.contentType('html').send(text.toString());
        }
    });
});
app.use('/editor/', express_1.default.static(path_1.default.join(exports.rootDirName, 'dist', 'public')));
app.get('/editor/mode_cpp_custom.js', (req, res) => {
    res.sendFile(path_1.default.join(exports.rootDirName, 'dist', 'public', 'mode_cpp_custom.js'));
});
app.get('/editor/cpp_worker.js', (req, res) => {
    res.sendFile(path_1.default.join(exports.rootDirName, 'dist', 'public', 'cpp_worker.js'));
});
app.get('/editor/worker-base.js', (req, res) => {
    res.sendFile(path_1.default.join(exports.rootDirName, 'public', 'ace-builds-master', 'src-noconflict', 'worker-base.js.js'));
});
// app.use(express.static("public"));
app.use("/guides", guideCreator_1.default);
app.use('/shared/src/', express_1.default.static(path_1.default.join(exports.rootDirName, 'dist', 'shared')));
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
function checkboxValue(checkbox) {
    return checkbox === 'on' ? true : false;
}
app.post('/editor/startsession/:id', (req, res) => {
    try {
        const id = req.params.id;
        if (!req.body && !id)
            res.status(501);
        if (exports.sessionMap.has(id)) {
            const { chat, codePermission, voice } = req.body;
            if (exports.sessionMap.get(id).isPublic) {
                exports.sessionMap.get(id).makeSessionPublic({ enableChat: checkboxValue(chat),
                    editorPermission: codePermission,
                    enableVoice: checkboxValue(voice) });
                res.status(200);
                return;
            }
            exports.sessionMap.get(id).makeSessionPublic({ enableChat: checkboxValue(chat),
                editorPermission: codePermission,
                enableVoice: checkboxValue(voice) });
            res.status(201).send('');
        }
        else {
            res.status(500);
            return;
        }
    }
    catch (err) {
        res.status(500).send(err);
    }
});
app.get('/editor/languages', (req, res) => {
    const languages = [];
    for (const mode of EditorModes.modes) {
        languages.push({ name: mode.name, src: mode.logoSrc, description: mode.description, versions: mode.versions, ext: mode.extension[0] });
    }
    res.send(JSON.stringify(languages));
});
app.use('/editor/problem', problemManager_1.default);
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
// app.get('/problem', problemCreator);
app.get('/embed/editor', (req, res) => {
    fs_1.default.readFile(path_1.default.join(exports.rootDirName, 'public', 'embedEditor.html'), (err, file) => {
        res.send(file.toString());
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
//          LOCAL  SERVER  VARIABLES       //
let compileProcess;
//                      END                      //  
function onServerStart() {
    const err = undefined;
    if (err)
        console.error("error: " + err);
    else
        console.log("Server running on port " + PORT);
    cleanUp();
    (0, child_process_1.exec)('sudo turnserver -a -o -v -n', (err, stdout) => {
        if (err)
            console.error('Couldnt start turn server');
        else
            console.log('Started turn server');
        console.log(stdout);
    });
    (0, child_process_1.exec)('docker image prune -f -a');
}
const https = __importStar(require("https"));
const http = __importStar(require("http"));
//          GLOBAL  SERVER  VARIABLES       //
const PORT = process.env.PORT || 3000;
const SECPORT = process.env.SECPORT || 3443;
try {
    var privkey = fs_1.default.readFileSync(process.env.PRIVKEYPATH);
    var fullchain = fs_1.default.readFileSync(process.env.FULLCHAINPATH);
}
catch (err) {
}
const credentials = { key: process.env.NODE_ENV == 'development' ? '' : privkey || '',
    cert: process.env.NODE_ENV == 'development' ? '' : fullchain || '' };
if (process.env.NODE_ENV == 'development')
    console.log('SERVER RUNNING IN DEV MODE');
var httpsServer = https.createServer(credentials, app);
let httpMeter = tx2_1.default.counter('http connections');
if (fullchain && privkey)
    var httpServer = http.createServer(process.env.NODE_ENV == 'development' || true ? app : (req, res) => {
        res.statusCode = 301;
        res.setHeader('Location', 'https://intelegeinfo.ro' + req.url);
        res.end();
        httpMeter.inc(1);
    });
else
    var httpServer = http.createServer(app);
let connectionPromise;
let connectionPromiseTimeout;
const codeMap = new Map();
const unsecureServer = httpServer.listen(PORT);
exports.server = process.env.NODE_ENV == 'development' ? unsecureServer : httpsServer.listen(SECPORT);
exports.server.on('listening', onServerStart);
// app.listen(PORT, '0.0.0.0', onServerStart);
// export const wss = new WebSocket.Server({server: server, clientTracking: true,  });
exports.clients = new Map(); // should be okay to keep local
// const sessions: Map<UUID, UUID[]> = new Map();
exports.runningProcesses = new Map();
exports.sessionMap = new Map(); // SESSION ID / EDITOR OBJECT
const buildTag = `cpp-image`;
exports.wss = new ws_1.default.Server({ noServer: true, clientTracking: true, });
const peerConnectionManager_1 = require("./peerConnectionManager");
//                      END                      //  
exports.server.on('upgrade', function upgrade(request, socket, head) {
    const { pathname } = new URL(request.url, 'wss://intelegeinfo.ro');
    switch (pathname) {
        case '/api':
            metrics_1.wssAPI.handleUpgrade(request, socket, head, function done(ws) {
                metrics_1.wssAPI.emit('connection', ws, request);
            });
            break;
        case '/editor':
            exports.wss.handleUpgrade(request, socket, head, function done(ws) {
                exports.wss.emit('connection', ws, request);
            });
            break;
        case '/rtc':
            exports.wss.handleUpgrade(request, socket, head, function done(ws) {
                peerConnectionManager_1.wssRTC.emit('connection', ws, request);
            });
            break;
        default:
            socket.destroy();
    }
});
//@ts-ignore
let meter = tx2_1.default.counter('users');
// .meter({
//   name      : 'users/hour',
//   samples   : 60,
//   timeframe : 60*60
// })
exports.server.on('connection', listener => {
    // meter.mark()
    meter.inc(1);
});
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
        if (process.env.NODE_ENV == 'development')
            return;
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
const baseUrl = 'https://intelegeinfo.ro';
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
    let shouldSave = false;
    let shouldSaveTimeout;
    const isEmbededEditor = new URL(req.url, baseUrl).searchParams.get('embeded') == 'true' || req.headers['Sec-Fetch-User'] == '?1';
    const sameOrigin = req.headers.referer == 'intelegeinfo.ro' || req.headers.referer;
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
        .find((c) => c.startsWith(types_3.sessionCookieName + "="))
        ?.split("=")[1];
    let userData;
    let userLoggedIn = false;
    users.getUserData(users.getClientId(jwtCookie)).then((userdata) => {
        if (userdata) {
            userData = userdata;
            userLoggedIn = true;
        }
        else {
            // not logged in
            userData = undefined;
            userLoggedIn = false;
            if (req.headers.cookie)
                req.headers.cookie.replace(jwtCookie, '');
        }
    }).catch(err => {
        console.error("error retrieving client data: ", err);
    })
        .finally(() => {
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
        function endConnectionPromise() {
            if (connectionPromiseTimeout)
                clearTimeout(connectionPromiseTimeout);
            connectionPromiseTimeout = undefined;
            if (connectionPromise)
                connectionPromise = undefined;
        }
        awaitHandshake();
        //  TODO Improve this 
        async function awaitHandshake() {
            if (clientObj != undefined) {
                console.warn('retrying handshake');
            }
            if (connectionPromise) {
                console.warn('Another user is already connecting');
                var timeout = setTimeout(() => {
                    awaitHandshake();
                }, 500);
                connectionPromise.then(() => {
                    if (timeout)
                        clearTimeout(timeout);
                    timeout = undefined;
                    endConnectionPromise();
                    handshake(req);
                }).catch(err => {
                    endConnectionPromise();
                    console.error('kksjsjkdjsdkj on timeout', err);
                }).finally(() => {
                    if (timeout)
                        clearTimeout(timeout);
                    timeout = undefined;
                });
            }
            else {
                handshake(req);
                if (!connectionPromise)
                    throw 'invalid';
                connectionPromise.then(() => {
                    endConnectionPromise();
                    if (timeout)
                        clearTimeout(timeout);
                    timeout = undefined;
                });
                // var timeout = setTimeout(() => {
                //     awaitHandshake()
                // }, 500);
            }
        }
        function handshake(req) {
            const urlParams = new URL("https://intelegeinfo.ro/editor" + req.url).searchParams;
            // session id to connect to
            const wssessionId = urlParams.get('session') != undefined || urlParams.get('session') != undefined ? urlParams.get('session') : recoveredSession ? recoveredSession : undefined;
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
            if (connectionPromiseTimeout)
                clearTimeout(connectionPromiseTimeout);
            connectionPromiseTimeout = undefined;
            // TODO Check if session exists, otherwise create a new one and make this client the host.
            if (connectionPromise)
                console.warn('connection promise is taken');
            try {
                connectionPromise = new Promise((resolve, reject) => {
                    try {
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
                                if (!clientSession.isPublic) {
                                    ws.close(3000, "This session doesn't exist or isn't puiblic. <br> <a href='/editor'>Create a new session</a>");
                                    resolve();
                                    return;
                                }
                                clientId = (getThisClientSession() || clientSession)?.spawnClient(ws, userData);
                                clientObj = getThisClientSession().getClientObjectById(clientId);
                                exports.clients.set(clientId, ws);
                                isHost = false;
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
                                isHost = true;
                            }
                            sessionId = getThisClientSession().sessionId;
                            clientFilesPath = path_1.default.join(exports.rootDirName, "cache", sessionId, "clientFiles");
                            // clients.set(clientId, ws);
                            if (clientObj && isShared) {
                                shared.getSession(sessionId)?.clientsMap.set(clientId, clientObj);
                                shared.addClient(clientId, sessionId);
                                shared.updateSession(sessionId, clientSession);
                            }
                            console.log(urlParams);
                            if (urlParams.has('embeded'))
                                clientSession.isPublic = true;
                            connectionReady(!isHost, req).finally(resolve);
                            return;
                        }
                        else {
                            //client connected to new SOLO session
                            clientSession = createThisClientSession();
                            if (getThisClientSession() != undefined) {
                                sessionId = clientSession.sessionId;
                                clientId = getThisClientSession()?.spawnClient(ws, userData);
                                clientObj = getThisClientSession().getClientObjectById(clientId);
                                // to automatically make public if it has isPublic query
                                clientFilesPath = path_1.default.join(exports.rootDirName, "cache", sessionId, "clientFiles");
                                exports.sessionMap.set(clientSession.sessionId, clientSession); // TODO Implement this in EditorSession class & polish it
                            }
                            else
                                console.error(new Error("Failed to create SOLO session"));
                            if (clientObj && shared) {
                                shared.getSession(sessionId)?.clientsMap.set(clientId, clientObj);
                                shared.addClient(clientId, sessionId);
                                shared.updateSession(sessionId, clientSession);
                            }
                            exports.clients.set(clientId, ws);
                            // will always be false
                            connectionReady(false, req).finally(resolve);
                        }
                    }
                    catch (err) {
                        if (connectionPromiseTimeout)
                            clearTimeout(connectionPromiseTimeout);
                        connectionPromiseTimeout = undefined;
                        endConnectionPromise();
                    }
                });
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
                    if (connectionPromiseTimeout)
                        clearTimeout(connectionPromiseTimeout);
                    connectionPromiseTimeout = undefined;
                    endConnectionPromise();
                }).then(() => {
                    if (connectionPromiseTimeout)
                        clearTimeout(connectionPromiseTimeout);
                    connectionPromiseTimeout = undefined;
                });
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
            }
            catch (err) {
                endConnectionPromise();
                console.log("d;aa;a;;a;a", err);
            }
        }
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
            getThisClientSession().process = process;
        }
        function removeRunningProcessFromMap() {
            getThisClientSession().process = undefined;
        }
        function getProcessFromMap(clientSession) {
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
            getThisClientSession()?.clientsMap.forEach((clientObject, client) => {
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
            });
        }
        function sendConnectionMessage(isHost, fileContent) {
            // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, messageType: ConsoleMessageType.SessionInfo, body: "Client " + clientObj?.displayName + " joined!"});
            if (!clientSession)
                return;
            const session = clientSession.clientsMap.size != 1 ? clientObj.permissions : undefined; //clientObj.isHost
            const welcomeMessage = isEmbededEditor ? sameOrigin ? "Editorul de cod intelegeinfo " : "Powered by <a href='https://intelegeinfo.ro'>intelegeinfo.ro</a>" : !userLoggedIn ?
                `Bine ai venit pe Intelege Info!
     Scrie cod, apoi apasa COMPILE si EXECUTE CODE sau ruleaza in DEBUGGER.
      Invita-ti prietenii sa editeze codul împreună cu tine în timp real apăsând butonul SHARE.`
                :
                    `Bine ai revenit ${userData?.username} pe Intelege Info!
        Poti salva codul tau apasand pe butonul save.`;
            // await sendListFiles(clientFilesPath)
            const files = clientSession.files.map(file => { return file.name; });
            const users = clientSession.clients.map(val => { return clientInfo(val); });
            // Send initial message to client
            const message = { type: types_1.WebSocketMessageType.Handshake,
                ...clientInfo(),
                messageType: types_1.ConsoleMessageType.Info,
                sessionId: sessionId,
                body: welcomeMessage,
                project,
                permissions: clientObj.permissions,
                files,
                users
            };
            ws.send(JSON.stringify(message));
            if (files[0] && fileContent)
                sendFileContents(fileContent, files[0]);
            return session;
        }
        function sendFileContents(fileContent, fileName) {
            if (clientObj.getFile(fileName))
                clientObj.CWebSocket.send(JSON.stringify({ type: types_1.WebSocketMessageType.FileManagement, fileName: clientObj.getFile(fileName).name, body: { command: types_3.FileManagementCommands.Open, content: fileContent } })); // Send the list of files to the client
        }
        function clientInfo(thisclientObj, prefix = '') {
            if (!clientObj)
                return;
            if (!thisclientObj)
                thisclientObj = clientObj;
            if (thisclientObj)
                return { clientId: thisclientObj.clientId, displayName: thisclientObj.displayName, color: thisclientObj.color, openFile: thisclientObj.getFilesName() };
            // JSON.parse(`{"${prefix}clientId": "${thisclientObj.clientId}", "${prefix}displayName": "${thisclientObj.displayName}", "${prefix}color": "${thisclientObj.color}", "${prefix}openFile": "${thisclientObj.openFileName}"}`)
            else if (prefix)
                return JSON.parse(`{${prefix}clientId: "${clientId}", ${prefix}displayName: "${clientObj.displayName}", ${prefix}color: "${clientObj.color}"}`);
            else
                return { clientId: clientId, displayName: clientObj.displayName, color: clientObj.color, openFile: clientObj.getFilesName() };
        }
        async function loadSave(fileUUID) {
            try {
                let savedProject;
                if (!getJWTCookie(req.headers.cookie))
                    throw 'not logged in';
                const id = jsonwebtoken_1.default.verify(getJWTCookie(req.headers.cookie), privateKeyPem);
                savedProject = (await loadProject(fileUUID));
                if (savedProject.userId !== parseInt(id.sub))
                    throw 'not authorized';
                fs_1.default.cpSync(path_1.default.join(exports.rootDirName, "saved", savedProject.fileUUID), path_1.default.join(exports.rootDirName, "cache", sessionId), { recursive: true });
                project = savedProject;
                clientSession.files = fs_1.default.readdirSync(clientFilesPath).flatMap((file) => { return new types_2.EditorFile(clientSession, file, fs_1.default.readFileSync(path_1.default.join(clientFilesPath, file)).toString()); });
                // fs.renameSync()
                // defaultText =  
                // console.log(defaultText)
            }
            catch (err) {
                printClientConsoleError("Couldn't find your saved project, sorry! Check that you're logged in or the URL is correct. Error: " + err, getThisClientSession().getClientObjectById(clientId));
            }
        }
        async function connectionReady(cooperator = false, req) {
            const session = await new Promise(async (resolve) => {
                const urlParams = new URL("ws:/intelegeinfo.ro:8080" + req.url).searchParams;
                const clientFilesPath = clientSession.getClientFilesPath();
                let savedProject;
                if (urlParams.has("save"))
                    await loadSave(urlParams.get('save'));
                // printClientConsoleInfo("connected to worker: " + process.pid)
                //create cache folder for session if its a new one
                const cacheFolderExists = fs_1.default.existsSync(path_1.default.join(exports.rootDirName, "cache", sessionId));
                if ((!cacheFolderExists && !cooperator && clientSession.files.length == 0)) {
                    if (clientSession.files.length == 0 && cacheFolderExists && !cooperator && savedProject == undefined) {
                        fs_1.default.rmSync(clientFilesPath, { recursive: true, force: true });
                        console.log('deteled existing session folder');
                    }
                    const err = undefined;
                    fs_1.default.mkdirSync(clientFilesPath, { recursive: true });
                    if (err) {
                        console.error("Error creating cache folder:", err);
                        return;
                    }
                    const defaultFileName = 'main.cpp';
                    const session = sendConnectionMessage(!cooperator, '');
                    resolve(session);
                    //     new EditorFile(clientSession, defaultFileName, undefined, undefined, function () {
                    //         this.openFile(clientObj, shared).then((fileContent) => {
                    //             // const session = sendConnectionMessage(!cooperator, fileContent)
                    //             // resolve(session)
                    //         })
                    // })
                    // fs.writeFile(path.join(clientFilesPath, "main.cpp"), defaultText, (err) => {
                    //     listFiles(clientFilesPath).then(() => {
                    //         openFile("main.cpp")
                    //     })
                    //     });
                }
                else {
                    // load files from existing session
                    console.warn("Cache folder already exists for sessionId " + sessionId);
                    // load project files
                    if (cacheFolderExists && !cooperator && clientSession.files.length == 0)
                        clientSession.files = fs_1.default.readdirSync(clientFilesPath).flatMap((file) => { return new types_2.EditorFile(clientSession, file, fs_1.default.readFileSync(path_1.default.join(clientFilesPath, file)).toString(), { abstract: true }); });
                    // const session = sendConnectionMessage(!cooperator, '')
                    if (clientSession.files[0] == undefined) {
                        if (savedProject)
                            openFile(fs_1.default.readdirSync(clientFilesPath)[0]);
                        else
                            return console.log('no file found in files: ', clientSession.files);
                    }
                    else if (fs_1.default.existsSync(path_1.default.join(clientFilesPath, clientSession.files[0].name)))
                        clientSession.files[0].openFile(clientObj, shared)
                            .then((fileContent) => {
                            const session = sendConnectionMessage(!cooperator, fileContent);
                            console.log('Opened file');
                            resolve(session);
                        });
                    // openFile(clientSession.files[0].name) // load first file
                    else
                        console.error("No default file was found!"); // TODO replace with async function
                    // resolve(session)
                }
            });
            if (getThisClientSession()?.clientsMap.size > 1) // multiple clients connected to this session
             {
                // display join message
                replicateFunction((clientWs, LocalclientId) => {
                    printClientConsoleSessionInfo(clientObj?.displayName + " joined!", getThisClientSession().getClientObjectById(LocalclientId));
                }, clientObj);
                let displayNames = [];
                getThisClientSession()?.clientsMap.forEach((client, id) => {
                    if (!client.openFile)
                        throw 'invalid file';
                    if (client != clientObj)
                        displayNames.push({ displayName: client.displayName, fileName: client.getFilesName(), clientId: client.clientId, color: client.color });
                });
                replicateFunction((clientws) => {
                    clientws.send(JSON.stringify({ type: types_1.WebSocketMessageType.ColabData, colabCommand: "JOIN", client: clientInfo(clientObj), permissions: session })); // Send GDB output to the client
                }, clientObj);
                //    replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.ColabData, colabCommand: "JOIN", client: clientInfo(clientObj), permissions: session});
                ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.ColabData, colabCommand: "LIST", clients: displayNames })); // Send GDB output to the client
                // send all other client's information
                clientSession.clientsMap.forEach((client) => {
                    ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.FileManagement, command: types_3.FileManagementCommands.Open, fileName: client.getFilesName(), name: client.displayName, color: client.color, clientId: client.clientId })); // Send GDB output to the client
                }, clientObj);
                setTimeout(() => {
                    getThisClientSession().clientCommandBuffer.forEach((cmdBuf, remoteClientid) => {
                        if (clientId != remoteClientid)
                            if (getThisClientSession().clientsActiveFile.get(remoteClientid) === getThisClientSession().clientsActiveFile.get(clientId))
                                ws.send(JSON.stringify(cmdBuf.codeSelection));
                    });
                }, 100);
            }
        }
        const onData = (data) => {
            gdbBuffer = data.toString();
            console.log(gdbBuffer);
            // Check if the full response has arrived
            if (!gdbBuffer.toString())
                return;
            if (gdbBuffer.includes("(gdb)")) {
                // We have everything, remove listener
                // (childProcess.stdout as NodeJS.ReadableStream).removeListener("data", onData);
                gdbBuffer.split('\n').forEach(element => {
                    if (element.trim() != '') {
                        const gdbOutput = (0, gdbUtilities_1.parseGDBString)(element);
                        if (JSON.stringify(gdbOutput.json) == '{}')
                            return;
                        // if( gdbOutput.ignore)
                        //     return
                        //  console.log(JSON.stringify(gdbOutput.json), gdbOutput.err)
                        const response = {
                            error: gdbOutput.err ? gdbOutput.err : undefined,
                            input: false,
                            type: types_1.WebSocketMessageType.Output,
                            messageType: types_1.ConsoleMessageType.DebugProgram,
                            clientId: clientId,
                            body: gdbOutput.json ? gdbOutput.json : undefined,
                            raw: gdbBuffer,
                            message: 'next', //deprecated - remove
                            msgId: clientSession.gdbProcess?.pid || -1,
                            line: gdbOutput.json?.frame?.line ? gdbOutput.json.frame.line : undefined,
                            variables: gdbOutput.json?.variables ? gdbOutput.json.variables : undefined
                        };
                        getThisClientSession()?.clientsMap.forEach((client, id) => {
                            //send response to all clients 
                            const clientSocket = exports.clients.get(client.clientId);
                            if (!clientSocket) {
                                //sessions.delete(sessionId);
                                if (getThisClientSession()?.clientsMap.has(clientId))
                                    console.error("Client not found in session while manually replicating to client  " + sessionId);
                                else
                                    getThisClientSession()?.clientsMap.delete(client.clientId);
                                exports.clients.delete(client.clientId);
                                return console.error("\\x1b[31m Client not found, removing ids " + client + "\\x1b[0m");
                            }
                            clientSocket?.send(JSON.stringify(response));
                        });
                    }
                });
                // }
            }
        };
        // debug mode only for now
        async function executeCommand(childProcess, command, sessionId) {
            return new Promise((resolve, reject) => {
                console.log("GDB Command to execute: " + command);
                childProcess.sendCommand(command);
                if (command === '-exec-quit' && childProcess)
                    closeProcess(childProcess);
                resolve();
            });
        }
        let CommandQueue = Promise.resolve();
        function queueCommand(process, command, sessionId) {
            CommandQueue = CommandQueue.then(() => executeCommand(process, command, sessionId)).catch((err) => {
                printClientConsoleError("failed to queue debugger command: " + err);
            });
            return CommandQueue;
        }
        function sendListFiles(dir) {
            try {
                return new Promise((resolve, reject) => {
                    ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.FileManagement, body: { command: types_3.FileManagementCommands.List, content: clientSession.files.map(file => { return file.name; }) } })); // Send the list of files to the client
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
            }
            catch (reason) {
                console.log("Failed listing files: " + reason);
                printClientConsoleDebug("Failed listing files: " + reason);
            }
        }
        function openFile(fileName, closedFile) {
            // if(fs.existsSync(path.join(clientFilesPath, fileName)))
            // console.log("path: " + path.join(clientFilesPath || path.join(rootDirName, "cache", sessionId,"clientFiles"), fileName))
            console.log('Sent open file');
            const file = clientSession.files.find(file => file.name == fileName);
            if (!file) {
                console.error(new Error('Couldnt find file ' + fileName));
                return;
            }
            file.openFile(clientObj, shared, closedFile).then((fileContent) => onOpenFile(closedFile, fileName, fileContent));
        }
        function onOpenFile(oldFileName, fileName, fileContent) {
            sendFileContents(fileContent, fileName);
            replicateFunction((clientWs, id, thisClientObj) => {
                clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.FileManagement, command: types_3.FileManagementCommands.Open, fileName, oldFileName, name: clientObj.displayName, color: clientObj.color, clientId: clientId })); // Send GDB output to the client
                if (thisClientObj.openFile && thisClientObj != clientObj)
                    // if(thisClientObj.openFile.name != fileName || thisClientObj.openFile.name == oldFileName) // TODO choose one
                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.MouseUpdate, fileName, oldFileName, ...clientInfo(clientObj) })); // Send GDB output to the client  
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
            return new Promise(async (resolve, reject) => {
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
                    replicateFunction((ws, id, obj) => obj.sendMessage({ status: 'spawn' }, types_1.WebSocketMessageType.ExecuteStatus));
                    resolve(clientSession.sessionContainer);
                    return;
                }
                // Create a temporary directory for building the Docker image
                //   const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpp-docker-'));
                new Promise((resolve, reject) => {
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
                            const builder = (0, child_process_1.spawn)(`docker`, ["build", "-t", clientSession.currentbuildTag, , '"' + sessionFolder + '"'], { stdio: 'pipe', shell: true });
                            replicateFunction((ws, id, obj) => obj.sendMessage({ body: 'Please wait.. Preparing your sandbox' }, types_1.WebSocketMessageType.ExecuteStatus));
                            builder.on('exit', code => {
                                if (code == 0)
                                    resolve();
                                else
                                    reject('Failed to build Docker image');
                            });
                            builder.stdout.on('data', data => console.log(data.toString()));
                            builder.stderr.on('data', data => console.error(data.toString()));
                            builder.on('error', err => {
                                reject('Error building Docker image:' + err);
                                onClosedProgram(-1, 0, `<span class="console-error">${err}</span>`);
                                reject(err);
                            });
                        }
                        catch (error) {
                            onClosedProgram(-1, 0, `<span class="console-error">${error}</span>`);
                            reject(error);
                            console.error('Error building Docker image:', error);
                            return;
                        }
                    }
                    else
                        console.log('Skipping build stage.');
                }).then(val => {
                    // -m 256MB \
                    // --cpus="0.25" \
                    const imageName = `session-container-${sessionId}`;
                    // fs.mkdirSync(`/tmp/vnc-${sessionId}/`)
                    // 4. Run the Docker container with access to the sandbox folder
                    const hasGUI = clientObj.openFile[0].name.toLowerCase().includes("gui");
                    console.log(hasGUI ? 'executing with GUI' : "no gui", clientObj.openFile[0].name, clientObj.openFile);
                    if (clientSession.sessionContainer)
                        (0, child_process_2.execSync)('docker rm -f ' + clientSession.sessionContainer.imageName);
                    const runCommand = `docker run \
-d \
--name ${imageName} \
-v "${sessionFolder}:/app" \ 
-w /app \
${process.env.DISABLE_CONTAINER_LIMITS == 'false' ? `-m ${256 * parseInt(process.env.CONT_MEM_MUlTI || "1")}MB \
--cpus=${0.25 * parseInt(process.env.CONT_MEM_MUlTI || "1")}` : ''} \
-di \
--rm \
${clientObj.openFile[0].editorMode.runParams(clientObj)} \
${clientSession.currentbuildTag} \
bash `.trim().replaceAll('\n', "");
                    //  --rm -c "g++ -g -v -O0 main.cpp -o main && ./main"
                    console.log(`Running Docker container ${imageName} with access to ${sandboxFolder}`);
                    console.log(runCommand);
                    // Return the child process for external handling
                    const childProcess = (0, child_process_1.spawn)(runCommand, { shell: true, stdio: 'pipe' });
                    clientSession.sessionContainer = { process: childProcess, imageName, fileName, editorMode: clientObj.openFile[0].editorMode };
                    childProcess?.on("spawn", () => {
                        console.log("Docker container spawned");
                    });
                    childProcess.stdout.on('data', data => {
                        console.log("CONTAINER ID:" + data.toString());
                        setTimeout(async () => {
                            // TODO Spawn GUI on client 
                            //   TODO maybe remove ignore self client to show when its ready and compiling
                            replicateFunction((ws, id, obj) => obj.sendMessage({ status: 'container-spawn' }, types_1.WebSocketMessageType.ExecuteStatus));
                            if (hasGUI && clientSession.displayServer == 0) // doesnt have display server
                             {
                                clientSession.displayServer = await clientSession.sessionContainer.editorMode.onBuild(clientSession.sessionContainer, clientSession, clientObj);
                            }
                            resolve(clientSession.sessionContainer); // Return the child process so it can be handled externally
                        }, 1000);
                    });
                    childProcess.stderr.on('data', data => {
                        console.log('[Docker Container Error]' + data.toString());
                        // onClosedProgram(1, 0, "Failed to sandbox program: " + data.toString()).then(() => console.log('fail sent to user'))
                    });
                }).catch(err => [
                    console.error(err)
                ]);
            });
        }
        async function executeProblemChecker(problemId) {
            return new Promise((resolve, reject) => {
                console.log(problemId);
                dbClient_1.default.problem.findUnique({
                    where: {
                        id: problemId
                    }
                }).then(problem => {
                    if (!problem)
                        throw 'Problem with id ' + problemId + ' is invalid!';
                    if (process.env.NODE_ENV == 'development') {
                        (0, problemManager_1.testProblem)(problem.tests, clientObj, clientSession, undefined)
                            .then(resolve).catch(reject)
                            .finally(() => {
                            replicateFunction((clientWs, id, clientObj) => {
                                clientObj.sendMessage({ type: types_1.WebSocketMessageType.End, messageType: types_1.ConsoleMessageType.Output, clientId: clientId }); // Send GDB output to the client
                            });
                        });
                    }
                    else
                        buildAndRunCppSandbox(path_1.default.join(exports.rootDirName, "cache", sessionId), clientSession.clientsActiveFile.get(clientId), clientObj.editorMode, clientId, sessionId).then(async (res) => {
                            //     cwd:  path.join(rootDirName, "cache", sessionId,"clientFiles"), // we must add this for the program to have the correct directory for input files.
                            if (res == null)
                                return resolve(undefined);
                            try {
                                // const timeLimit = problem.averageTimeLimit || 0
                                // const memoryLimit =  problem.averageMemLimit || 0
                                console.log('starting compile');
                                await clientObj.getFile(res.fileName).editorMode.compile(res, clientObj.getFile(res.fileName), false);
                                console.log('compile finished');
                                (0, problemManager_1.testProblem)(problem.tests, clientObj, clientSession, res)
                                    .then(resolve).catch(reject)
                                    .finally(() => {
                                    replicateFunction((clientWs, id, clientObj) => {
                                        clientObj.sendMessage({ type: types_1.WebSocketMessageType.End, messageType: types_1.ConsoleMessageType.Output, clientId: clientId }); // Send GDB output to the client
                                    });
                                });
                            }
                            catch (err) {
                                console.error("Failed to run docker commands: " + err);
                                onClosedProgram(-1, 0, `<span class="console-error">${err}</span>`);
                                reject(err);
                            }
                        }).catch(reject);
                }).catch((err) => reject(err + 'ababababa'));
            });
        }
        clientSession.executeProblemChecker = executeProblemChecker;
        async function onClosedProgram(code, time, message, error) {
            let notes = "";
            processInputBuffer = '';
            // const time = 
            if (clientSession.program) {
                clientSession.program.stdout.removeAllListeners();
                clientSession.program.stderr.removeAllListeners();
            }
            replicateFunction((clientWs) => {
                clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.End, messageType: types_1.ConsoleMessageType.Output, time, notes, body: message, clientId: clientId })); // Send GDB output to the client
            });
            if (code != 0)
                return;
            if (new Blob([gdbBuffer]).size > 64000) // 1000000 is 1Mb
             {
                await new Blob([gdbBuffer]).slice(0, 64000).text().then(str => {
                    notes = "buffer exceeded 64kb, output was truncated.";
                    replicateFunction((clientWs) => {
                        clientWs.send(JSON.stringify({ messageType: types_1.ConsoleMessageType.Output, type: types_1.WebSocketMessageType.Output, body: str.toString(), clientId: clientId })); // Send GDB output to the client
                    });
                });
            }
        }
        async function readStdio(program, messageJSON, res) {
            return new Promise((resolve, reject) => {
                addProcessToMap(sessionId, program); // add to process map
                mode = "run";
                let spawnDate = Date.now();
                let programTimeout;
                gdbBuffer = "";
                if (messageJSON.textMode)
                    programTimeout = setTimeout(() => {
                        onClosedProgram(-1, (Date.now() - spawnDate), "<span style='color: red'>Program timed out!</span>");
                        closeProcess(program);
                        resolve();
                    }, 1000);
                // if(programTimeout) clearTimeout(programTimeout)
                spawnPromise = new Promise((resolve, reject) => {
                    clientSession.program?.on("spawn", () => {
                        console.log("Program spawned");
                        spawnDate = Date.now();
                        res.editorMode.onSpawn(clientSession);
                        replicateFunction((ws, id, obj) => obj.sendMessage({ spawn: 1 }, types_1.WebSocketMessageType.ExecuteStatus));
                        // clientObj.sendMessage({type: WebSocketMessageType.ExecuteStatus, spawn: 1})
                        if (clientSession.program.stdin && processInputBuffer)
                            if (clientSession.program?.stdin?.writable)
                                clientSession.program.stdin.write(processInputBuffer); // write buffer
                        dataTimeout =
                            setTimeout(() => {
                                replicateFunction((ws, id, obj) => obj.sendMessage({ input: 1 }, types_1.WebSocketMessageType.ExecuteStatus));
                                // clientObj.sendMessage({type: WebSocketMessageType.ExecuteStatus, input: 1})
                            }, 400);
                        resolve();
                    });
                });
                clientSession.program.stdout?.addListener("data", (data) => {
                    // gdbBuffer += data.toString();
                    // replicateFunction((clientWs) => {
                    //     clientWs.send(JSON.stringify({messageType: ConsoleMessageType.Output, type: WebSocketMessageType.Output, body: gdbBuffer.toString(), clientId: clientId}));  // Send GDB output to the client
                    // });
                    // gdbBuffer = "";
                    if (new Blob([gdbBuffer]).size > 64000) // 1000000 is 1Mb
                     {
                        closeProcess(program).then(() => onClosedProgram(-1, (Date.now() - spawnDate), "<span style='color: red'>Program buffer size excedded!</span>"));
                        resolve();
                    }
                    replicateFunction((clientWs) => {
                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.Output, messageType: types_1.ConsoleMessageType.Output, body: data.toString(), clientId: clientId })); // Send GDB output to the client
                    });
                    clearTimeout(dataTimeout);
                    dataTimeout = setTimeout(() => {
                        replicateFunction((ws, id, obj) => obj.sendMessage({ input: 1 }, types_1.WebSocketMessageType.ExecuteStatus));
                    }, 100);
                });
                clientSession.program?.stderr?.addListener("data", (data) => {
                    // gdbBuffer += data.toString();
                    replicateFunction((clientWs) => {
                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.Output, messageType: types_1.ConsoleMessageType.Output, body: data.toString(), clientId: clientId })); // Send GDB output to the client
                    });
                });
                clientSession.program?.addListener("close", (code) => {
                    clearTimeout(dataTimeout);
                    clearTimeout(programTimeout);
                    switch (code) {
                        case 0:
                        default:
                            onClosedProgram(code, (Date.now() - spawnDate), "Program exited with code: " + code?.toString() || -1);
                            break;
                        case 136:
                        case 138:
                            onClosedProgram(code, (Date.now() - spawnDate), "Program exited with errror: <a href='/guides/aritmethicoperation?session=" + sessionId + "' title=Learn how to fix here. | Error code: " + code?.toString() + ">Arithmetic devided by 0</a>", true);
                            break;
                        case 139:
                            onClosedProgram(code, (Date.now() - spawnDate), "Program exited with errror: <a href='/guides/aritmethicoperation?session=" + sessionId + "' title=Learn how to fix here. | Error code: " + code?.toString() + ">Segmentation Fault</a>", true);
                            break;
                        case 3221225477:
                            onClosedProgram(code, (Date.now() - spawnDate), "Program exited with errror: <a href='/guides/errors/memaccessviolation?session=" + sessionId + "' title=Learn how to fix here. | Error code: " + code?.toString() + ">MEMMORY ACCESS VIOLATION!</a>", true);
                            break;
                    }
                    gdbBuffer = "";
                    onClosedProcess();
                    resolve();
                });
            });
        }
        // Handle GDB session commands from client
        ws.addListener("message", async (message, isBinary) => {
            try {
                let messageJSON;
                if (JSON.parse(message.toString()).data != undefined)
                    messageJSON = JSON.parse(message.toString()).data;
                else
                    messageJSON = JSON.parse(message.toString());
                // console.log(messageJSON)
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
                    case types_1.WebSocketMessageType.Utilities:
                        switch (messageJSON.util) {
                            case 'transpile':
                                const target = messageJSON.target;
                                if (!messageJSON.fileName)
                                    break;
                                const targetMode = EditorModes.modes.find(mode => mode.name === target || mode.extension.includes(target));
                                if (targetMode)
                                    (0, aiIntegration_1.transpileCode)(clientObj, clientObj.openFile.find(file => file.name === messageJSON.fileName), targetMode).then(val => {
                                        ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.Utilities, util: messageJSON.util, response: val, fileName: messageJSON.fileName }));
                                    });
                                break;
                        }
                        break;
                    case types_1.WebSocketMessageType.RTC:
                        // for(const cws of clientSession.clients.values())
                        //     cws.CWebSocket.send(JSON.stringify({...messageJSON, calerId: clientId}))
                        if (!messageJSON.targetId)
                            break;
                        const cws = clientSession.clientsMap.get(messageJSON.targetId);
                        if (cws != clientObj)
                            if (cws)
                                cws.CWebSocket.send(JSON.stringify({ ...messageJSON, callerId: clientId }));
                            else
                                ws.send(JSON.stringify({ type: 'rtc', end: true, callerId: messageJSON.targetId }));
                        break;
                    case types_1.WebSocketMessageType.Canvas:
                        replicateFunction((clientWs, clientid, thisClientObj) => {
                            if (thisClientObj.checkClientsFileOpen(clientObj))
                                clientWs.send(JSON.stringify({ ...messageJSON })); // Send GDB output to the client
                        }, clientObj);
                        break;
                    case types_1.WebSocketMessageType.WebCam:
                        // console.log(messageJSON.buffer);
                        try {
                            if (messageJSON.started) {
                                clientObj.webcamid = Math.floor(Math.random() * 50);
                                (0, child_process_2.execSync)('sudo modprobe -r v4l2loopback');
                                const video = (0, child_process_1.exec)(`sudo modprobe v4l2loopback video_nr=${clientObj.webcamid} card_label="${clientId}" exclusive_caps=1`);
                                video.stdout.pipe(process.stdout);
                                video.stderr.pipe(process.stdout);
                                video.on('close', data => console.log('added camera. ' + data.toString()));
                                console.log('added camera', clientObj.webcamid);
                            }
                            else
                                clientObj.openFile[0].editorMode.receiveWebCam(messageJSON.buffer);
                        }
                        catch (err) {
                            /// ......
                        }
                        break;
                    case types_1.WebSocketMessageType.Heartbeat:
                        if (!clientObj)
                            break;
                        clientObj.ping = Date.now() - heartbeatTimestamp;
                        // console.log("Client ping: " + clientObj?.ping)
                        //console.log("Received heartbeat from client " + clientId);
                        break;
                    case types_1.WebSocketMessageType.Handshake:
                        sendConnectionMessage(true, ''); // TODO Implement this on client side, to ensure client received handshake message.
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
                            if (!getProcessFromMap().stdin)
                                return;
                            getProcessFromMap().stdin.write(messageJSON.command + "\n");
                            dataTimeout = setTimeout(() => {
                                replicateFunction((ws, id, obj) => obj.sendMessage({ input: 1 }, types_1.WebSocketMessageType.ExecuteStatus));
                            }, 200);
                        }
                        else
                            processInputBuffer += messageJSON.command + "\n";
                        replicateFunction((clientWs) => {
                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.Console, messageType: types_1.ConsoleMessageType.Output, body: messageJSON.command, clientDisplayName: clientObj?.displayName, clientId: clientId })); // Send GDB output to the client
                        });
                        break;
                    case types_1.WebSocketMessageType.Chat:
                        if (!clientObj.permissions.canChat)
                            break;
                        // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, messageType: ConsoleMessageType.UserChat,  body: messageJSON.command, clientDisplayName: clientObj?.displayName});
                        replicateFunction((clientWs) => {
                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.Chat, id: getThisClientSession().messageIndex, messageType: types_1.ConsoleMessageType.UserChat, body: messageJSON.command.replaceAll("<", "&lt").replaceAll(">", "&gt"), clientDisplayName: clientObj?.displayName, clientId: clientId })); // Send GDB output to the client
                        });
                        getThisClientSession().messageIndex++; // counter used to id and group console mssages.
                        // clients.forEach((client, id) => {
                        //         client.send(JSON.stringify({error: false, input: false, clientId: clientId, type: WebSocketMessageType.Chat, body: messageJSON.command})); // Send initial message to client
                        // });
                        break;
                    case types_1.WebSocketMessageType.MouseUpdate:
                        if (!clientObj.openFile)
                            throw "Client open file is invalid";
                        replicateFunction((thisClientWs, thisClientId, thisClientObj) => {
                            if (!thisClientObj.openFile)
                                throw "this client obj has invalid file";
                            if (clientSession.getClientObjectById(thisClientId).permissions.canEdit && thisClientObj.checkClientsFileOpen(clientObj))
                                thisClientWs.send(JSON.stringify({ ...messageJSON, ...clientInfo(clientObj) })); // TODO Sanitize this
                        }, clientObj);
                        break;
                    case types_1.WebSocketMessageType.CodeChange:
                        if (!clientObj.permissions.canEdit)
                            break;
                        const fileName = messageJSON.fileName;
                        // if(shouldSave==false)
                        // shouldSaveTimeout = setTimeout(() => {
                        //     shouldSave=true;
                        // }, 500);
                        // save code to file
                        // if(shouldSave) // TODO replace true with shouldSave 
                        // {
                        shouldSave = false;
                        if (checkSyntaxTimeout)
                            clearTimeout(checkSyntaxTimeout);
                        checkSyntaxTimeout = setTimeout(() => {
                            //   TODO make a more efficient way of updating the file, either by streams (streaming updates to file) or a save button.
                            fs_1.default.writeFile(path_1.default.join(clientFilesPath, fileName), messageJSON.body, (err) => {
                                if (err)
                                    console.log("Failed saving file! " + err);
                                // if(checkSyntaxTimeout) clearTimeout(checkSyntaxTimeout)
                                // checkSyntaxTimeout = setTimeout(() => {
                                if (clientObj.getFile(fileName) && clientObj.getFile(fileName).editorMode)
                                    if (clientObj.getFile(fileName).editorMode.checkCodeSyntax)
                                        clientObj.getFile(fileName).editorMode.checkCodeSyntax(clientSession, clientObj.getFile(fileName)).then(json => {
                                            if (!JSON.parse(json)[0])
                                                return replicateFunction((clientWs, localClientId) => {
                                                    if (getThisClientSession().clientsActiveFile.get(localClientId) === getThisClientSession().clientsActiveFile.get(clientId))
                                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.CompileResult, fileName, clientId: clientId, body: JSON.stringify([{ kind: 'success' }]) }));
                                                });
                                            replicateFunction((clientWs, localClientId) => {
                                                if (getThisClientSession().clientsActiveFile.get(localClientId) === getThisClientSession().clientsActiveFile.get(clientId))
                                                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.CompileResult, fileName, clientId: clientId, body: json }));
                                            });
                                        }).catch(err => {
                                            console.error('syntax checker error: ' + err);
                                        });
                                // }, 400);
                            });
                        }, 200);
                        // }
                        clientObj.getFile(fileName).changeContent(messageJSON.body);
                        // replicate changes to others
                        replicateFunction((thisclientWs, localClientId, thisClientObj) => {
                            if (clientObj.checkClientsFileOpen(thisClientObj) && clientObj.permissions.canEdit)
                                thisclientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.CodeChange, clientId: clientId, delta: messageJSON.delta, fileName, body: messageJSON.body, msgId: JSON.parse(message.toString()).msgId }));
                        }, clientObj);
                        break;
                    case types_1.WebSocketMessageType.ConsoleTyping:
                        if (!clientObj.permissions.canChat)
                            break;
                        const TypingIndicatorType = messageJSON.status;
                        replicateFunction((clientWs, localClientId) => {
                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ConsoleTyping, displayName: clientObj?.displayName, clientId: clientId, status: TypingIndicatorType }));
                        }, clientObj);
                        break;
                    case types_1.WebSocketMessageType.CodeSelection:
                        //fs.writeFileSync(path.join(rootDirName, "cache", sessionId , "user_code.cpp"), messageJSON.code);
                        // console.log(type + " for sessionId " + sessionId);
                        if (!clientObj.permissions.canEdit)
                            break;
                        const codeSelectionJSON = { type: types_1.WebSocketMessageType.CodeSelection, clientId: clientId, body: messageJSON, color: clientObj.color, fileName: messageJSON.fileName };
                        getThisClientSession().clientCommandBuffer.set(clientId, { codeSelection: codeSelectionJSON });
                        // rename this to something more apropriate eg guily client idk
                        //    replicateSocketMessage(sessionId, clientId, true, {type: type, clientId: clientId, body: messageJSON}, (client) => { let filter = getThisClientSession()?.clientsActiveFile.get(client) != fileName; console.log(getThisClientSession()?.clientsActiveFile.get(client) + fileName); return filter;});
                        replicateFunction((clientWs, localClientId, thisClientObj) => {
                            if (clientObj.checkClientsFileOpen(thisClientObj))
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
                        const commandType = messageJSON.command;
                        // Let only open command through
                        if (!clientObj.permissions.canEdit && commandType !== types_3.FileManagementCommands.Open)
                            break;
                        switch (commandType) {
                            case types_3.FileManagementCommands.Open:
                                openFile(messageJSON.body, messageJSON.closedFile);
                                console.log('clientId', clientId, 'sessionid', sessionId);
                                break;
                            case types_3.FileManagementCommands.Create:
                                new types_2.EditorFile(clientSession, messageJSON.name, messageJSON.body);
                                break;
                            case types_3.FileManagementCommands.Delete:
                                if (!clientObj.permissions.canEdit)
                                    break;
                                clientSession.files.find(file => file.name == messageJSON.name).delete(clientObj);
                                break;
                            //  TODO Make this so it just return name and make seperate function for fle content, which will be called only when opening the file on the client. STORE IT IN CACHE, ADD A DIRTY VERIFICATION TO NOT SEND THE SAME SHI MULTIPLE TIMES DONT OPEN THE EDITOR UNTIL THE FILE HAS LOADED ON THE CLIENT SEND THE FILES ON  HANDSHAKE MAKE SURE IT IS ALL REPLICATED
                            case types_3.FileManagementCommands.List:
                                sendListFiles(clientFilesPath);
                                break;
                            case types_3.FileManagementCommands.Rename:
                                if (!clientObj.permissions.canEdit)
                                    break;
                                const file = clientSession.files.find(file => file.name == messageJSON.name);
                                file.rename(messageJSON.newName, clientObj);
                                //  const targetMode = EditorModes.modes.find(mode => mode.extension.includes(messageJSON.newName.split('.').at(-1)))
                                //     if(targetMode)
                                //         transpileCode(clientObj, file, targetMode).then(val => {
                                //             ws.send(JSON.stringify({type: WebSocketMessageType.Utilities, util: 'transpile', response: val, fileName: messageJSON.newName}))
                                //         })
                                break;
                        }
                        break;
                    default:
                        if (!clientObj.permissions.canEdit)
                            break;
                        handleCommand(command, exports.clients); // pass all the clients in the session
                        async function handleCommand(command, sockets) {
                            const filePath = path_1.default.join(exports.rootDirName, "cache", sessionId);
                            try {
                                console.log('handle command: ' + command);
                                if (command == "execute") {
                                    // fs.accessSync(filePath) // disabled to auto compile
                                    async function executeProgram() {
                                        return new Promise((resolveExectute, reject) => {
                                            // const filePath = path.join(rootDirName, "cache", sessionId, "main.exe");
                                            function runProgram() {
                                                if (clientSession.files.length == 0)
                                                    resolveExectute();
                                                const mainPromise = new Promise((resolve, reject) => {
                                                    if (!clientSession.clientsActiveFile.get(clientId)) {
                                                        onClosedProgram(-1, 0, `<span class="console-error">Please open a file first!</span>`);
                                                        return reject('No client active file');
                                                    }
                                                    if (!clientObj.editorMode.clientCompile)
                                                        buildAndRunCppSandbox(filePath, clientSession.clientsActiveFile.get(clientId), clientObj.editorMode, clientId, sessionId).then(async (res) => {
                                                            //     cwd:  path.join(rootDirName, "cache", sessionId,"clientFiles"), // we must add this for the program to have the correct directory for input files.
                                                            if (res == null)
                                                                return resolve();
                                                            if (!clientObj.getFile(res.fileName)) {
                                                                onClosedProgram(-1, 0, `<span class="console-error">Please open a file first!</span>`);
                                                                return reject('No client active file');
                                                            }
                                                            try {
                                                                clientObj.getFile(res.fileName).editorMode.sendError = (err, fatal) => {
                                                                    // printClientConsoleError(err)
                                                                    if (fatal) {
                                                                        // closeProcess(clientSession.process)
                                                                        onClosedProgram(-1, 0, `<span class="console-error">Compile error: ${err}</span>`);
                                                                        resolve();
                                                                    }
                                                                };
                                                                if (!clientObj.editorMode.isInterpreter) {
                                                                    replicateFunction((clientWs) => {
                                                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compiling program.', clientId: clientId })); // Send GDB output to the client
                                                                    });
                                                                    //execSync(`docker exec ${res.imageName} bash -c "g++ -g -O0 clientFiles/${res.fileName} -o main"`)
                                                                    await clientObj.getFile(res.fileName).editorMode.compile(res, clientObj.getFile(res.fileName), false);
                                                                    replicateFunction((clientWs) => {
                                                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compiled', clientId: clientId })); // Send GDB output to the client
                                                                    });
                                                                }
                                                                clientSession.program = await clientObj.getFile(res.fileName).editorMode.execute(res, clientObj, clientSession);
                                                                readStdio(clientSession.program, messageJSON, res).then(() => resolve());
                                                            }
                                                            catch (err) {
                                                                console.error("Failed to run docker commands: " + err);
                                                                onClosedProgram(-1, 0, `<span class="console-error">${err}</span>`);
                                                                reject(err);
                                                            }
                                                        });
                                                    else {
                                                        clientObj.openFile[0].editorMode.execute(undefined, clientObj, clientSession);
                                                        resolve();
                                                    }
                                                });
                                                return [spawnPromise, mainPromise];
                                            }
                                            runProgram()[1].then(resolveExectute)
                                                .catch(err => { });
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
                                        if (!clientObj.editorMode.clientCompile)
                                            buildAndRunCppSandbox(filePath, clientSession.clientsActiveFile.get(clientId), clientObj.editorMode, clientId, sessionId).then(async (res) => {
                                                mode = "debug"; //set mode to debug
                                                try {
                                                    clientObj.getFile(res.fileName).editorMode.sendError = (err, fatal) => {
                                                        // printClientConsoleError(err)
                                                        if (fatal) {
                                                            // closeProcess(clientSession.process)
                                                            onClosedProgram(-1, 0, `<span class="console-error">Compile error: ${err}</span>`);
                                                            return;
                                                        }
                                                    };
                                                    replicateFunction((clientWs) => {
                                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compiling program.', clientId: clientId })); // Send GDB output to the client
                                                    });
                                                    // execSync(`docker exec ${res.imageName} bash -c "g++ -g -O0 clientFiles/main.cpp -o main"`)
                                                    await clientObj.getFile(res.fileName).editorMode.compile(res, clientObj.getFile(res.fileName), true);
                                                    replicateFunction((clientWs) => {
                                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compiled', clientId: clientId })); // Send GDB output to the client
                                                    });
                                                    clientSession.gdbProcess = clientObj.getFile(res.fileName).editorMode.startDebugging(res, clientObj, clientSession);
                                                    clientSession.gdbProcess.addDataListener(onData);
                                                    if (!clientSession.gdbProcess)
                                                        throw 'invalid debug process';
                                                    addProcessToMap(sessionId, clientSession.gdbProcess);
                                                }
                                                catch (err) {
                                                    printClientConsoleError("docker error: " + err);
                                                }
                                                if (!getThisClientSession().process)
                                                    console.error('Invalid session while starting debug process');
                                                printClientConsoleDebug("started debugging process.");
                                                queueCommand(getProcessFromMap(), '-break-insert 1\n', sessionId);
                                                queueCommand(getProcessFromMap(), '-exec-run\n', sessionId);
                                                // clientSession.gdbProcess.stdout.on('data', (data) => {
                                                //     console.log("GDB Data: " + data.toString())
                                                // })
                                                // clientSession.gdbProcess.stderr.on('data', (derr) => {
                                                //     console.error("GDB Error: " + derr.toString())
                                                // }) 
                                            });
                                        else {
                                            clientSession.process = clientSession.gdbProcess = clientObj.getFile(clientObj.openFile[0].name).editorMode.startDebugging(undefined, clientObj, clientSession);
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
                                        closeProcess(clientSession.process);
                                        //  onClosedProcess()//.then(() => {
                                        printClientConsoleInfo("Closed process");
                                        replicateFunction((clientWs) => {
                                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.End, messageType: types_1.ConsoleMessageType.Output, body: "gdb", clientId: clientId })); // Send GDB output to the client
                                        });
                                    } // else  await queueCommand(getProcessFromMap() as ChildProcess,'-exec-quit', sessionId);// gdbProcess.stdin.write(message + "\n");
                                }
                                else if (command === "-exec-quit") {
                                    closeProcess(clientSession.process);
                                    //  onClosedProcess()//.then(() => {
                                    printClientConsoleInfo("Closed process");
                                    replicateFunction((clientWs) => {
                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.End, messageType: types_1.ConsoleMessageType.Output, body: "gdb", clientId: clientId })); // Send GDB output to the client
                                    });
                                }
                                else if (clientSession.gdbProcess != undefined) {
                                    console.log('queue command');
                                    // executeCommand(getProcessFromMap() as ChildProcess,'-stack-list-variables --all-values',sessionId).catch(err => console.error('queue command err: ' + err))
                                    executeCommand(getProcessFromMap(), command, sessionId).then(() => {
                                        console.log('COMMAND');
                                    }).catch(err => console.error('queue command err: ' + err));
                                }
                                else if (clientSession.program != undefined) {
                                    if (clientSession.program?.stdin?.writable) {
                                        clientSession.program?.stdin?.write(command); //program.stdin.write(message + "\n");
                                        replicateFunction((ws, id, obj) => obj.sendMessage({ input: 1 }, types_1.WebSocketMessageType.ExecuteStatus));
                                    }
                                    else
                                        console.error("stdin isnt writeable");
                                    // dataTimeout = setTimeout(() => {
                                    // }, 200);
                                    // console.log("sent to program")
                                }
                                else
                                    console.error('no process was found');
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
                ws.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Error, body: "Server execution failed: " + new Error(err) }));
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
                            process.kill(9);
                            process.addListener(('close'), (code) => {
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
            endConnectionPromise();
            clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
            // getThisClientSession()?.clients.splice(getThisClientSession()?.clients.indexOf(clientId)||-1 , 1);
            clientSession?.removeClient(clientId);
            if (isShared)
                shared.removeClient(clientId);
            //sessions.delete(sessionId);
            // if(sessions.get(sessionId)?.indexOf(clientId) === -1)  console.error("Client not found in session " + sessionId);
            //    else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(clientId) || -1, 1);
            // console.log("clients in sessions " + clientSession.clients.size)
            if (!clientSession)
                return;
            if (clientSession.clientsMap.size == 0 || clientSession == undefined) {
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
                const session = clientSession.clientsMap.size != 1 ? { isHost: clientObj.isHost, clients: clientSession.clientsMap.size } : undefined;
                if (clientObj)
                    if (clientObj.isHost) {
                        const newHost = Array.from(clientSession.clientsMap.values())[Math.floor(Math.random() * clientSession.clientsMap.size)];
                        newHost.isHost = true;
                        clientSession.hostClient = newHost;
                        newHost.sendMessage({ type: types_1.WebSocketMessageType.ColabData, colabCommand: "HOST", body: "You're now the host of this session." });
                    }
                replicateFunction((clientWs) => {
                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ColabData, ...clientInfo(clientObj), colabCommand: "DISCONECT", session, body: clientObj?.displayName + " has left." }));
                }, clientObj);
                console.info('session is still active');
                // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, body: "$: Client " + clientId + " disconnected!"});
            }
        }
        // Handle WebSocket disconnection
        ws.addEventListener("close", () => {
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
                    callback(thisClientWs, thisClientId, clientSession.clientsMap.get(thisClientId));
            });
        }
    });
});
process.addListener('exit', () => {
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
const aiIntegration_1 = require("./aiIntegration");
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
app.use(parseHTML);
let translation = undefined;
const defaultLang = 'ro-RO';
fs_1.default.readFile(path_1.default.join(exports.rootDirName, 'server', 'data', 'translations.json'), (err, data) => {
    if (err)
        throw err;
    translation = JSON.parse(data.toString());
    console.log('translations loaded, bytes:', data.byteLength);
});
function parseText(file, req) {
    if (!translation)
        throw 'invalid translation json';
    const matches = file.matchAll(/\^{[%&](.*)}/g);
    let text = file;
    const locale = function () {
        const accLang = req.cookies.ii_lang ? req.cookies.ii_lang : req.headers["accept-language"];
        if (!accLang)
            return defaultLang;
        return accLang.split(',').map(param => param.split(';')[0]);
    }()[0];
    for (const matchobj of matches) {
        const match = matchobj[1];
        const key = matchobj[0];
        if (key.startsWith('^{%')) {
            if (!translation[match])
                continue;
            const expr = translation[match][locale] ? translation[match][locale] : translation[match][defaultLang] ? translation[match][defaultLang] : '';
            if (expr != '' && expr !== undefined)
                text = text.replaceAll(key, expr);
            else if (translation[match][defaultLang])
                text = text.replaceAll(key, translation[match][defaultLang]);
            else
                console.error('invalid translation id', match);
        }
        else if (key.startsWith('^{&file:')) {
            const filePath = match.split(":")[1];
            if (!filePath)
                throw 'invalid file path';
            const file = fs_1.default.readFileSync(path_1.default.resolve(exports.rootDirName, 'public', filePath)).toString();
            text = text.replaceAll(key, parseText(file, req));
        }
    }
    return text;
}
function parseHTML(req, res, next) {
    const filePath = req.path.endsWith('/') || req.path.endsWith('\\') ? 'index.html' : req.path;
    const fullPath = path_1.default.join(exports.rootDirName, 'public', filePath);
    const ext = filePath.split('.').at(-1) ? filePath.split('.').at(-1) : 'text';
    if (ext != 'html') {
        res.sendFile(fullPath);
        return;
    }
    // fs.createReadStream(fullPath) // use read streams
    try {
        fs_1.default.readFile(fullPath, (err, file) => {
            if (err)
                throw err;
            res.contentType(ext).send(parseText(file.toString(), req));
        });
    }
    catch (err) {
        console.error(err);
        // res.statusCode(404).send(err)
        res.sendFile(fullPath);
        return;
    }
}
app.use(handle404);
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});
