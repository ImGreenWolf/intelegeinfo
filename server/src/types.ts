import { v4 as uuidv4 } from 'uuid';
import { UUID } from "crypto";
import WebSocket from 'ws';
import { ChildProcess } from 'child_process';
import { WSMessage } from '../../shared/src/types'
import { ConsoleMessageType, WebSocketMessageType} from '../../dist/shared/types';
import { Project, SavedProject, SharedProject, User } from '../../generated/prisma';
import { UserNoPassword } from './usersManager';
import { EditorMode } from './editor-modes';
import { CppMode } from './editor-modes';
import fs, { StatsListener, StatWatcher, WatchEventType, WatchListener } from 'fs'
import { FileManagementCommands} from '../../dist/shared/types'
import path from 'path';
import { SharedProjectType, rootDirName } from './server';
import { WebSocketMessage } from "../../shared/src/messageTypes"
import { sha256, sha224 } from 'js-sha256';
import * as Nodepty from "node-pty"
import { EventEmitter } from "events";

// import { R } from 'ace-builds-internal/lib/bidiutil';
export class ClientObject {
    sessionId: UUID;
    clientId: UUID;
    displayName: string;
    program: (Nodepty.IPty & EventEmitter )| undefined;
    ping: number;
    isHost: boolean = false;
    CWebSocket: WebSocket;
    permissions: ClientPermissions
    color: string = randomHexColor();
    editorMode: typeof EditorMode = CppMode;
    openFileName: string[] = [];
    openFile: EditorFile[] = [];
    lastOpenFile: EditorFile | undefined
    webcamid: number
    editorPermission: EditorPermission = EditorPermission.Everyone

    clientData: UserNoPassword
    // EditorSessionObject: EditorSession
    public constructor(sessionId: UUID, editorSession: EditorSession, WebSocket: WebSocket, displayName?:string, user?: UserNoPassword) {
        this.sessionId = sessionId;
        this.clientId = uuidv4() as UUID;
        this.ping = 0;
        this.CWebSocket = WebSocket;
        // this.EditorSessionObject = EditorSession;
        if(user)
        {
            if(editorSession.editorOptions.anonymousNames)
                this.setRandomName(editorSession)
            else
                this.displayName = user.username;
            this.color = user.userColor
            this.clientData = user
        } 
        else
        {
            if(displayName && !editorSession.editorOptions.anonymousNames)
                this.displayName = displayName
            else 
                this.setRandomName(editorSession)
           
        }
        
      }
      private setRandomName(editorSession: EditorSession) {
         const displayNames = editorSession.clientsDisplayNames;
        if(false) this.displayName = editorSession.brainrotNames[Math.floor(Math.random() * editorSession.brainrotNames.length)]
        else this.displayName = displayNames[Math.floor(Math.random() * displayNames.length)]

        displayNames.splice(displayNames.indexOf(this.displayName), 1)
        if(this.displayName[0]) 
            this.displayName = this.displayName[0].toLocaleUpperCase() + this.displayName.substring(1); // capitalise name
      }
    public sendMessage(message: WebSocketMessage | string | Record<string, any>, type?: WebSocketMessageType)
    {
        if(type && typeof message != 'string')
            this.CWebSocket.send(JSON.stringify({type, ...message}))
        else
        this.CWebSocket.send(JSON.stringify(message))
    }
    public getFile(name)
    {
    return this.openFile.find(val => val.name == name)
    }

    public getFilesName()
    {
    return this.openFile.map(val => val.name)
    }
    public checkClientsFileOpen(otherClient)
    {
        return this.getFilesName().findIndex(val => otherClient.getFilesName().some(other => val === other)) !== -1
    }
    
  }

interface CommandBuffer {
    codeSelection: any;


}

export enum EditorPermission
{
    OnlyHost = 2,
    RequirePermission = 1,
    Everyone = 0,
}
export interface EditorOptions
{
    enableChat: boolean,
    enableVoice: boolean,
    editorPermission: EditorPermission,
    sandboxUsers?: boolean,
    externalLinks?: boolean,
    anonymousNames?: boolean,
    allowedLanguage?: typeof EditorMode
}
export interface ClientPermissions
{
    canChat: boolean,
    canVoice: boolean,
    canEdit: boolean,
    isHost: boolean,
}
function EditorOptionsToPermissions(options, client: ClientObject)
{
    return {isHost: client.isHost, canChat: options.enableChat, canEdit:  client.editorPermission >= options.editorPermission, canVoice: options.enableVoice}
}
export class EditorSession {
    sessionId: UUID;
    clientsActiveFile: Map<UUID, string> = new Map<UUID, string>(); // client , file name
    files: EditorFile[] = []
    savedProject?: Project
    sharedProject?: SharedProjectType;
    clientsMap: Map<UUID,ClientObject> = new Map<UUID,ClientObject>();
    clients: ClientObject[] = []
    clientsDisplayNames: string[];
    clientsSockets: Map<UUID, WebSocket> = new Map();

    messageIndex: number = 1;
    clientCommandBuffer: Map<UUID, CommandBuffer> = new Map();
    process: DebugProcess | (Nodepty.IPty & EventEmitter ) | undefined;
    msgMap: Map<number, WSMessage> = new Map();

    brainrotNames: string[];
    currentbuildTag = '';
    sessionContainer: {process:  Nodepty.IPty, imageName: string, fileName: string, editorMode: EditorMode};
    gdbProcess: DebugProcess | undefined;
    program: (Nodepty.IPty & EventEmitter )| undefined;
    displayServer: number = 0;
    fileWatcher: fs.FSWatcher
    hostClient: ClientObject
    isPublic: boolean
    joinCode: number;
    qrCode;

    editorOptions: EditorOptions = {
        editorPermission: EditorPermission.Everyone,
        enableChat: true,
        enableVoice: false,
        sandboxUsers: false,}

    executeProblemChecker: (problemId) => Promise<PromiseSettledResult<{status: string, error: boolean, index: number, score: number, time?: number} | undefined>[]>;
    public makeSessionPublic(options: EditorOptions)
    {
        this.isPublic = true
        this.editorOptions = options
        for(const client of this.clientsMap.values())
        {
            
            // client.canChat = options.enableChat;
            // client.canVoice = options.enableVoice
            // client.canEdit = options.editorPermission == EditorPermission.Everyone;

            const permissions: ClientPermissions = EditorOptionsToPermissions( this.editorOptions,client)
            client.sendMessage({type: WebSocketMessageType.Handshake, permissions})
        }
        this.hostClient.permissions.canEdit = true// TODO figure out why i need to add this, when it should be true by default for the host.
        this.hostClient.permissions.canChat = true
        
    }

    public constructor(sessionId?: UUID) {
        this.sessionId = sessionId || uuidv4() as UUID;
        this.clientsDisplayNames = this.getDisplayNames();
        // sessionMap.set(this.sessionId , this);

        // state.updateSession(this.sessionId, this);
        
        this.brainrotNames = `
Brr brr Patapim
Lirilì Larilà
Frigo Camelo
Akulini Cactusini
Baby Mama T-Rex
Ballerina Cappuccina
Ballerino Lololo
Bearorito Applepitolirotito
Bicicletta Del Gatto Santo
Bobritto bandito
Bombardiere Lucertola
Bombardili Gorilili
Bombombini Gusini
Bombordiro Papa T-Rex
Boneca Ambalabu
Bri Bri Bicus Dicus
Brr brr Tarflem
Bungoletti Spaghettini
Burbaloni Luliloli
Camelrino Tazzino
Cappuccino Assassino
Chef Crabracadabra
Chimpanzini Bananini
Coccodrilli Faerini
Hansana Germana
Coccodrillo Formaggioso
Crocodillo Robloxino
Cocosatic Bungus
Crocodildo Penisini
Crocodilo Ananasino
Crocodilo Potatino
Don Coccodrillo
Ecco Cavallo Virtuoso
Emo Struzzo Paparazzi
Espressona Signora
Fishinni pelmeninni
Frulli Frulla
Gambero Spero
Gattino Aereoplanino
Gatto Pizza Caffè
Giraffa Celeste
Glorbo Fruttodrillo
Gorillardo Mazzuoloni
Graipussi Medussi
Guillermasso Bocadazzo
Homyakini Chupa Chupsini
Horseziano Blendorzinni
Il Cacto Hipopotamo
Il Ragioniere del Vuoto
L'Ombra Illuminata
La vaca saturno saturnita
Lightino akulino
Linguicine Serpentine
Los Tralaleritos
Meozad Bombardad
Mozarella di Bufala
Nuclearo Dinosauro
Orangutini Ananasini
Pararell Bararell
Piccione Macchina
Pinguini Zucchini
Pizzalino Guccifoca
Porcospino stivale
Puppini Appleini
Quesadilla Crocodila
Ranatone Margheritus
Rantasanta Chinaranta
Rari Rutti
Ravioli Chimpanzini
Rotoliglio Rotola Srotola Srola
Sahurpalma Naufragio
Sbam Undici: Gelatòide Risorge
Scoaittolo Crittolo
Serpentini Toiletini
Sombraruote Frratatà
Talpa Di Ferro
Tatuaggino Lasagnapiuma
Tortitilli Mortiri
Tracotocutulo
Tralalino dil Signore
Tric Trac baraboom
Trippi Troppi
Trulimero Truliccina
Zhuzhuli Buffo
Bombardiro Crocodillo
Tralalero Tralala`.split('\n')
        
    }

    public toJSON(): any {
        return {
          sessionId: this.sessionId,
          clients: Object.fromEntries(this.clientsMap),
          clientsActiveFile: Object.fromEntries(this.clientsActiveFile),
          clientsDisplayNames: this.clientsDisplayNames
        };
      }
    
      // Deserialize from plain object
      public static fromJSON(data: any): EditorSession {
        const session = new EditorSession(data.sessionId);
        session.clientsMap = new Map(Object.entries(data.clients || {}) as [UUID, ClientObject][]);
        session.clientsActiveFile = new Map(Object.entries(data.clientsActiveFile || {}) as [UUID, string][]);
        session.clientsDisplayNames = data.clientsDisplayNames || [];
        return session;
      }

      static fromMerge(id: UUID, base?: Partial<EditorSession>, update?: Partial<EditorSession>): EditorSession {
        const session = new EditorSession(id);
        Object.assign(session, base, update);
        session.clientsMap = new Map(update?.clientsMap || base?.clientsMap || []);
        session.clientsActiveFile = new Map(update?.clientsActiveFile || base?.clientsActiveFile || []);
        return session;
      }
      
    private getDisplayNames(): string[]
    {
        const nouns = ["lup", "leu", "raton", "pisică", "câine", "maimuță", "elefant","tigru", "urs", "vulpe", "șarpe", "iepure", "căprioară", "girafă", "rinocer","hipopotam", "zebră", "crocodil", "aligator", "panteră", "jaguar", "pinguin","lebădă", "vultur", "șoim", "bufniță", "liliac", "delfin", "rechin", "meduză"]; // const nouns = ["lupul", "leul", "ratonul", "pisica", "cainele", "maimuta"];
        // const prefixAdjFem = ["rapida", "curajoasa", "frumoasa", "destepta"];
        // const prefixAdjMasc = ["rapid", "curajos", "frumos", "destept"];
        // const suffixAdjMasc = ["copilul", "beta", "micul", "curajosul", "marele"];
        // const suffixAdjFem = ["copilul", "beta", "mica", "curajoasa", "marea"];
        const prefixAdjFem = [  
            "rapidă", "curajoasă", "frumoasă", "deșteaptă", "înaltă",  
            "mică", "puternică", "blândă", "vioiă", "fericită",  
            "tristă", "luminată", "întunecată", "caldă", "rece",  
            "dulce", "amară", "tânără", "bătrână", "sănătoasă",  
            "bolnavă", "agilă", "lentoasă", "zguduitoare", "liniștită",  
            "zgomotoasă", "misterioasă", "periculoasă", "inocentă", "cunoscută"  
        ];  

        const prefixAdjMasc = [  
            "rapid", "curajos", "frumos", "deștept", "înalt",  
            "mic", "puternic", "blând", "vioaie", "fericit",  
            "trist", "luminat", "întunecat", "cald", "rece",  
            "dulce", "amar", "tânăr", "bătrân", "sănătos",  
            "bolnav", "agil", "lentos", "zguduitor", "liniștit",  
            "zgomotos", "misterios", "periculos", "inocent", "cunoscut"  
        ];  

        const suffixAdjMasc = [  
            "copilul", "beta", "micul", "curajosul", "marele",  
            "înaltul", "tânărul", "bătrânul", "blândul", "zguduitorul",  
            "periculosul", "fericitul", "tristul", "dulcele", "luminatul"  
        ];  
        
        const suffixAdjFem = [  
            "copila", "beta", "mica", "curajoasa", "marea",  
            "înalta", "tânăra", "bătrâna", "blânda", "zguduitoarea",  
            "periculoasa", "fericita", "trista", "dulcea", "luminata"  
        ];  
        const formedNouns: string[] = [];
        let adj: string;

        

        nouns.forEach(noun => {
            const isFemale = noun.endsWith("a") || noun.endsWith("ă");
            const suffixAdj = isFemale ? suffixAdjFem : suffixAdjMasc;
            const prefixAdj = isFemale ? prefixAdjFem : prefixAdjMasc;
            let newNown = noun;
            if(Math.random() > (prefixAdj.length/suffixAdj.length/2%2))
            {
                // add termination
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
                
                switch(noun.substring(noun.length-1)) {

                    case "e":
                            if(isFemale) newNown = noun + "e";
                            else newNown = noun + "le";
                        break;

                    case "a":
                    case "ă":
                        newNown = noun.slice(0,     noun.length-1) + "a"
                        break;

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
        
    return this.clientsMap.get(clientId);

    }

    public removeClient(clientId: UUID)
    {
        this.clients.splice(this.clients.findIndex(val => val.clientId === clientId), 1)
        this.clientsMap.delete(clientId);
        this.clientCommandBuffer.delete(clientId)
        this.clientsActiveFile.delete(clientId)
        this.clientsSockets.delete(clientId)
        this.replicateFunction((clientWs, localClientId) => {
            clientWs.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping,displayName: this.getClientObjectById(clientId)?.displayName, clientId: clientId, status: 'end'}))
        }, this.getClientObjectById(clientId))
    }

    public spawnClient(ws: WebSocket,displayName: string, userData?: UserNoPassword): UUID
    {
        let newClient: ClientObject;

        if(userData != undefined) newClient = new ClientObject(this.sessionId, this, ws, userData.username, userData);
            else newClient = new ClientObject(this.sessionId, this, ws, displayName);
        if(this.clientsMap.size == 0)
        {
            this.hostClient = newClient
            newClient.editorPermission = EditorPermission.OnlyHost
            newClient.isHost = true;
            newClient.permissions = EditorOptionsToPermissions( this.editorOptions,newClient)
            newClient.permissions.isHost = true
        }
        else
        {
            newClient.editorPermission = EditorPermission.Everyone
            newClient.permissions = EditorOptionsToPermissions( this.editorOptions,newClient)
        }
        
        this.clientsSockets.set(newClient.clientId, ws)
        this.clientsMap.set(newClient.clientId, newClient);
        this.clients.push(newClient)
        return newClient.clientId;
    }

    public replicateFunction(callback: (thisClientWs: WebSocket, thisClientId: UUID, clientObj: ClientObject) => void, excludeClientObj?:ClientObject) {
        // if(!getThisClientSession() || !getThisClientSession().clientsSockets) return console.error(new Error("invalid session or client sockers"));
        let excludeClientId: UUID | undefined;
        if(excludeClientObj)
             excludeClientId = this.getClientId(excludeClientObj);
        this.clientsSockets.forEach((thisClientWs, thisClientId) => {

    
            if(!thisClientWs) return;
            if(excludeClientId != thisClientId)
                callback(thisClientWs as WebSocket, thisClientId as UUID, this.clientsMap.get(thisClientId));
        });
    }
    
    public getClientFilesPath()
    {
        return path.join(rootDirName, "cache", this.sessionId,"clientFiles");
        
    }

    
      
  }

  export class EditorFile {
    name: string;
    content: string;
    session: EditorSession;
    filePath: string
    editorMode: EditorMode;
    linkedUser?: ClientObject | undefined
    private updateFilePath() {
        this.filePath = path.join(this.session.getClientFilesPath(), this.name)
    }
    constructor(session: EditorSession, name: string, content=undefined,
        options?: {abstract?: boolean /**Doesnt atually create a file on disk, acts just as a variable, use if you already created the file */,
        autoOpenClient?: ClientObject,
        linkedUser?: ClientObject}, onCreate?: (this: EditorFile)=> void) {


        
        this.session = session
        if(options && options.linkedUser)
            this.linkedUser = options.linkedUser

        this.name = this.linkedUser ? this.linkedUser.displayName.replaceAll(' ', '-') + "-" + name :  name;
        this.updateFilePath()
        
        
        // const mode =  getEditorMode(this.name).constructor
        const editorModeClass = getEditorMode(this.name)
        this.editorMode = new (editorModeClass as any)
         if((content == undefined || content == '') && editorModeClass.defaultText != undefined)
            this.content = editorModeClass.defaultText.toString()
        else
        if(content == undefined)
            this.content = ''
        else
            this.content = content;
        if(options)
            if(options.abstract != undefined && options.abstract)
                return
        try {
            // Create a new instance of the EditorFile class from the provided type
            // Example: let newFile = new EditorFile(session, name, content, onCreate);
            if (!fs.existsSync(this.filePath))
            fs.writeFile(this.filePath, this.content, (err) => {
                if (err) {
                    throw err;
                } else   
                {
                    console.log('Created file ' + this.name)
                    if(!session.files)
                        throw 'session.files is undifined.'
                    session.files.push(this)
                    

                    if(onCreate)
                        onCreate.call(this)
                    else
                        session.replicateFunction((clientWs, id, remoteClientObj) => {
                            if(!this.linkedUser || (this.linkedUser == remoteClientObj || remoteClientObj.editorPermission == EditorPermission.OnlyHost))
                            clientWs.send(JSON.stringify({type: WebSocketMessageType.FileManagement, body: {content: this.name, command: FileManagementCommands.Create}}))
                        });

                    if(options && options.autoOpenClient)
                        this.openFile(options.autoOpenClient)
                }
                   
            });
            else  throw "File already exists!";
        }
        catch (err)
        {
            session.replicateFunction((localws, id, localObj) => {
                localObj.sendMessage({type: WebSocketMessageType.Console, messageType: ConsoleMessageType.Notification, body: err})
            } )
        }
    }


    public delete(clientObj: ClientObject, clientSession: EditorSession)
    {
        try {
            if(clientObj.openFile.indexOf(this) != -1)
                clientObj.openFile.splice(clientObj.openFile.indexOf(this), 1)

            clientSession.files.splice(clientSession.files.indexOf(this), 1)
            

            fs.unlink(this.filePath, (err) => {
            if (err) {
               throw "Error deleting file: " + err.message;
            } else {
                this.session.replicateFunction((cws) => {
                    cws.send(JSON.stringify({
                    type: WebSocketMessageType.FileManagement,
                    command: FileManagementCommands.Delete,
                    name: this.name,
                    }))
                })
            }
        });
        }
        catch(err)
        {
             clientObj.sendMessage({type: WebSocketMessageType.Console, messageType: ConsoleMessageType.Notification, body: err})
            
        }
    }

    public rename(newName,clientObj: ClientObject)
    {
        try {
            fs.rename(this.filePath, path.join(this.session.getClientFilesPath(), newName), () => {
                this.session.replicateFunction((cws) => {
                    cws.send(JSON.stringify({
                        type: WebSocketMessageType.FileManagement,
                        command: FileManagementCommands.Rename,
                        name: this.name,
                        newName: newName
                    }))
                })
                const index = clientObj.openFileName.findIndex(name => name === this.name)
                clientObj.openFileName[index] = newName
                this.name = newName

                this.updateFilePath()
            })
        }
        catch(err)
        {
            
                clientObj.sendMessage({type: WebSocketMessageType.Console, messageType: ConsoleMessageType.Notification, body: err})
            
        }
    }

    public syncFileContent() {
        const data = fs.readFileSync(this.filePath).toString()
        this.content = data
    }


    public async openFile(clientObj: ClientObject, shared?, closedFileName?: string)
    {
        try{
           
                this.syncFileContent()
                 const closedFileIndex = clientObj.openFileName.findIndex(name => name == closedFileName)
                if(closedFileIndex != -1)
                {
                   
                    clientObj.openFile.splice(clientObj.openFile.findIndex(file => file.name == closedFileName),1)
                    clientObj.openFileName.splice(clientObj.openFileName.findIndex(name => name == closedFileName),1)
                }

                    clientObj.openFile.push(this)
                    clientObj.openFileName.push(this.name)
                
               
                // Send the file content to the client
                const oldFileName = clientObj.openFileName
                // if(closedFileName)
                // {
                //     const closedFileIndex = clientObj.openFileName.findIndex(name => name == closedFileName)
                //     clientObj.openFile.splice(closedFileIndex,1)
                //     clientObj.openFileName.splice(closedFileIndex,1)
                // }
                
                this.session.replicateFunction((cws, id, obj) => {
                    if((obj as ClientObject).openFileName == oldFileName)
                        cws.send(JSON.stringify({type: WebSocketMessageType.CodeSelection, body: null}))
                }, clientObj)

                clientObj.editorMode = getEditorMode(this.name)
                // clientObj.openFileName = this.name
                
                this.session.clientsActiveFile.set(clientObj.clientId, this.name)
                clientObj.lastOpenFile = this
                console.log(`Opened file ${this.name}, with mode ${(clientObj.editorMode).name}`);
                if(shared) shared.updateSession(this.session.sessionId, this.session)
                    return this.content;

                
        }
        catch (err)
        {
            console.error(err)
        }
    }
    public updateFile(clientObj: ClientObject, content?: string) {
       try {
         const fileContent = content || this.content
         //   TODO make a more efficient way of updating the file, either by streams (streaming updates to file) or a save button.
         fs.writeFile(this.filePath, fileContent, (err) => {
             if(err) console.error("Failed saving file! " + err)
             // if(checkSyntaxTimeout) clearTimeout(checkSyntaxTimeout)
 
             
             const fileName = this.name
             if(!clientObj.getFile(this.name))
                return;
            
             if(!clientObj.getFile(fileName).editorMode.checkCodeSyntax)
                // send saved file message if doesnt have syntax checker
                 this.session.replicateFunction((clientWs, localClientId) => {
                     if(this.session.clientsActiveFile.get(localClientId) === this.session.clientsActiveFile.get(clientObj.clientId))
                         clientWs.send(JSON.stringify({type: WebSocketMessageType.CompileResult, fileName, clientId: clientObj.clientId, saved: true}))
                     })
             else
                 clientObj.getFile(fileName).editorMode.checkCodeSyntax(this.session, clientObj.getFile(fileName)).then(json => {
                     if(!JSON.parse(json)[0])
                         return  this.session.replicateFunction((clientWs, localClientId) => {
                             if(this.session.clientsActiveFile.get(localClientId) === this.session.clientsActiveFile.get(clientObj.clientId))
                                 clientWs.send(JSON.stringify({type: WebSocketMessageType.CompileResult, fileName,clientId: clientObj.clientId, saved: true, body: JSON.stringify(    [   {kind: 'success'} ]     )}))
                             })
                     this.session.replicateFunction((clientWs, localClientId) => {
                         if(this.session.clientsActiveFile.get(localClientId) === this.session.clientsActiveFile.get(clientObj.clientId))
                             clientWs.send(JSON.stringify({type: WebSocketMessageType.CompileResult, fileName, clientId: clientObj.clientId, body: json, saved: true}))
                         })
                 }).catch(err => {
                     console.error('syntax checker error: ' + err)
                 })
 
         });
       } catch (error) {
                     console.error('syntax checker error: ' + error)
        
       }
    }
    public changeContent(data: {content?, delta?, clientChecksum?}, clientObj: ClientObject)
    {
        if(data.content)
            this.content = data.content
        else
            this.content = this.applyDelta(data.delta).join('\n')

        const checksum = sha256(this.content)

        if(data.clientChecksum)
        {
            
                                    
            const checksumFailed = checksum !== data.clientChecksum
                // replicate changes to others
            if(checksumFailed)
            {
                clientObj.sendMessage({type: WebSocketMessageType.CodeChange, clientId: clientObj.clientId, fileName: this.name,  body: this.content, checksum})
                console.error('Checksum failed for session id:', this.session.sessionId, 'On client:', clientObj.clientId)
            }
                
            this.session.replicateFunction((thisclientWs, localClientId, thisClientObj) => {
                if(clientObj.checkClientsFileOpen(thisClientObj) && clientObj.permissions.canEdit)
                    thisclientWs.send(JSON.stringify({type: WebSocketMessageType.CodeChange, clientId: clientObj.clientId, delta: data.delta, fileName: this.name,  body: checksumFailed ? data.content : undefined, checksum}))
                }, clientObj)
            return 
        }
        else // replace with an array of clients that have this file open
            this.session.replicateFunction((thisclientWs, localClientId, thisClientObj) => {
                if(clientObj.checkClientsFileOpen(thisClientObj))
                    clientObj.sendMessage({type: WebSocketMessageType.CodeChange, clientId: clientObj.clientId, fileName: this.name,  body: this.content, checksum})
                })

        
    }

    public onFileWatched(eventType: WatchEventType, clientObj) {
        
        this.syncFileContent()
        this.changeContent({content: this.content}, clientObj)
        console.log('Synced file content')
    }
    public setFileContent(content, clientObj) {
        this.changeContent({content}, clientObj)
        this.updateFile(clientObj)
    }
    private applyDelta (delta) {
        if(!delta)
            throw new Error('Invalid delta. Cant apply delta.')
    const docLines = this.content.split('\n')
    var row = delta.start.row;
    var startColumn = delta.start.column;
    var line = docLines[row] || "";
    switch (delta.action) {
        case "insert":
            var lines = delta.lines;
            if (lines.length === 1) {
                docLines[row] = line.substring(0, startColumn) + delta.lines[0] + line.substring(startColumn);
            }
            else {
                var args = [row, 1].concat(delta.lines);
                docLines.splice.apply(docLines, args);
                docLines[row] = line.substring(0, startColumn) + docLines[row];
                docLines[row + delta.lines.length - 1] += line.substring(startColumn);
            }
            break;
        case "remove":
            var endColumn = delta.end.column;
            var endRow = delta.end.row;
            if (row === endRow) {
                docLines[row] = line.substring(0, startColumn) + line.substring(endColumn);
            }
            else {
                docLines.splice(row, endRow - row + 1, line.substring(0, startColumn) + docLines[endRow].substring(endColumn));
            }
            break;
    }

    return docLines
};




  }

//   public replicateFunction(callback: Function, ignoreClient?: ClientObject) {
//     this.clients.forEach(client => {
//         if(client!=ignoreClient || !ignoreClient)
//          callback(client as ClientObject);
//     });

// }
import * as EditorModes from './editor-modes/'
import DebugProcess from './editor-modes/ProcessTypes';
function getEditorMode(fileName: string): typeof EditorModes.EditorMode
{
    const ext = fileName.trim().split('.')[1]
    
        for(const mode of EditorModes.modes)
        {
            console.log(mode.extension)
             if(mode.extension && mode.extension.includes(ext))
                return mode;
        }
           
        

    return  EditorModes.Text;
}


export function randomHexColor()
{
    return Math.floor(Math.max(80, Math.random() * 255) ).toString(16) + Math.floor(Math.max(80,Math.random() * 255 )).toString(16) + Math.floor(Math.max(80,Math.random() * 255 )).toString(16);
}


