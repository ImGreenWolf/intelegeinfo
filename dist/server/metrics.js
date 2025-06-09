"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pm2_1 = __importDefault(require("pm2"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const server_1 = require("./server");
const router = express_1.default.Router();
exports.default = router;
router.get('/', (req, res) => {
    res.sendFile(path_1.default.join(server_1.rootDirName, 'public', 'pages', 'metrics.html'));
});
router.get('/api', (req, res) => {
    pm2_1.default.connect(function (err) {
        if (err) {
            console.error(err);
            res.send(err);
            process.exit(2);
        }
        pm2_1.default.list((err, list) => {
            //   console.log(err, list)
            res.send(list);
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
