"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProblemManager = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ProblemManager {
    baseDir;
    constructor(baseDirectory = '../../public/problems') {
        this.baseDir = path_1.default.join(__dirname, baseDirectory);
        this.ensureBaseDirectory();
    }
    ensureBaseDirectory() {
        if (!fs_1.default.existsSync(this.baseDir)) {
            fs_1.default.mkdirSync(this.baseDir, { recursive: true });
        }
    }
    createProblem(problemName, metadata = {}) {
        const folderName = this.generateFolderName(problemName);
        const folderPath = path_1.default.join(this.baseDir, folderName);
        if (fs_1.default.existsSync(folderPath)) {
            throw new Error(`Problem folder already exists: ${folderName}`);
        }
        fs_1.default.mkdirSync(folderPath);
        const meta = {
            name: problemName,
            created: new Date().toISOString(),
            ...metadata,
        };
        fs_1.default.writeFileSync(path_1.default.join(folderPath, 'meta.json'), JSON.stringify(meta, null, 2));
        // Create empty solution file
        fs_1.default.writeFileSync(path_1.default.join(folderPath, 'solution.js'), `// Solution for: ${problemName}\n\n`);
        return folderPath;
    }
    generateFolderName(problemName) {
        // Generate a unique folder name with timestamp
        const timestamp = Date.now();
        const safeName = problemName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        return `${timestamp}-${safeName}`;
    }
    listProblems() {
        return fs_1.default.readdirSync(this.baseDir).filter((folder) => {
            const folderPath = path_1.default.join(this.baseDir, folder);
            return fs_1.default.statSync(folderPath).isDirectory();
        });
    }
}
exports.ProblemManager = ProblemManager;
const router = express_1.default.Router();
const manager = new ProblemManager();
// POST handler for form submission
router.post('/submit', (req, res) => {
    const { pname, description } = req.body;
    console.log('Received data:', { pname, description });
    try {
        manager.createProblem(pname, { description });
        res.send(`<h2>Uploaded ${pname}!</h2><p>Description: ${description}</p>`);
    }
    catch (error) {
        console.error('Error creating problem:', error);
        res.status(500).send('Failed to create problem');
    }
});
const MAIN_DIRECTORY = path_1.default.join('./', 'public', 'problems');
router.get('/getProblems', (req, res) => {
    fs_1.default.readdir(MAIN_DIRECTORY, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        try {
            // Filter for directories only
            const folders = files
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => ({
                name: dirent.name,
                path: `/public/problems/${dirent.name}`, // Adjust path as needed
                data: JSON.parse(fs_1.default.readFileSync(path_1.default.join(MAIN_DIRECTORY, dirent.name, 'meta.json'), 'utf8')),
            }));
            res.json(folders);
        }
        catch (error) {
            console.error('Error processing folders:', error);
            res.status(500).json({ error: 'Failed to process folders' });
        }
    });
});
exports.default = router;
