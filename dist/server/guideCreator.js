"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dbClient_1 = __importDefault(require("./dbClient"));
const server_1 = require("./server");
// import { rootDirName } from './server';
// import rootDirName from "./server"
const rootDirName = path_1.default.resolve("./");
const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
};
const router = express_1.default.Router();
const htmlHead = (title = 'intelege info', desc, keywords) => `<head>
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
    <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-D9ZPLVG5XF"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-D9ZPLVG5XF');
</script>

    <header2>
            <h2>Intelegeinfo</h2>
            <nav>
                <ul>
                    <li><a href="/">Pornire</a></li>
                    <li><a href="/editor">Editor</a></li>
                    <li><a href="/guides">Resurse</a></li>
                    <li><a href="/subiecte">Subiecte</a></li>
                </ul>
            </nav>
            
        </header2>
    
    `;
router.use('/guideCreator', express_1.default.static(path_1.default.join(rootDirName, "/public", "problems", "guideCreator.html")));
router.get('/guideCreator/load/', express_1.default.static(path_1.default.join(rootDirName, "/public", "problems", "guideCreator.html")));
router.get('/guideCreator/load/:name', server_1.authMiddleware, (req, res) => {
    dbClient_1.default.guide.findFirst({
        where: {
            name: decodeURI(req.params.name)
        }
    }).then(guide => {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
       
 </head>
    <style>
        #main {
            display: flex;
            justify-content: space-around;
            min-height: 100vh;
            margin-top: 20px;
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
     
<body>
${htmlHead(guide.name, guide.description, guide.category)}
    <div id='main'>
        <form action="../../submit" method="post">
            <input type="text" name="gname" id="gname" value="${guide.name}">
            <input type="text" name="description" id="description" value="${guide.description}">
            <input type="text" name="category" id="category" value="${guide.category}">
            <textarea type="text"  name="content" id="content">${guide.content}</textarea>
            <button type="submit">Submit</button>
        </form>
        <article style="margin: 0;">
            <content id="preview">
            
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
</html>`;
        res.send(html);
    }).catch(err => {
        res.status(500).json({ error: 'Failed listing projects: ' + err });
    });
});
router.get('/', (req, res) => {
    getPosts().then(json => postsRequest(json.guideEntries, req, res, json.err));
});
router.get('/posts', (req, res) => {
    getPosts().then(json => res.send(json.guideEntries));
});
async function getPosts() {
    return new Promise((resolve, reject) => {
        dbClient_1.default.guide.findMany({
            take: 10,
            orderBy: {
                visits: 'desc'
            }
        }).then(guides => {
            let guideEntries = [];
            for (const guide of guides)
                guideEntries.push({ name: guide.name, html: `<a href="guides/post/${encodeURI(guide.name)}"><h2>${guide.name}</h2></a>
            <div>${guide.description || guide.content.substring(0, 100)}..</div>
            <p style="font-size: 0.75em; opacity: 0.75; float: right">${guide.visits} viz</p>
            `
                });
            resolve({ guideEntries });
        }).catch(err => reject({ guideEntries: undefined, err }));
    });
}
function postsRequest(guideEntries, req, res, error) {
    let text = `
    ${htmlHead('Resurse', 'Descopera resursele intelegeinfo!')}
    <style>
    body
    {
        background-color: rgb(20,20,20);
        font-family: Poppins;
    }
    #guides
    {

    ul
    {
        display: grid;
        grid-auto-flow: column;
        gap: 1.5em;
        color: rgb(255, 255, 255);
        justify-content: start;
        position: relative;
        // font-size: 0.5rem;
        padding: 5em;
        li 
        {
            max-width: 200px;
            min-width: 50px;
            max-height: 200px;
            min-height: 50px;
            aspect-ratio: 1;
            background-color: rgb(26, 28, 31);;
            padding: 1.5em;
            text-overflow: ellipsis;
            overflow: hidden;
            cursor: pointer;
            list-style: none;
            div
            {
                font-size: 0.75em
            }
            
        }

        :any-link
        {
            color: rgb(255, 255, 255)
        }
    }
}
    </style>
    <div id='guides'><ul>
`;
    if (!error || guideEntries) {
        for (const guide of guideEntries)
            text += "<li>" + guide.html + "</li>\n";
        text += '</ul></div>';
        res.send(text);
    }
    else
        res.status(500).json({ error: 'Failed listing projects: ' + error });
}
// POST handler for form submission
router.post('/submit', (req, res) => {
    const { gname, content, description, category } = req.body; //  TODO replace category with enum
    dbClient_1.default.guide.update({
        where: {
            name: gname,
        },
        data: {
            content,
            description,
            category,
            updatedAt: new Date(),
            author: "Radu" // TODO Replace with user name
        }
    }).then(guide => {
        res.send(`${htmlHead(guide.name, guide.description, guide.category)} <h2>Updated ${gname}!</h2><p>Content:</p> <article>${content}</article>`);
    }).catch(() => {
        try {
            dbClient_1.default.guide.create({
                data: {
                    name: gname,
                    content,
                    description,
                    category,
                }
            }).then((guide) => {
                res.send(`${htmlHead(guide.name, guide.description, guide.category)} <h2>Uploaded ${gname}!</h2><p>Content:</p> <article>${content}</article>`);
            }).catch(err => {
                res.status(500).send('Failed to create problem: ' + err);
            });
        }
        catch (error) {
            console.error('Error creating problem:', error);
            res.status(500).send('Failed to upload');
        }
    });
});
router.get('/post/:name', (req, res) => {
    dbClient_1.default.guide.update({
        where: {
            name: decodeURI(req.params.name)
        },
        data: {
            visits: { increment: 1 }
        }
    }).then((value) => {
        try {
            // Filter for directories only
            // editor.on("paste", function(e) {
            //     e.text = e.text.replace(/[\r\n]+/g, " ");
            // });
            if (value.content.includes("REDIRECT TO PAGE"))
                res.redirect("../.." + value.content.substring(("REDIRECT TO PAGE").length, value.content.indexOf(';')).trim());
            else
                res.send(htmlHead(value.name, value.description, value.category) +
                    `
              

                <article> 
                  <div id="article-head">
                    <h1>${value.name}</h1>
                    <div style="display: flex; gap: 1em;">
                        <p>Vizualizari ${value.visits}</p>
                        <p>Postat ${new Date(value.createdAt).toLocaleString("ro-RO", options)}</p>
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
                    maxLines: 15,
                    theme: "ace/theme/editor-theme"
                });
                editor.container.style.pointerEvents="none"
            editor.renderer.setStyle("disabled", true)
            editor.blur()

            }
            
            
            
            
            </script>`);
        }
        catch (error) {
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
exports.default = router;
