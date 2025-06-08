"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorSession = exports.EditorPermission = exports.ClientObject = void 0;
const uuid_1 = require("uuid");
const types_1 = require("../../dist/shared/types");
const editor_modes_1 = require("./editor-modes");
// import { R } from 'ace-builds-internal/lib/bidiutil';
class ClientObject {
    sessionId;
    clientId;
    displayName;
    ping;
    isHost = false;
    CWebSocket;
    canEdit = true;
    canChat = true;
    color = "#ffffff";
    editorMode = new editor_modes_1.CppMode;
    openFileName;
    // EditorSessionObject: EditorSession
    constructor(sessionId, EditorSession, WebSocket, displayName, user) {
        this.sessionId = sessionId;
        this.clientId = (0, uuid_1.v4)();
        this.ping = 0;
        this.CWebSocket = WebSocket;
        // this.EditorSessionObject = EditorSession;
        if (user) {
            this.displayName = user.username;
            this.color = user.userColor;
        }
        else {
            const displayNames = EditorSession.clientsDisplayNames;
            if (false)
                this.displayName = EditorSession.brainrotNames[Math.floor(Math.random() * EditorSession.brainrotNames.length)];
            else
                this.displayName = displayNames[Math.floor(Math.random() * displayNames.length)];
            displayNames.splice(displayNames.indexOf(this.displayName), 1);
            if (this.displayName[0])
                this.displayName = this.displayName[0].toLocaleUpperCase() + this.displayName.substring(1); // capitalise name
        }
    }
    sendMessage(message, type) {
        if (type && typeof message != 'string')
            this.CWebSocket.send(JSON.stringify({ type, ...message }));
        else
            this.CWebSocket.send(JSON.stringify(message));
    }
}
exports.ClientObject = ClientObject;
var EditorPermission;
(function (EditorPermission) {
    EditorPermission[EditorPermission["OnlyHost"] = 2] = "OnlyHost";
    EditorPermission[EditorPermission["RequirePermission"] = 1] = "RequirePermission";
    EditorPermission[EditorPermission["Everyone"] = 0] = "Everyone";
})(EditorPermission || (exports.EditorPermission = EditorPermission = {}));
class EditorSession {
    sessionId;
    clientsActiveFile = new Map(); // client , file name
    clients = new Map();
    clientsDisplayNames;
    clientsSockets = new Map();
    messageIndex = 1;
    clientCommandBuffer = new Map();
    process;
    msgMap = new Map();
    brainrotNames;
    currentbuildTag = '';
    sessionContainer;
    gdbProcess;
    program;
    displayServer = 0;
    hostClient;
    isPublic;
    enableChat;
    editorPermission;
    joinCode;
    qrCode;
    makeSessionPublic(enableChat, editorPermission) {
        this.isPublic = true;
        this.enableChat = enableChat;
        this.editorPermission = editorPermission;
        for (const client of this.clients.values()) {
            client.canChat = enableChat;
            client.canEdit = editorPermission == EditorPermission.Everyone;
            client.sendMessage({ type: types_1.WebSocketMessageType.Handshake, session: { isHost: client.isHost, canChat: client.canChat, canEdit: client.canEdit } });
        }
        this.hostClient.canChat = true; // TODO figure out why i need to add this, when it should be true by default for the host.
        this.hostClient.canEdit = true;
    }
    constructor(sessionId) {
        this.sessionId = sessionId || (0, uuid_1.v4)();
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
Tralalero Tralala`.split('\n');
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
        this.clientsSockets.delete(clientId);
        this.replicateFunction((clientWs, localClientId) => {
            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ConsoleTyping, displayName: this.getClientObjectById(clientId)?.displayName, clientId: clientId, status: 'end' }));
        }, this.getClientObjectById(clientId));
    }
    spawnClient(ws, userData) {
        let newClient;
        if (userData != undefined)
            newClient = new ClientObject(this.sessionId, this, ws, userData.username, userData);
        else
            newClient = new ClientObject(this.sessionId, this, ws);
        if (this.clients.size == 0) {
            this.hostClient = newClient;
            newClient.isHost = true;
            newClient.canChat = true;
            newClient.canEdit = true;
        }
        else {
            newClient.canChat = this.enableChat;
            newClient.canEdit = (this.editorPermission == EditorPermission.Everyone);
        }
        this.clientsSockets.set(newClient.clientId, ws);
        this.clients.set(newClient.clientId, newClient);
        return newClient.clientId;
    }
    replicateFunction(callback, excludeClientObj) {
        // if(!getThisClientSession() || !getThisClientSession().clientsSockets) return console.error(new Error("invalid session or client sockers"));
        let excludeClientId;
        if (excludeClientObj)
            excludeClientId = this.getClientId(excludeClientObj);
        this.clientsSockets.forEach((thisClientWs, thisClientId) => {
            if (!thisClientWs)
                return;
            if (excludeClientId != thisClientId)
                callback(thisClientWs, thisClientId);
        });
    }
}
exports.EditorSession = EditorSession;
//   public replicateFunction(callback: Function, ignoreClient?: ClientObject) {
//     this.clients.forEach(client => {
//         if(client!=ignoreClient || !ignoreClient)
//          callback(client as ClientObject);
//     });
// }
