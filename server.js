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
const { v4: uuidv4 } = require('uuid');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
/* IMPORTS */
// FileManagement.ts
function createFile() {
}
/*END IMPORTS*/
let gdbBuffer = "";
let localsWritten = false;
let localsToWrite = false;
let runningProcesses = new Map();
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
// WebSocket Server for Debugging
const wss = new ws_1.default.Server({ port: 8080 });
const clients = new Map();
const sessions = new Map();
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
// session //
class EditorSession {
    constructor(sessionId) {
        this.clientsActiveFile = new Map();
        this.clients = [];
        this.sessionId = sessionId;
    }
}
const sessionMap = new Map();
wss.on("connection", (ws) => {
    let gdbProcess;
    let program;
    let sessionId;
    let clientId;
    let sessionType; // true for session, false for "local" client
    let clientFilesPath;
    let heartbeatTimestamp = Date.now();
    const heartbeatTimeout = 10000; // 1 second timeout for heartbeat
    let heartbeatInterval;
    // TODO add session map 
    // if (gdbProcess) {
    //     gdbProcess.kill(); // Ensure only one GDB session runs at a time
    // }
    // if (program) {
    //     program.kill(); // Ensure only one GDB session runs at a time
    // }
    const customStream = new stream_1.Writable({
        write(chunk, encoding, callback) {
            var _a;
            console.log(`Received from WebSocket, sending to C++ stdin: ${chunk.toString()}`);
            (_a = program.stdin) === null || _a === void 0 ? void 0 : _a.write(chunk, encoding, callback); // Forward to child stdin
        },
        final(callback) {
            var _a;
            (_a = program.stdin) === null || _a === void 0 ? void 0 : _a.end(); // Close stdin when done
            callback();
        }
    });
    function getThisClientSession() {
        return sessionMap.get(sessionId);
    }
    function createThisClientSession() {
        sessionMap.set(sessionId, new EditorSession(sessionId));
    }
    function printClientConsoleError(message) {
        const clientSocket = clients.get(clientId);
        if (clientSocket) {
            clientSocket.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Error, body: message }));
        }
        else {
            console.error("Client not found:", clientId);
        }
    }
    let mode = "run"; //debug
    function replicateSocketMessage(sessionId, senderId, ignoreSender, response, filterFunction) {
        var _a;
        (_a = sessions.get(sessionId)) === null || _a === void 0 ? void 0 : _a.forEach((client) => {
            //send response to all clients
            if (ignoreSender && clientId == client)
                return;
            if (filterFunction != undefined) {
                if (filterFunction(client) == false) {
                    const clientSocket = clients.get(client);
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
                const clientSocket = clients.get(client);
                if (!clientSocket) {
                    // if(sessions.get(sessionId)?.indexOf(client) === -1)  console.error("Client not found in session while trying to time out client  " + sessionId);
                    //                      else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(client) || -1, 1);
                    //                  clients.delete(client);
                    return console.error("\\x1b[31m Client not found while replicating message " + client + "\\x1b[0m");
                }
                // } return console.error("Client not found " + client);
                clientSocket === null || clientSocket === void 0 ? void 0 : clientSocket.send(JSON.stringify(response));
            }
        });
    }
    function connectionReady(cooperator = false) {
        var _a;
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
        replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.Console, body: "$: Client " + clientId + "  connected!" });
        console.log("Client connected to GDB server" + clientId);
        ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.Handshake, clientId: clientId, sessionId: sessionId })); // Send initial message to client
        if (((_a = sessions.get(sessionId)) === null || _a === void 0 ? void 0 : _a.length) != 1)
            replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.ColabData, body: JSON.stringify({ clients: sessions.get(sessionId), thisClientId: clientId, thisSessionId: sessionId }) });
    }
    let compileProcess;
    app.post("/compile", (req, res) => {
        // if(compileProcess) 
        //     {
        //         compileProcess.kill(); // kill the process if it is running
        //          console.error("Compile process already running for session " + sessionId);
        //     }
        var _a, _b, _c;
        // if(!sessionId) return;
        // if(!fs.existsSync(path.join(__dirname, "cache", sessionId))) return;
        const code = req.body.code;
        const filePath = path_1.default.join(__dirname, "cache", sessionId);
        fs_1.default.writeFileSync(path_1.default.join(filePath, "main.cpp"), code);
        compileProcess = (0, child_process_1.spawn)("g++", ["-g", path_1.default.join(filePath, "main.cpp"), "-o", path_1.default.join(filePath, "main.exe")], {
            windowsHide: true,
            detached: true,
        });
        let errorData = "";
        if (compileProcess != null) {
            (_a = compileProcess.stdin) === null || _a === void 0 ? void 0 : _a.end();
            (_b = compileProcess === null || compileProcess === void 0 ? void 0 : compileProcess.stderr) === null || _b === void 0 ? void 0 : _b.on("data", (data) => {
                errorData += data.toString();
            });
            (_c = compileProcess === null || compileProcess === void 0 ? void 0 : compileProcess.stdout) === null || _c === void 0 ? void 0 : _c.on("data", (data) => {
                console.log("stdout: " + data.toString());
            });
            compileProcess.on("close", (code) => {
                if (code === 0) {
                    res.json({ success: true });
                }
                else {
                    res.json({ error: errorData || "Compilation failed" });
                }
            });
        }
    });
    // debug only for now
    function executeCommand(childProcess, command, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var _a, _b;
                let gdbBuffer = "";
                const onData = (data) => {
                    var _a;
                    gdbBuffer += data.toString();
                    // Check if the full response has arrived
                    if (gdbBuffer.includes("(gdb)")) {
                        // We have everything, remove listener
                        childProcess.stdout.removeListener("data", onData);
                        const response = {
                            error: false,
                            input: false,
                            type: types_1.WebSocketMessageType.Output,
                            body: gdbBuffer,
                            message: command.toString()
                        };
                        (_a = sessions.get(sessionId)) === null || _a === void 0 ? void 0 : _a.forEach((client, id) => {
                            var _a, _b, _c;
                            //send response to all clients
                            const clientSocket = clients.get(client);
                            if (!clientSocket) {
                                //sessions.delete(sessionId);
                                if (((_a = sessions.get(sessionId)) === null || _a === void 0 ? void 0 : _a.indexOf(client)) === -1)
                                    console.error("Client not found in session while trying to time out client  " + sessionId);
                                else
                                    (_b = sessions.get(sessionId)) === null || _b === void 0 ? void 0 : _b.splice(((_c = sessions.get(sessionId)) === null || _c === void 0 ? void 0 : _c.indexOf(client)) || -1, 1);
                                clients.delete(client);
                                return console.error("\\x1b[31m Client not found, removing ids " + client + "\\x1b[0m");
                            }
                            clientSocket === null || clientSocket === void 0 ? void 0 : clientSocket.send(JSON.stringify(response));
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
            });
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
        fs_1.default.readFile(path_1.default.join(clientFilesPath, fileName), (err, data) => {
            var _a;
            if (err) {
                printClientConsoleError("Error opening file: " + err.message);
            }
            else {
                // Send the file content to the client
                console.log("File opened successfully");
                (_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.clientsActiveFile.set(clientId, fileName);
                ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.FileManagement, body: { command: FileManagementCommands.Open, content: data.toString(), fileName: fileName } })); // Send the list of files to the client
            }
        });
    }
    // Handle GDB session commands from client
    ws.on("message", (message, isBinary) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            const messageJSON = JSON.parse(message.toString());
            const command = messageJSON.command;
            const args = messageJSON.args;
            const type = messageJSON.type;
            //console.log("Received message from client: ", messageJSON);
            //console.log("Received message from client: ", type);
            //console.log(sessions)
            console.log((_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.clientsActiveFile);
            switch (type) {
                case types_1.WebSocketMessageType.Heartbeat:
                    heartbeatTimestamp = Date.now(); // Update the heartbeat timestamp when a message is received
                    //console.log("Received heartbeat from client " + clientId);
                    break;
                case types_1.WebSocketMessageType.Handshake:
                    //handle heartbeat
                    heartbeatInterval = setInterval(() => {
                        var _a, _b, _c;
                        ws.send(JSON.stringify({ type: types_1.WebSocketMessageType.Heartbeat })); // Send a ping message to the client every 30 seconds
                        if (Date.now() - heartbeatTimestamp > heartbeatTimeout * 2) {
                            //console.log("Client " + clientId + " timed out ");
                            //sessions.delete(sessionId);
                            if (((_a = sessions.get(sessionId)) === null || _a === void 0 ? void 0 : _a.indexOf(clientId)) === -1)
                                console.error("Client not found in session while trying to time out client  " + sessionId);
                            else
                                (_b = sessions.get(sessionId)) === null || _b === void 0 ? void 0 : _b.splice(((_c = sessions.get(sessionId)) === null || _c === void 0 ? void 0 : _c.indexOf(clientId)) || -1, 1);
                            clients.delete(clientId);
                            clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
                            ws.close(); // Close the connection if no response received within 1 seconds
                        }
                    }, heartbeatTimeout);
                    // for(const wsToCheck of clients.values())
                    // {
                    //     if( wsToCheck == ws) return console.error('Client already logged in! ' + clientId);
                    // }
                    if (messageJSON.sessionId) {
                        //client connected to existing session
                        sessionId = messageJSON.sessionId;
                        clientId = uuidv4();
                        clientFilesPath = path_1.default.join(__dirname, "cache", sessionId, "clientFiles");
                        // console.log("Client " + clientId + " connected to session " + sessionId);
                        //   if(sessions.has(sessionId))
                        //     sessions.get(sessionId)?.push(clientId);
                        // else 
                        //     {
                        //         sessions.set(sessionId, [clientId]);
                        //         getThisClientSession()?.clientsActiveFile
                        //     }
                        if (!getThisClientSession()) {
                            (_b = getThisClientSession()) === null || _b === void 0 ? void 0 : _b.clients.push(clientId);
                            createThisClientSession();
                        }
                        else {
                            (_c = getThisClientSession()) === null || _c === void 0 ? void 0 : _c.clients.push(clientId);
                        }
                        clients.set(clientId, ws);
                        connectionReady(true);
                    }
                    else {
                        //client connected to new session
                        clientId = uuidv4(); // Generate a unique ID
                        sessionId = clientId; // Use the generated ID as the session ID
                        sessions.set(clientId, [sessionId]);
                        clients.set(clientId, ws);
                        connectionReady(false);
                    }
                    //    if(fs.existsSync(path.join(__dirname, "cache", sessionId)))
                    //      fs.writeFileSync(path.join(__dirname, "cache", sessionId , "user_code.cpp"), "// C++ code here\n");
                    break;
                case types_1.WebSocketMessageType.Console:
                    if (getProcessFromMap(sessionId) != undefined)
                        (_e = (_d = getProcessFromMap(sessionId)) === null || _d === void 0 ? void 0 : _d.stdin) === null || _e === void 0 ? void 0 : _e.write(messageJSON.command + "\n");
                    console.log("sent to program", messageJSON.command);
                    replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.Console, body: messageJSON.command });
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
                    replicateSocketMessage(sessionId, clientId, true, { type: type, body: messageJSON }, (client) => { var _a, _b; let filter = ((_a = getThisClientSession()) === null || _a === void 0 ? void 0 : _a.clientsActiveFile.get(client)) === fileName; console.log(((_b = getThisClientSession()) === null || _b === void 0 ? void 0 : _b.clientsActiveFile.get(client)) + fileName); return filter; });
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
                    function handleCommand(command, sockets) {
                        return __awaiter(this, void 0, void 0, function* () {
                            var _a, _b, _c, _d;
                            if (command == "execute") {
                                // execute code normally.
                                if (!getProcessFromMap(sessionId)) // check if program is running
                                 {
                                    function executeProgram() {
                                        return __awaiter(this, void 0, void 0, function* () {
                                            new Promise((resolve, reject) => {
                                                console.log("executing program");
                                                const filePath = path_1.default.join(__dirname, "cache", sessionId, "main.exe");
                                                fs_1.default.stat(filePath, (err, stats) => {
                                                    var _a, _b;
                                                    if (err) {
                                                        printClientConsoleError('$: Please compile the program first!');
                                                        return;
                                                    }
                                                    program = (0, child_process_1.spawn)(filePath, {
                                                        cwd: path_1.default.join(__dirname, "cache", sessionId, "clientFiles"),
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
                                                    (_a = program.stdout) === null || _a === void 0 ? void 0 : _a.on("data", (data) => {
                                                        gdbBuffer += data.toString();
                                                        ws.send(JSON.stringify({ error: false, input: false, type: types_1.WebSocketMessageType.Output, body: gdbBuffer.toString() })); // Send GDB output to the client
                                                        gdbBuffer = "";
                                                    });
                                                    program.on("spawn", () => {
                                                        console.log("Program started successfully");
                                                    });
                                                    (_b = program.stderr) === null || _b === void 0 ? void 0 : _b.on("data", (data) => {
                                                        gdbBuffer += data.toString();
                                                        ws.send(JSON.stringify({ error: true, input: false, type: types_1.WebSocketMessageType.Error, body: gdbBuffer.toString() })); // Send GDB output to the client
                                                        gdbBuffer = "";
                                                    });
                                                    program.on("close", (code) => {
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
                                        });
                                    }
                                    executeProgram();
                                }
                                else {
                                    printClientConsoleError('program is already running! killing program'); // await queueCommand(program,command, sessionId);
                                    (_a = getProcessFromMap(sessionId)) === null || _a === void 0 ? void 0 : _a.kill(); // kill the program
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
                                            var _a, _b;
                                            let gdbBuffer = "";
                                            const onData = (data) => {
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
                                    yield queueCommand(gdbProcess, command, sessionId); // gdbProcess.stdin.write(message + "\n");
                            }
                            else {
                                if (mode == "debug") {
                                    if (args.includes('console')) {
                                        (_b = gdbProcess === null || gdbProcess === void 0 ? void 0 : gdbProcess.stdin) === null || _b === void 0 ? void 0 : _b.write(command + "\n");
                                        console.log("executed console command " + command);
                                        gdbBuffer = "";
                                        // Use .on instead of .once, because GDB output can be split
                                        (_c = gdbProcess === null || gdbProcess === void 0 ? void 0 : gdbProcess.stdout) === null || _c === void 0 ? void 0 : _c.on("data", (data) => {
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
                                        yield queueCommand(gdbProcess, command, sessionId);
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
                                        (_d = program.stdin) === null || _d === void 0 ? void 0 : _d.write(command); //program.stdin.write(message + "\n");
                                        console.log("sent to program");
                                    }
                                }
                            }
                        });
                    }
            }
        }
        catch (err) {
            console.error("Command execution error:", err);
            ws.send(JSON.stringify({ error: true, type: types_1.WebSocketMessageType.Error, message: "Execution failed." }));
        }
    }));
    // First time, setup breakpoints manually and run
    // ws.on("open", () => {
    //     // Set breakpoint at main() and start the program
    //   //  gdbProcess.stdin.write("break main\n");
    //    // gdbProcess.stdin.write("run\n");
    //    console.log("Client " + clientId + " connected to GDB server dkkkkkkkkkkk");
    // });
    function onCloseSession() {
        var _a, _b, _c, _d, _e;
        const process = getProcessFromMap(sessionId);
        replicateSocketMessage(sessionId, clientId, true, { type: types_1.WebSocketMessageType.CodeSelection, body: "" });
        clients.delete(clientId);
        clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
        clientsActiveFile.delete(clientId);
        //sessions.delete(sessionId);
        if (((_a = sessions.get(sessionId)) === null || _a === void 0 ? void 0 : _a.indexOf(clientId)) === -1)
            console.error("Client not found in session " + sessionId);
        else
            (_b = sessions.get(sessionId)) === null || _b === void 0 ? void 0 : _b.splice(((_c = sessions.get(sessionId)) === null || _c === void 0 ? void 0 : _c.indexOf(clientId)) || -1, 1);
        if (((_d = sessions.get(sessionId)) === null || _d === void 0 ? void 0 : _d.length) == 0) {
            sessions.delete(sessionId);
            fs_1.default.rmdir(path_1.default.join(__dirname, "cache", sessionId), { recursive: true }, (err) => {
                console.log("deleted cache folder for sessionId " + sessionId);
            });
            if (process) {
                process.kill();
                removeProcessFromMap(sessionId);
            }
            console.log("Deleted session " + sessionId);
        }
        else {
            //session is still active, send message to other clients
            if (((_e = sessions.get(sessionId)) === null || _e === void 0 ? void 0 : _e.length) != 1)
                replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.ColabData, body: JSON.stringify({ clients: sessions.get(sessionId) }) });
            replicateSocketMessage(sessionId, clientId, false, { type: types_1.WebSocketMessageType.Console, body: "$: Client " + clientId + " disconnected!" });
        }
    }
    // Handle WebSocket disconnection
    ws.on("close", () => {
        onCloseSession();
        console.log("Client " + clientId + " disconnected");
    });
});
