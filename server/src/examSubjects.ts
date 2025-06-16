import express, { Request, Response } from 'express';
import path from 'path';
import { rootDirName } from './server';
import fs from 'fs';
import { update } from './subiecteFetcher';


const router = express.Router();
export default router

router.get('/', async (req, res) => {
    const updates = await update()

    const mainDir = updates.dir
    

    let grid = ''
    if(mainDir)
    {
        const dateReg = /20\d*/g;
         for(const dir of fs.readdirSync(mainDir).sort((a,b) => a.includes('.') || b.includes('.') ? 0 : parseInt(b.match(dateReg)[0]) - parseInt(a.match(dateReg)[0])))
         {
            if(dir.includes('.'))
                continue
            let files = ''
            for(const file of fs.readdirSync(path.join(mainDir, dir)))
                files += `<a href='subiecte/file/${path.join(dir, file)}'>${file}</a><br>`
            if(dir.match(dateReg)!=undefined)
            {
                const title = dir.includes('model') ? "Modele" : dir.includes('ses_speciala') ? "Sesiune Speciala" : dir.includes('ses_iunie') || dir.includes('_iul') || dir.includes('_iun') ? "Sesiunea iunie-iulie" : ""
                grid += `<div><h2>${title} bac, anul ${(dir.match(dateReg)[0])}</h2>${files}</div>`
            }

         }
            
    }
       

    let html =

    `
    <style>
    #grid
    {
        display: flex;
        gap: 50px;
        flex-wrap: wrap;
        padding: 50px;
        justify-content: space-between;
    }

    </style>
    <div id='grid'>
    ${grid}

    </div>
    
    
    
    `



    res.status(200).send(html)
})
router.get('/file/:dir/:name', (req, res) => {

    
    res.sendFile(path.join(rootDirName, 'server', 'data', 'subiecte', req.params.dir, req.params.name))
})

