import EditorMode from "./BaseEditorMode";
declare class CppMode extends EditorMode {
    name: string;
    extension: string[];
    dockerFile: string;
    HandleClientInput(): void;
    constructor();
}
export default CppMode;
