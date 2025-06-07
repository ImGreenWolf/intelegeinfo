"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CppMode extends _1.EditorMode {
    name = 'C++';
    extension = ['cpp', 'c++'];
    dockerFile = `
    # Base image with GCC
    FROM gcc:bookworm

    # Set working directory inside container
    WORKDIR /app
    RUN apt-get update && \
        apt-get install -y gdb && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*
    # Default command can be overridden
    CMD [ "bash" ]
    `.trim();
    HandleClientInput() {
    }
    constructor() {
        super();
    }
}
exports.default = CppMode;
