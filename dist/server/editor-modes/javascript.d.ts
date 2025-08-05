import { ChildProcess } from "child_process";
import EditorMode from "./BaseEditorMode";
import { ClientObject, EditorFile, EditorSession } from "../types";
import inspector from 'inspector';
import DebugProcess from "./ProcessTypes";
declare class javascript extends EditorMode {
    static name: string;
    static logoSrc: string;
    static description: string;
    static extension: string[];
    static dockerSafeTag: string;
    static defaultText: string;
    static dockerFile: string;
    static clientCompile: boolean;
    static isInterpreter: boolean;
    HandleClientInput(): void;
    constructor();
    compile(res: any, file: EditorFile, isDebugging?: boolean): any;
    execute(res: any, clientObj: ClientObject, sessionObj: EditorSession): ChildProcess | Promise<ChildProcess>;
    startDebugging(res: any, clientObj: ClientObject, sessionObj: EditorSession): JSDebugger;
}
declare class JSDebugger extends DebugProcess {
    sendCommand: (string: any) => void;
    kill: () => void;
    addListener: (ev: any, func: (code: any) => void) => void;
    addDataListener: (onDataFunc: typeof this.onResponse) => void;
    removeDataListener: (onDataFunc: typeof this.onResponse) => void;
    session: inspector.Session;
    constructor(clientObj: ClientObject, sessionObj: any);
}
export default javascript;
