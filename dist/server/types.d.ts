import { UUID } from "crypto";
import WebSocket from 'ws';
import { WSMessage } from '../../shared/src/types';
import { WebSocketMessageType } from '../../dist/shared/types';
import { Project } from '../../generated/prisma';
import { UserNoPassword } from './usersManager';
import { EditorMode } from './editor-modes';
import fs, { WatchEventType } from 'fs';
import { SharedProjectType } from './server';
import { WebSocketMessage } from "../../shared/src/messageTypes";
import * as Nodepty from "node-pty";
import { EventEmitter } from "events";
export declare class ClientObject {
    sessionId: UUID;
    clientId: UUID;
    displayName: string;
    process: (Nodepty.IPty & EventEmitter) | DebugProcess;
    program: (Nodepty.IPty & EventEmitter) | undefined;
    debugProgram: DebugProcess | undefined;
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
    clientData: UserNoPassword;
    constructor(sessionId: UUID, editorSession: EditorSession, WebSocket: WebSocket, displayName?: string, user?: UserNoPassword);
    private setRandomName;
    sendMessage(message: WebSocketMessage | string | Record<string, any>, type?: WebSocketMessageType): void;
    getFile(name: any): EditorFile;
    getFilesName(): string[];
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
    sandboxUsers?: boolean;
    externalLinks?: boolean;
    anonymousNames?: boolean;
    allowedLanguage?: typeof EditorMode;
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
    savedProject?: Project;
    sharedProject?: SharedProjectType;
    clientsMap: Map<UUID, ClientObject>;
    clients: ClientObject[];
    clientsDisplayNames: string[];
    clientsSockets: Map<UUID, WebSocket>;
    messageIndex: number;
    clientCommandBuffer: Map<UUID, CommandBuffer>;
    process: DebugProcess | (Nodepty.IPty & EventEmitter) | undefined;
    msgMap: Map<number, WSMessage>;
    brainrotNames: string[];
    currentbuildTag: string;
    sessionContainer: {
        process: Nodepty.IPty;
        imageName: string;
        fileName: string;
        editorMode: EditorMode;
    };
    gdbProcess: DebugProcess | undefined;
    program: (Nodepty.IPty & EventEmitter) | undefined;
    displayServer: number;
    fileWatcher: fs.FSWatcher;
    hostClient: ClientObject;
    isPublic: boolean;
    joinCode: number;
    qrCode: any;
    editorOptions: EditorOptions;
    executeProblemChecker: (problemId: any) => Promise<PromiseSettledResult<{
        status: string;
        error: boolean;
        index: number;
        score: number;
        time?: number;
    } | undefined>[]>;
    makeSessionPublic(options: EditorOptions): void;
    constructor(sessionId?: UUID);
    toJSON(): any;
    static fromJSON(data: any): EditorSession;
    static fromMerge(id: UUID, base?: Partial<EditorSession>, update?: Partial<EditorSession>): EditorSession;
    private getDisplayNames;
    getClientId(ClientObject: ClientObject): UUID;
    getClientObjectById(clientId: UUID): ClientObject | undefined;
    removeClient(clientId: UUID): void;
    spawnClient(ws: WebSocket, displayName: string, userData?: UserNoPassword): UUID;
    replicateFunction(callback: (thisClientWs: WebSocket, thisClientId: UUID, clientObj: ClientObject) => void, excludeClientObj?: ClientObject): void;
    getClientFilesPath(): string;
}
export declare class EditorFile {
    name: string;
    content: string;
    session: EditorSession;
    filePath: string;
    editorMode: EditorMode;
    linkedUser?: ClientObject | undefined;
    private updateFilePath;
    constructor(session: EditorSession, name: string, content?: any, options?: {
        abstract?: boolean /**Doesnt atually create a file on disk, acts just as a variable, use if you already created the file */;
        autoOpenClient?: ClientObject;
        linkedUser?: ClientObject;
    }, onCreate?: (this: EditorFile) => void);
    delete(clientObj: ClientObject, clientSession: EditorSession): void;
    rename(newName: any, clientObj: ClientObject): void;
    syncFileContent(): void;
    openFile(clientObj: ClientObject, shared?: any, closedFileName?: string): Promise<string>;
    updateFile(clientObj: ClientObject, content?: string): void;
    changeContent(data: {
        content?: any;
        delta?: any;
        clientChecksum?: any;
    }, clientObj: ClientObject): void;
    onFileWatched(eventType: WatchEventType, clientObj: any): void;
    setFileContent(content: any, clientObj: any): void;
    private applyDelta;
}
import DebugProcess from './editor-modes/ProcessTypes';
export declare function randomHexColor(): string;
export {};
