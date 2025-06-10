"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Python = exports.CppMode = exports.Text = exports.EditorMode = exports.modes = void 0;
const BaseEditorMode_1 = __importDefault(require("./BaseEditorMode"));
exports.EditorMode = BaseEditorMode_1.default;
const c__1 = __importDefault(require("./c++"));
exports.CppMode = c__1.default;
const python_1 = __importDefault(require("./python"));
exports.Python = python_1.default;
const text_1 = __importDefault(require("./text"));
exports.Text = text_1.default;
exports.modes = [
    c__1.default,
    python_1.default,
];
