import EditorMode from "./BaseEditorMode";
declare class Python extends EditorMode {
    name: string;
    dockerSafeTag: string;
    extension: string[];
    isInterpreter: boolean;
    dockerFile: string;
    execute(res: any): import("child_process").ChildProcessWithoutNullStreams;
    compile(): void;
    onSpawn(): void;
}
export default Python;
