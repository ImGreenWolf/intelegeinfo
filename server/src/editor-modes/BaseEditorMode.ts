import { ChildProcess } from "child_process";
import { ClientObject, EditorFile, EditorSession } from "../types";
import DebugProcess from "./ProcessTypes";
import * as Nodepty from "node-pty"



export const executeOptions = 
{
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: './clientFiles'
}

// maybe change from class to interface
abstract class EditorMode {

    static name: string;
    static logoSrc: string;
    static description: string;
    static color: string
    static versions

    static dockerFile: string;
    static dockerSafeTag: string
    static extension: string[];
    static defaultText: string;
    static clientCompile = false

    static isExecutable: boolean = true
    runParams(clientObj): string
    {
        return '';
    }
    static isInterpreter: boolean = false; // used for JIT languages like python or js
    abstract execute(res: any, clientObj: ClientObject, sessionObj: EditorSession): Nodepty.IPty | Promise<Nodepty.IPty> | undefined
    abstract compile(res: any, file: EditorFile, isDebugging?: boolean)
    checkCodeSyntax: (sessionObj: EditorSession, file: EditorFile) => Promise<any>

    shouldRebuild(sessionObj: EditorSession, clientObj: ClientObject)
    {
        return false;
    }
    onSpawn(sessionObj: EditorSession)
    {
        return;
    }
    onBuild(res, clientSession: EditorSession, clientObj: ClientObject): Promise<number> | number
    {
        return 0;
    }
    startDebugging(res, clientObj, sessionObj): DebugProcess
    {
        return
    }

    public sendError(err: string, fatal=false): void
    {
        console.error(err)
    }
    constructor()
    {
        
    }

}

export default EditorMode