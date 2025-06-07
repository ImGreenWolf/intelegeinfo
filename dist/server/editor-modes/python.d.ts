import EditorMode from "./BaseEditorMode";
declare class Python extends EditorMode {
    name: string;
    dockerSafeTag: string;
    extension: string[];
    isInterpreter: boolean;
    dockerFile: string;
    onBuild(res: any): void;
    execute(res: any): Promise<import("child_process").ChildProcessWithoutNullStreams>;
    compile(): void;
    onSpawn(sessionObj: any): void;
}
export default Python;
