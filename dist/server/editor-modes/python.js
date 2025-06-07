"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
class Python extends _1.EditorMode {
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
