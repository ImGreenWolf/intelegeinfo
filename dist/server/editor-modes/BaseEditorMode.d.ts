import { ChildProcess } from "child_process";
import { ClientObject, EditorSession } from "../types";
declare abstract class EditorMode {
    abstract name: string;
    abstract dockerFile: string;
    abstract dockerSafeTag: string;
    abstract extension: string[];
    isExecutable: boolean;
    runParams: (clientObj: any) => void;
    isInterpreter: boolean;
    abstract execute(res: any): ChildProcess | Promise<ChildProcess>;
    abstract compile(res: any): any;
    shouldRebuild(sessionObj: EditorSession, clientObj: ClientObject): boolean;
    onSpawn(sessionObj: EditorSession): void;
    onBuild(res: any, clientSession: EditorSession): Promise<number> | number;
    startDebugging(res: any): ChildProcess;
    constructor();
}
export default EditorMode;
