import WebSocket from 'ws';
declare const router: import("express-serve-static-core").Router;
export default router;
export declare const wssAPI: WebSocket.Server<typeof WebSocket, typeof import("http").IncomingMessage>;
