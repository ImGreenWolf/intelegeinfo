
async function readFile(file: File) {
    const res = await readChunk(file.stream().getReader(), file)
    // output.innerText += `\nsent file size: ${res}`
    // readChunk(e.data.stream().getReader(), e.data)
    postMessage(JSON.stringify({type: 'done'}))
    
}

async function readChunk(reader: ReadableStreamDefaultReader<Uint8Array>, file) {
    let totalSize = 0;
    const CHUNK_SIZE = 64 * 1024; // 64KB per chunk, adjust as needed
    const CHUNKS_PER_SECOND = 1000; // Limit to 10 chunks per second
    const INTERVAL_MS = 1000 / CHUNKS_PER_SECOND;

    let done = false;
    while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;
        if (value) {
            // If value is larger than CHUNK_SIZE, split it
            for (let offset = 0; offset < value.byteLength; offset += CHUNK_SIZE) {
                const chunk = value.subarray(offset, offset + CHUNK_SIZE);
                // rtcCon.send(chunk);
                postMessage(chunk);
                totalSize += chunk.byteLength;
                await new Promise(res => setTimeout(res, INTERVAL_MS));
            } 
        }
    }
    return totalSize;
}
onmessage = (e) => {
    console.log(e.data)
    readFile(e.data)
    

    

}








