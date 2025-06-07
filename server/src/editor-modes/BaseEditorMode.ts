import { ChildProcess } from "child_process";

// maybe change from class to interface
abstract class EditorMode {

    abstract name: string;
    abstract dockerFile: string;
    abstract dockerSafeTag: string
    abstract extension: string[]
    isInterpreter: boolean = false; // used for JIT languages like python or js
    abstract execute(res: any): ChildProcess
    abstract compile(res: any)
    onSpawn()
    {
        return;
    }
    constructor()
    {
        
    }

}

export default EditorMode