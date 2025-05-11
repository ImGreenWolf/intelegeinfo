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
    FileManagement = "FileManagement"
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
    constructor(type: WebSocketMessageType, data: Record<string, any>, msgMap: any, id: number, onReceive: (data: Record<string, any>) => void);
    onReceiveCallback: (data: Record<string, any>) => void;
    onReceive(data: Record<string, any>): void;
    sendMessage(data: Record<string, any>, msgId: number): void;
}
