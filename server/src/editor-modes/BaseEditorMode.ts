import { ChildProcess } from "child_process";
import { EditorSession } from "../types";

// maybe change from class to interface
abstract class EditorMode {

    abstract name: string;
    abstract dockerFile: string;
    abstract dockerSafeTag: string
    abstract extension: string[]
    isInterpreter: boolean = false; // used for JIT languages like python or js
    abstract execute(res: any): ChildProcess | Promise<ChildProcess>
    abstract compile(res: any)
    onSpawn(sessionObj: EditorSession)
    {
        return;
    }
    onBuild(res, clientSession: EditorSession): Promise<number> | number
    {
        return 0;
    }
    constructor()
    {
        
    }

}

export default EditorMode