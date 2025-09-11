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
exports.parseUserInfoInFile = parseUserInfoInFile;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dbClient_1 = __importDefault(require("./dbClient"));
const users = __importStar(require("./usersManager"));
const server_1 = require("./server");
const login_1 = require("./login");
const router = express_1.default.Router();
router.use(body_parser_1.default.json());
router.use((0, cookie_parser_1.default)());
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
router.post('/update', async (req, res) => {
    if (!users.getJWT(req)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const userId = users.getClientId(users.getJWT(req));
    if (!req.body) {
        res.status(500).send('invalid body');
        return;
    }
    //  if(req.body.file)
    //     var {file} = req.body
    //  if(req.body.color)
    //     var {color} = req.body
    //  if()
    try {
        var { occupationType, color, preferences } = req.body;
        if (req.body.deleteAccount) {
            dbClient_1.default.user.delete({
                where: {
                    id: userId
                }
            }).finally(() => {
                (0, login_1.clearAuthCookies)(res).send('Contul tau a fost sters. Ne pare nespus de rau sa vedem ca pleci... Daca vrei sa ne lasi un mesaj, scrie-ne la adresa de email: office@intelegeinfo.ro');
                return;
            });
        }
        else {
            if (color) {
                var userColor = color.slice(1);
                if (userColor.length != 6 && color[0] == '#')
                    throw "invalid color";
            }
            const currentUserData = await dbClient_1.default.user.findUnique({
                where: {
                    id: userId
                }
            });
            await dbClient_1.default.user.update({
                where: {
                    id: userId
                },
                data: {
                    userColor,
                    occupationType,
                    // picture: file ? file : undefined
                    preferences: preferences ? {
                        ...currentUserData.preferences,
                        ...preferences
                    } : undefined
                }
            });
            if (req.accepts('application/json'))
                res.send('Updated user info');
            else
                res.redirect('/profile');
        }
    }
    catch (err) {
        res.status(500).send(err);
    }
});
router.get('/logout', (req, res) => {
    (0, login_1.clearAuthCookies)(res);
    res.json({ redir: '/', message: "log out sucecsesfull!" });
});
router.use('/', (req, res) => {
    // const token = req.cookies.token
    if (!users.getJWT(req)) {
        res.status(401).redirect('/signup');
        return;
    }
    if (req.query.logout) {
        (0, login_1.clearAuthCookies)(res);
        res.json({ redir: '/', message: "log out sucecsesfull!" });
        return;
    }
    else
        try {
            const userId = users.getClientId(users.getJWT(req));
            users.updateActiveAtForUser(userId).then(async (user) => {
                if (!user) {
                    if (!res.headersSent)
                        res.status(401).redirect('/signup');
                    return;
                }
                const params = user;
                const projects = await users.listAllProjects(userId);
                if (user.preferences) {
                    const spotifyLink = user.preferences.spotify;
                    if (spotifyLink)
                        params.spotifyIframe = `
                            <iframe data-testid="embed-iframe" style="border-radius:1em; background-color: rgb(25,25,25); margin-top:2em;"
                                    src="https://open.spotify.com/embed/track/${spotifyLink}?theme=0" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
                            `;
                }
                if (typeof projects == 'string') {
                    res.status(500).send('A aparut o problema...');
                    return;
                }
                if (!projects || projects.length == 0)
                    params.projectsList = '<p class="empty-response">Nu ai creat niciun proiect</p>';
                else {
                    params.projectsList = '';
                    for (const project of projects) {
                        params.projectsList += `<a class="project" href="/editor?save=${project.fileUUID}"><h3>${project.name}</h3><button>x</button></a>`;
                    }
                }
                parseUserInfoInFile(userId, "public/pages/profile.html", params).then(file => {
                    res.send((0, server_1.parseText)(file, req));
                }).catch(err => {
                    if (err.userNoExist) {
                        (0, login_1.clearAuthCookies)(res).status(401).json({ error: "Couldnt find account" });
                    }
                    console.error('error parsing user info in file: ' + err.err);
                });
            });
            // }).catch(reason => {
            //     console.error('failed to get user data')
            // // throw 'failed to get user data ' + reason;
            // })
        }
        catch (err) {
            res.status(403).json({ error: err });
        }
});
exports.default = router;
function parseUserInfoInFile(userId, fileSrc, params) {
    return new Promise((resolve, reject) => {
        function replaceVariables(data, params) {
            const paramJSON = params;
            let file = data;
            for (const match of file.matchAll(/#{(.*)(?:\?)(.*):(.*)}|#{(.*)}/g)) {
                if (!(paramJSON[match[4]?.trim()] != undefined || paramJSON[match[1]?.trim()] != undefined)) // !! had to add !=undefined because it was pickuping up emailValidated = false and projectList = '' as invalid matches lmao.
                 {
                    console.log('couldnt find value for match ' + (match[4] ? match[4] : match[1]));
                    file = file.replace(match[0], '');
                }
                else {
                    // console.log(match)
                    if (match[2]) {
                        if (match[1])
                            file = file.replace(match[0], replaceVariables(match[2], params));
                        else
                            file = file.replace(match[0], replaceVariables(match[3], params));
                    }
                    else {
                        file = file.replace(match[0], paramJSON[match[4].trim()]);
                    }
                }
            }
            return file;
        }
        if (!params)
            users.getUserData(userId).then(user => {
                let file = fs_1.default.readFileSync(fileSrc).toString();
                resolve(replaceVariables(file, user));
            }).catch(err => {
                reject({ err, userNoExist: true });
            });
        else {
            let file = fs_1.default.readFileSync(fileSrc).toString();
            resolve(replaceVariables(file, params));
        }
    });
}
