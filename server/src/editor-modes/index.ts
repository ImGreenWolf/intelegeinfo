
import EditorMode from "./BaseEditorMode";
import CppMode from "./c++";
import Python from "./python";

export const modes: EditorMode[] =
[
    new CppMode,
    new Python
]

export { EditorMode, CppMode, Python}