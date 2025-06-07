import CppMode from "./c++";

export abstract class EditorMode {

    abstract name;
    abstract dockerFile;
    abstract HandleClientInput();
}

export { CppMode }