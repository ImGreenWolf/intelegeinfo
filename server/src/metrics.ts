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

        setInterval(() => {
            pm2.list((err, list) => {
            //   console.log(err, list)
                ws.send(JSON.stringify({...list, os: {cpu: os.cpus(), freememory: os.freemem(), totalMem: os.totalmem()}}))
            
            })
        }, 300);
            
  })


})



router.get('/api', (req, res) => {
    pm2.connect(function(err) {
  if (err) {
    console.error(err)
    res.send(err)
    process.exit(2)
  }


    pm2.list((err, list) => {
    //   console.log(err, list)
        res.send({...list, os: {cpu: os.cpus(), freememory: os.freemem(), totalMem: os.totalmem()}})
      
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