export type TextOperation = {type: 'insert'; start: number; text: string} |
    {type: 'remove'; start: number; end: number};

export function editOffset(content: string, row: number, column: number): number {
    const lines = content.split('\n');
    if (!Number.isInteger(row) || !Number.isInteger(column) || row < 0 || row >= lines.length || column < 0 || column > lines[row].length)
        throw new Error('Invalid edit position');
    return lines.slice(0, row).reduce((length, line) => length + line.length + 1, 0) + column;
}

// Rebase incoming edits over an already committed edit without changing history.
export function rebaseOperations(incoming: TextOperation[], committed: TextOperation): TextOperation[] {
    return incoming.flatMap<TextOperation>(op => {
        if (committed.type === 'insert') {
            const at = committed.start, length = committed.text.length;
            if (op.type === 'insert') return [{...op, start: op.start >= at ? op.start + length : op.start}];
            if (at <= op.start) return [{...op, start: op.start + length, end: op.end + length}];
            if (at >= op.end) return [{...op}];
            // Delete the original text on either side, preserving the other user's insertion.
            return [{type: 'remove', start: at + length, end: op.end + length}, {type: 'remove', start: op.start, end: at}];
        }
        const position = (index: number) => index <= committed.start ? index :
            index >= committed.end ? index - (committed.end - committed.start) : committed.start;
        if (op.type === 'insert') return [{...op, start: position(op.start)}];
        const start = position(op.start), end = position(op.end);
        return end > start ? [{type: 'remove', start, end}] : [];
    });
}

export function applyOperations(content: string, operations: TextOperation[]): string {
    for (const op of [...operations].sort((a, b) => b.start - a.start)) {
        if (op.start < 0 || op.start > content.length || (op.type === 'remove' && (op.end < op.start || op.end > content.length)))
            throw new Error('Invalid edit position');
        content = op.type === 'insert' ? content.slice(0, op.start) + op.text + content.slice(op.start) :
            content.slice(0, op.start) + content.slice(op.end);
    }
    return content;
}
