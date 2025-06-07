import { ChildProcess } from "child_process";
import { EditorSession } from "../types";
declare abstract class EditorMode {
    abstract name: string;
    abstract dockerFile: string;
    abstract dockerSafeTag: string;
    abstract extension: string[];
    isInterpreter: boolean;
    abstract execute(res: any): ChildProcess | Promise<ChildProcess>;
    abstract compile(res: any): any;
    onSpawn(sessionObj: EditorSession): void;
    constructor();
}
export default EditorMode;
