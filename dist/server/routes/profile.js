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
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const users = __importStar(require("../../usersManager"));
const router = express_1.default.Router();
router.use(body_parser_1.default.json());
router.use((0, cookie_parser_1.default)());
// router.use(cookieParser())
// router.use(express.static("public/pages/profile.html"))
const privateKeyPem = fs_1.default.readFileSync('../private.pem', 'utf8');
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
    if (!users.getJWT(req)) {
        res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.query.logout) {
        res.clearCookie('token');
        res.json({ redir: '/', message: "log out sucecsesfull!" });
    }
    else
        try {
            // const userState = jwt.verify(token, privateKeyPem);
            // if(!userState) throw 'invalid token';
            // const userId= parseInt((userState as any).sub);
            // if(!userId) throw 'couldnt get id'
            const userId = users.getClientId(users.getJWT(req));
            users.getUserData(userId).then(user => {
                if (!user) {
                    res.clearCookie('token');
                    res.status(403).json({ error: 'sorry, it seems your account was deleted' });
                    throw 'invalid user';
                }
                let file = fs_1.default.readFileSync("public/pages/profile.html").toString();
                const paramJSON = {
                    username: user.name,
                    email: user.email,
                    role: user.role,
                    pfp: user.picture,
                };
                for (const param in paramJSON) {
                    // const rgx = new RegExp(`#{${param}}`)
                    file = file.replaceAll(`#{${param}}`, paramJSON[param]);
                }
                res.send(file);
            }).catch(reason => {
                console.error('failed to get user data');
                // throw 'failed to get user data ' + reason;
            });
        }
        catch (err) {
            res.status(403).json({ error: err });
        }
});
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ redir: '/', message: "log out sucecsesfull!" });
});
exports.default = router;
