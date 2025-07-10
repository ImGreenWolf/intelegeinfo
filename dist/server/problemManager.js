"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
exports.handleSucces = handleSucces;
exports.handleExecError = handleExecError;
exports.createProblem = createProblem;
exports.testProblem = testProblem;
const dbClient_1 = __importDefault(require("./dbClient"));
const node_stream_1 = require("node:stream");
function handleSucces(index, clientObj) {
    clientObj.sendMessage({ index, succes: true });
}
function handleExecError(index, clientObj) {
    clientObj.sendMessage({ index, succes: false });
}
const problemCreator = new Map();
class ProblemCreator {
    editorSession;
}
async function createProblem(name, author, description, category, requirement, tests, editorSession, clientObj) {
    // const problemManager = problemCreator.get(editorSession.sessionId)
    // if(!editorSession.sessionContainer)
    //     console.error('no running container')
    // const imgName = editorSession.sessionContainer
    // await clientObj.openFile.editorMode.compile(imgName, clientObj.openFile, false)
    let i = 0;
    // testProblem(tests, clientObj, editorSession, imgName, () => i++, (index) => console.error('failed test ', index))
    let testPromises = [];
    (0, child_process_1.execSync)(`g++ -O0 ${clientObj.openFile[0].filePath} -o ${path_1.default.dirname(clientObj.openFile[0].filePath)}/${clientObj.openFile[0].name.split('.')[0]}.exe`);
    tests.forEach(async (test, i) => {
        testPromises.push(new Promise((resolve, reject) => {
            const stdin = test.dataIn.toString();
            const expectedStoud = test.dataOut.toString();
            let outputBuffer = '';
            const input = new node_stream_1.Writable();
            const program = (0, child_process_1.spawn)(`${path_1.default.dirname(clientObj.openFile[0].filePath)}/${clientObj.openFile[0].name.split('.')[0]}.exe`, { stdio: 'pipe', shell: true, timeout: 5000 });
            program.on('spawn', () => {
                console.log('test started');
                program.stdin.write(stdin);
                program.stdin.end();
                // program.stdin.pipe(input)
                // input.pipe(program.stdin)
                //  input.write(stdin)
                program.stdin.on('drain', () => console.log('drain stdin'));
            });
            program.stdout.addListener('data', (data) => {
                outputBuffer += data.toString();
            });
            program.on('error', (err) => {
                console.error('test gave an error:', err);
            });
            program.on('close', (code) => {
                // if(code == null)
                // {
                //     reject(console.error('test ' +i + ' timed out'))
                // }
                console.log('test finished', outputBuffer);
                if (code != 0 && code)
                    reject(console.error('failed runtime error ', code, 'on test ' + i));
                if (outputBuffer === expectedStoud) {
                    console.log('passed test', i, "Given input:", stdin, 'output:', expectedStoud);
                    i++;
                    resolve();
                }
                else
                    reject(console.error('failed test ', i, 'Expected output:', expectedStoud, 'actual output: ', outputBuffer));
            });
        }));
    });
    Promise.allSettled(testPromises)
        .catch(err => {
        console.error('Test failed.', err);
    })
        .then(() => {
        // if(i !== tests.length)
        //     {console.error('some tests failed', i, "out of", tests.length)
        //     return }
        dbClient_1.default.problem.create({
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
            console.log(problem);
        });
    });
}
function testProblem(tests, clientObj, clientSession, res) {
    const promises = [];
    console.log('starting tests');
    // execSync(`g++ -O0 ${clientObj.openFile[0].filePath} -o ${path.dirname(clientObj.openFile[0].filePath)}/${clientObj.openFile[0].name.split('.')[0]}.exe`)
    // console.log('finished compile')
    tests.forEach(async (test, i) => {
        promises.push(new Promise(async (resolve, reject) => {
            const stdin = test.dataIn;
            const expectedStoud = test.dataOut;
            let outputBuffer = '';
            const program = false ? (0, child_process_1.spawn)(`${path_1.default.dirname(clientObj.openFile[0].filePath)}/${clientObj.openFile[0].name.split('.')[0]}.exe`, { stdio: 'pipe', shell: true, timeout: 5000 }) : await clientObj.openFile[0].editorMode.execute(res, clientObj, clientSession);
            const pipeStream = new stream_1.Readable();
            program.addListener('spawn', () => {
                pipeStream.pipe(program.stdin);
                pipeStream.push(stdin);
                pipeStream.push(null);
                console.log("Test started");
            });
            program.stdout.addListener('data', (data) => {
                outputBuffer += data.toString();
            });
            program.on('close', (code) => {
                console.log('test finished');
                if (code != 0)
                    resolve({ status: "Program returned non-zero status code!", error: true, index: i, score: 0 });
                else if (outputBuffer.trim() === expectedStoud.trim())
                    resolve({ status: "Corect.", error: false, index: i, score: test.score || 100 / tests.length });
                else
                    resolve({ status: "Programul nu a returnat rezultatul corect!", error: true, index: i, score: 0 });
            });
        }));
    });
    return Promise.allSettled(promises);
}
const express_1 = __importDefault(require("express"));
const server_1 = require("./server");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
exports.router = express_1.default.Router();
exports.router.post('/create', (req, res) => {
    try {
        const data = req.body;
        const tests = data.tests;
        const session = server_1.sessionMap.get(data.sessionId);
        if (!session)
            throw 'couldnt find session';
        const client = session.clientsMap.get(data.clientId);
        if (!client) {
            console.error('couldnt find client', session.clientsMap);
            return;
        }
        if (!data.name)
            throw 'invalid name';
        createProblem(data.name, data.author, data.description, data.category, data.requirement, tests, session, client);
        res.status(200).send(tests[0].dataIn);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.router.get('/:sessionId/test/:problemId', (req, res) => {
    try {
        if (!req.params.sessionId)
            throw 'invalid session id';
        const problemId = parseInt(req.params.problemId);
        if (!problemId)
            throw 'invalid problem id';
        const session = server_1.sessionMap.get(req.params.sessionId);
        if (!session)
            throw 'couldnt find session';
        // const client = session.clientsMap.get(data.clientId)
        // if(!client)
        //     {
        //         console.error('couldnt find client', session.clientsMap)
        //         throw 'Couldnt find client'
        //     } 
        if (!session.executeProblemChecker)
            throw 'No problem checker...';
        const client = session.clients[0];
        session.executeProblemChecker(problemId)
            .then((testResults) => {
            // testResults is an array of PromiseSettledResult objects
            console.log('Testing finished, results:', testResults);
            let score = 0;
            for (const testResult of testResults)
                if (testResult.status === "fulfilled" && testResult.value) {
                    const result = testResult.value;
                    //@ts-ignore
                    score += result.score;
                }
            dbClient_1.default.problem.update({
                where: {
                    id: problemId
                },
                data: {
                    solves: {
                        create: {
                            userId: client.clientData.id,
                            score: score,
                            sourceCode: client.openFile[0].content,
                        }
                    }
                }
            }).then(problem => res.status(200).send({ results: testResults }));
        });
        // .catch((err) =>  res.status(500).send({error: err || true, result: false}))
        // createProblem(data.name, data.author, data.description, data.category, data.requirement, tests, session, client)
    }
    catch (err) {
        res.status(500).send({ err: err || "Unexpected error", result: false });
    }
});
exports.router.get('/random', async (req, res) => {
    const length = await dbClient_1.default.problem.count();
    const problem = await dbClient_1.default.problem.findUnique({
        where: {
            id: Math.floor(Math.random() * length) + 1
        }
    });
    res.send(problem);
});
exports.router.get('/page', async (req, res) => {
    const problems = await dbClient_1.default.problem.findMany({
        take: 10
    });
    res.send(problems);
});
const fs_1 = __importDefault(require("fs"));
exports.router.get('/:sessionId/details/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const sessionId = req.params.sessionId;
    if (!id)
        throw 'invalid id';
    const problem = await dbClient_1.default.problem.findUnique({
        where: {
            id
        }
    });
    let fileBuffer = fs_1.default.readFileSync(path_1.default.join(server_1.rootDirName, 'public', 'pages', 'problemTemplate.html')).toString();
    if (fileBuffer === undefined)
        throw 'File buffer is invalid';
    const serverSideReplace = (template, data) => template.replace(/\${(\w*|.*)}/g, (_, key) => {
        console.log(key, data[key]);
        const params = key.split('.');
        const reg = /(.*)\[(\d*)\]/;
        for (let i = 0; i < params.length; i++) {
            const param = params[i];
            console.log(param.match(reg));
            if (param) {
                const match = param.match(reg);
                if (match) {
                    params[i] = match[1];
                    params.splice(++i, 0, match[2]);
                }
            }
        }
        console.log(params);
        let buffer = data[params[0]];
        let i = 1;
        while (i < params.length)
            buffer = buffer[params[i++]];
        return buffer;
    });
    res.send(serverSideReplace(fileBuffer, { json: problem, sessionId }));
});
exports.default = exports.router;
const openai_1 = __importDefault(require("openai"));
exports.router.get('/:sessionId/details/:id/evaluate', async (req, res) => {
    res.send(await aiEvaluateSource(req.params.sessionId, undefined, parseInt(req.params.id)));
});
async function aiEvaluateSource(sessionId, clientId, problemId) {
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
    const successfulSolve = problem.solves.find(solve => solve.score === 100);
    if (!successfulSolve)
        throw 'You have to sucessfully solve the problem first!';
    if (!problem)
        throw 'coudlnt find problem';
    const aiclient = new openai_1.default();
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
        input: `
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
    return response.output_text;
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
                        "description": "Breakdown the final score to show the user how it was given. Make sure they add up to the final score.",
                        "items": {
                            "type": "object",
                            "properties": {
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
