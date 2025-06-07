import { EditorMode } from './';
declare class Python extends EditorMode {
    name: string;
    extension: string[];
    dockerFile: string;
    HandleClientInput(): void;
}
export default Python;
