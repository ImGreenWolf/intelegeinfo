/**
 * Parses a GDB/MI output string into a JSON object.
 * Handles nested structures, arrays, and quoted strings.
 * If the first argument doesn't have a name, adds "message" as the key.
 * Returns { json } on success, or { err, json: string } on failure.
 * If the message is "warning", returns { err, json }.
 * If the message is "library-loaded", returns { ignore: true, json }.
 */
export declare function parseGDBString(gdbString: string): {
    err: string;
    json: any;
    ignore?: undefined;
} | {
    ignore: boolean;
    json: any;
    err?: undefined;
} | {
    json: any;
    err?: undefined;
    ignore?: undefined;
} | {
    err: any;
    json: string;
    ignore?: undefined;
};
