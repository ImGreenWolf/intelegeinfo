import { ChildProcess } from "child_process";
import EditorMode from "./BaseEditorMode";
import { ClientObject, EditorSession } from "../types";
declare class Python extends EditorMode {
    static name: string;
    static dockerSafeTag: string;
    static extension: string[];
    isInterpreter: boolean;
    runParams: (clientObj: ClientObject) => string;
    static dockerFile: string;
    vcam: ChildProcess;
    onBuild(res: any, clientSession: EditorSession): Promise<number>;
    receiveWebCam(rawData: any): void;
    execute(res: any): Promise<import("child_process").ChildProcessWithoutNullStreams>;
    compile(res: any): void;
    onSpawn(sessionObj: any): void;
}
export default Python;
