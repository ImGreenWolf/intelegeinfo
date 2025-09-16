import EditorMode from "./BaseEditorMode";
import { ClientObject, EditorFile, EditorSession } from "../types";
import DebugProcess from "./ProcessTypes";
import * as nodepty from "node-pty";
declare class CppMode extends EditorMode {
    static name: string;
    static logoSrc: string;
    static description: string;
    static color: string;
    static extension: string[];
    static dockerSafeTag: string;
    static defaultText: string;
    static dockerFile: string;
    HandleClientInput(): void;
    constructor();
    execute(res: any): import("child_process").ChildProcessWithoutNullStreams;
    compile(res: any, file: EditorFile, isDebugging?: boolean): Promise<void>;
    startDebugging(res: any, clientObj: any, clientSession: any): CPPDebugger;
    checkCodeSyntax: (sessionObj: EditorSession, file: EditorFile) => Promise<string>;
}
declare class CPPDebugger extends DebugProcess {
    sendCommand: (command: string) => void;
    sendProgramInput: (command: any) => void;
    addDataListener: (onDataFunc: (data: string) => void) => void;
    removeDataListener: (func: any) => void;
    kill: (code: any) => void;
    addListener: (ev: any, func: (code: any) => void) => void;
    process: nodepty.IPty;
    clientSession: EditorSession;
    inputTerminal: nodepty.IPty;
    private dataListeners;
    constructor(res: any, clientObj: ClientObject, clientSession: EditorSession);
}
export default CppMode;
