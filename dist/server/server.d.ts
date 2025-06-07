import { ChildProcess } from "child_process";
import WebSocket from "ws";
import { EditorSession } from "./types";
import { UUID } from "crypto";
export declare const rootDirName: string;
export declare function authMiddleware(req: any, res: any, next: any, role?: string): void;
export declare abstract class EditorMode {
    abstract name: any;
    abstract dockerFile: any;
    abstract HandleClientInput(): any;
}
export declare const server: import("http").Server<typeof IncomingMessage, typeof import("http").ServerResponse>;
export declare const wss: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>;
export declare let clients: Map<UUID, WebSocket>;
export declare let runningProcesses: Map<UUID, ChildProcess>;
export declare let sessionMap: Map<UUID, EditorSession>;
import { IncomingMessage } from "http";
