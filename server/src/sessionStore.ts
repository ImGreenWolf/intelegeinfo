import Redis, { Cluster } from 'ioredis';
import { WebSocket } from 'ws';
import { ChildProcess } from 'child_process';
import { EditorSession, ClientObject } from './types';
import { UUID } from 'crypto';



class SharedStateManager {
  private static instance: SharedStateManager;
  private redis: Redis | Cluster;
  private pubSub: Redis | Cluster;
  
  private clients: Map<UUID, UUID> = new Map();
  private runningProcesses: Map<UUID, ChildProcess> = new Map();
  private sessionMap: Map<UUID, EditorSession> = new Map();
  private WORKER_ID = process.env.WORKER_ID || process.pid.toString()
  private constructor() {
    // Initialize Redis connection (supports both standalone and cluster)
    this.redis = process.env.REDIS_CLUSTER === 'true'
      ? new Redis.Cluster(
          (process.env.REDIS_NODES || 'redis://host.docker.internal:6379').split(',').map(url => ({ host: url })),
          {
            scaleReads: 'slave',
            redisOptions: {
              tls: process.env.REDIS_TLS === 'true' ? {} : undefined
            }
          }
        )
      : new Redis(process.env.REDIS_URL || 'redis://host.docker.internal:6379');

    this.pubSub = this.redis.duplicate();
    this.initializeSubscriptions();
  }

  public static getInstance(): SharedStateManager {
    if (!SharedStateManager.instance) {
      SharedStateManager.instance = new SharedStateManager();
    }
    return SharedStateManager.instance;
  }

  private async initializeSubscriptions(): Promise<void> {
    await this.pubSub.subscribe('state-updates');
    
    this.pubSub.on('message', async (channel, message) => {
      if (channel != 'state-updates') return;
        const { event, source } = JSON.parse(message);
        if (source === this.WORKER_ID) return; // Ignore own events
        console.log(process.pid  + "$: updated variable: " + event)
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
        for (const cb of callbacks) cb();

    });
  }

  // Client methods
  public getClient(id: UUID): UUID | undefined {
    return this.clients.get(id);
  }

  public async addClient(id: UUID, sessionId: UUID): Promise<void> {
    this.clients.set(id, sessionId);
    await this.redis.hset('clients', id, sessionId); // Store minimal data
    await this.notifyUpdate('CLIENTS_UPDATED');
  }

  public async removeClient(id: UUID): Promise<void> {
    this.clients.delete(id);
    await this.redis.hdel('clients', id);
    await this.notifyUpdate('CLIENTS_UPDATED');
  }

  // Process methods
  public getProcess(id: UUID): ChildProcess | undefined {
    return this.runningProcesses.get(id);
  }

  public async addProcess(id: UUID, process: ChildProcess): Promise<void> {
    this.runningProcesses.set(id, process);
    await this.redis.hset('processes', id, process.pid?.toString() || '');
    await this.notifyUpdate('PROCESSES_UPDATED');

    process.on('exit', async () => {
      await this.removeProcess(id);
    });
  }

  public async removeProcess(id: UUID): Promise<void> {
    this.runningProcesses.delete(id);
    await this.redis.hdel('processes', id);
    await this.notifyUpdate('PROCESSES_UPDATED');
  }

  // Session methods
  public getSession(id: UUID): EditorSession | undefined {
    return this.sessionMap.get(id);
  }

  public async getClientIds(): Promise<UUID[]> {
  const raw = await this.redis.hkeys('clients');
  return raw as UUID[];
}

public async getAllSessions(): Promise<Record<UUID, EditorSession>> {
  const sessions = await this.redis.hgetall('sessions');
  const result: Record<UUID, EditorSession> = {};
  for (const [id, value] of Object.entries(sessions)) {
    result[id as UUID] = EditorSession.fromJSON(JSON.parse(value)); // if you have a fromJSON method
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

public async updateSession(id: UUID, session: EditorSession): Promise<void> {
    this.sessionMap.set(id, session);
    await this.redis.hset('sessions', id, JSON.stringify(session.toJSON()));
    await this.notifyUpdate('SESSIONS_UPDATED');
  }

  public async removeSession(id: UUID): Promise<void> {
    this.sessionMap.delete(id);
    await this.redis.hdel('sessions', id);
    await this.notifyUpdate('SESSIONS_UPDATED');
  }

  // Helper methods
  private async notifyUpdate(event: string): Promise<void> {
    await this.redis.publish('state-updates', JSON.stringify({
         event,
         source: this.WORKER_ID,
         }));
  }

  private async loadClients(): Promise<void> {
    const clients = await this.redis.hgetall('clients');
    // Maintain existing WebSocket connections, just update the keys
    const newClients = new Map<UUID, UUID>();
    Object.keys(clients).forEach(id => {
      if (this.clients.has(id as UUID)) {
        newClients.set(id  as UUID, this.clients.get(id  as UUID)!);
      }
    });
    this.clients = newClients;
  }

  private async loadProcesses(): Promise<void> {
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



private async loadSessions(): Promise<void> {
    const sessions = await this.redis.hgetall('sessions');
    this.sessionMap = new Map(
      Object.entries(sessions).map(([id, session]) => [
        id,
        EditorSession.fromJSON(JSON.parse(session))
      ] as [UUID, EditorSession]) 
    );
  }

  private updateCallbacks: Map<string, (() => void)[]> = new Map();

  public onUpdate(event: string, callback: () => void): void {
    if (!this.updateCallbacks.has(event)) {
      this.updateCallbacks.set(event, []);
    }
    this.updateCallbacks.get(event)!.push(callback);
  }


  // Cleanup
  public async close(): Promise<void> {
    await this.redis.flushdb();
    this.pubSub.disconnect();
    this.redis.disconnect();
  }
}

export default SharedStateManager;