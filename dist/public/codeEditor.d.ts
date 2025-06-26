import Ace from "ace-builds";
import { UUID } from "crypto";
import { EditorWindowTab } from "./windowManager.js";
declare class Console {
    element: HTMLDivElement;
    stdin: string[];
    event: Event;
    compileMessage: HTMLDivElement | undefined;
    noVNC: HTMLIFrameElement | undefined;
    constructor();
    onCompileStart(message?: string): void;
    onProcessStart(): void;
    callbackCreate(callerConsole: Console): void;
    sendCommand(cmd: string): void;
}
declare class EditorCursor {
    cursor: HTMLDivElement | undefined;
    posX: number;
    posY: number;
    cposX: number;
    cposY: number;
    lposX: number;
    lposY: number;
    updateInterval: any;
    step: number;
    pointerType: string;
    animated: boolean;
    animTimeout: NodeJS.Timeout | undefined;
    id: any;
    cursorContainer: HTMLDivElement | undefined;
    nameElement: HTMLSpanElement | undefined;
    constructor(eventJson: any);
    protected refreshCursor(eventJson: any): HTMLDivElement;
    remove(): void;
    update(eventJson: any): void;
}
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
    Canvas = "canvas",
    RTC = "rtc"
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
declare class SessionClient {
    cursor: EditorCursor | undefined;
    typingIndicator: HTMLDivElement | undefined;
    editorSession: FileEditorSession | undefined;
    clientId: UUID;
    color: any;
    displayName: any;
    constructor(clientId: any, displayName: any, color: any);
}
export declare let client: SessionClient | undefined;
export declare let clients: Map<UUID, SessionClient>;
export declare const editorSessions: Map<string, FileEditorSession>;
export declare function displayMessagePopup(message: any): void;
export declare function toggleCamera(): void;
export declare function beautifyEditor(): void;
export declare function undo(): void;
export declare function redo(): void;
export declare function openTestSubjects(ev: any): "/subiecte" | undefined;
export declare function openChat(ev: any): void;
interface User {
    name: any;
    color: any;
    id: any;
    elem?: any;
}
declare class FileElement extends EditorWindowTab {
    Users: User[];
    fileElem: HTMLSpanElement;
    usersContainer: HTMLDivElement;
    animOptions: {
        duration: number;
        easing: string;
    };
    name: any;
    constructor(fileName: string, session: any);
    addUser(user: User, lastFileName: any): void;
    removeUser(userId: any): void;
    remove(): void;
}
export declare function createFileNamePrompt(): void;
export declare function awaitFileNamePrompt(): Promise<string>;
export declare function toggleConsoleDebugProgram(elem: HTMLElement): void;
export declare function onConsoleInput(elem: HTMLTextAreaElement, ev?: Event): void;
export declare function saveProject(): void;
export declare function listProjects(): void;
export declare function joinsession(): void;
export declare function copySessionLink(): void;
export declare function createFile(fileName?: string): void;
export declare function submitConsole(elem: HTMLTextAreaElement | null, type: WebSocketMessageType | undefined, Console?: Console): void;
type FileEditorSession = {
    editor: Ace.EditSession | undefined;
    fileName: string;
    fileElement: FileElement | undefined;
};
export declare class CompileError {
    range: Ace.Range;
    annotation: any;
    markerId: number;
    text: string;
    display: HTMLDivElement | undefined;
    constructor(range: Ace.Range, text: string);
}
export declare const compileErrorObjs: Map<number, CompileError>;
export declare function compileCode(this: any, ev: any): void;
export declare function sendDebugCommand(cmd: string): void;
export declare function playback(): void;
export declare function restartPlayback(): void;
export declare function setPlaybackSpeed(newPlaybackSpeed: number): void;
export declare function displaynoVNC(container: any): void;
export declare function downloadEditorFiles(): Promise<void>;
export {};
