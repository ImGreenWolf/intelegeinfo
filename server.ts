import express from "express";
import fs from "fs";
import { ChildProcess, spawn } from "child_process";
import WebSocket from "ws";
import path from 'path';
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());
app.use(express.static("public"));
// Start GDB session

let gdbBuffer = "";
let localsWritten = false;
let localsToWrite = false;
let runningProcesses: Map<UUID, ChildProcess> = new Map();

app.use(express.urlencoded({ extended: true }));


import problemCreator from './server/routes/problemCreator.js'
import { UUID } from "crypto";

app.use('/', problemCreator);
console.log(typeof problemCreator);


const server = app.listen(3000, () => console.log("Server running on port 3000"));

// Compile and Run C++ Code
app.get("/getCompiledCode", (req, res) => {

    res.send({code: fs.readFileSync("user_code.cpp").toString()});

});



interface CompileRequestBody {
    code: string;
}

interface CompileResponse {
    success?: boolean;
    error?: string;
}

app.post("/compile", (req: express.Request<{}, {}, CompileRequestBody>, res: express.Response<CompileResponse>) => {
    const code = req.body.code;
    fs.writeFileSync("user_code.cpp", code);

    const compileProcess = spawn("g++", ["-g", "user_code.cpp", "-o", "user_program.exe"]);
    let errorData = "";

    compileProcess.stderr.on("data", (data: Buffer) => {
        errorData += data.toString();
    });

    compileProcess.on("close", (code: number) => {
        if (code === 0) {
            res.json({ success: true });
        } else {
            res.json({ error: errorData || "Compilation failed" });
        }
    });
});

// WebSocket Server for Debugging
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();


function addProcessToMap(clientId: UUID, process: ChildProcess) {
    runningProcesses.set(clientId, process);
}

function removeProcessFromMap(clientId: UUID) {
    runningProcesses.delete(clientId);
}
function getProcessFromMap(clientId: UUID): ChildProcess | undefined {
    return runningProcesses.get(clientId);
}


wss.on("connection", (ws: WebSocket) => {
    let gdbProcess: ChildProcess;
    let program: ChildProcess;

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
    async function executeCommand(childProcess: ChildProcess, command: string): Promise<void> {
        return new Promise((resolve, reject) => {
            let gdbBuffer = "";
    
            const onData = (data: Buffer) => {
                gdbBuffer += data.toString();
    
                // Check if the full response has arrived
                if (gdbBuffer.includes("(gdb)")) {
                    // We have everything, remove listener
                    (childProcess.stdout as NodeJS.ReadableStream).removeListener("data", onData);
                    const response: {
                        error: boolean;
                        input: boolean;
                        body: string;
                        message: string;
                    } = {
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
            childProcess.stdout?.on("data", onData);
    
            // Send the command
            childProcess.stdin?.write(command + "\n");
        });
    }
    
        let CommandQueue = Promise.resolve();

        function queueCommand(process: ChildProcess,command: string) {
            CommandQueue = CommandQueue.then(() => executeCommand(process, command));
            return CommandQueue;
        }
   

    // Handle GDB session commands from client
    ws.on("message", async (message: Buffer, isBinary: boolean) => {


        try {
            const messageJSON = JSON.parse(message.toString());
            const command = messageJSON.command
            const args = messageJSON.args;

            if(command == "execute")
            {
                if(!program)
                {
                program = spawn("user_program.exe");
                addProcessToMap(clientId, program);
                mode = "run";

                // program.stdin?.resume();
                // program.stdin?.setEncoding('utf8');

                program.stdin?.on('data', function (chunk) {
                   console.log("await input")
                });

                program.stdout?.on("data", (data) => {
                    gdbBuffer += data.toString();
                        ws.send(JSON.stringify({error: false, input: false, body: gdbBuffer.toString()}));  // Send GDB output to the client
                        gdbBuffer = "";
                });
                
                
                program.stderr?.on("data", (data) => {
                    gdbBuffer += data.toString();
                        ws.send(JSON.stringify({error: true, input: false, body: gdbBuffer.toString()}));  // Send GDB output to the client
                        gdbBuffer = "";
                });
                
                program.on("close", (code) => {
                    if(!code) return ws.send("Program exited with invalid code");
                    gdbBuffer = "Program exited with code: " + code.toString();
                    ws.send(JSON.stringify({error: false, input: false, end: true, body: gdbBuffer.toString()}));  // Send GDB output to the client
                    gdbBuffer = "";
                });
                //await queueCommand(program,message);
            }
            else  await queueCommand(program,command);
            }
            else if(command == "run")
            {
                mode="debug";
                if(!gdbProcess) {
                    gdbProcess = spawn("gdb", ["-q", "-ex", "set pagination off", "-ex", "set print thread-events off", "user_program.exe"]);
                    addProcessToMap(clientId, gdbProcess);
                    app.get("/requestValue", (req,res) => {
                        const command = req.query.value;
                        console.log(clientId + " " + command)
                        if(!gdbProcess)  res.status(400).send('Bad Request: GDB process not active');
                        if(!command)     res.status(400).send('Bad Request: invalid command');
                        //res.send({code: fs.readFileSync("user_code.cpp").toString()});
                        
                        
                        new Promise<void>((resolve, reject) => {
                            let gdbBuffer = "";
                    
                            const onData = (data: Buffer) => {
                                gdbBuffer += data.toString();
                    
                                // Check if the full response has arrived
                                if (gdbBuffer.includes("(gdb)")) {
                                    // We have everything, remove listener
                                    gdbProcess?.stdout?.removeListener("data", onData);
                                    resolve();
                                    console.log(clientId + " " + gdbBuffer)
                                    return res.send(({
                                        error: false,
                                        input: false,
                                        body: gdbBuffer,
                                        message: command?.toString()
                                    }));
                    
                                    
                                }
                            };
                    
                            // Use .on instead of .once, because GDB output can be split
                            gdbProcess?.stdout?.on("data", onData);
                    
                            // Send the command
                            gdbProcess?.stdin?.write("print " + command + "\n");
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
                else  await queueCommand(gdbProcess,command);// gdbProcess.stdin.write(message + "\n");
                    
                    
    
            } else {


                if(mode=="debug")
                {
                    
                    if(args.includes('console'))
                        {
                            gdbProcess?.stdin?.write(command + "\n");
                            console.log("executed console command " + command)
                            gdbBuffer="";
                           
                    
                            // Use .on instead of .once, because GDB output can be split
                            gdbProcess?.stdout?.on("data", (data) => {
                                gdbBuffer += data.toString();
                                console.log(clientId + " " + gdbBuffer)
                                ws.send(JSON.stringify({
                                    error: false,
                                    input: false,
                                    body: gdbBuffer,
                                    message: command.toString()
                                }));
                            });
                        } 
                    else if(gdbProcess) await queueCommand(gdbProcess,command)
                        
                    

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
                } else
                {
                    if(program)
                    {
                        program.stdin?.write(command); //program.stdin.write(message + "\n");
                        console.log("sent to program")
                    }
                    
                }
            }
    } catch (err) {
        console.error("Command execution error:", err);
        ws.send(JSON.stringify({ error: true, message: "Execution failed." }));
    }
    }); 
    
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


