import pm2 from 'pm2'
import express, { Request, Response } from 'express';
import path from 'path';
import { rootDirName } from './server';
import WebSocket from 'ws';
import os from "os"
const router = express.Router();
export default router
router.get('/', (req, res) => {
    res.sendFile(path.join(rootDirName, 'public', 'pages', 'metrics.html'))
})

export const wssAPI = new WebSocket.Server({noServer: true, clientTracking: true,  });
wssAPI.on('connection', ws => {
    console.log('admin connected to metrics: displaying pm2')
     pm2.connect(function(err) {
        if (err) {
            console.error(err)
            ws.send(JSON.stringify({err}))
            process.exit(2)
        }
        let k=0;
        setInterval(() => {
            k++;
            if(k%3==0) 
            {
                if(buffer!='')
                {
                    const output = `${new Date().toLocaleTimeString('ro-ro')}: ${buffer.includes('\n') ? buffer.split('\n').join('\n'+(' ').repeat(new Date().toLocaleTimeString('ro-ro').length).trim()) : buffer}`;
                    ws.send(JSON.stringify({output}))
                    buffer = '';
                }
            }else
            {
                pm2.list((err, list) => {
                 //   console.log(err, list)
                ws.send(JSON.stringify({pm2: list, os: {cpu: os.cpus(), freememory: os.freemem(), totalMem: os.totalmem()}}))
            
            })
            }
           
        }, 200);
            
  })


})

let buffer = '';
// const data = new ReadableStream()
// data.pipeTo(process.stdout)
// If you want to create a readable stream and pipe to process.stdout in Node.js, use the following example:

const originalStdoutWrite = process.stdout.write.bind(process.stdout)
//@ts-ignore
process.stdout.write = (chunk, encoding, callback) => {
    if (typeof chunk === 'string') {
    buffer += chunk + "\n ";
  }

  return originalStdoutWrite(chunk, encoding, callback);
}


const originalStderrWrite = process.stdout.write.bind(process.stdout)
//@ts-ignore
process.stderr.write = (chunk, encoding, callback) => {
    if (typeof chunk === 'string') {
    buffer += `<span class='error'>${chunk}</span>\n`;
  }

  return originalStderrWrite(chunk, encoding, callback);
}

// Listen for 'data' events
// data.on('data', (chunk) => {
//     console.log('Data written:', chunk.toString());
//     buffer+=chunk.toString()+'\n';
// });


router.get('/api', (req, res) => {
    pm2.connect(function(err) {
  if (err) {
    console.error(err)
    res.send(err)
    process.exit(2)
  }


    pm2.list((err, list) => {
    //   console.log(err, list)
        res.send({pm2: list, os: {cpu: os.cpus(), freememory: os.freemem(), totalMem: os.totalmem()}})
      
    })
  })

})


// pm2.restart('api', (err, proc) => {
//         // Disconnects from PM2
//         pm2.disconnect()
//       })\


//   pm2.start({
//     script    : 'api.js',
//     name      : 'api'
//   }, function(err, apps) {
//     if (err) {
//       console.error(err)
//       return pm2.disconnect()
//     }
// })