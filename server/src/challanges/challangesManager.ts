import express, { Request, Response } from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import path from 'path';


const router = express.Router();
router.use(bodyParser.json());
export default router; 

import { parseText, rootDirName } from '../server';

const htmlPath = path.join(rootDirName, 'server', 'src','challanges','html')


router.get('/', (req,res) => {
    const classPath = path.join(rootDirName, 'public', 'editor.html') //path.join(htmlPath, 'index.html')
    try {
        const text = fs.readFileSync(classPath).toString().split('\n')
        const index = text.findIndex(line => line.includes('</head>'))
        const out = [...text.slice(0,index), "<script src='/client/scripts/challanges/clientChallange.js' type='module'></script>", ...text.slice(index)].join('\n')
        
        res.contentType('html').send(parseText(out, req))

    } catch (error) {
        console.warn(error)
        // res.contentType('html').send(parseText(fs.readFileSync(classPath).toString() , req))
    }
})