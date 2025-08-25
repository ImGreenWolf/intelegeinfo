"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wssFS = exports.wssRTC = void 0;
const node_crypto_1 = require("node:crypto");
const ws_1 = __importDefault(require("ws"));
exports.wssRTC = new ws_1.default.Server({ noServer: true, clientTracking: true, });
const clients = [];
exports.wssRTC.on('connection', ws => {
    clients.push(ws);
    console.log('rtc peer connected to STUN', clients.length);
    ws.on('message', data => {
        for (const client of clients)
            if (client != ws && client.OPEN)
                client.send(data.toString());
    });
    ws.on('close', code => {
        const index = clients.indexOf(ws);
        clients.splice(index);
    });
});
exports.wssFS = new ws_1.default.Server({ noServer: true });
const clientsMap = new Map();
exports.wssFS.on('connection', (ws, req) => {
    function sendMessage(msg, socket = ws) {
        socket.send(JSON.stringify(msg));
    }
    function sendError(error) {
        sendMessage({ type: 'error', error });
    }
    const wsURL = new URL('https://intelegeinfo.ro/' + req.url);
    if (wsURL.searchParams.has('clientId'))
        var clientId = wsURL.searchParams.get('clientId');
    else
        var clientId = (0, node_crypto_1.randomUUID)().split('-')[0];
    if (clientsMap.has(clientId))
        return sendError('Client aready exists, please create another link.');
    clientsMap.set(clientId, ws);
    sendMessage({ type: 'init', clientId });
    if (wsURL.searchParams.has('targetId'))
        connectToTarget(wsURL.searchParams.get('targetId'));
    ws.addListener("message", async (data, isBinary) => {
        const message = JSON.parse(data.toString());
        switch (message.type) {
            case 'connect':
                connectToTarget(message.target);
                break;
            case 'rtc':
                if (!clientsMap.has(message.targetId))
                    return sendError('Invalid target reference');
                const targetWS = clientsMap.get(message.targetId);
                sendMessage({ ...message, clientId }, targetWS);
                break;
        }
    });
    ws.onclose = (ev) => {
        clientsMap.delete(clientId);
    };
    function connectToTarget(targetId) {
        if (!targetId)
            throw 'invalid target id';
        if (!clientsMap.has(targetId))
            return sendError('Invalid target');
        sendMessage({ type: 'connect', targetId, request: false });
        sendMessage({ type: 'connect', targetId: clientId, request: true }, clientsMap.get(targetId));
    }
});
