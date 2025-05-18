import { ChildProcess } from "child_process";
import WebSocket from "ws";
import { EditorSession } from "./types";
import { UUID } from "crypto";
export declare function authMiddleware(req: any, res: any, next: any, role?: string): void;
export declare abstract class EditorMode {
    abstract name: any;
    abstract HandleClientInput(): any;
}
export declare const server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
export declare const wss: WebSocket.Server<typeof WebSocket, typeof import("http").IncomingMessage>;
export declare let clients: Map<UUID, WebSocket>;
export declare let runningProcesses: Map<UUID, ChildProcess>;
export declare let sessionMap: Map<UUID, EditorSession>;
