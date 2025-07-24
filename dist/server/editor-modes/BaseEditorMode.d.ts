import { ChildProcess } from "child_process";
import { ClientObject, EditorFile, EditorSession } from "../types";
import DebugProcess from "./ProcessTypes";
declare abstract class EditorMode {
    static name: string;
    static logoSrc: string;
    static description: string;
    static versions: any;
    static dockerFile: string;
    static dockerSafeTag: string;
    static extension: string[];
    static defaultText: string;
    static clientCompile: boolean;
    static isExecutable: boolean;
    runParams(clientObj: any): string;
    static isInterpreter: boolean;
    abstract execute(res: any, clientObj: ClientObject, sessionObj: EditorSession): ChildProcess | Promise<ChildProcess> | undefined;
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
