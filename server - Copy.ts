import express from "express";
import fs from "fs";
import { ChildProcess, spawn } from "child_process";
import WebSocket from "ws";
import path from 'path';
import { ConsoleMessageType, WebSocketMessageType } from './public/js/types'
import { Readable, Writable } from "stream";

import {RedisStore} from "connect-redis"
import {createClient} from "redis"
import session from "express-session"
const { v4: uuidv4 } = require('uuid');
const app = express();
const compression = require('compression')


const cluster = require('cluster');
const os = require('os');


app.use(compression())
app.use(express.json());
app.use(express.static("public"));


const numCPUs = os.cpus().length;

/* IMPORTS */

// FileManagement.ts

 function createFile() {
        
    }
        



/*END IMPORTS*/










app.use(express.urlencoded({ extended: true }));


import problemCreator from './server/routes/problemCreator.js'
import { UUID } from "crypto";
import { Console, error } from "console";

app.use('/', problemCreator);
console.log(typeof problemCreator);


const server = app.listen(3000, '0.0.0.0', () => console.log("Server running on port 3000"));

// Compile and Run C++ Code
app.get("/getCompiledCode", (req, res) => {

    res.send({code: fs.readFileSync("user_code.cpp").toString()});

});







interface CompileRequestBody {
    code: string;
    clientId: UUID;
    sessionId: UUID;
}

type errorObject = {
    row: Number,
    column: Number,
    error: String,
}

interface CompileResponse {
    success?: boolean;
    error?: errorObject[];
    fileName?: string;
}

enum FileManagementCommands {
    Create = "create",
    Delete = "delete",
    List = "list",
    Rename = "rename",
    Open = "open",
}


    console.log(`[MASTER] Running on PID ${process.pid}`);
  

        //          LOCAL  SERVER  VARIABLES       //

let compileProcess: ChildProcess;

    //                      END                      //  



        //          GLOBAL  SERVER  VARIABLES       //
const wss = new WebSocket.Server({ port: 8080 });

const clients: Map<UUID, WebSocket> = new Map();
// const sessions: Map<UUID, UUID[]> = new Map();

let runningProcesses: Map<UUID, ChildProcess> = new Map();
const sessionMap: Map<UUID, EditorSession> = new Map<UUID, EditorSession>(); // SESSION ID / EDITOR OBJECT

    //                      END                      //  


    let redisClient = createClient()
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
})

// Initialize session storage.
app.use(
  session({
    store: redisStore,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: "keyboard cat",
  }),
)


function addProcessToMap(sessionId: UUID, process: ChildProcess) {
    if (runningProcesses.has(sessionId)) {
        

    } else
    runningProcesses.set(sessionId, process);
    
}

function removeProcessFromMap(sessionId: UUID) {
    if (runningProcesses.has(sessionId)) {
        runningProcesses.delete(sessionId);
    } else console.error("Process not found in map for client " + sessionId);
}
function getProcessFromMap(sessionId: UUID): ChildProcess | undefined {
    return runningProcesses.get(sessionId);
}


fs.readdir(path.join(__dirname, "cache"), (err, files) => {

    if (err) {
        console.error("Error reading cache directory:", err);
        return;
    }

    files.forEach((file) => {
        fs.rmdir(path.join(__dirname, "cache", file), { recursive: true }, (err) => {
            if (err) {
                console.error("Error deleting cache folder:", err);
            } else {
                console.log("Deleted cache folder for client " + file);
            }
        });
    });
});

        // SESSION //



class EditorSession {
    sessionId: UUID;
    clientsActiveFile: Map<UUID, string> = new Map<UUID, string>(); // client , file name
    clients: Map<UUID,ClientObject> = new Map<UUID,ClientObject>();
    clientsDisplayNames: string[];
    public constructor(sessionId?: UUID) {
        this.sessionId = sessionId || uuidv4();
        this.clientsDisplayNames = this.getDisplayNames();
    }

    private getDisplayNames(): string[]
    {
        const nouns = ["lup", "leu", "raton", "pisică", "caine", "maimută"]; // const nouns = ["lupul", "leul", "ratonul", "pisica", "cainele", "maimuta"];
        const prefixAdjFem = ["rapida", "curajoasa", "frumoasa", "destepta"];
        const prefixAdjMasc = ["rapid", "curajos", "frumos", "destept"];
        const suffixAdjMasc = ["copilul", "beta", "micul", "curajosul", "marele"];
        const suffixAdjFem = ["copilul", "beta", "mica", "curajoasa", "marea"];
        const formedNouns: string[] = [];
        let adj: string;
        let i=0,j=0;


        nouns.forEach(noun => {
            const isFemale = noun.endsWith("a") || noun.endsWith("ă");
            const suffixAdj = isFemale ? suffixAdjFem : suffixAdjMasc;
            const prefixAdj = isFemale ? prefixAdjFem : prefixAdjMasc;
            if(Math.random() > (prefixAdj.length/suffixAdj.length/2%2))
            {
                let newNown = noun;
                ["ul", "le"].forEach(termination => {
                    if(noun.endsWith(termination))
                        return newNown = noun.replace(termination, "")
                });
                
                adj = suffixAdj[Math.floor(Math.random() * suffixAdj.length)] || "";
                formedNouns.push(adj + " " + newNown)
                // suffixAdj.splice(suffixAdj.indexOf(adj),1);
            }
               
            else 
            { 

                let newNown = noun;
                console.log(noun.substring(noun.length-1))
                switch(noun.substring(noun.length-1)) {

                    case "e":
                    newNown = noun + "le"
                    break;
                    case "a":
                    case "ă":
                    newNown = noun.slice(noun.length) + "a"
                    default:
                        if(noun.endsWith('u')) newNown = noun + "l"
                    else newNown = noun + "ul"
                    break;


                }


                adj = prefixAdj[Math.floor(Math.random() * prefixAdj.length)] || "";
                formedNouns.push(newNown + " " + adj)
                // prefixAdj.splice(prefixAdj.indexOf(adj),1);
            }
               

            
        });
        return formedNouns;
    }

    public getClientId(ClientObject: ClientObject): UUID
    {
        
    return ClientObject.clientId;

    }

    public getClientObjectById(clientId: UUID): ClientObject | undefined
    {
        
    return this.clients.get(clientId);

    }

    public onRemoveClient(clientId: UUID)
    {
        this.clients.delete(clientId);

        this.clientsActiveFile.delete(clientId)

    }

    public spawnClient(ws: WebSocket): UUID
    {
        const newClient = new ClientObject(this.sessionId, this);
        console.log("spawning new client with id: " + newClient.clientId)
        this.clients.set(newClient.clientId, newClient);
        return newClient.clientId;
    }

    public replicateFunction(callback: Function, ignoreClient?: ClientObject, ) {
        this.clients.forEach(client => {
            if(client!=ignoreClient || !ignoreClient)
             callback(client);
        });
    
    }
    
      
  }

  class ClientObject {
    sessionId: UUID;
    clientId: UUID;
    displayName: string;
    ping: number;
    // EditorSessionObject: EditorSession
    public constructor(sessionId: UUID, EditorSession: EditorSession) {
        this.sessionId = sessionId;
        this.clientId = uuidv4();
        this.ping = 0;
        // this.EditorSessionObject = EditorSession;
        const displayNames = EditorSession.clientsDisplayNames
        this.displayName = displayNames[Math.floor(Math.random() * displayNames.length)]
        displayNames.splice(displayNames.indexOf(this.displayName), 1)
        this.displayName = this.displayName[0].toLocaleUpperCase() + this.displayName.substring(1);
      }
      
  }


  enum commandType {
    Show = "sessions",
    Clients = "clients"
}

    // TODO Improve this a lot, find a better way of calling these functions
  process.stdin.on('data', (commandString) => {

    const command = commandString.toString().toLowerCase().trim().split(' ');
    console.log(command)
    const params = command.splice(0) as UUID[];

    function showSessions()
    {
        console.log(sessionMap)
        
    }

    function showClients()
    {
        if(!params[1]) return console.error("Please provide session id.")
        
        console.log(sessionMap.get(params[1])?.clients)
        
    }
    

    switch (commandString.toString().split(' ')[0].toLowerCase().trim())
    {
        case commandType.Show:
            showSessions();
            break;
        case commandType.Clients:
            showClients()
        break;
        default:
            console.log("Unrecognized command: " + command)
            break;
    }
    



    
})



app.post("/compile", (req: express.Request<{}, {}, CompileRequestBody>, res: express.Response<CompileResponse>) => {
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
    const exeFile = path.join(__dirname, "cache", sessionId);
    const filePath = path.join(exeFile,"clientFiles");//            path.join(__dirname, "cache", sessionId);
    const codeFile = !["cpp"].includes(path.extname(editorSession?.clientsActiveFile.get(clientId)|| "main.cpp"))? editorSession?.clientsActiveFile.get(clientId) : "main.cpp";
    
    //fs.writeFileSync(path.join(filePath,"main.cpp"), code);
    // console.log(path.extname(getThisClientSession()?.clientsActiveFile.get(clientId)||"aaa"));
   
    compileProcess = spawn("g++", ["-g", path.join(filePath, codeFile || "main.cpp"), "-o", path.join(exeFile,"main.exe")], {
        windowsHide: true,
        detached: true,
    });
    let errorData = "";
    
    const errors: errorObject[] = [];
    if(compileProcess != null) {
        

        compileProcess.stdin?.end();
        compileProcess?.stderr?.on("data", (data: Buffer) => {

            data.toString().split('\n').forEach(errorString => {
                if(!errorString) return;
                errorData = errorString.replace((path.resolve(filePath)+'\\'), "")
                const regex = errorData.match(/((?!:)\d*):((?!:)\d*)/) || [];
                const column = parseInt(regex[2] || "-1")
                const row = parseInt(regex[1] || "-1")
                errors.push({column: column, row: row, error: errorData})
            });
            
//                    data.toString();
        });

        compileProcess?.stdout?.on("data", (data: Buffer) => {

            console.log("stdout: " + data.toString());
        });

        compileProcess.on("close", (code: number) => {
            if (code === 0) {
                res.json({ success: true , fileName: codeFile});
            } else {//if(code===1) {
                //const correctedString = errorData.replace((path.resolve(filePath)+'\\'), "")
                
            
                console.log((path.resolve(filePath)+'\\'))
                res.json({ error: errors || "Compilation failed" });
            // } else
            // {
            //     res.json({ error: errorData || "Program exited with non-normal code: "+code });

            }
            
        });

    }
});





wss.on("connection", (ws: WebSocket) => {
    let gdbProcess: ChildProcess;
    let program: ChildProcess;
    let sessionId: UUID;
    let clientId: UUID;
    let clientObj: ClientObject | undefined
    let sessionType: boolean; // true for session, false for "local" client
    let clientFilesPath: string;
    let heartbeatTimestamp: number = Date.now();
    const heartbeatTimeout = 10000; // 1 second timeout for heartbeat
    let heartbeatInterval: any;
    let clientSession: EditorSession;
    let gdbBuffer = "";
    // TODO add session map 
    
    // if (gdbProcess) {
    //     gdbProcess.kill(); // Ensure only one GDB session runs at a time
    // }

    // if (program) {
    //     program.kill(); // Ensure only one GDB session runs at a time
    // }
   
    const customStream = new Writable({
        write(chunk, encoding, callback) {
          console.log(`Received from WebSocket, sending to C++ stdin: ${chunk.toString()}`);
          program.stdin?.write(chunk, encoding, callback); // Forward to child stdin
        },
        final(callback) {
            program.stdin?.end(); // Close stdin when done
          callback();
        }
      });

      function getThisClientSession(): EditorSession
      {
        // if(!sessionMap.get(sessionId)) 
        // { 
        //     console.error("couldnt find session object, creating a new session instead.")
        //     return new EditorSession(sessionId);
        // } else
            return clientSession || sessionMap.get(sessionId) //||  new EditorSession(sessionId);
      }


      function createThisClientSession(sessionId?:UUID): EditorSession
      {
        const newSession = new EditorSession(sessionId)
        sessionMap.set(newSession.sessionId , newSession)
        return newSession;
        
      }

        function printClientConsoleError(message: string, client?:ClientObject) {
            const targetClientId = client?.clientId || clientId;
            const clientSocket = clients.get(targetClientId);
            if (clientSocket) {
                clientSocket.send(JSON.stringify({ error: true, type: WebSocketMessageType.Error, body: message, messageType: ConsoleMessageType.Error }));
            } else {
                console.error("Client not found:", clientId);
            }
        }

        function printClientConsoleInfo(message: string, client?:ClientObject) {
            const targetClientId = client?.clientId || clientId;
            const clientSocket = clients.get(targetClientId);
            if (clientSocket) {
                clientSocket.send(JSON.stringify({ error: true, type: WebSocketMessageType.Console, body: message, messageType: ConsoleMessageType.Info }));
            } else {
                console.error("Client not found:", targetClientId);
            }
        }

        function printClientConsoleDebug(message: string, client?:ClientObject) {
            const targetClientId = client?.clientId || clientId;
            const clientSocket = clients.get(targetClientId);
            if (clientSocket) {
                clientSocket.send(JSON.stringify({ error: true, type: WebSocketMessageType.Console, body: message, messageType: ConsoleMessageType.Debug }));
            } else {
                console.error("Client not found:", targetClientId);
            }
        }

        function printClientConsoleSessionInfo(message: string, client?:ClientObject) {
            const targetClientId = client?.clientId || clientId;
            const clientSocket = clients.get(targetClientId);
            if (clientSocket) {
                clientSocket.send(JSON.stringify({ error: true, type: WebSocketMessageType.Console, body: message, messageType: ConsoleMessageType.SessionInfo }));
            } else {
                console.error("Client not found:", targetClientId);
            }
        }
        
    
        

    let mode = "run"; //debug
        // TODO Replace with replicate function.
   function replicateSocketMessage(sessionId: UUID, senderId: UUID, ignoreSender: boolean, response: Record<string, any>, filterFunction?: (clientId:UUID) => Boolean ) //{type: WebSocketMessageType; body: string | any; message?: string, }
   {
            getThisClientSession()?.clients.forEach((clientObject, client) => {
                // for(const client of getThisClientSession()?.clients.keys()) {
                    //send response to all clients
                    if(ignoreSender && clientId == client) return;
                    if(filterFunction != undefined)
                    {       // use filter function

                            if(filterFunction(client) == false)
                        {
                            const clientSocket = clients.get(client);
                            if(!clientSocket) {
                                // if(sessions.get(sessionId)?.indexOf(client) === -1)  console.error("Client not found in session while trying to time out client  " + sessionId);
                                //                      else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(client) || -1, 1);
                                //                  clients.delete(client);
                
                                                return console.error("\\x1b[31m Client not found while replicating message " + client + "\\x1b[0m");
                            }
                            // } return console.error("Client not found " + client);
                            clientSocket?.send(JSON.stringify(response));
                        }
                    } else 
                        {
                            const clientSocket = clients.get(client);
                            if(!clientSocket) {
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

   function connectionReady(cooperator: boolean = false) 
   {

        const clientFilesPath = path.join(__dirname, "cache", sessionId,"clientFiles");

        if(!fs.existsSync(path.join(__dirname, "cache", sessionId)) || !cooperator)
        {
            // fs.mkdir(path.join(__dirname, "cache", sessionId), { recursive: true }, (err) => {
            //     console.log("created cache folder for sessionId " + sessionId);
            //     if (err) {
            //         console.error("Error creating cache folder:", err);
            //     }
            // });

            fs.mkdir(clientFilesPath, { recursive: true }, (err) => {
                console.log("created cache and client Files folder for sessionId " + sessionId);
                if (err) {
                    console.error("Error creating cache folder:", err);
                }
                const defaultText = fs.readFileSync("user_code.cpp").toString();

                fs.writeFile(path.join(clientFilesPath, "main.cpp"), defaultText, (err) => {
                    listFiles(clientFilesPath)
                    openFile("main.cpp")
                    });
            })
        } else 
        {
            console.error("Cache folder already exists for sessionId " + sessionId);
            listFiles(clientFilesPath)
            if(!fs.existsSync(path.join(clientFilesPath, "main.cpp"))) console.error("No default file was found!")
            openFile("main.cpp")
        }
        
            getThisClientSession().replicateFunction((client:ClientObject) => {
                printClientConsoleSessionInfo(clientObj?.displayName + " joined!", client)
            }, clientObj);
            // replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Console, messageType: ConsoleMessageType.SessionInfo, body: "Client " + clientObj?.displayName + " joined!"});
            console.log("Client connected to GDB server" + clientId);

            ws.send(JSON.stringify({type: WebSocketMessageType.Handshake, clientId: clientId, sessionId: sessionId})); // Send initial message to client
            if(getThisClientSession()?.clients.size > 1)
            {
                let displayNames:string[] = [];
                getThisClientSession()?.clients.forEach((client, id) => {
                    displayNames.push(client.displayName);

               })

               replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.ColabData, body: JSON.stringify({clients:displayNames, thisClientId: clientId, thisSessionId: sessionId})});

            }

   }

        


       

    // debug mode only for now
    async function executeCommand( childProcess: ChildProcess, command: string, sessionId: UUID): Promise<void> {
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
                        type: WebSocketMessageType,
                        messageType: ConsoleMessageType,
                        body: string;
                        message: string;
                    } = {
                        error: false,
                        input: false,
                        type: WebSocketMessageType.Output,
                        messageType: ConsoleMessageType.Output,
                        body: gdbBuffer,
                        message: command.toString()
                    };
                    getThisClientSession()?.clients.forEach((client, id) => {
                        //send response to all clients
                        const clientSocket = clients.get(client.clientId);
                        if(!clientSocket)
                            {
                            
                                //sessions.delete(sessionId);
                                if(getThisClientSession()?.clients.has(clientId))  console.error("Client not found in session while trying to time out client  " + sessionId);
                                     else getThisClientSession()?.clients.delete(client.clientId);
                                 clients.delete(client.clientId);

                                return console.error("\\x1b[31m Client not found, removing ids " + client + "\\x1b[0m");
                            } 
                        clientSocket?.send(JSON.stringify(response));
                    });
                    
    
                    resolve(); 
                }
            };
            if(childProcess && childProcess.stdin && childProcess.stdout)
            {
            // Use .on instead of .once, because GDB output can be split
            childProcess.stdout?.on("data", onData);
    
            // Send the command
            childProcess.stdin?.write(command + "\n");
            } else console.error("GDB process not found for session " + sessionId);

        });
    }
    
    let CommandQueue = Promise.resolve();

    function queueCommand(process: ChildProcess,command: string, sessionId: UUID): Promise<void> {
        CommandQueue = CommandQueue.then(() => executeCommand(process, command, sessionId));
        return CommandQueue;
    }
   
    function listFiles(dir: string) {
        fs.readdir(dir, (err, files) => {
            if (err) {
                printClientConsoleError("Error listing files: " + err.message);
            } else {
                // const fileContentMap: Map<string, string> = new Map<string, string>();
                // files.forEach(element => {
                //     fileContentMap.set(element, fs.readFileSync(path.join(clientFilesPath, element)).toString());
                // });
                const targetFiles = files.filter(file => {
                    return ![".exe", ".o"].includes(path.extname(file).toLowerCase());
                });

                ws.send(JSON.stringify({type: WebSocketMessageType.FileManagement, body: {command: FileManagementCommands.List, content: targetFiles}})); // Send the list of files to the client
            }
        });
        
        }

    function openFile(fileName: string)
    {
        // if(fs.existsSync(path.join(clientFilesPath, fileName)))
        // console.log("path: " + path.join(clientFilesPath || path.join(__dirname, "cache", sessionId,"clientFiles"), fileName))
        fs.readFile(path.join(clientFilesPath, fileName), (err, data) => {
            if (err) {
                printClientConsoleError("Error opening file: " + err.message);
            } else {
                // Send the file content to the client
                console.log("File opened successfully");
                const oldFileName = getThisClientSession()?.clientsActiveFile.get(clientId);
                replicateSocketMessage(sessionId, clientId, true, {type: WebSocketMessageType.CodeSelection, body: null}, (client) => {  return getThisClientSession()?.clientsActiveFile.get(client) === oldFileName;}); // potential fix for a glitch where markers dont get deleted when switching tabs

                getThisClientSession()?.clientsActiveFile.set(clientId, fileName)
                ws.send(JSON.stringify({type: WebSocketMessageType.FileManagement,  body: {command: FileManagementCommands.Open ,content: data.toString(), fileName: fileName}})); // Send the list of files to the client
            }
        });
    }
        

    // Handle GDB session commands from client
    ws.on("message", async (message: Buffer, isBinary: boolean) => {  
        try {
            const messageJSON = JSON.parse(message.toString());
            const command = messageJSON.command
            const args = messageJSON.args;
            const type: WebSocketMessageType = messageJSON.type;
            //console.log("Received message from client: ", messageJSON);
            //console.log("Received message from client: ", type);
            //console.log(sessions)
            // if(type!= WebSocketMessageType.Heartbeat)
            //     {
            //         console.log(getThisClientSession())

            //     }

            switch (type) {
                case WebSocketMessageType.Heartbeat:
                    if(!clientObj) break;
                    clientObj.ping =  Date.now() - heartbeatTimestamp;
                    console.log("Client ping: " + clientObj?.ping)
                   
                    //console.log("Received heartbeat from client " + clientId);
                    break;
                
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
                        if(sessionMap.has(messageJSON.sessionId)) // = There is an active session, join it.
                        {
                            
                            clientSession = sessionMap.get(messageJSON.sessionId) || new uuidv4(); 
                            clientId = getThisClientSession().spawnClient(ws)
                            clientObj = getThisClientSession().getClientObjectById(clientId);
                        }
                            else // there is no session, create it.
                                {
                                    //getThisClientSession()?.clients.push(clientId); // add client to client list.
                                    clientSession = createThisClientSession(messageJSON.sessionId);
                                    clientId = getThisClientSession()?.spawnClient(ws)
                                    clientObj = getThisClientSession().getClientObjectById(clientId);

                                }

                                sessionId = getThisClientSession().sessionId;
                                clientFilesPath = path.join(__dirname, "cache", sessionId,"clientFiles");

                            clients.set(clientId, ws);
                            connectionReady(true)
                    } else
                    {
                        
                        //client connected to new session
                     //   clientId = uuidv4(); // Generate a unique ID
                     //   sessionId = clientId; // Use the generated ID as the session ID
                        // sessions.set(clientId, [sessionId]);
                         clientSession = createThisClientSession();
                        
                        if(getThisClientSession() != undefined)
                        {
                            sessionId = clientSession.sessionId;

                            // getThisClientSession().sessionId = sessionId;
                            // getThisClientSession()?.clients.set(clientId); // add client to client list.
                            clientId = getThisClientSession()?.spawnClient(ws)
                            clientObj = getThisClientSession().getClientObjectById(clientId);

                            clientFilesPath = path.join(__dirname, "cache", sessionId,"clientFiles");

                        }
                       
                        clients.set(clientId, ws);

                        connectionReady(false)
                    }

                    
                    console.log(sessionId+clientId)
                //    if(fs.existsSync(path.join(__dirname, "cache", sessionId)))
                  //      fs.writeFileSync(path.join(__dirname, "cache", sessionId , "user_code.cpp"), "// C++ code here\n");

               
                
                    
                    break;
                case WebSocketMessageType.Console:
                    if(getProcessFromMap(sessionId)!=undefined)
                        getProcessFromMap(sessionId)?.stdin?.write(messageJSON.command + "\n");
                    console.log("sent to program", messageJSON.command)
                    replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Console, messageType: ConsoleMessageType.UserChat,  body: messageJSON.command, clientDisplayName: clientObj?.displayName});
                    // clients.forEach((client, id) => {
                        
                    //         client.send(JSON.stringify({error: false, input: false, clientId: clientId, type: WebSocketMessageType.Console, body: messageJSON.command})); // Send initial message to client
                        
                    // });
                    break;


                case WebSocketMessageType.CodeChange:
                case WebSocketMessageType.CodeSelection:
                    //fs.writeFileSync(path.join(__dirname, "cache", sessionId , "user_code.cpp"), messageJSON.code);
                   // console.log(type + " for sessionId " + sessionId);

                   const shouldSave:boolean = messageJSON.saveFile;
                    const fileName: string = messageJSON.fileName;
                    
                   if(true && type===WebSocketMessageType.CodeChange)
                   {
                    console.log(messageJSON)
                    //   TODO make a more efficient way of updating the file, either by streams or a save button.
                    fs.writeFile(path.join(clientFilesPath , fileName), messageJSON.body, (err) => {
                        if(err) console.log("Failed saving file!")
                            console.log("saved file")
                    });
                   }

                   replicateSocketMessage(sessionId, clientId, true, {type: type, body: messageJSON}, (client) => { let filter = getThisClientSession()?.clientsActiveFile.get(client) != fileName; console.log(getThisClientSession()?.clientsActiveFile.get(client) + fileName); return filter;});
                   
                
                    // clients.forEach((client, id) => {
                    //     if(clientId!=id)
                    //         client.send(JSON.stringify({error: false, type: type, body: messageJSON})); // Send initial message to client
                    // });
                    break;
                
                case WebSocketMessageType.FileManagement:
                    // Handle folder management commands here
                    // Example: Create a new folder, delete a folder, etc.
                    

                    /*

                    messageJson.command
                    messageJson.body


                    */

                    const commandType: FileManagementCommands = messageJSON.command;
                    

                    switch (commandType) {
                        case FileManagementCommands.Create:
                            if (!fs.existsSync(path.join(clientFilesPath, messageJSON.body)))
                                fs.writeFile(path.join(clientFilesPath, messageJSON.body), "", (err) => {
                                    if (err) {
                                        printClientConsoleError("Error creating file: " + err.message);

                                    } else
                                    {
                                    const fileName =  messageJSON.body.toString();;
                                    replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.FileManagement, body: {content: fileName, command: commandType || FileManagementCommands.Create}}); // Send the list of files to the client
                                    console.log("File created successfully");
                                    }
                                
                            });
                            else  printClientConsoleError("File already exists!");


                    break;
                    case FileManagementCommands.Delete:
                        fs.unlink(path.join(clientFilesPath, messageJSON.body), (err) => {
                            if (err) {
                                printClientConsoleError("Error deleting file: " + err.message);
                            } else {
                                console.log("File deleted successfully");
                                replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.FileManagement, body: ({command: commandType, content: messageJSON.fileName, })});
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
                        
                        openFile(messageJSON.body)
                    break;
                    }
                
                default:
                    
                if(clientId===sessionId)
                     // handle case when client is the session owner
                    handleCommand(command, [[clientId, ws]] as unknown as Map<UUID, WebSocket>);
                else
                    // handle case when client is a collaborator
                    handleCommand(command, clients); // pass all the clients in the session
                            

                    async function handleCommand(command: string, sockets: Map<UUID, WebSocket>) {
                        if(command == "execute")
                        {
                            // execute code normally.
                            if(!getProcessFromMap(sessionId)) // check if program is running
                            {
                                async function executeProgram() {
                                    new Promise<void>((resolve, reject) => {
                                            console.log("executing program")
                                            const filePath = path.join(__dirname, "cache", sessionId, "main.exe");
                                            fs.stat(filePath, (err, stats) => {
                                                if (err) {
                                                    printClientConsoleError('$: Please compile the program first!');
                                                    return;
                                                }
                                            program = spawn(filePath, {
                                                cwd:  path.join(__dirname, "cache", sessionId,"clientFiles"), // we must add this for the program to have the correct directory for input files.

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
                                                    ws.send(JSON.stringify({messageType: ConsoleMessageType.Output, type: WebSocketMessageType.Output, body: gdbBuffer.toString()}));  // Send GDB output to the client
                                                    gdbBuffer = "";
                                            });
                                            
                                            program.on("spawn", () => {
                                                console.log("Program started successfully");
                                            })
                                            
                                            program.stderr?.on("data", (data) => {
                                                gdbBuffer += data.toString();
                                                    ws.send(JSON.stringify({error: true, input: false, type: WebSocketMessageType.Error,body: gdbBuffer.toString(), messageType: ConsoleMessageType.Output,}));  // Send GDB output to the client
                                                    gdbBuffer = "";
                                            });
                                            
                                            program.on("close", (code) => {
                                                if(code === null) return ws.send("Program exited with invalid code");
                                                gdbBuffer = "Program exited with code: " + code?.toString();
                                                ws.send(JSON.stringify({error: false, input: false, end: true, type: WebSocketMessageType.End, messageType: ConsoleMessageType.Output, body: gdbBuffer.toString()}));  // Send GDB output to the client
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
                            
                            else 
                            {
                                printClientConsoleError('program is already running! killing program') // await queueCommand(program,command, sessionId);
                                getProcessFromMap(sessionId)?.kill(); // kill the program
                                removeProcessFromMap(sessionId);
                            }
                            
                        }
                        else if(command == "run")
                        {
                            mode="debug";
                            if(!getProcessFromMap(sessionId)) {

                                const filePath = path.join(__dirname, "cache", sessionId, "main.exe");
                                gdbProcess = spawn("gdb", ["-q", "-ex", "set pagination off", "-ex", "set print thread-events off", filePath]);
                                addProcessToMap(sessionId, gdbProcess);

                                app.get("/requestValue", (req,res) => {
                                    const command = req.query.value;
                                    console.log(clientId + " " + command)
                                    if(mode != "debug") res.status(400).send('Bad Request: GDB process not active');
                                    if(!gdbProcess)  res.status(400).send('Bad Request: GDB process not active');
                                    if(!command)     res.status(400).send('Bad Request: invalid command');
                                    //res.send({code: fs.readFileSync("user_code.cpp").toString()});
                                    if(mode != "debug" || !gdbProcess || !command) return;
                                    
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
                                                    type: WebSocketMessageType.Output,
                                                    body: gdbBuffer,
                                                    message: command?.toString()
                                                }));
                                
                                                
                                            }
                                        };
                                        if(gdbProcess && gdbProcess.stdin && gdbProcess.stdout) 
                                        {
                                            // Use .on instead of .once, because GDB output can be split
                                            gdbProcess?.stdout?.on("data", onData);
                                    
                                            // Send the command
                                            gdbProcess?.stdin?.write("print " + command + "\n");
                                        } else console.error("GDB process not found for session " + sessionId);
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
                            else  await queueCommand(gdbProcess,command, sessionId);// gdbProcess.stdin.write(message + "\n");
                                
                                
                
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
                                                type: WebSocketMessageType.Output,
                                                body: gdbBuffer,
                                                message: command.toString()
                                            }));
                                        });
                                    } 
                                else if(gdbProcess) await queueCommand(gdbProcess,command,sessionId)
                                    
                                

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
                 }
        }
    } catch (err) {
        console.error("Command execution error:", err);
        ws.send(JSON.stringify({ error: true,type: WebSocketMessageType.Error, message: "Execution failed." }));
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
        replicateSocketMessage(sessionId, clientId, true, {type: WebSocketMessageType.CodeSelection, body: ""});
        clients.delete(clientId);
        clearInterval(heartbeatInterval); // Clear the interval to stop sending pings
        // getThisClientSession()?.clients.splice(getThisClientSession()?.clients.indexOf(clientId)||-1 , 1);
        getThisClientSession()?.onRemoveClient(clientId)
        //sessions.delete(sessionId);
        // if(sessions.get(sessionId)?.indexOf(clientId) === -1)  console.error("Client not found in session " + sessionId);
        //    else sessions.get(sessionId)?.splice(sessions.get(sessionId)?.indexOf(clientId) || -1, 1);
        
        if(getThisClientSession()?.clients.size == 0) 
            {
                   // sessions.delete(sessionId);
                    
            fs.rmdir(path.join(__dirname, "cache", sessionId), { recursive: true }, (err) => {
                console.log("deleted cache folder for sessionId " + sessionId);
            });
            if (process) {
                process.kill();
                removeProcessFromMap(sessionId);
            }
            sessionMap.delete(sessionId);
            console.log("Deleted session " + sessionId);
        } else
        {
            //session is still active, send message to other clients
            if(getThisClientSession()?.clients.size != 0)
                replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.ColabData, body: JSON.stringify({clients: getThisClientSession()?.clients})});
                replicateSocketMessage(sessionId, clientId, false, {type: WebSocketMessageType.Console, body: "$: Client " + clientId + " disconnected!"});
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