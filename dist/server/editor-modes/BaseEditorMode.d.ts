import { ClientObject, EditorFile, EditorSession } from "../types";
import DebugProcess from "./ProcessTypes";
import * as Nodepty from "node-pty";
export declare const executeOptions: {
    name: string;
    cols: number;
    rows: number;
};
declare abstract class EditorMode {
    static name: string;
    static logoSrc: string;
    static description: string;
    static color: string;
    static versions: any;
    static dockerFile: string;
    static dockerSafeTag: string;
    static extension: string[];
    static defaultText: string;
    static clientCompile: boolean;
    static isExecutable: boolean;
    runParams(clientObj: any): string;
    static isInterpreter: boolean;
    abstract execute(res: any, clientObj: ClientObject, sessionObj: EditorSession): Nodepty.IPty | Promise<Nodepty.IPty> | undefined;
    abstract directExecute(res: any, clientObj: any, sessionObj: any): any;
    abstract compile(res: any, file: EditorFile, isDebugging?: boolean): any;
    checkCodeSyntax: (sessionObj: EditorSession, file: EditorFile) => Promise<any>;
    shouldRebuild(sessionObj: EditorSession, clientObj: ClientObject): boolean;
    onSpawn(sessionObj: EditorSession): void;
    onBuild(res: any, clientSession: EditorSession, clientObj: ClientObject): Promise<number> | number;
    startDebugging(res: any, clientObj: any, sessionObj: any): DebugProcess;
    sendError(err: string, fatal?: boolean): void;
    constructor();
}
export default EditorMode;
