import { UUID } from "crypto";
import WebSocket from 'ws';
import { ChildProcess } from 'child_process';
import { WSMessage } from '../../shared/src/types';
import { WebSocketMessageType } from '../../dist/shared/types';
import { UserNoPassword } from './usersManager';
import { EditorMode } from './editor-modes';
export declare class ClientObject {
    sessionId: UUID;
    clientId: UUID;
    displayName: string;
    ping: number;
    isHost: boolean;
    CWebSocket: WebSocket;
    permissions: ClientPermissions;
    color: string;
    editorMode: typeof EditorMode;
    openFileName: string[];
    openFile: EditorFile[];
    lastOpenFile: EditorFile | undefined;
    webcamid: number;
    editorPermission: EditorPermission;
    constructor(sessionId: UUID, EditorSession: EditorSession, WebSocket: WebSocket, displayName?: string, user?: UserNoPassword);
    sendMessage(message: string | Record<string, any>, type?: WebSocketMessageType): void;
    getFile(name: any): EditorFile;
    getFilesName(): any[];
    checkClientsFileOpen(otherClient: any): boolean;
}
interface CommandBuffer {
    codeSelection: any;
}
export declare enum EditorPermission {
    OnlyHost = 2,
    RequirePermission = 1,
    Everyone = 0
}
export interface EditorOptions {
    enableChat: boolean;
    enableVoice: boolean;
    editorPermission: EditorPermission;
}
export interface ClientPermissions {
    canChat: boolean;
    canVoice: boolean;
    canEdit: boolean;
    isHost: boolean;
}
export declare class EditorSession {
    sessionId: UUID;
    clientsActiveFile: Map<UUID, string>;
    files: EditorFile[];
    clientsMap: Map<UUID, ClientObject>;
    clients: ClientObject[];
    clientsDisplayNames: string[];
    clientsSockets: Map<UUID, WebSocket>;
    messageIndex: number;
    clientCommandBuffer: Map<UUID, CommandBuffer>;
    process: DebugProcess | ChildProcess | undefined;
    msgMap: Map<number, WSMessage>;
    brainrotNames: string[];
    currentbuildTag: string;
    sessionContainer: {
        process: ChildProcess;
        imageName: string;
        fileName: string;
        editorMode: EditorMode;
    };
    gdbProcess: DebugProcess | undefined;
    program: ChildProcess | undefined;
    displayServer: number;
    hostClient: ClientObject;
    isPublic: boolean;
    joinCode: number;
    qrCode: any;
    editorOptions: EditorOptions;
    executeProblemChecker: (problemId: any) => Promise<Record<string, any>>;
    makeSessionPublic(options: EditorOptions): void;
    constructor(sessionId?: UUID);
    toJSON(): any;
    static fromJSON(data: any): EditorSession;
    static fromMerge(id: UUID, base?: Partial<EditorSession>, update?: Partial<EditorSession>): EditorSession;
    private getDisplayNames;
    getClientId(ClientObject: ClientObject): UUID;
    getClientObjectById(clientId: UUID): ClientObject | undefined;
    removeClient(clientId: UUID): void;
    spawnClient(ws: WebSocket, userData?: UserNoPassword): UUID;
    replicateFunction(callback: (thisClientWs: WebSocket, thisClientId: UUID, clientObj: ClientObject) => void, excludeClientObj?: ClientObject): void;
    getClientFilesPath(): string;
}
export declare class EditorFile {
    name: any;
    content: any;
    session: EditorSession;
    filePath: any;
    editorMode: EditorMode;
    constructor(session: EditorSession, name: string, content?: any, options?: {
        abstract?: boolean;
    }, onCreate?: (this: EditorFile) => void);
    delete(clientObj: ClientObject): void;
    rename(newName: any, clientObj: any): void;
    openFile(clientObj: ClientObject, shared?: any, closedFileName?: string): Promise<string>;
    changeContent(content: any): void;
}
import DebugProcess from './editor-modes/ProcessTypes';
export declare function randomHexColor(): string;
export {};
