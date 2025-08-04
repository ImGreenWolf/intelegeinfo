/**
 * Parses a GDB/MI output string into a JSON object.
 * Handles nested structures, arrays, and quoted strings.
 * If the first argument doesn't have a name, adds "message" as the key.
 * Returns { json } on success, or { err, json: string } on failure.
 */
export declare function parseGDBString(gdbString: string): {
    json: any;
    err?: undefined;
} | {
    err: any;
    json: string;
};
