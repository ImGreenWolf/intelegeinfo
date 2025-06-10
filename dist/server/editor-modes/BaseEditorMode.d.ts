import { ChildProcess } from "child_process";
import { ClientObject, EditorFile, EditorSession } from "../types";
declare abstract class EditorMode {
    static name: string;
    static dockerFile: string;
    static dockerSafeTag: string;
    static extension: string[];
    isExecutable: boolean;
    runParams(clientObj: any): string;
    isInterpreter: boolean;
    abstract execute(res: any): ChildProcess | Promise<ChildProcess>;
    abstract compile(res: any): any;
    abstract checkCodeSyntax(sessionObj: EditorSession, file: EditorFile): any;
    shouldRebuild(sessionObj: EditorSession, clientObj: ClientObject): boolean;
    onSpawn(sessionObj: EditorSession): void;
    onBuild(res: any, clientSession: EditorSession): Promise<number> | number;
    startDebugging(res: any): ChildProcess;
    constructor();
}
export default EditorMode;
