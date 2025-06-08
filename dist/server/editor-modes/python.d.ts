import EditorMode from "./BaseEditorMode";
import { EditorSession } from "../types";
declare class Python extends EditorMode {
    name: string;
    dockerSafeTag: string;
    extension: string[];
    isInterpreter: boolean;
    runParams: string;
    dockerFile: string;
    onBuild(res: any, clientSession: EditorSession): Promise<number>;
    execute(res: any): Promise<import("child_process").ChildProcessWithoutNullStreams>;
    compile(res: any): void;
    onSpawn(sessionObj: any): void;
}
export default Python;
