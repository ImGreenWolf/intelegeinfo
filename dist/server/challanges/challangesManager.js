"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
router.use(body_parser_1.default.json());
exports.default = router;
const server_1 = require("../server");
const htmlPath = path_1.default.join(server_1.rootDirName, 'server', 'src', 'challanges', 'html');
router.get('/', (req, res) => {
    const classPath = path_1.default.join(server_1.rootDirName, 'public', 'editor.html'); //path.join(htmlPath, 'index.html')
    try {
        const text = fs_1.default.readFileSync(classPath).toString().split('\n');
        const index = text.findIndex(line => line.includes('</head>'));
        const out = [...text.slice(0, index), "<script src='/client/scripts/challanges/clientChallange.js' type='module'></script>", ...text.slice(index)].join('\n');
        res.contentType('html').send((0, server_1.parseText)(out, req));
    }
    catch (error) {
        console.warn(error);
        // res.contentType('html').send(parseText(fs.readFileSync(classPath).toString() , req))
    }
});
