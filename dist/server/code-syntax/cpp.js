"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
router.post('/check-syntax', (req, res) => {
    const { filePath } = req.body;
    if (!filePath || typeof filePath !== 'string') {
        res.status(400).json({ error: 'Missing or invalid filePath' });
    }
    const absolutePath = path_1.default.resolve(filePath);
    if (!fs_1.default.existsSync(absolutePath)) {
        res.status(404).json({ error: 'File not found' });
    }
    const clang = (0, child_process_1.spawn)(`clang -fsyntax-only "${absolutePath}"`);
    clang.stdout.on('data', (data) => {
        console.log(data);
    });
});
