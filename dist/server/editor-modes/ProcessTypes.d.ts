declare abstract class DebugProcess {
    abstract sendCommand: (string: any) => void;
    protected onResponse: (buffer: Buffer) => void;
    abstract addDataListener: (onDataFunc: typeof this.onResponse) => void;
    abstract removeDataListener: (onDataFunc: typeof this.onResponse) => void;
    abstract kill: (signal: any) => void;
    abstract addListener: (ev: any, func: (code: any) => void) => void;
    killed: boolean;
    pid: number;
    constructor();
}
export default DebugProcess;
