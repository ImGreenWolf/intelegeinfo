import EditorMode from "./BaseEditorMode";
import { EditorSession, EditorFile } from "../types";
declare class Text extends EditorMode {
    name: string;
    extension: string[];
    dockerSafeTag: string;
    dockerFile: string;
    isExecutable: boolean;
    checkCodeSyntax(sessionObj: EditorSession, file: EditorFile): void;
    HandleClientInput(): void;
    constructor();
    execute(res: any): any;
    compile(res: any): void;
}
export default Text;
