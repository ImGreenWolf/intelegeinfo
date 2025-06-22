"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wssRTC = void 0;
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
