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


export function onSignedIn({ email, username, loginMethod, firstName, lastName}, res:Response, password: string, req)
{
  prisma.user.create({
    data: {
      firstName, 
      lastName,
      email,
      username,
      password,
      loginMethod,
      userColor: randomHexColor(),
    }
  }).then((user) => {
      if(!user) res.status(400).json({ error: 'Failed to create user' });
      onLoggedIn(user, res, req)
      res.json({message: "Sucess", redirect: 'user/verifyEmail', email: user.email, id: user.id, loginMethod})


      


  }).catch(reason => {
    res.status(400).json({ error: 'Failed to create user: ' + reason});
  })
}



function createUser(params:any, res: Response, password: string, req)
{
  const { email, name, loginMethod, } = params;
  prisma.user.findUnique({ // TODO Finda  better way to check if a user exists.
    where:
    {
      email
    }       
}).then((user) => {
  if(!user) onSignedIn(params, res, password, req)
    else return res.status(400).json({ error: 'An account with this email already exists! Try logging in!'});

}).catch((reason) => 
    {
      onSignedIn(params, res, password, req)
    
    })
}


export function prepareEncrPassForDB(password:string)
{
  const decryptedPassword = privateKey.decrypt(
    forge.util.decode64(password ),
    'RSA-OAEP'
  );
  return bcrypt.hashSync(decryptedPassword, 4);
}



// POST Signup
router.post('/', (req, res) => {
  const { loginMethod, password } = req.body;
  try {
    if(loginMethod === 'local')
    {
      
      const hashedPassword = prepareEncrPassForDB(password)
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