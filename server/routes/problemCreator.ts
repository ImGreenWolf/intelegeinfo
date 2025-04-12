import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export class ProblemManager {
    private baseDir: string;

    constructor(baseDirectory: string = '../../public/problems') {
        this.baseDir = path.join(__dirname, baseDirectory);
        this.ensureBaseDirectory();
    }

    private ensureBaseDirectory(): void {
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
    }

    public createProblem(problemName: string, metadata: Record<string, any> = {}): string {
        const folderName: string = this.generateFolderName(problemName);
        const folderPath: string = path.join(this.baseDir, folderName);

        if (fs.existsSync(folderPath)) {
            throw new Error(`Problem folder already exists: ${folderName}`);
        }

        fs.mkdirSync(folderPath);

        // Create metadata file
        interface Metadata {
            name: string;
            created: string;
            [key: string]: any;
        }

        const meta: Metadata = {
            name: problemName,
            created: new Date().toISOString(),
            ...metadata,
        };

        fs.writeFileSync(
            path.join(folderPath, 'meta.json'),
            JSON.stringify(meta, null, 2)
        );

        // Create empty solution file
        fs.writeFileSync(
            path.join(folderPath, 'solution.js'),
            `// Solution for: ${problemName}\n\n`
        );

        return folderPath;
    }

    private generateFolderName(problemName: string): string {
        // Generate a unique folder name with timestamp
        const timestamp = Date.now();
        const safeName = problemName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        return `${timestamp}-${safeName}`;
    }

    public listProblems(): string[] {
        return fs.readdirSync(this.baseDir).filter((folder) => {
            const folderPath = path.join(this.baseDir, folder);
            return fs.statSync(folderPath).isDirectory();
        });
    }
}

const router = express.Router();
const manager = new ProblemManager();

// POST handler for form submission
router.post('/submit', (req: Request, res: Response) => {
    const { pname, description } = req.body as { pname: string; description: string };
    console.log('Received data:', { pname, description });

    try {
        manager.createProblem(pname, { description });
        res.send(`<h2>Uploaded ${pname}!</h2><p>Description: ${description}</p>`);
    } catch (error) {
        console.error('Error creating problem:', error);
        res.status(500).send('Failed to create problem');
    }
});

const MAIN_DIRECTORY = path.join('./', 'public', 'problems');

router.get('/getProblems', (req: Request, res: Response) => {
    fs.readdir(MAIN_DIRECTORY, { withFileTypes: true }, (err, files) => {
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
                    data: JSON.parse(
                        fs.readFileSync(path.join(MAIN_DIRECTORY, dirent.name, 'meta.json'), 'utf8')
                    ),
                }));

            res.json(folders);
        } catch (error) {
            console.error('Error processing folders:', error);
            res.status(500).json({ error: 'Failed to process folders' });
        }
    });
});





export default router;