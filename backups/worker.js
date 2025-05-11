"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var fs_1 = __importDefault(require("fs"));
var child_process_1 = require("child_process");
var ws_1 = __importDefault(require("ws"));
var path_1 = __importDefault(require("path"));
var types_1 = require("./public/js/types");
var stream_1 = require("stream");
var connect_redis_1 = require("connect-redis");
var redis_1 = require("redis");
var express_session_1 = __importDefault(require("express-session"));
var uuidv4 = require('uuid').v4;
var app = (0, express_1.default)();
var compression = require('compression');
app.use(compression());
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
/* IMPORTS */
// FileManagement.ts
function createFile() {
}
/*END IMPORTS*/
app.use(express_1.default.urlencoded({ extended: true }));
var problemCreator_js_1 = __importDefault(require("./server/routes/problemCreator.js"));
app.use('/', problemCreator_js_1.default);
console.log(typeof problemCreator_js_1.default);
var server = app.listen(3000, '0.0.0.0', function () { return console.log("Server running on port 3000"); });
// Compile and Run C++ Code
app.get("/getCompiledCode", function (req, res) {
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
//          GLOBAL  SERVER  VARIABLES       //
var wss = new ws_1.default.Server({ port: 8080 });
var clients = new Map();
var sessions = new Map();
var compileProcess;
var runningProcesses = new Map();
var sessionMap = new Map(); // SESSION ID / EDITOR OBJECT
//                      END                      //  
var redisClient = (0, redis_1.createClient)();
redisClient.connect().catch(console.error);
// Initialize store.
var redisStore = new connect_redis_1.RedisStore({
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
fs_1.default.readdir(path_1.default.join(__dirname, "cache"), function (err, files) {
    if (err) {
        console.error("Error reading cache directory:", err);
        return;
    }
    files.forEach(function (file) {
        fs_1.default.rmdir(path_1.default.join(__dirname, "cache", file), { recursive: true }, function (err) {
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
var EditorSession = /** @class */ (function () {
    function EditorSession(sessionId) {
        this.clientsActiveFile = new Map(); // client , file name
        this.clients = new Map();
        this.sessionId = sessionId || uuidv4();
        this.clientsDisplayNames = this.getDisplayNames();
    }
    EditorSession.prototype.getDisplayNames = function () {
        var nouns = ["lup", "leu", "raton", "pisică", "caine", "maimută"]; // const nouns = ["lupul", "leul", "ratonul", "pisica", "cainele", "maimuta"];
        var prefixAdjFem = ["rapida", "curajoasa", "frumoasa", "destepta"];
        var prefixAdjMasc = ["rapid", "curajos", "frumos", "destept"];
        var suffixAdjMasc = ["copilul", "beta", "micul", "curajosul", "marele"];
        var suffixAdjFem = ["copilul", "beta", "mica", "curajoasa", "marea"];
        var formedNouns = [];
        var adj;
        var i = 0, j = 0;
        nouns.forEach(function (noun) {
            var isFemale = noun.endsWith("a") || noun.endsWith("ă");
            var suffixAdj = isFemale ? suffixAdjFem : suffixAdjMasc;
            var prefixAdj = isFemale ? prefixAdjFem : prefixAdjMasc;
            if (Math.random() > (prefixAdj.length / suffixAdj.length / 2 % 2)) {
                var newNown_1 = noun;
                ["ul", "le"].forEach(function (termination) {
                    if (noun.endsWith(termination))
                        return newNown_1 = noun.replace(termination, "");
                });
                adj = suffixAdj[Math.floor(Math.random() * suffixAdj.length)] || "";
                formedNouns.push(adj + " " + newNown_1);
                // suffixAdj.splice(suffixAdj.indexOf(adj),1);
            }
            else {
                var newNown = noun;
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
    };
    EditorSession.prototype.getClientId = function (ClientObject) {
        return ClientObject.clientId;
    };
    EditorSession.prototype.getClientObjectById = function (clientId) {
        return this.clients.get(clientId);
    };
    EditorSession.prototype.onRemoveClient = function (clientId) {
        this.clients.delete(clientId);
        this.clientsActiveFile.delete(clientId);
    };
    EditorSession.prototype.spawnClient = function (ws) {
        var newClient = new ClientObject(this.sessionId, this);
        console.log("spawning new client with id: " + newClient.clientId);
        this.clients.set(newClient.clientId, newClient);
        return newClient.clientId;
    };
    EditorSession.prototype.replicateFunction = function (callback, ignoreClient) {
        this.clients.forEach(function (client) {
            if (client != ignoreClient || !ignoreClient)
                callback(client);
        });
    };
    return EditorSession;
}());
var ClientObject = /** @class */ (function () {
    // EditorSessionObject: EditorSession
    function ClientObject(sessionId, EditorSession) {
        this.sessionId = sessionId;
        this.clientId = uuidv4();
        this.ping = 0;
        // this.EditorSessionObject = EditorSession;
        var displayNames = EditorSession.clientsDisplayNames;
        this.displayName = displayNames[Math.floor(Math.random() * displayNames.length)];
        displayNames.splice(displayNames.indexOf(this.displayName), 1);
        this.displayName = this.displayName[0].toLocaleUpperCase() + this.displayName.substring(1);
    }
    return ClientObject;
}());
var commandType;
(function (commandType) {
    commandType["Show"] = "sessions";
    commandType["Clients"] = "clients";
})(commandType || (commandType = {}));
// TODO Improve this a lot, find a better way of calling these functions
process.stdin.on('data', function (commandString) {
    var command = commandString.toString().toLowerCase().trim().split(' ');
    console.log(command);
    var params = command.splice(0);
    function showSessions() {
        console.log(sessionMap);
    }
    function showClients() {
        var _a;
        if (!params[1])
            return console.error("Please provide session id.");
        console.log((_a = sessionMap.get(params[1])) === null || _a === void 0 ? void 0 : _a.clients);
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
app.post("/compile", function (req, res) {
    // res.setHeader('Cache-Control', 'no-cache')
    // if(compileProcess) 
    //     {
    //         compileProcess.kill(); // kill the process if it is running
    //          console.error("Compile process already running for session " + sessionId);
    //     }
    var _a, _b, _c;
    // if(!sessionId) return;
    // if(!fs.existsSync(path.join(__dirname, "cache", sessionId))) return;
    var clientId = req.body.clientId;
    var sessionId = req.body.sessionId;
    var editorSession = sessionMap.get(sessionId);
    var code = req.body.code;
    var exeFile = path_1.default.join(__dirname, "cache", sessionId);
    var filePath = path_1.default.join(exeFile, "clientFiles"); //            path.join(__dirname, "cache", sessionId);
    var codeFile = !["cpp"].includes(path_1.default.extname((editorSession === null || editorSession === void 0 ? void 0 : editorSession.clientsActiveFile.get(clientId)) || "main.cpp")) ? editorSession === null || editorSession === void 0 ? void 0 : editorSession.clientsActiveFile.get(clientId) : "main.cpp";
    //fs.writeFileSync(path.join(filePath,"main.cpp"), code);
    // console.log(path.extname(getThisClientSession()?.clientsActiveFile.get(clientId)||"aaa"));
    compileProcess = (0, child_process_1.spawn)("g++", ["-g", path_1.default.join(filePath, codeFile || "main.cpp"), "-o", path_1.default.join(exeFile, "main.exe")], {
        windowsHide: true,
        detached: true,
    });
    var errorData = "";
    var errors = [];
    if (compileProcess != null) {
        (_a = compileProcess.stdin) === null || _a === void 0 ? void 0 : _a.end();
        (_b = compileProcess === null || compileProcess === void 0 ? void 0 : compileProcess.stderr) === null || _b === void 0 ? void 0 : _b.on("data", function (data) {
            data.toString().split('\n').forEach(function (errorString) {
                if (!errorString)
                    return;
                errorData = errorString.replace((path_1.default.resolve(filePath) + '\\'), "");
                var regex = errorData.match(/((?!:)\d*):((?!:)\d*)/) || [];
                var column = parseInt(regex[2] || "-1");
                var row = parseInt(regex[1] || "-1");
                errors.push({ column: column, row: row, error: errorData });
            });
            //                    data.toString();
        });
        (_c = compileProcess === null || compileProcess === void 0 ? void 0 : compileProcess.stdout) === null || _c === void 0 ? void 0 : _c.on("data", function (data) {
            console.log("stdout: " + data.toString());
        });
        compileProcess.on("close", function (code) {
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
wss.on("connection", function (ws) {
    var gdbProcess;
    var program;
    var sessionId;
    var clientId;
    var clientObj;
    var sessionType; // true for session, false for "local" client
    var clientFilesPath;
    var heartbeatTimestamp = Date.now();
    var heartbeatTimeout = 10000; // 1 second timeout for heartbeat
    var heartbeatInterval;
    var clientSession;
    var gdbBuffer = "";
    // TODO add session map 
    // if (gdbProcess) {
    //     gdbProcess.kill(); // Ensure only one GDB session runs at a time
    // }
    // if (program) {
    //     program.kill(); // Ensure only one GDB session runs at a time
    // }
    var customStream = new stream_1.Writable({
        write: function (chunk, encoding, callback) {
            var _a;
            console.log("Received from WebSocket, sending to C++ stdin: ".concat(chunk.toString()));
            (_a = program.stdin) === null || _a === void 0 ? void 0 : _a.write(chunk, encoding, callback); // Forward to child stdin
        },
        final: function (callback) {
            var _a;
            (_a = program.stdin) === null || _a === void 0 ? void 0 : _a.end(); // Close stdin when done
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
        var newSession = new EditorSession(sessionId);
        sessionMap.set(newSession.sessionId, newSession);
        return newSession;
    }
    function printClientConsoleError(message, client) {
        var targetClientId = (client === null || client === void 0 ? void 0 : client.clientId) || clientId;
        var clientSocket = clients.get(targetClientId);
        if (clientSocket) {
            clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Error, body: message, messageType: types_1.ConsoleMessageType.Error }));
        }
        else {
            console.error("Client not found:", clientId);
        }
    }
    function printClientConsoleInfo(message, client) {
        var targetClientId = (client === null || client === void 0 ? void 0 : client.clientId) || clientId;
        var clientSocket = clients.get(targetClientId);
        if (clientSocket) {
            clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Console, body: message, messageType: types_1.ConsoleMessageType.Info }));
        }
        else {
            console.error("Client not found:", targetClientId);
        }
    }
    function printClientConsoleDebug(message, client) {
        var targetClientId = (client === null || client === void 0 ? void 0 : client.clientId) || clientId;
        var clientSocket = clients.get(targetClientId);
        if (clientSocket) {
            clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Console, body: message, messageType: types_1.ConsoleMessageType.Debug }));
        }
        else {
            console.error("Client not found:", targetClientId);
        }
    }
    function printClientConsoleSessionInfo(message, client) {
        var targetClientId = (client === null || client === void 0 ? void 0 : client.clientId) || clientId;
        var clientSocket = clients.get(targetClientId);
        if (clientSocket) {
            clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Console, body: message, messageType: types_1.ConsoleMessageType.SessionInfo }));
        }
        else {
            console.error("Client not found:", targetClientId);
        }
    }
    var mode = "run"; //debug
    // TODO Replace with replicate function.
    function replicateSocketMessage(sessionId, senderId, ignoreSender, response, filterFunction) {
        var _a;
        (_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.clients.forEach(function (clientObject, client) {
            // for(const client of getThisClientSession()?.clients.keys()) {
            //send response to all clients
            if (ignoreSender && clientId == client)
                return;
            if (filterFunction != undefined) { // use filter function
                if (filterFunction(client) == false) {
                    var clientSocket = clients.get(client);
                    if (!clientSocket) {
                        // if(sessions.get(sessionId)?.indexOf(client) === -1)  console.error("Client not found in session while trying to time out client  " + sessionId);
                        //                      else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(client) || -1, 1);
                        //                  clients.delete(client);
                        return console.error("\\x1b[31m Client not found while replicating message " + client + "\\x1b[0m");
                    }
                    // } return console.error("Client not found " + client);
                    clientSocket === null || clientSocket === void 0 ? void 0 : clientSocket.send(JSON.stringify(response));
                }
            }
            else {
                var clientSocket = clients.get(client);
                if (!clientSocket) {
                    // if(sessions.get(sessionId)?.indexOf(client) === -1)  console.error("Client not found in session while trying to time out client  " + sessionId);
                    //                      else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(client) || -1, 1);
                    //                  clients.delete(client);
                    return console.error("\\x1b[31m Client not found while replicating message " + client + "\\x1b[0m");
                }
                // } return console.error("Client not found " + client);
                clientSocket === null || clientSocket === void 0 ? void 0 : clientSocket.send(JSON.stringify(response));
            }
            // ;
        });
    }
    function connectionReady(cooperator) {
        var _a, _b;
        if (cooperator === void 0) { cooperator = false; }
        var clientFilesPath = path_1.default.join(__dirname, "cache", sessionId, "clientFiles");
        if (!fs_1.default.existsSync(path_1.default.join(__dirname, "cache", sessionId)) || !cooperator) {
            // fs.mkdir(path.join(__dirname, "cache", sessionId), { recursive: true }, (err) => {
            //     console.log("created cache folder for sessionId " + sessionId);
            //     if (err) {
            //         console.error("Error creating cache folder:", err);
            //     }
            // });
            fs_1.default.mkdir(clientFilesPath, { recursive: true }, function (err) {
                console.log("created cache and client Files folder for sessionId " + sessionId);
                if (err) {
                    console.error("Error creating cache folder:", err);
                }
                var defaultText = fs_1.default.readFileSync("user_code.cpp").toString();
                fs_1.default.writeFile(path_1.default.join(clientFilesPath, "main.cpp"), defaultText, function (err) {
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
        getThisClientSession().replicateFunction(function (client) {
            printClientConsoleSessionInfo((clientObj === null || clientObj === void 0 ? void 0 : clientObj.displayName) + " joined!", client);
        }, clientObj);
        // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Console, messageType: ConsoleMessageType.SessionInfo, body: "Client " + clientObj?.displayName + " joined!"});
        console.log("Client connected to GDB server" + clientId);
        ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.Handshake, clientId: clientId, sessionId: sessionId })); // Send initial message to client
        if (((_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.clients.size) > 1) {
            var displayNames_1 = [];
            (_b = getThisClientSession()) === null || _b === void 0 ? void 0 : _b.clients.forEach(function (client, id) {
                displayNames_1.push(client.displayName);
            });
            replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.ColabData, body: JSON.stringify({ clients: displayNames_1, thisClientId: clientId, thisSessionId: sessionId }) });
        }
    }
    // debug mode only for now
    function executeCommand(childProcess, command, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a, _b;
                        var gdbBuffer = "";
                        var onData = function (data) {
                            var _a;
                            gdbBuffer += data.toString();
                            // Check if the full response has arrived
                            if (gdbBuffer.includes("(gdb)")) {
                                // We have everything, remove listener
                                childProcess.stdout.removeListener("data", onData);
                                var response_1 = {
                                    error: false,
                                    input: false,
                                    type: types_1.WebSocketMessageType.Output,
                                    body: gdbBuffer,
                                    message: command.toString()
                                };
                                (_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.clients.forEach(function (client, id) {
                                    var _a, _b;
                                    //send response to all clients
                                    var clientSocket = clients.get(client.clientId);
                                    if (!clientSocket) {
                                        //sessions.delete(sessionId);
                                        if ((_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.clients.has(clientId))
                                            console.error("Client not found in session while trying to time out client  " + sessionId);
                                        else
                                            (_b = getThisClientSession()) === null || _b === void 0 ? void 0 : _b.clients.delete(client.clientId);
                                        clients.delete(client.clientId);
                                        return console.error("\\x1b[31m Client not found, removing ids " + client + "\\x1b[0m");
                                    }
                                    clientSocket === null || clientSocket === void 0 ? void 0 : clientSocket.send(JSON.stringify(response_1));
                                });
                                resolve();
                            }
                        };
                        if (childProcess && childProcess.stdin && childProcess.stdout) {
                            // Use .on instead of .once, because GDB output can be split
                            (_a = childProcess.stdout) === null || _a === void 0 ? void 0 : _a.on("data", onData);
                            // Send the command
                            (_b = childProcess.stdin) === null || _b === void 0 ? void 0 : _b.write(command + "\n");
                        }
                        else
                            console.error("GDB process not found for session " + sessionId);
                    })];
            });
        });
    }
    var CommandQueue = Promise.resolve();
    function queueCommand(process, command, sessionId) {
        CommandQueue = CommandQueue.then(function () { return executeCommand(process, command, sessionId); });
        return CommandQueue;
    }
    function listFiles(dir) {
        fs_1.default.readdir(dir, function (err, files) {
            if (err) {
                printClientConsoleError("Error listing files: " + err.message);
            }
            else {
                // const fileContentMap: Map<string, string> = new Map<string, string>();
                // files.forEach(element => {
                //     fileContentMap.set(element, fs.readFileSync(path.join(clientFilesPath, element)).toString());
                // });
                var targetFiles = files.filter(function (file) {
                    return ![".exe", ".o"].includes(path_1.default.extname(file).toLowerCase());
                });
                ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.FileManagement, body: { command: FileManagementCommands.List, content: targetFiles } })); // Send the list of files to the client
            }
        });
    }
    function openFile(fileName) {
        // if(fs.existsSync(path.join(clientFilesPath, fileName)))
        // console.log("path: " + path.join(clientFilesPath || path.join(__dirname, "cache", sessionId,"clientFiles"), fileName))
        fs_1.default.readFile(path_1.default.join(clientFilesPath, fileName), function (err, data) {
            var _a, _b;
            if (err) {
                printClientConsoleError("Error opening file: " + err.message);
            }
            else {
                // Send the file content to the client
                console.log("File opened successfully");
                var oldFileName_1 = (_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.clientsActiveFile.get(clientId);
                replicateSocketMessage(sessionId, clientId, true, { type: types_1.WebSocketMessageType.CodeSelection, body: null }, function (client) { var _a; return ((_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.clientsActiveFile.get(client)) === oldFileName_1; }); // potential fix for a glitch where markers dont get deleted when switching tabs
                (_b = getThisClientSession()) === null || _b === void 0 ? void 0 : _b.clientsActiveFile.set(clientId, fileName);
                ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.FileManagement, body: { command: FileManagementCommands.Open, content: data.toString(), fileName: fileName } })); // Send the list of files to the client
            }
        });
    }
    // Handle GDB session commands from client
    ws.on("message", function (message, isBinary) { return __awaiter(void 0, void 0, void 0, function () {
        function handleCommand(command, sockets) {
            return __awaiter(this, void 0, void 0, function () {
                function executeProgram() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            new Promise(function (resolve, reject) {
                                console.log("executing program");
                                var filePath = path_1.default.join(__dirname, "cache", sessionId, "main.exe");
                                fs_1.default.stat(filePath, function (err, stats) {
                                    var _a, _b;
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
                                    (_a = program.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (data) {
                                        gdbBuffer += data.toString();
                                        ws.send(JSON.stringify({ error: false, input: false, type: types_1.WebSocketMessageType.Output, body: gdbBuffer.toString() })); // Send GDB output to the client
                                        gdbBuffer = "";
                                    });
                                    program.on("spawn", function () {
                                        console.log("Program started successfully");
                                    });
                                    (_b = program.stderr) === null || _b === void 0 ? void 0 : _b.on("data", function (data) {
                                        gdbBuffer += data.toString();
                                        ws.send(JSON.stringify({ error: true, input: false, type: types_1.WebSocketMessageType.Error, body: gdbBuffer.toString() })); // Send GDB output to the client
                                        gdbBuffer = "";
                                    });
                                    program.on("close", function (code) {
                                        if (code === null)
                                            return ws.send("Program exited with invalid code");
                                        gdbBuffer = "Program exited with code: " + (code === null || code === void 0 ? void 0 : code.toString());
                                        ws.send(JSON.stringify({ error: false, input: false, end: true, type: types_1.WebSocketMessageType.End, body: gdbBuffer.toString() })); // Send GDB output to the client
                                        gdbBuffer = "";
                                        removeProcessFromMap(sessionId);
                                        resolve(); // Resolve the promise when the process closes
                                    });
                                    //await queueCommand(program,message);
                                });
                            });
                            return [2 /*return*/];
                        });
                    });
                }
                var filePath;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            if (!(command == "execute")) return [3 /*break*/, 1];
                            // execute code normally.
                            if (!getProcessFromMap(sessionId)) // check if program is running
                             {
                                executeProgram();
                            }
                            else {
                                printClientConsoleError('program is already running! killing program'); // await queueCommand(program,command, sessionId);
                                (_a = getProcessFromMap(sessionId)) === null || _a === void 0 ? void 0 : _a.kill(); // kill the program
                                removeProcessFromMap(sessionId);
                            }
                            return [3 /*break*/, 10];
                        case 1:
                            if (!(command == "run")) return [3 /*break*/, 5];
                            mode = "debug";
                            if (!!getProcessFromMap(sessionId)) return [3 /*break*/, 2];
                            filePath = path_1.default.join(__dirname, "cache", sessionId, "main.exe");
                            gdbProcess = (0, child_process_1.spawn)("gdb", ["-q", "-ex", "set pagination off", "-ex", "set print thread-events off", filePath]);
                            addProcessToMap(sessionId, gdbProcess);
                            app.get("/requestValue", function (req, res) {
                                var command = req.query.value;
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
                                new Promise(function (resolve, reject) {
                                    var _a, _b;
                                    var gdbBuffer = "";
                                    var onData = function (data) {
                                        var _a;
                                        gdbBuffer += data.toString();
                                        // Check if the full response has arrived
                                        if (gdbBuffer.includes("(gdb)")) {
                                            // We have everything, remove listener
                                            (_a = gdbProcess === null || gdbProcess === void 0 ? void 0 : gdbProcess.stdout) === null || _a === void 0 ? void 0 : _a.removeListener("data", onData);
                                            resolve();
                                            console.log(clientId + " " + gdbBuffer);
                                            return res.send(({
                                                error: false,
                                                input: false,
                                                type: types_1.WebSocketMessageType.Output,
                                                body: gdbBuffer,
                                                message: command === null || command === void 0 ? void 0 : command.toString()
                                            }));
                                        }
                                    };
                                    if (gdbProcess && gdbProcess.stdin && gdbProcess.stdout) {
                                        // Use .on instead of .once, because GDB output can be split
                                        (_a = gdbProcess === null || gdbProcess === void 0 ? void 0 : gdbProcess.stdout) === null || _a === void 0 ? void 0 : _a.on("data", onData);
                                        // Send the command
                                        (_b = gdbProcess === null || gdbProcess === void 0 ? void 0 : gdbProcess.stdin) === null || _b === void 0 ? void 0 : _b.write("print " + command + "\n");
                                    }
                                    else
                                        console.error("GDB process not found for session " + sessionId);
                                });
                            });
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, queueCommand(gdbProcess, command, sessionId)];
                        case 3:
                            _e.sent(); // gdbProcess.stdin.write(message + "\n");
                            _e.label = 4;
                        case 4: return [3 /*break*/, 10];
                        case 5:
                            if (!(mode == "debug")) return [3 /*break*/, 9];
                            if (!args_1.includes('console')) return [3 /*break*/, 6];
                            (_b = gdbProcess === null || gdbProcess === void 0 ? void 0 : gdbProcess.stdin) === null || _b === void 0 ? void 0 : _b.write(command + "\n");
                            console.log("executed console command " + command);
                            gdbBuffer = "";
                            // Use .on instead of .once, because GDB output can be split
                            (_c = gdbProcess === null || gdbProcess === void 0 ? void 0 : gdbProcess.stdout) === null || _c === void 0 ? void 0 : _c.on("data", function (data) {
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
                            return [3 /*break*/, 8];
                        case 6:
                            if (!gdbProcess) return [3 /*break*/, 8];
                            return [4 /*yield*/, queueCommand(gdbProcess, command, sessionId)
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
                            ];
                        case 7:
                            _e.sent();
                            _e.label = 8;
                        case 8: return [3 /*break*/, 10];
                        case 9:
                            if (program) {
                                (_d = program.stdin) === null || _d === void 0 ? void 0 : _d.write(command); //program.stdin.write(message + "\n");
                                console.log("sent to program");
                            }
                            _e.label = 10;
                        case 10: return [2 /*return*/];
                    }
                });
            });
        }
        var messageJSON_1, command, args_1, type, shouldSave, fileName_1, commandType_1;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            try {
                messageJSON_1 = JSON.parse(message.toString());
                command = messageJSON_1.command;
                args_1 = messageJSON_1.args;
                type = messageJSON_1.type;
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
                        console.log("Client ping: " + (clientObj === null || clientObj === void 0 ? void 0 : clientObj.ping));
                        //console.log("Received heartbeat from client " + clientId);
                        break;
                    case types_1.WebSocketMessageType.Handshake:
                        //handle heartbeat
                        heartbeatInterval = setInterval(function () {
                            var _a, _b;
                            server.getConnections(function (error, count) {
                                console.log(count);
                            });
                            heartbeatTimestamp = Date.now(); // Update the heartbeat timestamp when a message is received
                            ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.Heartbeat, connections: server.connections, expectedDelay: heartbeatTimeout })); // Send a ping message to the client every 30 seconds
                            if (Date.now() - heartbeatTimestamp >= heartbeatTimeout * 2) {
                                //console.log("Client " + clientId + " timed out ");
                                //sessions.delete(sessionId);
                                if ((_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.clients.get(clientId))
                                    console.error("Client not found in session while trying to time out client  " + sessionId);
                                else
                                    (_b = getThisClientSession()) === null || _b === void 0 ? void 0 : _b.clients.delete(clientId);
                                clients.delete(clientId);
                                clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
                                ws.close(); // Close the connection if no response received within double of timeout seconds
                            }
                        }, heartbeatTimeout);
                        // TODO Check if session exists, otherwise create a new one and make this client the host.
                        if (messageJSON_1.sessionId) {
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
                            if (sessionMap.has(messageJSON_1.sessionId)) // = There is an active session, join it.
                             {
                                clientSession = sessionMap.get(messageJSON_1.sessionId) || new uuidv4();
                                clientId = getThisClientSession().spawnClient(ws);
                                clientObj = getThisClientSession().getClientObjectById(clientId);
                            }
                            else // there is no session, create it.
                             {
                                //getThisClientSession()?.clients.push(clientId); // add client to client list.
                                clientSession = createThisClientSession(messageJSON_1.sessionId);
                                clientId = (_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.spawnClient(ws);
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
                                clientId = (_b = getThisClientSession()) === null || _b === void 0 ? void 0 : _b.spawnClient(ws);
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
                            (_d = (_c = getProcessFromMap(sessionId)) === null || _c === void 0 ? void 0 : _c.stdin) === null || _d === void 0 ? void 0 : _d.write(messageJSON_1.command + "\n");
                        console.log("sent to program", messageJSON_1.command);
                        replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.Console, messageType: types_1.ConsoleMessageType.UserChat, body: messageJSON_1.command, clientDisplayName: clientObj === null || clientObj === void 0 ? void 0 : clientObj.displayName });
                        // clients.forEach((client, id) => {
                        //         client.send(JSON.stringify({error: false, input: false, clientId: clientId, type: WebSocketMessageType.Console, body: messageJSON.command})); // Send initial message to client
                        // });
                        break;
                    case types_1.WebSocketMessageType.CodeChange:
                    case types_1.WebSocketMessageType.CodeSelection:
                        shouldSave = messageJSON_1.saveFile;
                        fileName_1 = messageJSON_1.fileName;
                        if (true && type === types_1.WebSocketMessageType.CodeChange) {
                            console.log(messageJSON_1);
                            //   TODO make a more efficient way of updating the file, either by streams or a save button.
                            fs_1.default.writeFile(path_1.default.join(clientFilesPath, fileName_1), messageJSON_1.body, function (err) {
                                if (err)
                                    console.log("Failed saving file!");
                                console.log("saved file");
                            });
                        }
                        replicateSocketMessage(sessionId, clientId, true, { type: type, body: messageJSON_1 }, function (client) { var _a, _b; var filter = ((_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.clientsActiveFile.get(client)) != fileName_1; console.log(((_b = getThisClientSession()) === null || _b === void 0 ? void 0 : _b.clientsActiveFile.get(client)) + fileName_1); return filter; });
                        // clients.forEach((client, id) => {
                        //     if(clientId!=id)
                        //         client.send(JSON.stringify({error: false, type: type, body: messageJSON})); // Send initial message to client
                        // });
                        break;
                    case types_1.WebSocketMessageType.FileManagement:
                        commandType_1 = messageJSON_1.command;
                        switch (commandType_1) {
                            case FileManagementCommands.Create:
                                if (!fs_1.default.existsSync(path_1.default.join(clientFilesPath, messageJSON_1.body)))
                                    fs_1.default.writeFile(path_1.default.join(clientFilesPath, messageJSON_1.body), "", function (err) {
                                        if (err) {
                                            printClientConsoleError("Error creating file: " + err.message);
                                        }
                                        else {
                                            var fileName_2 = messageJSON_1.body.toString();
                                            ;
                                            replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.FileManagement, body: { content: fileName_2, command: commandType_1 || FileManagementCommands.Create } }); // Send the list of files to the client
                                            console.log("File created successfully");
                                        }
                                    });
                                else
                                    printClientConsoleError("File already exists!");
                                break;
                            case FileManagementCommands.Delete:
                                fs_1.default.unlink(path_1.default.join(clientFilesPath, messageJSON_1.body), function (err) {
                                    if (err) {
                                        printClientConsoleError("Error deleting file: " + err.message);
                                    }
                                    else {
                                        console.log("File deleted successfully");
                                        replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.FileManagement, body: ({ command: commandType_1, content: messageJSON_1.fileName, }) });
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
                                openFile(messageJSON_1.body);
                                break;
                        }
                    default:
                        if (clientId === sessionId)
                            // handle case when client is the session owner
                            handleCommand(command, [[clientId, ws]]);
                        else
                            // handle case when client is a collaborator
                            handleCommand(command, clients); // pass all the clients in the session
                }
            }
            catch (err) {
                console.error("Command execution error:", err);
                ws.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Error, message: "Execution failed." }));
            }
            return [2 /*return*/];
        });
    }); });
    // First time, setup breakpoints manually and run
    // ws.on("open", () => {
    //     // Set breakpoint at main() and start the program
    //   //  gdbProcess.stdin.write("break main\n");
    //    // gdbProcess.stdin.write("run\n");
    //    console.log("Client " + clientId + " connected to GDB server dkkkkkkkkkkk");
    // });
    function onCloseSession() {
        var _a, _b, _c, _d;
        var process = getProcessFromMap(sessionId);
        replicateSocketMessage(sessionId, clientId, true, { type: types_1.WebSocketMessageType.CodeSelection, body: "" });
        clients.delete(clientId);
        clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
        // getThisClientSession()?.clients.splice(getThisClientSession()?.clients.indexOf(clientId)||-1 , 1);
        (_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.onRemoveClient(clientId);
        //sessions.delete(sessionId);
        // if(sessions.get(sessionId)?.indexOf(clientId) === -1)  console.error("Client not found in session " + sessionId);
        //    else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(clientId) || -1, 1);
        if (((_b = getThisClientSession()) === null || _b === void 0 ? void 0 : _b.clients.size) == 0) {
            // sessions.delete(sessionId);
            fs_1.default.rmdir(path_1.default.join(__dirname, "cache", sessionId), { recursive: true }, function (err) {
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
            if (((_c = getThisClientSession()) === null || _c === void 0 ? void 0 : _c.clients.size) != 0)
                replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.ColabData, body: JSON.stringify({ clients: (_d = getThisClientSession()) === null || _d === void 0 ? void 0 : _d.clients }) });
            replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.Console, body: "$: Client " + clientId + " disconnected!" });
        }
    }
    // Handle WebSocket disconnection
    ws.on("close", function () {
        onCloseSession();
        console.log("Client " + clientId + " disconnected");
    });
});
process.on('SIGTERM', function () {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(function () {
    });
});
