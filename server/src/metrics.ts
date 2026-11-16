import pm2 from 'pm2'
import express, { Request, Response } from 'express';
import path from 'path';
import { rootDirName } from './server';
import WebSocket from 'ws';
import os from "os"
import prisma from './dbClient';
const router = express.Router();
export default router
router.get('/', (req, res) => {
    res.sendFile(path.join(rootDirName, 'public', 'pages', 'metrics.html'))
})

router.get('/feedback', async (req, res) => {
  const feedback = await prisma.feedback.findMany({
    take: 100, 
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        omit: {
          password: true,
        }
      }
    }
  })

  res.send(feedback)
})

export const wssAPI = new WebSocket.Server({noServer: true, clientTracking: true,  });
wssAPI.on('connection', ws => {
    console.log('admin connected to metrics: displaying pm2')
     pm2.connect(function(err) {
        if (err) {
            console.error(err)
            ws.send(JSON.stringify({err}))
            return;
        }
        let k=0;
        const timer = setInterval(() => {
            if (ws.readyState !== WebSocket.OPEN) return;
            k++;
            if(k%3==0) 
            {
                if(buffer!='')
                {
                    const output = `${new Date().toLocaleTimeString('ro-ro')}: ${buffer.includes('\n') ? buffer.split('\n').join('\n '+('&#32').repeat(new Date().toLocaleTimeString('ro-ro').length)) : buffer}\n`;
                    ws.send(JSON.stringify({output}))
                    buffer = '';
                }
            }else
            {
                pm2.list((err, list) => {
                 //   console.log(err, list)
                if (ws.readyState === WebSocket.OPEN)
                    ws.send(JSON.stringify({pm2: list, os: {cpu: os.cpus(), freememory: os.freemem(), totalMem: os.totalmem()}}))
            
            })
            }
           
        }, 200);
        ws.once('close', () => clearInterval(timer));
            
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
    buffer = buffer.slice(-100000);
  }

  return originalStdoutWrite(chunk, encoding, callback);
}


const originalStderrWrite = process.stderr.write.bind(process.stderr)
//@ts-ignore
process.stderr.write = (chunk, encoding, callback) => {
    if (typeof chunk === 'string') {
    buffer += `<span class='error'>${chunk}</span>\n`;
    buffer = buffer.slice(-100000);
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
    return;
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
