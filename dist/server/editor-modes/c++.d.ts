import EditorMode from "./BaseEditorMode";
import { sessionObj } from "../types";
declare class CppMode extends EditorMode {
    static name: string;
    static extension: string[];
    static dockerSafeTag: string;
    static dockerFile: string;
    HandleClientInput(): void;
    constructor();
    execute(res: any): import("child_process").ChildProcessWithoutNullStreams;
    compile(res: any): void;
    startDebugging(res: any): import("child_process").ChildProcessWithoutNullStreams;
    checkCodeSyntax(sessionObj: sessionObj): Promise<string>;
}
export default CppMode;
