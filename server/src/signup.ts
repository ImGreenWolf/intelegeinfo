import express, { Request, Response } from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import forge from 'node-forge';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { UUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import prisma from './dbClient';
import {onLoggedIn} from "./login"
import path from 'path';
import { randomHexColor } from './types';
import { UserNoPassword } from './usersManager';
import { OccupationType, Prisma } from '../../generated/prisma';


const router = express.Router();
router.use(bodyParser.json());
router.use(express.static("public/pages/signup.html"))
const rootDirName = path.resolve("./")
const privateKeyPem = fs.readFileSync(path.join(rootDirName,'private.pem'), 'utf8') || "supersecretprivatekey"
const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
const publicKeyPem = fs.readFileSync(path.join(rootDirName,'public.pem'), 'utf8') || "supersecretpublickey";



// function createToken(user: UserObject) {
//     return jwt.sign( 
//       { sub: user.id, username: user.username },
//       privateKeyPem,
//       { expiresIn: '1h' }
//     );
//   }


export async function onSignedIn({ email, username, loginMethod, firstName, lastName, profile, type}, res:Response, password: string, req, keepLoggedIn=true, tokenData?: any ):
 Promise<{json: {message, redirect, email, id, loginMethod}, res: ReturnType<typeof onLoggedIn> }>
{
  return new Promise((resolve, reject) => {

  console.log(OccupationType[type]!=undefined ? OccupationType[type] : OccupationType.None, type, OccupationType[type])
   prisma.user.create({
    data: {
      firstName, 
      lastName,
      email,
      username,
      password,
      loginMethod,
      userColor: randomHexColor(),
      emailValidated: loginMethod == 'google',
      occupationType: OccupationType[type]!=undefined ? OccupationType[type] : OccupationType.None,
      authId: tokenData!=undefined ? tokenData : null,
      pictureUpload:
      {
        connectOrCreate: {
          where: {
            path: profile ? profile : 'default.png'
          },
          create:
          {
            path: profile ? profile : 'default.png'
          }
        }
      }
    },
    omit:
    {
      password: true
    }
  })
  .then((user) => {
      if(!user) reject({ error: 'Failed to create user' })
     
      console.log('created account', username)
      resolve({json: {message: "Sucess", redirect: 'user/verifyEmail', email: user.email, id: user.id, loginMethod}, res: onLoggedIn(user, res, req, keepLoggedIn ? keepLoggedIn : true)})

  }).catch(reason => {
   reject({ error: 'Failed to create user: ' + reason});
  })

  })
}



function createUser(params, res: Response, password: string, req)
{
  const { email, username, loginMethod,type} = params;
  prisma.user.findUnique({ // TODO Finda  better way to check if a user exists.
    where:
    {
      email
    }       
}).then(async(user) => {
  if(!user) {
    const result = await onSignedIn(params, res, password, req, true)
    result.res.send(result.json)
  } 
    else return res.status(400).json({ error: 'An account with this email already exists! Try logging in!'});

}).catch(async (reason) => 
    {
      const result = await onSignedIn(params, res, password, req, true)
      result.res.send(result.json)
    })
}


export function prepareEncrPassForDB(password:string, decrypt=true)
{
  const sanitisedPassword = password.trim()
  if(decrypt==true)
  {
      const decryptedPassword = privateKey.decrypt(
    forge.util.decode64(sanitisedPassword),
    'RSA-OAEP'
  );
  return bcrypt.hashSync(decryptedPassword, 4);
  }else
  {
      return bcrypt.hashSync(sanitisedPassword, 4);
  }

  
}



// POST Signup
router.post('/', (req, res) => {
  const { loginMethod, password } = req.body;
  try {
    if(loginMethod === 'local')
    {
      
      const hashedPassword = prepareEncrPassForDB(password, true)
      // TODO: Compare decryptedPassword with stored password hash
      // console.log('Decrypted password:', decryptedPassword);

      createUser(req.body, res, hashedPassword, req)

    }
    else
    {
      createUser(req.body, res, password, req)

    }
    
    
    
    




  } catch (err) {
    console.error('Decryption failed:', err);
    res.status(400).json({ error: 'Invalid encrypted password' });
  }

   
  });
 


router.get('/public-key', (req, res) => {
    res.send(publicKeyPem);
  });








export default router;