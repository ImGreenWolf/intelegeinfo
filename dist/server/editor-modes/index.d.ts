import CppMode from "./c++";
export declare abstract class EditorMode {
    abstract name: any;
    abstract dockerFile: any;
    abstract HandleClientInput(): any;
}
export { CppMode };
