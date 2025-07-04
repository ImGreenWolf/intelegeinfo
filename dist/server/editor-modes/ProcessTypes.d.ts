declare abstract class DebugProcess {
    abstract sendCommand: (string: any) => void;
    abstract onResponse: () => string;
    abstract kill: () => void;
    abstract addListener: (ev: any, func: (code: any) => void) => void;
    killed: boolean;
    pid: number;
    constructor();
}
export default DebugProcess;
