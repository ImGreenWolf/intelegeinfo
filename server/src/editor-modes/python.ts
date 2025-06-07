import { EditorMode } from './'

class Python extends EditorMode {

    name = 'Python'
    extension = ['py']
    dockerFile = 
    `
    # install from python image
    FROM python:3

    # Set working directory inside container
    WORKDIR /app
    # Default command can be overridden
    CMD [ "bash" ]`.trim();


        HandleClientInput() {
        
    }


}


export default Python

