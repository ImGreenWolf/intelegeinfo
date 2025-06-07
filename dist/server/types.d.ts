import { UUID } from "crypto";
import WebSocket from 'ws';
import { ChildProcess } from 'child_process';
import { WSMessage } from '../../shared/src/types';
import { UserNoPassword } from './usersManager';
import { EditorMode } from './editor-modes';
export declare class ClientObject {
    sessionId: UUID;
    clientId: UUID;
    displayName: string;
    ping: number;
    isHost: boolean;
    CWebSocket: WebSocket;
    canEdit: boolean;
    canChat: boolean;
    color: string;
    editorMode: EditorMode;
    openFileName: string;
    constructor(sessionId: UUID, EditorSession: EditorSession, WebSocket: WebSocket, displayName?: string, user?: UserNoPassword);
    sendMessage(message: string | Record<string, any>): void;
}
interface CommandBuffer {
    codeSelection: any;
}
export declare enum EditorPermission {
    OnlyHost = 2,
    RequirePermission = 1,
    Everyone = 0
}
export declare class EditorSession {
    sessionId: UUID;
    clientsActiveFile: Map<UUID, string>;
    clients: Map<UUID, ClientObject>;
    clientsDisplayNames: string[];
    clientsSockets: Map<UUID, WebSocket>;
    messageIndex: number;
    clientCommandBuffer: Map<UUID, CommandBuffer>;
    process: ChildProcess | undefined;
    msgMap: Map<number, WSMessage>;
    brainrotNames: string[];
    currentbuildTag: string;
    sessionContainer: {
        process: ChildProcess;
        imageName: string;
        fileName: string;
        editorMode: EditorMode;
    };
    gdbProcess: ChildProcess | undefined;
    program: ChildProcess | undefined;
    hostClient: ClientObject;
    isPublic: boolean;
    enableChat: boolean;
    editorPermission: EditorPermission;
    joinCode: number;
    qrCode: any;
    makeSessionPublic(enableChat: boolean, editorPermission: EditorPermission): void;
    constructor(sessionId?: UUID);
    toJSON(): any;
    static fromJSON(data: any): EditorSession;
    static fromMerge(id: UUID, base?: Partial<EditorSession>, update?: Partial<EditorSession>): EditorSession;
    private getDisplayNames;
    getClientId(ClientObject: ClientObject): UUID;
    getClientObjectById(clientId: UUID): ClientObject | undefined;
    removeClient(clientId: UUID): void;
    spawnClient(ws: WebSocket, userData?: UserNoPassword): UUID;
    replicateFunction(callback: (thisClientWs: WebSocket, thisClientId: UUID) => void, excludeClientObj?: ClientObject): void;
}
export {};
