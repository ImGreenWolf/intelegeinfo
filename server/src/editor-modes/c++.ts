import EditorMode from "./BaseEditorMode";

class CppMode extends EditorMode {

    name = 'C++'
    extension: string[] = ['cpp', 'c++'];
    dockerFile = 
    `
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

    constructor()
    {
        super()
    }


}


export default CppMode


