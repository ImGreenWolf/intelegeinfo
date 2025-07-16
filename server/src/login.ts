import express, { Request, Response } from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import forge from 'node-forge';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { UUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import prisma from './dbClient';
import * as signup from './signup'
import path from 'path';

const router = express.Router();
router.use(bodyParser.json());
router.use(express.static("public/pages/login.html"))
export default router;
const validEmail = 'a@c';      
const salt = bcrypt.genSaltSync(10);
const validPassword = bcrypt.hashSync("123", salt);
const rootDirName = path.resolve("./")
const privateKeyPem = fs.readFileSync(path.join(rootDirName,'private.pem'), 'utf8') || "supersecretprivatekey" ;
export const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
const publicKeyPem = fs.readFileSync(path.join(rootDirName,'public.pem'), 'utf8') || "supersecretpublickey";;




function createToken(user: any) {
    return jwt.sign({
      iss: "intelegeinfo.ro",
      sub: user.id,
      role: user.role,
    }, privateKeyPem, {  algorithm: 'RS256', expiresIn: 1000000});
  }

export function onLoggedIn(user: unknown, res: Response, req: Request)
{
  if(!user) throw 'Invalid user';
  let token = createToken(user)
  let secure = req.secure;
  let keepLoggedIn =  req.body ? (req.body.keepLoggedIn || false) : false;
  if(keepLoggedIn)
    res.cookie('token', token, {
        httpOnly: true,
        secure, // Set to true in production (HTTPS)
        maxAge: 1000 * 60 * 60 * 24 * 31, // 31 days // 1 hour
      });
  else
      res.cookie('token', token, {
        httpOnly: true,
        secure, // Set to true in production (HTTPS)
      });

}



// Routes
router.post('/', (req, res) => {
  const { email, password, loginMethod } = req.body;
  try {

    const decryptedPassword = privateKey.decrypt(
      forge.util.decode64(password ),
      'RSA-OAEP'
    );

    // TODO: Compare decryptedPassword with stored password hash
    // console.log('Decrypted password:', decryptedPassword);
    prisma.user.findUnique({
      where: {
        email
      },
    }).then((user) => {
      // if(loginMethod != user?.loginMethod) return res.status(401).json({ message: 'Account was not created using this method'});
      if(!user) return res.status(401).json({ message: 'Couldnt find user!'});
      
      // compare decrypted client password to hased db password
      bcrypt.compare(decryptedPassword,user?.password as string).then((passwordsMatch) =>{

              if (email === user?.email && passwordsMatch)  {
                  // login succsessfull

                  // var token = createToken(user)

                  // res.cookie('token', token, {
                  //     httpOnly: true,
                  //     secure: false, // Set to true in production (HTTPS)
                  //     maxAge: 3600000, // 1 hour
                  //   });

                  onLoggedIn(user, res, req)

                  res.status(200).json({ message: 'Login successful! Hello ' + user.username});



                  } else {
                  // const hasedPassword = bcrypt.hashSync(decryptedPassword, salt);
                  // const user = new UserObject("test", hasedPassword);
                  console.log(user)
                  

                  res.status(401).json({ message: 'Invalid credentials'});
                  }
              });

    })
    




  } catch (err) {
    console.error('Decryption failed:', err);
    res.status(400).json({ error: 'Invalid encrypted password' });
  }

   
  });
 


router.get('/public-key', (req, res) => {
    res.send(publicKeyPem);
  });



export function authMiddleware(req: any, res: Response, next:any) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = jwt.verify(token, privateKeyPem);
    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
}


// Types for token and user info
interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}



// Step 1: Redirect user to Google
router.get('/google', (_req: Request, res: Response) => {
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const queryParams = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.REDIRECT_URI!,
    response_type: 'code',
    scope: 'profile email',
    access_type: 'offline',
    prompt: 'consent'
  });

  res.redirect(`${baseUrl}?${queryParams.toString()}`);
});

// Step 2: Handle Google callback
router.get('/callback', async (req:any, res:any) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }
  

  try {
    // Step 3: Exchange code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.REDIRECT_URI!,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
    console.log(tokenData.refresh_token)

    // Step 4: Fetch user info using access token
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const userInfo = (await userInfoRes.json()) as GoogleUserInfo;


    const userExists = await prisma.user.findUnique({
      where: {
        email: userInfo.email
      },
    })

    console.log(userExists)

    if(userExists) {
      if(userExists.loginMethod==='google')
      {
        console.log(userExists.password)
        if(userExists.password!==userExists.loginMethod)
        {
        // var token = createToken(userExists)

        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: false, // Set to true in production (HTTPS)
        //     maxAge: 3600000, // 1 hour
        //   });

        onLoggedIn(userExists, res, req)
         
        res.send(`
            Te-ai logat cu sucess cu emailul ${userExists.email}.
            Salut ${userExists.username}.
            <a href='/profile'>Profil</a>
            <a href='/editor'>Editor</a>
          `)
        // res.send('Hello ' + userExists.username + `<script>setTimeout(() => {location.href='/editor'}, 2000)</script>`)

        }else
        {
          res.send(`
            <h>Please set a password for your account.</h>
            <form action='/login/createGoogleAcc' method="POST" id="loginForm">
            <input type="hidden" name="email" value="${userInfo.email}">
            <input type=password name="password">
            <button type='submit'>Set Password</button>
            <p id="message"></p>
            </form>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/forge/0.10.0/forge.min.js"></script>

              <script>
            document.getElementById("loginForm").addEventListener("submit", async function (e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            
            const pubKeyPem = await fetch('/signup/public-key').then(res => res.text());
            const publicKey = forge.pki.publicKeyFromPem(pubKeyPem);

            
            const encrypted = publicKey.encrypt(formData.get('password'), 'RSA-OAEP');
            const encryptedBase64 = forge.util.encode64(encrypted);
            formData.set("password", encryptedBase64)

            const data = Object.fromEntries(formData.entries());


            const response = await fetch('/login/createGoogleAcc', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });

              const result = await response.json();
              document.getElementById("message").textContent = result.message ? result.message : result.error;
            });

            
          </script>
            `)
        }
       
      }
      else res.send('Account was not created with google. Try logging in with a different method!')
     

    }
    else 
    {

      try{
        const json = await signup.onSignedIn({email: userInfo.email, firstName: userInfo.given_name, lastName: userInfo.family_name, loginMethod: 'google', username: userInfo.name, profile: userInfo.picture}, res, '', req )
        
       
      }
      catch(err)
      {
        
          res.send('Am intampinat o erroare! Ne cerem scuze.. Eroare: '+ err)
          return;
        
      }
        
  //       fetch('https://intelegeinfo.ro/signup',  {
  //         method: 'POST',
  //         headers: {'Content-Type': 'application/json'},
  //         body: JSON.stringify({email: userInfo.email, password:  'google' , name: userInfo.name, loginMethod: 'google' })
  //       }).then(signRes =>{
  //         res.send('Created account! Hello ' + await signRes.json().jres.name))
  // //         res.send(`
  // //           <h>Please set a password for your account.</h>
  // //           <form action='/login/createGoogleAcc' method="POST" id="loginForm">
  // //           <input type="hidden" name="email" value="${userInfo.email}">
  // //           <input type=password name="password">
  // //           <button type='submit'>Set Password</button>
  // //           <p id="message"></p>
  // //           </form>
  // // <script src="https://cdnjs.cloudflare.com/ajax/libs/forge/0.10.0/forge.min.js"></script>

  // //             <script>
  // //           document.getElementById("loginForm").addEventListener("submit", async function (e) {
  // //           e.preventDefault();
  // //           const formData = new FormData(e.target);
            
            
  // //           const pubKeyPem = await fetch('/signup/public-key').then(res => res.text());
  // //           const publicKey = forge.pki.publicKeyFromPem(pubKeyPem);

            
  // //           const encrypted = publicKey.encrypt(formData.get('password'), 'RSA-OAEP');
  // //           const encryptedBase64 = forge.util.encode64(encrypted);
  // //           formData.set("password", encryptedBase64)

  // //           const data = Object.fromEntries(formData.entries());


  // //           const response = await fetch('/login/createGoogleAcc', {
  // //               method: 'POST',
  // //               headers: {'Content-Type': 'application/json'},
  // //               body: JSON.stringify(data)
  // //           });

  // //             const result = await response.json();
  // //             document.getElementById("message").textContent = result.message ? result.message : result.error;
  // //           });

            
  // //         </script>
  // //           `)
  //       }).catch(err => {
  
  //         res.status(401).send('Failed creating new user: ' + err)
  //       })
       

    }
    
    // res.send(`
    //   <h1>Welcome, ${userInfo.name}</h1>
    //   <img src="${userInfo.picture}" alt="Profile picture" />
    //   <p>Email: ${userInfo.email}</p>
    // `);
  } catch (error) {
    console.error('OAuth Error:', error);
    res.status(500).send('Authentication failed');
  }
});

router.post('/createGoogleAcc',(req, res)=> {
  const userEmail = req.body.email;
  const password = signup.prepareEncrPassForDB(req.body.password)
  console.log(userEmail)
  prisma.user.update({
    where: {
      email: userEmail
    },
    data:
    {
      password
    }
  }).then(user => {
    onLoggedIn(user, res, req)

    res.json({message: 'good'})
  }).catch(err => {
    res.json({error: err})
  })
})

