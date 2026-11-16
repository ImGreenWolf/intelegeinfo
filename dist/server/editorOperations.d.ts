export type TextOperation = {
    type: 'insert';
    start: number;
    text: string;
} | {
    type: 'remove';
    start: number;
    end: number;
};
export declare function editOffset(content: string, row: number, column: number): number;
export declare function rebaseOperations(incoming: TextOperation[], committed: TextOperation): TextOperation[];
export declare function applyOperations(content: string, operations: TextOperation[]): string;
