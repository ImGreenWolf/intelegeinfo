"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpileCode = transpileCode;
exports.guideTTS = guideTTS;
exports.aiEvaluateExplenation = aiEvaluateExplenation;
const openai_1 = __importDefault(require("openai"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const server_1 = require("./server");
const dbClient_1 = __importDefault(require("./dbClient"));
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
async function aiEvaluateExplenation(sessionId, clientId, problemId, explenation) {
    const session = server_1.sessionMap.get(sessionId);
    if (!session)
        throw 'couldnt find session';
    const client = session.clients[0]; //session.clientsMap.get(clientId)
    if (!client)
        throw 'invalid client';
    if (!client.clientData)
        throw 'Please login first!';
    const userId = client.clientData.id;
    if (!userId)
        throw 'Invalid client data...';
    const problem = await dbClient_1.default.problem.findUnique({
        where: {
            id: problemId
        },
        include: {
            solves: {
                where: {
                    userId
                }
            }
        }
    });
    // const successfulSolve = problem.solves.find(solve => solve.score === 100)
    // if(!successfulSolve)
    //     throw 'You have to sucessfully solve the problem first!'
    if (!problem)
        throw 'coudlnt find problem';
    const aiclient = new openai_1.default();
    const response = await aiclient.responses.create({
        model: "gpt-4o-mini",
        instructions: `
        # Identity

        You're a teacher in Romania and corector for the Bacalaureat, evaluation explenations of informatics problem 
        for the online compiler and education platform, intelegeinfo.ro.
        You work to teach and push users to the corect path to solve problems efficiently and corectly,
        in a way so they learn the concepts behind it, not just copy-pasting or doing exactly what they're told.
        They must use their own problem solving skills.
        Your ultimate goal is to give the user an evaluation of their explenation of the problem given and they knowledge.

        # Instructions

        *You will be given an explenation of an algorithm, which you must give feedback on.
        *The problems are taken from the Romanian Bacalaureat.
        *You must give your response to conform with the bac programa.
        *Your explenation must be directed to the user, since it will be shown to them.
        *Think about how another teacher reviewing this explanation at the bacalaureat might grade it and say about it.
        *Dont give direct instructions on how to improve the explenation (only indirect, like "you could think about how..." or ")
        `,
        input: `
        *Name: ${problem.name}
        *Class Grade: ${problem.grade}
        *Problem Category: ${problem.category}
        *Problem Difficulty: ${problem.difficulty}
        *Problem Tags (separated by ,): ${problem.tags.join(', ')}
        *Description: ${problem.description}

        *Restrictions and requirements: 
        ${problem.requirement}

        *This is the user's explenation:
        ${explenation}
        `,
        temperature: 0.5,
        user: client.clientId,
        text: {
            format: {
                type: "json_schema",
                ...codeMentorExplainFeedback
            }
        }
    });
    console.log(response.output_text);
    return response.output_text;
}
const codeMentorExplainFeedback = {
    "name": "code_mentor_explain_feedback",
    "schema": {
        "type": "object",
        "properties": {
            "review": {
                "type": "string",
                "description": "The review of the user's explenation of the algorithm. Dont give a conclusion here.",
                "minLength": 10
            },
            "scoreConclusion": {
                "type": "object",
                "properties": {
                    "score": {
                        "type": "number",
                        "description": "Final score given to the explenation, on a 0 to 100 scale in increments of 5",
                        "minimum": 0,
                        "maximum": 100,
                        "multipleOf": 5
                    },
                    "conclusion": {
                        "type": "string",
                        "description": "Final overall evaluation and concise conclusion of the code, problem solving process, and progress.",
                        "minLength": 10
                    },
                },
                "required": [
                    "score",
                    "conclusion"
                ],
                "additionalProperties": false
            }
        },
        "required": [
            "review",
            "scoreConclusion"
        ],
        "additionalProperties": false
    },
    "strict": true
};
