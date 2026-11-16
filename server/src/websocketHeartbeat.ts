import WebSocket from 'ws';

// Protocol pings keep reverse proxies active even when the editor is idle.
// Browsers answer these automatically, including when JS timers are throttled.
export function startWebSocketHeartbeat(socket: WebSocket, intervalMs = 25000): () => void {
    let alive = true;
    const onPong = () => { alive = true; };
    const stop = () => {
        clearInterval(timer);
        socket.removeListener('pong', onPong);
    };
    const timer = setInterval(() => {
        if (socket.readyState !== WebSocket.OPEN) {
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
        } catch {
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
