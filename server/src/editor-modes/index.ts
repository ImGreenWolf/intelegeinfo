
import EditorMode from "./BaseEditorMode";
import CppMode from "./c++";
import Python from "./python";
import Text from "./text";
export const modes: EditorMode[] =
[
    new CppMode,
    new Python
]

export { EditorMode, Text, CppMode, Python, }