import express from "express";
import fs from "fs";
import bodyParser from 'body-parser';
import jwt from "jsonwebtoken"
import cookieParser from 'cookie-parser'
import prisma from "./dbClient";
import { Project, User } from "../../generated/prisma";
import * as users from './usersManager'
import path from "path";
import { parseText } from "./server";
const router = express.Router();
router.use(bodyParser.json());
router.use(cookieParser())

// router.use(cookieParser())

// router.use(express.static("public/pages/profile.html"))
// const privateKeyPem = fs.readFileSync('../private.pem', 'utf8');

// function getUserData(id: number)
// {
//     return new Promise<User> ((resolve)=>
//         prisma.user.findUnique({
//             where: 
//             {
//                 id
//             }
//         }).then(user => {
//             resolve(user as User)
//         })
//     )
    
// }

// function getClientId(token: string)
// {
//     const userState = jwt.verify(token, privateKeyPem);
//     if(!userState) throw 'invalid token';
//     const userId= parseInt((userState as any).sub);
//     if(!userId) throw 'couldnt get id'
//     return userId;
// }
router.post('/update', (req, res) => {

    if (!users.getJWT(req))  
    {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }


     const userId =users.getClientId(users.getJWT(req));
     if(!req.body)
     {
         res.status(500).send('invalid body')
         return;
     }
       
    //  if(req.body.file)
    //     var {file} = req.body
    //  if(req.body.color)
    //     var {color} = req.body
    //  if()
        
    try {
        var {occupationType, color} = req.body 

        if(req.body.deleteAccount)
        {
            prisma.user.delete({
                where: {
                    id: userId
                }
            }).finally(() => {
                res.clearCookie('token').send('Contul tau a fost sters. Ne pare nespus de rau sa vedem ca pleci... Daca vrei sa ne lasi un mesaj, scrie-ne la adresa de email: office@intelegeinfo.ro')
                return;
            })
        }
        else {
            if(color)
            {
                var userColor = (color as string).slice(1)
                if(userColor.length != 6 && color[0] == '#')
                    throw "invalid color"
            }
            
            prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    userColor,
                    occupationType
                    // picture: file ? file : undefined
                }
            }).then(value => {
                res.redirect('/profile')
            })
        }
    }
    catch (err)
    {
        res.status(500).send(err)
    }
    
})


router.get('/logout', (req, res) => {

    res.clearCookie('token')
    res.json({redir: '/', message: "log out sucecsesfull!"})
})

router.use('/', (req, res) => {

       // const token = req.cookies.token
       
        if (!users.getJWT(req))  
        {
            res.status(401).redirect('/signup')
            return
        }
        if(req.query.logout) {
            res.clearCookie('token')
            res.json({redir: '/', message: "log out sucecsesfull!"})
            return
        }
        else
            try {

                const userId =users.getClientId(users.getJWT(req));
                    
                 users.updateActiveAtForUser(userId as number).then(async user => {
                    interface webParams extends users.UserNoPassword
                    {
                        projectsList?: string
                    }
                    if(!user)
                    {  
                        if(!res.headersSent)
                            res.status(401).redirect('/signup')
                        return
                    }  
                    
                    const params: webParams = user;
                    const projects = await users.listAllProjects(userId)
                    if(typeof projects == 'string')
                    {
                         res.status(500).send('A aparut o problema...')
                         return
                    }

                    if(!projects || projects.length == 0)
                        params.projectsList='<p class="empty-response">Nu ai creat niciun proiect</p>'
                    else 
                    {
                         params.projectsList=''
                        for(const project of projects as Project[])
                        {
                            params.projectsList += `<a class="project" href="/editor?save=${project.fileUUID}"><h3>${project.name}</h3><button>x</button></a>`
                        }

                    }
                   
                    parseUserInfoInFile(userId, "public/pages/profile.html", params).then(file => {
                        res.send(parseText(file, req))
                        
                    }).catch(err => {
                        if(err.userNoExist)
                        {  
                            
                            res.clearCookie('token').status(401).json({ error: "Couldnt find account" });
                        }
                        console.error('error parsing user info in file: ' + err.err)
                    })
                 })

            // }).catch(reason => {
            //     console.error('failed to get user data')
            // // throw 'failed to get user data ' + reason;
            // })
                
            
            } catch (err) {
                res.status(403).json({ error: err });
            }



 
})


export default router;

export function parseUserInfoInFile(userId,fileSrc: string, params?: User | any): Promise<any>
{

    return new Promise<string>((resolve, reject) => {

         function replaceVariables(data, params)
                     {
                        const paramJSON = params;
                        let file = data;
                        
                        for(const match of file.matchAll(/#{(.*)(?:\?)(.*):(.*)}|#{(.*)}/g))
                            {
                                if(!(paramJSON[match[4]?.trim()]!=undefined || paramJSON[match[1]?.trim()]!=undefined)) // !! had to add !=undefined because it was pickuping up emailValidated = false and projectList = '' as invalid matches lmao.
                                    {
                                        
                                        console.log('couldnt find value for match ' + (match[4] ? match[4] : match[1]));
                                    }
                                     else
                                    {
  // console.log(match)
                                            if(match[2])
                                            {
                                                
                                                if(match[1])
                                                    file = file.replace(match[0], replaceVariables(match[2], params))
                                                else
                                                    file = file.replace(match[0], replaceVariables(match[3], params))
                                                
                                            } else 
                                            {
                                                file = file.replace(match[0], paramJSON[match[4].trim()])

                                            }
                                    }
                                
                              
                                
                            }
                            return file;
                     }



                if(!params)
                    users.getUserData(userId as number).then(user => {
                    
                        

                        let file = fs.readFileSync(fileSrc).toString()


                            

                        resolve(replaceVariables(file, user));

                        }).catch(err => {
                            reject({err, userNoExist: true})
                        })
                else
                {
                    
                     let file = fs.readFileSync(fileSrc).toString()
                     resolve(replaceVariables(file, params))

                    
                       
                }
                    
        })
}