"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorFile = exports.EditorSession = exports.EditorPermission = exports.ClientObject = void 0;
exports.randomHexColor = randomHexColor;
const uuid_1 = require("uuid");
const types_1 = require("../../dist/shared/types");
const editor_modes_1 = require("./editor-modes");
const fs_1 = __importDefault(require("fs"));
const types_2 = require("../../dist/shared/types");
const path_1 = __importDefault(require("path"));
const server_1 = require("./server");
const js_sha256_1 = require("js-sha256");
// import { R } from 'ace-builds-internal/lib/bidiutil';
class ClientObject {
    sessionId;
    clientId;
    displayName;
    ping;
    isHost = false;
    CWebSocket;
    permissions;
    color = randomHexColor();
    editorMode = editor_modes_1.CppMode;
    openFileName = [];
    openFile = [];
    lastOpenFile;
    webcamid;
    editorPermission = EditorPermission.Everyone;
    clientData;
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
            this.clientData = user;
        }
        else {
            if (displayName)
                this.displayName = displayName;
            else {
                // assaign random name
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
    }
    sendMessage(message, type) {
        if (type && typeof message != 'string')
            this.CWebSocket.send(JSON.stringify({ type, ...message }));
        else
            this.CWebSocket.send(JSON.stringify(message));
    }
    getFile(name) {
        return this.openFile.find(val => val.name == name);
    }
    getFilesName() {
        return this.openFile.map(val => val.name);
    }
    checkClientsFileOpen(otherClient) {
        return this.getFilesName().findIndex(val => otherClient.getFilesName().some(other => val === other)) !== -1;
    }
}
exports.ClientObject = ClientObject;
var EditorPermission;
(function (EditorPermission) {
    EditorPermission[EditorPermission["OnlyHost"] = 2] = "OnlyHost";
    EditorPermission[EditorPermission["RequirePermission"] = 1] = "RequirePermission";
    EditorPermission[EditorPermission["Everyone"] = 0] = "Everyone";
})(EditorPermission || (exports.EditorPermission = EditorPermission = {}));
function EditorOptionsToPermissions(options, client) {
    return { isHost: client.isHost, canChat: options.enableChat, canEdit: client.editorPermission >= options.editorPermission, canVoice: options.enableVoice };
}
class EditorSession {
    sessionId;
    clientsActiveFile = new Map(); // client , file name
    files = [];
    clientsMap = new Map();
    clients = [];
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
    fileWatcher;
    hostClient;
    isPublic;
    joinCode;
    qrCode;
    editorOptions = {
        editorPermission: EditorPermission.Everyone,
        enableChat: true,
        enableVoice: false,
        sandboxUsers: false
    };
    executeProblemChecker;
    makeSessionPublic(options) {
        this.isPublic = true;
        this.editorOptions = options;
        for (const client of this.clientsMap.values()) {
            // client.canChat = options.enableChat;
            // client.canVoice = options.enableVoice
            // client.canEdit = options.editorPermission == EditorPermission.Everyone;
            const permissions = EditorOptionsToPermissions(this.editorOptions, client);
            client.sendMessage({ type: types_1.WebSocketMessageType.Handshake, permissions });
        }
        this.hostClient.permissions.canEdit = true; // TODO figure out why i need to add this, when it should be true by default for the host.
        this.hostClient.permissions.canChat = true;
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
            clients: Object.fromEntries(this.clientsMap),
            clientsActiveFile: Object.fromEntries(this.clientsActiveFile),
            clientsDisplayNames: this.clientsDisplayNames
        };
    }
    // Deserialize from plain object
    static fromJSON(data) {
        const session = new EditorSession(data.sessionId);
        session.clientsMap = new Map(Object.entries(data.clients || {}));
        session.clientsActiveFile = new Map(Object.entries(data.clientsActiveFile || {}));
        session.clientsDisplayNames = data.clientsDisplayNames || [];
        return session;
    }
    static fromMerge(id, base, update) {
        const session = new EditorSession(id);
        Object.assign(session, base, update);
        session.clientsMap = new Map(update?.clientsMap || base?.clientsMap || []);
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
        return this.clientsMap.get(clientId);
    }
    removeClient(clientId) {
        this.clients.splice(this.clients.findIndex(val => val.clientId === clientId), 1);
        this.clientsMap.delete(clientId);
        this.clientCommandBuffer.delete(clientId);
        this.clientsActiveFile.delete(clientId);
        this.clientsSockets.delete(clientId);
        this.replicateFunction((clientWs, localClientId) => {
            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.ConsoleTyping, displayName: this.getClientObjectById(clientId)?.displayName, clientId: clientId, status: 'end' }));
        }, this.getClientObjectById(clientId));
    }
    spawnClient(ws, displayName, userData) {
        let newClient;
        console.log(displayName);
        if (userData != undefined)
            newClient = new ClientObject(this.sessionId, this, ws, userData.username, userData);
        else
            newClient = new ClientObject(this.sessionId, this, ws, displayName);
        if (this.clientsMap.size == 0) {
            this.hostClient = newClient;
            newClient.editorPermission = EditorPermission.OnlyHost;
            newClient.isHost = true;
            newClient.permissions = EditorOptionsToPermissions(this.editorOptions, newClient);
            newClient.permissions.isHost = true;
        }
        else {
            newClient.editorPermission = EditorPermission.Everyone;
            newClient.permissions = EditorOptionsToPermissions(this.editorOptions, newClient);
        }
        this.clientsSockets.set(newClient.clientId, ws);
        this.clientsMap.set(newClient.clientId, newClient);
        this.clients.push(newClient);
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
                callback(thisClientWs, thisClientId, this.clientsMap.get(thisClientId));
        });
    }
    getClientFilesPath() {
        return path_1.default.join(server_1.rootDirName, "cache", this.sessionId, "clientFiles");
    }
}
exports.EditorSession = EditorSession;
class EditorFile {
    name;
    content;
    session;
    filePath;
    editorMode;
    linkedUser;
    updateFilePath() {
        this.filePath = path_1.default.join(this.session.getClientFilesPath(), this.name);
    }
    constructor(session, name, content = undefined, options, onCreate) {
        this.session = session;
        if (options && options.linkedUser)
            this.linkedUser = options.linkedUser;
        this.name = this.linkedUser ? this.linkedUser.displayName.replaceAll(' ', '-') + "-" + name : name;
        this.updateFilePath();
        // const mode =  getEditorMode(this.name).constructor
        const editorModeClass = getEditorMode(this.name);
        this.editorMode = new editorModeClass;
        if ((content == undefined || content == '') && editorModeClass.defaultText != undefined)
            this.content = editorModeClass.defaultText.toString();
        else if (content == undefined)
            this.content = '';
        else
            this.content = content;
        if (options)
            if (options.abstract != undefined && options.abstract)
                return;
        try {
            // Create a new instance of the EditorFile class from the provided type
            // Example: let newFile = new EditorFile(session, name, content, onCreate);
            if (!fs_1.default.existsSync(this.filePath))
                fs_1.default.writeFile(this.filePath, this.content, (err) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        console.log('Created file ' + this.name);
                        if (!session.files)
                            throw 'session.files is undifined.';
                        session.files.push(this);
                        if (onCreate)
                            onCreate.call(this);
                        else
                            session.replicateFunction((clientWs) => {
                                clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.FileManagement, body: { content: this.name, command: types_2.FileManagementCommands.Create } }));
                            });
                        if (options && options.autoOpenClient)
                            this.openFile(options.autoOpenClient);
                    }
                });
            else
                throw "File already exists!";
        }
        catch (err) {
            session.replicateFunction((localws, id, localObj) => {
                localObj.sendMessage({ type: types_1.WebSocketMessageType.Console, messageType: types_1.ConsoleMessageType.Notification, body: err });
            });
        }
    }
    delete(clientObj) {
        try {
            clientObj.openFile.splice(clientObj.openFile.findIndex(val => val == this), 1);
            fs_1.default.unlink(this.filePath, (err) => {
                if (err) {
                    throw "Error deleting file: " + err.message;
                }
                else {
                    this.session.replicateFunction((cws) => {
                        cws.send(JSON.stringify({
                            type: types_1.WebSocketMessageType.FileManagement,
                            command: types_2.FileManagementCommands.Delete,
                            name: this.name,
                        }));
                    }, clientObj);
                }
            });
        }
        catch (err) {
            clientObj.sendMessage({ type: types_1.WebSocketMessageType.Console, messageType: types_1.ConsoleMessageType.Notification, body: err });
        }
    }
    rename(newName, clientObj) {
        try {
            fs_1.default.rename(this.filePath, path_1.default.join(this.session.getClientFilesPath(), newName), () => {
                this.session.replicateFunction((cws) => {
                    cws.send(JSON.stringify({
                        type: types_1.WebSocketMessageType.FileManagement,
                        command: types_2.FileManagementCommands.Rename,
                        name: this.name,
                        newName: newName
                    }));
                });
                const index = clientObj.openFileName.findIndex(name => name === this.name);
                clientObj.openFileName[index] = newName;
                this.name = newName;
                this.updateFilePath();
            });
        }
        catch (err) {
            clientObj.sendMessage({ type: types_1.WebSocketMessageType.Console, messageType: types_1.ConsoleMessageType.Notification, body: err });
        }
    }
    syncFileContent() {
        const data = fs_1.default.readFileSync(this.filePath).toString();
        this.content = data;
    }
    async openFile(clientObj, shared, closedFileName) {
        try {
            this.syncFileContent();
            const closedFileIndex = clientObj.openFileName.findIndex(name => name == closedFileName);
            if (closedFileIndex != -1) {
                clientObj.openFile.splice(clientObj.openFile.findIndex(file => file.name == closedFileName), 1);
                clientObj.openFileName.splice(clientObj.openFileName.findIndex(name => name == closedFileName), 1);
            }
            clientObj.openFile.push(this);
            clientObj.openFileName.push(this.name);
            // Send the file content to the client
            const oldFileName = clientObj.openFileName;
            // if(closedFileName)
            // {
            //     const closedFileIndex = clientObj.openFileName.findIndex(name => name == closedFileName)
            //     clientObj.openFile.splice(closedFileIndex,1)
            //     clientObj.openFileName.splice(closedFileIndex,1)
            // }
            this.session.replicateFunction((cws, id, obj) => {
                if (obj.openFileName == oldFileName)
                    cws.send(JSON.stringify({ type: types_1.WebSocketMessageType.CodeSelection, body: null }));
            }, clientObj);
            clientObj.editorMode = getEditorMode(this.name);
            // clientObj.openFileName = this.name
            this.session.clientsActiveFile.set(clientObj.clientId, this.name);
            clientObj.lastOpenFile = this;
            console.log(`Opened file ${this.name}, with mode ${(clientObj.editorMode).name}`);
            if (shared)
                shared.updateSession(this.session.sessionId, this.session);
            return this.content;
        }
        catch (err) {
            console.error(err);
        }
    }
    updateFile(clientObj, content) {
        const fileContent = content || this.content;
        //   TODO make a more efficient way of updating the file, either by streams (streaming updates to file) or a save button.
        fs_1.default.writeFile(this.filePath, fileContent, (err) => {
            if (err)
                console.error("Failed saving file! " + err);
            // if(checkSyntaxTimeout) clearTimeout(checkSyntaxTimeout)
            const fileName = this.name;
            if (!clientObj.getFile(this.name) && clientObj.getFile(fileName).editorMode && clientObj.getFile(fileName).editorMode.checkCodeSyntax)
                this.session.replicateFunction((clientWs, localClientId) => {
                    if (this.session.clientsActiveFile.get(localClientId) === this.session.clientsActiveFile.get(clientObj.clientId))
                        clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.CompileResult, fileName, clientId: clientObj.clientId, saved: true }));
                });
            else
                clientObj.getFile(fileName).editorMode.checkCodeSyntax(this.session, clientObj.getFile(fileName)).then(json => {
                    if (!JSON.parse(json)[0])
                        return this.session.replicateFunction((clientWs, localClientId) => {
                            if (this.session.clientsActiveFile.get(localClientId) === this.session.clientsActiveFile.get(clientObj.clientId))
                                clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.CompileResult, fileName, clientId: clientObj.clientId, saved: true, body: JSON.stringify([{ kind: 'success' }]) }));
                        });
                    this.session.replicateFunction((clientWs, localClientId) => {
                        if (this.session.clientsActiveFile.get(localClientId) === this.session.clientsActiveFile.get(clientObj.clientId))
                            clientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.CompileResult, fileName, clientId: clientObj.clientId, body: json, saved: true }));
                    });
                }).catch(err => {
                    console.error('syntax checker error: ' + err);
                });
        });
    }
    changeContent(data, clientObj) {
        if (data.content)
            this.content = data.content;
        else
            this.content = this.applyDelta(data.delta).join('\n');
        const checksum = (0, js_sha256_1.sha256)(this.content);
        if (data.clientChecksum) {
            const checksumFailed = checksum !== data.clientChecksum;
            // replicate changes to others
            if (checksumFailed) {
                clientObj.sendMessage({ type: types_1.WebSocketMessageType.CodeChange, clientId: clientObj.clientId, fileName: this.name, body: this.content, checksum });
                console.error('Checksum failed for session id:', this.session.sessionId, 'On client:', clientObj.clientId);
            }
            this.session.replicateFunction((thisclientWs, localClientId, thisClientObj) => {
                if (clientObj.checkClientsFileOpen(thisClientObj) && clientObj.permissions.canEdit)
                    thisclientWs.send(JSON.stringify({ type: types_1.WebSocketMessageType.CodeChange, clientId: clientObj.clientId, delta: data.delta, fileName: this.name, body: checksumFailed ? data.content : undefined, checksum }));
            }, clientObj);
            return;
        }
        else // replace with an array of clients that have this file open
            this.session.replicateFunction((thisclientWs, localClientId, thisClientObj) => {
                if (clientObj.checkClientsFileOpen(thisClientObj))
                    clientObj.sendMessage({ type: types_1.WebSocketMessageType.CodeChange, clientId: clientObj.clientId, fileName: this.name, body: this.content, checksum });
            });
    }
    onFileWatched(eventType, clientObj) {
        this.syncFileContent();
        this.changeContent({ content: this.content }, clientObj);
        console.log('Synced file content');
    }
    setFileContent(content, clientObj) {
        this.changeContent({ content }, clientObj);
        this.updateFile(clientObj);
    }
    applyDelta(delta) {
        if (!delta)
            throw new Error('Invalid delta. Cant apply delta.');
        const docLines = this.content.split('\n');
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
        return docLines;
    }
    ;
}
exports.EditorFile = EditorFile;
//   public replicateFunction(callback: Function, ignoreClient?: ClientObject) {
//     this.clients.forEach(client => {
//         if(client!=ignoreClient || !ignoreClient)
//          callback(client as ClientObject);
//     });
// }
const EditorModes = __importStar(require("./editor-modes/"));
function getEditorMode(fileName) {
    const ext = fileName.trim().split('.')[1];
    for (const mode of EditorModes.modes) {
        console.log(mode.extension);
        if (mode.extension && mode.extension.includes(ext))
            return mode;
    }
    return EditorModes.Text;
}
function randomHexColor() {
    return Math.floor(Math.max(80, Math.random() * 255)).toString(16) + Math.floor(Math.max(80, Math.random() * 255)).toString(16) + Math.floor(Math.max(80, Math.random() * 255)).toString(16);
}
