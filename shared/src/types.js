export var WebSocketMessageType;
(function (WebSocketMessageType) {
    WebSocketMessageType["Handshake"] = "handshake";
    WebSocketMessageType["Error"] = "error";
    WebSocketMessageType["Output"] = "output";
    WebSocketMessageType["End"] = "end";
    WebSocketMessageType["Console"] = "console";
    WebSocketMessageType["ConsoleTyping"] = "consolekeepalive";
    WebSocketMessageType["CodeChange"] = "codeChange";
    WebSocketMessageType["CodeSelection"] = "codeSelection";
    WebSocketMessageType["ColabData"] = "colabData";
    WebSocketMessageType["Heartbeat"] = "heartbeat";
    WebSocketMessageType["FileManagement"] = "FileManagement";
})(WebSocketMessageType || (WebSocketMessageType = {}));
export var ConsoleMessageType;
(function (ConsoleMessageType) {
    ConsoleMessageType["UserChat"] = "chat";
    ConsoleMessageType["Error"] = "error";
    ConsoleMessageType["Info"] = "information";
    ConsoleMessageType["Debug"] = "debug";
    ConsoleMessageType["SessionInfo"] = "session";
    ConsoleMessageType["Output"] = "output";
    ConsoleMessageType["DebugProgram"] = "debugProgram";
})(ConsoleMessageType || (ConsoleMessageType = {}));
import { msgMap, ws } from "../../public/js/codeEditor";
export class WSMessage {
    type;
    data;
    id;
    // session: EditorSession;
    constructor(type, data, msgMap, id, onReceive) {
        this.type = type;
        this.data = data;
        this.id = id;
        // this.session = session;
        // this.onReceiveMsg(data)
        // {
        //     this.onReceive(data)
        // }
        this.onReceiveCallback = onReceive;
        this.sendMessage(data, id);
    }
    onReceiveCallback;
    onReceive(data) {
        this.onReceiveCallback(data);
        msgMap.delete(this.id);
    }
    sendMessage(data, msgId) {
        ws.send(JSON.stringify({ data, msgId: msgId }));
        console.log("sent message");
        msgMap.set(msgId, this);
    }
}
