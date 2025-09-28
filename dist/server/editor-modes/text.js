"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseEditorMode_1 = __importDefault(require("./BaseEditorMode"));
class Text extends BaseEditorMode_1.default {
    name = 'Text';
    extension = ['txt', ''];
    dockerSafeTag = 'txt';
    dockerFile = "";
    isExecutable = false;
    HandleClientInput() {
    }
    constructor() {
        super();
    }
    execute(res) {
        return undefined;
    }
    directExecute(res, clientObj, sessionObj) {
        return undefined;
    }
    compile(res) {
    }
}
exports.default = Text;
