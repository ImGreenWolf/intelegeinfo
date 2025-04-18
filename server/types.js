"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorSession = exports.ClientObject = void 0;
const uuid_1 = require("uuid");
class ClientObject {
    sessionId;
    clientId;
    displayName;
    ping;
    // EditorSessionObject: EditorSession
    constructor(sessionId, EditorSession) {
        this.sessionId = sessionId;
        this.clientId = (0, uuid_1.v4)();
        this.ping = 0;
        // this.EditorSessionObject = EditorSession;
        const displayNames = EditorSession.clientsDisplayNames;
        this.displayName = displayNames[Math.floor(Math.random() * displayNames.length)];
        displayNames.splice(displayNames.indexOf(this.displayName), 1);
        this.displayName = this.displayName[0].toLocaleUpperCase() + this.displayName.substring(1);
    }
}
exports.ClientObject = ClientObject;
class EditorSession {
    sessionId;
    clientsActiveFile = new Map(); // client , file name
    clients = new Map();
    clientsDisplayNames;
    clientsSockets = new Map();
    messageIndex = 1;
    clientCommandBuffer = new Map();
    constructor(sessionId) {
        this.sessionId = sessionId || (0, uuid_1.v4)();
        this.clientsDisplayNames = this.getDisplayNames();
        // sessionMap.set(this.sessionId , this);
        // state.updateSession(this.sessionId, this);
    }
    toJSON() {
        return {
            sessionId: this.sessionId,
            clients: Object.fromEntries(this.clients),
            clientsActiveFile: Object.fromEntries(this.clientsActiveFile),
            clientsDisplayNames: this.clientsDisplayNames
        };
    }
    // Deserialize from plain object
    static fromJSON(data) {
        const session = new EditorSession(data.sessionId);
        session.clients = new Map(Object.entries(data.clients || {}));
        session.clientsActiveFile = new Map(Object.entries(data.clientsActiveFile || {}));
        session.clientsDisplayNames = data.clientsDisplayNames || [];
        return session;
    }
    static fromMerge(id, base, update) {
        const session = new EditorSession(id);
        Object.assign(session, base, update);
        session.clients = new Map(update?.clients || base?.clients || []);
        session.clientsActiveFile = new Map(update?.clientsActiveFile || base?.clientsActiveFile || []);
        return session;
    }
    getDisplayNames() {
        const nouns = ["lup", "leu", "raton", "pisică", "câine", "maimuță", "elefant", "tigru", "urs", "vulpe", "șarpe", "iepure", "căprioară", "girafă", "rinocer", "hipopotam", "zebră", "crocodil", "aligator", "panteră", "jaguar", "pinguin", "lebădă", "vultur", "șoim", "bufniță", "liliac", "delfin", "rechin", "meduză"]; // const nouns = ["lupul", "leul", "ratonul", "pisica", "cainele", "maimuta"];
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
        const formedNouns = [];
        let adj;
        nouns.forEach(noun => {
            const isFemale = noun.endsWith("a") || noun.endsWith("ă");
            const suffixAdj = isFemale ? suffixAdjFem : suffixAdjMasc;
            const prefixAdj = isFemale ? prefixAdjFem : prefixAdjMasc;
            let newNown = noun;
            if (Math.random() > (prefixAdj.length / suffixAdj.length / 2 % 2)) {
                // add termination
                ["ul", "le"].forEach(termination => {
                    if (noun.endsWith(termination))
                        return newNown = noun.replace(termination, "");
                });
                adj = suffixAdj[Math.floor(Math.random() * suffixAdj.length)] || "";
                formedNouns.push(adj + " " + newNown);
                // suffixAdj.splice(suffixAdj.indexOf(adj),1);
            }
            else {
                switch (noun.substring(noun.length - 1)) {
                    case "e":
                        if (isFemale)
                            newNown = noun + "e";
                        else
                            newNown = noun + "le";
                        break;
                    case "a":
                    case "ă":
                        newNown = noun.slice(0, noun.length - 1) + "a";
                        break;
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
    }
    getClientId(ClientObject) {
        return ClientObject.clientId;
    }
    getClientObjectById(clientId) {
        return this.clients.get(clientId);
    }
    removeClient(clientId) {
        this.clients.delete(clientId);
        this.clientCommandBuffer.delete(clientId);
        this.clientsActiveFile.delete(clientId);
    }
    spawnClient(ws) {
        const newClient = new ClientObject(this.sessionId, this);
        console.log("spawning new client with id: " + newClient.clientId);
        this.clientsSockets.set(newClient.clientId, ws);
        this.clients.set(newClient.clientId, newClient);
        return newClient.clientId;
    }
    replicateFunction(callback, ignoreClient) {
        this.clients.forEach(client => {
            if (client != ignoreClient || !ignoreClient)
                callback(client);
        });
    }
}
exports.EditorSession = EditorSession;
