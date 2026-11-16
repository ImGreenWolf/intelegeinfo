"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dbClient_1 = __importDefault(require("../dbClient"));
const usersManager_1 = require("../usersManager");
const server_1 = require("../server");
const ws_1 = require("ws");
const cookie_1 = require("cookie");
const router = express_1.default.Router();
router.use(express_1.default.json());
exports.default = router;
async function findConversation(id, userId) {
    if (!Number.isSafeInteger(id) || id <= 0)
        return null;
    return dbClient_1.default.friendRelation.findFirst({
        where: { id, users: { some: { id: userId } } },
        include: { users: { select: { id: true } } }
    });
}
router.get('/channel/:chatId', async (req, res) => {
    const id = (0, usersManager_1.getIdFromJWT)(req);
    if (!id) {
        res.status(401).send('Please login');
        return;
    }
    const chat = await findConversation(Number(req.params.chatId), id);
    if (!chat) {
        res.status(404).send('Conversation not found');
        return;
    }
    const messages = await dbClient_1.default.message.findMany({
        where: { relationId: chat.id }, orderBy: { id: 'asc' }
    });
    res.send(messages);
});
router.post('/channel/:chatId', (_req, res) => {
    res.status(405).send('Send messages using the chat connection');
});
const chatWSS = (0, server_1.newWSS)('/chat');
const activeClients = new Map();
chatWSS.on('connection', (ws, req) => {
    const id = (0, usersManager_1.getClientId)((0, cookie_1.parse)(req.headers.cookie || '')[server_1.tokenCookieName]);
    if (!id) {
        ws.close(1008, 'Please login');
        return;
    }
    const sockets = activeClients.get(id) || new Set();
    sockets.add(ws);
    activeClients.set(id, sockets);
    ws.on('close', () => {
        sockets.delete(ws);
        if (!sockets.size)
            activeClients.delete(id);
    });
    ws.on('message', async (data) => {
        try {
            const { type, convId, content } = JSON.parse(data.toString());
            if (type !== 'send' || typeof content !== 'string' || !content.trim() || content.length > 10000)
                throw new Error('Invalid message');
            const chat = await findConversation(convId, id);
            const recipient = chat?.users.find(user => user.id !== id);
            if (!recipient)
                throw new Error('Conversation not found');
            const message = await dbClient_1.default.message.create({
                data: { content: content.trim(), fromId: id, toId: recipient.id, relationId: chat.id }
            });
            for (const target of activeClients.get(message.toId) || []) {
                if (target.readyState === ws_1.WebSocket.OPEN)
                    target.send(JSON.stringify({ type: 'message', convId: chat.id, content: message.content, fromId: id, toId: message.toId }));
            }
        }
        catch {
            if (ws.readyState === ws_1.WebSocket.OPEN)
                ws.send(JSON.stringify({ type: 'error', message: 'Unable to send message' }));
        }
    });
});
