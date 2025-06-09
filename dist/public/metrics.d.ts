declare const monitoredValues: Monitor[];
interface Monitor {
    value: string;
    cell: HTMLTableCellElement;
    container: HTMLDivElement;
    update: (name: any, value: any, isUpdate: any, cell: any) => string;
}
declare function UpdateProcessValues(json: any, index: any): void;
declare function addMonitor(value: string, index: any, callback: (name: any, value: any, isUpdate: any, cell: any) => string): void;
declare function setInnerHTML(monitor: Monitor, value: string, isUpdate?: boolean): void;
declare function getName(value: any): string;
declare function addMonitorToTable(table: any, cell: any): void;
declare let globalTime: number;
declare function init(): Promise<void>;
declare function updateLoop(): void;
declare const Graphs: Map<string, Graph>;
declare class Graph {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    time: number;
    minValue: any;
    maxValue: any;
    height: number;
    points: {
        value: number;
        time: number;
    }[];
    constructor(name: string, parent: HTMLElement, minValue: any, maxValue: any);
    updateGraph(value: any, time: any): void;
    private normalizeValue;
}
