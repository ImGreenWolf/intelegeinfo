"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseEditorMode_1 = __importDefault(require("./BaseEditorMode"));
class Python extends BaseEditorMode_1.default {
    name = 'Python';
    extension = ['py'];
    dockerFile = `
    # install from python image
    FROM python:3

    # Set working directory inside container
    WORKDIR /app
    # Default command can be overridden
    CMD [ "bash" ]`.trim();
    HandleClientInput() {
    }
}
exports.default = Python;
