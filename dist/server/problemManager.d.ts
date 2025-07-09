import { ClientObject, EditorSession } from "./types";
export declare function handleSucces(index: any, clientObj: ClientObject): void;
export declare function handleExecError(index: any, clientObj: ClientObject): void;
export type ProblemTest = {
    dataIn: string;
    dataOut: string;
};
export declare function createProblem(name: any, author: any, description: any, category: any, requirement: any, tests: ProblemTest[], editorSession: EditorSession, clientObj: ClientObject): Promise<void>;
export declare function testProblem(tests: ProblemTest[], clientObj: ClientObject, clientSession: any, res: any): Promise<Array<Record<string, any> | undefined>>;
export declare const router: import("express-serve-static-core").Router;
export default router;
