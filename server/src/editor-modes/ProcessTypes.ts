abstract class DebugProcess {
    abstract sendCommand: (string) => void
    abstract onResponse: () => string
    abstract kill: () => void
    abstract addListener: (ev: any, func: (code: any) => void) => void 
    killed = false
    pid = Math.floor(Math.random() * 1000)
    constructor() {
        
    }
}

export default DebugProcess