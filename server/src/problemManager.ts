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
}

export async function createProblem(name, author, description, category, requirement, tests: ProblemTest[], editorSession: EditorSession, clientObj: ClientObject, )
{
    // const problemManager = problemCreator.get(editorSession.sessionId)
    // if(!editorSession.sessionContainer)
    //     console.error('no running container')
    // const imgName = editorSession.sessionContainer

    // await clientObj.openFile.editorMode.compile(imgName, clientObj.openFile, false)
    let i = 0;
    // testProblem(tests, clientObj, editorSession, imgName, () => i++, (index) => console.error('failed test ', index))
    let testPromises: Promise<void>[] = []
    execSync(`g++ -O0 ${clientObj.openFile[0].filePath} -o ${path.dirname(clientObj.openFile[0].filePath)}/${clientObj.openFile[0].name.split('.')[0]}.exe`)
    
    tests.forEach(async (test, i) => 
    {
        testPromises.push(new Promise<void>((resolve, reject) => {
            const stdin = test.dataIn.toString()
            const expectedStoud = test.dataOut.toString()
            let outputBuffer = '';
            
                
                

            const input = new Writable()
           
            const program = spawn(`${path.dirname(clientObj.openFile[0].filePath)}/${clientObj.openFile[0].name.split('.')[0]}.exe`, {stdio: 'pipe', shell: true, timeout: 5000})
            program.on('spawn', () => {
                console.log('test started')
                program.stdin.write(stdin)
                program.stdin.end()
                // program.stdin.pipe(input)

                // input.pipe(program.stdin)
                //  input.write(stdin)
                program.stdin.on('drain', () => console.log('drain stdin'))
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

                if(outputBuffer === expectedStoud)
                {
                    console.log('passed test',i,"Given input:",stdin,'output:',expectedStoud)
                    i++
                    resolve()
                }
                else 
                reject(console.error('failed test ', i, 'Expected output:',expectedStoud,'actual output: ', outputBuffer))
            })
        }))
        
    })
    Promise.allSettled(testPromises)
    .catch(err => {
        console.error('Test failed.')
    })
    .then(() => {
        // if(i !== tests.length)
        //     {console.error('some tests failed', i, "out of", tests.length)
        //     return }

        prisma.problem.create({
            data: {
                name: name || "unnamed",
                author,
                category,
                description,
                requirement,
                tests,
                averageMemLimit: 0,
                averageTimeLimit: 0
            }
        }).then(problem => {
            console.log(problem)
        })
    })
    

    


    
}

export function testProblem(tests:  ProblemTest[], clientObj: ClientObject,clientSession,res,onSucces: (index, clientObj) => void, onFail: (index, clientObj) => void)
{
    const promises = []
    tests.forEach(async (test, i) => 
    {
        promises.push(new Promise<void>(async (resolve, reject) => {
            const stdin = test.dataIn
            const expectedStoud = test.dataOut
            let outputBuffer = ''
            const program = await clientObj.openFile[0].editorMode.execute(res, clientObj, clientSession)
            program.stdin.write(stdin)
            
            program.stdout.addListener('data', (data) => {
                outputBuffer += data.toString()
            })

            program.on('close', (code) => {
                if(code != 0)
                    reject()
                if(outputBuffer === expectedStoud)
                    resolve()
            })
        }))
        
    })

    return Promise.allSettled(promises)
}


import express, { Request, Response } from 'express';
import { sessionMap } from "./server";
import { execSync, spawn } from "child_process";
import path from "path";
import { Readable } from "stream";
import { WritableStream } from "stream/web";
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
            {
                console.error('couldnt find client', session.clientsMap)
                return;
            } 
            if(!data.name)
                throw 'invalid name'
        createProblem(data.name, data.author, data.description, data.category, data.requirement, tests, session, client)
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
        session.executeProblemChecker(req.params.problemId).then(() =>  res.status(200).send({result: true}))
        .catch((err) =>  res.status(500).send({err: err || true, result: 'sksksksk'}))
        // createProblem(data.name, data.author, data.description, data.category, data.requirement, tests, session, client)
       
    }
    catch(err)
    {
        res.status(500).send({err, result: false})
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



export default router