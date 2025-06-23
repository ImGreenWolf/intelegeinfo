import { ChildProcess } from "child_process";
import { ClientObject, EditorFile, EditorSession } from "../types";

// maybe change from class to interface
abstract class EditorMode {

    static name: string;
    static dockerFile: string;
    static dockerSafeTag: string
    static extension: string[];
    static defaultText: string;
    isExecutable: boolean = true
    runParams(clientObj): string
    {
        return '';
    }
    isInterpreter: boolean = false; // used for JIT languages like python or js
    abstract execute(res: any, clientObj: ClientObject, sessionObj: EditorSession): ChildProcess | Promise<ChildProcess>
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
    onBuild(res, clientSession: EditorSession): Promise<number> | number
    {
        return 0;
    }
    startDebugging(res): ChildProcess
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