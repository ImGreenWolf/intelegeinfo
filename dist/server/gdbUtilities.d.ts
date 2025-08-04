/**
 * Parses a GDB/MI output string into a JSON object.
 * Handles nested structures, arrays, and quoted strings.
 * Returns { json } on success, or { err, json: string } on failure.
 */
export declare function parseGDBString(gdbString: string): {
    json: any;
    err?: undefined;
} | {
    err: any;
    json: string;
};
