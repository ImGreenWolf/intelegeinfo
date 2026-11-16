import WebSocket from 'ws';
export declare function startWebSocketHeartbeat(socket: WebSocket, intervalMs?: number): () => void;
