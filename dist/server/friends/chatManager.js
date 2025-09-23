"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dbClient_1 = __importDefault(require("../dbClient"));
const usersManager_1 = require("../usersManager");
const server_1 = require("../server");
const router = express_1.default.Router();
router.use(body_parser_1.default.json());
exports.default = router;
router.get('/channel/:chatId', async (req, res) => {
    const id = (0, usersManager_1.getIdFromJWT)(req);
    if (!id)
        throw 'Please login';
    const targetId = parseInt(req.params.chatId);
    const chat = await dbClient_1.default.message.findMany({
        where: {
            relationId: targetId
        }
    });
    res.send(chat);
});
router.post('/channel/:chatId', async (req, res) => {
    try {
        const id = (0, usersManager_1.getIdFromJWT)(req);
        if (!id)
            throw 'Please login';
        if (!req.body)
            throw 'empty content';
        const targetId = parseInt(req.params.chatId);
        // const chat = await prisma.friendRelation.update({
        //     where: {
        //         users: {
        //             every: {
        //                 OR: [{id}, {id: targetId}]
        //             }
        //         }
        //     },
        //     data: {
        //         messages: {
        //             create: {
        //                 content: req.body.body
        //             }
        //         }
        //     }
        // })
        // res.send(chat);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
const chatWSS = (0, server_1.newWSS)('/chat');
const activeClients = new Map();
chatWSS.on('connection', (ws, req) => {
    const token = getCookie(server_1.tokenCookieName, req.headers.cookie);
    const id = (0, usersManager_1.getClientId)(token);
    if (!id)
        throw 'Invalid id';
    activeClients.set(id, { ws });
    ws.onmessage = async (ev) => {
        const { type, convId, content } = JSON.parse(ev.data.toString());
        switch (type) {
            case 'send':
                const chat = await dbClient_1.default.friendRelation.findFirst({
                    where: {
                        id: convId
                    },
                    include: {
                        users: {
                            where: {
                                id: {
                                    not: id
                                }
                            }
                        }
                    }
                });
                const message = await dbClient_1.default.message.create({
                    data: {
                        content,
                        fromId: id,
                        toId: chat.users[0].id,
                        relationId: chat.id
                    }
                });
                if (!activeClients.has(message.toId))
                    throw 'Couldnt find client';
                const target = activeClients.get(message.toId);
                target.ws.send(JSON.stringify({ type: 'message', convId: chat.id, content, fromId: id, toId: message.toId }));
                break;
        }
    };
});
function getCookie(cname, cookies) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(cookies);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return undefined;
}
