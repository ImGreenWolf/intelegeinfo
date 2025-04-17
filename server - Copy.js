"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const ws_1 = __importDefault(require("ws"));
const path_1 = __importDefault(require("path"));
const types_1 = require("./public/js/types");
const stream_1 = require("stream");
const connect_redis_1 = require("connect-redis");
const redis_1 = require("redis");
const express_session_1 = __importDefault(require("express-session"));
const { v4: uuidv4 } = require('uuid');
const app = (0, express_1.default)();
const compression = require('compression');
const cluster = require('cluster');
const os = require('os');
app.use(compression());
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
const numCPUs = os.cpus().length;
/* IMPORTS */
// FileManagement.ts
function createFile() {
}
/*END IMPORTS*/
app.use(express_1.default.urlencoded({ extended: true }));
const problemCreator_js_1 = __importDefault(require("./server/routes/problemCreator.js"));
app.use('/', problemCreator_js_1.default);
console.log(typeof problemCreator_js_1.default);
const server = app.listen(3000, '0.0.0.0', () => console.log("Server running on port 3000"));
// Compile and Run C++ Code
app.get("/getCompiledCode", (req, res) => {
    res.send({ code: fs_1.default.readFileSync("user_code.cpp").toString() });
});
var FileManagementCommands;
(function (FileManagementCommands) {
    FileManagementCommands["Create"] = "create";
    FileManagementCommands["Delete"] = "delete";
    FileManagementCommands["List"] = "list";
    FileManagementCommands["Rename"] = "rename";
    FileManagementCommands["Open"] = "open";
})(FileManagementCommands || (FileManagementCommands = {}));
console.log(`[MASTER] Running on PID ${process.pid}`);
//          LOCAL  SERVER  VARIABLES       //
let compileProcess;
//                      END                      //  
//          GLOBAL  SERVER  VARIABLES       //
const wss = new ws_1.default.Server({ port: 8080 });
const clients = new Map();
// const sessions: Map<UUID, UUID[]> = new Map();
let runningProcesses = new Map();
const sessionMap = new Map(); // SESSION ID / EDITOR OBJECT
//                      END                      //  
let redisClient = (0, redis_1.createClient)();
redisClient.connect().catch(console.error);
// Initialize store.
let redisStore = new connect_redis_1.RedisStore({
    client: redisClient,
    prefix: "myapp:",
});
// Initialize session storage.
app.use((0, express_session_1.default)({
    store: redisStore,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: "keyboard cat",
}));
function addProcessToMap(sessionId, process) {
    if (runningProcesses.has(sessionId)) {
    }
    else
        runningProcesses.set(sessionId, process);
}
function removeProcessFromMap(sessionId) {
    if (runningProcesses.has(sessionId)) {
        runningProcesses.delete(sessionId);
    }
    else
        console.error("Process not found in map for client " + sessionId);
}
function getProcessFromMap(sessionId) {
    return runningProcesses.get(sessionId);
}
fs_1.default.readdir(path_1.default.join(__dirname, "cache"), (err, files) => {
    if (err) {
        console.error("Error reading cache directory:", err);
        return;
    }
    files.forEach((file) => {
        fs_1.default.rmdir(path_1.default.join(__dirname, "cache", file), { recursive: true }, (err) => {
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
class EditorSession {
    sessionId;
    clientsActiveFile = new Map(); // client , file name
    clients = new Map();
    clientsDisplayNames;
    constructor(sessionId) {
        this.sessionId = sessionId || uuidv4();
        this.clientsDisplayNames = this.getDisplayNames();
    }
    getDisplayNames() {
        const nouns = ["lup", "leu", "raton", "pisică", "caine", "maimută"]; // const nouns = ["lupul", "leul", "ratonul", "pisica", "cainele", "maimuta"];
        const prefixAdjFem = ["rapida", "curajoasa", "frumoasa", "destepta"];
        const prefixAdjMasc = ["rapid", "curajos", "frumos", "destept"];
        const suffixAdjMasc = ["copilul", "beta", "micul", "curajosul", "marele"];
        const suffixAdjFem = ["copilul", "beta", "mica", "curajoasa", "marea"];
        const formedNouns = [];
        let adj;
        let i = 0, j = 0;
        nouns.forEach(noun => {
            const isFemale = noun.endsWith("a") || noun.endsWith("ă");
            const suffixAdj = isFemale ? suffixAdjFem : suffixAdjMasc;
            const prefixAdj = isFemale ? prefixAdjFem : prefixAdjMasc;
            if (Math.random() > (prefixAdj.length / suffixAdj.length / 2 % 2)) {
                let newNown = noun;
                ["ul", "le"].forEach(termination => {
                    if (noun.endsWith(termination))
                        return newNown = noun.replace(termination, "");
                });
                adj = suffixAdj[Math.floor(Math.random() * suffixAdj.length)] || "";
                formedNouns.push(adj + " " + newNown);
                // suffixAdj.splice(suffixAdj.indexOf(adj),1);
            }
            else {
                let newNown = noun;
                console.log(noun.substring(noun.length - 1));
                switch (noun.substring(noun.length - 1)) {
                    case "e":
                        newNown = noun + "le";
                        break;
                    case "a":
                    case "ă":
                        newNown = noun.slice(noun.length) + "a";
                    default:
                        if (noun.endsWith('u'))
                            newNown = noun + "l";
                        else
                            newNown = noun + "ul";
                        break;
                }
                adj = prefixAdj[Math.floor(Math.random() * prefixAdj.length)] || "";
                formedNouns.push(newNown + " " + adj);
                // prefixAdj.splice(prefixAdj.indexOf(adj),1);
            }
        });
        return formedNouns;
    }
    getClientId(ClientObject) {
        return ClientObject.clientId;
    }
    getClientObjectById(clientId) {
        return this.clients.get(clientId);
    }
    onRemoveClient(clientId) {
        this.clients.delete(clientId);
        this.clientsActiveFile.delete(clientId);
    }
    spawnClient(ws) {
        const newClient = new ClientObject(this.sessionId, this);
        console.log("spawning new client with id: " + newClient.clientId);
        this.clients.set(newClient.clientId, newClient);
        return newClient.clientId;
    }
    replicateFunction(callback, ignoreClient) {
        this.clients.forEach(client => {
            if (client != ignoreClient || !ignoreClient)
                callback(client);
        });
    }
}
class ClientObject {
    sessionId;
    clientId;
    displayName;
    ping;
    // EditorSessionObject: EditorSession
    constructor(sessionId, EditorSession) {
        this.sessionId = sessionId;
        this.clientId = uuidv4();
        this.ping = 0;
        // this.EditorSessionObject = EditorSession;
        const displayNames = EditorSession.clientsDisplayNames;
        this.displayName = displayNames[Math.floor(Math.random() * displayNames.length)];
        displayNames.splice(displayNames.indexOf(this.displayName), 1);
        this.displayName = this.displayName[0].toLocaleUpperCase() + this.displayName.substring(1);
    }
}
var commandType;
(function (commandType) {
    commandType["Show"] = "sessions";
    commandType["Clients"] = "clients";
})(commandType || (commandType = {}));
// TODO Improve this a lot, find a better way of calling these functions
process.stdin.on('data', (commandString) => {
    const command = commandString.toString().toLowerCase().trim().split(' ');
    console.log(command);
    const params = command.splice(0);
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
    const editorSession = sessionMap.get(sessionId);
    const code = req.body.code;
    const exeFile = path_1.default.join(__dirname, "cache", sessionId);
    const filePath = path_1.default.join(exeFile, "clientFiles"); //            path.join(__dirname, "cache", sessionId);
    const codeFile = !["cpp"].includes(path_1.default.extname(editorSession?.clientsActiveFile.get(clientId) || "main.cpp")) ? editorSession?.clientsActiveFile.get(clientId) : "main.cpp";
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
wss.on("connection", (ws) => {
    let gdbProcess;
    let program;
    let sessionId;
    let clientId;
    let clientObj;
    let sessionType; // true for session, false for "local" client
    let clientFilesPath;
    let heartbeatTimestamp = Date.now();
    const heartbeatTimeout = 10000; // 1 second timeout for heartbeat
    let heartbeatInterval;
    let clientSession;
    let gdbBuffer = "";
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
            program.stdin?.write(chunk, encoding, callback); // Forward to child stdin
        },
        final(callback) {
            program.stdin?.end(); // Close stdin when done
            callback();
        }
    });
    function getThisClientSession() {
        // if(!sessionMap.get(sessionId)) 
        // { 
        //     console.error("couldnt find session object, creating a new session instead.")
        //     return new EditorSession(sessionId);
        // } else
        return clientSession || sessionMap.get(sessionId); //||  new EditorSession(sessionId);
    }
    function createThisClientSession(sessionId) {
        const newSession = new EditorSession(sessionId);
        sessionMap.set(newSession.sessionId, newSession);
        return newSession;
    }
    function printClientConsoleError(message, client) {
        const targetClientId = client?.clientId || clientId;
        const clientSocket = clients.get(targetClientId);
        if (clientSocket) {
            clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Error, body: message, messageType: types_1.ConsoleMessageType.Error }));
        }
        else {
            console.error("Client not found:", clientId);
        }
    }
    function printClientConsoleInfo(message, client) {
        const targetClientId = client?.clientId || clientId;
        const clientSocket = clients.get(targetClientId);
        if (clientSocket) {
            clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Console, body: message, messageType: types_1.ConsoleMessageType.Info }));
        }
        else {
            console.error("Client not found:", targetClientId);
        }
    }
    function printClientConsoleDebug(message, client) {
        const targetClientId = client?.clientId || clientId;
        const clientSocket = clients.get(targetClientId);
        if (clientSocket) {
            clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Console, body: message, messageType: types_1.ConsoleMessageType.Debug }));
        }
        else {
            console.error("Client not found:", targetClientId);
        }
    }
    function printClientConsoleSessionInfo(message, client) {
        const targetClientId = client?.clientId || clientId;
        const clientSocket = clients.get(targetClientId);
        if (clientSocket) {
            clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Console, body: message, messageType: types_1.ConsoleMessageType.SessionInfo }));
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
                    listFiles(clientFilesPath);
                    openFile("main.cpp");
                });
            });
        }
        else {
            console.error("Cache folder already exists for sessionId " + sessionId);
            listFiles(clientFilesPath);
            if (!fs_1.default.existsSync(path_1.default.join(clientFilesPath, "main.cpp")))
                console.error("No default file was found!");
            openFile("main.cpp");
        }
        getThisClientSession().replicateFunction((client) => {
            printClientConsoleSessionInfo(clientObj?.displayName + " joined!", client);
        }, clientObj);
        // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Console, messageType: ConsoleMessageType.SessionInfo, body: "Client " + clientObj?.displayName + " joined!"});
        console.log("Client connected to GDB server" + clientId);
        ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.Handshake, clientId: clientId, sessionId: sessionId })); // Send initial message to client
        if (getThisClientSession()?.clients.size > 1) {
            let displayNames = [];
            getThisClientSession()?.clients.forEach((client, id) => {
                displayNames.push(client.displayName);
            });
            replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.ColabData, body: JSON.stringify({ clients: displayNames, thisClientId: clientId, thisSessionId: sessionId }) });
        }
    }
    // debug mode only for now
    async function executeCommand(childProcess, command, sessionId) {
        return new Promise((resolve, reject) => {
            let gdbBuffer = "";
            const onData = (data) => {
                gdbBuffer += data.toString();
                // Check if the full response has arrived
                if (gdbBuffer.includes("(gdb)")) {
                    // We have everything, remove listener
                    childProcess.stdout.removeListener("data", onData);
                    const response = {
                        error: false,
                        input: false,
                        type: types_1.WebSocketMessageType.Output,
                        messageType: types_1.ConsoleMessageType.Output,
                        body: gdbBuffer,
                        message: command.toString()
                    };
                    getThisClientSession()?.clients.forEach((client, id) => {
                        //send response to all clients
                        const clientSocket = clients.get(client.clientId);
                        if (!clientSocket) {
                            //sessions.delete(sessionId);
                            if (getThisClientSession()?.clients.has(clientId))
                                console.error("Client not found in session while trying to time out client  " + sessionId);
                            else
                                getThisClientSession()?.clients.delete(client.clientId);
                            clients.delete(client.clientId);
                            return console.error("\\x1b[31m Client not found, removing ids " + client + "\\x1b[0m");
                        }
                        clientSocket?.send(JSON.stringify(response));
                    });
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
        CommandQueue = CommandQueue.then(() => executeCommand(process, command, sessionId));
        return CommandQueue;
    }
    function listFiles(dir) {
        fs_1.default.readdir(dir, (err, files) => {
            if (err) {
                printClientConsoleError("Error listing files: " + err.message);
            }
            else {
                // const fileContentMap: Map<string, string> = new Map<string, string>();
                // files.forEach(element => {
                //     fileContentMap.set(element, fs.readFileSync(path.join(clientFilesPath, element)).toString());
                // });
                const targetFiles = files.filter(file => {
                    return ![".exe", ".o"].includes(path_1.default.extname(file).toLowerCase());
                });
                ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.FileManagement, body: { command: FileManagementCommands.List, content: targetFiles } })); // Send the list of files to the client
            }
        });
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
                replicateSocketMessage(sessionId, clientId, true, { type: types_1.WebSocketMessageType.CodeSelection, body: null }, (client) => { return getThisClientSession()?.clientsActiveFile.get(client) === oldFileName; }); // potential fix for a glitch where markers dont get deleted when switching tabs
                getThisClientSession()?.clientsActiveFile.set(clientId, fileName);
                ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.FileManagement, body: { command: FileManagementCommands.Open, content: data.toString(), fileName: fileName } })); // Send the list of files to the client
            }
        });
    }
    // Handle GDB session commands from client
    ws.on("message", async (message, isBinary) => {
        try {
            const messageJSON = JSON.parse(message.toString());
            const command = messageJSON.command;
            const args = messageJSON.args;
            const type = messageJSON.type;
            //console.log("Received message from client: ", messageJSON);
            //console.log("Received message from client: ", type);
            //console.log(sessions)
            // if(type!= WebSocketMessageType.Heartbeat)
            //     {
            //         console.log(getThisClientSession())
            //     }
            switch (type) {
                case types_1.WebSocketMessageType.Heartbeat:
                    if (!clientObj)
                        break;
                    clientObj.ping = Date.now() - heartbeatTimestamp;
                    console.log("Client ping: " + clientObj?.ping);
                    //console.log("Received heartbeat from client " + clientId);
                    break;
                case types_1.WebSocketMessageType.Handshake:
                    //handle heartbeat
                    heartbeatInterval = setInterval(() => {
                        server.getConnections(function (error, count) {
                            console.log(count);
                        });
                        heartbeatTimestamp = Date.now(); // Update the heartbeat timestamp when a message is received
                        ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.Heartbeat, connections: server.connections, expectedDelay: heartbeatTimeout })); // Send a ping message to the client every 30 seconds
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
                    if (messageJSON.sessionId) {
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
                        if (sessionMap.has(messageJSON.sessionId)) // = There is an active session, join it.
                         {
                            clientSession = sessionMap.get(messageJSON.sessionId) || new uuidv4();
                            clientId = getThisClientSession().spawnClient(ws);
                            clientObj = getThisClientSession().getClientObjectById(clientId);
                        }
                        else // there is no session, create it.
                         {
                            //getThisClientSession()?.clients.push(clientId); // add client to client list.
                            clientSession = createThisClientSession(messageJSON.sessionId);
                            clientId = getThisClientSession()?.spawnClient(ws);
                            clientObj = getThisClientSession().getClientObjectById(clientId);
                        }
                        sessionId = getThisClientSession().sessionId;
                        clientFilesPath = path_1.default.join(__dirname, "cache", sessionId, "clientFiles");
                        clients.set(clientId, ws);
                        connectionReady(true);
                    }
                    else {
                        //client connected to new session
                        //   clientId = uuidv4(); // Generate a unique ID
                        //   sessionId = clientId; // Use the generated ID as the session ID
                        // sessions.set(clientId, [sessionId]);
                        clientSession = createThisClientSession();
                        if (getThisClientSession() != undefined) {
                            sessionId = clientSession.sessionId;
                            // getThisClientSession().sessionId = sessionId;
                            // getThisClientSession()?.clients.set(clientId); // add client to client list.
                            clientId = getThisClientSession()?.spawnClient(ws);
                            clientObj = getThisClientSession().getClientObjectById(clientId);
                            clientFilesPath = path_1.default.join(__dirname, "cache", sessionId, "clientFiles");
                        }
                        clients.set(clientId, ws);
                        connectionReady(false);
                    }
                    console.log(sessionId + clientId);
                    //    if(fs.existsSync(path.join(__dirname, "cache", sessionId)))
                    //      fs.writeFileSync(path.join(__dirname, "cache", sessionId , "user_code.cpp"), "// C++ code here\n");
                    break;
                case types_1.WebSocketMessageType.Console:
                    if (getProcessFromMap(sessionId) != undefined)
                        getProcessFromMap(sessionId)?.stdin?.write(messageJSON.command + "\n");
                    console.log("sent to program", messageJSON.command);
                    replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.Console, messageType: types_1.ConsoleMessageType.UserChat, body: messageJSON.command, clientDisplayName: clientObj?.displayName });
                    // clients.forEach((client, id) => {
                    //         client.send(JSON.stringify({error: false, input: false, clientId: clientId, type: WebSocketMessageType.Console, body: messageJSON.command})); // Send initial message to client
                    // });
                    break;
                case types_1.WebSocketMessageType.CodeChange:
                case types_1.WebSocketMessageType.CodeSelection:
                    //fs.writeFileSync(path.join(__dirname, "cache", sessionId , "user_code.cpp"), messageJSON.code);
                    // console.log(type + " for sessionId " + sessionId);
                    const shouldSave = messageJSON.saveFile;
                    const fileName = messageJSON.fileName;
                    if (true && type === types_1.WebSocketMessageType.CodeChange) {
                        console.log(messageJSON);
                        //   TODO make a more efficient way of updating the file, either by streams or a save button.
                        fs_1.default.writeFile(path_1.default.join(clientFilesPath, fileName), messageJSON.body, (err) => {
                            if (err)
                                console.log("Failed saving file!");
                            console.log("saved file");
                        });
                    }
                    replicateSocketMessage(sessionId, clientId, true, { type: type, body: messageJSON }, (client) => { let filter = getThisClientSession()?.clientsActiveFile.get(client) != fileName; console.log(getThisClientSession()?.clientsActiveFile.get(client) + fileName); return filter; });
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
                            fs_1.default.unlink(path_1.default.join(clientFilesPath, messageJSON.body), (err) => {
                                if (err) {
                                    printClientConsoleError("Error deleting file: " + err.message);
                                }
                                else {
                                    console.log("File deleted successfully");
                                    replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.FileManagement, body: ({ command: commandType, content: messageJSON.fileName, }) });
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
                    if (clientId === sessionId)
                        // handle case when client is the session owner
                        handleCommand(command, [[clientId, ws]]);
                    else
                        // handle case when client is a collaborator
                        handleCommand(command, clients); // pass all the clients in the session
                    async function handleCommand(command, sockets) {
                        if (command == "execute") {
                            // execute code normally.
                            if (!getProcessFromMap(sessionId)) // check if program is running
                             {
                                async function executeProgram() {
                                    new Promise((resolve, reject) => {
                                        console.log("executing program");
                                        const filePath = path_1.default.join(__dirname, "cache", sessionId, "main.exe");
                                        fs_1.default.stat(filePath, (err, stats) => {
                                            if (err) {
                                                printClientConsoleError('$: Please compile the program first!');
                                                return;
                                            }
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
                                                ws.send(JSON.stringify({ messageType: types_1.ConsoleMessageType.Output, type: types_1.WebSocketMessageType.Output, body: gdbBuffer.toString() })); // Send GDB output to the client
                                                gdbBuffer = "";
                                            });
                                            program.on("spawn", () => {
                                                console.log("Program started successfully");
                                            });
                                            program.stderr?.on("data", (data) => {
                                                gdbBuffer += data.toString();
                                                ws.send(JSON.stringify({ error: true, input: false, type: types_1.WebSocketMessageType.Error, body: gdbBuffer.toString(), messageType: types_1.ConsoleMessageType.Output, })); // Send GDB output to the client
                                                gdbBuffer = "";
                                            });
                                            program.on("close", (code) => {
                                                if (code === null)
                                                    return ws.send("Program exited with invalid code");
                                                gdbBuffer = "Program exited with code: " + code?.toString();
                                                ws.send(JSON.stringify({ error: false, input: false, end: true, type: types_1.WebSocketMessageType.End, messageType: types_1.ConsoleMessageType.Output, body: gdbBuffer.toString() })); // Send GDB output to the client
                                                gdbBuffer = "";
                                                removeProcessFromMap(sessionId);
                                                resolve(); // Resolve the promise when the process closes
                                            });
                                            //await queueCommand(program,message);
                                        });
                                    });
                                }
                                executeProgram();
                            }
                            else {
                                printClientConsoleError('program is already running! killing program'); // await queueCommand(program,command, sessionId);
                                getProcessFromMap(sessionId)?.kill(); // kill the program
                                removeProcessFromMap(sessionId);
                            }
                        }
                        else if (command == "run") {
                            mode = "debug";
                            if (!getProcessFromMap(sessionId)) {
                                const filePath = path_1.default.join(__dirname, "cache", sessionId, "main.exe");
                                gdbProcess = (0, child_process_1.spawn)("gdb", ["-q", "-ex", "set pagination off", "-ex", "set print thread-events off", filePath]);
                                addProcessToMap(sessionId, gdbProcess);
                                app.get("/requestValue", (req, res) => {
                                    const command = req.query.value;
                                    console.log(clientId + " " + command);
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
                                                // We have everything, remove listener
                                                gdbProcess?.stdout?.removeListener("data", onData);
                                                resolve();
                                                console.log(clientId + " " + gdbBuffer);
                                                return res.send(({
                                                    error: false,
                                                    input: false,
                                                    type: types_1.WebSocketMessageType.Output,
                                                    body: gdbBuffer,
                                                    message: command?.toString()
                                                }));
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
                                await queueCommand(gdbProcess, command, sessionId); // gdbProcess.stdin.write(message + "\n");
                        }
                        else {
                            if (mode == "debug") {
                                if (args.includes('console')) {
                                    gdbProcess?.stdin?.write(command + "\n");
                                    console.log("executed console command " + command);
                                    gdbBuffer = "";
                                    // Use .on instead of .once, because GDB output can be split
                                    gdbProcess?.stdout?.on("data", (data) => {
                                        gdbBuffer += data.toString();
                                        console.log(clientId + " " + gdbBuffer);
                                        ws.send(JSON.stringify({
                                            error: false,
                                            input: false,
                                            type: types_1.WebSocketMessageType.Output,
                                            body: gdbBuffer,
                                            message: command.toString()
                                        }));
                                    });
                                }
                                else if (gdbProcess)
                                    await queueCommand(gdbProcess, command, sessionId);
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
                                    program.stdin?.write(command); //program.stdin.write(message + "\n");
                                    console.log("sent to program");
                                }
                            }
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
    function onCloseSession() {
        const process = getProcessFromMap(sessionId);
        replicateSocketMessage(sessionId, clientId, true, { type: types_1.WebSocketMessageType.CodeSelection, body: "" });
        clients.delete(clientId);
        clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
        // getThisClientSession()?.clients.splice(getThisClientSession()?.clients.indexOf(clientId)||-1 , 1);
        getThisClientSession()?.onRemoveClient(clientId);
        //sessions.delete(sessionId);
        // if(sessions.get(sessionId)?.indexOf(clientId) === -1)  console.error("Client not found in session " + sessionId);
        //    else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(clientId) || -1, 1);
        if (getThisClientSession()?.clients.size == 0) {
            // sessions.delete(sessionId);
            fs_1.default.rmdir(path_1.default.join(__dirname, "cache", sessionId), { recursive: true }, (err) => {
                console.log("deleted cache folder for sessionId " + sessionId);
            });
            if (process) {
                process.kill();
                removeProcessFromMap(sessionId);
            }
            sessionMap.delete(sessionId);
            console.log("Deleted session " + sessionId);
        }
        else {
            //session is still active, send message to other clients
            if (getThisClientSession()?.clients.size != 0)
                replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.ColabData, body: JSON.stringify({ clients: getThisClientSession()?.clients }) });
            replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.Console, body: "$: Client " + clientId + " disconnected!" });
        }
    }
    // Handle WebSocket disconnection
    ws.on("close", () => {
        onCloseSession();
        console.log("Client " + clientId + " disconnected");
    });
});
// process.on('SIGTERM', () => {
//     console.log('SIGTERM signal received: closing HTTP server')
//     server.close(() => {
//     })
//   })
