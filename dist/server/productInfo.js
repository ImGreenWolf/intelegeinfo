"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
// import { rootDirName } from './server';
// import rootDirName from "./server"
const rootDirName = path_1.default.resolve("./");
const router = express_1.default.Router();
router.post('frame', (req, res) => {
    req.body;
});
exports.default = router;
