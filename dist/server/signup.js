"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSignedIn = onSignedIn;
exports.prepareEncrPassForDB = prepareEncrPassForDB;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const body_parser_1 = __importDefault(require("body-parser"));
const node_forge_1 = __importDefault(require("node-forge"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dbClient_1 = __importDefault(require("./dbClient"));
const login_1 = require("./login");
const path_1 = __importDefault(require("path"));
const types_1 = require("./types");
const prisma_1 = require("../../generated/prisma");
const router = express_1.default.Router();
router.use(body_parser_1.default.json());
router.use(express_1.default.static("public/pages/signup.html"));
const rootDirName = path_1.default.resolve("./");
const privateKeyPem = fs_1.default.readFileSync(path_1.default.join(rootDirName, 'private.pem'), 'utf8') || "supersecretprivatekey";
const privateKey = node_forge_1.default.pki.privateKeyFromPem(privateKeyPem);
const publicKeyPem = fs_1.default.readFileSync(path_1.default.join(rootDirName, 'public.pem'), 'utf8') || "supersecretpublickey";
// function createToken(user: UserObject) {
//     return jwt.sign( 
//       { sub: user.id, username: user.username },
//       privateKeyPem,
//       { expiresIn: '1h' }
//     );
//   }
async function onSignedIn({ email, username, loginMethod, firstName, lastName, profile, type }, res, password, req, keepLoggedIn = true, tokenData) {
    return new Promise((resolve, reject) => {
        console.log(prisma_1.OccupationType[type] != undefined ? prisma_1.OccupationType[type] : prisma_1.OccupationType.None, type, prisma_1.OccupationType[type]);
        dbClient_1.default.user.create({
            data: {
                firstName,
                lastName,
                email,
                username,
                password,
                loginMethod,
                userColor: (0, types_1.randomHexColor)(),
                emailValidated: loginMethod == 'google',
                occupationType: prisma_1.OccupationType[type] != undefined ? prisma_1.OccupationType[type] : prisma_1.OccupationType.None,
                authId: tokenData != undefined ? tokenData : null,
                pictureUpload: {
                    connectOrCreate: {
                        where: {
                            path: profile ? profile : 'default.png'
                        },
                        create: {
                            path: profile ? profile : 'default.png'
                        }
                    }
                }
            },
            omit: {
                password: true
            }
        })
            .then((user) => {
            if (!user)
                reject({ error: 'Failed to create user' });
            console.log('created account', username);
            resolve({ json: { message: "Sucess", redirect: 'user/verifyEmail', email: user.email, id: user.id, loginMethod }, res: (0, login_1.onLoggedIn)(user, res, req, keepLoggedIn ? keepLoggedIn : true) });
        }).catch(reason => {
            reject({ error: 'Failed to create user: ' + reason });
        });
    });
}
function createUser(params, res, password, req) {
    const { email, username, loginMethod, type } = params;
    dbClient_1.default.user.findUnique({
        where: {
            email
        }
    }).then(async (user) => {
        if (!user) {
            const result = await onSignedIn(params, res, password, req, true);
            result.res.send(result.json);
        }
        else
            return res.status(400).json({ error: 'An account with this email already exists! Try logging in!' });
    }).catch(async (reason) => {
        const result = await onSignedIn(params, res, password, req, true);
        result.res.send(result.json);
    });
}
function prepareEncrPassForDB(password, decrypt = true) {
    const sanitisedPassword = password.trim();
    if (decrypt == true) {
        const decryptedPassword = privateKey.decrypt(node_forge_1.default.util.decode64(sanitisedPassword), 'RSA-OAEP');
        return bcryptjs_1.default.hashSync(decryptedPassword, 4);
    }
    else {
        return bcryptjs_1.default.hashSync(sanitisedPassword, 4);
    }
}
// POST Signup
router.post('/', (req, res) => {
    const { loginMethod, password } = req.body;
    try {
        if (loginMethod === 'local') {
            const hashedPassword = prepareEncrPassForDB(password, true);
            // TODO: Compare decryptedPassword with stored password hash
            // console.log('Decrypted password:', decryptedPassword);
            createUser(req.body, res, hashedPassword, req);
        }
        else {
            createUser(req.body, res, password, req);
        }
    }
    catch (err) {
        console.error('Decryption failed:', err);
        res.status(400).json({ error: 'Invalid encrypted password' });
    }
});
router.get('/public-key', (req, res) => {
    res.send(publicKeyPem);
});
exports.default = router;
