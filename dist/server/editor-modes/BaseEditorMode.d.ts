declare abstract class EditorMode {
    abstract name: string;
    abstract dockerFile: string;
    abstract extension: string[];
    abstract HandleClientInput(): any;
    constructor();
}
export default EditorMode;
