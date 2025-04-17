import { v4 as uuidv4 } from 'uuid';
import { UUID } from "crypto";
import WebSocket, { WebSocket as WSWebSocket } from 'ws';
export class ClientObject {
    sessionId: UUID;
    clientId: UUID;
    displayName: string;
    ping: number;
    // EditorSessionObject: EditorSession
    public constructor(sessionId: UUID, EditorSession: EditorSession) {
        this.sessionId = sessionId;
        this.clientId = uuidv4() as UUID;
        this.ping = 0;
        // this.EditorSessionObject = EditorSession;
        const displayNames = EditorSession.clientsDisplayNames
        this.displayName = displayNames[Math.floor(Math.random() * displayNames.length)]
        displayNames.splice(displayNames.indexOf(this.displayName), 1)
        this.displayName = this.displayName[0].toLocaleUpperCase() + this.displayName.substring(1);
      }
      
  }


export class EditorSession {
    sessionId: UUID;
    clientsActiveFile: Map<UUID, string> = new Map<UUID, string>(); // client , file name
    clients: Map<UUID,ClientObject> = new Map<UUID,ClientObject>();
    clientsDisplayNames: string[];
    public constructor(sessionId?: UUID) {
        this.sessionId = sessionId || uuidv4() as UUID;
        this.clientsDisplayNames = this.getDisplayNames();
        // sessionMap.set(this.sessionId , this);

        // state.updateSession(this.sessionId, this);
        
        
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
        const nouns = ["lup", "leu", "raton", "pisică", "câine", "maimuță", "elefant",
             "tigru", "urs", "vulpe", "șarpe", "iepure", "căprioară", "girafă", "rinocer",
            "hipopotam", "zebră", "crocodil", "aligator", "panteră", "jaguar", "pinguin",
            "lebădă", "vultur", "șoim", "bufniță", "liliac", "delfin", "rechin", "meduză"]; // const nouns = ["lupul", "leul", "ratonul", "pisica", "cainele", "maimuta"];
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
                        newNown = noun.slice(noun.length) + "a"
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

    public replicateFunction(callback: Function, ignoreClient?: ClientObject) {
        this.clients.forEach(client => {
            if(client!=ignoreClient || !ignoreClient)
             callback(client as ClientObject);
        });
    
    }
    
      
  }