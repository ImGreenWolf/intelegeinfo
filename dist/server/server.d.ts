import { ChildProcess } from "child_process";
import WebSocket from "ws";
import { EditorSession } from "./types";
export declare const rootDirName: string;
import sqids from 'sqids';
export declare const sqid: sqids;
export declare const tokenCookieName = "iiauthtoken";
import { Prisma } from "../../generated/prisma";
import { UUID } from "crypto";
export declare const joinsqid: sqids;
export declare function authMiddleware(req: any, res: any, next: any, role?: string): any;
export declare function handlePrismaError(error: any): any;
import * as https from 'https';
import * as http from 'http';
export declare const server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> | https.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
export declare let clients: Map<UUID, WebSocket>;
export declare let runningProcesses: Map<UUID, ChildProcess>;
export declare let sessionMap: Map<UUID, EditorSession>;
export declare const wss: WebSocket.Server<typeof WebSocket, typeof http.IncomingMessage>;
export declare function newWSS(path: any): WebSocket.Server<typeof WebSocket, typeof http.IncomingMessage>;
export type SharedProjectType = Awaited<ReturnType<typeof loadShareProject>>;
declare function loadShareProject(shareId: any): Promise<{
    Project: {
        files: {
            name: string;
            updatedAt: Date;
            projectId: number;
            content: string;
        }[];
    } & {
        id: number;
        name: string | null;
        userId: number | null;
        createdAt: Date;
        fileUUID: string | null;
        metadata: Prisma.JsonValue | null;
    };
    createdBy: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
        userColor: string;
    };
} & {
    id: number;
    creatorId: number | null;
    projectId: number;
    openedAt: Date;
    sharedAt: Date;
}>;
export declare function sendFile(path: string, res: any, req: any, params?: any): any;
export declare function parseText(file: string, req: any, params?: any): string;
export declare function parseHTML(req: any, res: any, next: any): void;
export {};
