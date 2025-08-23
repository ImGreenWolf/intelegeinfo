declare function readFile(file: File): Promise<void>;
declare function readChunk(reader: ReadableStreamDefaultReader<Uint8Array>, file: any): Promise<number>;
