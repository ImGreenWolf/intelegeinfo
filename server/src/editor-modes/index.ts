
import EditorMode from "./BaseEditorMode";
import CppMode from "./c++";
import javascript from "./javascript";
import Python from "./python";
import Text from "./text";
export const modes: typeof EditorMode[] =
[
    CppMode,
    Python,
    javascript
]



export { EditorMode,  Text, CppMode, Python, javascript}



