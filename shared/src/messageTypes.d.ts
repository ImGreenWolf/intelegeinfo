import { UUID } from "crypto";
import { type WebSocketMessageType , type ConsoleMessageType} from "./types";
// import { type ClientPermissions } from "../../server/src/types"

// export type MessageType = {
//     readonly [K in WebSocketMessageType]:
//         K extends WebSocketMessageType.Handshake ? { type: K, messageType: string, sessionId: string, body: unknown, project?: unknown, session: unknown, files: unknown, users?: unknown } :
//         K extends WebSocketMessageType.ColabData ? Record<string, unknown> :
//         K extends WebSocketMessageType.CompileResult ? Record<string, unknown> :
//         K extends WebSocketMessageType.MouseUpdate ? Record<string, unknown> :
//         K extends WebSocketMessageType.Canvas ? Record<string, unknown> :
//         K extends WebSocketMessageType.Chat ? Record<string, unknown> :
//         K extends WebSocketMessageType.CodeChange ? Record<string, unknown> :
//         K extends WebSocketMessageType.CodeSelection ? Record<string, unknown> :
//         K extends WebSocketMessageType.Console ? Record<string, unknown> :
//         K extends WebSocketMessageType.ConsoleTyping ? Record<string, unknown> :
//         K extends WebSocketMessageType.End ? Record<string, unknown> :
//         K extends WebSocketMessageType.Error ? Record<string, unknown> :
//         K extends WebSocketMessageType.ExecuteStatus ? Record<string, unknown> :
//         K extends WebSocketMessageType.FileManagement ? Record<string, unknown> :
//         K extends WebSocketMessageType.Output ? Record<string, unknown> :
//         K extends WebSocketMessageType.RTC ? Record<string, unknown> :
//         K extends WebSocketMessageType.WebCam ? Record<string, unknown> :
//         K extends WebSocketMessageType.Heartbeat ? Record<string, unknown> :
//         never;
// };
type KnownTypes = DefinedWebSocketMessage['type']; 

type DefinedWebSocketMessage = HandshakeMessage //| ColabDataMessage | CompileResultMessage

type WebSocketMessage = DefinedWebSocketMessage | UnknownMessage;

type UnknownMessage = {
  type: Exclude<WebSocketMessageType, KnownTypes>;
  [key: string]: any;
};

type HandshakeMessage = {
    type: WebSocketMessageType.Handshake;
    messageType: string;
    sessionId: UUID;
    clientId: UUID;
    displayName: string;
    color: string;
    body: string;
    permissions: any;
    files: string[];
    project?: string[];
    users: {displayName: string, clientId: UUID, openFile: string[], color: string}[];
};

// type ColabDataMessage = {
//     type: WebSocketMessageType.ColabData;
//     // other fields
//     [key: string]: unknown;
// };

// type CompileResultMessage = {
//     type: WebSocketMessageType.CompileResult;
//     [key: string]: unknown;
// };