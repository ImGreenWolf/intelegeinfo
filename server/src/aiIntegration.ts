import OpenAI from "openai";
import { EditorMode } from "./editor-modes";
import { EditorFile } from "./types";
import path from "path";
import fs from 'fs';
import { rootDirName } from "./server";
import { Guide } from "../../generated/prisma";
const openai = new OpenAI();

export async function transpileCode(client, openFile: EditorFile, TargetEditorMode: typeof EditorMode)
{
    const original = openFile.editorMode.constructor.name
    const target = TargetEditorMode.name
    if(!original || !target)
        throw 'invalid language name'

    

    const response = await openai.responses.create({
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

export async function guideTTS(guide: Guide)
{
    return (await textToSpeach(guide.name, guide.content, "You're a profesor teaching students on a website."))
}

async function textToSpeach(name, text, instructions?) {
    const fileName = `${name}.mp3`
    const speechFile = path.join(rootDirName, "server", "users", "uploads", fileName);

    const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "coral",
    input: text,
    instructions: instructions,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    return {buffer, speechFile, fileName}
}