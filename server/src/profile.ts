import express from "express";
import fs from "fs";
import bodyParser from 'body-parser';
import jwt from "jsonwebtoken"
import cookieParser from 'cookie-parser'
import prisma from "./dbClient";
import { Project, User } from "../../generated/prisma";
import * as users from './usersManager'
import path from "path";
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

router.use('/', (req, res) => {

       // const token = req.cookies.token
       
        if (!users.getJWT(req))  
        {
            res.status(401).json({ error: 'Unauthorized' });
        }
        if(req.query.logout) {
            res.clearCookie('token')
            res.json({redir: '/', message: "log out sucecsesfull!"})
        }
        else
            try {

                const userId =users.getClientId(users.getJWT(req));
                console.log("user id" + userId)
                
                 users.getUserData(userId as number).then(async user => {
                    interface webParams extends users.UserNoPassword
                    {
                        projectsList?: string
                    }
                    const params: webParams = user;
                    const projects = await users.listAllProjects(userId)

                    params.projectsList=''
                    for(const project of projects.projects as Project[])
                    {
                        params.projectsList += `<div class="project"><a href="/editor?save=${project.fileUUID}">${project.name}</a><button>x</button></div>`
                    }

                    parseUserInfoInFile(userId, "public/pages/profile.html", params).then(file => {
                    res.send(file)
                        
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

router.get('/logout', (req, res) => {

    res.clearCookie('token')
    res.json({redir: '/', message: "log out sucecsesfull!"})
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
                                if(!(paramJSON[match[4]?.trim()] || paramJSON[match[1]?.trim()])) 
                                    {
                                        
                                        console.log('couldnt find value for match ' + (match[4] ? match[4] : match[1]));
                                        
                                    } else
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