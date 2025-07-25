import { EditorMode } from "./editor-modes";
import { EditorFile } from "./types";
export declare function transpileCode(client: any, openFile: EditorFile, TargetEditorMode: typeof EditorMode): Promise<string>;
