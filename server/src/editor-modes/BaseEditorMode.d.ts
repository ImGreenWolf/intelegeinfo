import { ChildProcess } from "child_process";
import { ClientObject, EditorFile, EditorSession } from "../types";
declare abstract class EditorMode {
    static name: string;
    static dockerFile: string;
    static dockerSafeTag: string;
    static extension: string[];
    static defaultText: string;
    isExecutable: boolean;
    runParams(clientObj: any): string;
    isInterpreter: boolean;
    abstract execute(res: any, clientObj: ClientObject, sessionObj: EditorSession): ChildProcess | Promise<ChildProcess>;
    abstract compile(res: any, file: EditorFile, isDebugging?: boolean): any;
    checkCodeSyntax: (sessionObj: EditorSession, file: EditorFile) => Promise<any>;
    shouldRebuild(sessionObj: EditorSession, clientObj: ClientObject): boolean;
    onSpawn(sessionObj: EditorSession): void;
    onBuild(res: any, clientSession: EditorSession): Promise<number> | number;
    startDebugging(res: any): ChildProcess;
    sendError(err: string, fatal?: boolean): void;
    constructor();
}
export default EditorMode;
