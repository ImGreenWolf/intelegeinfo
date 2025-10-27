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
exports.wss = exports.sessionMap = exports.runningProcesses = exports.clients = exports.server = exports.tokenCookieName = exports.sqid = exports.rootDirName = void 0;
exports.authMiddleware = authMiddleware;
exports.handlePrismaError = handlePrismaError;
exports.newWSS = newWSS;
exports.sendFile = sendFile;
exports.parseText = parseText;
exports.parseHTML = parseHTML;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const ws_1 = __importDefault(require("ws"));
const path_1 = __importDefault(require("path"));
const types_1 = require("../../dist/shared/types");
const types_2 = require("./types");
const qrcode = __importStar(require("qrcode"));
const archiver_1 = __importDefault(require("archiver"));
exports.rootDirName = path_1.default.resolve("./"); //'C:\Users\radub_qd\intelegeinfo')
const sqids_1 = __importDefault(require("sqids"));
// import {RedisStore} from "connect-redis"
// // import {Redis} from "redis"
// import Redis, { Cluster } from 'ioredis';
// import session from "express-session"
// import { v4 as uuidv4 } from 'uuid';
const app = (0, express_1.default)();
const compression = require('compression');
var websocketReg = new Map();
exports.sqid = new sqids_1.default({
    alphabet: 'abcdefghijklmnopqrstuvwxyz',
    minLength: 6
});
exports.tokenCookieName = 'iiauthtoken';
const sessionStore_1 = __importDefault(require("./sessionStore"));
const prisma_1 = require("../../generated/prisma");
const dbClient_1 = __importDefault(require("./dbClient"));
const login_js_1 = __importStar(require("./login.js"));
const signup_js_1 = __importDefault(require("./signup.js"));
const profile_js_1 = __importDefault(require("./profile.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const users = __importStar(require("./usersManager"));
const courses_1 = __importDefault(require("./views/courses"));
const challangesManager_1 = __importDefault(require("./challanges/challangesManager"));
const usersManager_1 = require("./usersManager");
const guideCreator_1 = __importDefault(require("./guideCreator"));
const Nodepty = __importStar(require("node-pty"));
const crypto_1 = __importDefault(require("crypto"));
const EditorModes = __importStar(require("./editor-modes/"));
const metrics_1 = __importStar(require("./metrics"));
const examSubjects_1 = __importDefault(require("./examSubjects"));
const tx2_1 = __importDefault(require("tx2"));
const types_3 = require("../../dist/shared/types");
const problemManager_1 = __importStar(require("./problemManager"));
const classManager_1 = __importDefault(require("./classManager/classManager"));
const gdb_mi_parser_1 = __importDefault(require("gdb-mi-parser"));
app.use(compression());
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        req.rawBody = buf; // Save raw body
    }
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use('/user', usersManager_1.router);
app.use('/login', login_js_1.default);
app.use('/signup', signup_js_1.default);
app.use('/profile', authMiddleware, profile_js_1.default);
app.use('/vnc', express_1.default.static(path_1.default.join(exports.rootDirName, 'vnc', 'noVNC')));
app.use('/metrics', metrics_1.default);
app.use('/classes', classManager_1.default);
app.use('/courses', courses_1.default);
app.use('/subiecte', examSubjects_1.default);
app.use('/interview', challangesManager_1.default);
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
app.use('/client/scripts', express_1.default.static(path_1.default.join(exports.rootDirName, 'dist', 'public')));
app.use('/client/modules', express_1.default.static(path_1.default.join(exports.rootDirName, 'node_modules')));
app.use('/editor/codeEditor.js', express_1.default.static(path_1.default.join(exports.rootDirName, 'dist', 'public', 'codeEditor.js')));
app.use('/editor/components.js', (req, res) => {
    try {
        fs_1.default.readFile(path_1.default.join(exports.rootDirName, 'dist', 'public', 'components.js'), (err, data) => {
            const renderer = data.toString();
            let newRender = renderer;
            //  TODO Improve this system
            const userId = users.getIdFromJWT(req);
            if (userId)
                users.getUserData(userId).then((userdata) => {
                    if (!userdata)
                        throw 'invalid user';
                    newRender = newRender.replaceAll(`loggedIn = false`, `loggedIn = true`).replaceAll(`const username = ''`, `const username = "${userdata.username}"`);
                    res.contentType('js').send(newRender);
                }).catch(err => (0, login_js_1.clearAuthCookies)(res).contentType('js').send(newRender));
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
        let text = file.toString();
        const userId = users.getIdFromJWT(req);
        const logged = userId != undefined;
        if (logged) {
            users.updateActiveAtForUser(userId).then((userdata) => {
                if (!userdata) {
                    res.contentType('html').send(text);
                    return;
                }
                text = text.replace('#{login}', ` <li><button class="share-session" onclick="window.editor.listProjects()" id='listProjects'>Projects</button></li>\n<li><a href='/profile'>Hey <p class='user-name'>${userdata?.username}</p><div class='focus-line'></div></a></li>`);
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
app.post('/feedback', async (req, res) => {
    const { body } = req.body;
    const userId = users.getIdFromJWT(req);
    dbClient_1.default.feedback.create({
        data: {
            body,
            userId
        },
        include: {
            user: true
        }
    }).then(async (feedback) => {
        if (!await users.transporter.verify()) {
            res.send('Am primit feedbackul tau!');
            return;
        }
        const logoSvg = fs_1.default.readFileSync(path_1.default.join(exports.rootDirName, 'public', 'media', 'logoText.svg'));
        const logoData = `<img src="data:image/svg+xml;base64,${logoSvg.toString('base64url')}">`;
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
            html: `
            ${logoData}
            <p>
                Am primit feedback #${feedback.id} pe ${feedback.createdAt.toLocaleString()} de la ${feedback.user.firstName} ${feedback.user.lastName} cu userId ${feedback.user.id}:
            </p>
            <br>
             <pre>${feedback.body}</pre>
            `
        });
        res.send('Am primit feedbackul tau! Iti multumim!');
    }).catch(err => res.send("Eroare.. " + err));
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
            throw 'invalid input';
        if (exports.sessionMap.has(id)) {
            const { chat, codePermission, voice, sandbox, externals, anonymous, language } = req.body;
            const session = exports.sessionMap.get(id);
            session.makeSessionPublic({ enableChat: checkboxValue(chat),
                editorPermission: codePermission,
                enableVoice: checkboxValue(voice),
                sandboxUsers: checkboxValue(sandbox),
                externalLinks: checkboxValue(externals),
                anonymousNames: checkboxValue(anonymous),
                allowedLanguage: EditorModes.modes.find(mode => mode.name == language) });
            if (session.isPublic) {
                res.status(200).send(session.joinCode);
                return;
            }
            res.status(201).send(session.joinCode);
            return;
        }
        else
            throw '';
    }
    catch (err) {
        res.status(500).send(err);
    }
});
app.get('/editor/languages', (req, res) => {
    const languages = [];
    for (const mode of EditorModes.modes) {
        languages.push({ name: mode.name, src: mode.logoSrc, color: mode.color, description: mode.description, versions: mode.versions, ext: mode.extension[0], });
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
    const token = users.getJWT(req);
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
        (0, login_js_1.clearAuthCookies)(res).status(403).json({ error: 'Invalid token' });
    }
}
function handle404(req, res, next) {
    res.status(404);
    if (req.accepts('html'))
        res.sendFile(path_1.default.join(exports.rootDirName, '/public/pages/notfound.html'));
    else
        res.json('Oops! Page not found.');
}
function handlePrismaError(error) {
    if (!(error instanceof prisma_1.Prisma.PrismaClientKnownRequestError) || !error.clientVersion)
        return error;
    else
        switch (error.code) {
            case 'P2025':
                return 'Nu am gasit clasa pe care o cauti! Verifica daca ai linkul corect sau daca clasa chiar exista..';
            case 'P2002':
                return 'Deja te-ai alaturat acestei clase.';
            case '401':
                return 'Trebuie sa fi logat pentru a face aceasta actiune!';
            default:
                return error.message;
        }
}
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
    // exec('docker image prune -f -a')
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
let httpMeter = tx2_1.default.counter('http connections');
var httpsServer = https.createServer(credentials, app);
if (fullchain && privkey)
    var httpServer = http.createServer(process.env.NODE_ENV != 'production' ? app : (req, res) => {
        res.statusCode = 301;
        res.setHeader('Location', 'https://' + req.headers.host + req.url);
        res.end();
        httpMeter.inc(1);
    });
else
    var httpServer = http.createServer(app);
let connectionPromise;
let connectionPromiseTimeout;
const codeMap = new Map();
const unsecureServer = httpServer.listen(PORT);
const secureServer = httpsServer.listen(SECPORT);
exports.server = process.env.NODE_ENV == 'development' ? unsecureServer : secureServer;
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
function newWSS(path) {
    const wss = new ws_1.default.Server({ noServer: true });
    if (!websocketReg)
        console.error('invalid websocket reg');
    websocketReg.set(path, wss);
    return wss;
}
exports.server.on('upgrade', function upgrade(request, socket, head) {
    const { pathname } = new URL(request.url, 'wss://intelegeinfo.ro');
    switch (pathname) {
        case '/api':
            metrics_1.wssAPI.handleUpgrade(request, socket, head, function done(ws) {
                metrics_1.wssAPI.emit('connection', ws, request);
            });
            break;
        case '/directSharing':
            peerConnectionManager_1.wssFS.handleUpgrade(request, socket, head, function done(ws) {
                peerConnectionManager_1.wssFS.emit('connection', ws, request);
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
            if (!websocketReg || !websocketReg.has(pathname))
                socket.destroy();
            const routedWS = websocketReg.get(pathname);
            routedWS.handleUpgrade(request, socket, head, function done(ws) {
                routedWS.emit('connection', ws, request);
            });
    }
});
//@ts-ignore
let meter = tx2_1.default.counter('users');
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
        console.log("Async removing previous sandbox builds...");
        (0, child_process_1.exec)(`docker system prune`, { timeout: 3000 }, (err, data) => console.log(data));
        console.log("Removing previous sandbox containers: " + (0, child_process_2.execSync)(`docker ps ${filter} -q |  xargs --no-run-if-empty docker rm --force | docker system prune`, { timeout: 5000 }));
    });
}
function getClientFilesPath(sessionId) {
    return path_1.default.join(exports.rootDirName, "cache", sessionId, "clientFiles");
}
function updateUserMeter() {
    meter.reset();
    meter.inc(exports.wss.clients.size);
}
async function loadShareProject(shareId) {
    if (!shareId)
        throw 'cant load project: no id was supplied, or is invalid';
    return await dbClient_1.default.sharedProject.update({
        where: {
            id: shareId
        },
        data: {
            openedAt: new Date()
        },
        include: {
            Project: {
                include: {
                    files: true
                }
            },
            createdBy: {
                select: {
                    userColor: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    id: true
                }
            }
        }
    });
}
const baseUrl = 'https://intelegeinfo.ro';
exports.wss.addListener('connection', async (ws, req) => {
    updateUserMeter();
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
            .find((c) => c.startsWith(exports.tokenCookieName + "="))
            ?.split("=")[1];
    }
    const recoveredSession = cookies
        ?.split("; ")
        .find((c) => c.startsWith(types_3.sessionCookieName + "="))
        ?.split("=")[1];
    let userData;
    let userLoggedIn = false;
    users.updateActiveAtForUser(users.getClientId(jwtCookie)).then((userdata) => {
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
        async function loadProject(saveId, creatorId) {
            if (!saveId)
                throw 'cant load project: no id was supplied, or is invalid';
            return dbClient_1.default.savedProject.findUnique({
                where: {
                    id: saveId
                },
                include: {
                    Project: {
                        include: {
                            files: true
                        }
                    },
                    createdBy: {
                        select: {
                            userColor: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            id: true
                        }
                    }
                }
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
                                clientId = (getThisClientSession() || clientSession)?.spawnClient(ws, urlParams.get('displayName'), userData);
                                clientObj = getThisClientSession().getClientObjectById(clientId);
                                exports.clients.set(clientId, ws);
                                isHost = false;
                                // printClientConsoleDebug('joining session: ' + clientSession.sessionId)
                            }
                            else // there is no session, create it.
                             {
                                //getThisClientSession()?.clients.push(clientId); // add client to client list.
                                clientSession = createThisClientSession(wssessionId);
                                clientId = getThisClientSession()?.spawnClient(ws, urlParams.get('displayName'), userData);
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
                                clientId = getThisClientSession()?.spawnClient(ws, urlParams.get('displayName'), userData);
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
            if (clientObj?.getActiveFile())
                return clientObj.getActiveFile().process;
            else
                return undefined;
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
        function isUserSandboxed(client = clientObj) {
            return clientSession.editorOptions.sandboxUsers == true && !client.isHost;
        }
        function getFilesForClient(client = clientObj) {
            let files = isUserSandboxed() ?
                clientSession.files.filter(file => file.linkedUser && file.linkedUser.displayName == client.displayName)
                :
                    clientSession.files;
            return files;
        }
        function getFilesNamesForClient(client = clientObj) {
            return getFilesForClient(client).map(file => { return file.name; });
        }
        function sendConnectionMessage(isHost, fileContent) {
            // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, messageType: ConsoleMessageType.SessionInfo, body: "Client " + clientObj?.displayName + " joined!"});
            if (!clientSession)
                return;
            const session = clientSession.clientsMap.size != 1 ? clientObj.permissions : undefined; //clientObj.isHost
            const welcomeMessage = isEmbededEditor ? sameOrigin ? "Editorul de cod intelegeinfo " : "Powered by <a href='https://intelegeinfo.ro'>intelegeinfo.ro</a>" : !userLoggedIn ?
                `Bine ai venit pe Intelege Info!
     Scrie cod, apoi ruleaza-ti codul apasand butonul mare auriu, sau ruleaza in debugger.
      Invita-ti elevii sau prietenii să editeze codul împreună cu tine în timp real apăsând butonul SHARE.`
                :
                    `Ne pare bine sa te revedem, ${userData?.username}!<br>
        Poti salva codul tau apasand pe butonul save.`;
            // await sendListFiles(clientFilesPath)
            const files = getFilesNamesForClient();
            const users = clientSession.clients.map(val => { return clientInfo(val); });
            // Send initial message to client
            const message = { type: types_1.WebSocketMessageType.Handshake,
                ...clientInfo(),
                messageType: types_1.ConsoleMessageType.Info,
                sessionId: sessionId,
                body: welcomeMessage,
                project: clientSession.savedProject,
                share: clientSession.sharedProject,
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
        function clientInfo(thisclientObj) {
            if (!clientObj && !thisclientObj)
                return;
            if (!thisclientObj)
                thisclientObj = clientObj;
            if (thisclientObj)
                return { clientId: thisclientObj.clientId, accountId: thisclientObj.clientData ? thisclientObj.clientData.id : undefined, displayName: thisclientObj.displayName, color: thisclientObj.color, openFile: thisclientObj.getFilesName(), isHost: clientObj.isHost };
            // JSON.parse(`{"${prefix}clientId": "${thisclientObj.clientId}", "${prefix}displayName": "${thisclientObj.displayName}", "${prefix}color": "${thisclientObj.color}", "${prefix}openFile": "${thisclientObj.openFileName}"}`)
            else
                return { clientId: clientId, accountId: thisclientObj.clientData ? thisclientObj.clientData.id : undefined, displayName: clientObj.displayName, color: clientObj.color, openFile: clientObj.getFilesName(), isHost: clientObj.isHost };
        }
        async function loadSave(saveUUID, clientObj) {
            if (saveUUID == undefined)
                return;
            const projectId = exports.sqid.decode(saveUUID)[0];
            if (!projectId)
                return;
            onLoadProject(clientObj, await loadProject(projectId, clientObj.clientData.id), false);
        }
        async function loadShare(saveUUID, clientObj) {
            if (saveUUID == undefined)
                return;
            const projectId = exports.sqid.decode(saveUUID)[0];
            if (!projectId)
                return;
            const sharedProj = await loadShareProject(projectId);
            clientSession.sharedProject = sharedProj;
            onLoadProject(clientObj, sharedProj, true);
        }
        function onLoadProject(clientObj, savedProject, isPublic) {
            try {
                if (!clientObj.clientData && !isPublic) {
                    throw { message: 'Nu ai access la acest proiect sau nu esti logat.' };
                }
                if (!savedProject.Project)
                    throw { message: "Am intampinat o eroare..." };
                fs_1.default.mkdirSync(clientFilesPath, { recursive: true });
                if (savedProject.Project.files.length != 0 && savedProject.Project.fileUUID == null) {
                    clientSession.files = savedProject.Project.files.map(file => new types_2.EditorFile(clientSession, file.name, file.content));
                    clientSession.savedProject = savedProject.Project;
                    return;
                }
                else {
                    fs_1.default.cpSync(path_1.default.join(exports.rootDirName, "saved", savedProject.Project.fileUUID), path_1.default.join(exports.rootDirName, "cache", sessionId), { recursive: true });
                    clientSession.savedProject = savedProject.Project;
                    clientSession.files = fs_1.default.readdirSync(clientFilesPath).flatMap((file) => { return new types_2.EditorFile(clientSession, file, fs_1.default.readFileSync(path_1.default.join(clientFilesPath, file)).toString()); });
                    dbClient_1.default.project.update({
                        where: {
                            id: savedProject.Project.id,
                        },
                        data: {
                            files: {
                                connectOrCreate: clientSession.files.map(file => {
                                    return {
                                        where: {
                                            name_projectId: {
                                                name: file.name,
                                                projectId: savedProject.Project.id
                                            }
                                        },
                                        create: {
                                            content: file.content,
                                            name: file.name,
                                        }
                                    };
                                })
                            }
                        }
                    }).then(res => console.log(res));
                }
            }
            catch (err) {
                printClientConsoleInfo(handlePrismaError(err).message);
            }
        }
        async function connectionReady(cooperator = false, req) {
            const sessionCheck = await new Promise(async (resolve, reject) => {
                const urlParams = new URL("ws:/intelegeinfo.ro:8080" + req.url).searchParams;
                const clientFilesPath = clientSession.getClientFilesPath();
                const isHost = !cooperator; // added for readability
                let savedProject;
                if (urlParams.has("save"))
                    await loadSave(urlParams.get('save'), clientObj);
                else if (urlParams.has("share"))
                    await loadShare(urlParams.get('share'), clientObj);
                // printClientConsoleInfo("connected to worker: " + process.pid)
                //create cache folder for session if its a new one
                const cacheFolderExists = fs_1.default.existsSync(path_1.default.join(exports.rootDirName, "cache", sessionId));
                if ((!cacheFolderExists && isHost && clientSession.files.length == 0)) {
                    if (clientSession.files.length == 0 && cacheFolderExists && isHost && savedProject == undefined) {
                        fs_1.default.rmSync(clientFilesPath, { recursive: true, force: true });
                        console.log('deteled existing session folder');
                    }
                    const err = undefined;
                    fs_1.default.mkdirSync(clientFilesPath, { recursive: true });
                    if (err) {
                        console.error("Error creating cache folder:", err);
                        return;
                    }
                    const session = sendConnectionMessage(!cooperator, '');
                    resolve(session);
                }
                else {
                    // load files from existing session
                    console.warn("Cache folder already exists for sessionId " + sessionId);
                    // load project files
                    if (cacheFolderExists && isHost && clientSession.files.length == 0)
                        clientSession.files = fs_1.default.readdirSync(clientFilesPath).flatMap((file) => { return new types_2.EditorFile(clientSession, file, fs_1.default.readFileSync(path_1.default.join(clientFilesPath, file)).toString(), { abstract: true }); });
                    // const session = sendConnectionMessage(!cooperator, '')
                    if (clientSession.files[0] == undefined) {
                        if (savedProject)
                            openFile(fs_1.default.readdirSync(clientFilesPath)[0]);
                        else
                            console.log('no file found in files: ', clientSession.files);
                        const session = sendConnectionMessage(!cooperator, '');
                        resolve(session);
                    }
                    else if (!getFilesForClient()[0] && clientSession.editorOptions.sandboxUsers == true) {
                        const originalName = clientSession.files[0] ? clientSession.files[0].name : 'main.cpp';
                        new types_2.EditorFile(clientSession, (originalName ? originalName : 'main.cpp'), undefined, { linkedUser: clientObj, autoOpenClient: clientObj });
                        const session = sendConnectionMessage(!cooperator, '');
                        resolve(session);
                    }
                    else if (fs_1.default.existsSync(path_1.default.join(clientFilesPath, getFilesNamesForClient()[0]))) // not needed? 
                        getFilesForClient()[0].openFile(clientObj, shared)
                            .then((fileContent) => {
                            const session = sendConnectionMessage(!cooperator, fileContent);
                            console.log('Opened file');
                            resolve(session);
                        });
                    // else 
                    // reject("No default file was found!") // TODO replace with async function
                    // resolve(session)
                }
            });
            if (getThisClientSession()?.clientsMap.size > 1) // multiple clients connected to this session
             {
                // display join message
                replicateFunction((clientWs, LocalclientId) => {
                    printClientConsoleSessionInfo(clientObj?.displayName + " s-a alaturat sesiunii!", getThisClientSession().getClientObjectById(LocalclientId));
                }, clientObj);
                let displayNames = [];
                getThisClientSession()?.clientsMap.forEach((client, id) => {
                    if (!client.openFile)
                        throw 'invalid file';
                    if (client != clientObj)
                        displayNames.push({ displayName: client.displayName, fileName: client.getFilesName(), clientId: client.clientId, color: client.color });
                });
                replicateFunction((clientws) => {
                    clientws.send(JSON.stringify({ type: types_1.WebSocketMessageType.ColabData, colabCommand: "JOIN", client: clientInfo(clientObj), permissions: sessionCheck })); // Send GDB output to the client
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
            try {
                const buffer = sanitizeGdbOutput(data);
                // Check if the full response has arrived
                function sanitizeGdbOutput(buf) {
                    // Always work with a Buffer
                    if (!Buffer.isBuffer(buf))
                        buf = Buffer.from(buf);
                    return buf.toString('utf8')
                        // Replace NUL with \0
                        .replace(/\x00/g, '\\0')
                        // Replace other control chars (except \n, \r, \t) with hex escapes
                        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, c => '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0'));
                }
                // if(!buffer)
                //     return
                // if (buffer.indexOf('\0') !== -1) return false;
                // const nonPrint = (buffer.match(/\\\\/g) || []).length;
                // // If more than 1% non-printable, treat as binary
                // console.log(nonPrint, Math.max(1, buffer.length))
                // if(nonPrint / Math.max(1, buffer.length) > 0.01)
                //     return 
                if (false) {
                    // We have everything, remove listener
                    // (childProcess.stdout as NodeJS.ReadableStream).removeListener("data", onData);
                    for (const element of buffer.split('\n')) {
                        if (element.trim() != '') {
                            const gdbOutput = (0, gdbUtilities_1.parseGDBString)(element);
                            if (JSON.stringify(gdbOutput.json) == '{}')
                                continue;
                            if (gdbOutput.json['exit-code'] != undefined || gdbOutput.json.reason == 'exited-normally') {
                                closeProcess(clientObj.getActiveFile().process);
                                return;
                            }
                            // if(!['stopped', 'done'].some(val => gdbOutput.json.message && gdbOutput.json.message.includes(val)))
                            //     continue
                            // if( gdbOutput.ignore)
                            //     return
                            //  console.log(JSON.stringify(gdbOutput.json), gdbOutput.err)
                            const response = {
                                type: types_1.WebSocketMessageType.Debug,
                                state: "running",
                                body: gdbOutput ? gdbOutput.json : undefined,
                                line: gdbOutput.json?.frame?.line ? gdbOutput.json.frame.line : undefined,
                                variables: gdbOutput.json?.variables ? gdbOutput.json.variables : undefined,
                                // raw: element
                                // error: gdbOutput.err ? gdbOutput.err : undefined,
                                // input: false,
                                // type: WebSocketMessageType.Output,
                                // messageType: ConsoleMessageType.DebugProgram,
                                // clientId: clientId,
                                // body: gdbOutput.json ? gdbOutput.json : undefined,
                                // raw: element,
                                // message: 'next', //deprecated - remove
                                // msgId: clientObj.getActiveFile().debugProgram?.pid || -1,
                                // line: gdbOutput.json?.frame?.line ? gdbOutput.json.frame.line : undefined,
                                // variables: gdbOutput.json?.variables ? gdbOutput.json.variables : undefined  
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
                    }
                    ;
                    // }
                }
                else {
                    for (const element of buffer.split('\n'))
                        if (element.trim() != '') {
                            const parsed = (0, gdb_mi_parser_1.default)(element);
                            const response = {
                                type: types_1.WebSocketMessageType.Debug,
                                state: "running",
                                body: parsed,
                                line: parseInt(parsed.outOfBandRecords[0]?.result?.frame?.line ?? undefined) ?? undefined,
                                variables: parsed.resultRecord?.result?.variables ?? undefined,
                            };
                            if (parsed.outOfBandRecords[0]?.class == 'thread-group-exited') {
                                closeProcess(clientObj.getActiveFile()?.process);
                                return;
                            }
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
                }
            }
            catch (error) {
                console.error('Error while debugging:', error);
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
                    clientObj.sendMessage({ type: types_1.WebSocketMessageType.FileManagement, body: { command: types_3.FileManagementCommands.List, content: getFilesNamesForClient() } }); // Send the list of files to the client
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
        function replicateProcessCheck(obj) {
            if (obj && clientObj.getActiveFile())
                return clientObj.getActiveFile().getClients().find(client => client.clientId == obj.clientId) != undefined;
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
                const sandboxFolder = path_1.default.join(sessionFolder, "clientFiles");
                if (!fs_1.default.existsSync(sandboxFolder)) {
                    console.error(`Sandbox folder does not exist: ${sandboxFolder}`);
                    return reject();
                }
                if (!editorMode) {
                    printClientConsoleInfo("File can't be executed!");
                    return reject("File can't be executed! Editor mode is invalid");
                }
                const imageTag = buildTag + "_" + editorMode.dockerSafeTag;
                clientSession.currentbuildTag = imageTag;
                if (clientSession.sessionContainer?.process) {
                    console.log('Container already exists');
                    resolve({
                        imageName: clientSession.sessionContainer.imageName,
                        process: clientSession.sessionContainer.process,
                        editorMode: clientObj.getActiveFile().editorMode,
                        fileName: clientObj.getActiveFile().name
                    });
                    return;
                }
                // Check if image exists
                let imageExists = false;
                try {
                    const result = (0, child_process_2.execSync)(`docker images -q ${imageTag}`).toString().trim();
                    imageExists = !!result;
                }
                catch (err) {
                    imageExists = false;
                }
                // Build image if not exists
                if (!imageExists) {
                    const dockerfileContents = editorMode.dockerFile.trim();
                    const dockerfilePath = path_1.default.join(sessionFolder, "Dockerfile");
                    fs_1.default.writeFileSync(dockerfilePath, dockerfileContents);
                    console.log(`Building Docker image: ${imageTag}`);
                    replicateFunction((ws, id, obj) => obj.sendMessage({ body: "Vă rugăm așteptați.. Pregătim mediul de rulare." }, types_1.WebSocketMessageType.ExecuteStatus));
                    try {
                        await new Promise((resolveBuild, rejectBuild) => {
                            const builder = (0, child_process_1.spawn)("docker", ["build", "-t", imageTag, sessionFolder], { stdio: "pipe", shell: true });
                            builder.stdout.on("data", (data) => console.log(data.toString()));
                            builder.stderr.on("data", (data) => console.error(data.toString()));
                            builder.on("exit", (code) => {
                                if (code === 0)
                                    resolveBuild();
                                else
                                    rejectBuild("Failed to build Docker image");
                            });
                            builder.on("error", (err) => {
                                rejectBuild("Error building Docker image:" + err);
                                onClosedProgram(-1, 0, `<span class="console-error">${err}</span>`);
                            });
                        });
                    }
                    catch (error) {
                        onClosedProgram(-1, 0, `<span class="console-error">${error}</span>`);
                        return reject(error);
                    }
                }
                // Run container
                const imageName = `session-container-${sessionId}`;
                const hasGUI = clientObj.getActiveFile().name.toLowerCase().includes("gui") || false;
                const cmdArgs = [
                    "run",
                    "--name",
                    imageName,
                    "-v",
                    `${sessionFolder}:/app`,
                    "-w",
                    "/app",
                    ...(process.env.DISABLE_CONTAINER_LIMITS == "false"
                        ? [
                            "-m",
                            `${512 * parseInt(process.env.CONT_MEM_MUlTI || "1")}MB`,
                            `--cpus=${0.5 * parseInt(process.env.CONT_MEM_MUlTI || "1")}`,
                        ]
                        : []),
                    "-a",
                    "stdin",
                    "-a",
                    "stdout",
                    "-it",
                    "--rm",
                    clientObj.getActiveFile().editorMode.runParams(clientObj),
                    imageTag,
                    "bash",
                ].filter(Boolean);
                console.log(`Running Docker container ${imageName} with access to ${sandboxFolder}`);
                const childProcess = Nodepty.spawn("docker", cmdArgs, {
                    name: "xterm-color",
                    cols: 80,
                    rows: 30,
                    cwd: process.cwd(),
                    env: process.env,
                });
                clientSession.sessionContainer = {
                    process: childProcess,
                    imageName,
                    fileName,
                    editorMode: clientObj.getActiveFile().editorMode,
                };
                setTimeout(async () => {
                    replicateFunction((ws, id, obj) => {
                        if (replicateProcessCheck(obj))
                            obj.sendMessage({ status: "container-spawn" }, types_1.WebSocketMessageType.ExecuteStatus);
                    });
                    if (hasGUI && clientSession.displayServer == 0) {
                        clientSession.displayServer = await clientSession.sessionContainer.editorMode.onBuild(clientSession.sessionContainer, clientSession, clientObj);
                    }
                    resolve(clientSession.sessionContainer);
                }, 100);
                childProcess.onData((e) => {
                    console.log(e);
                    replicateFunction((ws, client, obj) => {
                        if (replicateProcessCheck(obj))
                            obj.sendMessage({ type: types_1.WebSocketMessageType.Console, action: "container", body: e.toString() });
                    });
                });
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
        if (clientSession)
            clientSession.executeProblemChecker = executeProblemChecker;
        else
            console.error('INVALID SESSION WHILE SETTING PROBLEM CHECKER');
        async function onClosedProgram(code, time, message, error) {
            let notes = "";
            processInputBuffer = '';
            replicateFunction((clientWs, id, localClientObj) => {
                if (replicateProcessCheck(localClientObj))
                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.End, messageType: types_1.ConsoleMessageType.Output, time, notes, body: '\n' + message.trim(), clientId: clientId })); // Send GDB output to the client
            });
            if (code != 0)
                return;
            if (new Blob([gdbBuffer]).size > 64000) // 1000000 is 1Mb
             {
                await new Blob([gdbBuffer]).slice(0, 64000).text().then(str => {
                    notes = "buffer exceeded 64kb, output was truncated.";
                    replicateFunction((clientWs, id, localClientObj) => {
                        if (replicateProcessCheck(localClientObj))
                            clientWs.send(JSON.stringify({ messageType: types_1.ConsoleMessageType.Output, type: types_1.WebSocketMessageType.Output, body: str.toString(), clientId: clientId })); // Send GDB output to the client
                    });
                });
            }
        }
        async function readStdio(program, messageJSON, res) {
            return new Promise((resolve, reject) => {
                // addProcessToMap(sessionId, program); // add to process map
                mode = "run";
                let spawnDate = performance.now();
                let programTimeout;
                gdbBuffer = "";
                let errorBuffer = '';
                if (messageJSON.textMode)
                    programTimeout = setTimeout(() => {
                        onClosedProgram(-1, (performance.now() - spawnDate), "<span style='color: red'>Program timed out!</span>");
                        closeProcess(program);
                        resolve();
                    }, 1000);
                spawnPromise = new Promise((resolve, reject) => {
                    spawnDate = performance.now();
                    // on spawn process
                    res.editorMode.onSpawn(clientSession);
                    // send on spawn process message
                    replicateFunction((ws, id, remoteClientObj) => {
                        if (replicateProcessCheck(remoteClientObj))
                            remoteClientObj.sendMessage({ status: 'spawn', type: types_1.WebSocketMessageType.ExecuteStatus, fileName: res.fileName, clientId }, types_1.WebSocketMessageType.ExecuteStatus);
                    });
                    if (processInputBuffer)
                        clientObj.getActiveFile().program.write(processInputBuffer); // write buffer
                    if (!clientSession.fileWatcher) {
                        clientSession.fileWatcher = fs_1.default.watch(path_1.default.join(clientSession.getClientFilesPath()), null, (event, fileNameBuf) => {
                            const fileName = fileNameBuf.toString();
                            if (!fileName)
                                throw new Error('Invalid file name in watcher');
                            const changedFile = clientSession.files.find(file => file.name == fileName);
                            if (!changedFile) {
                                console.error('Couldnt find file to update in watcher.');
                                if (event == 'rename') {
                                    new types_2.EditorFile(clientSession, fileName, null, { abstract: true });
                                    console.warn('Created new file from rename event!');
                                }
                            }
                            changedFile.onFileWatched(event, clientObj);
                        });
                    }
                    resolve();
                });
                clientObj.getActiveFile().program.onData((data) => {
                    if (new Blob([gdbBuffer]).size > 64000) // 1000000 is 1Mb
                     {
                        closeProcess(program).then(() => onClosedProgram(-1, (performance.now() - spawnDate), "<span style='color: red'>Program buffer size excedded!</span>"));
                        resolve();
                    }
                    replicateFunction((clientWs, id, localClientObj) => {
                        if (replicateProcessCheck(localClientObj))
                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.Output, messageType: types_1.ConsoleMessageType.Output, body: data.toString(), clientId: clientId })); // Send GDB output to the client
                    });
                });
                clientObj.getActiveFile().program.onExit(({ exitCode }) => {
                    clearTimeout(programTimeout);
                    switch (exitCode) {
                        default:
                            if (errorBuffer) {
                                onClosedProgram(exitCode, (performance.now() - spawnDate), "Programul a iesit cu eroarea: " + errorBuffer.trim());
                                break;
                            }
                        case 0:
                            onClosedProgram(exitCode, (performance.now() - spawnDate), "Programul a iesit cu codul: " + (exitCode?.toString() || '-1'));
                            break;
                        case 136:
                        case 138:
                            onClosedProgram(exitCode, (performance.now() - spawnDate), "Programul a iesit cu eroare: <a href='/guides/aritmethicoperation?session=" + sessionId + "' title=Learn how to fix here. | Error code: " + exitCode?.toString() + ">Arithmetic devided by 0</a>", true);
                            break;
                        case 139:
                            onClosedProgram(exitCode, (performance.now() - spawnDate), "Programul a iesit cu eroare: <a href='/guides/aritmethicoperation?session=" + sessionId + "' title=Learn how to fix here. | Error code: " + exitCode?.toString() + ">Segmentation Fault</a>", true);
                            break;
                        case 3221225477:
                            onClosedProgram(exitCode, (performance.now() - spawnDate), "Programul a iesit cu eroare: <a href='/guides/errors/memaccessviolation?session=" + sessionId + "' title=Learn how to fix here. | Error code: " + exitCode?.toString() + ">MEMMORY ACCESS VIOLATION!</a>", true);
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
                                const target = messageJSON.target.split('.').at(-1);
                                if (!messageJSON.fileName)
                                    break;
                                const targetMode = EditorModes.modes.find(mode => mode.name === target || mode.extension.includes(target));
                                if (targetMode)
                                    (0, aiIntegration_1.transpileCode)(clientObj, clientObj.openFile.find(file => file.name === messageJSON.fileName), targetMode).then(val => {
                                        ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.Utilities, util: messageJSON.util, response: val, fileName: messageJSON.fileName, target: messageJSON.target }));
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
                                clientObj.getActiveFile().editorMode.receiveWebCam(messageJSON.buffer);
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
                        switch (messageJSON.action) {
                            default:
                            case 'process':
                                if (clientObj.getActiveFile().process) {
                                    if (clientObj.getActiveFile().debugProgram) {
                                        clientObj.getActiveFile().debugProgram.sendProgramInput(messageJSON.command);
                                        replicateFunction((ws, id, obj) => obj.sendMessage({ input: 1 }, types_1.WebSocketMessageType.ExecuteStatus));
                                    }
                                    else if (clientObj.getActiveFile().program) {
                                        clientObj.getActiveFile().program.write(messageJSON.command);
                                    }
                                }
                                else
                                    processInputBuffer += messageJSON.command + "\n";
                                // replicateFunction((clientWs) => {
                                //     clientWs.send(JSON.stringify({type: WebSocketMessageType.Console, messageType: ConsoleMessageType.Console,  body: messageJSON.command, clientDisplayName: clientObj?.displayName, clientId: clientId}));  // Send GDB output to the client
                                // });
                                break;
                            case 'container':
                                if (!(clientObj.clientData && clientObj.clientData.emailValidated == true)) {
                                    clientObj.sendMessage({ type: types_1.WebSocketMessageType.Console, action: 'container', body: "Va rugam sa va logati inainte de a accesa terminalul mediului de executare. Prin terminal, puteti instala orice librarie sau package, sau executati programul direct." });
                                    return;
                                }
                                if (!clientSession.sessionContainer || !clientSession.sessionContainer.process) {
                                    clientObj.sendMessage({ type: types_1.WebSocketMessageType.Console, action: 'container', body: "Va rugam rulati programul cel putin o data inainte sa puteti executa comenzi!" });
                                    break;
                                }
                                if (!messageJSON.body)
                                    console.error('invalid body');
                                clientSession.sessionContainer.process.write(messageJSON.body);
                        }
                        break;
                    case types_1.WebSocketMessageType.Chat:
                        if (!clientObj.permissions.canChat)
                            break;
                        // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, messageType: ConsoleMessageType.UserChat,  body: messageJSON.command, clientDisplayName: clientObj?.displayName});
                        replicateFunction((clientWs) => {
                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.Chat, id: getThisClientSession().messageIndex,
                                messageType: types_1.ConsoleMessageType.UserChat, body: messageJSON.command.replaceAll("<", "&lt").replaceAll(">", "&gt"),
                                clientDisplayName: clientObj?.displayName,
                                clientId: clientId, userId: clientObj.clientData ? clientObj.clientData.id : undefined,
                                color: clientObj.color })); // Send GDB output to the client
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
                        const file = clientObj.getFile(fileName);
                        if (!file)
                            return;
                        const delta = messageJSON.delta;
                        file.changeContent({ content: messageJSON.body, delta, clientChecksum: messageJSON.checksum }, clientObj);
                        shouldSave = false;
                        if (checkSyntaxTimeout)
                            clearTimeout(checkSyntaxTimeout);
                        checkSyntaxTimeout = setTimeout(() => {
                            file.updateFile(clientObj);
                        }, 200);
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
                                clientSession.files.find(file => file.name == messageJSON.name).delete(clientObj, clientSession);
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
                            const folderPath = path_1.default.join(exports.rootDirName, "cache", sessionId);
                            try {
                                console.log('handle command: ' + command);
                                if (command == "execute") {
                                    console.table(Object.fromEntries(clientSession.files.map(file => [file.name, file.activeClients.map(client => client.displayName)])));
                                    async function executeProgram() {
                                        return new Promise((resolveExectute, reject) => {
                                            function runProgram() {
                                                if (clientSession.files.length == 0)
                                                    resolveExectute();
                                                const mainPromise = new Promise((resolve, reject) => {
                                                    if (!clientObj.getActiveFile()) {
                                                        onClosedProgram(-2, 0, `<span class="console-error">Please open a file first!</span>`);
                                                        return reject('Client appears to not have an active open file');
                                                    }
                                                    if (!clientObj.editorMode.clientCompile)
                                                        buildAndRunCppSandbox(folderPath, clientObj.getActiveFile().name, clientObj.editorMode, clientId, sessionId).then(async (res) => {
                                                            console.log(res);
                                                            if (res == null)
                                                                return resolve();
                                                            if (!clientObj.getFile(res.fileName)) {
                                                                onClosedProgram(-1, 0, `<span class="console-error">Please open a file first!</span>`);
                                                                return reject('No client active file for ' + res.fileName);
                                                            }
                                                            try {
                                                                clientObj.getFile(res.fileName).editorMode.sendError = (err, fatal) => {
                                                                    if (fatal) {
                                                                        onClosedProgram(-1, 0, `<span class="console-error">Compile error: ${err}</span>`);
                                                                        resolve();
                                                                    }
                                                                };
                                                                if (!clientObj.editorMode.isInterpreter) {
                                                                    //status update pre compile
                                                                    replicateFunction((clientWs, id, localClientObj) => {
                                                                        if (replicateProcessCheck(localClientObj))
                                                                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compilăm programul.', clientId: clientId })); // Send GDB output to the client
                                                                    });
                                                                    // compile
                                                                    await clientObj.getFile(res.fileName).editorMode.compile(res, clientObj.getFile(res.fileName), false);
                                                                    // post compile
                                                                    replicateFunction((clientWs, id, localClientObj) => {
                                                                        if (replicateProcessCheck(localClientObj))
                                                                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compilat!', clientId: clientId })); // Send GDB output to the client
                                                                    });
                                                                }
                                                                // execute
                                                                clientObj.getActiveFile().process = clientObj.getActiveFile().program = await clientObj.getFile(res.fileName).editorMode.execute(res, clientObj, clientSession);
                                                                // connect input/output
                                                                readStdio(clientObj.getActiveFile().program, messageJSON, res).then(resolve);
                                                            }
                                                            catch (err) {
                                                                console.error("Failed to run docker commands: " + err);
                                                                onClosedProgram(-1, 0, `<span class="console-error">${err}</span>`);
                                                                reject(err);
                                                            }
                                                        });
                                                    else {
                                                        clientObj.getActiveFile().editorMode.execute(undefined, clientObj, clientSession);
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
                                    if (clientObj.getActiveFile().process) // check if program is running
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
                                        closeProcess(clientObj.getActiveFile().process, sessionId);
                                        // .then(() => {
                                        //     replicateFunction((clientWs) => {
                                        //         clientWs.send(JSON.stringify({type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, body: gdbBuffer.toString(), clientId: clientId}));  // Send GDB output to the client
                                        //         });
                                        // }).catch(err => replicateFunction((clientWs) => {
                                        //         clientWs.send(JSON.stringify({type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, body: err, clientId: clientId}));  // Send GDB output to the client
                                        //         }))
                                    }
                                    else
                                        executeProgram(); //buildAndRunCppSandbox(filePath, path.join(rootDirName, "cache", sessionId, "clientFiles"), clientId, sessionId) //
                                }
                                else if (command == "-exec-run") {
                                    if (!clientObj.getActiveFile().process) {
                                        if (!clientObj.editorMode.clientCompile)
                                            buildAndRunCppSandbox(folderPath, clientObj.getActiveFile().name, clientObj.editorMode, clientId, sessionId).then(async (res) => {
                                                mode = "debug"; //set mode to debug
                                                try {
                                                    clientObj.getFile(res.fileName).editorMode.sendError = (err, fatal) => {
                                                        // printClientConsoleError(err)
                                                        if (fatal) {
                                                            // closeProcess(clientObj.getActiveFile().process)
                                                            onClosedProgram(-1, 0, `<span class="console-error">Compile error: ${err}</span>`);
                                                            return;
                                                        }
                                                    };
                                                    replicateFunction((clientWs) => {
                                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compilăm programul.', clientId: clientId })); // Send GDB output to the client
                                                    });
                                                    // execSync(`docker exec ${res.imageName} bash -c "g++ -g -O0 clientFiles/main.cpp -o main"`)
                                                    await clientObj.getFile(res.fileName).editorMode.compile(res, clientObj.getFile(res.fileName), true);
                                                    replicateFunction((clientWs) => {
                                                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ExecuteStatus, body: 'Compilat!', clientId: clientId })); // Send GDB output to the client
                                                    });
                                                    clientObj.getActiveFile().process = clientObj.getActiveFile().debugProgram = clientObj.getFile(res.fileName).editorMode.startDebugging(res, clientObj, clientSession);
                                                    await new Promise(resolve => setTimeout(resolve, 100));
                                                    clientObj.getActiveFile().debugProgram.addDataListener(onData);
                                                    if (!clientObj.getActiveFile().debugProgram)
                                                        throw 'invalid debug process';
                                                    // addProcessToMap(sessionId, clientObj.getActiveFile().debugProgram);
                                                    replicateFunction((ws, id, obj) => obj.sendMessage({ input: 1 }, types_1.WebSocketMessageType.ExecuteStatus));
                                                }
                                                catch (err) {
                                                    printClientConsoleError("docker error: " + err);
                                                }
                                                if (!clientObj.getActiveFile().debugProgram)
                                                    console.error('Invalid session while starting debug process');
                                                // printClientConsoleDebug("started debugging process.")
                                                queueCommand(clientObj.getActiveFile().debugProgram, '-break-insert 1\n', sessionId);
                                                // queueCommand(getProcessFromMap(),'-exec-run\n', sessionId);  
                                            });
                                        else {
                                            clientObj.getActiveFile().process = clientObj.getActiveFile().debugProgram = clientObj.getFile(clientObj.getActiveFile().name).editorMode.startDebugging(undefined, clientObj, clientSession);
                                            // clientObj.getActiveFile().editorMode.execute(undefined, clientObj, clientSession) 
                                        }
                                    }
                                    else {
                                        closeProcess(clientObj.getActiveFile().process);
                                        //  onClosedProcess()//.then(() => {
                                    } // else  await queueCommand(getProcessFromMap() as ChildProcess,'-exec-quit', sessionId);// gdbProcess.stdin.write(message + "\n");
                                }
                                else if (command === "-exec-quit") {
                                    closeProcess(clientObj.getActiveFile().process);
                                    //  onClosedProcess()//.then(() => {
                                }
                                else if (clientObj.getActiveFile().debugProgram != undefined) {
                                    console.log('queue command');
                                    // executeCommand(getProcessFromMap() as ChildProcess,'-stack-list-variables --all-values',sessionId).catch(err => console.error('queue command err: ' + err))
                                    executeCommand(clientObj.getActiveFile().debugProgram, command, sessionId).then(() => {
                                        console.log('COMMAND');
                                    }).catch(err => console.error('queue command err: ' + err));
                                }
                                else if (clientObj.getActiveFile().program != undefined) {
                                    clientObj.getActiveFile().program?.write(command); //program.stdin.write(message + "\n");
                                    replicateFunction((ws, id, obj) => obj.sendMessage({ input: 1 }, types_1.WebSocketMessageType.ExecuteStatus));
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
            clientObj.getActiveFile().process = clientObj.getActiveFile().debugProgram = clientObj.getActiveFile().program = undefined;
            if (isShared)
                shared.removeProcess(sessionId);
            clientObj.getActiveFile().program = undefined;
            if (clientSession.fileWatcher) {
                clientSession.fileWatcher.close();
                clientSession.fileWatcher = undefined;
                console.log('stopped file watcher');
            }
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
                        let timer;
                        if (process) {
                            process.kill(9);
                            process.addListener(('close'), (code) => {
                                if (timer)
                                    clearTimeout(timer);
                                onClosedProcess();
                                resolve();
                                console.log('stopped process');
                            });
                            timer = setTimeout(() => {
                                onClosedProcess();
                                reject('timed out closing process');
                            }, 3000);
                        }
                        else {
                            if (timer)
                                clearTimeout(timer);
                            onClosedProcess();
                            resolve();
                        }
                    }
                    // resolve()
                });
            }
            catch (err) {
                console.log('caught error while closing process: ' + err);
                onClosedProcess();
            }
        }
        function onCloseSession() {
            if (!clientObj.getActiveFile())
                return;
            const process = clientObj.getActiveFile().program;
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
                        newHost.permissions.isHost = true;
                        clientSession.hostClient = newHost;
                        newHost.sendMessage({ type: types_1.WebSocketMessageType.ColabData, colabCommand: "HOST", body: "Acum esti proprietarul acestei sesiuni." });
                    }
                replicateFunction((clientWs) => {
                    clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ColabData, ...clientInfo(clientObj), colabCommand: "DISCONECT", session, body: clientObj?.displayName + " a iesit din sesiune." }));
                }, clientObj);
                console.info('session is still active');
                // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Chat, body: "$: Client " + clientId + " disconnected!"});
            }
        }
        // Handle WebSocket disconnection
        ws.addEventListener("close", () => {
            updateUserMeter();
            onCloseSession();
            console.log("Client " + clientId + " disconnected");
        });
        function replicateFunction(callback, excludeClientObj) {
            // if(!getThisClientSession() || !getThisClientSession().clientsSockets) return console.error(new Error("invalid session or client sockers"));
            let excludeClientId;
            if (excludeClientObj && !Array.isArray(excludeClientObj))
                excludeClientId = getThisClientSession().getClientId(excludeClientObj);
            if (!getThisClientSession())
                return console.error('invqlid session');
            getThisClientSession().clientsSockets.forEach((thisClientWs, thisClientId) => {
                if (!thisClientWs)
                    return;
                if (Array.isArray(excludeClientObj)) {
                    if (!excludeClientObj.find(obj => obj.clientId == thisClientId))
                        callback(thisClientWs, thisClientId, clientSession.clientsMap.get(thisClientId));
                }
                else if (excludeClientId != thisClientId)
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
let translation = undefined;
const defaultLang = 'ro-RO';
fs_1.default.readFile(path_1.default.join(exports.rootDirName, 'server', 'data', 'translations.json'), (err, data) => {
    if (err)
        throw err;
    translation = JSON.parse(data.toString());
    console.log('translations loaded, bytes:', data.byteLength);
});
function sendFile(path, res, req, params) {
    if (path.split('.').at(-1) != 'html')
        return res.status(500).send('Input file isnt HTML.');
    try {
        fs_1.default.readFile(path, (err, file) => {
            if (err || !file)
                throw err;
            return res.contentType('html').send(parseText(file.toString(), req, params));
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send('Error:' + err);
    }
}
function parseText(file, req, params) {
    // ^{%...} - translation
    // ^{&file:...} - include file
    // ^{*...} - custom parameter
    if (!req || !req.cookies) {
        console.error('YOU FORGOT TO ADD COOKIE PARSER!');
        return file;
    }
    if (!translation)
        throw 'invalid translation json';
    const matches = file.matchAll(/\^{[%&*](.*)}/g);
    let text = file;
    const locale = function () {
        const accLang = req.cookies.ii_lang ? req.cookies.ii_lang : req.headers["accept-language"];
        if (!accLang)
            return defaultLang;
        return accLang.split(',').map(param => param.split(';')[0]);
    }()[0];
    const keyDictionary = translation;
    for (const matchobj of matches) {
        const match = matchobj[1];
        const key = matchobj[0];
        if (key.startsWith('^{%')) {
            if (!keyDictionary[match])
                continue;
            const expr = keyDictionary[match][locale] ? keyDictionary[match][locale] : keyDictionary[match][defaultLang] ? keyDictionary[match][defaultLang] : '';
            if (expr != '' && expr !== undefined)
                text = text.replaceAll(key, expr);
            else if (keyDictionary[match][defaultLang])
                text = text.replaceAll(key, keyDictionary[match][defaultLang]);
            else
                console.error('invalid translation id', match);
        }
        else if (key.startsWith('^{&file:')) {
            const filePath = match.split(":")[1];
            if (!filePath)
                throw 'invalid file path';
            if (filePath.includes('_header.html') && req.get('sec-fetch-dest') == 'iframe') {
                // dont show header in iframes
                text = text.replaceAll(key, '');
                continue;
            }
            const file = fs_1.default.readFileSync(path_1.default.resolve(exports.rootDirName, 'public', filePath)).toString();
            text = text.replaceAll(key, parseText(file, req, { ...params, login: req.cookies[exports.tokenCookieName] ? '' :
                    `<div id="g_id_onload"
                    data-client_id="1084614977813-af126bl44fhu54nh1etlnl3n2tf5jkq5.apps.googleusercontent.com"
                    data-context="use"
                    data-ux_mode="popup"
                    data-login_uri="https://intelegeinfo.ro/login/callback"
                    data-itp_support="true">
                </div>
            <script src="https://accounts.google.com/gsi/client" async></script>` })); // recursivly parse file text
        }
        else if (key.startsWith('^{*')) {
            const keys = match.split('.');
            let obj = params;
            for (const key2 of keys)
                if (obj && obj[key2]) {
                    obj = obj[key2];
                }
                else {
                    obj = undefined;
                    break;
                }
            if (obj)
                text = text.replaceAll(key, obj);
            else
                text = text.replaceAll(key, '');
        }
    }
    return text;
}
function parseHTML(req, res, next) {
    const filePath = req.path.endsWith('/') || req.path.endsWith('\\') ? req.path + '/index.html' : req.path;
    const fullPath = path_1.default.join(exports.rootDirName, 'public', filePath);
    const ext = filePath.split('.').at(-1) ? filePath.split('.').at(-1) : 'text';
    if (ext != 'html') {
        // res.sendFile(fullPath)
        next();
        return;
    }
    // fs.createReadStream(fullPath) // use read streams
    try {
        fs_1.default.readFile(fullPath, (err, file) => {
            if (err || !file)
                return next();
            res.contentType(ext).send(parseText(file.toString(), req));
        });
    }
    catch (err) {
        console.error(err);
        // res.statusCode(404).send(err)
        // res.sendFile(fullPath)
        next();
        return;
    }
}
app.use(parseHTML, express_1.default.static('public'), handle404);
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});
