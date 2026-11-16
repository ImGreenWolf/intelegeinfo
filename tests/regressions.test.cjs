const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {EventEmitter} = require('node:events');
const crypto = require('node:crypto');
const ts = require('typescript');
const jwt = require('jsonwebtoken');

// Exercise route handlers without starting Docker, Redis, the database or SMTP.
function load(file, mocks = {}) {
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true}
    }).outputText;
    const module = {exports: {}};
    vm.runInNewContext(source, {
        module, exports: module.exports, console: {log() {}, error() {}, dir() {}}, Buffer, process, setTimeout, clearTimeout,
        require(name) {
            if (Object.hasOwn(mocks, name)) return mocks[name];
            if (name.startsWith('.')) throw new Error(`Unmocked dependency: ${name}`);
            return require(name);
        }
    }, {filename: file});
    return module.exports;
}
function router() {
    const routes = new Map();
    const r = {use() {}, get(url, ...handlers) {routes.set(`GET ${url}`, handlers);},
        post(url, ...handlers) {routes.set(`POST ${url}`, handlers);}};
    return {routes, express: {Router: () => r, static() {}, json() {}}, r};
}
function response() {
    return {statusCode: 200, cookies: [], status(n) {this.statusCode = n; return this;},
        send(data) {this.body = data; return this;}, json(data) {return this.send(data);},
        cookie(...args) {this.cookies.push(args); return this;}, clearCookie() {return this;}};
}
const {privateKey} = crypto.generateKeyPairSync('rsa', {modulusLength: 2048,
    privateKeyEncoding: {type: 'pkcs8', format: 'pem'}, publicKeyEncoding: {type: 'spki', format: 'pem'}});

test('email login requires email-only approval, binds the exact request, and prevents replay', async () => {
    const r = router();
    const mails = [];
    load('server/src/login.ts', {
        express: r.express, fs: {readFileSync: () => privateKey},
        'node-forge': {pki: {privateKeyFromPem: () => ({})}},
        './dbClient': {user: {findFirst: async () => ({id: 7, role: 'USER', username: 'Test'})}},
        './signup': {}, './server': {tokenCookieName: 'auth'},
        './usersManager': {transporter: {sendMail: async mail => mails.push(mail)}},
        googleapis: {google: {auth: {OAuth2: class {}}}}
    });
    const call = async (method, url, req) => {
        const res = response();
        await r.routes.get(`${method} ${url}`)[0](req, res);
        return res;
    };
    const request = () => call('POST', '/one-time-code', {body: {email: 'test@example.com'}});
    const first = await request();
    const second = await request();
    const poll = first.body.token;
    const approval = mails[0].html.match(/callback\?token=([^']+)/)[1];
    assert.notEqual(poll, approval);
    await call('GET', '/one-time-code/callback', {query: {token: poll}});
    assert.equal((await call('GET', '/one-time-code/verify', {query: {token: poll}})).statusCode, 401);
    await call('GET', '/one-time-code/callback', {query: {token: approval}});
    assert.equal((await call('GET', '/one-time-code/verify', {query: {token: second.body.token}})).statusCode, 401);
    const success = await call('GET', '/one-time-code/verify', {query: {token: poll}});
    assert.equal(success.statusCode, 200);
    assert.equal(jwt.verify(success.cookies[0][1], privateKey).sub, 7);
    assert.equal(success.cookies[1][2].sameSite, 'lax');
    await call('GET', '/one-time-code/callback', {query: {token: approval}});
    assert.equal((await call('GET', '/one-time-code/verify', {query: {token: poll}})).statusCode, 401);
});

test('Google One Tap verifies credentials before querying accounts', async () => {
    const r = router();
    let lookups = 0, verifications = 0;
    load('server/src/login.ts', {
        express: r.express, fs: {readFileSync: () => privateKey},
        'node-forge': {pki: {privateKeyFromPem: () => ({})}},
        './dbClient': {user: {findFirst: async () => {lookups++;}}},
        './signup': {}, './server': {}, './usersManager': {},
        googleapis: {google: {auth: {OAuth2: class {
            async verifyIdToken() {verifications++; throw new Error('Invalid signature');}
        }}}}
    });
    const previous = process.env.GOOGLE_CLIENT_ID;
    try {
        process.env.GOOGLE_CLIENT_ID = 'test-client';
        const res = response();
        await r.routes.get('POST /callback')[0]({body: {credential: jwt.sign({email: 'victim@example.com'}, 'fake')}}, res);
        assert.equal(verifications, 1);
        assert.equal(lookups, 0);
        assert.equal(res.statusCode, 500);
    } finally {
        if (previous === undefined) delete process.env.GOOGLE_CLIENT_ID;
        else process.env.GOOGLE_CLIENT_ID = previous;
    }
});

test('chat denies outsiders, accepts offline delivery, and handles malformed messages', async () => {
    const r = router();
    const wss = new EventEmitter();
    const saved = [];
    let historyReads = 0;
    load('server/src/friends/chatManager.ts', {
        express: r.express, '../server': {newWSS: () => wss, tokenCookieName: 'auth'},
        '../usersManager': {getIdFromJWT: req => req.id, getClientId: token => token === 'valid' ? 7 : undefined},
        '../dbClient': {
            friendRelation: {findFirst: async query => query.where.id === 1 && query.where.users.some.id === 7
                ? {id: 1, users: [{id: 7}, {id: 8}]} : null},
            message: {findMany: async () => {historyReads++; return [];}, create: async ({data}) => {saved.push(data); return data;}}
        }
    });
    const res = response();
    await r.routes.get('GET /channel/:chatId')[0]({id: 9, params: {chatId: '1'}}, res);
    assert.equal(res.statusCode, 404);
    assert.equal(historyReads, 0);
    const ws = new EventEmitter();
    ws.readyState = 1;
    ws.send = () => {};
    ws.close = () => {};
    wss.emit('connection', ws, {headers: {cookie: 'auth=valid'}});
    const send = ws.listeners('message')[0];
    await send(Buffer.from('{invalid'));
    await send(Buffer.from(JSON.stringify({type: 'send', convId: 2, content: 'denied'})));
    assert.equal(saved.length, 0);
    await send(Buffer.from(JSON.stringify({type: 'send', convId: 1, content: ' hello '})));
    assert.equal(saved.length, 1);
    assert.equal(saved[0].toId, 8);
    ws.emit('close');
});

test('editor filenames reject traversal and Windows special paths', () => {
    const {editorFilePath} = load('server/src/fileSafety.ts');
    for (const name of ['../private.pem', '..\\private.pem', 'C:\\secret', 'x:y', '..', '', 'NUL.cpp', 'file.'])
        assert.throws(() => editorFilePath('cache', name));
    assert.equal(editorFilePath('cache', 'main.cpp'), path.join('cache', 'main.cpp'));
});

test('HMAC verification rejects malformed lengths without throwing', () => {
    const hmac = load('shared/src/hmacUtils.ts', {fs: {readFileSync: () => 'test-secret'}});
    const signed = hmac.generateHmac('7:test@example.com:123456');
    assert.equal(hmac.verifyHmac('7:test@example.com:123456', signed), true);
    assert.equal(hmac.verifyHmac('8:test@example.com:123456', signed), false);
    assert.equal(hmac.verifyHmac('data', 'short'), false);
    assert.equal(hmac.verifyHmac('data', undefined), false);
});

test('class routes require membership, restrict assignment creation, and scope assignment lookups', async () => {
    const r = router();
    let lookups = 0;
    const classData = {id: 1, name: 'Class', creatorId: 7, Students: [{userId: 8}], Assignments: []};
    load('server/src/classManager/classManager.ts', {
        express: r.express, '../server': {rootDirName: '.', sqid: {}, newWSS: () => new EventEmitter()},
        '../usersManager': {getIdFromJWT: req => req.id}, '../types': {},
        '../dbClient': {class: {findFirst: async () => classData}, assignment: {
            findFirst: async ({where}) => {
                lookups++;
                assert.equal(where.classId, 1);
                return where.id === 25 ? {id: 25, classId: 1} : null;
            }
        }}
    });
    const handlers = r.routes.get('POST /c/:id/:name/a/create');
    for (const [id, expected] of [[undefined, 401], [9, 403]]) {
        const res = response();
        await handlers[0]({id, params: {id: '1', name: 'Class'}}, res, () => assert.fail('outsider allowed'));
        assert.equal(res.statusCode, expected);
    }
    const req = {id: 8, params: {id: '1', name: 'Class'}};
    let authorized = false;
    await handlers[0](req, response(), () => {authorized = true;});
    assert.equal(authorized, true);
    const res = response();
    await handlers[1](req, res);
    assert.equal(res.statusCode, 403);
    const assignmentMiddleware = r.routes.get('GET /c/:id/:name/a/:assigmentId')[1];
    // Assignment 25 is absent from the first 20 assignments loaded for the overview.
    req.params.assigmentId = '25';
    let found = false;
    await assignmentMiddleware(req, response(), () => {found = true;});
    assert.equal(found, true);
    assert.equal(req.assignment.id, 25);
    assert.equal(lookups, 1);
});

test('editor preserves empty files and repeated close does not remove other open files', () => {
    class Text {static defaultText = 'template';}
    const {EditorFile} = load('server/src/types.ts', {
        './server': {rootDirName: '.'}, './editor-modes': {Text, modes: []},
        './editor-modes/': {Text, modes: []},
        './fileSafety': load('server/src/fileSafety.ts'),
        '../../dist/shared/types': {WebSocketMessageType: {}, ConsoleMessageType: {}, FileManagementCommands: {}}
    });
    const session = {getClientFilesPath: () => 'cache', replicateFunction() {}};
    const file = new EditorFile(session, 'empty.txt', '', {abstract: true});
    assert.equal(file.content, '');
    assert.equal(file.docVer, 2);
    file.changeContent({docVer: file.docVer, delta: {action: 'insert', start: {row: 0, column: 0}, end: {row: 0, column: 3}, lines: ['abc']}});
    assert.equal(file.content, 'abc');
    file.changeContent({docVer: file.docVer, content: 'one\ntwo'});
    file.changeContent({docVer: file.docVer, delta: {action: 'remove', start: {row: 0, column: 2}, end: {row: 1, column: 1}, lines: ['e', 't']}});
    assert.equal(file.content, 'onwo');
    file.changeContent({docVer: file.docVer, content: ''});
    assert.equal(file.content, '');
    const other = {name: 'other.txt'};
    const client = {openFile: [other], openFileName: ['other.txt']};
    file.onCloseFile(client);
    file.onCloseFile(client);
    assert.equal(client.openFile[0], other);
    assert.equal(client.openFileName[0], 'other.txt');
});
