import { execSync, spawn } from "child_process";
import EditorMode from "./BaseEditorMode";
import { EditorSession, EditorFile } from "../types";

class Text extends EditorMode {

    name = 'Text'
    extension: string[] = ['txt', ''];
    dockerSafeTag: string = 'txt'
    dockerFile = ""
    isExecutable: boolean = false;
    checkCodeSyntax(sessionObj: EditorSession, file: EditorFile) {
        return;
    }
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


