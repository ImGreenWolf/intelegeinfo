abstract class DebugProcess {
    abstract sendCommand: (string) => void
    abstract sendProgramInput: (command) => void
    protected onResponse: (buffer: Buffer) => void
    abstract addDataListener: (onDataFunc: (data: string) => void) => void
    abstract removeDataListener: (onDataFunc: (data: string) => void) => void
    
    abstract kill: (signal) => void
    abstract addListener: (ev: any, func: (code: any) => void) => void 
    killed = false
    pid = Math.floor(Math.random() * 1000)
    constructor() {
        
    }
}

export default DebugProcess