"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pm2_1 = __importDefault(require("pm2"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.default = router;
router.get('/', (req, res) => {
    pm2_1.default.connect(function (err) {
        if (err) {
            console.error(err);
            process.exit(2);
        }
        pm2_1.default.start({
            script: 'api.js',
            name: 'api'
        }, function (err, apps) {
            if (err) {
                console.error(err);
                return pm2_1.default.disconnect();
            }
            pm2_1.default.list((err, list) => {
                console.log(err, list);
                res.send(list);
                pm2_1.default.restart('api', (err, proc) => {
                    // Disconnects from PM2
                    pm2_1.default.disconnect();
                });
            });
        });
    });
});
