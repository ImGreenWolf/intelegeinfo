import OpenAI from "openai";
import { EditorMode } from "./editor-modes";
import { EditorFile } from "./types";

export async function transpileCode(client, openFile: EditorFile, TargetEditorMode: typeof EditorMode)
{
    const original = openFile.editorMode.constructor.name
    const target = TargetEditorMode.name
    if(!original || !target)
        throw 'invalid language name'

    const aiclient = new OpenAI();

    const response = await aiclient.responses.create({
        model: "gpt-4o-mini",
        instructions: `
    You're a coding asistant that transpiles source code from the ${original} language to the ${target} language.
    Your response should only include the transpiled code and comments, but nothing else. Dont include \`\`\` or the language name - just the code.
    This should be code that can be run in a compiler/interpreter.
    Keep the transpiled code as close in function and form to the original source code as possible.
    Keep the transpilation as simple as possible. Dont fix the source code, just make sure it functions the same.
    `,
    temperature: 0.5,
    user: client.clientId,
    input: openFile.content
    
        });
    
    console.log(response.output_text);
    return response.output_text
        
    

    
}