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

