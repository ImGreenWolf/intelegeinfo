export declare class ProblemManager {
    private baseDir;
    constructor(baseDirectory?: string);
    private ensureBaseDirectory;
    createProblem(problemName: string, metadata?: Record<string, any>): string;
    private generateFolderName;
    listProblems(): string[];
}
declare const router: import("express-serve-static-core").Router;
export default router;
