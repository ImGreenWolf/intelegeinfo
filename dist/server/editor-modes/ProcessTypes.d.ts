declare abstract class DebugProcess {
    abstract sendCommand: (string: any) => void;
    abstract sendProgramInput: (command: any) => void;
    protected onResponse: (buffer: Buffer) => void;
    abstract addDataListener: (onDataFunc: (data: string) => void) => void;
    abstract removeDataListener: (onDataFunc: (data: string) => void) => void;
    abstract kill: (signal: any) => void;
    abstract addListener: (ev: any, func: (code: any) => void) => void;
    killed: boolean;
    pid: number;
    constructor();
}
export default DebugProcess;
