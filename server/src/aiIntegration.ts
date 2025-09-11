import OpenAI from "openai";
import { EditorMode } from "./editor-modes";
import { EditorFile } from "./types";
import path from "path";
import fs from 'fs';
import { rootDirName, sessionMap } from "./server";
import { Guide } from "../../generated/prisma";
import prisma from "./dbClient";
import { UUID } from "crypto";
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



export async function aiEvaluateExplenation(sessionId: UUID, clientId: UUID, problemId: number, explenation)
{
    const session = sessionMap.get(sessionId)
    if(!session)
        throw 'couldnt find session'
    const client = session.clients[0]//session.clientsMap.get(clientId)
    if(!client)
        throw 'invalid client'
    if(!client.clientData)
        throw 'Please login first!'
    const userId = client.clientData.id
    if(!userId)
        throw 'Invalid client data...'

    const problem = await prisma.problem.findUnique({
        where:
        {
            id: problemId
        },
        include:
        {
            solves: {
                where: {
                    userId
                }
            }
        }
    })
    // const successfulSolve = problem.solves.find(solve => solve.score === 100)
    // if(!successfulSolve)
    //     throw 'You have to sucessfully solve the problem first!'
    if(!problem)
        throw 'coudlnt find problem'

    const aiclient = new OpenAI();

    const response = await aiclient.responses.create({
        model: "gpt-4o-mini",
        instructions: `
        # Identity

        You're a teacher in Romania and corector for the Bacalaureat, evaluation explenations of informatics problem 
        for the online compiler and education platform, intelegeinfo.ro.
        You work to teach and push users to the corect path to solve problems efficiently and corectly,
        in a way so they learn the concepts behind it, not just copy-pasting or doing exactly what they're told.
        They must use their own problem solving skills.
        Your ultimate goal is to give the user an evaluation of their explenation in natural langauge only of the problem given and they knowledge.

        # Instructions

        *You will be given an explenation in natural langauge only of an algorithm, which you must give feedback on.
        *The problems are taken from the Romanian Bacalaureat.
        *You must give your response to conform with the bac programa.
        *Your explenation must be directed to the user, since it will be shown to them.
        *Think about how another teacher reviewing this explanation at the bacalaureat might grade it and say about it.
        *Dont give direct instructions on how to improve the explenation (only indirect, like "you could think about how..." or ")
        *DONT EVALUATE CODE, JUST THE DESCRIPTION OF THE CODE. If the user provides any computer code in the explenation, tell them they must provide an explenation, not source code.
        *THE EXPLENATION MUST BE GIVEN IN WORDS, NOT IN COMPUTER (C++, PYTHON, etc..) CODE. The purpose is to evaluate the explenation on how the user would go about
        solving this problem.

        `,
        input:
        `
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
    return response.output_text
    
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