import express from 'express';
import prisma from '../dbClient';
import { getClientId, getIdFromJWT } from '../usersManager';
import { newWSS, tokenCookieName } from '../server';
import { WebSocket } from 'ws';
import { parse } from 'cookie';

const router = express.Router();
router.use(express.json());
export default router;

async function findConversation(id: number, userId: number) {
    if (!Number.isSafeInteger(id) || id <= 0) return null;
    return prisma.friendRelation.findFirst({
        where: { id, users: { some: { id: userId } } },
        include: { users: { select: { id: true } } }
    });
}

router.get('/channel/:chatId', async (req, res) => {
    const id = getIdFromJWT(req);
    if (!id) { res.status(401).send('Please login'); return; }
    const chat = await findConversation(Number(req.params.chatId), id);
    if (!chat) { res.status(404).send('Conversation not found'); return; }
    const messages = await prisma.message.findMany({
        where: { relationId: chat.id }, orderBy: { id: 'asc' }
    });
    res.send(messages);
});

router.post('/channel/:chatId', (_req, res) => {
    res.status(405).send('Send messages using the chat connection');
});

const chatWSS = newWSS('/chat');
const activeClients = new Map<number, Set<WebSocket>>();

chatWSS.on('connection', (ws, req) => {
    const id = getClientId(parse(req.headers.cookie || '')[tokenCookieName]);
    if (!id) { ws.close(1008, 'Please login'); return; }
    const sockets = activeClients.get(id) || new Set<WebSocket>();
    sockets.add(ws);
    activeClients.set(id, sockets);
    ws.on('close', () => {
        sockets.delete(ws);
        if (!sockets.size) activeClients.delete(id);
    });
    ws.on('message', async data => {
        try {
            const { type, convId, content } = JSON.parse(data.toString());
            if (type !== 'send' || typeof content !== 'string' || !content.trim() || content.length > 10000)
                throw new Error('Invalid message');
            const chat = await findConversation(convId, id);
            const recipient = chat?.users.find(user => user.id !== id);
            if (!recipient) throw new Error('Conversation not found');
            const message = await prisma.message.create({
                data: { content: content.trim(), fromId: id, toId: recipient.id, relationId: chat.id }
            });
            for (const target of activeClients.get(message.toId) || []) {
                if (target.readyState === WebSocket.OPEN)
                    target.send(JSON.stringify({ type: 'message', convId: chat.id, content: message.content, fromId: id, toId: message.toId }));
            }
        } catch {
            if (ws.readyState === WebSocket.OPEN)
                ws.send(JSON.stringify({ type: 'error', message: 'Unable to send message' }));
        }
    });
});
