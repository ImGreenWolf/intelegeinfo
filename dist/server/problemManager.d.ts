import { ClientObject, EditorSession } from "./types";
export declare function handleSucces(index: any, clientObj: ClientObject): void;
export declare function handleExecError(index: any, clientObj: ClientObject): void;
export type ProblemTest = {
    dataIn: string;
    dataOut: string;
    score: number;
    time: number;
};
export declare function createProblem({ name, author, description, difficulty, tags, category, requirement }: {
    name: any;
    author: any;
    description: any;
    difficulty: any;
    tags: any;
    category: any;
    requirement: any;
}, tests: ProblemTest[], editorSession: EditorSession, clientObj: ClientObject): Promise<void>;
export declare function testProblem(tests: ProblemTest[], clientObj: ClientObject, clientSession: any, res: any): Promise<PromiseSettledResult<{
    status: string;
    error: boolean;
    index: number;
    score: number;
    time?: number;
    result?: {
        input: string;
        output: string;
    };
} | undefined>[]>;
export declare const router: import("express-serve-static-core").Router;
export default router;
export declare function dateDeltaToString(date: Date, capitalize?: boolean, language?: string): string;
