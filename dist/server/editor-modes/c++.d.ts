import EditorMode from "./BaseEditorMode";
import { EditorFile, EditorSession } from "../types";
declare class CppMode extends EditorMode {
    static name: string;
    static extension: string[];
    static dockerSafeTag: string;
    static defaultText: string;
    static dockerFile: string;
    HandleClientInput(): void;
    constructor();
    execute(res: any): import("child_process").ChildProcessWithoutNullStreams;
    compile(res: any, file: EditorFile, isDebugging?: boolean): Promise<void>;
    startDebugging(res: any): import("child_process").ChildProcessWithoutNullStreams;
    checkCodeSyntax: (sessionObj: EditorSession, file: EditorFile) => Promise<string>;
}
export default CppMode;
