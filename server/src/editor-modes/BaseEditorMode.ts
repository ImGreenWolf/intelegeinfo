abstract class EditorMode {

    abstract name;
    abstract dockerFile;
    abstract HandleClientInput();
}

export default EditorMode