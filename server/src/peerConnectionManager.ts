import { randomUUID } from "node:crypto";
import WebSocket from "ws";
export const wssRTC = new WebSocket.Server({noServer: true, clientTracking: true,  });
    
const clients: WebSocket[] = [];
wssRTC.on('connection', ws => {
    clients.push(ws)
    console.log('rtc peer connected to STUN', clients.length)
    ws.on('message', data => {
        for(const client of clients)
            if(client != ws && client.OPEN)
                client.send(data.toString())
            
        
    })

    ws.on('close', code => {
        const index = clients.indexOf(ws)
        clients.splice(index)
    })
})




export const wssFS = new WebSocket.Server({noServer: true})
const clientsMap: Map<string, WebSocket> = new Map()
wssFS.on('connection', (ws, req) => {

    function sendMessage(msg, socket=ws) {
        socket.send(JSON.stringify(msg))
    }
    function sendError(error) {
        sendMessage({type: 'error', error})
    }

    const wsURL = new URL('https://intelegeinfo.ro/' + req.url)

    if(wsURL.searchParams.has('clientId'))
        var clientId = wsURL.searchParams.get('clientId')
    else
        var clientId = randomUUID().split('-')[0]

   
        

    if(clientsMap.has(clientId))
        return sendError('Client aready exists, please create another link.')
    clientsMap.set(clientId, ws)
    
    sendMessage({type: 'init', clientId})
    
    if(wsURL.searchParams.has('targetId'))
        connectToTarget(wsURL.searchParams.get('targetId'))

   ws.addListener("message", async (data: Buffer, isBinary: boolean) => {  
        const message = JSON.parse(data.toString())

        switch(message.type) {
            case 'connect':
               connectToTarget(message.target)
            break;
            case 'rtc':
                if(!clientsMap.has(message.targetId))
                    return sendError('Invalid target reference')
                const targetWS = clientsMap.get(message.targetId)
                sendMessage({...message, clientId}, targetWS)
            break;
        }
    })
    ws.onclose = (ev) => {
        clientsMap.delete(clientId)
    }
    function connectToTarget(targetId) {
        if(!clientsMap.has(targetId))
            return sendError('Invalid target')
        sendMessage({type: 'connect', targetId, request: false})
        sendMessage({type: 'connect', targetId: clientId, request: true}, clientsMap.get(targetId))
    }
})


