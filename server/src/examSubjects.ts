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
                files += `<a href='subiecte/file/${path.join(dir, file)}'>${file.replace(`E_d_Informatica_${dir.match(dateReg)[0]}_sp_`, '')
            .replace(`E_d_informatica_${dir.match(dateReg)[0]}_sp_`, '')
            .replace('.pdf', '').replaceAll('_', ' ')
            .replace('bar', 'barem').replace('var', 'varianta')
            .replace('MI','Mate info').replace('SN','Stiinte ale naturii')
            .replace('LRO','in Romana').replace('LMA','in Maghiara')
            .replace('C', 'C++')
        
        }</a><br>`
            if(dir.match(dateReg)!=undefined)
            {
                const title = dir.includes('model') ? "Modele" : dir.includes('ses_speciala') ? "Sesiune Speciala" : dir.includes('ses_iunie') || dir.includes('_iul') || dir.includes('_iun') ? "Sesiunea iunie-iulie" : ""
                grid += `<div><h2>${title} bac, anul ${(dir.match(dateReg)[0])}</h2>${files}</div>`
            }

         }
            
    }
       

    let html =

    `
    <head>
    <meta charset="UTF-8">
    <meta name="description" content="Subiectele de informatica de la bacaulerautul de clasa a 12-a.">
    <meta name="keywords" content="bac, bacalaureat, subiecte info, subiecte, mateinfo,2025,2026,2024,probleme,probleme info">
    <meta name="author" content="Radu Bitere">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Subiecte Bac</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Playwrite+DK+Loopet:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/guides.css">
    
    </head>

    <style>
    #grid
    {
        display: flex;
        gap: 50px;
        flex-wrap: wrap;
        padding: 50px;
        justify-content: space-between;
        font-family: Poppins;


        :any-link
        {
        color: black;
        }
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

