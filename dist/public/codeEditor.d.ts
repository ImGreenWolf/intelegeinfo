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
    MouseUpdate = "MouseUpdate"
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
export declare function displayMessagePopup(message: any): void;
export declare function beautifyEditor(): void;
export declare function undo(): void;
export declare function redo(): void;
export declare function createFileNamePrompt(): void;
export declare function awaitFileNamePrompt(): Promise<string>;
export declare function toggleConsoleDebugProgram(elem: HTMLElement): void;
export declare function onConsoleInput(elem: HTMLTextAreaElement, ev?: Event): void;
export declare function saveProject(): void;
export declare function listProjects(): void;
export declare function joinsession(): void;
export declare function copySessionLink(): void;
export declare function createFile(fileName?: string): void;
