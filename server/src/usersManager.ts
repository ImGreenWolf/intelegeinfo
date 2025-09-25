import jwt, { Jwt, JwtPayload } from "jsonwebtoken"
import forge from 'node-forge';
import crypto, { randomUUID, UUID } from "crypto";
import express, { Request, Response } from 'express';
import bodyParser, { text } from 'body-parser';
// import cookieParser from 'cookie-parser'
import prisma from "./dbClient";
import { Prisma, Project, User } from "../../generated/prisma";
import fs from "fs";
import nodemailer from "nodemailer"
import { clearAuthCookies, onLoggedIn, UserState } from "./login"
import * as Profile from './profile'
import path from "path";
import * as hmacuUtil from "../../dist/shared/hmacUtils";
import { authMiddleware, handlePrismaError, parseText, sessionMap, sqid, tokenCookieName } from "./server";
import * as users from './usersManager'
import { google } from "googleapis";
import { prepareEncrPassForDB } from "./signup";
const OAuth2 = google.auth.OAuth2;
import multer from 'multer'
import { Payload } from "../../generated/prisma/runtime/library";
import * as FriendManager from './friends/friendManager'
import { EditorSession } from "./types";
export let transporter: nodemailer.Transporter;
updateTransporter()

setInterval(updateTransporter, 3600*1000);

const rootDirName = path.resolve("./") //'C:\Users\radub_qd\intelegeinfo')
const privateKeyPem = fs.readFileSync(path.join(rootDirName,'private.pem')) || "supersecretprivatekey";
// const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
export const router = express.Router();

router.use(bodyParser.json());
// router.use(express.static("public/pages/login.html"))

const userNoPassword = Prisma.validator<Prisma.UserDefaultArgs>()({
  omit: {password: true}
})

export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(rootDirName, 'server', 'users', 'uploads')); // Folder where files will be stored
  },
  filename: function (req, file, cb) {
    // Save file with original name + timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

if (!fs.existsSync(path.join(rootDirName, 'server', 'users', 'uploads'))) {
  fs.mkdirSync(path.join(rootDirName, 'server', 'users', 'uploads'));
}


export const upload = multer({ storage: storage });

export type UserNoPassword = Prisma.UserGetPayload<typeof userNoPassword>


export function generateCode()
{  
    let code = (Math.random()*Math.pow(10,6)).toFixed()
    if(code.length !=6)
        code = "0".repeat(6-code.length) + code
   
    return code
} 

export function getJWT(req: any): string
{
    return req.cookies[tokenCookieName]
}

export async function getUserData<
    T extends Prisma.UserInclude
>(
    id: number,
    include?: T
): Promise<
    T extends Prisma.UserInclude
        ? Prisma.UserGetPayload<{ include: T; }>
        : UserNoPassword | undefined
> {
    if (!id) return undefined;

    return await prisma.user.findUnique({
        where: { id },
        omit: { password: true },
        include: include as any
    }) as any;
}



export function getIdFromJWT(req: any)
{

    return getClientId(getJWT(req))
    
    
}
export async function addProject(
    userId: number,
    projId: any,
    session: EditorSession,
    name: string
) {
    return await prisma.savedProject.create({
        data: {
            name: name,
            createdBy: {
                connect: { id: userId }
            },
            Project: getProjectInput(projId, session)
        }
    });
}

function getProjectInput(projId: any, session: EditorSession) {
    const data = 
    {
        files:  {
            createMany: {
                data: session.files.map(file => {return {name: file.name, content: file.content}}),
                skipDuplicates: true
            }
        }
    }
    console.log(data.files.createMany.data)

    return projId
        ? {
                connectOrCreate: {
                    create: data,
                    where: {
                        id: projId
                    }
                }
            }
        : {
                create: data
            }
        
}


export async function shareProject(
    userId: number,
    projId: any,
    session: EditorSession
) {
    return await prisma.sharedProject.create({
        data: {
            createdBy: {
                connect: {
                    id: userId
                }
            },
            Project: getProjectInput(undefined, session)
        }
    });
}

 export async function listAllProjects(userId)
{
    return (await prisma.$transaction([
         prisma.savedProject.findMany({
            where:
            {
                creatorId: userId,
                folderId: {
                    equals: null
                }
            },
            include: {
                Project: true
            }
        }),
         prisma.folder.findMany({
            where:
            {
                userId,
                parentFolderId: {
                     equals: null
                }
            },
            include: {
                _count: true
            }
        })
    ]))
    
        
    
}

export function getClientJWTValue(token: string): UserState
{
    if(!token)  return; // throw {code: 401, message:'invalid token'};
    let userState;
    try {
     userState = jwt.verify(token, privateKeyPem);
    }
    catch
    {
        return
    }
    if(!userState) return; //throw {code: 401, message:'invalid state'};
        return userState as UserState
}


export function getClientId(token: string): number | undefined
{
    if(!token)  return; // throw {code: 401, message:'invalid token'};
    let userState;
    try {
     userState = jwt.verify(token, privateKeyPem);
    }
    catch
    {
        return
    }
    if(!userState) return; //throw {code: 401, message:'invalid state'};
        const userId= parseInt((userState as UserState).sub);
    if(!userId) return; //throw {code: 401, message:'couldnt get id'}
    return userId;
}

export function createUploadFromFile(fileReq, userId: number) {
    const data = uploadFromFileData(fileReq, userId)
    return fileReq.file && data ? {
        create: data            
    } : undefined
}
export function uploadFromFileData(fileReq, userId): Prisma.UploadCreateInput | undefined
{
    return fileReq.file ? {
        path: fileReq.file.filename,
        size: fileReq.file.size,
        originalName: fileReq.file.originalname,
        // UserId: userId,
        UploadUser: {
            connect: {
                id: userId,
            }
        }
    } : undefined
}
export default prisma;




router.use('/social', FriendManager.default)

// deprecated
router.get('/checkLoggedIn', (req, res) => {
    if(getIdFromJWT(req)!=undefined)
     res.status(200).send(true)
    else 
     res.status(401).send(false)

})

router.get('/jwt', (req, res) => {
    const jwt = getJWT(req)
    if(!jwt)
    {
        res.status(401).send({err: 'Not autherized'})
        return
    }
    
    const data = getClientJWTValue(jwt)
    if(data)
     res.status(200).send(data)
    else 
     res.status(401).send({err: 'Invalid JWT value'})

})

router.get('/removeproject', (req, res) => {
    const id = parseInt(req.query.id as string);
    prisma.project.delete({
        where:
        {
            id
        }
    }).then(project => {
        res.status(200).send('deleted')
    }).catch(err => {
        res.status(500).send('failed: '+ err)
    })

})

router.get('/picture/:id', (req, res) => {
    const id = parseInt(req.params.id as string);
    
    prisma.user.findUnique({
        where:
        {
            id
        }
    }).then(user => {
        if(user.picture.startsWith('http'))
            res.status(200).redirect(user.picture)
        else
        res.status(200).sendFile(path.join(__dirname,`../../server/users/uploads/${user.picture}`))
    }).catch(err => {
        res.status(500).send('failed: '+ err)
    })

})

router.get('/upload/:path', (req, res) => {
    const filePath = req.params.path as string
    
    prisma.upload.findUnique({
        where:
        {
            path: filePath
        }
    }).then(upload => {
        if(upload.path.startsWith('http'))
            res.status(200).redirect(upload.path)
        else
        res.status(200).sendFile(path.join(__dirname,`../../server/users/uploads/${upload.path}`))
    }).catch(err => {
        res.status(500).send('failed: '+ err)
    })

})


 async function updateTransporter() {
    return transporter = nodemailer.createTransport({
        host: 'antares.webyouridea.ro',
        port: 587,           // STARTTLS
        secure: false,       // false because STARTTLS is used
        requireTLS: true,
        auth: {
            user: process.env.EMAILADDRESS,
            pass: process.env.EMAILPASS
        },
        tls: {
            rejectUnauthorized: false,    
        },
      })
    }





const oauth2Client = new OAuth2(
     process.env.GOOGLE_CLIENT_ID,
     process.env.GOOGLE_CLIENT_SECRET, // Client Secret
     "https://developers.google.com/oauthplayground" // Redirect URL
);




oauth2Client.setCredentials({
     refresh_token: process.env.GOOGLE_EMAILV_REFRESHTOKEN
});







    


router.get('/verifyemail', (req, res) => {


    const id = parseInt(req.query.id as string);

    getUserData(id).then( user => {
        if(user.emailValidated) return res.send('Your account is already verified') 

    
    Profile.parseUserInfoInFile(id, path.join(rootDirName,'public','pages','emailCodeVerification.html')).catch(err => {
        res.status(403).send({message: "error parsing file",err})
            }).then(async file => {


        const code = generateCode()
        let censoredEmail = user.email
        for(const match of user.email.matchAll(/#{(\w*) ?(?:\?)(.*): ?(.*)}|#{(\w*)}/g))
            censoredEmail = censoredEmail.replace(match[1], "*".repeat(match[1].length)).replace(match[2], "*".repeat(match[2].length))

     
        await transporter.verify();
        const fileToSend =  fs.readFileSync(path.join(rootDirName, 'public', 'pages', 'emailVerification.html')).toString()
        const map = new Map();
        map.set("firstName", user.firstName);
        map.set("code", code.toString());

        const result = fileToSend.replace(/\$\{(.*?)\}/g, (...match) => {
            return map.has(match[1]) ? map.get(match[1]) : `${match[0]}`;
        });

        const hmacCode = hmacuUtil.generateHmac(code.toString())
        console.log('hmaccode:', hmacCode, 'code:', code)

        var mailOptions: nodemailer.SendMailOptions  = {
            from: 'Intelegeinfo <noreply@intelegeinfo.ro>',
            to: user.email,
            subject: code.toString() + ' | Verificare Email intelegeinfo',
            // html: callbackFile,
            html: result,
            priority: 'high'
            ,

          };
          if(false)
          res.send(file.replace('#{code}', hmacuUtil.generateHmac(code.toString())).replace('#{emailCensored}', censoredEmail))
        else
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                res.status(500).send({message: "error sending email",error});
            } else {
                
                console.log(info, 'hmaccode:', hmacCode)
                res.send(parseText(file, req, {code: hmacCode}).replace('#{code}', hmacCode).replace('#{emailCensored}', censoredEmail))
                }
        })
      })
}).catch(err => {
    res.status(403).send({message: "error getting user data",err})

})
})




router.post('/verifyemail', (req, res) => {
    const { id, code, hmac } = req.body;
    
    getUserData(parseInt(id)).then(user => {
        if(user.emailValidated) return res.send('Your account is already verified') 
        if(hmacuUtil.verifyHmac(code, hmac))
        {

            prisma.user.update({
                where: 
                {
                    id: parseInt(id)
                },
                data: {
                    emailValidated: true
                        
                }
            }).then(user => {
 
                onLoggedIn(user, res, req, true).status(200).json({sucess: true, redirect: '/'})
                
            }).catch(err => {
                res.status(403).send(err)

            })
        }
        else
            res.status(403).json({sucess: false})
        
    }).catch(err => {
        res.status(401).send(err)
    })

})







  // router.get('/problem', problemCreator);
router.post('/saveProject', authMiddleware, async (req, res) => {
   
    try {
        const { name, sessionId: saveSessionId, projectId } = req.body;
    
        const userId = users.getIdFromJWT(req)

        if(projectId && sqid.decode(projectId)[0])
        {
    
            try {
                const session = sessionMap.get(saveSessionId)
                const proj = await prisma.savedProject.findUnique({
                    where: {
                        id: sqid.decode(projectId)[0]
                    }
                })
                const foundProj = await prisma.savedProject.update({
                    where: {
                        id: sqid.decode(projectId)[0]
                    },
                    include: {
                        Project: {
                            select: {
                                files: {
                                    where: {
                                        name: {
                                            notIn: session.files.map(file => file.name)
                                        }
                                    }
                                }
                            }
                        }
                    },
                    data: {
                        name: name,
                        Project: {
                            update: {
                                files: 
                                 {
                                    upsert: session.files.map(file => {return {
                                        where: {
                                            name_projectId: {
                                                name: file.name,
                                                projectId: proj.id
                                            }
                                        },
                                        create: {
                                            name: file.name,
                                            content: file.content
                                        },
                                        update: {
                                            content: file.content
                                        }
                                
                                    }}),
                                }
                            }
                        }
                    }
                })
                
                if(foundProj)
                {
                    console.log(foundProj.Project.files, session.files)
                    if(foundProj.Project && foundProj.Project.files.length != 0) 
                        await prisma.savedProject.update({
                            where: {
                                    id: sqid.decode(projectId)[0]
                                },
                                data: {
                                    Project: {
                                        update: {
                                            files: {
                                                deleteMany: foundProj.Project.files   
                                            }
                                        }
                                    }
                                }
                            })
                    
                    res.status(200).json({isNew: false, message: "sucsess"})
                    return
                }
            } catch (error) {
                console.error(error)
                
            }
               
               
        }
        else if(!name)
        {
            res.send({isNew: true})
            return
        } else {
            if(!sessionMap.has(saveSessionId)) {
                res.status(500).json({message: "Sesiunea este invalida"})

                return
            }
            const session = sessionMap.get(saveSessionId)
            const sessionProj = session.savedProject
            //create new saved project
            const savedProj = await addProject(userId, sessionProj ? sessionProj.id : undefined, session, name)

            res.status(200).json({message: "sucsess", projectId: sqid.encode([savedProj.id])})
        }
             
       
    
    } catch (error) {
        console.error(error)
        res.status(500).send(handlePrismaError(error))
    }
   
  });


  router.get('/shareProject', authMiddleware, async (req, res) => {
   
    try {
        const saveSessionId = req.query.sessionId as UUID;
    
        const userId = users.getIdFromJWT(req)

        if(!sessionMap.has(saveSessionId)) {
            res.status(500).json({message: "Sesiunea este invalida"})
            return
        }

        const session = sessionMap.get(saveSessionId)
        const sessionProj = session.savedProject
        //create new saved project
        const sharedProj = await shareProject(userId, sessionProj ? sessionProj.id : undefined, session)

        res.status(200).json({message: "sucsess", shareLink: `${req.secure ? 'https' : 'http'}://${req.host}/editor?share=${sqid.encode([sharedProj.id, sharedProj.projectId])}`})
        
             
       
    
    } catch (error) {
        console.error(error)
        res.status(500).send(handlePrismaError(error))
    }
   
  });



  router.get('/loadProject/:id', authMiddleware, async (req, res) => {
    const  id: string = req.params.id;

   try {
     await prisma.savedProject.findUnique({
         where:
         {
             id: sqid.decode(id)[0]
         }
     })
 
     res.status(200).json({ redirectTo: '/editor?save=' + id });
 
   } catch (error) {
        res.send(handlePrismaError(error))
   }

   

    
  });

  router.get('/listProjects', authMiddleware, async (req, res) => {

        try {

            const explorer = await listAllProjects(users.getIdFromJWT(req))
            
            const folders = explorer[1].map(folder => {return {...folder,folderId: sqid.encode([folder.folderId])}})
            const projects = explorer[0].map(proj => {return {...proj,id: sqid.encode([proj.id])}})
            res.json({folders, projects})
            


        } catch (err) {
            if(err.code) res.status(err.code).json({message: err.message})
                    else res.status(401).send(err)//json({message: 'error: ' + err})
        }
  });

 router.post('/folder/create', authMiddleware, async (req, res) => {
    const { name, parentFolderUUID } = req.body;
    
    const userId = getIdFromJWT(req)
   try {
    const parentFolderId = parentFolderUUID ? sqid.decode(parentFolderUUID)[0] : undefined
     const folder = await prisma.folder.create({
         data: {
            name,
            User: {
                connect: {
                    id: userId
                }
            },
            ParentFolder: parentFolderId ? {
                connect: { 
                    folderId: parentFolderId,
                    userId,
                    
                }
            } : undefined
            
         }
     })
 
     res.status(200).json({ ...folder, folderId: sqid.encode([folder.folderId]), ParentFolder: {folderId: parentFolderUUID} });
 
   } catch (error) {
        res.send(handlePrismaError(error))
   }
  });

router.post('/folder/f/:folderId/add', authMiddleware, async (req, res) => {
    const { saveUUID, folderUUID } = req.body;
    const userId = getIdFromJWT(req)
    const subDirectory = req.params.folderId != '_root'
   try {
    const parentFolderId = sqid.decode(req.params.folderId)[0]
   
    if(!parentFolderId)
        throw 'Invalid UUID'

    if(folderUUID) {
         const folderId = sqid.decode(folderUUID)[0]
        const changedFolder = await prisma.folder.update({
            where: {
                folderId,
                userId
            },
            data: {
                ParentFolder: subDirectory ? {
                    connect: {
                        folderId: parentFolderId
                    }
                } : {
                disconnect: true
            }
            }
        })
        res.status(200).json({ changedFolder });
        return;
    }
    const saveId = sqid.decode(saveUUID)[0]
    const changedFile = await prisma.savedProject.update({
        where: {
            id: saveId,
            creatorId: userId
        },
        data: {
            Folder: subDirectory ? {
                  connect: {
                    folderId: parentFolderId,
                    userId
                } 
            } : {
                disconnect: true
            }
        }
    })

 
     res.status(200).json({ changedFile });
 
   } catch (error) {
        console.error(error)
        res.status(500).send(handlePrismaError(error))
   }
  });


  
router.get('/folder/f/:folderId', authMiddleware, async (req, res) => {
    const userId = getIdFromJWT(req)
   try {
    const folderId = sqid.decode(req.params.folderId)[0]
    if(!folderId)
        throw 'Invalid UUID'
     const folder = await prisma.folder.findUnique({
         where: {
            userId,
            folderId
         },
         include: {
            Projects: true,
            ChildFolders: true,
            ParentFolder: {
                select: {
                    folderId: true,
                    name: true
                }
            }
         }
     })
 
     const folders = folder.ChildFolders.map(folder => 
        {return {...folder,folderId: sqid.encode([folder.folderId]), parentFolderId: sqid.encode([folder.parentFolderId])}})
    const projects = folder.Projects.map(proj => {return {...proj,id: sqid.encode([proj.id])}})
     res.status(200).json({ folders, projects, ...folder, Projects: undefined,  ChildFolders: undefined, folderId: req.params.folderId,
        ParentFolder: folder.ParentFolder ? {...folder.ParentFolder, folderId: sqid.encode([folder.ParentFolder.folderId])} : undefined, parentFolderId: sqid.encode([folder.parentFolderId])});
 
   } catch (error) {
        console.error(error)
        res.send(handlePrismaError(error))
   }
  });




const passwordPagesPath = path.join(rootDirName, 'public','pages')
    router.get('/reset-password', async (req, res) => {
        if(req.query.email)
        {
            try {
                const email = req.query.email as string
                await transporter.verify(); 
                const token = jwt.sign(
                    {email} , privateKeyPem, {algorithm: 'RS256', expiresIn: '1h', issuer: 'intelegeinfo.ro'})

                var mailOptions: nodemailer.SendMailOptions  = {
                    from: 'Intelegeinfo <noreply@intelegeinfo.ro>',
                    to: email,
                    subject: 'Resetare Parola Intelegeinfo',
                    // html: callbackFile,
                    html: 
    `
    <h3>Resetare parola</h3>
    <p>Aici este linkul tau de resetare a parolei:</p>

    <a href="https://intelegeinfo.ro/user/reset-password?token=${token}">Reseteaza parola</a>
    
    <p>Pentru orice intrebare va rugam sa ne contactati la 
    <a href="mailto://office@intelegeinfo.ro">office@intelegeinfo.ro</a></p>`
                ,

            };
            transporter.sendMail(mailOptions, (err, info) => {
                res.sendFile(path.join(passwordPagesPath,'reset-password-confirm.html'))
            })
            }
            catch(err)
            {
                res.send('Am intampinat o problema..')
                console.error(err)
            }
            
        } else if(req.query.token)
        {
            const tokenString = req.query.token as string
            const token = jwt.verify(tokenString, privateKeyPem)
            const email = (token as JwtPayload).email
            if(!token || !email)
            {
                res.status(401).send('Nu s-a putut verifica autetincitatea cererii. Incercati sa resetati parola inca o data.')
                return;
            }
            const file = fs.readFileSync(path.join(passwordPagesPath,'reset-password-new.html')).toString()
           
            res.contentType('html').send(file.replaceAll('#{email}', email))
            return
        } else

        res.sendFile(path.join(passwordPagesPath,'reset-password.html'))
   
  });


  router.post('/reset-password', async (req, res) => {
        
        if(req.query.token)
        {
            const tokenString = req.query.token as string
            const token = jwt.verify(tokenString, privateKeyPem) as JwtPayload
            if(!token)
            {
                res.status(401).send('Nu s-a putut verifica autetincitatea cererii. Incercati sa resetati parola inca o data.')
                return;
            }
            const {password} = req.body
            const hashedPassword = prepareEncrPassForDB(password, false)
            console.log(hashedPassword)
            prisma.user.update({
                where: {
                    email: token.email
                },
                data: {
                    password: hashedPassword
                }
            }).then(() => {
                res.sendFile(path.join(passwordPagesPath,'reset-password-finish.html'))
            }).catch(err => {
                res.status(401).send('Am intampinat o problema...')
                console.error(err)
                return;
            })
            return
        } 
   
  });


router.get('/picture', async (req, res) => {
    const id = getIdFromJWT(req)
    if(id)
    {
        const user = await updateActiveAtForUser(id, {pictureUpload: true}) //getUserData
        if(!user)
        {
            clearAuthCookies(res).status(404).redirect('/')
            return
        }
        if(user.picture.startsWith('http'))
            res.status(200).redirect(user.picture)
        else
            res.status(200).sendFile(path.join(rootDirName,`/server/users/uploads/${user.picture}`))
    }
})

router.post('/picture', upload.single('profilePicture'), async (req, res) => {
    try {
        const id = getIdFromJWT(req)
        if(!id)
            throw 'Please log in first.'

            const data = uploadFromFileData(req, id)
            if(!data)
                throw 'invalid data'

            prisma.user.update({
                where: {
                    id
                },
                data: {
                    pictureUpload:  createUploadFromFile(req, id),
                } 
            }).then(val => {
                res.redirect('/profile')
            })
        
    } catch (error) {
        res.send(error)
    }
})



export function activeAtComponent()
{
    return {activeAt: new Date()}
}
  export async function updateActiveAtForUser(userId: number, include?: Prisma.UserInclude)
  {
    try 
    {
        if(!userId)
        return false
    return await prisma.user.update(
        {
            where: {
                id: userId
            },
            data:
            {
                ...activeAtComponent()
            },
            include
        }
    )
    }
    catch(err)
    {
        return await prisma.user.findFirst(
        {
            where: {
                id: userId
            },
            include
        }
    )
    }
    
  }
//  const callbackMap: Map<string, number> = new Map();

//  function createToken(user: any) {
//      return jwt.sign({
//        iss: "intelegeinfo.ro",
//        sub: user.id,
//        role: user.role
//      }, privateKeyPem, {  algorithm: 'RS256', expiresIn: '1h'});
//    }

// router.get('/verifyemail', (req, res) => {
//     const id = parseInt(req.query.id as string);

//     getUserData(id).then(user => {
//                 if(user.emailValidated) return res.send('Your account is already verified') 

    
//     Profile.parseUserInfoInFile(id, './public/pages/emailVerification.html').then(file => {
//         const verifyJWT = jwt.sign({
//             iss: "intelegeinfo.ro",
//             sub: id,
//           }, privateKeyPem, {  algorithm: 'RS256', expiresIn: '1h'});


//         callbackMap.set(verifyJWT, id)


// //path.join(req.host,'user','verifyemail','callback')
//         const callbackFile = file.replace('#{callback}', `'http://intelegeinfo.ro/user/verifyemail/callback?token=${verifyJWT}'`)

//         console.log(verifyJWT + "\n now awating callback: \n")
//         var mailOptions = {
//             from: 'intelegeinfo@gmail.com',
//             to: 'radubitere5@gmail.com',
//             subject: 'Verificare Email',
//             html: callbackFile,
//             // text: verifyJWT
    
//           };
    
//           transporter.sendMail(mailOptions, function(error, info){
//             if (error) {
//                 res.status(500).send(error);
//             } else {
//              res.send('Email sent')
//             }
//         })
//       }).catch(err => {
//         res.status(403).send(err)

//       }).catch(err => {
//         res.status(403).send(err)
//       })
//     }).catch(err => {
//         res.status(403).send(err)

//     })
// })




//     router.get('/verifyemail/callback', (req, res) => {
//         const token = req.query.token as string
//         // console.log(token)
        
//         if(callbackMap.has(token))
//         {
//             const id = parseInt((jwt.verify(token, privateKeyPem) as any).sub);
            
//             if(parseInt((jwt.verify(token, privateKeyPem) as any).sub) ===callbackMap.get(token))
//             {
                

//                 prisma.user.update({
//                     where: 
//                     {
//                         id
//                     },
//                     include: {
//                         projects: true,
//                       },
//                     data: {
//                        emailValidated: true
                            
//                     }
//                 }).then(user => {

//                     onLoggedIn(user, res)
//                         res.send(user.name)
                   
//                 }).catch(err => {
//                     res.status(403).send(err)

//                 })
//             }
                
                
//             else
//             res.status(401).send('unauth')
//         }
//         else
//         res.status(401).send('invalid callback link')
//     })

  