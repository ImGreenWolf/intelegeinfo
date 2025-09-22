"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFriends = getFriends;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dbClient_1 = __importDefault(require("../dbClient"));
const usersManager_1 = require("../usersManager");
const router = express_1.default.Router();
router.use(body_parser_1.default.json());
exports.default = router;
const ChatManager = __importStar(require("./chatManager"));
router.use('/chat', ChatManager.default);
async function getFriends(id) {
    const userSelect = {
        select: {
            firstName: true,
            lastName: true,
            userColor: true,
            username: true,
            picture: true,
            id: true
        }
    };
    const user = await dbClient_1.default.user.findUnique({
        where: { id },
        include: {
            receivedRequests: {
                include: {
                    initiator: userSelect
                }
            },
            sentRequests: {
                include: {
                    receiver: userSelect
                }
            }
        }
    });
    return [...user.receivedRequests.map(req => { return { ...req, initiator: undefined, user: req.initiator }; }),
        ...user.sentRequests.map(req => { return { ...req, receiver: undefined, user: req.receiver }; })];
}
router.get('/add', async (req, res) => {
    try {
        const targetId = parseInt(req.query.user);
        if (!targetId)
            throw 'please specify a target';
        const userId = (0, usersManager_1.getIdFromJWT)(req);
        if (!userId)
            throw 'please login';
        try {
            const friend = await dbClient_1.default.friendRelation.create({
                data: {
                    initiatorId: Math.min(userId, targetId),
                    receiverId: Math.max(userId, targetId),
                    users: {
                        connect: [
                            { id: userId },
                            { id: targetId }
                        ]
                    }
                }
            });
            res.send(`Sent friend request! ${friend.createdDate}`);
        }
        catch (error) {
            //prisma erorr
            res.status(500).send(error);
        }
    }
    catch (error) {
        res.status(500).send(error);
    }
});
