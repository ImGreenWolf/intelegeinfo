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
router.post('/update', (req, res) => {
    if (!users.getJWT(req)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const userId = users.getClientId(users.getJWT(req));
    if (!req.body) {
        res.status(500).send('invalid body');
        return;
    }
    if (req.body.file)
        var { file } = req.body;
    if (req.body.color)
        var { color } = req.body;
    try {
        if (req.body.deleteAccount) {
            dbClient_1.default.user.delete({
                where: {
                    id: userId
                }
            }).finally(() => {
                res.clearCookie('token').send('Contul tau a fost sters. Ne pare nespus de rau sa vedem ca pleci... Daca vrei sa ne lasi un mesaj, scrie-ne la adresa de email: office@intelegeinfo.ro');
                return;
            });
        }
        else {
            if (color) {
                var userColor = color.slice(1);
                if (userColor.length != 6 && color[0] == '#')
                    throw "invalid color";
            }
            dbClient_1.default.user.update({
                where: {
                    id: userId
                },
                data: {
                    userColor,
                    // picture: file ? file : undefined
                }
            }).then(value => {
                res.redirect('/profile');
            });
        }
    }
    catch (err) {
        res.status(500).send(err);
    }
});
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ redir: '/', message: "log out sucecsesfull!" });
});
router.use('/', (req, res) => {
    // const token = req.cookies.token
    if (!users.getJWT(req)) {
        res.status(401).redirect('/signup');
    }
    if (req.query.logout) {
        res.clearCookie('token');
        res.json({ redir: '/', message: "log out sucecsesfull!" });
    }
    else
        try {
            const userId = users.getClientId(users.getJWT(req));
            users.getUserData(userId).then(async (user) => {
                const params = user;
                const projects = await users.listAllProjects(userId);
                if (typeof projects == 'string') {
                    res.status(500).send('A aparut o problema...');
                    return;
                }
                console.log(projects);
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
                        res.clearCookie('token').status(401).json({ error: "Couldnt find account" });
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
