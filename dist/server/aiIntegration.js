"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpileCode = transpileCode;
exports.guideTTS = guideTTS;
const openai_1 = __importDefault(require("openai"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const server_1 = require("./server");
const openai = new openai_1.default();
async function transpileCode(client, openFile, TargetEditorMode) {
    const original = openFile.editorMode.constructor.name;
    const target = TargetEditorMode.name;
    if (!original || !target)
        throw 'invalid language name';
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
    return response.output_text;
}
async function guideTTS(guide) {
    return (await textToSpeach(guide.name, guide.content, "You're a profesor teaching students on a website."));
}
async function textToSpeach(name, text, instructions) {
    const fileName = `${name}.mp3`;
    const speechFile = path_1.default.join(server_1.rootDirName, "server", "users", "uploads", fileName);
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "coral",
        input: text,
        instructions: instructions,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs_1.default.promises.writeFile(speechFile, buffer);
    return { buffer, speechFile, fileName };
}
