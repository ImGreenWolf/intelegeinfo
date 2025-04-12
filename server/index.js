"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const ws_1 = __importDefault(require("ws"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
let gdbProcess = null;
let gdbBuffer = "";
let localsWritten = false;
let localsToWrite = false;
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
wss.on("connection", (ws) => {
    console.log("Client connected to GDB server");
    if (gdbProcess) {
        gdbProcess.kill(); // Ensure only one GDB session runs at a time
    }
    // Start GDB session
    gdbProcess = (0, child_process_1.spawn)("gdb", ["-q", "-ex", "set pagination off", "-ex", "set print thread-events off", "user_program.exe"]);
    gdbProcess.stdout.on("data", (data) => {
        gdbBuffer += data.toString();
        ws.send(gdbBuffer); // Send GDB output to the client
        gdbBuffer = "";
    });
    gdbProcess.stderr.on("data", (data) => {
        ws.send("Error: " + data.toString());
    });
    // Handle GDB session commands from client
    ws.on("message", (message) => {
        console.log("Received GDB command:", message.toString());
        if (gdbProcess) {
            gdbProcess.stdin.write(message + "\n");
            // After next/continue, fetch local variables
            if (message.toString() === "next" || message.toString() === "continue") {
                localsToWrite = true;
                gdbProcess.stdin.write("info locals\n"); // Fetch local variables after stepping
            }
        }
    });
    // First time, setup breakpoints manually and run
    ws.on("open", () => {
        // Set breakpoint at main() and start the program
        gdbProcess.stdin.write("break main\n");
        gdbProcess.stdin.write("run\n");
    });
    ws.on("close", () => {
        if (gdbProcess) {
            gdbProcess.kill();
            gdbProcess = null;
        }
        console.log("Client disconnected");
    });
});
app.listen(3000, () => console.log("Server running on port 3000"));
