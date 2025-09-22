import express, { Request, Response } from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import path from 'path';


const router = express.Router();
router.use(bodyParser.json());
export default router; 

import { newWSS, parseText, rootDirName, sessionMap, sqid, tokenCookieName } from '../server';
import prisma from '../dbClient';
import { getClientId, getIdFromJWT, getJWT, getUserData } from '../usersManager';
import { ClientObject, randomHexColor } from '../types';
import { Assignment, Prisma } from '../../../generated/prisma';
const htmlPath = path.join(rootDirName, 'server', 'src','classManager','html')

router.get('/', async (req,res) => {
    const classPath = path.join(htmlPath, 'index.html')
    try {
        const myClass = await getUserData(getIdFromJWT(req), {CreatedClasses: true})
        if(myClass)
            res.contentType('html').send(parseText(fs.readFileSync(classPath).toString(), req, {class: myClass, scripts: {teacher: '<script type="module" src="/client/scripts/classes/teacher.js"></script>'}}))
        else 
             res.contentType('html').send(parseText(fs.readFileSync(classPath).toString(), req, {scripts: {teacher: '<script type="module" src="/client/scripts/classes/teacher.js"></script>'}}))
    } catch (error) {
        console.warn(error)
         res.contentType('html').send(parseText(fs.readFileSync(classPath).toString(), req, {scripts: {teacher: '<script type="module" src="/client/scripts/classes/teacher.js"></script>'}}))
    }
   
})


// get classes for user
router.get('/u', async (req,res) => {

    try {
        const myClass = await getUserData(getIdFromJWT(req), {CreatedClasses: true, JoinedClass: {include: {Class: true}}}) as any
        res.send({classes: [...myClass.CreatedClasses, ...myClass.JoinedClass.map(joined => joined.Class)], user: myClass})
    } catch (error) {
        console.warn(error)
        res.status(500).send(error)
    }
   
})
// get user info
router.get('/c/:id/:name/u/:userId', ClassMiddlware, async (req,res) => {

    const id = parseInt(req.params.userId)
    if(!id)
        throw "Invalid id"

    const user = await prisma.user.findFirst({
        where: {
            id,
            JoinedClass: {
                some: {
                    classId: req.classId
                }
            }
        },
        include: {
            solves: true,
            JoinedClass: {
                where: {
                    classId: req.classId
                },
                take: 1
            }
        }
    })

    res.send(user)
})


declare global {
    namespace Express {
    export interface Request {
        class?: {
                Students: {
                    classId: number;
                    userId: number;
                }[];
                Assignments: {
                    id: number;
                    description: string;
                    createdAt: Date;
                    title: string;
                    classId: number;
                    problemId: number;
                }[];
                _count: {
                    Creator: number;
                    Students: number;
                    Assignments: number;
                };
            } & {
                name: string;
                id: number;
                description: string;
                creatorId: number;
                createdAt: Date;
            },
        classId: number,
        assignment: Assignment
        }
    }
}

async function ClassMiddlware (req, res, next) {
    const id = parseInt(req.params.id);
    if (!id) {
        res.status(400).send('invalid id');
        return;
    }

    const class_ = await prisma.class.findFirst({
        where: { id },
        include: {
            Assignments: {
                take: 20,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    Problem: {
                        omit: {
                            sourceCode: true,
                            tests: true,
                        }
                    }
                }
            },
            Students: {
                include: {
                    User: {
                        omit: {
                            password: true
                        },
                        include: {
                            solves: true
                        }
                    }
                }
            },
            Creator: {
                omit: {
                    password: true
                }
            }, 
            _count: true,
        }
    });
    if (!class_) {
        res.status(404).send('Class not found');
        return;
    }
    req.class = class_;
    req.classId = id;

    // redirect to correct name link
    if (!req.params.name || decodeURI(req.params.name).replaceAll('-', ' ') !== class_.name) {
        res.redirect(`/classes/c/${id}/${class_.name}`);
        return;
    }
    next();
}


router.get('/c/:id/:name', ClassMiddlware, async (req, res) => {
        const user = await getUserData(getIdFromJWT(req), {Assigments: {where: {classId: req.class.id}, include: {Problem: {omit: {sourceCode: true, tests: true}}}}, solves: true})
        if(!user)
            res.send("Please log in first!")
        const isOwner = req.class.creatorId == getIdFromJWT(req)
        res.send({ ...req.class, isOwner, myAssignments: isOwner ? req.class.Assignments : user.Assigments, mySolves: user.solves});
    });

router.post('/c/:id/:name/a/create', ClassMiddlware, async (req, res) => {
    if (!req.class) {
        res.status(400).send('Class not loaded');
        return;
    }
    // TODO validate deadline
    const { title, description, problemId, deadline } = req.body;
    // Get all user IDs of students in the class
    const studentUserIds = req.class.Students.map(student => ({ id: student.userId }));

    const assignment = await prisma.assignment.create({
        data: { 
            title,
            description,
            problemId: parseInt(problemId),
            classId: req.class.id,
            dueDate: deadline ? new Date(deadline).toISOString() : undefined,
            assignedTo: {
                connect: studentUserIds
            }
        }
    });
    res.send(assignment);
});


async function AssignmentMiddleware(req, res, next) {
    const assignment = req.class.Assignments.find(assignment => assignment.id == parseInt(req.params.assigmentId))
    req.assignment = assignment
    next()
}

router.get('/c/:id/:name/a/:assigmentId', ClassMiddlware, AssignmentMiddleware, async (req, res) => {
    if (!req.class) {
        res.status(400).send('Class not loaded');
        return;
    }

    if(!req.assignment) {
        res.status(400).send('Nu am gasit aceasta tema..');
        return;
    }

    const classPath = path.join(htmlPath, 'create.html')
    res.contentType('html').send(parseText(fs.readFileSync(classPath).toString(), req))
});

router.get('/c/:id/:name/a/:assigmentId/l', ClassMiddlware, AssignmentMiddleware, async (req, res) => {
    if (!req.class) {
        res.status(400).send('Class not loaded');
        return;
    }
    const assign = await prisma.assignment.findFirst({
        where: {
            id: parseInt(req.params.assigmentId)
        },
        include: {
            Problem: {
                select: {
                    solves: {
                        where: {
                            userId: {
                                in: req.class.Students.map(student => student.userId)
                            } 
                        },
                        include: {
                            user: {
                                select: {
                                    username: true,
                                    id: true,
                                    userColor: true 
                                }
                            }
                        }
                    },
                }
            }
        }
    })
    let sum=0;
    let users = new Map<number, number>()
    let attempts=0;
    for(const solve of assign.Problem.solves)
    {
        sum += solve.score
        if(!users.has(solve.userId))
            users.set(solve.userId, 1)
        else
            users.set(solve.userId, users.get(solve.userId)+1)
    }
    let mg=1
    for(const user of users.values())
        mg*=user;
    const ress = {assign, averageScore: sum/assign.Problem.solves.length, averageAttempts: Math.sqrt(mg).toFixed(2)}
    res.send(ress);
});


router.get('/create', (req, res) => {
 const classPath = path.join(htmlPath, 'create.html')
    res.contentType('html').send(parseText(fs.readFileSync(classPath).toString(), req))
})


router.post('/create', async (req,res) => {
    try {
        const creatorId = getIdFromJWT(req)
        if(!creatorId)
            throw 'Trebuie sa fi logat inainte sa poti crea o clasa!'
    
        const { name, description } = req.body;
    
        const class_ = await prisma.class.create({
            data: {
                name,
                description,
                creatorId,
                color: randomHexColor()
            }
        })
    
        if(!class_)
            throw 'class_ is invalid'
        res.send('Succes! Am create clasa dumneavoastra.')
    } catch (error) {
        res.status(500).send(error)
    }
})


router.get('/join', async (req, res) => {
    const classQ = req.query.class as string
    if(!classQ)
    {
        const classPath = path.join(htmlPath, 'join.html')
        res.contentType('html').send(parseText(fs.readFileSync(classPath).toString(), req))
        return;
    } else {

        try {
            const id = parseInt(classQ.split(':')[0])
            const userId = getIdFromJWT(req);
            if(!userId)
                throw 'Ca sa te alaturi unei clase trebuie <a href="/signup">sa-ti faci un cont</a>! '
            if(!id)
                throw 'invalid query class join id';
    
            const joinedClass = await prisma.class.findFirst({
                where: {
                    id
                }
            })
            if(joinedClass.creatorId == userId)
                throw 'Nu te poti alatura la aceasta clasa deoarece tu ai creat-o!'

            await prisma.class.update({
                where: {
                    id
                },
                data: {
                    Students: {
                        create: {
                            userId
                        }
                    }
                }
            })
        } catch (error) {
            res.status(500).send(handlePrismaError(error))
            return;
        }

        res.redirect('/classes')
    }
   
})


router.post('/join', async (req, res) => {
        const {code: encodedId} = req.body;
        const id = sqid.decode(encodedId)[0]
        const userId = getIdFromJWT(req)
        try {
            if(!userId)
                throw {code: 401, err: 'Unautherized'}
            if(!id)
                throw 'Invalid decoded id';
            const joinedClass = await prisma.class.update({
                where: {
                    id
                },
                data: {
                    Students: {
                        create: {
                            userId
                        }
                    }
                }
            })
            res.redirect('/classes/'+sqid.encode([joinedClass.id]))
        } catch (error) {
            res.status(error.code.startsWith('P') || !error.code ? 500 : error.code).send(handlePrismaError(error))
            return;
        }


    
   
})


export function handlePrismaError(error: any) {
    if(!(error instanceof Prisma.PrismaClientKnownRequestError) || !error.clientVersion)
        return error;
    else
        switch(error.code) {
            case 'P2025':
                return 'Nu am gasit clasa pe care o cauti! Verifica daca ai linkul corect sau daca clasa chiar exista..';
            case 'P2002':
                return 'Deja te-ai alaturat acestei clase.'
            case '401':
                return 'Trebuie sa fi logat pentru a face aceasta actiune!'
            default:
                return error.message
        }
}


const activeCheckWSS = newWSS('/classes')
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
// TODO Heavily rework this. This is VERY inefficient and crude, its just a temporary fix, it works - just not well

activeCheckWSS.on('connection', async (ws, req) => {

    const url = new URL(req.url, 'https://intelegeinfo.ro')


    const tokenAuth = getCookie(tokenCookieName, req.headers.cookie);
    if(!tokenAuth)
        throw 'invalid token, you must be authenticated to perform this action'
    
    const userId = getClientId(tokenAuth)
    if(!userId)
        return
    const classId = parseInt(url.searchParams.get('id'))

    const users = await prisma.user.findMany({
        where: {
            JoinedClass: {
                some: {
                    Class: {
                        id: classId,
                        creatorId: userId
                    }
                }
            }
        }
    })

    update()

    function update() {
        const userMap = Array.from(sessionMap.values()).reduce((map, session) => {
            session.clients.forEach(client => {
                if(client.clientData)
                    map.set(client.clientData.id, client)
            })
            return map;
        }, new Map<number, ClientObject>())
        
        ws.send(JSON.stringify({activeUsers: users.map(user => { return {id: user.id, active: userMap.has(user.id)}})}))

    }
    
    setInterval(update, 10000);
})