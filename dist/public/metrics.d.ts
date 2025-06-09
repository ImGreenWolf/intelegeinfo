declare const monitoredValues: Monitor[];
interface Monitor {
    value: string;
    cell: HTMLTableCellElement;
    container: HTMLDivElement;
    update: (name: any, value: any, isUpdate: any, cell: any) => string;
}
declare function UpdateProcessValues(json: any, rawJSON: any): void;
declare function updateMonitor(monitor: any, json: any): void;
declare function addMonitor(value: string, index: any, callback: (name: any, value: any, isUpdate: any, cell: any) => string): void;
declare function setInnerHTML(monitor: Monitor, value: string, isUpdate?: boolean): void;
declare function getName(value: any): string;
declare function addMonitorToTable(table: any, cell: any): void;
declare let globalTime: number;
declare function init(): Promise<void>;
declare function updateLoop(): void;
declare const Graphs: Map<string, Graph>;
interface GraphPoint {
    value: number;
    time: number;
}
interface GraphLine {
    value: any;
    color: any;
    width: any;
}
declare class Graph {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    time: number;
    minValue: any;
    maxValue: any;
    height: number;
    width: number;
    padding: number;
    maxPoint: GraphPoint;
    secondMaxPoint: GraphPoint;
    points: GraphPoint[];
    closestPoint: GraphPoint;
    pointer: HTMLDivElement;
    zoom: GraphPoint;
    lines: GraphLine[];
    constructor(name: string, parent: HTMLElement, minValue: any, maxValue: any);
    private createZoomButtons;
    private updatePointer;
    updateGraph(newPoint: GraphPoint): void;
    redrawGraph(): void;
    private calculateXandY;
    private drawBackground;
    private normalizeValue;
    addLine(callback: (graph: any) => GraphLine): void;
    drawLineAtValue(line: GraphLine): void;
}
