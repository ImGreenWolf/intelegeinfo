"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
exports.getJWT = getJWT;
exports.getUserData = getUserData;
exports.getIdFromJWT = getIdFromJWT;
exports.addProject = addProject;
exports.getClientId = getClientId;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
// import cookieParser from 'cookie-parser'
const dbClient_1 = __importDefault(require("./src/routes/dbClient"));
const fs_1 = __importDefault(require("fs"));
const privateKeyPem = fs_1.default.readFileSync('../private.pem', 'utf8');
exports.router = express_1.default.Router();
exports.router.use(body_parser_1.default.json());
exports.router.use(express_1.default.static("public/pages/login.html"));
function getJWT(req) {
    return req.cookies.token;
}
function getUserData(id) {
    return new Promise((resolve, reject) => dbClient_1.default.user.findUnique({
        where: {
            id
        },
        include: {
            projects: true
        }
    }).then(user => {
        resolve(user);
    }).catch(err => {
        console.error('couldnt find user data!');
        reject(false);
    }));
}
function getIdFromJWT(req) {
    return getClientId(getJWT(req));
}
function addProject(id, data) {
    return new Promise((resolve) => {
        // prisma.user.findFirstOrThrow({
        //     where:
        //     {
        //         id
        //     },
        //     include: {
        //         projects: true,
        //       }
        // }).then(user => {
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
function getClientId(token) {
    if (!token)
        return; // throw {code: 401, message:'invalid token'};
    const userState = jsonwebtoken_1.default.verify(token, privateKeyPem);
    if (!userState)
        return; //throw {code: 401, message:'invalid state'};
    const userId = parseInt(userState.sub);
    if (!userId)
        return; //throw {code: 401, message:'couldnt get id'}
    return userId;
}
exports.default = dbClient_1.default;
exports.router.get('/checkLoggedIn', (req, res) => {
    if (getIdFromJWT(req) != undefined)
        res.status(200).send(true);
    else
        res.status(401).send(false);
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
exports.router.get('/profilePicture/:id', (req, res) => {
    const id = parseInt(req.params.id);
    dbClient_1.default.user.findUnique({
        where: {
            id
        }
    }).then(user => {
        res.status(200).sendFile('/');
    }).catch(err => {
        res.status(500).send('failed: ' + err);
    });
});
