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
        console.error('Test failed.');
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
function testProblem(tests, clientObj, clientSession, res, onSucces, onFail) {
    const promises = [];
    tests.forEach(async (test, i) => {
        promises.push(new Promise(async (resolve, reject) => {
            const stdin = test.dataIn;
            const expectedStoud = test.dataOut;
            let outputBuffer = '';
            const program = await clientObj.openFile.editorMode.execute(res, clientObj, clientSession);
            program.stdin.write(stdin);
            program.stdout.addListener('data', (data) => {
                outputBuffer += data.toString();
            });
            program.on('close', (code) => {
                if (code != 0)
                    reject();
                if (outputBuffer === expectedStoud)
                    resolve();
            });
        }));
    });
    return Promise.allSettled(promises);
}
const express_1 = __importDefault(require("express"));
const server_1 = require("./server");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
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
        session.executeProblemChecker(req.params.problemId).then(() => res.status(200).send({ result: true }))
            .catch((err) => res.status(500).send({ err: err || true, result: 'sksksksk' }));
        // createProblem(data.name, data.author, data.description, data.category, data.requirement, tests, session, client)
    }
    catch (err) {
        res.status(500).send({ err, result: false });
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
exports.default = exports.router;
