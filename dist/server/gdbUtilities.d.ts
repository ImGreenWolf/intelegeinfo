export declare function parseGDBString(gdbString: string): {
    json: any;
    err?: undefined;
} | {
    err: any;
    json: string;
};
