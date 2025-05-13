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
export declare function createFileNamePrompt(): void;
export declare function toggleConsoleDebugProgram(elem: HTMLElement): void;
export declare function onConsoleInput(elem: HTMLTextAreaElement, ev?: Event): void;
export declare function saveProject(): void;
export declare function listProjects(): void;
export declare function joinsession(): void;
export declare function copySessionLink(): void;
export declare function createFile(fileName?: string): void;
export declare const ws: WebSocket;
export declare function submitConsole(elem: HTMLTextAreaElement | null): void;
export declare function compileCode(this: any, ev: any): void;
export declare function sendDebugCommand(cmd: string): void;
export declare function playback(): void;
export declare function restartPlayback(): void;
export declare function setPlaybackSpeed(newPlaybackSpeed: number): void;
