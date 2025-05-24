import { v4 as uuidv4 } from 'uuid';
import { UUID } from "crypto";
import WebSocket, { WebSocket as WSWebSocket } from 'ws';
import { ChildProcess } from 'child_process';
import {WSMessage } from '../../shared/src/types'
import { WebSocketMessageType } from '../../dist/shared/types';
import { User } from '../../generated/prisma';
import { UserNoPassword } from './usersManager';
// import { R } from 'ace-builds-internal/lib/bidiutil';
export class ClientObject {
    sessionId: UUID;
    clientId: UUID;
    displayName: string;
    ping: number;
    isHost: boolean = false;
    CWebSocket: WebSocket;
    canEdit: boolean = true;
    canChat: boolean = true;
    color: string = "#ffffff"
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

    public sendMessage(message:string|Record<string, any>)
    {
        this.CWebSocket.send(JSON.stringify(message))
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

export class EditorSession {
    sessionId: UUID;
    clientsActiveFile: Map<UUID, string> = new Map<UUID, string>(); // client , file name
    clients: Map<UUID,ClientObject> = new Map<UUID,ClientObject>();
    clientsDisplayNames: string[];
    clientsSockets: Map<UUID, WebSocket> = new Map();
    messageIndex: number = 1;
    clientCommandBuffer: Map<UUID, CommandBuffer> = new Map();
    process: ChildProcess | undefined;
    msgMap: Map<number, WSMessage> = new Map();
    brainrotNames: string[];

    hostClient: ClientObject
    isPublic: boolean
    enableChat: boolean
    editorPermission: EditorPermission
    joinCode: number;
    qrCode;
    
    public makeSessionPublic(enableChat: boolean, editorPermission: EditorPermission)
    {
        this.isPublic = true
        this.enableChat = enableChat
        this.editorPermission = editorPermission
        for(const client of this.clients.values())
        {
            
            client.canChat = enableChat;
            client.canEdit = editorPermission == EditorPermission.Everyone;

            client.sendMessage({type: WebSocketMessageType.Handshake, session: {isHost: client.isHost, canChat: client.canChat, canEdit: client.canEdit}})
        }
        this.hostClient.canChat = true; // TODO figure out why i need to add this, when it should be true by default for the host.
        this.hostClient.canEdit = true;
        
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
          clients: Object.fromEntries(this.clients),
          clientsActiveFile: Object.fromEntries(this.clientsActiveFile),
          clientsDisplayNames: this.clientsDisplayNames
        };
      }
    
      // Deserialize from plain object
      public static fromJSON(data: any): EditorSession {
        const session = new EditorSession(data.sessionId);
        session.clients = new Map(Object.entries(data.clients || {}) as [UUID, ClientObject][]);
        session.clientsActiveFile = new Map(Object.entries(data.clientsActiveFile || {}) as [UUID, string][]);
        session.clientsDisplayNames = data.clientsDisplayNames || [];
        return session;
      }

      static fromMerge(id: UUID, base?: Partial<EditorSession>, update?: Partial<EditorSession>): EditorSession {
        const session = new EditorSession(id);
        Object.assign(session, base, update);
        session.clients = new Map(update?.clients || base?.clients || []);
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
        
    return this.clients.get(clientId);

    }

    public removeClient(clientId: UUID)
    {
        this.clients.delete(clientId);
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
        if(this.clients.size == 0)
        {
            this.hostClient = newClient
            newClient.isHost = true;
            newClient.canChat = true;
            newClient.canEdit = true;
        }
        else
        {
        newClient.canChat = this.enableChat;
        newClient.canEdit = (this.editorPermission == EditorPermission.Everyone);
        }
        
        this.clientsSockets.set(newClient.clientId, ws)
        this.clients.set(newClient.clientId, newClient);
        
        return newClient.clientId;
    }

    public replicateFunction(callback: (thisClientWs: WebSocket, thisClientId: UUID) => void, excludeClientObj?:ClientObject) {
        // if(!getThisClientSession() || !getThisClientSession().clientsSockets) return console.error(new Error("invalid session or client sockers"));
        let excludeClientId: UUID | undefined;
        if(excludeClientObj)
             excludeClientId = this.getClientId(excludeClientObj);
        this.clientsSockets.forEach((thisClientWs, thisClientId) => {

    
            if(!thisClientWs) return;
            if(excludeClientId != thisClientId)
                callback(thisClientWs as WebSocket, thisClientId as UUID);
        });
    }
    

    
      
  }


//   public replicateFunction(callback: Function, ignoreClient?: ClientObject) {
//     this.clients.forEach(client => {
//         if(client!=ignoreClient || !ignoreClient)
//          callback(client as ClientObject);
//     });

// }
