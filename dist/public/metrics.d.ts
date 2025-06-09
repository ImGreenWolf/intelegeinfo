declare const monitoredValues: {
    value: string;
    update: (name: any, value: any) => string;
}[];
declare function UpdateValues(json: any): void;
declare function addMonitor(value: string, calback: (name: any, value: any) => string): void;
declare function getName(value: any): string;
declare function search(path: any, obj: any, target: any): any;
declare function updateLoop(): void;
