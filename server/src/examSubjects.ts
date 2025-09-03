import express, { Request, Response } from 'express';
import path from 'path';
import { parseText, rootDirName } from './server';
import fs from 'fs';
import { update } from './subiecteFetcher';
import cookieParser from 'cookie-parser';


const router = express.Router();
router.use(cookieParser())
export default router
enum Sessions {
  IunieIulie = 0,
  AugustSeptembrie = 1,
  Special = 2,
  Model = 3
}



const formatName = (filename: string, split=false) => {
      const params =  (split ? filename.split('.')[0] : filename)
      .replaceAll(' ','_')
      .split('_')
      if(['m','s'].includes(filename[0]))
        return `${params[0] == 'm' ? 'MI -' : 'SN -'} Varianta ${params[2]}`
      else
        return (split ? filename.split('.')[0] : filename).replaceAll(' ','_')
    }

    const unformatName = (filename: string) => {
      const params =  filename
      .replaceAll('_',' ')
      .split(' ')
      if(['MI','SN'].includes(filename.substring(0, 2)))
        return `${params[0] == 'MI' ? 'm' : 's'}_var_${params[3]}`
      else
        return filename.replaceAll('_',' ')
    }

let searchFields: {data?: {year?, sections?: {name, folderPath, variants: {name, file, barem}[]}[]}[]} = {data: []}
let lastUpdate = Date.now()

let grid = updateSubjectsGrid()



function updateSubjectsGrid() {
      let grid = ''
     lastUpdate = Date.now()

     const addVariant = (variant: {name, file, barem}, folderPath) => {
      return `<div class='variant-container'><a href='${folderPath + variant.file}'>${variant.name}</a><a href='${folderPath + variant.barem}'>${(variant.barem.split('.')[1] as string)[0].toLocaleUpperCase() + (variant.barem.split('.')[1] as string).substring(1)}</a></div>`
    }
    const addSections = (sections: {name, folderPath, variants: {name, file, barem}[]}, year) => {
      return `<h2>${sections.name}</h2>
                <div class='section-list'>
                    ${sections.variants.map(variant => addVariant(variant, `subiecte/file/${year}/${sections.folderPath}/`)).join('\n')}
                </div>`
    }
    const subjectFormat = (year, sections: {name, folderPath, variants: {name, file, barem}[]}[]) => {
      searchFields.data.push({year, sections})
      return `<div class='subject-container'>
            <h1>${year}</h1>
            <section class='subject-list'>
                ${sections.map(section => addSections(section, year)).join('\n')}
            </section>
        </div>`
    }

    

    const mainDir = path.join(rootDirName, 'server','data','formatedSubjects')
    if(mainDir)
    {
      
         for(const dir of fs.readdirSync(mainDir))
         {
            const sections: {name, folderPath, variants: {name, file, barem}[]}[] = []

            for(const section of fs.readdirSync(path.join(mainDir, dir)))
            {
              const variants: {name, file, barem}[] = []
              const varBarem: Map<string, typeof variants[number]> = new Map()
              var globalBarem = undefined;
              for(const variant of fs.readdirSync(path.join(mainDir, dir, section)))
              {
                const name = variant.split('.')[0]
                // if(name == '$GLOBAL')
                  
                // if(varBarem.has(name))  
                //   variants.push({name: formatName(varBarem.get(name)), file: formatName(varBarem.get(name))+'.pdf', barem: formatName(varBarem.get(name))+'.barem.pdf'})
                // else if(variant.split('.')[1] != 'pdf')
                // {
                //   varBarem.set(name, variant)
                // // variants.push({name, file: varBarem.get(name).split('.')[0]+'.pdf', barem: varBarem.get(name).split('.')[0]+'.barem.pdf'})
                // }
                if(name == '$GLOBAL')
                  {
                    globalBarem = variant
                    continue
                  }
                if(variant.split('.')[1] == 'pdf')
                  if(varBarem.has(name))
                    varBarem.get(name).file = formatName(variant).replaceAll(' ','_')
                  else
                    varBarem.set(name, {name: formatName(variant, true), file: formatName(variant).replaceAll(' ','_'), barem: globalBarem})
                else
                  if(varBarem.has(name))
                    varBarem.get(name).barem = formatName(variant)
                  else
                    varBarem.set(name, {name: formatName(variant, true), file: undefined, barem: globalBarem || formatName(variant).replaceAll(' ','_')})
                
                
               

              }
              for(const val of varBarem.values())
                variants.push(val)

              sections.push({name: unformatName(section), variants, folderPath: section})

            }


            grid += subjectFormat(dir, sections)
         }
            
    }
    return grid
}



router.get('/', async (req, res) => {

    if(Date.now() - lastUpdate > 1000 * 60 * 60 * 12) // update cache only after 12 hours elapsed
       grid = updateSubjectsGrid()

    let html =

    `
    <head>
    <meta charset="UTF-8">
    <meta name="description" content="Subiectele de informatica de la bacaulerautul de clasa a 12-a.">
    <meta name="keywords" content="bac, bacalaureat, subiecte info, subiecte, mateinfo,2025,2026,2024,2023,2022,2021,2020,2019,2018,probleme,probleme info">
    <meta name="author" content="Radu Bitere">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Subiecte Bacalaureat</title>

    <meta name="google-adsense-account" content="ca-pub-8688715521861715">

    <meta property="og:title" content="Intelegeinfo" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://intelegeinfo.ro/" />
    <meta property="og:image" content="https://intelegeinfo.ro/media/colaboration-demo.png" />
    <meta property="og:description" content="Editorul colaborativ de cod online creat de elevi, pentru elevi." />


    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Playwrite+DK+Loopet:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/subjects.css">
    
    </head>
    <body>
    ^{&file:_header.html}
   
   
    <div id='grid'>
    ${grid}
    </div>
    </body>
    `
//  <input id='search-input'>
//     <div id='display' style='display: flex; flex-direction: column; gap: 0.5em; position: absolute;background: black; padding: 1em;'></div>
//     <script src='/client/scripts/subjects/search.js'></script>


    res.status(200).send(parseText(html, req))
})




router.use('/pdf', express.static(path.join(rootDirName, 'server', 'libs','pdf')))

router.get('/file/:year/:sub/:file', (req, res) => {

    
    // res.sendFile(path.join(rootDirName, 'server', 'data', 'subiecte', req.params.dir, req.params.name))
    const dir = path.join(req.params.year, req.params.sub, unformatName(req.params.file))
    console.log(req.url, dir)
    try 
    {
       if(!req.headers['referer'])
        throw 'no referer'
      else
        if(!req.headers['referer'].includes('file') && req.headers['sec-fetch-dest']=='iframe')
          res.status(200).contentType('html').send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>PDF Viewer</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>html, body { margin: 0; height: 100%; }</style>
            </head>
            <body>
              <iframe
                src="/subiecte/pdf/web/viewer.html?file=${path.relative('./subiecte/pdf/web/', path.join('subiecte','file', path.join(req.params.year, req.params.sub, req.params.file)))}"
                width="100%"
                height="100%"
                style="border: none;">
              </iframe>
            </body>
          </html>
          `);
          else throw 'not iframe'
    }
   catch(err)
   {
    res.status(200).sendFile(path.join(rootDirName, 'server', 'data', 'formatedSubjects', dir))
   }

})




router.get('/search', (req, res) => {

  let input = req.query.input as string

  function calcScore(entry: string)
  {
      let i=0;
      let matchingChars = 0
      let lasCharIndex =0;
      if(entry.toLocaleLowerCase().includes(input.toLocaleLowerCase()))
        matchingChars = input.length*10
      else
      for(const char of input.toLowerCase().trim())
      {
        const map = entry.toLowerCase().trim().split('').filter(schar => schar == char).map((val ,index) => index)
        if(map.length == 0)
          matchingChars -= 1
        else
        for(const index of map)
        {
          // if(index == i)
          //   matchingChars +=  5
          matchingChars += 1
          
        }
          // if(index != -1)
          // {
          //    if(index == i)
          //         matchingChars +=  2
          //     if (lasCharIndex+1==index)
          //         matchingChars +=  3
          //     matchingChars += 1

          //     // lasCharIndex=index
          // }
             

          
          i+=1;

      }
      return matchingChars
  }



  const output = flatten(searchFields.data).map(
      entry => {return {score: calcScore(entry.val), entry}} 
  ).sort(
      (a,b) =>  b.score - a.score
  )


  res.send(JSON.stringify(output))
})



type EntriesType = {year?, sections?: {name, folderPath, variants: {name, file, barem}[]}[]}[]

function flatten(obj: EntriesType) {

    const result: {val: string, file: string}[] = [];
    for(const entry of obj)
      for(const section of entry.sections)
        for(const variant of section.variants)
      {
        const name = entry.year + " " + section.name + " " + variant.name
        result.push({val: name, file: section.folderPath + variant.file})

      }
    return result
}

