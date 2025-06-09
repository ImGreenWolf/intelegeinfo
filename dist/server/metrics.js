"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wssAPI = void 0;
const pm2_1 = __importDefault(require("pm2"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const server_1 = require("./server");
const ws_1 = __importDefault(require("ws"));
const os_1 = __importDefault(require("os"));
const router = express_1.default.Router();
exports.default = router;
router.get('/', (req, res) => {
    res.sendFile(path_1.default.join(server_1.rootDirName, 'public', 'pages', 'metrics.html'));
});
exports.wssAPI = new ws_1.default.Server({ noServer: true, clientTracking: true, });
exports.wssAPI.on('connection', ws => {
    console.log('admin connected to metrics: displaying pm2');
    pm2_1.default.connect(function (err) {
        if (err) {
            console.error(err);
            ws.send(JSON.stringify({ err }));
            process.exit(2);
        }
        let k = 0;
        setInterval(() => {
            k++;
            if (k % 3 == 0) {
                if (buffer != '') {
                    const output = `${new Date().toLocaleTimeString('ro-ro')}: ${buffer.includes('\n') ? buffer.split('\n').join('\n' + ('&#32').repeat(new Date().toLocaleTimeString('ro-ro').length)) : buffer}&#32\n`;
                    ws.send(JSON.stringify({ output }));
                    buffer = '';
                }
            }
            else {
                pm2_1.default.list((err, list) => {
                    //   console.log(err, list)
                    ws.send(JSON.stringify({ pm2: list, os: { cpu: os_1.default.cpus(), freememory: os_1.default.freemem(), totalMem: os_1.default.totalmem() } }));
                });
            }
        }, 200);
    });
});
let buffer = '';
// const data = new ReadableStream()
// data.pipeTo(process.stdout)
// If you want to create a readable stream and pipe to process.stdout in Node.js, use the following example:
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
//@ts-ignore
process.stdout.write = (chunk, encoding, callback) => {
    if (typeof chunk === 'string') {
        buffer += chunk + "\n ";
    }
    return originalStdoutWrite(chunk, encoding, callback);
};
const originalStderrWrite = process.stdout.write.bind(process.stdout);
//@ts-ignore
process.stderr.write = (chunk, encoding, callback) => {
    if (typeof chunk === 'string') {
        buffer += `<span class='error'>${chunk}</span>\n`;
    }
    return originalStderrWrite(chunk, encoding, callback);
};
// Listen for 'data' events
// data.on('data', (chunk) => {
//     console.log('Data written:', chunk.toString());
//     buffer+=chunk.toString()+'\n';
// });
router.get('/api', (req, res) => {
    pm2_1.default.connect(function (err) {
        if (err) {
            console.error(err);
            res.send(err);
            process.exit(2);
        }
        pm2_1.default.list((err, list) => {
            //   console.log(err, list)
            res.send({ pm2: list, os: { cpu: os_1.default.cpus(), freememory: os_1.default.freemem(), totalMem: os_1.default.totalmem() } });
        });
    });
});
// pm2.restart('api', (err, proc) => {
//         // Disconnects from PM2
//         pm2.disconnect()
//       })\
//   pm2.start({
//     script    : 'api.js',
//     name      : 'api'
//   }, function(err, apps) {
//     if (err) {
//       console.error(err)
//       return pm2.disconnect()
//     }
// })
