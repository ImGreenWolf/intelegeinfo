import express, { CookieOptions, Request, Response } from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import forge from 'node-forge';
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken"
import { UUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import prisma from './dbClient';
import * as signup from './signup'
import path from 'path';
import { Role } from '../../generated/prisma';
import { sqid, tokenCookieName } from './server';
import { getJWT, getClientJWTValue, getClientId, transporter } from './usersManager';
import { google } from 'googleapis';
const googleIdentityClient = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();
router.use(bodyParser.json());
router.use(express.static("public/pages/login.html"))
export default router;    
const rootDirName = path.resolve("./")
const privateKeyPem = fs.readFileSync(path.join(rootDirName,'private.pem'), 'utf8') || "supersecretprivatekey" ;
export const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
const publicKeyPem = fs.readFileSync(path.join(rootDirName,'public.pem'), 'utf8') || "supersecretpublickey";;


export interface UserState  {
      iss: string
      sub: string,
      role: Role,
}

function createToken(user: any) {
    return jwt.sign({
      iss: "intelegeinfo.ro",
      sub: user.id,
      role: user.role,
    } as UserState, privateKeyPem, {  algorithm: 'RS256', expiresIn: 1000000});
  }

export function onLoggedIn(user: unknown, res: Response, req: Request, shouldkeepLoggedIn= false)
{
  if(!user) throw 'Invalid user';
  let token = createToken(user)
  const secure = req.secure;
  const httpOnly = true;
  let keepLoggedIn =  req.body ? (req.body.keepLoggedIn ? req.body.keepLoggedIn : shouldkeepLoggedIn) : shouldkeepLoggedIn;

  const cookieOption: CookieOptions = keepLoggedIn ? {
        sameSite: 'lax',
        httpOnly,
        secure, // Set to true in production (HTTPS)
        maxAge: 1000 * 60 * 60 * 24 * 31, // 31 days // 1 hour
      } : {
        sameSite: 'lax',
        httpOnly,
        secure, // Set to true in production (HTTPS)
      }

  return res.cookie(tokenCookieName, token, cookieOption).cookie('iiauthstate', true,
     {...cookieOption, httpOnly: false});


}

export function clearAuthCookies(res: Response) {
  return res.clearCookie(tokenCookieName).clearCookie('iiauthstate')
}



// Routes
router.post('/', (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password || password.length > 8192) {
    res.status(400).json({error: 'Email and encrypted password are required'});
    return;
  }
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
      if(!user) { res.status(401).json({ message: 'Couldnt find user!'}); return; }
      
      // compare decrypted client password to hased db password
      if (!user.password) { res.status(401).json({ message: 'Use the provider sign-in flow for this account' }); return; }
      return bcrypt.compare(decryptedPassword,user.password).then((passwordsMatch) =>{

              if (email === user?.email && passwordsMatch)  {
                  // login succsessfull

                  console.log(`User ${user.username} with id ${user.id} logged in using credentials`)
                  onLoggedIn(user, res, req).status(200).json({ message: 'Login successful! Hello ' + user.username});



                  } else {
                  console.log(`Faild auth for ${user.username}`)
                  

                  res.status(401).json({ message: 'Invalid credentials'});
                  }
              });

    }).catch(() => {
      if (!res.headersSent) res.status(500).json({error: 'Unable to sign in'});
    })
    




  } catch (err) {
    res.status(400).json({ error: 'Invalid encrypted password' });
  }

   
  });

  

router.get('/one-time-code', (req, res) => {
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cere Aprobare</title>
        <link rel="stylesheet" href="/css/password-reset.css">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Playwrite+DK+Loopet:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        
    </head>
    <body>
    <div class="pass-container">
      <h1 id="title">Introdu adresa de email</h1>
      <p id='details'>Completeaza emailul contului tau si primeste un email cu aprobare pentru a-ti accesa contul fara a mai introduce parola.</p>
      <form id='form'>
            <label for="email">Email</label>
            <input type="email" name="email" id="email" placeholder="Adresa email al contului">
            <button type="submit">Trimite</button>
      </form>

      <script>

      main() 

      async function main() {
       const form = document.getElementById('form')
        const email = await new Promise((resolve, reject) => {
          const email = document.getElementById('email')
          email.onkeydown = (ev) => {
            if (!(ev.key === "Enter" && !ev.shiftKey))
              return;

            ev.preventDefault()
            resolve(email.value)
          }
         
          form.onsubmit = (ev) => {
            ev.preventDefault()
            
            resolve(email.value)
          }
        
        })
        
        if(!email)
          return
        const res = await fetch('./one-time-code', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            email,
            keepLoggedIn: false,
          })
        })
        document.getElementById('title').innerText = res.ok ? 'Am trimis emailul.' : "A aparut o eroare"
        document.getElementById('details').innerText = res.ok ? 'Va rugam aprobati apasand butonul primit pe email la ' + email : "Va rugam incercati alta metoda.."
        form.style.display = 'none';
        const token = (await res.json()).token
          if(!token)
            return

        setInterval(async () => {
          const res = await fetch('./one-time-code/verify?token=' + token)
          if(!res.ok)
            return;
          location.href = '/profile';
        }, 5000);

      }
      </script>
      </div>
    </body>
    </html>
    
    `)
})

router.post('/one-time-code', async (req, res) => {
    try {
      const {email, keepLoggedIn} = req.body; 
      if (typeof email !== 'string' || !email.trim()) {
        res.status(400).send({msg: 'Email is required'});
        return;
      }
      const nonce = uuidv4();
      const claims = {email, keepLoggedIn: keepLoggedIn === true, nonce};
      const token = jwt.sign({...claims, purpose: 'email-login-poll'}, privateKeyPem, {algorithm: 'RS256', expiresIn: 3600});
      const approvalToken = jwt.sign({...claims, purpose: 'email-login-approval'}, privateKeyPem, {algorithm: 'RS256', expiresIn: 3600});
      const user = await prisma.user.findFirst({
        where: {
          email
        }
      })
      if(!user) {
         res.status(404).send({msg: 'Nu am gasit contul asociat cu emailul dat...'})
        return;
      }

      await transporter.sendMail({
        to: email,
        from: 'IntelegeInfo <noreply@intelegeinfo.ro>',
        subject: 'Aprobare Logare Intelegeinfo',
        html: 
        `
        <div>
          <h1>Cerere de logare in contul ${user.username}</h1>
          <p>Apasa pe butonul de mai jos pentru a aproba logarea, iar apoi reveniti la pagina initiala si veti avea access la contul dumneavoastra</p>
          <a href='https://intelegeinfo.ro/login/one-time-code/callback?token=${approvalToken}' style='background-color: #3393ca; border-radius: 0.5em; color: white; font-family: Poppins; padding: 1em 3em;text-decoration: none;'>Aproba</a>
          <br>
          <p>Cererea expria intr-o ora!</p>
          <p>
          Daca nu ai cerut acest cod, apasa refuza si vom bloca accesul. Contul tau nu este in pericol, dar inseamna ca cineva a incercat sa-ti acceseze contul!
          </p>
        </div>
        `
      });
      codeVerifiedAcc.set(nonce, {...claims, approved: false});
      const expiry = setTimeout(() => codeVerifiedAcc.delete(nonce), 3600000);
      expiry.unref();
      res.send({msg: 'Done! Am trimis linkul cu codul de logare!', token});
    } catch (error) {
      res.status(500).send(error)
    }
})

router.get('/one-time-code/callback', (req, res) => {
   try {
     const token = req.query.token as string; 
     if(!jwt.verify(token, privateKeyPem))
       throw 'cod invalid!';
 
     const obj = jwt.verify(token, privateKeyPem) as JwtPayload
     if (obj.purpose !== 'email-login-approval' || typeof obj.email !== 'string')
       throw 'invalid token purpose';
     const pending = codeVerifiedAcc.get(obj.nonce);
     if (!pending || pending.email !== obj.email) throw 'Request expired or already used';
     pending.approved = true;
     res.send(`
      <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cerere Aprobata</title>
        <link rel="stylesheet" href="/css/password-reset.css">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Playwrite+DK+Loopet:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        
    </head>
    <body>
      <div class="pass-container">
        <h1 id="title">Cerere Aprobata</h1>
        <p id='details'>Intoarceti-va la pagina initiala pentru a continua. Spor la programat!</p>
      </div>
    </body>
    </html>
      
      `)
   } catch (error) {
      res.status(500).send(error)
    
   }

})
const codeVerifiedAcc = new Map<string, JwtPayload>()
router.get('/one-time-code/verify', async (req, res) => {
 try {
     const token = req.query.token as string; 
     const keepLoggedIn = req.query.keepLoggedIn == 'true';
     if(!jwt.verify(token, privateKeyPem))
       throw 'invalid token';
 
     const clobj = jwt.verify(token, privateKeyPem) as JwtPayload
     if (clobj.purpose !== 'email-login-poll' || typeof clobj.email !== 'string')
       throw 'invalid token purpose';
     
     const clemail = clobj.email as string
     const verifiedEmail = codeVerifiedAcc.get(clobj.nonce)
     if(!verifiedEmail?.approved)
       throw 'email is not verified';
 
 
     const obj = verifiedEmail
     if(!obj)
       throw 'invalid object';
 
     const email = obj.email as string
 
     if(clemail != email)
       throw 'emails dont match';
 
     codeVerifiedAcc.delete(clobj.nonce)
 
     const user = await prisma.user.findFirst({
       where: {
         email
       }
     })
 
     onLoggedIn(user, res, req, obj.keepLoggedIn === true).send(true)
 } catch (error) {
      res.status(401).send(error)
  
 }

})

router.get('/public-key', (req, res) => {
    res.send(publicKeyPem);
  });



export function authMiddleware(req: any, res: Response, next:any) {
  const token = getJWT(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = getClientJWTValue(token);
    if (!user || !getClientId(token))
      return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
}


// Types for token and user info
type GoogleTokenResponse = {
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
    return res.status(400).send('Missing authorization code. Refresh the page!');
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

    // Step 4: Fetch user info using access token
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const userInfo = (await userInfoRes.json()) as GoogleUserInfo;
    if (!tokenRes.ok || !userInfoRes.ok || !userInfo.email || !userInfo.verified_email)
      throw new Error('Unable to verify Google account');


    const userExists = await prisma.user.findFirst({
      where: {
        email: userInfo.email
      }
    })

    const keepLoggedIn = true
    if(userExists) {

     try {
       await prisma.user.update({
         where: {
           email: userInfo.email,
           loginMethod: 'google'
         },
         data: {
           authId: tokenData ? tokenData : null
         }
       })
     } catch (error) {
        console.error('failed to update user while logging in:', error)
     }

      if(userExists.loginMethod==='google')
      {
        if(userExists.password!==userExists.loginMethod)
        {

        console.log(`User ${userExists.username} with id ${userExists.id} logged in using Google`)
        onLoggedIn(userExists, res, req, keepLoggedIn).redirect('/')

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
        const result = await signup.onSignedIn(
          {email: userInfo.email, type: 'None', firstName: userInfo.given_name, lastName: userInfo.family_name, loginMethod: 'google', username: userInfo.name, profile: userInfo.picture}
          , res, null, req, keepLoggedIn, tokenData)
        result.res.redirect('/profile')
       
      }
      catch(err)
      {
        
          res.send('Am intampinat o erroare! Ne cerem scuze.. Eroare: '+ err)
          return;
        
      }
        
    }

  } catch (error) {
    console.error('OAuth Error:', error);
    res.status(500).send('Am intampinat o eroare la autentificare. Ne cerem mii de scuze si va rugam din suflet sa ne contactati pe email la office@intelegeinfo.ro si va raspundem cat mai curand posibil. \n Erroare: \n' + error);
  }
});

// router.post('/createGoogleAcc',(req, res)=> {
//   const userEmail = req.body.email;
//   const password = signup.prepareEncrPassForDB(req.body.password)
//   console.log(userEmail)
//   prisma.user.update({
//     where: {
//       email: userEmail
//     },
//     data:
//     {
//       password
//     }
//   }).then(user => {
//     onLoggedIn(user, res, req, true)

//     res.json({message: 'good'})
//   }).catch(err => {
//     res.json({error: err})
//   })
// })

// Step 2: Handle Google callback
router.post('/callback', async (req:any, res:any) => {
  const {credential} = req.body

  if (!credential) {
    return res.status(400).send('Empty credential. Something went wrong with the request.');
  }
  

  try {

    if (!process.env.GOOGLE_CLIENT_ID) throw new Error('Google sign-in is not configured');
    const ticket = await googleIdentityClient.verifyIdToken({idToken: credential, audience: process.env.GOOGLE_CLIENT_ID});
    const identity = ticket.getPayload();
    if (!identity?.email || !identity.email_verified) throw new Error('Google email is not verified');
    const userInfo = { ...identity, id: identity.sub, verified_email: identity.email_verified } as GoogleUserInfo;


    const userExists = await prisma.user.findFirst({
      where: {
        email: userInfo.email
      }
    })

    const keepLoggedIn = true
    if(userExists) {

     try {
       await prisma.user.update({
         where: {
           email: userInfo.email,
           loginMethod: 'google'
         },
         data: {
           authId: credential ? {onetap: credential} : null
         }
       })
     } catch (error) {
        console.error('failed to update user while logging in:', error)
     }

      if(userExists.loginMethod==='google')
      {
        if(userExists.password!==userExists.loginMethod)
        {

        console.log(`User ${userExists.username} with id ${userExists.id} logged in using Google`)
        onLoggedIn(userExists, res, req, keepLoggedIn).redirect('/')

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
        const result = await signup.onSignedIn(
          {email: userInfo.email, type: 'None', firstName: userInfo.given_name, lastName: userInfo.family_name, loginMethod: 'google', username: userInfo.name, profile: userInfo.picture}
          , res, null, req, keepLoggedIn, {onetap: credential})
        result.res.redirect('/profile')
       
      }
      catch(err)
      {
        
          res.send('Am intampinat o erroare! Ne cerem scuze.. Eroare: '+ err)
          return;
        
      }
        
    }

  } catch (error) {
    console.error('OAuth Error:', error);
    res.status(500).send('Am intampinat o eroare la autentificare. Ne cerem mii de scuze si va rugam din suflet sa ne contactati pe email la office@intelegeinfo.ro si va raspundem cat mai curand posibil. \n Erroare: \n' + error);
  }
});
