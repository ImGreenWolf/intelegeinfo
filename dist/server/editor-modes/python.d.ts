import { ChildProcess } from "child_process";
import EditorMode from "./BaseEditorMode";
import { ClientObject, EditorSession } from "../types";
import * as Nodepty from "node-pty";
declare class Python extends EditorMode {
    static name: string;
    static logoSrc: string;
    static description: string;
    static color: string;
    static versions: any;
    static dockerSafeTag: string;
    static extension: string[];
    wsProxy: ChildProcess;
    isInterpreter: boolean;
    hasGUI: boolean;
    runParams: (clientObj: ClientObject) => string;
    static defaultText: string;
    static dockerFile: string;
    vcam: ChildProcess;
    onBuild(res: any, clientSession: EditorSession, clientObj: ClientObject): Promise<number>;
    receiveWebCam(rawData: any): void;
    execute(res: any, clientObj: ClientObject, sessionObj: EditorSession): Promise<Nodepty.IPty>;
    compile(res: any): void;
    onSpawn(sessionObj: any): void;
}
export default Python;
