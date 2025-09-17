import { EditorWindowTab } from "./windowManager.js";
import xtermType from '@xterm/xterm';
declare class TerminalTab extends EditorWindowTab {
    prompt: string;
    terminal: xtermType.Terminal;
    constructor();
    write(data: string): void;
}
export default TerminalTab;
