import { v4 as uuidv4 } from 'uuid';
import { UUID } from "crypto";
import WebSocket, { WebSocket as WSWebSocket } from 'ws';
import { ChildProcess } from 'child_process';
import { WSMessage } from '../../shared/src/types'
import { ConsoleMessageType, WebSocketMessageType } from '../../dist/shared/types';
import { User } from '../../generated/prisma';
import { UserNoPassword } from './usersManager';
import { EditorMode } from './editor-modes';
import { CppMode } from './editor-modes';
import fs from 'fs'
import { FileManagementCommands } from '../../dist/shared/types'
import path from 'path';
import { rootDirName } from './server';
// import { R } from 'ace-builds-internal/lib/bidiutil';
export class ClientObject {
    sessionId: UUID;
    clientId: UUID;
    displayName: string;
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
    // EditorSessionObject: EditorSession
    public constructor(sessionId: UUID, EditorSession: EditorSession, WebSocket: WebSocket, displayName?:string, user?: UserNoPassword) {
        this.sessionId = sessionId;
        this.clientId = uuidv4() as UUID;
        this.ping = 0;
        this.CWebSocket = WebSocket;
        // this.EditorSessionObject = EditorSession;
        if(user)
        {
            this.displayName = user.username;
            this.color = user.userColor
        } 
        else
        {
            const displayNames = EditorSession.clientsDisplayNames;
            if(false) this.displayName = EditorSession.brainrotNames[Math.floor(Math.random() * EditorSession.brainrotNames.length)]
            else this.displayName = displayNames[Math.floor(Math.random() * displayNames.length)]

            displayNames.splice(displayNames.indexOf(this.displayName), 1)
            if(this.displayName[0]) 
                this.displayName = this.displayName[0].toLocaleUpperCase() + this.displayName.substring(1); // capitalise name
        }
        
      }

    public sendMessage(message:string|Record<string, any>, type?: WebSocketMessageType)
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
        return this.getFilesName().find(val => otherClient.getFilesName().some(other => val === other)) !== -1
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
    editorPermission: EditorPermission
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
    return {isHost: client.isHost, canChat: options.enableChat, canEdit:  client.editorPermission >= EditorPermission.Everyone, canVoice: options.enableVoice}
}
export class EditorSession {
    sessionId: UUID;
    clientsActiveFile: Map<UUID, string> = new Map<UUID, string>(); // client , file name
    files: EditorFile[] = []
    clientsMap: Map<UUID,ClientObject> = new Map<UUID,ClientObject>();
    clients: ClientObject[] = []
    clientsDisplayNames: string[];
    clientsSockets: Map<UUID, WebSocket> = new Map();
    messageIndex: number = 1;
    clientCommandBuffer: Map<UUID, CommandBuffer> = new Map();
    process: ChildProcess | undefined;
    msgMap: Map<number, WSMessage> = new Map();
    brainrotNames: string[];
    currentbuildTag = '';
    sessionContainer: {process: ChildProcess, imageName: string, fileName: string, editorMode: EditorMode};
    gdbProcess: ChildProcess | undefined;
    program: ChildProcess | undefined;
    displayServer: number = 0;

    hostClient: ClientObject
    isPublic: boolean
    joinCode: number;
    qrCode;

    editorOptions: EditorOptions = {editorPermission: EditorPermission.Everyone, enableChat: true, enableVoice: false}
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

    public spawnClient(ws: WebSocket, userData?: UserNoPassword): UUID
    {
        let newClient: ClientObject;
        if(userData != undefined) newClient = new ClientObject(this.sessionId, this, ws, userData.username, userData);
            else newClient = new ClientObject(this.sessionId, this, ws);
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
    name;
    content;
    session: EditorSession;
    filePath 
    editorMode: EditorMode
    
    constructor(session: EditorSession, name: string, content=undefined, options?: {abstract?: boolean}, onCreate?: (this: EditorFile)=> void) {
        this.name = name;

       
        this.session = session
        this.filePath = path.join(this.session.getClientFilesPath(), this.name)
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
                    session.replicateFunction((clientWs) => {
                        clientWs.send(JSON.stringify({type: WebSocketMessageType.FileManagement, body: {content: this.name, command: FileManagementCommands.Create}}))
                    });
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


    public delete(clientObj: ClientObject)
    {
        try {
            clientObj.openFile.splice(clientObj.openFile.findIndex(val => val == this), 1)
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
                }, clientObj)
            }
        });
        }
        catch(err)
        {
             clientObj.sendMessage({type: WebSocketMessageType.Console, messageType: ConsoleMessageType.Notification, body: err})
            
        }
    }

    public rename(newName,clientObj)
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
                }, clientObj)

                this.name = newName
            })
        }
        catch(err)
        {
            clientObj.replicateFunction((localws, id, localObj) => {
                localObj.sendMessage({type: WebSocketMessageType.Console, messageType: ConsoleMessageType.Notification, body: err})
            } )
        }
    }

    public async openFile(clientObj: ClientObject, shared?, closedFileName?: string)
    {
        try{
           
                const data = fs.readFileSync(this.filePath).toString()

                clientObj.openFile.push(this)
                clientObj.openFileName.push(this.name)
                // Send the file content to the client
                const oldFileName = clientObj.openFileName
                if(closedFileName)
                {
                    const closedFileIndex = clientObj.openFileName.findIndex(name => name == closedFileName)
                    clientObj.openFile.splice(closedFileIndex,1)
                    clientObj.openFileName.splice(closedFileIndex,1)
                }
              

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
                    return data;
        }
        catch (err)
        {
            console.error(err)
        }
    }

    public changeContent(content)
    {
        this.content = content
    }



  }

//   public replicateFunction(callback: Function, ignoreClient?: ClientObject) {
//     this.clients.forEach(client => {
//         if(client!=ignoreClient || !ignoreClient)
//          callback(client as ClientObject);
//     });

// }
import * as EditorModes from './editor-modes/'
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