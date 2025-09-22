"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateKey = void 0;
exports.onLoggedIn = onLoggedIn;
exports.clearAuthCookies = clearAuthCookies;
exports.authMiddleware = authMiddleware;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const body_parser_1 = __importDefault(require("body-parser"));
const node_forge_1 = __importDefault(require("node-forge"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbClient_1 = __importDefault(require("./dbClient"));
const signup = __importStar(require("./signup"));
const path_1 = __importDefault(require("path"));
const server_1 = require("./server");
const usersManager_1 = require("./usersManager");
const router = express_1.default.Router();
router.use(body_parser_1.default.json());
router.use(express_1.default.static("public/pages/login.html"));
exports.default = router;
const rootDirName = path_1.default.resolve("./");
const privateKeyPem = fs_1.default.readFileSync(path_1.default.join(rootDirName, 'private.pem'), 'utf8') || "supersecretprivatekey";
exports.privateKey = node_forge_1.default.pki.privateKeyFromPem(privateKeyPem);
const publicKeyPem = fs_1.default.readFileSync(path_1.default.join(rootDirName, 'public.pem'), 'utf8') || "supersecretpublickey";
;
function createToken(user) {
    return jsonwebtoken_1.default.sign({
        iss: "intelegeinfo.ro",
        sub: user.id,
        role: user.role,
    }, privateKeyPem, { algorithm: 'RS256', expiresIn: 1000000 });
}
function onLoggedIn(user, res, req, shouldkeepLoggedIn = false) {
    if (!user)
        throw 'Invalid user';
    let token = createToken(user);
    const secure = req.secure;
    const httpOnly = true;
    let keepLoggedIn = req.body ? (req.body.keepLoggedIn ? req.body.keepLoggedIn : shouldkeepLoggedIn) : shouldkeepLoggedIn;
    const cookieOption = keepLoggedIn ? {
        sameSite: 'lax',
        httpOnly,
        secure, // Set to true in production (HTTPS)
        maxAge: 1000 * 60 * 60 * 24 * 31, // 31 days // 1 hour
    } : {
        sameSite: 'lax',
        httpOnly,
        secure, // Set to true in production (HTTPS)
    };
    return res.cookie(server_1.tokenCookieName, token, cookieOption).cookie('iiauthstate', true, { ...keepLoggedIn, httpOnly: false });
}
function clearAuthCookies(res) {
    return res.clearCookie(server_1.tokenCookieName).clearCookie('iiauthstate');
}
// Routes
router.post('/', (req, res) => {
    const { email, password, loginMethod } = req.body;
    try {
        const decryptedPassword = exports.privateKey.decrypt(node_forge_1.default.util.decode64(password), 'RSA-OAEP');
        // TODO: Compare decryptedPassword with stored password hash
        // console.log('Decrypted password:', decryptedPassword);
        dbClient_1.default.user.findUnique({
            where: {
                email
            },
        }).then((user) => {
            // if(loginMethod != user?.loginMethod) return res.status(401).json({ message: 'Account was not created using this method'});
            if (!user)
                return res.status(401).json({ message: 'Couldnt find user!' });
            // compare decrypted client password to hased db password
            bcryptjs_1.default.compare(decryptedPassword, user?.password).then((passwordsMatch) => {
                if (email === user?.email && passwordsMatch) {
                    // login succsessfull
                    console.log(`User ${user.username} with id ${user.id} logged in using credentials`);
                    onLoggedIn(user, res, req).status(200).json({ message: 'Login successful! Hello ' + user.username });
                }
                else {
                    console.log(`Faild auth for ${user.username}`);
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            });
        });
    }
    catch (err) {
        console.error('Decryption failed:', err);
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
    
    `);
});
router.post('/one-time-code', async (req, res) => {
    try {
        const { email, keepLoggedIn } = req.body;
        const token = jsonwebtoken_1.default.sign({ email, keepLoggedIn, date: Date.now() }, privateKeyPem, { algorithm: 'RS256', expiresIn: 3600 });
        console.log(`https://intelegeinfo.ro/login/one-time-code/callback?token=${token}`);
        const user = await dbClient_1.default.user.findFirst({
            where: {
                email
            }
        });
        if (!user) {
            res.status(404).send({ msg: 'Nu am gasit contul asociat cu emailul dat...' });
            return;
        }
        usersManager_1.transporter.sendMail({
            to: email,
            from: 'IntelegeInfo <noreply@intelegeinfo.ro>',
            subject: 'Aprobare Logare Intelegeinfo',
            html: `
        <div>
          <h1>Cerere de logare in contul ${user.username}</h1>
          <p>Apasa pe butonul de mai jos pentru a aproba logarea, iar apoi reveniti la pagina initiala si veti avea access la contul dumneavoastra</p>
          <a href='https://intelegeinfo.ro/login/one-time-code/callback?token=${token}' style='background-color: #3393ca; border-radius: 0.5em; color: white; font-family: Poppins; padding: 1em 3em;text-decoration: none;'>Aproba</a>
          <br>
          <p>Cererea expria intr-o ora!</p>
          <p>
          Daca nu ai cerut acest cod, apasa refuza si vom bloca accesul. Contul tau nu este in pericol, dar inseamna ca cineva a incercat sa-ti acceseze contul!
          </p>
        </div>
        `
        }, (err, info) => {
            if (err)
                throw err;
            res.send({ msg: 'Done! Am trimis linkul cu codul de logare!', token });
        });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
router.get('/one-time-code/callback', (req, res) => {
    try {
        const token = req.query.token;
        if (!jsonwebtoken_1.default.verify(token, privateKeyPem))
            throw 'cod invalid!';
        const obj = jsonwebtoken_1.default.decode(token);
        const keepLoggedIn = obj.keepLoggedIn;
        const email = obj.email;
        codeVerifiedAcc.set(email, obj);
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
      
      `);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
const codeVerifiedAcc = new Map();
router.get('/one-time-code/verify', async (req, res) => {
    try {
        const token = req.query.token;
        const keepLoggedIn = req.query.keepLoggedIn == 'true';
        if (!jsonwebtoken_1.default.verify(token, privateKeyPem))
            throw 'invalid token';
        const clobj = jsonwebtoken_1.default.decode(token);
        const clemail = clobj.email;
        const verifiedEmail = codeVerifiedAcc.get(clemail);
        if (!verifiedEmail)
            throw 'email is not verified';
        const obj = verifiedEmail;
        if (!obj)
            throw 'invalid object';
        console.error(clobj.date - obj.date);
        if (clobj.date > obj.date)
            throw 'token has been issued before';
        const email = obj.email;
        if (clemail != email)
            throw 'emails dont match';
        codeVerifiedAcc.delete(clemail);
        const user = await dbClient_1.default.user.findFirst({
            where: {
                email
            }
        });
        onLoggedIn(user, res, req, keepLoggedIn).send(true);
    }
    catch (error) {
        res.status(401).send(error);
    }
});
router.get('/public-key', (req, res) => {
    res.send(publicKeyPem);
});
function authMiddleware(req, res, next) {
    const token = (0, usersManager_1.getJWT)(req);
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const user = jsonwebtoken_1.default.verify(token, privateKeyPem);
        req.user = user;
        next();
    }
    catch (err) {
        res.status(403).json({ error: 'Invalid token' });
    }
}
// Step 1: Redirect user to Google
router.get('/google', (_req, res) => {
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const queryParams = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        response_type: 'code',
        scope: 'profile email',
        access_type: 'offline',
        prompt: 'consent'
    });
    res.redirect(`${baseUrl}?${queryParams.toString()}`);
});
// Step 2: Handle Google callback
router.get('/callback', async (req, res) => {
    const code = req.query.code;
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
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });
        const tokenData = (await tokenRes.json());
        // Step 4: Fetch user info using access token
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const userInfo = (await userInfoRes.json());
        const userExists = await dbClient_1.default.user.findFirst({
            where: {
                email: userInfo.email
            }
        });
        const keepLoggedIn = true;
        if (userExists) {
            dbClient_1.default.user.update({
                where: {
                    email: userInfo.email,
                    loginMethod: 'google'
                },
                data: {
                    authId: tokenData ? tokenData : null
                }
            });
            if (userExists.loginMethod === 'google') {
                if (userExists.password !== userExists.loginMethod) {
                    console.log(`User ${userExists.username} with id ${userExists.id} logged in using Google`);
                    onLoggedIn(userExists, res, req, keepLoggedIn);
                    res.redirect('/');
                }
                else {
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
            `);
                }
            }
            else
                res.send('Account was not created with google. Try logging in with a different method!');
        }
        else {
            try {
                const result = await signup.onSignedIn({ email: userInfo.email, type: 'None', firstName: userInfo.given_name, lastName: userInfo.family_name, loginMethod: 'google', username: userInfo.name, profile: userInfo.picture }, res, null, req, keepLoggedIn, tokenData);
                result.res.send(result.json);
            }
            catch (err) {
                res.send('Am intampinat o erroare! Ne cerem scuze.. Eroare: ' + err);
                return;
            }
        }
    }
    catch (error) {
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
