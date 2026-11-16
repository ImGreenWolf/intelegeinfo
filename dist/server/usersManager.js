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
exports.shareProject = shareProject;
exports.listAllProjects = listAllProjects;
exports.getClientJWTValue = getClientJWTValue;
exports.getClientId = getClientId;
exports.createUploadFromFile = createUploadFromFile;
exports.uploadFromFileData = uploadFromFileData;
exports.activeAtComponent = activeAtComponent;
exports.updateActiveAtForUser = updateActiveAtForUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
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
const FriendManager = __importStar(require("./friends/friendManager"));
updateTransporter();
setInterval(updateTransporter, 3600 * 1000);
const rootDirName = path_1.default.resolve("./"); //'C:\Users\radub_qd\intelegeinfo')
const privateKeyPem = fs_1.default.readFileSync(path_1.default.join(rootDirName, 'private.pem')) || "supersecretprivatekey";
// const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
exports.router = express_1.default.Router();
exports.router.use(body_parser_1.default.json());
// router.use(express.static("public/pages/login.html"))
const userNoPassword = prisma_1.Prisma.validator()({
    omit: { password: true, authId: true }
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
    let code = crypto_1.default.randomInt(0, 1000000).toString();
    if (code.length != 6)
        code = "0".repeat(6 - code.length) + code;
    return code;
}
function getJWT(req) {
    return req.cookies?.[server_1.tokenCookieName];
}
async function getUserData(id, include) {
    if (!id)
        return undefined;
    return await dbClient_1.default.user.findUnique({
        where: { id },
        omit: { password: true, authId: true },
        include: include
    });
}
function getIdFromJWT(req) {
    return getClientId(getJWT(req));
}
async function addProject(userId, projId, session, name) {
    return await dbClient_1.default.savedProject.create({
        data: {
            name: name,
            createdBy: {
                connect: { id: userId }
            },
            Project: getProjectInput(projId, session)
        }
    });
}
function getProjectInput(projId, session) {
    const data = {
        files: {
            createMany: {
                data: session.files.map(file => { return { name: file.name, content: file.content }; }),
                skipDuplicates: true
            }
        }
    };
    console.log(data.files.createMany.data);
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
        };
}
async function shareProject(userId, projId, session) {
    return await dbClient_1.default.sharedProject.create({
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
async function listAllProjects(userId) {
    return (await dbClient_1.default.$transaction([
        dbClient_1.default.savedProject.findMany({
            where: {
                creatorId: userId,
                folderId: {
                    equals: null
                }
            },
            include: {
                Project: true
            }
        }),
        dbClient_1.default.folder.findMany({
            where: {
                userId,
                parentFolderId: {
                    equals: null
                }
            },
            include: {
                _count: true
            }
        })
    ]));
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
    if (!userState || typeof userState !== 'object' || !['USER', 'ADMIN'].includes(userState.role) || userState.iss !== 'intelegeinfo.ro')
        return;
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
    if (!userState || typeof userState !== 'object' || !['USER', 'ADMIN'].includes(userState.role) || userState.iss !== 'intelegeinfo.ro')
        return;
    const userId = parseInt(userState.sub);
    if (!Number.isSafeInteger(userId) || userId <= 0 || String(userId) !== String(userState.sub))
        return;
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
exports.router.use('/social', FriendManager.default);
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
exports.router.get('/removeproject', (_req, res) => {
    // Legacy endpoint deleted the underlying project for every saved reference.
    res.status(405).send('Project deletion via GET is disabled.');
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
    if (!id || getIdFromJWT(req) !== id) {
        res.status(403).send('You can only verify your own email');
        return;
    }
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
            const hmacCode = hmacuUtil.generateHmac(`${user.id}:${user.email}:${code}`);
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
    if (!getIdFromJWT(req) || getIdFromJWT(req) !== Number(id)) {
        res.status(403).send('You can only verify your own email');
        return;
    }
    getUserData(parseInt(id)).then(user => {
        if (user.emailValidated)
            return res.send('Your account is already verified');
        if (hmacuUtil.verifyHmac(`${user.id}:${user.email}:${code}`, hmac)) {
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
    try {
        const { name, sessionId: saveSessionId, projectId } = req.body;
        const userId = users.getIdFromJWT(req);
        if (projectId && server_1.sqid.decode(projectId)[0]) {
            try {
                const session = server_1.sessionMap.get(saveSessionId);
                const proj = await dbClient_1.default.savedProject.findUnique({
                    where: {
                        id: server_1.sqid.decode(projectId)[0]
                    }
                });
                const foundProj = await dbClient_1.default.savedProject.update({
                    where: {
                        id: server_1.sqid.decode(projectId)[0]
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
                        Project: {
                            update: {
                                files: {
                                    upsert: session.files.map(file => {
                                        return {
                                            where: {
                                                name_projectId: {
                                                    name: file.name,
                                                    projectId: proj.projectId
                                                }
                                            },
                                            create: {
                                                name: file.name,
                                                content: file.content
                                            },
                                            update: {
                                                content: file.content
                                            }
                                        };
                                    }),
                                }
                            }
                        }
                    }
                });
                if (foundProj) {
                    if (foundProj.Project && foundProj.Project.files.length != 0)
                        await dbClient_1.default.savedProject.update({
                            where: {
                                id: server_1.sqid.decode(projectId)[0]
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
                        });
                    res.status(200).json({ isNew: false, message: "sucsess" });
                    return;
                }
            }
            catch (error) {
                console.error(error);
            }
        }
        else if (!name) {
            res.send({ isNew: true });
            return;
        }
        else {
            if (!server_1.sessionMap.has(saveSessionId)) {
                res.status(500).json({ message: "Sesiunea este invalida" });
                return;
            }
            const session = server_1.sessionMap.get(saveSessionId);
            const sessionProj = session.savedProject;
            //create new saved project
            const savedProj = await addProject(userId, sessionProj ? sessionProj.id : undefined, session, name);
            res.status(200).json({ message: "sucsess", projectId: server_1.sqid.encode([savedProj.id]) });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send((0, server_1.handlePrismaError)(error));
    }
});
exports.router.get('/shareProject', server_1.authMiddleware, async (req, res) => {
    try {
        const saveSessionId = req.query.sessionId;
        const userId = users.getIdFromJWT(req);
        if (!server_1.sessionMap.has(saveSessionId)) {
            res.status(500).json({ message: "Sesiunea este invalida" });
            return;
        }
        const session = server_1.sessionMap.get(saveSessionId);
        const sessionProj = session.savedProject;
        //create new saved project
        const sharedProj = await shareProject(userId, sessionProj ? sessionProj.id : undefined, session);
        res.status(200).json({ message: "sucsess", shareLink: `${req.secure ? 'https' : 'http'}://${req.host}/editor?share=${server_1.sqid.encode([sharedProj.id, sharedProj.projectId])}` });
    }
    catch (error) {
        console.error(error);
        res.status(500).send((0, server_1.handlePrismaError)(error));
    }
});
exports.router.get('/loadProject/:id', server_1.authMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
        await dbClient_1.default.savedProject.findUnique({
            where: {
                id: server_1.sqid.decode(id)[0]
            }
        });
        res.status(200).json({ redirectTo: '/editor?save=' + id });
    }
    catch (error) {
        res.send((0, server_1.handlePrismaError)(error));
    }
});
exports.router.get('/listProjects', server_1.authMiddleware, async (req, res) => {
    try {
        const explorer = await listAllProjects(getIdFromJWT(req));
        const folders = explorer[1].map(folder => { return { ...folder, folderId: server_1.sqid.encode([folder.folderId]) }; });
        const projects = explorer[0].map(proj => { return { ...proj, id: server_1.sqid.encode([proj.id]) }; });
        res.json({ folders, projects });
    }
    catch (err) {
        if (err.code)
            res.status(err.code).json({ message: err.message });
        else
            res.status(401).send(err); //json({message: 'error: ' + err})
    }
});
exports.router.get('/listProjects/content', server_1.authMiddleware, async (req, res) => {
    try {
        const userId = getIdFromJWT(req);
        const projects = await dbClient_1.default.savedProject.findMany({
            where: {
                creatorId: userId,
                folderId: {
                    equals: null
                }
            },
            include: {
                Project: {
                    include: {
                        files: {
                            take: 1
                        }
                    }
                }
            }
        });
        res.json({ projects: projects.map(proj => {
                return { ...proj, id: server_1.sqid.encode([proj.id]),
                    Project: { files: { ...proj.Project.files[0], content: proj.Project.files[0] ? proj.Project.files[0].content.substring(0, 500) : undefined } }
                };
            }) });
    }
    catch (err) {
        console.error(err);
        if (err.code)
            res.status(err.code).json({ message: err.message });
        else
            res.status(401).send(err); //json({message: 'error: ' + err})
    }
});
exports.router.post('/folder/create', server_1.authMiddleware, async (req, res) => {
    const { name, parentFolderUUID } = req.body;
    const userId = getIdFromJWT(req);
    try {
        const parentFolderId = parentFolderUUID ? server_1.sqid.decode(parentFolderUUID)[0] : undefined;
        const folder = await dbClient_1.default.folder.create({
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
        });
        res.status(200).json({ ...folder, folderId: server_1.sqid.encode([folder.folderId]), ParentFolder: { folderId: parentFolderUUID } });
    }
    catch (error) {
        res.send((0, server_1.handlePrismaError)(error));
    }
});
exports.router.post('/folder/f/:folderId/add', server_1.authMiddleware, async (req, res) => {
    const { saveUUID, folderUUID } = req.body;
    const userId = getIdFromJWT(req);
    const subDirectory = req.params.folderId != '_root';
    try {
        const parentFolderId = subDirectory ? server_1.sqid.decode(req.params.folderId)[0] : null;
        if (!parentFolderId && subDirectory)
            throw 'Invalid UUID';
        if (folderUUID) {
            const folderId = server_1.sqid.decode(folderUUID)[0];
            if (parentFolderId == folderId)
                throw 'folder recursiv';
            const changedFolder = await dbClient_1.default.folder.update({
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
            });
            res.status(200).json({ changedFolder });
            return;
        }
        const saveId = server_1.sqid.decode(saveUUID)[0];
        const changedFile = await dbClient_1.default.savedProject.update({
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
        });
        res.status(200).json({ changedFile });
    }
    catch (error) {
        console.error(error);
        res.status(500).send((0, server_1.handlePrismaError)(error));
    }
});
exports.router.get('/folder/f/:folderId', server_1.authMiddleware, async (req, res) => {
    const userId = getIdFromJWT(req);
    try {
        const folderId = server_1.sqid.decode(req.params.folderId)[0];
        if (!folderId)
            throw 'Invalid UUID';
        const folder = await dbClient_1.default.folder.findUnique({
            where: {
                userId,
                folderId
            },
            include: {
                Projects: true,
                ChildFolders: {
                    include: {
                        _count: true
                    }
                },
                ParentFolder: {
                    select: {
                        folderId: true,
                        name: true
                    }
                }
            }
        });
        enforceFolderResponse(folder, req, res);
    }
    catch (error) {
        console.error(error);
        res.send((0, server_1.handlePrismaError)(error));
    }
});
exports.router.post('/folder/f/:folderId/update', server_1.authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        const userId = getIdFromJWT(req);
        const folderId = server_1.sqid.decode(req.params.folderId)[0];
        if (!folderId)
            throw 'Invalid UUID';
        const folder = await dbClient_1.default.folder.update({
            where: {
                userId,
                folderId
            },
            data: {
                name
            },
            include: {
                Projects: true,
                ChildFolders: {
                    include: {
                        _count: true
                    }
                },
                ParentFolder: {
                    select: {
                        folderId: true,
                        name: true
                    }
                }
            }
        });
        enforceFolderResponse(folder, req, res);
    }
    catch (error) {
        console.error(error);
        res.send((0, server_1.handlePrismaError)(error));
    }
});
async function enforceFolderResponse(folder, req, res) {
    if (!folder) {
        const explorer = await listAllProjects(getIdFromJWT(req));
        const folders = explorer[1].map(folder => { return { ...folder, folderId: server_1.sqid.encode([folder.folderId]) }; });
        const projects = explorer[0].map(proj => { return { ...proj, id: server_1.sqid.encode([proj.id]) }; });
        res.json({ folders, projects });
        return;
    }
    const folders = folder.ChildFolders.map(folder => {
        return {
            ...folder,
            folderId: server_1.sqid.encode([folder.folderId]),
            parentFolderId: server_1.sqid.encode([folder.parentFolderId])
        };
    });
    const projects = folder.Projects.map(proj => { return { ...proj, id: server_1.sqid.encode([proj.id]) }; });
    res.status(200).json({
        folders,
        projects,
        ...folder,
        Projects: undefined, ChildFolders: undefined,
        folderId: req.params.folderId,
        ParentFolder: folder.ParentFolder ? { ...folder.ParentFolder,
            folderId: server_1.sqid.encode([folder.ParentFolder.folderId]) } : undefined,
        parentFolderId: folder.parentFolderId ? server_1.sqid.encode([folder.parentFolderId]) : undefined
    });
    return res;
}
exports.router.get('/folder/f/:folderId/content', server_1.authMiddleware, async (req, res) => {
    const userId = getIdFromJWT(req);
    try {
        const folderId = server_1.sqid.decode(req.params.folderId)[0];
        if (!folderId)
            throw 'Invalid UUID';
        const folder = await dbClient_1.default.folder.findUnique({
            where: {
                userId,
                folderId
            },
            include: {
                Projects: {
                    include: {
                        Project: {
                            include: {
                                files: {
                                    take: 1
                                }
                            }
                        }
                    }
                },
            }
        });
        const projects = folder.Projects.map(proj => {
            return { ...proj, id: server_1.sqid.encode([proj.id]),
                Project: { files: { ...proj.Project.files[0], content: trimFilePreview(proj.Project.files[0]) } }
            };
        });
        res.status(200).json({ projects, ...folder, Projects: undefined, ChildFolders: undefined, folderId: req.params.folderId,
            parentFolderId: folder.parentFolderId ? server_1.sqid.encode([folder.parentFolderId]) : undefined });
    }
    catch (error) {
        console.error(error);
        res.send((0, server_1.handlePrismaError)(error));
    }
});
function trimFilePreview(file) {
    if (!file)
        return undefined;
    return file.content.replaceAll(/^\s*\n/gm, '').substring(0, 200);
}
exports.router.post('/project/p/:projectId/update', server_1.authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        const userId = getIdFromJWT(req);
        const id = server_1.sqid.decode(req.params.projectId)[0];
        if (!id)
            throw 'Invalid UUID';
        const project = await dbClient_1.default.savedProject.update({
            where: {
                creatorId: userId,
                id,
            },
            data: {
                name
            },
            include: {
                Folder: {
                    include: {
                        Projects: true,
                        ChildFolders: {
                            include: {
                                _count: true
                            }
                        },
                        ParentFolder: {
                            select: {
                                folderId: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
        enforceFolderResponse(project.Folder, req, res);
    }
    catch (error) {
        console.error(error);
        res.send((0, server_1.handlePrismaError)(error));
    }
});
const passwordPagesPath = path_1.default.join(rootDirName, 'public', 'pages');
exports.router.get('/reset-password', async (req, res) => {
    if (req.query.email) {
        try {
            const email = req.query.email;
            await exports.transporter.verify();
            const token = jsonwebtoken_1.default.sign({ email, purpose: 'password-reset' }, privateKeyPem, { algorithm: 'RS256', expiresIn: '1h', issuer: 'intelegeinfo.ro' });
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
        if (!token || !email || token.purpose !== 'password-reset') {
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
        if (!token || token.purpose !== 'password-reset' || typeof token.email !== 'string') {
            res.status(401).send('Nu s-a putut verifica autetincitatea cererii. Incercati sa resetati parola inca o data.');
            return;
        }
        const { password } = req.body;
        const hashedPassword = (0, signup_1.prepareEncrPassForDB)(password, false);
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
    res.status(400).send('Reset token is required');
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
