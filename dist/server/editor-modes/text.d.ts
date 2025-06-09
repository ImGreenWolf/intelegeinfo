import EditorMode from "./BaseEditorMode";
declare class Text extends EditorMode {
    name: string;
    extension: string[];
    dockerSafeTag: string;
    dockerFile: string;
    isExecutable: boolean;
    HandleClientInput(): void;
    constructor();
    execute(res: any): any;
    compile(res: any): void;
}
export default Text;
