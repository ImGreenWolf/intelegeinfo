"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHmac = generateHmac;
exports.verifyHmac = verifyHmac;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const rootDirName = path_1.default.resolve("./"); //'C:\Users\radub_qd\intelegeinfo')
const SECRET = fs_1.default.readFileSync(path_1.default.join(rootDirName, 'private.pem')) || "super_secret_key"; // Store securely in .env
function generateHmac(data) {
    return crypto_1.default.createHmac("sha256", SECRET).update(data).digest("hex");
}
function verifyHmac(data, hmac) {
    const expected = generateHmac(data);
    return crypto_1.default.timingSafeEqual(Buffer.from(expected), Buffer.from(hmac));
}
