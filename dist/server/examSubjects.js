"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const server_1 = require("./server");
const fs_1 = __importDefault(require("fs"));
const subiecteFetcher_1 = require("./subiecteFetcher");
const router = express_1.default.Router();
exports.default = router;
router.get('/', async (req, res) => {
    const updates = await (0, subiecteFetcher_1.update)();
    const mainDir = updates.dir;
    let grid = '';
    if (mainDir) {
        const dateReg = /20\d*/g;
        for (const dir of fs_1.default.readdirSync(mainDir).sort((a, b) => a.includes('.') || b.includes('.') ? 0 : parseInt(b.match(dateReg)[0]) - parseInt(a.match(dateReg)[0]))) {
            if (dir.includes('.'))
                continue;
            let files = '';
            for (const file of fs_1.default.readdirSync(path_1.default.join(mainDir, dir)))
                files += `<a href='subiecte/file/${path_1.default.join(dir, file)}'>${file}</a><br>`;
            if (dir.match(dateReg) != undefined) {
                const title = dir.includes('model') ? "Modele" : dir.includes('ses_speciala') ? "Sesiune Speciala" : dir.includes('ses_iunie') || dir.includes('_iul') || dir.includes('_iun') ? "Sesiunea iunie-iulie" : "";
                grid += `<div><h2>${title} bac, anul ${(dir.match(dateReg)[0])}</h2>${files}</div>`;
            }
        }
    }
    let html = `
    <style>
    #grid
    {
        display: flex;
        gap: 50px;
        flex-wrap: wrap;
        padding: 50px;
        justify-content: space-between;
    }

    </style>
    <div id='grid'>
    ${grid}

    </div>
    
    
    
    `;
    res.status(200).send(html);
});
router.get('/file/:dir/:name', (req, res) => {
    res.sendFile(path_1.default.join(server_1.rootDirName, 'server', 'data', 'subiecte', req.params.dir, req.params.name));
});
