import { EditorMode } from "./editor-modes";
import { EditorFile } from "./types";
import { Guide } from "../../generated/prisma";
export declare function transpileCode(client: any, openFile: EditorFile, TargetEditorMode: typeof EditorMode): Promise<string>;
export declare function guideTTS(guide: Guide): Promise<{
    buffer: Buffer<ArrayBuffer>;
    speechFile: string;
    fileName: string;
}>;
