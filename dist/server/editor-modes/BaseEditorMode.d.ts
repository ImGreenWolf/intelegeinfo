import { ChildProcess } from "child_process";
declare abstract class EditorMode {
    abstract name: string;
    abstract dockerFile: string;
    abstract dockerSafeTag: string;
    abstract extension: string[];
    isInterpreter: boolean;
    abstract execute(res: any): ChildProcess;
    abstract compile(res: any): any;
    onSpawn(): void;
    constructor();
}
export default EditorMode;
