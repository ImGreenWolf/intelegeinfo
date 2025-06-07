// maybe change from class to interface
abstract class EditorMode {

    abstract name: string;
    abstract dockerFile: string;
    abstract extension: string[]
    abstract HandleClientInput();
    constructor()
    {
        
    }

}

export default EditorMode