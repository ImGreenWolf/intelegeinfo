"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManagementCommands = exports.WSMessage = exports.sessionCookieName = exports.ConsoleMessageType = exports.WebSocketMessageType = void 0;
var WebSocketMessageType;
(function (WebSocketMessageType) {
    WebSocketMessageType["Handshake"] = "handshake";
    WebSocketMessageType["Error"] = "error";
    WebSocketMessageType["Output"] = "output";
    WebSocketMessageType["End"] = "end";
    WebSocketMessageType["Console"] = "console";
    WebSocketMessageType["Chat"] = "chat";
    WebSocketMessageType["ConsoleTyping"] = "consolekeepalive";
    WebSocketMessageType["CodeChange"] = "codeChange";
    WebSocketMessageType["CodeSelection"] = "codeSelection";
    WebSocketMessageType["ColabData"] = "colabData";
    WebSocketMessageType["Heartbeat"] = "heartbeat";
    WebSocketMessageType["FileManagement"] = "FileManagement";
    WebSocketMessageType["CompileResult"] = "CompileResult";
    WebSocketMessageType["ExecuteStatus"] = "executestatus";
    WebSocketMessageType["MouseUpdate"] = "MouseUpdate";
    WebSocketMessageType["WebCam"] = "webcam";
    WebSocketMessageType["Canvas"] = "canvas";
    WebSocketMessageType["RTC"] = "rtc";
    WebSocketMessageType["Utilities"] = "utils";
})(WebSocketMessageType || (exports.WebSocketMessageType = WebSocketMessageType = {}));
var ConsoleMessageType;
(function (ConsoleMessageType) {
    ConsoleMessageType["UserChat"] = "chat";
    ConsoleMessageType["Error"] = "error";
    ConsoleMessageType["Info"] = "information";
    ConsoleMessageType["Debug"] = "debug";
    ConsoleMessageType["SessionInfo"] = "session";
    ConsoleMessageType["Output"] = "output";
    ConsoleMessageType["DebugProgram"] = "debugProgram";
    ConsoleMessageType["Notification"] = "notification";
})(ConsoleMessageType || (exports.ConsoleMessageType = ConsoleMessageType = {}));
exports.sessionCookieName = 'editor_session_id';
class WSMessage {
    type;
    data;
    id;
    // session: EditorSession;
    constructor(type, data, msgMap, id, ws, onReceive) {
        this.type = type;
        this.data = data;
        this.id = id;
        // this.session = session;
        // this.onReceiveMsg(data)
        // {
        //     this.onReceive(data)
        // }
        this.onReceiveCallback = onReceive;
        this.sendMessage(data, id, ws);
    }
    onReceiveCallback;
    onReceive(data) {
        this.onReceiveCallback(data);
        // msgMap.delete(this.id);
    }
    sendMessage(data, msgId, ws) {
        ws.send(JSON.stringify({ data, msgId: msgId }));
        console.log("sent message");
        // msgMap.set(msgId, this);
    }
}
exports.WSMessage = WSMessage;
var FileManagementCommands;
(function (FileManagementCommands) {
    FileManagementCommands["Create"] = "create";
    FileManagementCommands["Delete"] = "delete";
    FileManagementCommands["List"] = "list";
    FileManagementCommands["Rename"] = "rename";
    FileManagementCommands["Open"] = "open";
})(FileManagementCommands || (exports.FileManagementCommands = FileManagementCommands = {}));
