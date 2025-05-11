export declare enum WebSocketMessageType {
    Handshake = "handshake",
    Error = "error",
    Output = "output",
    End = "end",
    Console = "console",
    ConsoleTyping = "consolekeepalive",
    CodeChange = "codeChange",
    CodeSelection = "codeSelection",
    ColabData = "colabData",
    Heartbeat = "heartbeat",
    FileManagement = "FileManagement",
    CompileResult = "CompileResult",
    ExecuteStatus = "executestatus"
}
export declare enum ConsoleMessageType {
    UserChat = "chat",
    Error = "error",
    Info = "information",
    Debug = "debug",
    SessionInfo = "session",
    Output = "output",
    DebugProgram = "debugProgram"
}
export declare function onConsoleInput(this: GlobalEventHandlers | HTMLTextAreaElement, ev?: Event): void;
export declare function saveProject(): void;
export declare function createFile(fileName?: string): void;
export declare const ws: WebSocket;
export declare function compileCode(this: any, ev: any): void;
export declare function playback(): void;
