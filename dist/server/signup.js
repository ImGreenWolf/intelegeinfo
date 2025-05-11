"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareEncrPassForDB = prepareEncrPassForDB;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const body_parser_1 = __importDefault(require("body-parser"));
const node_forge_1 = __importDefault(require("node-forge"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dbClient_1 = __importDefault(require("./dbClient"));
const login_1 = require("./login");
const path_1 = __importDefault(require("path"));
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
function onSignedIn(params, res, password) {
    const { email, username, loginMethod, firstName, lastName } = params;
    dbClient_1.default.user.create({
        data: {
            firstName,
            lastName,
            email,
            username,
            password,
            loginMethod
        }
    }).then((user) => {
        if (!user)
            res.status(400).json({ error: 'Failed to create user' });
        (0, login_1.onLoggedIn)(user, res);
        res.json({ message: "Sucess", redirect: 'user/verifyEmail', email: user.email, id: user.id });
    }).catch(reason => {
        res.status(400).json({ error: 'Failed to create user: ' + reason });
    });
}
function createUser(params, res, password) {
    const { email, name, loginMethod, } = params;
    dbClient_1.default.user.findUnique({
        where: {
            email
        }
    }).then((user) => {
        if (!user)
            onSignedIn(params, res, password);
        else
            return res.status(400).json({ error: 'An account with this email already exists! Try logging in!' });
    }).catch((reason) => {
        onSignedIn(params, res, password);
    });
}
function prepareEncrPassForDB(password) {
    const decryptedPassword = privateKey.decrypt(node_forge_1.default.util.decode64(password), 'RSA-OAEP');
    return bcryptjs_1.default.hashSync(decryptedPassword, 4);
}
// POST Signup
router.post('/', (req, res) => {
    const { loginMethod, password } = req.body;
    try {
        if (loginMethod === 'local') {
            const hashedPassword = prepareEncrPassForDB(password);
            // TODO: Compare decryptedPassword with stored password hash
            // console.log('Decrypted password:', decryptedPassword);
            createUser(req.body, res, hashedPassword);
        }
        else {
            createUser(req.body, res, password);
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
