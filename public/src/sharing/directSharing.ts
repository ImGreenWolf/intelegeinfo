import { UUID } from "crypto";
import { IIWebRTC } from "../webrtcdemo.js";
import { createNode } from "../components.js";
const ws = new WebSocket('/directSharing' + location.search)
let clientId: string;


const codeElem = document.getElementById('code') as HTMLInputElement
const output = document.getElementById('output') as HTMLPreElement
const progressBar = document.getElementById('progressBar') as HTMLImageElement
const selectFile = document.getElementById('selectFile') as HTMLButtonElement

if(new URLSearchParams(location.toString()).has('targetId'))
{
    const targetId = new URLSearchParams(location.toString()).get('targetId')
    setCodeValue(targetId as string)
}

let rtcCon: IIWebRTC | undefined;

function setCodeValue(value: string) {
    codeElem.value = value
    selectFile.disabled = false
}

selectFile.onclick = (ev) => {
    if(!rtcCon)
        return connectToClient()
    sendFile()
}
codeElem.oninput = (ev) => {
    if(!rtcCon)
        return selectFile.disabled = false
    rtcCon.close()
    rtcCon = undefined
    selectFile.disabled = true
    codeElem.setCustomValidity('You have been disconected')
}



function connectToClient() {
   sendMessage({type: 'connect', target: codeElem.value})
}

function sendMessage(msg) {
    ws.send(JSON.stringify(msg))
}

ws.addEventListener('message', (ev) => {
    const message = JSON.parse(ev.data)

    switch(message.type) {
        case 'init':
            clientId = message.clientId
            document.getElementById('ownCodeDisplay')!.innerText = clientId
        break;
        case 'connect':
             rtcCon = new IIWebRTC(message.targetId, clientId, ws, message.request, handleTransmissionData)
             document.getElementById('connected')?.classList.add('active')
        break;
        case 'rtc':
            if(!rtcCon)
                rtcCon = new IIWebRTC(message.clientId, clientId, ws, false, handleTransmissionData)
            rtcCon.handleSignal(message as any);
        break;
        case 'error':
            output.innerText = message.error
        break;
    } 
})

let updateInterval
const updateRate = 100;
function handleTransmissionData(rtcChannel: RTCDataChannel)
{
    if(!rtcCon)
        return 
    
    rtcChannel.binaryType = 'arraybuffer';

    let buffer: any[] = []
    let fileData: {name: string, originalSize: number, fileType: string}
    let chunkSize = 0;
    let lastChunkSize = 0

    rtcChannel.addEventListener('message', (ev) => {
        if(typeof (ev.data) == 'object')
        {   
            buffer.push(ev.data)
            chunkSize += ev.data.byteLength
        }
        else
        {
            // TODO use signaler to transfer metadata
            const message = JSON.parse(ev.data)
            switch(message.type) {
                case 'done':
                    finishReadingTransfer(buffer)
                    clearInterval(updateInterval)
                    break
                case 'fileData':
                    fileData = message.fileData
                    updateInterval = setInterval(() => {
                        setProgress(chunkSize/fileData.originalSize*100)
                        const downloadedSize = (chunkSize/1000000).toFixed(2)
                        const fileSize = (fileData.originalSize/1000000).toFixed(2)
                        output.innerText = `${downloadedSize}mb / ${fileSize}mb, speed: ${((chunkSize-lastChunkSize)*(1000/updateRate)/1000000).toFixed(2)}mb/s \n`

                        lastChunkSize = chunkSize
                    }, updateRate);
                break
            }
            
          }  
    })
    // only the host can send files
    if(rtcCon.polite)
        return

    sendFile()


    async function finishReadingTransfer(buffer_: any[]) {
        const blob = new Blob(buffer_)
        console.log(blob)
        var objectURL = URL.createObjectURL(blob);
        output.innerText += `name: ${fileData.name}, size: ${fileData.originalSize}, type: ${fileData.fileType}`
        buffer = []
        setProgress(0)
        
        switch(fileData.fileType.split('/')[0]) {
            case 'image':
                document.body.appendChild(createNode('img', {attributes: [{name: 'src', value: objectURL}]}))
            break;
            case 'video':
                document.body.appendChild(createNode('video', {attributes: [{name: 'src', value: objectURL}, {name: 'controls', value: 'true'}]}))
            break;
            case 'text':
                 output.innerText += '\n' + await blob.text()
            break;
            case 'audio':
                document.body.appendChild(createNode('audio', {attributes: [{name: 'src', value: objectURL}, {name: 'controls', value: 'true'}]}))
            break

        }
        document.getElementById('action-container')!.appendChild(
            createNode('a', {attributes: [{name: 'href', value: objectURL}, {name: 'download', value: fileData.name || 'download'}], innerText: `Download ${fileData.name}`})
        )
    }

}

async function promptOpenFile(): Promise<FileSystemFileHandle[] | undefined> {
     if((window as any).showOpenFilePicker )
            return (window as any).showOpenFilePicker()
     else console.log('manual picker')
    
}

async function getFile() {
    const fileHandler = await promptOpenFile()
    if(!fileHandler)
        throw 'Invalid file handler'
    return await fileHandler[0].getFile()
}


function setProgress(progress: number) {
    progressBar.style.width = progress + '%'
    if(progress ==0)
    {
        progressBar.classList.remove('active')
         selectFile.disabled = false
         if(updateInterval)
            clearInterval(updateInterval)
    }
    else 
    {
        selectFile.disabled = true
        progressBar.classList.add('active')

    }
    
}

async function sendFile() {
    
    const file = await getFile()
    const fileData = {name: file.name, originalSize: file.size, fileType: file.type}
    rtcCon!.send(JSON.stringify({type: 'fileData', fileData}))
        
    await readFile(file)
    setProgress(0)
    // const readWorker = new Worker("/client/scripts/sharing/sendWorker.js");
    // readWorker.postMessage(file)
    // readWorker.onmessage = (ev) => {
    //     rtcCon.send(ev.data)
    

    // }
    
}


async function readFile(file: File) {
    const res = await readChunk(file.stream().getReader(), file)
    output.innerText += `\nDone! Sent ${(res/1000000).toFixed(2)}mb!`
    // readChunk(e.data.stream().getReader(), e.data)
    setProgress(0)
    rtcCon!.send(JSON.stringify({type: 'done'}))
    
}

async function readChunk(reader: ReadableStreamDefaultReader<Uint8Array>, file: File) {
    let totalSize = 0;
    const CHUNK_SIZE = 64 * 1024 * 4; // 64KB per chunk, adjust as needed
    const CHUNKS_PER_SECOND = 200; // Limit to 10 chunks per second
    const INTERVAL_MS = 1000 / CHUNKS_PER_SECOND;
    updateInterval = setInterval(() => {
       setProgress(totalSize/file.size*100)
       output.innerText = `buffer: ${rtcCon!.dc!.bufferedAmount}`
    }, 100);

    let done = false;
    while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;
        if (value) {
            // If value is larger than CHUNK_SIZE, split it
            for (let offset = 0; offset < value.byteLength; offset += CHUNK_SIZE) {
                const chunk = value.subarray(offset, offset + CHUNK_SIZE);
                // rtcCon.send(chunk);
                rtcCon!.send(chunk);
                totalSize += chunk.byteLength;
                await new Promise<void>(res => setInterval(() => {
                    if(rtcCon!.dc!.bufferedAmount < CHUNK_SIZE)
                     res()
                }, INTERVAL_MS));
            } 
        }
    }
    return totalSize;
}

export function copySendLink() {
    const url = new URL(location.toString())
    const targetId = uuidv4().split('-')[0]
    url.searchParams.set('clientId', targetId)
    const text = url.toString()
    navigator.clipboard.writeText(text)

    const myurl = new URL(location.toString())
    myurl.searchParams.set('targetId', clientId)
    window.history.replaceState(null, '', myurl)

    setCodeValue(targetId)
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}
export function copyRecieveLink() {

     const url = new URL(location.toString())
    url.searchParams.set('targetId', clientId)
    const text = url.toString()
    
    navigator.clipboard.writeText(text)
    
}