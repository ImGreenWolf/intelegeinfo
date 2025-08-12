import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from './dbClient';
import { authMiddleware, parseText } from './server';
import { getIdFromJWT, getJWT, getUserData } from './usersManager';
import { Prisma } from '../../generated/prisma';
// import { rootDirName } from './server';
// import rootDirName from "./server"
const rootDirName = path.resolve("./")
const options: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
const router = express.Router();
const htmlHead = (title='intelege info', req: Request, desc?, keywords?) => parseText(`<head>
    <meta charset="UTF-8">
    <meta name="description" content="${desc}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="Radu Bitere">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Playwrite+DK+Loopet:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/guides.css">
   
    </head>
   <body>
    ^{&file:_header.html}
    
    `,req)

router.use('/guideCreator', express.static(path.join(rootDirName,"/public", "problems","guideCreator.html")))

router.get('/guideCreator/load/', express.static(path.join(rootDirName,"/public", "problems","guideCreator.html")))

router.get('/guideCreator/load/:name', authMiddleware, (req: Request, res: Response) => {
    prisma.guide.findFirst({

        where: 
        {
            name: decodeURI(req.params.name)
        }
    }).then(guide => {

        const html = 
    `<!DOCTYPE html>
<html lang="en-US, en, ro, ro-RO">
    <style>
        #main {
            display: flex;
            justify-content: space-around;
            min-height: 100vh;
            margin-top: 100px;
        }
        #preview {
            max-width: 100%;
            padding: 20px;
            margin-top: 0;
        }
        form {
            display: flex;
            flex-direction: column;
            width: 30%;
        }
        form input[type="text"]
        {
            height: 2lh;
        }
        form textarea {
            width: 100%;
            min-height: 700px;
        }
        form button[type="submit"] {
            height: 2lh;
        }
            content::after
        {
            content: none;
        }
    </style>
     

${htmlHead(guide.name, req, guide.description, guide.category)}
    <div id='main'>
        <form action="../../submit" method="post">
            <input type="text" name="gname" id="gname" value="${guide.name}">
            <input type="text" name="description" id="description" value="${guide.description}">
            <input type="text" name="category" id="category" value="${guide.category}">
            <textarea type="text"  name="content" id="content">${guide.content}</textarea>
            <button type="submit">Submit</button>
        </form>
        <article style="margin: 0;">
            <content id="preview" contenteditable="true">
            
            </content>
        </article>
    </div>
    <script>
        const preview = document.getElementById('preview')
        const content = document.getElementById('content');
        preview.innerHTML = content.value;
        content.oninput = (ev) => {
            preview.innerHTML = ev.target.value;
        }
        
    </script>
</body>
</html>`
    res.send(html)
    }).catch(err => {
        res.status(500).json({ error: 'Failed listing projects: ' + err });
    })
    
})



router.get('/', (req,res) => {
    getPosts(req).then(json => postsRequest(json.guideEntries, req, res, json.err))
})


router.get('/posts', (req,res) => {
    getPosts(req, req.query.take ? parseInt(req.query.take.toString()) : 5).then(json => res.send(json.guideEntries))})

async function getPosts(req: Request, take=10): Promise<{guideEntries: any, err?: string}>
{
    return new Promise((resolve, reject) => {
       
        const unparsedTags = req.query.tags as string
        const tags = unparsedTags ? unparsedTags.split(',').map(tag => tag.trim()) : []
        const search = req.query.search ? decodeURI(req.query.search as string) : undefined
        const term = search ? sanitizeSearchTerm(search) : undefined
        function sanitizeSearchTerm(term: string) {
            return term.replace(/[^a-zA-Z0-9\s]/g, '').trim();
        }

        const promise = term && term.length > 2 && !term.includes(' ') ? prisma.$queryRaw`
          SELECT
            g.*,
            t."id" AS "tagId",
            t."name" AS "tagName",
            ts_rank(
            setweight(to_tsvector('english', coalesce(g."name", '')), 'A') ||
            setweight(to_tsvector('english', coalesce(g."description", '')), 'B') ||
            setweight(to_tsvector('english', coalesce(t."name", '')), 'C'),
            plainto_tsquery('english', ${term})
            ) AS rank
        FROM "Guide" g
        LEFT JOIN LATERAL (
            SELECT
            t."id",
            t."name"
            FROM "GuideTag" gt
            JOIN "Tag" t ON t."id" = gt."tagId"
            WHERE gt."guideId" = g."id"
            LIMIT 5
        ) t ON true
        WHERE
            g."description" ILIKE '%' || ${term} || '%'
            OR g."name" ILIKE '%' || ${term} || '%'
            OR t."name" ILIKE '%' || ${term} || '%'
            OR to_tsvector('english', g."description") @@ plainto_tsquery('english', ${term})
            OR to_tsvector('english', g."name") @@ plainto_tsquery('english', ${term})
            OR to_tsvector('english', coalesce(t."name", '')) @@ plainto_tsquery('english', ${term})
        ORDER BY rank DESC
        LIMIT 10;
        `
        :
        prisma.guide.findMany({
            take,
            orderBy: {
                visits: 'desc',
            },
            include:
            {
                guideTags: {
                    include:
                    {
                        tag: true
                    },
                    take: 5
                }
            },
            where: 
            {
                guideTags: unparsedTags ? {
                    some: {
                        tag:
                        {
                            name: {
                                in: tags
                            }
                        }
                    }
                } : undefined,
                // description: search ? {
                //     contains: search,
                //     mode: 'insensitive'
                // } : undefined
            } 
        })
            promise.then(async guides  => {
            let res = guides
            if(term)
            {
                const guidess = {};

                for (const row of guides as any) {
                const guideId = row.id;

                if (!guidess[guideId]) {
                    guidess[guideId] = {
                    ...row,
                    tags: []
                    };
                }

                if (row.tagId) {
                    guidess[guideId].tags.push({
                    id: row.tagId,
                    name: row.tagName
                    });
                }
                }

                // Final array
                 res = Object.values(guidess);
            }

            const id = getIdFromJWT(req)
            const user = id ? await getUserData(getIdFromJWT(req)) : undefined
            const hasPermission = user ? user.role == 'ADMIN' : false
            let guideEntries = []
            for(const guide of res as any)
                guideEntries.push({
            name: guide.name,
            url: `guides/post/${encodeURI(guide.name)}`,
            html: 
                `
                <a href="guides/post/${encodeURI(guide.name)}">
                    <div>
                        ${hasPermission ? `<button onclick="event.preventDefault(); window.location.href = '/guides/guideCreator/load/${encodeURI(guide.name)}'"> Edit </button>` : ''}
                        ${term ?guide.tags.map(gtag => `<span>${gtag.name}</span>`).join(' ') : guide.guideTags.map(gtag => `<span>${gtag.tag.name}</span>`).join(' ')}
                    </div>
                    <h2>${guide.name}</h2>
                    <div>${guide.description || guide.content.substring(0, 100)}..</div>
                    <p style="font-size: 0.75em; opacity: 0.75; float: right">${guide.visits} 👁 </p>
                </a>
                `
                // ${guide.positiveRatings} ↑
                    
            })
            
            resolve({guideEntries})
        }).catch(err => reject({guideEntries: undefined, err}))
    })
    
}
async function postsRequest(guideEntries,req,res, error?)
{
    const tags = await prisma.tag.findMany({
        take: 6
    })
    let text = 
    `<head>
    ${htmlHead('Resurse', req, 'Descopera resursele intelegeinfo!')}
    <link rel="stylesheet" href="/css/resources.css">
    <div id='guides'>
        <div>
            <h2>Resurse</h2>
            <ul class="posts">
    
`
    const id = getIdFromJWT(req)
    const user = id ? await getUserData(getIdFromJWT(req)) : undefined
    const hasPermission = user ? user.role == 'ADMIN' : false
     
    if(!error && guideEntries)
    {
        for(const guide of guideEntries)
            text += `<li>${guide.html}</li>\n`
        text += `</ul></div>
        
        <vl></vl>
        <div class='side'>
            <h5>Cauta</h5>
            <input type="text" id="search-input">
            <h5>Filtreaza</h5>
            <ul class="tags">${tags ? tags.map(tag => `<li>${hasPermission ? `<a href="guides/tags/delete/${encodeURI(tag.name)}">-</a>` : ''}<span>${tag.name}</span></li>`).join('\n') : ''}</ul>
        </div></div>

        <script>
        const params = new URLSearchParams(location.search);
        let debouncer
        document.getElementById('search-input').oninput = (ev) => {
            if(debouncer)
                clearTimeout(debouncer)
            debouncer = setTimeout(() => {

                const text = ev.target.value

                if(ev.target.value.length <= 2 && text.length != 0)
                    return;
                if(text.length == 0)
                    params.delete("search")
                else
                    params.set("search", text)
                updateGuides(params)
            }, 100)
            
        }
        function updateGuides(params)
        {
            fetch('guides/posts?' + encodeURI(params.toString())).then(async val => {
                val.text().then(res => {
                    const json = JSON.parse(res)
                    let html = ''
                    if(json.length == 0)
                        html = '<p style="color: gray">Nu am gasit niciun rezultat!</p>'
                    else
                        for(const guide of json)
                            html += \`<li>\${guide.html}</li>\`;
                    document.getElementsByClassName('posts')[0].innerHTML = html
                })
                
            })
        }
        for(const tag of document.getElementsByClassName('tags')[0].children)
        {
            tag.onclick = (ev) => {
                const text = tag.querySelector('p').innerText
                if(params.has("tags", text))
                    params.delete("tags")
                else
                    params.set("tags", text)
                // if(window.location.search)
                //     if(window.location.search.includes(text))
                //     {
                //         params.delete("tags")
                //     }
                updateGuides(params)
            }
        }
        </script>`
        res.send(text)
    }
    else
        res.status(500).json({ error: 'Failed listing projects: ' + error });
}



// POST handler for form submission
router.post('/submit', (req: Request, res: Response) => {
    const { gname, content, description, category } = req.body as { gname: string; content: string; description: string; category: string}; //  TODO replace category with enum
   
       const tags =  category.split(',').map(tag => tag.trim())
        if(!getIdFromJWT(req))
            {
                res.status(401).send('Please login before publishing.')
                return 
            }
            // TODO Replace with upsert
        prisma.guide.update({
            where:
            {
                name: gname,
            },
            data:
            {
                content,
                description,
                category,
                updatedAt: new Date(),
                guideTags: {
                    deleteMany: {},

                    create: tags.map(tagName => ({
                        tag: {
                            connectOrCreate: {
                                where: { name: tagName },
                                create: { name: tagName }
                            }
                        }
                    }))
                },
                
                author: {
                    connect: {
                        id: getIdFromJWT(req)
                    }
                }
            }
        }).then(async guide => {
            
            res.send(`<head>${htmlHead(guide.name, req, guide.description, guide.category)} <h2>Updated ${gname}!</h2><p>Content:</p> <article>${content}</article>`);
        }).catch((err) => {
            console.log(err)
            try {
                prisma.guide.create({
                    data:
                    {
                        name: gname,
                        content,
                        description,
                        guideTags: {
                            create: tags ? tags.map(tagName => ({
                                tag: {
                                    connectOrCreate: {
                                        where: { name: tagName },
                                        create: { name: tagName }
                                    }
                                }
                            })) : []
                        },
                        author: {
                            connect: {
                                id: getIdFromJWT(req)
                            }
                        }
                    }
                }).then((guide) => {
                    res.send(`<head>${htmlHead(guide.name, req, guide.description, guide.category)} <h2>Uploaded ${gname}!</h2><p>Content:</p> <article>${content}</article>`);
                }).catch(err => {
                    res.status(500).send("Failed to create guide. Please make sure you're logged in. Otherwise submit a bug report");
                    console.error("Guide error:", err)
                })
            } catch (error) {
            console.error('Error creating problem:', error);
            res.status(500).send('Failed to upload');
            }
        })
        
       
    
});
router.get('/post/:name/like', (req: Request, res: Response) => {
     prisma.guide.update({
        where: 
        {
            name: decodeURI(req.params.name)
        },
        data:
        {
            positiveRatings:  { increment: 1 }
        }
    }).then(val => {
        res.send(val.positiveRatings)
    })
})
router.get('/post/:name/deslike', (req: Request, res: Response) => {
     prisma.guide.update({
        where: 
        {
            name: decodeURI(req.params.name)
        },
        data:
        {
            negativeRatings:  { increment: 1 }
        }
    }).then(val => {
        res.send('succes')
    })
})
router.get('/post/:name', (req: Request, res: Response) => {
    
    prisma.guide.update({
        where: 
        {
            name: decodeURI(req.params.name)
        },
        data:
        {
            visits:  { increment: 1 }
        }
    }).then((value)=> {
       

        try {

            
            // Filter for directories only

             // editor.on("paste", function(e) {
            //     e.text = e.text.replace(/[\r\n]+/g, " ");
            
            // });

            if(value.content.includes("REDIRECT TO PAGE"))
                res.redirect("../.."+value.content.substring(
                        ("REDIRECT TO PAGE").length,
                        value.content.indexOf(';')
                        ).trim())
            else
                //                        <button onclick="fetch('${value.name}/like')">like</button>
                        // <button onclick="fetch('${value.name}/deslike')">deslike</button>
            res.send(`
                <head>${htmlHead(value.name, req, value.description, value.category)} 
                
              

                <article> 
                  <div id="article-head">
                    <h1>${value.name}</h1>
                    <div style="display: flex; gap: 1em;">

                        <p>Vizualizari ${value.visits}</p>
                        <p>Postat ${new Date(value.createdAt).toLocaleString("ro-RO",options)}</p>
                    </div>
                </div>
                ${value.content} 
                </article>
                
                  
                
                <script src="/ace-builds-master/src-min-noconflict/ace.js"></script>
                <script>
                var codeTags = document.getElementsByTagName("code")
            for(const el of codeTags)
            {
                var editor = ace.edit(el);
            editor.setOptions({
                maxLines: 1, // make it 1 line
                autoScrollEditorIntoView: true,
                highlightActiveLine: false,
                printMargin: false,
                showGutter: false,
                mode: "ace/mode/c_cpp",
                theme: "ace/theme/editor-theme"
            });
            editor.container.style.pointerEvents="none"
            editor.renderer.setStyle("disabled", true)
            editor.blur()

            }
            




            var preTags = document.getElementsByTagName("pre")
            for(const el of preTags)
            {
                var editor = ace.edit(el);
                editor.setOptions({
                    // autoScrollEditorIntoView: true,
                    highlightActiveLine: false,
                    // printMargin: false,
                    // showGutter: false,
                    mode: "ace/mode/c_cpp",
                    minLines: 3,
                    theme: "ace/theme/editor-theme"
                });
                editor.container.style.pointerEvents="none"
            editor.renderer.setStyle("disabled", true)
            editor.blur()

            }
            
            
            
            
            </script>`)
        } catch (error) {
            console.error('Error processing folders:', error);
            res.status(500).json({ error: 'Failed to process folders' });
        }
    }).catch(err => {
         res.status(500).send('Error: ' + err);
    });
    
        
});

// router.get('/', (req: Request, res: Response) => {
//     prisma.guide.findMany({
//        take: 10,
//        orderBy: {
//         createdAt: "desc"
//        }
//     }).then(guides => {
//         let guideEntries = '';
//         for(const guide of guides)
//             guideEntries += `<li><a href="guides/post/${encodeURI(guide.name)}">${guide.name}</a></li>`


//         const html = 
//     `${htmlHead('Resurse')}
//     <content>
//     <ul style="font-family: Poppins">
//     ${guideEntries}
//     </ul>
//     </content>`
//     res.send(html)
//     }).catch(err => {
//         res.status(500).json({ error: 'Failed listing projects: ' + err });
//     })
    
// })


export default router;