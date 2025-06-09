declare const monitoredValues: {
    value: string;
    cell: HTMLTableCellElement;
    update: (name: any, value: any, cell: any) => string;
}[];
declare function UpdateProcessValues(json: any, index: any): void;
declare function addMonitor(value: string, index: any, calback: (name: any, value: any, cell: any) => string): void;
declare function getName(value: any): string;
declare function addMonitorToTable(table: any, cell: any): void;
declare function init(): Promise<void>;
declare function updateLoop(): void;
declare class Graph {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    time: number;
    minValue: any;
    maxValue: any;
    constructor(name: string, parent: HTMLElement, minValue: any, maxValue: any);
    updateGraph(value: any, time: any): void;
    private normalizeValue;
}
