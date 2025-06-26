import EditorMode from "./BaseEditorMode";
class Text extends EditorMode {
    name = 'Text';
    extension = ['txt', ''];
    dockerSafeTag = 'txt';
    dockerFile = "";
    isExecutable = false;
    HandleClientInput() {
    }
    constructor() {
        super();
    }
    execute(res) {
        return undefined;
    }
    compile(res) {
    }
}
export default Text;
