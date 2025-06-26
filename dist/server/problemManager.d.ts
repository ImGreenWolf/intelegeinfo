import { ClientObject, EditorSession } from "./types";
export declare function handleSucces(index: any, clientObj: ClientObject): void;
export declare function handleExecError(index: any, clientObj: ClientObject): void;
export type ProblemTest = {
    dataIn: string;
    dataOut: string;
};
export declare function createProblem(name: any, tests: ProblemTest[], editorSession: EditorSession, clientObj: ClientObject): Promise<void>;
export declare function testProblem(tests: ProblemTest[], clientObj: any, clientSession: any, res: any, onSucces: (index: any, clientObj: any) => void, onFail: (index: any, clientObj: any) => void): void;
export declare const router: import("express-serve-static-core").Router;
export default router;
