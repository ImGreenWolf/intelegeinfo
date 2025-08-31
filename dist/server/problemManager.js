"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
exports.handleSucces = handleSucces;
exports.handleExecError = handleExecError;
exports.createProblem = createProblem;
exports.testProblem = testProblem;
exports.dateDeltaToString = dateDeltaToString;
const dbClient_1 = __importDefault(require("./dbClient"));
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
async function createProblem({ name, description, difficulty, tags, category, requirement, grade }, tests, editorSession, clientObj, req, id) {
    // const problemManager = problemCreator.get(editorSession.sessionId)
    // if(!editorSession.sessionContainer)
    //     console.error('no running container')
    // const imgName = editorSession.sessionContainer
    // await clientObj.openFile.editorMode.compile(imgName, clientObj.openFile, false)
    let i = 0;
    // testProblem(tests, clientObj, editorSession, imgName, () => i++, (index) => console.error('failed test ', index))
    let testPromises = [];
    const testFile = clientObj.openFile[0];
    (0, child_process_1.execSync)(`g++ -O0 ${testFile.filePath} -o ${path_1.default.dirname(testFile.filePath)}/${testFile.name.split('.')[0]}.exe`);
    tests.forEach(async (test, i) => {
        testPromises.push(new Promise((resolve, reject) => {
            const stdin = test.dataIn.toString();
            const expectedStoud = test.dataOut !== undefined ? test.dataOut : undefined;
            let outputBuffer = '';
            const pipeStream = new stream_1.Readable();
            let startDate = undefined;
            const program = (0, child_process_1.spawn)(`${path_1.default.dirname(testFile.filePath)}/${testFile.name.split('.')[0]}.exe`, { stdio: 'pipe', shell: true, timeout: 5000 });
            program.on('spawn', () => {
                console.log('test started');
                pipeStream.pipe(program.stdin);
                pipeStream.push(stdin);
                pipeStream.push(null);
                // program.stdin.pipe(input)
                startDate = Date.now();
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
                if (expectedStoud === undefined)
                    resolve({ output: outputBuffer, time: startDate ? Date.now() - startDate : undefined });
                else if (outputBuffer === expectedStoud) {
                    console.log('passed test', i, "Given input:", stdin, 'output:', expectedStoud);
                    i++;
                    resolve({ output: expectedStoud, time: startDate ? Date.now() - startDate : undefined });
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
        .then(async (output) => {
        // if(i !== tests.length)
        //     {console.error('some tests failed', i, "out of", tests.length)
        //     return }
        let time = 0;
        let timeIndex = 0;
        tests.forEach((val, index) => {
            const value = (output)[index].value;
            if (value) {
                tests[index].dataOut = value.output;
                tests[index].time = value.time ? value.time : -1;
                if (value.time) {
                    time += value.time;
                    timeIndex++;
                }
            }
        });
        const sourceCode = testFile.content;
        const parsedTags = tags.split(',');
        const params = {
            name: name || "unnamed",
            authorId: users.getIdFromJWT(req),
            category,
            description,
            requirement,
            tests,
            difficulty,
            tags: tags.split(',').map(val => val.trim()),
            sourceCode,
            averageMemLimit: 0,
            averageTimeLimit: time / timeIndex,
            grade: parseInt(grade),
            tagsLinked: {
                create: parsedTags.map((tag) => ({
                    tag: {
                        connectOrCreate: {
                            where: { name: tag }, // requires Tag.name to be @unique ✅
                            create: { name: tag },
                        },
                    },
                })),
            },
        };
        if (id)
            await dbClient_1.default.problem.upsert({
                where: {
                    id: id
                },
                update: params,
                create: params,
                include: { tagsLinked: { include: { tag: true } } },
            });
        else
            await dbClient_1.default.problem.create({ data: params });
    });
}
function testProblem(tests, clientObj, clientSession, res) {
    const promises = [];
    console.log('starting tests');
    if (process.env.NODE_ENV == "development")
        (0, child_process_1.execSync)(`g++ -O0 ${clientObj.openFile[0].filePath} -o ${path_1.default.dirname(clientObj.openFile[0].filePath)}/${clientObj.openFile[0].name.split('.')[0]}.exe`);
    // console.log('finished compile')
    tests.forEach(async (test, i) => {
        promises.push(new Promise(async (resolve, reject) => {
            const stdin = test.dataIn;
            const expectedStoud = test.dataOut;
            let outputBuffer = '';
            const program = process.env.NODE_ENV == "development" ? (0, child_process_1.spawn)(`${path_1.default.dirname(clientObj.openFile[0].filePath)}/${clientObj.openFile[0].name.split('.')[0]}.exe`, { stdio: 'pipe', shell: true, timeout: 5000 }) : await clientObj.openFile[0].editorMode.execute(res, clientObj, clientSession);
            const pipeStream = new stream_1.Readable();
            let startTime;
            program.addListener('spawn', () => {
                pipeStream.pipe(program.stdin);
                pipeStream.push(stdin);
                pipeStream.push(null);
                console.log("Test started");
                startTime = Date.now();
            });
            program.stdout.addListener('data', (data) => {
                outputBuffer += data.toString();
            });
            program.on('close', (code) => {
                console.log('test finished');
                if (code != 0)
                    resolve({ status: "Program returned non-zero status code!", error: true, index: i, score: 0 });
                else if (outputBuffer.trim() === expectedStoud.trim())
                    resolve({ status: "Corect.", error: false, index: i, score: test.score || 100 / tests.length, time: startTime ? Date.now() - startTime : undefined });
                else
                    resolve({ status: "Programul nu a returnat rezultatul corect!", error: true, index: i, score: 0, result: (i <= 2 ? { input: stdin } : undefined) }); // TODO Determine if i should leave expected output
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
        if (!client)
            throw 'couldnt find client';
        if (!data.name)
            throw 'invalid name';
        if (!users.getIdFromJWT(req)) {
            res.status(401).send('Unautharized');
            return;
        }
        createProblem(data, tests, session, client, req);
        res.status(200).send(tests[0].dataIn);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.router.post('/update', (req, res) => {
    try {
        const data = req.body;
        const tests = data.tests;
        const session = server_1.sessionMap.get(data.sessionId);
        if (!session)
            throw 'couldnt find session';
        const client = session.clientsMap.get(data.clientId);
        if (!client)
            throw 'couldnt find client';
        if (!data.name)
            throw 'invalid name';
        if (!users.getIdFromJWT(req)) {
            res.status(401).send('Unautharized');
            return;
        }
        createProblem(data, tests, session, client, req, parseInt(req.query.id));
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
            let time = 0;
            let timeIndex = 0;
            for (const testResult of testResults)
                if (testResult.status === "fulfilled" && testResult.value) {
                    const result = testResult.value;
                    score += result.score;
                    if (result.time) {
                        time += result.time;
                        timeIndex++;
                    }
                }
            const solve = {
                userId: client.clientData.id,
                score: score,
                sourceCode: client.openFile[0].content,
                time: time ? time / timeIndex : -1
            };
            dbClient_1.default.problem.update({
                where: {
                    id: problemId
                },
                data: {
                    solves: {
                        create: {
                            ...solve
                        }
                    }
                },
            }).then(problem => res.status(200).send({ results: testResults, solve }));
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
exports.router.get('/create/tags', async (req, res) => {
    const tags = await dbClient_1.default.tag.findMany({
        take: 20
    });
    res.send(tags);
});
exports.router.get('/update', async (req, res) => {
    const problem = await dbClient_1.default.problem.findFirst({
        where: {
            id: parseInt(req.query.id)
        }
    });
    try {
        const sessionId = req.query.sessionId;
        if (sessionId) {
            const session = server_1.sessionMap.get(sessionId);
            if (session) {
                const client = session.clientsMap.get(req.query.clientId);
                if (client)
                    session.files[0].setFileContent(client, problem.sourceCode);
            }
        }
    }
    catch (error) {
    }
    finally {
        res.send(problem);
    }
});
exports.router.get('/page', async (req, res) => {
    const userId = users.getIdFromJWT(req);
    const problems = await dbClient_1.default.problem.findMany({
        take: 20,
        orderBy: {
            grade: 'asc'
        },
        include: {
            tagsLinked: true,
            solves: userId ? {
                where: {
                    userId,
                },
                orderBy: {
                    score: "desc"
                },
                take: 1
            } : false,
            _count: true
        }
    });
    res.send(problems);
});
const fs_1 = __importDefault(require("fs"));
const users = __importStar(require("./usersManager"));
// import cookieParser from "cookie-parser";
exports.router.get('/:sessionId/details/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const sessionId = req.params.sessionId;
    const userId = users.getClientId(req.cookies.token);
    if (!id)
        throw 'invalid id';
    const problem = await dbClient_1.default.problem.findUnique({
        where: {
            id
        },
        include: {
            solves: {
                take: 5,
                orderBy: {
                    uploadedAt: "desc"
                },
                where: {
                    userId: userId ? userId : 0
                },
            },
            _count: {
                select: { solves: true }
            }
        }
    });
    if (!problem)
        throw 'couldnt find problem.';
    let fileBuffer = fs_1.default.readFileSync(path_1.default.join(server_1.rootDirName, 'public', 'pages', 'problemTemplate.html')).toString();
    if (fileBuffer === undefined)
        throw 'File buffer is invalid';
    const serverSideReplace = (template, data) => template.replace(/\${(\w*|.*)}/g, (_, key) => {
        const params = key.split('.');
        const reg = /(.*)\[(\d*)\]/;
        for (let i = 0; i < params.length; i++) {
            const param = params[i];
            if (param) {
                const match = param.match(reg);
                if (match) {
                    params[i] = match[1];
                    params.splice(++i, 0, match[2]);
                }
            }
        }
        let buffer = data[params[0]];
        let i = 1;
        while (i < params.length)
            buffer = buffer[params[i++]];
        return buffer;
    });
    const solvesUI = problem.solves ? problem.solves.map(solve => `<div><span class="${['bad', 'decent', 'good', 'perfect'][Math.round(solve.score / 25) - (solve.score == 0 ? 0 : 1)]}">${solve.score}</span> ${dateDeltaToString(solve.uploadedAt)}`).join('\n') : '';
    res.send(serverSideReplace(fileBuffer, { json: { ...problem, difficulty: problem.difficulty ? problem.difficulty : '' }, sessionId, html: { solvesUI } }));
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
*Class Grade: ${problem.grade}
*Problem Category: ${problem.category}
*Problem Difficulty: ${problem.difficulty}
*Problem Tags (separated by ,): ${problem.tags.join(', ')}
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
                "type": ["string", "null"],
                "description": "A summary of areas where the user can improve their code or problem solving, return null if you dont think the user has much to improve on or isnt necesary. Focus on habits, logic, or concepts.",
                "minLength": 10
            },
            "suggestions": {
                "type": ["string", "null"],
                "description": "Actionable suggestions for the user to become a better problem solver and programmer, if you decide the user needs these suggestions. Prompt self-reflection and encourage conceptual learning.",
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
const TimeUnit = {
    years: {
        'ro-RO': 'ani',
        'en-US': 'years'
    },
    months: {
        'ro-RO': 'luni',
        'en-US': 'months'
    },
    days: {
        'ro-RO': 'zile',
        'en-US': 'days'
    },
    hours: {
        'ro-RO': 'ore',
        'en-US': 'hours'
    },
    minutes: {
        'ro-RO': 'minute',
        'en-US': 'minutes'
    },
    seconds: {
        'ro-RO': 'secunde',
        'en-US': 'seconds'
    },
};
function dateDeltaToString(date, capitalize = true, language = 'ro-RO') {
    function formatTime(time, unit) {
        switch (language) {
            case 'ro-RO':
                return `${capitalize ? "A" : 'a'}cum ${time} ${TimeUnit[unit][language]}`;
            case 'en-US':
                return `${time} ${TimeUnit[unit][language]} ago`;
        }
    }
    const delta = new Date();
    const now = date;
    if (delta.getUTCFullYear() - now.getUTCFullYear() >= 1)
        return formatTime(delta.getUTCFullYear() - now.getUTCFullYear(), 'years');
    else if (delta.getUTCMonth() - now.getUTCMonth() >= 1)
        return formatTime(delta.getUTCMonth() - now.getUTCMonth(), 'months');
    else if (delta.getDay() - now.getDay() >= 1)
        return formatTime(delta.getDay() - now.getDay(), 'days');
    else if (delta.getHours() - now.getHours() >= 1)
        return formatTime(delta.getHours() - now.getHours(), 'hours');
    else if (delta.getMinutes() - now.getMinutes() >= 1)
        return formatTime(delta.getMinutes() - now.getMinutes(), 'minutes');
    else
        return formatTime(delta.getSeconds() - now.getSeconds(), 'seconds');
}
