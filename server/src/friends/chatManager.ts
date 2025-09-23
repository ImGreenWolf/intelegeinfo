import express, { Request, Response } from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import path from 'path';
import prisma from '../dbClient';
import { getClientId, getIdFromJWT } from '../usersManager';
import { getFriends } from './friendManager';
import { newWSS, tokenCookieName } from '../server';
// import { getCookie } from '../../../shared/src/types';
import { WebSocket } from 'ws';


const router = express.Router();
router.use(bodyParser.json());
export default router; 






router.get('/channel/:chatId', async (req, res) => {
    const id = getIdFromJWT(req)
    if(!id)
        throw 'Please login';
    const targetId = parseInt(req.params.chatId)
    const chat = await prisma.message.findMany({
        where: {
           relationId: targetId
        }
    })
    res.send(chat);
})


router.post('/channel/:chatId', async (req, res) => {
    try {
        const id = getIdFromJWT(req)
        if(!id)
            throw 'Please login';
        if(!req.body)
            throw 'empty content'
        const targetId = parseInt(req.params.chatId)
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
    } catch (error) {
         res.status(500).send(error)
        
    }
})

const chatWSS = newWSS('/chat')
const activeClients = new Map<number, {ws: WebSocket}>()

chatWSS.on('connection', (ws, req) => {
    const token = getCookie(tokenCookieName, req.headers.cookie)
    const id = getClientId(token)

    if(!id)
        throw 'Invalid id'

    activeClients.set(id, {ws})

    ws.onmessage = async (ev) => {
        const {type, convId, content} = JSON.parse(ev.data.toString())

        switch(type) {
            case 'send': 
                const chat = await prisma.friendRelation.findFirst({
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
                })


                const message = await prisma.message.create({
                    data: {
                        content,
                        fromId: id,
                        toId: chat.users[0].id,
                        relationId: chat.id
                    }
                })

                if(!activeClients.has(message.toId))
                    throw 'Couldnt find client';
                
                const target = activeClients.get(message.toId)
                target.ws.send(JSON.stringify({type: 'message', convId: chat.id, content, fromId: id, toId: message.toId}))


                
            break;
        }
    }
})


function getCookie(cname, cookies) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(cookies);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
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