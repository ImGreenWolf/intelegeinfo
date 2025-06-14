export declare enum WebSocketMessageType {
    Handshake = "handshake",
    Error = "error",
    Output = "output",
    End = "end",
    Console = "console",
    Chat = "chat",
    ConsoleTyping = "consolekeepalive",
    CodeChange = "codeChange",
    CodeSelection = "codeSelection",
    ColabData = "colabData",
    Heartbeat = "heartbeat",
    FileManagement = "FileManagement",
    CompileResult = "CompileResult",
    ExecuteStatus = "executestatus",
    MouseUpdate = "MouseUpdate",
    WebCam = "webcam",
    Canvas = "canvas"
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
export declare class WSMessage {
    type: WebSocketMessageType;
    data: Record<string, any>;
    id: number;
    constructor(type: WebSocketMessageType, data: Record<string, any>, msgMap: any, id: number, ws: WebSocket, onReceive: (data: Record<string, any>) => void);
    onReceiveCallback: (data: Record<string, any>) => void;
    onReceive(data: Record<string, any>): void;
    sendMessage(data: Record<string, any>, msgId: number, ws: WebSocket): void;
}
export declare enum FileManagementCommands {
    Create = "create",
    Delete = "delete",
    List = "list",
    Rename = "rename",
    Open = "open"
}
//# sourceMappingURL=types.d.ts.map