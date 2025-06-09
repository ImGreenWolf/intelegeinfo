import pm2 from 'pm2'
import express, { Request, Response } from 'express';
import path from 'path';
import { rootDirName } from './server';

const router = express.Router();
export default router
router.get('/', (req, res) => {
    res.sendFile(path.join(rootDirName, 'public', 'pages', 'metrics.html'))
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
        res.send(list)
      
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