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
exports.upload = exports.storage = exports.router = exports.transporter = void 0;
exports.generateCode = generateCode;
exports.getJWT = getJWT;
exports.getUserData = getUserData;
exports.getIdFromJWT = getIdFromJWT;
exports.addProject = addProject;
exports.listAllProjects = listAllProjects;
exports.getClientJWTValue = getClientJWTValue;
exports.getClientId = getClientId;
exports.createUploadFromFile = createUploadFromFile;
exports.uploadFromFileData = uploadFromFileData;
exports.activeAtComponent = activeAtComponent;
exports.updateActiveAtForUser = updateActiveAtForUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
// import cookieParser from 'cookie-parser'
const dbClient_1 = __importDefault(require("./dbClient"));
const prisma_1 = require("../../generated/prisma");
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const login_1 = require("./login");
const Profile = __importStar(require("./profile"));
const path_1 = __importDefault(require("path"));
const hmacuUtil = __importStar(require("../../dist/shared/hmacUtils"));
const server_1 = require("./server");
const users = __importStar(require("./usersManager"));
const googleapis_1 = require("googleapis");
const signup_1 = require("./signup");
const OAuth2 = googleapis_1.google.auth.OAuth2;
const multer_1 = __importDefault(require("multer"));
updateTransporter();
setInterval(updateTransporter, 3600 * 1000);
const rootDirName = path_1.default.resolve("./"); //'C:\Users\radub_qd\intelegeinfo')
const privateKeyPem = fs_1.default.readFileSync(path_1.default.join(rootDirName, 'private.pem')) || "supersecretprivatekey";
// const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
exports.router = express_1.default.Router();
exports.router.use(body_parser_1.default.json());
// router.use(express.static("public/pages/login.html"))
const userNoPassword = prisma_1.Prisma.validator()({
    omit: { password: true }
});
exports.storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(rootDirName, 'server', 'users', 'uploads')); // Folder where files will be stored
    },
    filename: function (req, file, cb) {
        // Save file with original name + timestamp
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
if (!fs_1.default.existsSync(path_1.default.join(rootDirName, 'server', 'users', 'uploads'))) {
    fs_1.default.mkdirSync(path_1.default.join(rootDirName, 'server', 'users', 'uploads'));
}
exports.upload = (0, multer_1.default)({ storage: exports.storage });
function generateCode() {
    let code = (Math.random() * Math.pow(10, 6)).toFixed();
    if (code.length != 6)
        code = "0".repeat(6 - code.length) + code;
    return code;
}
function getJWT(req) {
    return req.cookies[server_1.tokenCookieName];
}
async function getUserData(id, include) {
    if (!id)
        return undefined;
    return await dbClient_1.default.user.findUnique({
        where: { id },
        omit: { password: true },
        include: include
    });
}
function getIdFromJWT(req) {
    return getClientId(getJWT(req));
}
function addProject(id, data) {
    return new Promise((resolve) => {
        dbClient_1.default.user.update({
            where: {
                id
            },
            include: {
                projects: true,
            },
            data: {
                projects: {
                    create: data
                }
            }
        }).then(user => {
            resolve(user);
        });
    });
}
function listAllProjects(userId) {
    return new Promise((resolve, reject) => {
        users.default.project.findMany({
            where: {
                userId
            }
        }).then(projects => {
            resolve([...projects]);
        }).catch(err => {
            reject(err);
        });
    });
}
function getClientJWTValue(token) {
    if (!token)
        return; // throw {code: 401, message:'invalid token'};
    let userState;
    try {
        userState = jsonwebtoken_1.default.verify(token, privateKeyPem);
    }
    catch {
        return;
    }
    if (!userState)
        return; //throw {code: 401, message:'invalid state'};
    return userState;
}
function getClientId(token) {
    if (!token)
        return; // throw {code: 401, message:'invalid token'};
    let userState;
    try {
        userState = jsonwebtoken_1.default.verify(token, privateKeyPem);
    }
    catch {
        return;
    }
    if (!userState)
        return; //throw {code: 401, message:'invalid state'};
    const userId = parseInt(userState.sub);
    if (!userId)
        return; //throw {code: 401, message:'couldnt get id'}
    return userId;
}
function createUploadFromFile(fileReq, userId) {
    const data = uploadFromFileData(fileReq, userId);
    return fileReq.file && data ? {
        create: data
    } : undefined;
}
function uploadFromFileData(fileReq, userId) {
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
    } : undefined;
}
exports.default = dbClient_1.default;
// deprecated
exports.router.get('/checkLoggedIn', (req, res) => {
    if (getIdFromJWT(req) != undefined)
        res.status(200).send(true);
    else
        res.status(401).send(false);
});
exports.router.get('/jwt', (req, res) => {
    const jwt = getJWT(req);
    if (!jwt) {
        res.status(401).send({ err: 'Not autherized' });
        return;
    }
    const data = getClientJWTValue(jwt);
    if (data)
        res.status(200).send(data);
    else
        res.status(401).send({ err: 'Invalid JWT value' });
});
exports.router.get('/removeproject', (req, res) => {
    const id = parseInt(req.query.id);
    dbClient_1.default.project.delete({
        where: {
            id
        }
    }).then(project => {
        res.status(200).send('deleted');
    }).catch(err => {
        res.status(500).send('failed: ' + err);
    });
});
exports.router.get('/picture/:id', (req, res) => {
    const id = parseInt(req.params.id);
    dbClient_1.default.user.findUnique({
        where: {
            id
        }
    }).then(user => {
        if (user.picture.startsWith('http'))
            res.status(200).redirect(user.picture);
        else
            res.status(200).sendFile(path_1.default.join(__dirname, `../../server/users/uploads/${user.picture}`));
    }).catch(err => {
        res.status(500).send('failed: ' + err);
    });
});
exports.router.get('/upload/:path', (req, res) => {
    const filePath = req.params.path;
    dbClient_1.default.upload.findUnique({
        where: {
            path: filePath
        }
    }).then(upload => {
        if (upload.path.startsWith('http'))
            res.status(200).redirect(upload.path);
        else
            res.status(200).sendFile(path_1.default.join(__dirname, `../../server/users/uploads/${upload.path}`));
    }).catch(err => {
        res.status(500).send('failed: ' + err);
    });
});
async function updateTransporter() {
    return exports.transporter = nodemailer_1.default.createTransport({
        host: 'antares.webyouridea.ro',
        port: 587, // STARTTLS
        secure: false, // false because STARTTLS is used
        requireTLS: true,
        auth: {
            user: process.env.EMAILADDRESS,
            pass: process.env.EMAILPASS
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
}
const oauth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, // Client Secret
"https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_EMAILV_REFRESHTOKEN
});
exports.router.get('/verifyemail', (req, res) => {
    const id = parseInt(req.query.id);
    getUserData(id).then(user => {
        if (user.emailValidated)
            return res.send('Your account is already verified');
        Profile.parseUserInfoInFile(id, path_1.default.join(rootDirName, 'public', 'pages', 'emailCodeVerification.html')).catch(err => {
            res.status(403).send({ message: "error parsing file", err });
        }).then(async (file) => {
            const code = generateCode();
            let censoredEmail = user.email;
            for (const match of user.email.matchAll(/#{(\w*) ?(?:\?)(.*): ?(.*)}|#{(\w*)}/g))
                censoredEmail = censoredEmail.replace(match[1], "*".repeat(match[1].length)).replace(match[2], "*".repeat(match[2].length));
            await exports.transporter.verify();
            const fileToSend = fs_1.default.readFileSync(path_1.default.join(rootDirName, 'public', 'pages', 'emailVerification.html')).toString();
            const map = new Map();
            map.set("firstName", user.firstName);
            map.set("code", code.toString());
            const result = fileToSend.replace(/\$\{(.*?)\}/g, (...match) => {
                return map.has(match[1]) ? map.get(match[1]) : `${match[0]}`;
            });
            const hmacCode = hmacuUtil.generateHmac(code.toString());
            console.log('hmaccode:', hmacCode, 'code:', code);
            var mailOptions = {
                from: 'Intelegeinfo <noreply@intelegeinfo.ro>',
                to: user.email,
                subject: code.toString() + ' | Verificare Email intelegeinfo',
                // html: callbackFile,
                html: result,
                priority: 'high',
            };
            if (false)
                res.send(file.replace('#{code}', hmacuUtil.generateHmac(code.toString())).replace('#{emailCensored}', censoredEmail));
            else
                exports.transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        res.status(500).send({ message: "error sending email", error });
                    }
                    else {
                        console.log(info, 'hmaccode:', hmacCode);
                        res.send((0, server_1.parseText)(file, req, { code: hmacCode }).replace('#{code}', hmacCode).replace('#{emailCensored}', censoredEmail));
                    }
                });
        });
    }).catch(err => {
        res.status(403).send({ message: "error getting user data", err });
    });
});
exports.router.post('/verifyemail', (req, res) => {
    const { id, code, hmac } = req.body;
    getUserData(parseInt(id)).then(user => {
        if (user.emailValidated)
            return res.send('Your account is already verified');
        if (hmacuUtil.verifyHmac(code, hmac)) {
            dbClient_1.default.user.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    emailValidated: true
                }
            }).then(user => {
                (0, login_1.onLoggedIn)(user, res, req, true).status(200).json({ sucess: true, redirect: '/' });
            }).catch(err => {
                res.status(403).send(err);
            });
        }
        else
            res.status(403).json({ sucess: false });
    }).catch(err => {
        res.status(401).send(err);
    });
});
// router.get('/problem', problemCreator);
exports.router.post('/saveProject', server_1.authMiddleware, async (req, res) => {
    const { name, sessionId: saveSessionId, projectId } = req.body;
    console.log(saveSessionId, projectId);
    const userId = users.getIdFromJWT(req);
    if (projectId) {
        const foundProj = await dbClient_1.default.project.findFirst({
            where: {
                fileUUID: projectId
            }
        });
        if (foundProj && foundProj.fileUUID) {
            if (foundProj.userId != userId)
                res.status(401).json({ message: 'Nu poti salva acest proiect deoarece nu este al tau!' });
            else
                fs_1.default.cp(path_1.default.join(rootDirName, "cache", saveSessionId), path_1.default.join(rootDirName, "saved", foundProj.fileUUID), { recursive: true, force: true }, (() => {
                    try {
                        res.status(200).json({ isNew: false, message: "sucsess" });
                    }
                    catch (err) {
                        if (err.code)
                            res.status(err.code).json({ message: err.message });
                        else
                            res.status(401).json('error: ' + err);
                    }
                }));
            return;
        }
    }
    if (!name) {
        res.send(JSON.stringify({ isNew: true }));
        return;
    }
    if (!server_1.sessionMap.has(saveSessionId))
        return;
    const saveId = (0, crypto_1.randomUUID)();
    users.addProject(userId, { name: name, fileUUID: saveId }).then(user => {
        fs_1.default.cp(path_1.default.join(rootDirName, "cache", saveSessionId), path_1.default.join(rootDirName, "saved", saveId), { recursive: true }, (() => {
            try {
                res.status(200).json({ message: "sucsess", projectId: saveId });
            }
            catch (err) {
                if (err.code)
                    res.status(err.code).json({ message: err.message });
                else
                    res.status(401).json('error: ' + err);
            }
        }));
    }).catch(err => {
        res.status(500).json('error: ' + err);
    });
});
exports.router.get('/loadProject/:id', server_1.authMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    // const { name, sessionId:saveSessionId } = req.body;
    // console.log(saveSessionId)
    // if(!sessionMap.has(saveSessionId)) return
    // // sessionMap.get(saveSessionId).
    dbClient_1.default.project.findFirst({
        where: {
            id
        }
    }).then(project => {
        // res.json({project})
        // res.redirect('/editor?session=' + project?.fileUUID)
        fs_1.default.cp(path_1.default.join(rootDirName, "saved", project?.fileUUID), path_1.default.join(rootDirName, "cache", project?.fileUUID), { recursive: true }, (() => {
            res.status(200).json({ redirectTo: '/editor?save=' + project?.fileUUID });
        }));
    }).catch((err) => {
        res.status(401).send(err);
    });
});
exports.router.get('/listProjects', server_1.authMiddleware, (req, res) => {
    listAllProjects(users.getIdFromJWT(req)).then(json => {
        res.json(json);
    })
        .catch(err => {
        if (err.code)
            res.status(err.code).json({ message: err.message });
        else
            res.status(401).send(err); //json({message: 'error: ' + err})
    });
});
const passwordPagesPath = path_1.default.join(rootDirName, 'public', 'pages');
exports.router.get('/reset-password', async (req, res) => {
    if (req.query.email) {
        try {
            const email = req.query.email;
            await exports.transporter.verify();
            const token = jsonwebtoken_1.default.sign({ email }, privateKeyPem, { algorithm: 'RS256', expiresIn: '1h', issuer: 'intelegeinfo.ro' });
            var mailOptions = {
                from: 'Intelegeinfo <noreply@intelegeinfo.ro>',
                to: email,
                subject: 'Resetare Parola Intelegeinfo',
                // html: callbackFile,
                html: `
    <h3>Resetare parola</h3>
    <p>Aici este linkul tau de resetare a parolei:</p>

    <a href="https://intelegeinfo.ro/user/reset-password?token=${token}">Reseteaza parola</a>
    
    <p>Pentru orice intrebare va rugam sa ne contactati la 
    <a href="mailto://office@intelegeinfo.ro">office@intelegeinfo.ro</a></p>`,
            };
            exports.transporter.sendMail(mailOptions, (err, info) => {
                res.sendFile(path_1.default.join(passwordPagesPath, 'reset-password-confirm.html'));
            });
        }
        catch (err) {
            res.send('Am intampinat o problema..');
            console.error(err);
        }
    }
    else if (req.query.token) {
        const tokenString = req.query.token;
        const token = jsonwebtoken_1.default.verify(tokenString, privateKeyPem);
        const email = token.email;
        if (!token || !email) {
            res.status(401).send('Nu s-a putut verifica autetincitatea cererii. Incercati sa resetati parola inca o data.');
            return;
        }
        const file = fs_1.default.readFileSync(path_1.default.join(passwordPagesPath, 'reset-password-new.html')).toString();
        res.contentType('html').send(file.replaceAll('#{email}', email));
        return;
    }
    else
        res.sendFile(path_1.default.join(passwordPagesPath, 'reset-password.html'));
});
exports.router.post('/reset-password', async (req, res) => {
    if (req.query.token) {
        const tokenString = req.query.token;
        const token = jsonwebtoken_1.default.verify(tokenString, privateKeyPem);
        if (!token) {
            res.status(401).send('Nu s-a putut verifica autetincitatea cererii. Incercati sa resetati parola inca o data.');
            return;
        }
        const { password } = req.body;
        const hashedPassword = (0, signup_1.prepareEncrPassForDB)(password, false);
        console.log(hashedPassword);
        dbClient_1.default.user.update({
            where: {
                email: token.email
            },
            data: {
                password: hashedPassword
            }
        }).then(() => {
            res.sendFile(path_1.default.join(passwordPagesPath, 'reset-password-finish.html'));
        }).catch(err => {
            res.status(401).send('Am intampinat o problema...');
            console.error(err);
            return;
        });
        return;
    }
});
exports.router.get('/picture', async (req, res) => {
    const id = getIdFromJWT(req);
    if (id) {
        const user = await updateActiveAtForUser(id, { pictureUpload: true }); //getUserData
        if (!user) {
            (0, login_1.clearAuthCookies)(res).status(404).redirect('/');
            return;
        }
        if (user.picture.startsWith('http'))
            res.status(200).redirect(user.picture);
        else
            res.status(200).sendFile(path_1.default.join(rootDirName, `/server/users/uploads/${user.picture}`));
    }
});
exports.router.post('/picture', exports.upload.single('profilePicture'), async (req, res) => {
    try {
        const id = getIdFromJWT(req);
        if (!id)
            throw 'Please log in first.';
        const data = uploadFromFileData(req, id);
        if (!data)
            throw 'invalid data';
        dbClient_1.default.user.update({
            where: {
                id
            },
            data: {
                pictureUpload: createUploadFromFile(req, id),
            }
        }).then(val => {
            res.redirect('/profile');
        });
    }
    catch (error) {
        res.send(error);
    }
});
function activeAtComponent() {
    return { activeAt: new Date() };
}
async function updateActiveAtForUser(userId, include) {
    try {
        if (!userId)
            return false;
        return await dbClient_1.default.user.update({
            where: {
                id: userId
            },
            data: {
                ...activeAtComponent()
            },
            include
        });
    }
    catch (err) {
        return await dbClient_1.default.user.findFirst({
            where: {
                id: userId
            },
            include
        });
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
