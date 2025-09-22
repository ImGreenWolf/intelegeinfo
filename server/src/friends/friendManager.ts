import express, { Request, Response } from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import path from 'path';
import prisma from '../dbClient';
import { getIdFromJWT } from '../usersManager';


const router = express.Router();
router.use(bodyParser.json());
export default router; 



import * as ChatManager from './chatManager'
router.use('/chat', ChatManager.default)


export async function getFriends(id) {
    const userSelect = 
    {
        select: {
            firstName: true,
            lastName: true,
            userColor: true, 
            username: true,
            picture: true,
            id: true
        }
    }

    const user = await prisma.user.findUnique({
        where: {id},
        include: {
            receivedRequests: {
                include: {
                    initiator:  userSelect
                }
            },
            sentRequests: {
                include: {
                    receiver:  userSelect
                }
            }
        }
    })
    return [...user.receivedRequests.map(req => { return {...req, initiator: undefined, user: req.initiator}}),
         ...user.sentRequests.map(req => { return {...req, receiver: undefined, user: req.receiver}})]
}


router.get('/add', async (req, res) => {
    try {
        const targetId = parseInt(req.query.user as string);
    
        if(!targetId)
            throw 'please specify a target'
    
        const userId = getIdFromJWT(req)
        if(!userId)
            throw 'please login';
    
       try {
         const friend = await prisma.friendRelation.create({
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
         })
    
         res.send(`Sent friend request! ${friend.createdDate}`)
       } catch (error) {
            //prisma erorr
             res.status(500).send(error)
       }
    } catch (error) {
         res.status(500).send(error)
    }
})



