import Ace from "ace-builds";
import { UUID } from "crypto";
import xtermType from '@xterm/xterm';
import { IIWebRTC } from "./webrtcdemo.js";
import { EditorWindow, EditorWindowTab } from "./windowManager.js";
declare class VisualCursor implements Ace.Ace.MarkerLike {
    color: any;
    cursorId: string;
    private getPosition;
    constructor(color: any, cursorId: string, getPosition: () => CursorPosition);
    type: string;
    clazz: string;
    markerRef: Ace.Ace.MarkerLike | undefined;
    update(html: string[], markerLayer: any, session: Ace.Ace.EditSession, config: any): void;
}
declare class Console {
    element: HTMLDivElement;
    stdin: string;
    event: Event;
    compileMessage: HTMLDivElement | undefined;
    noVNC: HTMLIFrameElement | undefined;
    consoleInput: {
        terminal: xtermType.Terminal;
        elem: HTMLDivElement;
    } | undefined;
    content: string;
    constructor(input?: any);
    onCompileStart(message?: string): void;
    onProcessStart(): void;
    onProcessEnd(): void;
    sendCommand(cmd: string): void;
    receivePTYChunk(chunk: any): void;
}
export declare class MultiCursorManager {
    private editor;
    private cursorsPos;
    private cursors;
    constructor(editor: Ace.Ace.Editor);
    selectMarker: number | null;
    addCursor(cursorId: string, position: CursorPosition, color: any): VisualCursor;
    updateCursor(cursorId: string, position: CursorPosition): void;
    removeCursor(cursorId: string): boolean;
    replicateCursor(color: any, cursorId: string, position: CursorPosition): VisualCursor | CursorPosition | undefined;
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
    RTC = "rtc",
    Utilities = "utils",
    Debug = "debug"
}
export declare enum ConsoleMessageType {
    UserChat = "chat",
    Error = "error",
    Info = "information",
    Debug = "debug",
    SessionInfo = "session",
    Output = "output",
    DebugProgram = "debugProgram",
    Notification = "notification",
    Console = "console"
}
declare class SessionClient {
    cursor: EditorCursor | undefined;
    typingIndicator: HTMLDivElement | undefined;
    editorSession: FileEditorSession[];
    clientId: UUID;
    color: any;
    displayName: any;
    canEdit: boolean;
    sessionIcon: HTMLElement;
    rtcConnection: IIWebRTC | undefined;
    isHost: boolean;
    constructor(clientId: any, displayName: any, color: any, canEdit: any, userId: number | undefined, isLocal: any, clientIsHost: boolean);
    onJoin(): void;
    onDisconect(): void;
}
export declare let client: SessionClient | undefined;
export declare let clients: Map<UUID, SessionClient>;
export declare const editorSessions: Map<string, FileEditorSession>;
export declare const windows: EditorWindow[];
declare var Tooltip: any;
type CursorPosition = {
    row: number;
    column: number;
};
export declare let isRemoteChange: boolean;
export declare function toggleCamera(): void;
export declare function beautifyEditor(): void;
export declare function undo(): void;
export declare function redo(): void;
export declare function displayBlankEditor(index: any): void;
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
    nameElement: any;
    constructor(fileName: string, session: HTMLElement | Ace.EditSession | undefined, index?: number);
    getDragText: () => string | undefined;
    openTab(ev?: MouseEvent): void;
    addUser(user: User, lastFileName: any): void;
    removeUser(userId: UUID): void;
    remove(): void;
}
export declare function createFileNamePrompt(): void;
export declare function awaitFileNamePrompt(fileName?: string): Promise<string>;
export declare function toggleConsoleDebugProgram(elem: HTMLElement): void;
export declare function onConsoleInput(elem: HTMLTextAreaElement, ev?: Event): void;
export declare function saveProject(): Promise<void>;
export declare function listProjects(): boolean | undefined;
export declare function sendWebsocketCommand(cmd: string, argsArr?: string[]): void;
export declare function joinsession(): boolean | undefined;
export declare function copySessionLink(): boolean | void;
export declare function createFile(fileName?: string, fileContent?: any, index?: number): void;
export declare function closeDefaultScreen(createdFileElement: any): void;
export declare function openFile(fileName?: string): void;
export declare let tooltip: any;
export declare class TokenTooltip extends Tooltip {
    constructor(editor: any);
    token: {};
    range: any;
    update(): Promise<void>;
    onMouseMove(e: any): void;
    onMouseOut(e: any): void;
    setPosition(x: any, y: any): void;
    destroy(): void;
}
export declare let ws: WebSocket;
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
    constructor(session: any, range: Ace.Range, text: string);
}
export declare function dirtyFile(fileName: string): void;
export declare const compileErrorObjs: Map<number, CompileError>;
export declare function compileCode(this: any, ev: any): void;
export declare function sendDebugCommand(cmd: string): void;
export declare function playback(): void;
export declare function restartPlayback(): void;
export declare function setPlaybackSpeed(newPlaybackSpeed: number): void;
export declare function displaynoVNC(container: any): void;
export declare function parseCode(): {
    functions: {
        name: string;
        value: string;
        type: string;
        depth: number;
        tokenIndex: number;
        content: string;
    }[];
    variables: {
        name: string;
        type: string;
        depth: number;
        tokenIndex: number;
        functionName: string;
    }[];
} | undefined;
export declare function indexToFunctionName(parsedCode: any, index: any): any;
export declare function downloadEditorFiles(): Promise<void>;
export declare function onFileSessionUpdated(newFileName: any, client: SessionClient): void;
export {};
