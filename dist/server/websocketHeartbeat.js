"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebSocketHeartbeat = startWebSocketHeartbeat;
const ws_1 = __importDefault(require("ws"));
// Protocol pings keep reverse proxies active even when the editor is idle.
// Browsers answer these automatically, including when JS timers are throttled.
function startWebSocketHeartbeat(socket, intervalMs = 25000) {
    let alive = true;
    const onPong = () => { alive = true; };
    const stop = () => {
        clearInterval(timer);
        socket.removeListener('pong', onPong);
    };
    const timer = setInterval(() => {
        if (socket.readyState !== ws_1.default.OPEN) {
            stop();
            return;
        }
        if (!alive) {
            stop();
            socket.terminate();
            return;
        }
        alive = false;
        try {
            socket.ping();
        }
        catch {
            stop();
            socket.terminate();
        }
    }, intervalMs);
    timer.unref();
    socket.on('pong', onPong);
    socket.once('close', stop);
    socket.once('error', stop);
    return stop;
}
