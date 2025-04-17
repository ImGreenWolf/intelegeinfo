export enum WebSocketMessageType {
    Handshake = "handshake",
    Error = "error",
    Output = "output",
    End = "end",
    Console = "console",
    CodeChange = "codeChange",
    CodeSelection = "codeSelection",
    ColabData = "colabData",
    Heartbeat = "heartbeat",
    FileManagement = "FileManagement",
}

export enum ConsoleMessageType {
    UserChat = 'chat',
    Error = 'error',
    Info = 'information',
    Debug = 'debug',
    SessionInfo = "session",
    Output = 'output'
}