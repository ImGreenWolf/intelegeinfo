import { UUID } from "crypto";
import WebSocket from 'ws';
import { ChildProcess } from 'child_process';
import { WSMessage } from '../shared/src/types';
import { User } from '../generated/prisma';
export declare class ClientObject {
    sessionId: UUID;
    clientId: UUID;
    displayName: string;
    ping: number;
    constructor(sessionId: UUID, EditorSession: EditorSession, displayName?: string);
}
interface CommandBuffer {
    codeSelection: any;
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
    constructor(sessionId?: UUID);
    toJSON(): any;
    static fromJSON(data: any): EditorSession;
    static fromMerge(id: UUID, base?: Partial<EditorSession>, update?: Partial<EditorSession>): EditorSession;
    private getDisplayNames;
    getClientId(ClientObject: ClientObject): UUID;
    getClientObjectById(clientId: UUID): ClientObject | undefined;
    removeClient(clientId: UUID): void;
    spawnClient(ws: WebSocket, userData?: User): UUID;
    replicateFunction(callback: (thisClientWs: WebSocket, thisClientId: UUID) => void, excludeClientObj?: ClientObject): void;
}
export {};
