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
const { v4: uuidv4 } = require('uuid');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
// Start GDB session
let gdbBuffer = "";
let localsWritten = false;
let localsToWrite = false;
let runningProcesses = new Map();
app.use(express_1.default.urlencoded({ extended: true }));
const problemCreator_js_1 = __importDefault(require("./server/routes/problemCreator.js"));
app.use('/', problemCreator_js_1.default);
console.log(typeof problemCreator_js_1.default);
const server = app.listen(3000, () => console.log("Server running on port 3000"));
// Compile and Run C++ Code
app.get("/getCompiledCode", (req, res) => {
    res.send({ code: fs_1.default.readFileSync("user_code.cpp").toString() });
});
app.post("/compile", (req, res) => {
    const code = req.body.code;
    fs_1.default.writeFileSync("user_code.cpp", code);
    const compileProcess = (0, child_process_1.spawn)("g++", ["-g", "user_code.cpp", "-o", "user_program.exe"]);
    let errorData = "";
    compileProcess.stderr.on("data", (data) => {
        errorData += data.toString();
    });
    compileProcess.on("close", (code) => {
        if (code === 0) {
            res.json({ success: true });
        }
        else {
            res.json({ error: errorData || "Compilation failed" });
        }
    });
});
// WebSocket Server for Debugging
const wss = new ws_1.default.Server({ port: 8080 });
const clients = new Map();
function addProcessToMap(clientId, process) {
    runningProcesses.set(clientId, process);
}
function removeProcessFromMap(clientId) {
    runningProcesses.delete(clientId);
}
function getProcessFromMap(clientId) {
    return runningProcesses.get(clientId);
}
wss.on("connection", (ws) => {
    let gdbProcess;
    let program;
    const clientId = uuidv4(); // Generate a unique ID
    clients.set(clientId, ws);
    // if (gdbProcess) {
    //     gdbProcess.kill(); // Ensure only one GDB session runs at a time
    // }
    // if (program) {
    //     program.kill(); // Ensure only one GDB session runs at a time
    // }
    console.log("Client connected to GDB server" + clientId);
    let mode = "run"; //debug
    // debug only for now
    function executeCommand(childProcess, command) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var _a, _b;
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
                            body: gdbBuffer,
                            message: command.toString()
                        };
                        ws.send(JSON.stringify(response));
                        resolve();
                    }
                };
                // Use .on instead of .once, because GDB output can be split
                (_a = childProcess.stdout) === null || _a === void 0 ? void 0 : _a.on("data", onData);
                // Send the command
                (_b = childProcess.stdin) === null || _b === void 0 ? void 0 : _b.write(command + "\n");
            });
        });
    }
    let CommandQueue = Promise.resolve();
    function queueCommand(process, command) {
        CommandQueue = CommandQueue.then(() => executeCommand(process, command));
        return CommandQueue;
    }
    // Handle GDB session commands from client
    ws.on("message", (message, isBinary) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        try {
            const messageJSON = JSON.parse(message.toString());
            const command = messageJSON.command;
            const args = messageJSON.args;
            if (command == "execute") {
                if (!program) {
                    program = (0, child_process_1.spawn)("user_program.exe");
                    addProcessToMap(clientId, program);
                    mode = "run";
                    // program.stdin?.resume();
                    // program.stdin?.setEncoding('utf8');
                    (_a = program.stdin) === null || _a === void 0 ? void 0 : _a.on('data', function (chunk) {
                        console.log("await input");
                    });
                    (_b = program.stdout) === null || _b === void 0 ? void 0 : _b.on("data", (data) => {
                        gdbBuffer += data.toString();
                        ws.send(JSON.stringify({ error: false, input: false, body: gdbBuffer.toString() })); // Send GDB output to the client
                        gdbBuffer = "";
                    });
                    (_c = program.stderr) === null || _c === void 0 ? void 0 : _c.on("data", (data) => {
                        gdbBuffer += data.toString();
                        ws.send(JSON.stringify({ error: true, input: false, body: gdbBuffer.toString() })); // Send GDB output to the client
                        gdbBuffer = "";
                    });
                    program.on("close", (code) => {
                        if (!code)
                            return ws.send("Program exited with invalid code");
                        gdbBuffer = "Program exited with code: " + code.toString();
                        ws.send(JSON.stringify({ error: false, input: false, end: true, body: gdbBuffer.toString() })); // Send GDB output to the client
                        gdbBuffer = "";
                    });
                    //await queueCommand(program,message);
                }
                else
                    yield queueCommand(program, command);
            }
            else if (command == "run") {
                mode = "debug";
                if (!gdbProcess) {
                    gdbProcess = (0, child_process_1.spawn)("gdb", ["-q", "-ex", "set pagination off", "-ex", "set print thread-events off", "user_program.exe"]);
                    addProcessToMap(clientId, gdbProcess);
                    app.get("/requestValue", (req, res) => {
                        const command = req.query.value;
                        console.log(clientId + " " + command);
                        if (!gdbProcess)
                            res.status(400).send('Bad Request: GDB process not active');
                        if (!command)
                            res.status(400).send('Bad Request: invalid command');
                        //res.send({code: fs.readFileSync("user_code.cpp").toString()});
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
                                        body: gdbBuffer,
                                        message: command === null || command === void 0 ? void 0 : command.toString()
                                    }));
                                }
                            };
                            // Use .on instead of .once, because GDB output can be split
                            (_a = gdbProcess === null || gdbProcess === void 0 ? void 0 : gdbProcess.stdout) === null || _a === void 0 ? void 0 : _a.on("data", onData);
                            // Send the command
                            (_b = gdbProcess === null || gdbProcess === void 0 ? void 0 : gdbProcess.stdin) === null || _b === void 0 ? void 0 : _b.write("print " + command + "\n");
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
                    yield queueCommand(gdbProcess, command); // gdbProcess.stdin.write(message + "\n");
            }
            else {
                if (mode == "debug") {
                    if (args.includes('console')) {
                        (_d = gdbProcess === null || gdbProcess === void 0 ? void 0 : gdbProcess.stdin) === null || _d === void 0 ? void 0 : _d.write(command + "\n");
                        console.log("executed console command " + command);
                        gdbBuffer = "";
                        // Use .on instead of .once, because GDB output can be split
                        (_e = gdbProcess === null || gdbProcess === void 0 ? void 0 : gdbProcess.stdout) === null || _e === void 0 ? void 0 : _e.on("data", (data) => {
                            gdbBuffer += data.toString();
                            console.log(clientId + " " + gdbBuffer);
                            ws.send(JSON.stringify({
                                error: false,
                                input: false,
                                body: gdbBuffer,
                                message: command.toString()
                            }));
                        });
                    }
                    else if (gdbProcess)
                        yield queueCommand(gdbProcess, command);
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
                        (_f = program.stdin) === null || _f === void 0 ? void 0 : _f.write(command); //program.stdin.write(message + "\n");
                        console.log("sent to program");
                    }
                }
            }
        }
        catch (err) {
            console.error("Command execution error:", err);
            ws.send(JSON.stringify({ error: true, message: "Execution failed." }));
        }
    }));
    // First time, setup breakpoints manually and run
    ws.on("open", () => {
        // Set breakpoint at main() and start the program
        //  gdbProcess.stdin.write("break main\n");
        // gdbProcess.stdin.write("run\n");
    });
    ws.on("close", () => {
        const process = getProcessFromMap(clientId);
        if (process) {
            process.kill();
            removeProcessFromMap(clientId);
        }
        console.log("Client " + clientId + " disconnected");
    });
});
