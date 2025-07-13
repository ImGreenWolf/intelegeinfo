import { UUID } from "crypto";
import prisma from "./dbClient";
import { ClientObject, EditorSession } from "./types";
import { Writable } from 'node:stream';
export function handleSucces(index, clientObj: ClientObject)
{
    clientObj.sendMessage({index, succes: true})
}
export function handleExecError(index, clientObj: ClientObject)
{
    clientObj.sendMessage({index, succes: false})
}


const problemCreator: Map<UUID, ProblemCreator> = new Map();
class ProblemCreator {
    editorSession: EditorSession;

}

export type ProblemTest = {
    dataIn: string,
    dataOut: string,
    score: number,
    time: number,
}

export async function createProblem({name, author, description, difficulty, tags, category, requirement}, tests: ProblemTest[], editorSession: EditorSession, clientObj: ClientObject, )
{
    // const problemManager = problemCreator.get(editorSession.sessionId)
    // if(!editorSession.sessionContainer)
    //     console.error('no running container')
    // const imgName = editorSession.sessionContainer

    // await clientObj.openFile.editorMode.compile(imgName, clientObj.openFile, false)
    let i = 0;
    // testProblem(tests, clientObj, editorSession, imgName, () => i++, (index) => console.error('failed test ', index))
    let testPromises: Promise<{output: string, time?: number}>[] = []
    const testFile = clientObj.openFile[0]
    execSync(`g++ -O0 ${testFile.filePath} -o ${path.dirname(testFile.filePath)}/${testFile.name.split('.')[0]}.exe`)
    
    tests.forEach(async (test, i) => 
    {
        testPromises.push(new Promise((resolve, reject) => {
            const stdin = test.dataIn.toString()
            const expectedStoud = test.dataOut !==undefined ? test.dataOut : undefined
            let outputBuffer = '';
            
                
            const pipeStream = new Readable()

            let startDate = undefined;
            const program = spawn(`${path.dirname(testFile.filePath)}/${testFile.name.split('.')[0]}.exe`, {stdio: 'pipe', shell: true, timeout: 5000})
            program.on('spawn', () => {
                console.log('test started')
                pipeStream.pipe(program.stdin)
                pipeStream.push(stdin)
                pipeStream.push(null)
                // program.stdin.pipe(input)
                startDate = Date.now()

            })
            

            program.stdout.addListener('data', (data) => {
                outputBuffer += data.toString()
            })

            program.on('error', (err) => {
                console.error('test gave an error:', err)
            })
            program.on('close', (code) => {
                // if(code == null)
                // {
                //     reject(console.error('test ' +i + ' timed out'))
                // }
                console.log('test finished', outputBuffer)
                if(code != 0 && code)
                    reject(console.error('failed runtime error ', code, 'on test ' +i))

                if(expectedStoud === undefined)
                    resolve({output: outputBuffer, time: startDate? Date.now() - startDate : undefined})
                else
                if(outputBuffer === expectedStoud)
                {
                    console.log('passed test',i,"Given input:",stdin,'output:',expectedStoud)
                    i++
                    resolve({output: expectedStoud, time: startDate? Date.now() - startDate : undefined})
                }
                else 
                reject(console.error('failed test ', i, 'Expected output:',expectedStoud,'actual output: ', outputBuffer))
            })
        }))
        
    })
    Promise.allSettled(testPromises)
    .catch(err => {
        console.error('Test failed.', err)
    })
    .then((output) => {
        // if(i !== tests.length)
        //     {console.error('some tests failed', i, "out of", tests.length)
        //     return }
        let time = 0;
        let timeIndex = 0
        tests.forEach((val, index) => {
            //@ts-ignore
            const value = (output)[index].value
            if(value)
            //@ts-ignore
            tests[index].dataOut = value.output
            tests[index].time = value.time ? value.time : -1
            if(value.time)
            {
                time += value.time;
                timeIndex++;
            }
        })
        const sourceCode = testFile.content;
        prisma.problem.create({
            data: {
                name: name || "unnamed",
                author,
                category,
                description,
                requirement,
                tests,
                difficulty,
                tags: (tags as string).split(',').map(val => val.trim()),
                sourceCode, 
                averageMemLimit: 0,
                averageTimeLimit: time/timeIndex
            }
        }).then(problem => {
            console.log(problem)
        })
    })
    

    


    
}

export function  testProblem(tests:  ProblemTest[], clientObj: ClientObject,clientSession, res):
 Promise<PromiseSettledResult<{status: string, error: boolean, index: number, score: number, time?: number,  result?: {input: string, output: string}} | undefined>[]>
{
    const promises = []
    console.log('starting tests')

    if(process.env.NODE_ENV=="development")
        execSync(`g++ -O0 ${clientObj.openFile[0].filePath} -o ${path.dirname(clientObj.openFile[0].filePath)}/${clientObj.openFile[0].name.split('.')[0]}.exe`)
    // console.log('finished compile')
    tests.forEach(async (test, i) => 
    {
        promises.push(new Promise<Record<string, any> | undefined>(async (resolve, reject) => {
            const stdin = test.dataIn
            const expectedStoud = test.dataOut
            let outputBuffer = ''
            const program = process.env.NODE_ENV=="development" ? spawn(`${path.dirname(clientObj.openFile[0].filePath)}/${clientObj.openFile[0].name.split('.')[0]}.exe`, {stdio: 'pipe', shell: true, timeout: 5000}) : await clientObj.openFile[0].editorMode.execute(res, clientObj, clientSession)

            const pipeStream = new Readable()
            let startTime;
            program.addListener('spawn', () => {
                pipeStream.pipe(program.stdin)
                pipeStream.push(stdin)
                pipeStream.push(null)
                console.log("Test started")

                startTime = Date.now()
            })
  
            program.stdout.addListener('data', (data) => {
                outputBuffer += data.toString()
            })

            program.on('close', (code) => {
                console.log('test finished')
                if(code != 0)
                    resolve({status: "Program returned non-zero status code!", error: true, index: i, score: 0})
                else if(outputBuffer.trim() === expectedStoud.trim())
                    resolve({status: "Corect.", error: false, index: i, score: test.score || 100 / tests.length, time: startTime ?  Date.now() - startTime : undefined})
                else
                    resolve({status: "Programul nu a returnat rezultatul corect!", error: true, index: i, score: 0, result: (i <= 2 ? {input: stdin, output: outputBuffer, expectedOutput: expectedStoud} : undefined)}) // TODO Determine if i should leave expected output
            })
        }))
        
    })

    return Promise.allSettled(promises)
}


import express from 'express';
import { rootDirName, sessionMap } from "./server";
import { execSync, spawn } from "child_process";
import path from "path";
import { Readable } from "stream";
export const router = express.Router();



router.post('/create', (req, res) => {
    try {
        const data = req.body
        const tests: ProblemTest[] = data.tests
        const session = sessionMap.get(data.sessionId)
        if(!session)
            throw 'couldnt find session'
        const client = session.clientsMap.get(data.clientId)
        if(!client)
            throw 'couldnt find client'

        if(!data.name)
            throw 'invalid name'

        createProblem(data, tests, session, client)
        res.status(200).send(tests[0].dataIn)
    }
    catch(err)
    {
        res.status(500).send(err)
    }
    
})


router.get('/:sessionId/test/:problemId', (req, res) => {
    try {
        if(!req.params.sessionId)
            throw 'invalid session id'

        const problemId = parseInt(req.params.problemId)
        if(!problemId)
            throw 'invalid problem id'
        const session = sessionMap.get(req.params.sessionId as UUID) 
        if(!session)
            throw 'couldnt find session'

        // const client = session.clientsMap.get(data.clientId)
        // if(!client)
        //     {
        //         console.error('couldnt find client', session.clientsMap)
        //         throw 'Couldnt find client'
        //     } 
        if(!session.executeProblemChecker)
            throw 'No problem checker...'
        const client = session.clients[0];
        session.executeProblemChecker(problemId)
        .then((testResults) =>  {
            // testResults is an array of PromiseSettledResult objects
            console.log('Testing finished, results:', testResults)
            let score = 0;
            let time = 0;
            let timeIndex = 0;
            for(const testResult of testResults) 
                if (testResult.status === "fulfilled" && testResult.value) 
                {
                    const result = testResult.value;
                        score += result.score;
                    if(result.time)
                    {
                        time += result.time;
                        timeIndex++;
                    }
                }
            const solve = {
                userId: client.clientData.id,
                score: score,
                sourceCode: client.openFile[0].content,
                time: time ? time/timeIndex : -1
            }
            prisma.problem.update({
                where: {
                    id: problemId
                },
                data:
                {
                    solves: {
                        create:
                        {
                            ...solve
                        }
                    }
                },
                
            }).then(problem => res.status(200).send({results: testResults, solve}))
            
                
            
            
        })
        // .catch((err) =>  res.status(500).send({error: err || true, result: false}))
       
        
        // createProblem(data.name, data.author, data.description, data.category, data.requirement, tests, session, client)
       
    }
    catch(err)
    {
        res.status(500).send({err: err || "Unexpected error", result: false})
    }
    
})



router.get('/random', async (req, res) => {
    const length = await prisma.problem.count()
    const problem = await prisma.problem.findUnique({
        where:
        {
            id: Math.floor  (Math.random() * length) + 1
        }
    })

    res.send(problem)
})


router.get('/page', async (req, res) => {

    const problems = await prisma.problem.findMany({
        take: 10
    })

    res.send(problems)
})
import fs from 'fs';
import { error } from "node:console";
import * as users from './usersManager'
// import cookieParser from "cookie-parser";
router.get('/:sessionId/details/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    const sessionId = req.params.sessionId as UUID
    const userId = users.getClientId(req.cookies.token)
    if(!id)
        throw 'invalid id';
    const problem = await prisma.problem.findUnique({
        where: {
            id
        },
        include:
        {
            solves:
            {
                take: 5,
                orderBy:
                {
                    uploadedAt: "desc"
                },
                where:
                {
                    userId: userId ? userId : 0
                },
                
            },
            _count: {
                select: {solves: true}
            }
        }
    })
    if(!problem)
        throw 'couldnt find problem.'
    
    let fileBuffer = fs.readFileSync(path.join(rootDirName, 'public', 'pages', 'problemTemplate.html')).toString()

    if(fileBuffer === undefined)
        throw 'File buffer is invalid'

    const serverSideReplace = (template: string, data) =>
        template.replace(/\${(\w*|.*)}/g, (_,key: string) => 
        {
            const params = key.split('.')
            const reg = /(.*)\[(\d*)\]/
            for(let i=0; i<params.length;i++ ) {
                const param = params[i];
                if(param)
                {
                    const match = param.match(reg)
                    if(match)
                    {
                        params[i] = match[1]
                        params.splice(++i, 0, match[2])
                    }
                        
                }
                
            }
            let buffer = data[params[0]]
            let i = 1;
            while(i<params.length)
                buffer = buffer[params[i++]]
            
            return buffer;
        })
    
    
    const solvesUI = problem.solves ? problem.solves.map(solve => `<div><span class="${['bad', 'decent','good', 'perfect'][Math.round(solve.score/25)- (solve.score==0 ? 0 : 1)]}">${solve.score}</span> ${dateDeltaToString(solve.uploadedAt)}`).join('\n') : ''

    res.send(serverSideReplace(fileBuffer, {json: {...problem, difficulty: problem.difficulty ? problem.difficulty : ''}, sessionId, html: {solvesUI}}))
})



export default router

import OpenAI from "openai";
import { Prisma } from "../../generated/prisma";


router.get('/:sessionId/details/:id/evaluate', async (req, res) => {

    res.send(await aiEvaluateSource(req.params.sessionId as UUID, undefined, parseInt(req.params.id)))
})


async function aiEvaluateSource(sessionId: UUID, clientId: UUID, problemId: number)
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
    const successfulSolve = problem.solves.find(solve => solve.score === 100)
    if(!successfulSolve)
        throw 'You have to sucessfully solve the problem first!'
    if(!problem)
        throw 'coudlnt find problem'

    const aiclient = new OpenAI();

    const response = await aiclient.responses.create({
        model: "gpt-4o-mini",
        instructions: `
# Identity

You're a silicon valley computer science meontor and a coding assistant for the online compiler and education platform, intelegeinfo.ro.
You work to teach and push users to the corect path to solve problems efficiently and corectly,
in a way so they learn the concepts behind it, not just copy-pasting or doing exactly what they're told.
They must use their own problem solving skills.
Your ultimate goal is to evaluate the source code provided by the user to solve the given problem.

# Instructions

*Give concise, constructive feedback if you determine it's needed.
*Give a final score from 0 to 100, based on factors such as speed, efficiency, if it actually solves the problem and ingenuity.
*Give a structured response (1. what they did best, 2. what they should improve, 3. suggestions, 4. final score and conclusion)
*Dont give the user refactored source code, they have to do it themselves so they learn.
*Your response should be in Romanian.
*Your must follow the Romanian programa for computer science for each problem's class grade, dont press too much on concepts the user might not know, but make sure they are aware of them, push them to learn more about them. For example, if there's a trick they can do to improve their code, tell them.
*Dont give false information, bad feedback or inaccurate grades.
*Dont give follow-up questions.
*The awnser should be addressed directly to the user.
*Dont give meta-details, such as what class the user is - they already know.
*Breakdown the final score to the user by categories, so they know exactly why it was given to them. MAKE SURE THEY ADD UP TO THE FINAL SCORE
*The input will ALWAYS be within the restrictions and requirements of the problem, it's not necesary to validate the input to make sure it's within them, so dont take points for that.
*Don't focus too much on the clarity of the source code, dont press about comments.
*If the code doesn't need improving, say so. Don't suggest the user to make the code prettier, such as adding new lines or comments, or to pointlesly validate input or output.
*Don't tell the user to add unecessary input or output.
`,
input:
`
*Name: ${problem.name}
*Class Grade: 9
*Description: ${problem.description}

*Restrictions and requirements: 
${problem.requirement}

*User received the maximum score on the automated tests.
*This code's input and output will be managed by automated tests.
*User's source code:
${client.openFile[0].content}

`,
temperature: 0.5,
user: client.clientId,
text: {
    format: {
        type: "json_schema",
        ...codeMentorFeedback
    }
}

    });

    console.log(response.output_text);
    return response.output_text
    
}

const codeMentorFeedback = {
  "name": "code_mentor_feedback",
  "schema": {
    "type": "object",
    "properties": {
      "positives": {
        "type": "string",
        "description": "A summary of what the user did best in their code or approach. Focus on strengths and positive aspects.",
        "minLength": 10
      },
      "improvements": {
        "type": "string",
        "description": "A summary of areas where the user can improve their code or problem solving. Focus on habits, logic, or concepts.",
        "minLength": 10
      },
      "suggestions": {
        "type": "string",
        "description": "Actionable suggestions for the user to become a better problem solver and programmer. Prompt self-reflection and encourage conceptual learning.",
        "minLength": 10
      },
      "scoreConclusion": {
        "type": "object",
        "properties": {
          "score": {
            "type": "number",
            "description": "Final score given to the source code, on a 0-100 scale in increments of 5.",
            "minimum": 0,
            "maximum": 100,
            "multipleOf": 5
          },
          "conclusion": {
            "type": "string",
            "description": "Final overall evaluation and concise conclusion of the code, problem solving process, and progress.",
            "minLength": 10
          },
         "score_reasons": {
            "type": "array",
            "description": `Breakdown the final score into 4 categories (or add one or two if you think it's necesary):
            Functionality (Correctness: Does it meet all the problem requirements?, Are edge cases handled properly?),
            Efficiency (Is the algorithm optimized for time and space, if the problem specifies it?, Are there unnecessary computations or memory allocations? Does the program scale well with large inputs?),
            Algorithmic Complexity (Is the algorithm well-chosen for the problem (e.g., not brute force when a better solution exists)?,
                Does the implementation demonstrate understanding of algorithmic principles?,
                Is the solution optimal or near-optimal in terms of time and space complexity?),
             Code Quality (: Are meaningful variable and function names used?, Is the code well-organized and easy to read?), to show the user how it was given. Make sure they add up to the final score.`,
            "items": 
            {
                "type": "object",
                "properties": 
                {
                    "score": {
                        "type": "number",
                        "description": "The part of the final score given for this reason, make sure all of them add up to the final score",
                        "minimum": 0,
                        "maximum": 100,
                        "multipleOf": 5
                    },
                    "reason": {
                        
                    "type": "string",
                    "minLength": 5,
                    "description": "One supporting reason for the assigned score, clearly and specifically stated."
                    
                    }
                },
                "required": [
                    "score",
                    "reason",
                ],
                "additionalProperties": false
            }
            
          }
        },
        "required": [
          "score",
          "conclusion",
          "score_reasons"
        ],
        "additionalProperties": false
      }
    },
    "required": [
      "positives",
      "improvements",
      "suggestions",
      "scoreConclusion"
    ],
    "additionalProperties": false
  },
  "strict": true
};

function dateDeltaToString(date: Date)
{
    
    const delta = new Date() 
    const now = date
    console.log(date.getTime(), Date.now(), Date.now() - date.getTime(), delta.toDateString())
    if(delta.getUTCFullYear() - now.getUTCFullYear()>=1)
        return `${delta.getUTCFullYear()  - now.getUTCFullYear()} years ago`
    else if(delta.getUTCMonth() -  now.getUTCMonth()>= 1)
        return `${delta.getUTCMonth() -now.getUTCMonth()} months ago`
    else if(delta.getDay() - now.getDay()>= 1)
        return `${delta.getDay() - now.getDay()} days ago`
    else if(delta.getHours() - now.getHours()>= 1)
        return `${delta.getHours() - now.getHours()} hours ago`
    else if(delta.getMinutes() - now.getMinutes()>= 1)
        return `${delta.getMinutes() - now.getMinutes()} minutes ago`
    else
        return `${delta.getSeconds() - now.getSeconds()} seconds ago`
}