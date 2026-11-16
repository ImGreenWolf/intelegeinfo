// ot_harness.js
'use strict';

/**
 * Simple OT test harness
 * Node.js only, no dependencies
 *
 * Run: node ot_harness.js
 */

// ---------- Utilities ----------
const sha256 = (s) => {
  // simple non-cryptographic checksum substitute for tests:
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return String(h);
};

const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const sleep = ms => new Promise(res => setTimeout(res, ms));
const makeOpId = (prefix='') => `${Date.now()}_${Math.random().toString(36).slice(2,9)}${prefix}`;

// ---------- OT primitives (index-based) ----------
function mapIndexThroughOp(index, opB, tieBreakerClientIdA = '', tieBreakerClientIdB = '') {
  if (!opB) return index;
  if (opB.type === 'insert') {
    const p = opB.pos, L = opB.text.length;
    if (index > p) return index + L;
    if (index < p) return index;
    // index === p → tie-breaker
    return tieBreakerClientIdA < tieBreakerClientIdB ? index : index + L;
  } else if (opB.type === 'remove') {
    const b1 = opB.start, b2 = opB.end, L = b2 - b1;
    if (index <= b1) return index;
    if (index >= b2) return index - L;
    return b1;
  }
  return index;
}

function transformAgainstOp(opA, opB) {
  if (!opA || !opB) return opA;
  if (opA.type === 'insert') {
    const newPos = mapIndexThroughOp(opA.pos, opB, opA.clientId, opB.clientId);
    return { ...opA, pos: newPos };
  }
  if (opA.type === 'remove') {
    let newStart = mapIndexThroughOp(opA.start, opB, opA.clientId, opB.clientId);
    let newEnd = mapIndexThroughOp(opA.end, opB, opA.clientId, opB.clientId);
    if (newEnd < newStart) newEnd = newStart;
    if (newEnd === newStart) return null;
    return { type: 'remove', start: newStart, end: newEnd, clientId: opA.clientId };
  }
  return opA;
}

function applyIndexOp(content, op) {
  if (!op) return content;
  if (op.type === 'insert') {
    return content.slice(0, op.pos) + op.text + content.slice(op.pos);
  } else if (op.type === 'remove') {
    return content.slice(0, op.start) + content.slice(op.end);
  }
  return content;
}

// ---------- Server ----------
class Server {
  constructor() {
    this.content = '';
    this.docVerLog = [];
    this.docVer = 0;
    this.clients = new Map();
  }

  registerClient(client) {
    this.clients.set(client.clientId, client);
    client.receiveFullSync(this.content, this.docVer, this.docVerLog);
  }

  updateContent(newContent, codeChange) {
    this.docVerLog[this.docVer] = { content: newContent, op: codeChange };
    this.content = newContent;
    this.docVer++;
  }

  async changeContent(data, clientObj) {
    try {
      const incomingIndexOp = data?.delta?.indexOp ?? null;
      if (!incomingIndexOp) {
        const noOp = { docVer: this.docVer, delta: null, clientId: clientObj.clientId };
        this.updateContent(this.content, noOp);
        return;
      }

      const opId = incomingIndexOp.opId ?? makeOpId();
      const clientBaseVer = data?.docVer ?? 0;

      let transformed = { ...incomingIndexOp, clientId: clientObj.clientId };
      for (let v = clientBaseVer; v < this.docVer; v++) {
        const prevIndexOp = this.docVerLog[v]?.op?.delta?.indexOp ?? null;
        if (!prevIndexOp) continue;
        transformed = transformAgainstOp(transformed, prevIndexOp);
        if (!transformed) break;
      }

      if (!transformed) {
        const noOp = { docVer: this.docVer, delta: null, clientId: clientObj.clientId };
        this.updateContent(this.content, noOp);
      } else {
        const newContent = applyIndexOp(this.content, transformed);
        const storedChange = {
          docVer: this.docVer,
          delta: { indexOp: { ...transformed, opId, clientId: clientObj.clientId } },
          clientId: clientObj.clientId
        };
        this.updateContent(newContent, storedChange);
      }

      const stored = this.docVerLog[this.docVer - 1].op;
      const storedIndexOp = stored?.delta?.indexOp ?? null;
      const serverChecksum = sha256(this.content);
      const serverDocVer = this.docVer;

      for (const [id, c] of this.clients.entries()) {
        const delay = randInt(10, 120);
        setTimeout(() => {
          c.receiveMessage({
            type: 'CodeChange',
            clientId: clientObj.clientId,
            fileName: 'testfile',
            delta: storedIndexOp ? { indexOp: storedIndexOp } : null,
            checksum: serverChecksum,
            docVer: serverDocVer
          });
        }, delay);
      }
    } catch (err) {
      console.error('Server changeContent error:', err);
    }
  }

  dumpLog() {
    console.log('--- server docVerLog ---');
    for (let i = 0; i < this.docVer; i++) {
      console.log(i, JSON.stringify(this.docVerLog[i].op?.delta?.indexOp ?? this.docVerLog[i].op?.delta ?? null));
    }
    console.log('content:', JSON.stringify(this.content));
  }
}

// ---------- Client ----------
class Client {
  constructor(clientId, server) {
    this.clientId = clientId;
    this.server = server;
    this.content = '';
    this.docVer = 0;
    this.pendingOps = [];
  }

  receiveFullSync(content, docVer, docVerLog) {
    this.content = content;
    this.docVer = docVer;
    this.pendingOps = [];
  }

  sendIndexOp(indexOp) {
    const opId = makeOpId(this.clientId);
    const baseDocVer = this.docVer;
    const opWithClient = { ...indexOp, clientId: this.clientId };

    this.pendingOps.push({ opId, indexOp: opWithClient, baseDocVer });
    this.content = applyIndexOp(this.content, opWithClient);

    const message = {
      type: 'CodeChange',
      fileName: 'testfile',
      delta: { indexOp: { ...opWithClient, opId } },
      docVer: baseDocVer,
      clientChecksum: sha256(this.content),
      opId
    };

    const delay = randInt(5, 80);
    setTimeout(() => {
      this.server.changeContent(message, this);
    }, delay);
  }

  receiveMessage(msg) {
    if (msg.type !== 'CodeChange') return;

    const incomingIndexOp = msg.delta?.indexOp ?? null;
    const incomingClientId = msg.clientId;
    const incomingOpId = incomingIndexOp?.opId ?? null;
    const serverDocVer = msg.docVer;

    if (!incomingIndexOp) {
      this.docVer = serverDocVer;
      return;
    }

    for (let i = 0; i < this.pendingOps.length; i++) {
      const p = this.pendingOps[i];
      const transformedPending = transformAgainstOp(p.indexOp, incomingIndexOp);
      if (!transformedPending) {
        this.pendingOps.splice(i, 1);
        i--;
      } else {
        p.indexOp = transformedPending;
      }
    }

    if (incomingClientId !== this.clientId) {
      this.content = applyIndexOp(this.content, incomingIndexOp);
    } else if (incomingOpId) {
      const idx = this.pendingOps.findIndex(p => p.opId === incomingOpId);
      if (idx !== -1) this.pendingOps.splice(idx, 1);
    }

    this.docVer = serverDocVer;
  }

  dump() {
    console.log(`${this.clientId}: docVer=${this.docVer}, content="${this.content}", pending=${this.pendingOps.length}`);
  }
}

// ---------- Test scenarios ----------
async function runScenario(name, scenarioFn) {
  console.log('\n=== SCENARIO:', name, '===');
  const server = new Server();
  const c1 = new Client('A', server);
  const c2 = new Client('B', server);
  server.registerClient(c1);
  server.registerClient(c2);

  await scenarioFn({ server, c1, c2 });
  await sleep(400);

  console.log('--- Final ---');
  server.dumpLog();
  c1.dump();
  c2.dump();

  const ok = (server.content === c1.content) && (server.content === c2.content);
  console.log('Converged?', ok ? 'YES' : 'NO');
  if (!ok) {
    console.error('Server:', JSON.stringify(server.content));
    console.error('Client A:', JSON.stringify(c1.content));
    console.error('Client B:', JSON.stringify(c2.content));
  }
  return ok;
}

// Scenario 1: rapid typing spam (both clients)
async function scenarioSpam({ server, c1, c2 }) {
  server.content = ''; server.docVerLog = []; server.docVer = 0;
  server.updateContent('', { docVer: 0, delta: null, clientId: 'server-init' });

  const textA = 'helloworld';
  const textB = '1234567890';
  for (let i = 0; i < Math.max(textA.length, textB.length); i++) {
    if (i < textA.length) c1.sendIndexOp({ type: 'insert', pos: c1.content.length, text: textA[i] });
    if (i < textB.length) c2.sendIndexOp({ type: 'insert', pos: c2.content.length, text: textB[i] });
    await sleep(randInt(0, 30));
  }
}

// Scenario 2: overlapping remove + insert
async function scenarioOverlapRemoveInsert({ server, c1, c2 }) {
  server.content = 'The quick brown fox jumps over the lazy dog';
  server.docVerLog = []; server.docVer = 0;
  server.updateContent(server.content, { docVer: 0, delta: null, clientId: 'server-init' });
  c1.receiveFullSync(server.content, server.docVer);
  c2.receiveFullSync(server.content, server.docVer);

  const removeStart = server.content.indexOf('brown ');
  const removeEnd = removeStart + 'brown '.length;
  c1.sendIndexOp({ type: 'remove', start: removeStart, end: removeEnd });
  await sleep(5);
  c2.sendIndexOp({ type: 'insert', pos: removeStart, text: 'red ' });
}

// Scenario 3: simultaneous inserts at same position
async function scenarioSimultaneousInsert({ server, c1, c2 }) {
  server.content = 'START';
  server.docVerLog = []; server.docVer = 0;
  server.updateContent(server.content, { docVer: 0, delta: null, clientId: 'server-init' });
  c1.receiveFullSync(server.content, server.docVer);
  c2.receiveFullSync(server.content, server.docVer);

  const pos = 3;
  c1.sendIndexOp({ type: 'insert', pos, text: 'AAA' });
  c2.sendIndexOp({ type: 'insert', pos, text: 'bbb' });
}

// Run all scenarios
(async () => {
  let allOk = true;
  allOk = allOk && await runScenario('Rapid typing spam (both clients)', scenarioSpam);
  allOk = allOk && await runScenario('Overlapping remove + insert', scenarioOverlapRemoveInsert);
  allOk = allOk && await runScenario('Simultaneous inserts same pos', scenarioSimultaneousInsert);

  console.log('\nALL SCENARIOS OK?', allOk ? 'YES' : 'NO');
})();
