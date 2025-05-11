"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const types_1 = require("./types");
class SharedStateManager {
    static instance;
    redis;
    pubSub;
    clients = new Map();
    runningProcesses = new Map();
    sessionMap = new Map();
    WORKER_ID = process.env.WORKER_ID || process.pid.toString();
    constructor() {
        // Initialize Redis connection (supports both standalone and cluster)
        this.redis = process.env.REDIS_CLUSTER === 'true'
            ? new ioredis_1.default.Cluster((process.env.REDIS_NODES || 'redis://host.docker.internal:6379').split(',').map(url => ({ host: url })), {
                scaleReads: 'slave',
                redisOptions: {
                    tls: process.env.REDIS_TLS === 'true' ? {} : undefined
                }
            })
            : new ioredis_1.default(process.env.REDIS_URL || 'redis://host.docker.internal:6379');
        this.pubSub = this.redis.duplicate();
        this.initializeSubscriptions();
    }
    static getInstance() {
        if (!SharedStateManager.instance) {
            SharedStateManager.instance = new SharedStateManager();
        }
        return SharedStateManager.instance;
    }
    async initializeSubscriptions() {
        await this.pubSub.subscribe('state-updates');
        this.pubSub.on('message', async (channel, message) => {
            if (channel != 'state-updates')
                return;
            const { event, source } = JSON.parse(message);
            if (source === this.WORKER_ID)
                return; // Ignore own events
            console.log(process.pid + "$: updated variable: " + event);
            switch (event) {
                case 'CLIENTS_UPDATED':
                    await this.loadClients();
                    break;
                case 'PROCESSES_UPDATED':
                    await this.loadProcesses();
                    break;
                case 'SESSIONS_UPDATED':
                    await this.loadSessions();
                    break;
            }
            const callbacks = this.updateCallbacks.get(event) || [];
            for (const cb of callbacks)
                cb();
        });
    }
    // Client methods
    getClient(id) {
        return this.clients.get(id);
    }
    async addClient(id, sessionId) {
        this.clients.set(id, sessionId);
        await this.redis.hset('clients', id, sessionId); // Store minimal data
        await this.notifyUpdate('CLIENTS_UPDATED');
    }
    async removeClient(id) {
        this.clients.delete(id);
        await this.redis.hdel('clients', id);
        await this.notifyUpdate('CLIENTS_UPDATED');
    }
    // Process methods
    getProcess(id) {
        return this.runningProcesses.get(id);
    }
    async addProcess(id, process) {
        this.runningProcesses.set(id, process);
        await this.redis.hset('processes', id, process.pid?.toString() || '');
        await this.notifyUpdate('PROCESSES_UPDATED');
        process.on('exit', async () => {
            await this.removeProcess(id);
        });
    }
    async removeProcess(id) {
        this.runningProcesses.delete(id);
        await this.redis.hdel('processes', id);
        await this.notifyUpdate('PROCESSES_UPDATED');
    }
    // Session methods
    getSession(id) {
        return this.sessionMap.get(id);
    }
    async getClientIds() {
        const raw = await this.redis.hkeys('clients');
        return raw;
    }
    async getAllSessions() {
        const sessions = await this.redis.hgetall('sessions');
        const result = {};
        for (const [id, value] of Object.entries(sessions)) {
            result[id] = types_1.EditorSession.fromJSON(JSON.parse(value)); // if you have a fromJSON method
        }
        return result;
    }
    //   public async updateSession(id: UUID, session: EditorSession): Promise<void> {
    //     const existing = this.sessionMap.get(id);// || { lastActive: new Date() } as EditorSession;
    //     const updated = EditorSession.fromMerge(id, existing, session);
    //     this.sessionMap.set(id, updated);
    //     await this.redis.hset('sessions', id, JSON.stringify(updated.toJSON()));
    //     await this.notifyUpdate('SESSIONS_UPDATED');
    //   }
    async updateSession(id, session) {
        this.sessionMap.set(id, session);
        await this.redis.hset('sessions', id, JSON.stringify(session.toJSON()));
        await this.notifyUpdate('SESSIONS_UPDATED');
    }
    async removeSession(id) {
        this.sessionMap.delete(id);
        await this.redis.hdel('sessions', id);
        await this.notifyUpdate('SESSIONS_UPDATED');
    }
    // Helper methods
    async notifyUpdate(event) {
        await this.redis.publish('state-updates', JSON.stringify({
            event,
            source: this.WORKER_ID,
        }));
    }
    async loadClients() {
        const clients = await this.redis.hgetall('clients');
        // Maintain existing WebSocket connections, just update the keys
        const newClients = new Map();
        Object.keys(clients).forEach(id => {
            if (this.clients.has(id)) {
                newClients.set(id, this.clients.get(id));
            }
        });
        this.clients = newClients;
    }
    async loadProcesses() {
        const processes = await this.redis.hgetall('processes');
        // Processes can't be restored - just clear local cache
        this.runningProcesses = new Map();
    }
    //   private async loadSessions(): Promise<void> {
    //     const sessions = await this.redis.hgetall('sessions');
    //     this.sessionMap = new Map(
    //       Object.entries(sessions).map(([id, session]) => [
    //         id as UUID,
    //         EditorSession.fromJSON(JSON.parse(session))
    //       ])
    //     );
    //   }
    async loadSessions() {
        const sessions = await this.redis.hgetall('sessions');
        this.sessionMap = new Map(Object.entries(sessions).map(([id, session]) => [
            id,
            types_1.EditorSession.fromJSON(JSON.parse(session))
        ]));
    }
    updateCallbacks = new Map();
    onUpdate(event, callback) {
        if (!this.updateCallbacks.has(event)) {
            this.updateCallbacks.set(event, []);
        }
        this.updateCallbacks.get(event).push(callback);
    }
    // Cleanup
    async close() {
        await this.redis.flushdb();
        this.pubSub.disconnect();
        this.redis.disconnect();
    }
}
exports.default = SharedStateManager;
