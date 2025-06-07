import { EditorMode } from './';
declare class CppMode extends EditorMode {
    name: string;
    dockerFile: string;
    HandleClientInput(): void;
}
export default CppMode;
