import { execSync, spawn } from "child_process";
import EditorMode from "./BaseEditorMode";

class Text extends EditorMode {

    name = 'Text'
    extension: string[] = ['txt', ''];
    dockerSafeTag: string = 'txt'
    dockerFile = ""
    isExecutable: boolean = false;

    HandleClientInput() {
    
    }

    constructor()
    {
        super()
    }

    execute(res) {
         return undefined;
    }

    compile(res) {
        
    }

    

}


export default Text


