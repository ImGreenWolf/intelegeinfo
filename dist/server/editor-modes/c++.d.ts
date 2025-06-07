import EditorMode from "./BaseEditorMode";
declare class CppMode extends EditorMode {
    name: string;
    extension: string[];
    dockerFile: string;
    HandleClientInput(): void;
    constructor();
    execute(res: any): import("child_process").ChildProcessWithoutNullStreams;
    compile(res: any): void;
}
export default CppMode;
