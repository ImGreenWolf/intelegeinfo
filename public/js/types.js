"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleMessageType = exports.WebSocketMessageType = void 0;
var WebSocketMessageType;
(function (WebSocketMessageType) {
    WebSocketMessageType["Handshake"] = "handshake";
    WebSocketMessageType["Error"] = "error";
    WebSocketMessageType["Output"] = "output";
    WebSocketMessageType["End"] = "end";
    WebSocketMessageType["Console"] = "console";
    WebSocketMessageType["CodeChange"] = "codeChange";
    WebSocketMessageType["CodeSelection"] = "codeSelection";
    WebSocketMessageType["ColabData"] = "colabData";
    WebSocketMessageType["Heartbeat"] = "heartbeat";
    WebSocketMessageType["FileManagement"] = "FileManagement";
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
})(ConsoleMessageType || (exports.ConsoleMessageType = ConsoleMessageType = {}));
