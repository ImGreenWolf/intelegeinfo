const {test} = require('node:test');
const assert = require('node:assert/strict');
const {EventEmitter} = require('node:events');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const WebSocket = require('ws');

function setup() {
    const module = {exports: {}};
    let tick, interval, cleared = false;
    const code = ts.transpileModule(fs.readFileSync('server/src/websocketHeartbeat.ts', 'utf8'), {
        compilerOptions: {module: ts.ModuleKind.CommonJS, esModuleInterop: true}
    }).outputText;
    vm.runInNewContext(code, {
        module, exports: module.exports, require,
        setInterval(callback, ms) {tick = callback; interval = ms; return {unref() {}};},
        clearInterval() {cleared = true;}
    });
    const socket = new EventEmitter();
    socket.readyState = WebSocket.OPEN;
    socket.pings = 0;
    socket.terminated = 0;
    socket.ping = () => {socket.pings++;};
    socket.terminate = () => {socket.terminated++; socket.emit('close');};
    module.exports.startWebSocketHeartbeat(socket);
    return {socket, tick: () => tick(), interval: () => interval, cleared: () => cleared};
}

test('idle sockets get protocol pings before the proxy idle timeout', () => {
    const t = setup();
    assert.equal(t.interval(), 25000);
    t.tick();
    t.socket.emit('pong');
    t.tick();
    assert.equal(t.socket.pings, 2);
    assert.equal(t.socket.terminated, 0);
});

test('unresponsive peers are terminated and their heartbeat timers are released', () => {
    const t = setup();
    t.tick();
    t.tick();
    assert.equal(t.socket.terminated, 1);
    assert.equal(t.cleared(), true);
    assert.equal(t.socket.listenerCount('pong'), 0);
});

test('closed sockets and ping failures release heartbeat timers', () => {
    const closed = setup();
    closed.socket.emit('close');
    assert.equal(closed.cleared(), true);
    const failed = setup();
    failed.socket.ping = () => {throw new Error('Socket write failed');};
    assert.doesNotThrow(() => failed.tick());
    assert.equal(failed.socket.terminated, 1);
    assert.equal(failed.cleared(), true);
});
