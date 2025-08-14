declare const createNode: any;
interface TableOptions {
    rows: any;
    columns: any;
    indexOffset: any;
    expression: any;
}
declare function initInput(inputElem: any, options: TableOptions): void;
declare function updateTableElements(options: TableOptions): HTMLElement[];
declare function getExpressionValue(expr: any, row: any, column: any): {
    err: string;
    css?: undefined;
} | {
    css: string;
    err?: undefined;
};
declare function initDisplay(parentElem: HTMLElement, rows: number, columns: number, indexOffset: number): HTMLTableElement;
declare let table: HTMLTableElement;
