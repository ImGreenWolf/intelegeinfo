import { ChildProcess } from "child_process";
import EditorMode from "./BaseEditorMode";
import { EditorFile, EditorSession } from "../types";
import DebugProcess from "./ProcessTypes";
declare class CppMode extends EditorMode {
    static name: string;
    static logoSrc: string;
    static description: string;
    static extension: string[];
    static dockerSafeTag: string;
    static defaultText: string;
    static dockerFile: string;
    HandleClientInput(): void;
    constructor();
    execute(res: any): import("child_process").ChildProcessWithoutNullStreams;
    compile(res: any, file: EditorFile, isDebugging?: boolean): Promise<void>;
    startDebugging(res: any, clientObj: any): CPPDebugger;
    checkCodeSyntax: (sessionObj: EditorSession, file: EditorFile) => Promise<string>;
}
declare class CPPDebugger extends DebugProcess {
    sendCommand: (command: string) => void;
    onResponse: (response: any) => void;
    kill: () => void;
    addListener: (ev: any, func: (code: any) => void) => void;
    process: ChildProcess;
    constructor(res: any, clientObj: any);
}
export default CppMode;
