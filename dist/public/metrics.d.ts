declare const monitoredValues: {
    value: string;
    cell: HTMLTableCellElement;
    update: (name: any, value: any) => string;
}[];
declare function UpdateProcessValues(json: any, index: any): void;
declare function addMonitor(value: string, index: any, calback: (name: any, value: any) => string): void;
declare function getName(value: any): string;
declare function addMonitorToTable(table: any, cell: any): void;
declare function init(): Promise<void>;
declare function updateLoop(): void;
