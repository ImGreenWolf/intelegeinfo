import  Ace, { EditSession }  from "ace-builds";
import { client, CompileError, compileErrorObjs, createFile, dirtyFile, displayBlankEditor, displayMessagePopup, editorSessions, indexToFunctionName, isRemoteChange, MultiCursorManager, onFileSessionUpdated, openFile, parseCode, sendDebugCommand, sendWebsocketCommand, WebSocketMessageType, windows, ws } from "./codeEditor.js";
import { createNode } from "./components.js";
declare const ace: typeof Ace;
declare const sha256: any
export const cursorManagers: Map<string, MultiCursorManager> = new Map()

const preloadTabs = false;
var draggedTab: EditorWindowTab | null;
export class EditorWindow {

    element: HTMLElement;
    tabContainer: HTMLElement
    contentContainer: HTMLElement
    activeTab: EditorWindowTab | undefined
    previousActiveTab: EditorWindowTab | undefined
    editor: Ace.Editor | undefined | null
    index: number
    tabs: EditorWindowTab[] = []
    tooltip: TokenTooltip | undefined = undefined
    constructor(index, element, tabContainer, contentContainer)
    {   
        this.index = index
        this.tabContainer = tabContainer
        this.contentContainer = contentContainer
        this.element = element;


        this.element.ondrop = (ev) => dropHandler(ev, this)
        this.element.ondragover = dragoverHandler
        function dragoverHandler(ev) {
            ev.preventDefault();
        }

        function dropHandler(ev, window: EditorWindow) {
            ev.preventDefault();

            if(!draggedTab && ev.dataTransfer!.getData("name"))
            {
                const fileName: string = ev.dataTransfer!.getData("name")
                const fileContent = ev.dataTransfer!.getData("text")
                // const fileExists = editorSessions.has(fileName)
                let safeFileName = fileName
                let index = 1;
                if(!Number.isNaN(Number.parseInt(fileName.split('.')[0].at(-1)!)))
                {
                     index = parseInt(fileName.split('.')[0].at(-1)!)+1
                     safeFileName.slice(fileName.split('.')[0].length-1, fileName.split('.')[0].length)
                }
                
                while(editorSessions.has(safeFileName))
                {
                    safeFileName = `${fileName.split('.')[0]}-${index++}.${fileName.split('.')[1]}`
                }
                createFile(safeFileName, fileContent, window.index)
                return;
            }
            const elem = document.getElementsByClassName(draggedIdName)[0]

            
            
            // const data = ev.dataTransfer.getData("application/x-moz-node") as HTMLElement;
            
            elem.classList.remove(draggedIdName)
            
            if(!draggedTab)
                throw 'no dragged tab'
            console.log(draggedTab!.parentWindow, window)
            const prevWindow = draggedTab.parentWindow
            
            window.addTab(draggedTab)
            
            // client!.editorSession![window.index].editor! =  client!.editorSession![draggedTab!.parentWindow.index].editor!
            draggedTab!.parentWindow = window
            // openFile(draggedTab.name)
            draggedTab.openTab()
            // window.tabs.push(draggedTab)
            if(prevWindow)
                if(prevWindow.tabs.findIndex(val => val.name != draggedTab?.name) != -1)
                    prevWindow.tabs.find(val => val.name != draggedTab?.name)!.openTab(ev) // open another tab
                else
                {
                    // if there are no other tabs, open default content
                    // prevWindow.destroyEditor()
                    // client!.editorSession![draggedTab!.parentWindow.index].editor = undefined
                    window.editor = prevWindow.editor
                    prevWindow.editor?.container.remove()
                    prevWindow.editor = null
                    // client!.editorSession!.splice(draggedTab!.parentWindow.index,1)
                    // showDefaultScreen()
                    
                    // displayBlankEditor(draggedTab!.parentWindow.index)
                }
            if(!editorSessions.has(draggedTab.name))
                throw 'couldnt find editor session for dragged tab'
            
            


            draggedTab = null
        }
        
    }
    public destroyEditor()
    {
         if(!this.editor)
            console.error(new Error('Editor isnt valid'))
        else
        {
             this.editor.destroy()
            this.editor.container.remove()
            this.editor =undefined
        }
           
        
    }

    public createEditor(newSession?)
    {
        if(!this.editor)
        {
            console.log('creating new editor', newSession)
            const editor = createNode('div', {id: 'editor', className: 'editor'})
            this.contentContainer.appendChild(editor)
            this.editor = ace.edit(editor, {
                mode: "ace/mode/c_cpp",
                enableLiveAutocompletion: true,
                enableBasicAutocompletion: true,
                enableSnippets: true,
                placeholder: "scrie niste cod...",
                tooltipFollowsMouse: true,
                animatedScroll: true,
                useWorker:true,
                //   fontSize: "18px",
                //maxLines: 30,
                wrap: true,
                autoScrollEditorIntoView: true,
                enableCodeLens: true,
            });
            this.editor.setTheme("ace/theme/editor-theme");
            
            this.initializeEditor(newSession)
            
        }

        return this.editor
    }
    public getEditor(newSession?)
    {

       if(!this.editor)
        throw new Error('invalid editor')

        if(newSession)
        {
            // if(this.editor.session)
            //     draggedTab!.parentWindow.editor?.session.destroy()
            this.editor.setSession(newSession)
            // for(const session of editorSessions.values())
            //     if(session.fileElement?.parentWindow === this)
            //     session.editor = this.editor.getSession()
        }
            
       
        return this.editor
    }

    public setActiveFile(fileTab: EditorWindowTab)
    {
        if(!fileTab)
            throw 'invalid file tab'
        if(this.activeTab)
        {
            // if(this.previousActiveTab)
            //     this.previousActiveTab.element.classList.remove('open-file')
            // else
                this.activeTab.element.classList.remove('open-file')
            this.previousActiveTab = this.activeTab
            
        }
        this.activeTab = fileTab
        fileTab.element.classList.add('open-file')
        
    }

    protected initializeEditor(newSession?)
    {
        
        // TODO fix sessions, eg if you press to fix an error it fixes in the code window rather than in the chat window
        if(!this.editor)
            throw 'invalid editor while initializing';
        this.editor.setTheme("ace/theme/editor-theme");
        this.editor.setHighlightActiveLine(true);
        this.editor.resize();
        const windowEditor = this.editor;
        if(this.tooltip)
            this.tooltip.destroy()
         this.tooltip = new TokenTooltip(this.getEditor());
         if(newSession)
        {
            // if(this.editor.session)
            //     draggedTab!.parentWindow.editor?.session.destroy()
            this.editor.setSession(newSession)
            // for(const session of editorSessions.values())
            //     if(session.fileElement?.parentWindow === this)
            //     session.editor = this.editor.getSession()
        }
        const session = () => editorSessions.get(this.activeTab!.name)?.editor! || this.editor!.session
        

        cursorManagers.set(this.editor.id, new MultiCursorManager(windowEditor))
        // this.editor.on('keyboardActivity', () => {
        //     isRemoteChange = false;
            
        // })
        // const name = this.activeTab.name
        let parsedCode;
        this.editor.on('changeSession', (e) => 
        {
            if(!this.editor)
            return;
        // if(!this.activeTab)
        //     throw 'no active tab'
        // const name = this.activeTab.name
            //TODO Check if i can imrove the changedCss check, so it
            // doesnt create new listener for each update.
            let errorDisplay: HTMLDivElement | undefined;
            let errorDisplayTimeout: NodeJS.Timeout;
            
            !this.editor.session.getUndoManager().canRedo() ? document.getElementById('editor-redo')?.classList.add('enable') : document.getElementById('editor-redo')?.classList.remove('enable')
            !this.editor.session.getUndoManager().canUndo() ? document.getElementById('editor-undo')?.classList.add('enable') : document.getElementById('editor-undo')?.classList.remove('enable')
            this.editor.session.on('changeBreakpoint', e => {
        
            })
        
            this.editor.session.on('changeScrollTop', scrollTop => {
            // if(lastEv!=undefined)
            //   updateLocalCursor(lastEv)
            })
        
            function getContext(line, variable): {type: string}
            {
                return {type: "int"}
            }
            function getErrorInfo(compileErrorObj: CompileError): {link: string, fixFunction: () => void}
            {
            const mathces = compileErrorObj.text.match(/'.+?'/g)!
            console.log(mathces[0])
            const basicError = compileErrorObj.text.replaceAll(/'.+?'/g,'').trim()
            console.log(basicError)
            // TODO Improve this
            var cases = [
                {text: 'expected',
                test: (error) => error.includes('expected') ,
                return: {link: 'expected', fixFunction: () => {
                    const varName = mathces[0].replaceAll("'", '')
                    let i=1;
                    const searchRow = compileErrorObj.range.end.row;
                    const cond = () =>!(session().getLine(searchRow-i).trim().includes(';') || session().getLine(searchRow-i).trim() != '' && searchRow-i > 0) //(!editor.session.getLine(searchRow-i).trim().includes(';') || editor.session.getLine(searchRow-i).trim() == '') && searchRow-i > 0
                    while(cond())
                    {
                    console.log(cond(), session().getLine(searchRow-i).trim(), session().getLine(searchRow-i).trim().includes(';'))
                    i++
                    } 
                    const insertRange = {column: session().getLine(searchRow-i).length+1, row: searchRow-i}
                    session().insert(insertRange,`;`)
                    session().selection.selectWord()
                    // editor.selection.setRange(new Range({start: {row: insertRange.row, column: 0}, end: insertRange}))
                }}
                },
        
                {text: 'was not declared in this scope',
                test: (error) => error.includes('was not declared in this scope') ,
                    return: {link: 'undeclared', fixFunction: () => {
                    const varName = mathces[0].replaceAll("'", '')
                    const context = getContext(session().getLines(compileErrorObj.range.start.row, compileErrorObj.range.end.row), varName)
                    session().insert({column: 0, row: compileErrorObj.range.start.row},`\n`)
                    session().insert({column: compileErrorObj.range.start.column, row: compileErrorObj.range.start.row},`${context.type} ${varName};`)
                    session().selection.selectWord()
                }}
                },
            ]
        
            for(const elem of cases)
            {
                if(elem.test(basicError))
                return elem.return
            }
        
        
            return {link: '', fixFunction: () => {}}
            }
            this.editor.getSession().on('markerUpdate', (marker) => {
            if(!marker.changedCss) return;
        
            // TODO add marke events only to errored tokens
            marker.elem.addEventListener('mouseover', ev => {
                if(errorDisplay) return;
                if(errorDisplayTimeout)
                clearTimeout(errorDisplayTimeout)
                
                errorDisplayTimeout = setTimeout(() => {
                errorDisplay = document.createElement('div')
                const top = marker.elem.getBoundingClientRect().top;
                const left = marker.elem.getBoundingClientRect().left
                errorDisplay.style.cssText = `top: ${top}px; left: ${left}px; position: absolute;`
                errorDisplay.innerText = compileErrorObjs.get(marker.marker.id)!.text
                errorDisplay.classList.add('compile-error-tooltip')
        
                const errorInfo = getErrorInfo(compileErrorObjs.get(marker.marker.id)!)
                const actionsContainer = createNode('div', {css: "display: flex; gap: 10px; margin: 5px;"})
                actionsContainer.appendChild(createNode('a', {innerText: "Despre eroare", attributes: [{name: 'href', value: "/guides/post/"+errorInfo.link}]}))
                actionsContainer.appendChild(createNode('a', {innerText: "Repara", css: "text-decoration: underline; cursor: pointer;", onclick(ev) {
                    errorInfo.fixFunction()
                },}))
                errorDisplay!.appendChild(actionsContainer)
                document.body.appendChild(errorDisplay)
                compileErrorObjs.get(marker.marker.id)!.display = errorDisplay;
                }, 200);
                
            })
        
            if(errorDisplay)
                if(!errorDisplay.checkVisibility())
                {
                errorDisplay.remove();
                errorDisplay = undefined;
                }
                else
                errorDisplay!.addEventListener('mouseleave', ev => {
                if(errorDisplayTimeout)
                clearTimeout(errorDisplayTimeout)
                if(!errorDisplay) return;
        
                errorDisplay.remove();
                errorDisplay = undefined;
            })
            })
        
        })



        this.editor.on("change", (delta: any) => {
            if(!this.activeTab)
                console.error('no active tab')
            const name = this.activeTab!.name
            !windowEditor.session.getUndoManager().canRedo() ? document.getElementById('editor-redo')?.classList.add('enable') : document.getElementById('editor-redo')?.classList.remove('enable')
            !windowEditor.session.getUndoManager().canUndo() ? document.getElementById('editor-undo')?.classList.add('enable') : document.getElementById('editor-undo')?.classList.remove('enable')
            
            windowEditor.renderer.updateFull();
            parsedCode = parseCode();
            
            if (isRemoteChange) return;
                const code = windowEditor.getValue();
        
            if (!name) console.error("Current file name is invalid");
            if(name)
            dirtyFile(name)


            ws.send(
                JSON.stringify({
                delta: delta,
                type: WebSocketMessageType.CodeChange,
                fileName: name,
                saveFile: true,
                checksum: sha256(code)
                })
            ); // Send code to server on change // TODO Remove code from body.

            if(!navigator.onLine)
                displayMessagePopup('Se pare ca nu esti conectat la internet!')
        });
        
        this.editor.on("changeSelection", () => {
        if(!this.activeTab)
            throw 'no active tab'
        const name = this.activeTab.name
        if (isRemoteChange) return;
        // if( !isColabSession) return;
        const selection = windowEditor.getSelectionRange();
    
    
        // const start = selection.start;
        // const end = selection.end;
        // const range = new AceRange(start.row, start.column, end.row, end.column);
        // const selectedText = editor.session.getTextRange(range);
        // console.log(selectedText);
        if (!name) console.error("Current file name is invalid");
        ws.send(
            JSON.stringify({
            range: selection,
            fileName: name,
            type: WebSocketMessageType.CodeSelection,
            })
        ); // Send code to server on change
        });


          // TODO finish this
            const customCompleter = {
              getCompletions: function(editor: Ace.Editor, session: Ace.EditSession, pos, prefix, callback) {
                // if (prefix.length === 0) {
                //   callback(null, []);
                //   return;
                // }
                const line = session.getLine(pos.row).trim();
                let completions: any[] =[];
          
          
          
                
          
          
          
          
                if(line.includes("#include"))
                {
                    //   let completions = [
                    //   { caption: "ifstream", value: "ifstream", meta: "custom" },
                    //   { caption: "ofstream", value: "ofstream", meta: "custom" },
                    //   { caption: "fin", value: "fin", meta: "variable" },
                    //   { caption: "fout", value: "fout", meta: "variable" },
                    //   { caption: "createFile()", value: "createFile()", meta: "function" }
                    // ];
          
                    type lib = {
                      
                        description,
                        name
                        score
                      
                    }
                    const libraries = (tooltip.libraries[0] as lib[])
                    completions = libraries.map(lib => ({
                      caption: prefix.length > 0 ? `${lib.name}>` : `<${lib.name}>`,
                      value: prefix.length > 0 ?  `${lib.name}>` : `<${lib.name}>`,
                      meta: "library",
                      score: lib.score,
                      docHTML: `<b>&lt;${lib.name}&gt;</b><br>${lib.description}`
                    }));
                    // callback(null, completions);
                    
                }
                else
                {
                  if(!parsedCode) return callback(null, []);
                  if(!parsedCode.functions)  return callback(null, []);
                   completions = parsedCode.functions
                  //  .filter(c => {return c.name == indexToFunctionName(editor.session.doc.positionToIndex(editor.selection.getRange().start))?.name || c.name == undefined})
                   .map(c => ({
                    caption: c.name, snippet: c.value, meta: "function", score: 100,
                    docHTML: `${c.type} <b>${c.name}</b><pre>${c.content}</pre>`
                   }))
                    .concat(parsedCode.variables
                  .filter(c => {return c.functionName == indexToFunctionName(parsedCode, editor.session.doc.positionToIndex(editor.selection.getRange().start))?.name || c.functionName == undefined})
                  .map(c => ({
                    caption: c.name, value: c.name, meta: `${c.type} variable : ${c.functionName ? c.functionName : "Global"}`, score: 100,
                    docHTML: `${c.type} <b>${c.name}</b>`
                  })))
                }
               
          console.log(editor.session.doc.positionToIndex(editor.selection.getRange().start))
                console.log(indexToFunctionName(parsedCode, editor.session.doc.positionToIndex(editor.selection.getRange().start))?.name)
                callback(null, completions);
                
              }
            };
          
            // Register it
            ace.require("ace/ext/language_tools").addCompleter(customCompleter);
            var codeLens = ace.require("ace/ext/code_lens");
            const editor = this.editor
            
              const commandId = "createFileCommand";
            
              editor.commands.addCommand({
                name: commandId,
                exec: function(editor: Ace.Editor, args) {
                  const filename = args?.filename || "unnamed.txt";
                  createFile(filename)
                  openFile(filename)
                  editor.renderer.updateFull(true)
                  codeLens.clear(editor.session)
              }});
              editor.commands.addCommand({
                name: "include<fstream>",
                exec: function(editor: Ace.Editor, args) {
                  const index = editor.getValue().lastIndexOf("#include");
                  if(index == -1)
                    editor.session.insert({row: 0,column: 0}, "#include <fstream>\n")
                  else
                  {
                    const point = editor.session.doc.indexToPosition(index)
                    editor.session.insert({row: point.row+1,column: 0}, "#include <fstream>\n")
                  }
            
              }});
              editor.commands.addCommand({
                name: "usingnamespacestd",
                exec: function(editor: Ace.Editor, args) {
                  const index = editor.getValue().lastIndexOf("#include");
                  if(index == -1)
                    editor.session.insert({row: 0,column: 0}, "\nusing namespace std;\n")
                  else
                  {
                    const point = editor.session.doc.indexToPosition(index)
                    editor.session.insert({row: point.row+1,column: 0}, "\nusing namespace std;\n")
                  }
            
              }});
             
            
              // Register CodeLens provider
              codeLens.registerCodeLensProvider(editor, {
                provideCodeLenses: function(session, callback) {
                  const lines = session.getDocument().getAllLines();
                  const lenses: any = [];
            
                  const regex = /[i o]fstream\s+\w+\s*\(\s*["'](.+?)["']\s*\);/;
            
                  lines.forEach((line, row) => {
                    const match = line.match(regex);
                    if (match) {
                      const filename = match[1];
                      if(!editorSessions.has(filename))
                      lenses.push({
                        start: { row },
                        command: {
                          id: commandId,
                          title: `Create file "${filename}"`,
                          arguments: { filename }
                        }
                      });
            
                      if(!editor.getValue().includes("#include <fstream>"))
                        lenses.push({
                        start: { row },
                        command: {
                          id: "include<fstream>",
                          title: `Add #include <fstream>"`,
                          arguments: { }
                        }
                      });
            
                      
                    }
                    if(line.includes("#include <iostream>"))
                    if(!editor.getValue().includes("using namespace std;"))
                        lenses.push({
                        start: { row },
                        command: {
                          id: "usingnamespacestd",
                          title: `Add using namespace std;`,
                          arguments: { }
                        }
                      });
                  });
            
                  callback(null,lenses);
                }
              });



    }

   
    public addTab(newTab: EditorWindowTab)
    {
        
       
        this.tabs.push(newTab)
        newTab.parentWindow = this
        const content = newTab.content as HTMLElement
        if(preloadTabs)
            if(content.outerHTML)
            {
                this.contentContainer.appendChild(content)
                content.style.display = 'none'
            }

        if(this.tabContainer)
            this.tabContainer.appendChild(newTab.element)
    }
}

export class EditorWindowTab {
    element: HTMLElement;
    parentWindow!: EditorWindow;
    content: Ace.EditSession | HTMLElement | undefined;
    name: string;

    // public onDragEnd: undefined | (() => void)
    constructor(name, element: HTMLElement,content: typeof this.content, parentWindow?: EditorWindow, disableDrag?: boolean)
    {   
        this.name = name
        this.content = content
        
        this.element = element;
        if(!disableDrag)
            this.element.draggable =  true
        this.element.ondragstart = (ev) => dragstartHandler(this,ev)
        // element.ondragend = (ev) => this.onDragEnd!()
        function dragstartHandler(tab: EditorWindowTab, ev: DragEvent) {
            // ev.dataTransfer.setData("application/x-moz-node", element);
            if(tab.getDragText())
            {
                ev.dataTransfer!.setData("text", tab.getDragText()!);
                ev.dataTransfer!.setData("name", tab.name);
            }
           
            const elem = document.getElementsByClassName(draggedIdName)[0]
            if(elem)
                elem.classList.remove(draggedIdName);
            (ev.target! as HTMLElement).classList.add(draggedIdName)
            draggedTab = tab
        }

         if(parentWindow)
            parentWindow.addTab(this)

        this.element.onclick = (ev) => {
            this.openTab(ev)
        }
        
    }
    public getDragText: () => string | undefined = () => {return undefined}
    
    public openTab( ev?: MouseEvent)
    {
        if(!this.content)
        throw 'File tab content is undifined.'
        const elem = this.content as HTMLElement
        if(!this.parentWindow)
            windows[1].addTab(this)
        if(elem.outerHTML)
            this.onOpenTab(elem)
    }

    public onOpenTab(elem)
    {
        if(!this.parentWindow)
            throw 'no parent window'

        for(const child of this.parentWindow.contentContainer.children)
            if(this.parentWindow.contentContainer.children.length > 10)
                child.remove();
            else
                (child as HTMLElement).style.display = 'none';
            
        this.parentWindow.setActiveFile(this)

        if(!preloadTabs)
        {
            let foundElem
            for (let index = 0; index < this.parentWindow.contentContainer.children.length && !foundElem; index++) {
                if(this.parentWindow.contentContainer.children[index] == elem)
                    foundElem = elem
            }
            if(foundElem === undefined)
                this.parentWindow.contentContainer.appendChild(elem)
        }

            elem.style.display = '';
    }

    public remove()
    {
        this.element.remove()
        // if(client!.editorSession![this.parentWindow.index]!.fileElement!)
        // if(client!.editorSession![this.parentWindow.index]!.fileElement!.element == this.element)
        //     client!.editorSession[this.parentWindow.index].fileElement = undefined
        if(editorSessions.has(this.name))
            editorSessions.get(this.name)!.fileElement = undefined
        if(!this.parentWindow)
            return
        const index = this.parentWindow.tabs.findIndex(val => val.element == this.element)
        if(index == -1)
            throw 'couldnt find tab to remove'
        this.parentWindow.tabs.splice(index, 1)

                if((this.content as HTMLElement).outerHTML)
            (this.content as HTMLElement).remove()
    }
}

const draggedIdName = 'dragged'

export function updateCatalouge(sessionId, clientId)
{
    const catalouge = document.getElementById('tab-catalouge')



    const tabs =
    [
        createEditorTab('Subiecte', createNode('iframe', {css: 'width: 100%; height: 100%; border: none', attributes: [{name: 'src', value: '/subiecte'}]})),
        createEditorTab('Pbinfo', createNode('iframe', {css: 'width: 100%; height: 100%; border: none', attributes: [{name: 'src', value: 'https://www.pbinfo.ro/'}, {name: 'allow', value: "encrypted-media"}]})),
        createEditorTab('Probleme', createNode('iframe', {css: 'width: 100%; height: 100%; border: none', attributes: [{name: 'src', value: '/pages/problems.html?sessionId='+sessionId}]})),
        new TerminalTab()
        

    ]

    if(false) // TODO check if user is admin
    tabs.push(createEditorTab('Problem Creator', createNode('iframe', {css: 'width: 100%; height: 100%; border: none', attributes: [{name: 'src', value: '/pages/problemCreator.html?sessionId='+sessionId+'&clientId='+clientId}]})))


    for(const tab of tabs)
    {
        tab.element.ondragend = () => 
            {
                catalouge?.parentElement?.classList.remove('open')
                const index = tabs.findIndex(val => val === tab)
                tabs.splice(index, 1)
                if(tabs.length==0)
                    (catalouge?.parentElement as HTMLButtonElement).disabled = true;
            }
        catalouge?.appendChild(tab.element)
        
    }
    
}

function createTabElement(name) {
    return createNode('span', {className: "file-tab", html: [createNode('p', {innerText: name})]})
}

export function createEditorTab(name, content, disableDrag?)
{
    return new EditorWindowTab(name, createTabElement(name), content, undefined, disableDrag)
}
async function loadLanguages()
{
    const languageCarousel = document.getElementById('languageCarousel')
    if(!languageCarousel)
        return;

    const res = (await fetch('/editor/languages'))
    const languages: {name: string, src: string,ext?: string, description?: string, versions?, color?: string}[] = await res.json()
    
    let langaugeElements: HTMLElement[] = [];
    for(const language of languages)
        langaugeElements.push(createNode('div',  {className: 'language-button-wrapper', css: '--language-color: '+language.color, html: [createNode('button', 
        {   html: 
            [
                createNode('div', { css: "background-image: url(../media/logos/"+language.src+");",
                    className: 'language-logo',
                    attributes: [
                         {name: 'draggable', value: 'false'},
                        {name: 'aria-label', value: `Create ${language.name} project`}]}),
                createNode('p', {innerText: language.name})
            ],
            onhover: () => {
                document.getElementById('language-info-display')!.innerHTML =
                `
                    <p>${language.description}</p>
                    <img src="../media/logos/${language.src}" style='max-height:200px'>
               
                `
            },
            attributes: [
                // {name: 'tabindex',value: (i++).toString()},
                language.ext ? {name: 'onclick', value: `window.editor.createFile('main.${language.ext}'); `} : undefined,
                !language.ext ? {name: "disabled", value:  ''} : undefined
                ],
                className: 'custom-button'
        })
    ]})
    )
    for(let i=0;i<langaugeElements.length;i++)
        languageCarousel.replaceChild( langaugeElements[i],languageCarousel.children[i])  

    // for(let i=0;i<langaugeElements.length;i++)
    // {
    //     languageCarousel.replaceChild( langaugeElements[i],languageCarousel.children[i])  
    //     languageCarousel.children[i].animate([
    //     { opacity:"0%", transform: "translateY(-50%)"},
    //     { opacity: "100%",  transform: "translateY(0%)"},
    //   ],
    //   {
    //     duration: Math.random()*400 + 100,
    //     delay: Math.random()*20,
    //     // easing: "ease-out"
    //   })
    // }
       
}
export async function showDefaultScreen()
{
    const window = windows[0]
    window.destroyEditor()
       
    // const languages: {name, src,ext?, description?, versions?}[] = [
    //     {name: 'c++', src: 'c++-logo.png', ext: 'cpp'},
    //      {name: 'python', src: 'python-logo.webp', ext: 'py'},
    //     {name: 'javascript', src: 'js-logo.png',},// ext: 'js'},
    //     {name: 'typescript', src: 'ts-logo.svg',},// ext: 'ts'},
    //     {name: 'java', src: 'java-logo.webp',},// ext: 'java'},
    //     {name: 'go', src: 'Go-logo.png',},// ext: 'go'},
    //     {name: 'c', src: 'C-logo.png',}, //ext: 'c'},
    //     {name: 'html', src: 'html-logo.webp',},// ext: 'html'},
    //     {name: 'css', src: 'css-logo.png', },//ext: 'css'},
    //     {name: 'node.js', src: 'node.js-logo.webp',}// ext: 'js'},
    //     ]
    let langaugeElements: HTMLElement[] = [];
    for(let i=1; i<=8;i++)
        langaugeElements.push(createNode('div', 
        {   html: 
            [
                createNode('div', {
                    className: 'language-logo',
                    attributes: [
                         {name: 'draggable', value: 'false'}]}),
                createNode('p', {innerText: ''})
            ],
            attributes: [{name: 'disabled', value: 'true'}],
                className: 'custom-button'
        }))
    
    const languageCarousel =  createNode('div', {html:langaugeElements, className: 'language-carousel', id: 'languageCarousel'})
    const container = createNode('div', {className: 'default-screen', html: [
        createNode('div', {html: [
            createNode('h1', {innerText: 'Creaza un nou proiect'}),
            createNode('p', {innerText: 'Alege un limbaj in care sa-ti incepi proiectul. '}),
        ]}),
        
        languageCarousel,
        createNode('div', {className: 'language-info', id: 'language-info-display'})
    ]})



    // let offset = 0;
    // let velocity = 0;
    // let acc=0;
    // const drag = 2
    // let startTime: number | undefined = undefined;
    // let delta = 0;
    // let isDown=false
    // let lasPos=0
    // let realesed=true
    // container.onpointerdown = (ev) => {
    //     isDown = true;
    //     lasPos = ev.clientX 
    //     acc = 0
    //     cancelAnimationFrame(updateAnimFrame)
    //     // requestAnimationFrame((timestamp) => updateCarousel(timestamp,ev, false))
    // }

    // // updateCarousel(undefined, 0)
        

    // container.onpointerup = stopHolding
    // container.onpointercancel = stopHolding
    // container.onpointerout = stopHolding
    // let updateAnimFrame;
    // let deltaEventTime
    // let lastDeltaEventTime
    // container.onpointermove = function (ev) {
    //     if(!isDown)
    //         return;
    //     deltaEventTime=performance.now()
    //     requestAnimationFrame((timestamp) => updateCarousel(timestamp,ev, false))
    // }

    // function stopHolding(ev)
    // {
    //     if(!isDown)
    //         return
    //     isDown = false;
    //     deltaEventTime=performance.now()
    //     requestAnimationFrame((timestamp) => updateCarousel(timestamp, ev, true));
    // }

    // container.onwheel = (ev) =>
    // {
    //     const offsetVector = (ev.deltaY ) ;
    //     const newAcc = offsetVector*100
    //     acc =  Math.min(5,Math.abs(newAcc))*Math.sign(newAcc)
    //     deltaEventTime=performance.now()
    //     // lasPos = ev.deltaX
    //     if(!updateAnimFrame)
    //     requestAnimationFrame((timestamp) => 
    //     {
    //             updateCarousel(timestamp, ev, false, true)
    //     });
    //     true
    // }
    // function updateCarousel(timestamp,ev, update, fromScroll?)
    // {
    //     if(!startTime)
    //         startTime= delta
    //     if(!lastDeltaEventTime || update == true)
    //         lastDeltaEventTime=deltaEventTime
    //     delta = (timestamp - startTime) + (deltaEventTime - lastDeltaEventTime)
    //     lastDeltaEventTime=deltaEventTime
    //     let posX = ev ? ev?.clientX : lasPos
        
    //     let i=0
    //     const gap = 500
    //     for(const elem of languageCarousel.children) {
    //         // Custom modulo to handle negative values: ((n % m) + m) % m
    //         const totalWidth = languageCarousel.clientWidth + gap;
    //         const baseLeft = offset + totalWidth / languageCarousel.children.length * i++ + gap / 2;
    //         let wrappedLeft = ((baseLeft % totalWidth) + totalWidth) % totalWidth;
    //         // If baseLeft is exactly 0, set to totalWidth (wrap to end)
    //         if (baseLeft % totalWidth === 0 && baseLeft !== 0) {
    //         wrappedLeft = totalWidth;
    //         }
    //         (elem as HTMLElement).style.left = (wrappedLeft - 300) + 'px';
    //     }

         

    //     if(!update)
    //     {
    //         if(fromScroll)
    //         {

    //         }else
    //         {
    //              // if (typeof delta !== "number" || isNaN(delta)) delta = 1; // Ensure delta is valid
    //         const offsetVector = (posX - lasPos) * delta * -1;
    //         const newAcc = offsetVector 
    //         acc = Math.min(20,Math.abs(newAcc))*Math.sign(newAcc) ; // Use a smaller factor for smoother movement
    //         lasPos = posX;
    //         }
           

    //     }else {
    //         acc *= 0.98;
    //     }

        
    //     updateAnimFrame=undefined;
    //     offset += acc;
    //     if (!(Math.abs(acc) < 0.05 || isDown )) // Stop when velocity is low
    //         updateAnimFrame = requestAnimationFrame((timestamp) => updateCarousel(timestamp, ev, !isDown));
    //     console.log(acc, offset, isDown);
    //     startTime = timestamp;
    // }

    const tab = createEditorTab('Hello!', container, true)
    window.addTab(tab)
    window.setActiveFile(tab)
    tab.openTab(undefined)
    setTimeout(async () => {
        await loadLanguages()
    //     for(const elem of languageCarousel.children)
    //     elem.animate([
    //     { opacity:"0%", transform: "translateY(-50%)"},
    //     { opacity: "75%",  transform: "translateY(0%)"},
    //   ],
    //   {
    //     duration: 200,
    //     delay: Math.random()*200 + 50,
    //     easing: "ease-out",
    //     fill: "both"
    //   })

    }, 10);
    
}

let tooltip:any= {};
 fetch('/editor/tooltipHints').then(data => data.json().then(json => tooltip = json))
var event = ace.require("ace/lib/event");
var Range = ace.require("ace/range").Range;
var Tooltip = ace.require("ace/tooltip").Tooltip;

class TokenTooltip extends Tooltip {
    constructor(editor) {
        if (editor.tokenTooltip)
            return;
        super(editor.container);
        editor.tokenTooltip = this;
        this.editor = editor;
  
        this.update = this.update.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        event.addListener(editor.renderer.scroller, "mousemove", this.onMouseMove);
        event.addListener(editor.renderer.content, "mouseout", this.onMouseOut);

    }
    token = {};
    
    range = new Range();
    
    async update() {
        this.$timer = null;
        
        var r = this.editor.renderer;
        if (this.lastT - (r.timeStamp || 0) > 5000) {
            r.rect = null;
            r.timeStamp = this.lastT;
            this.maxHeight = window.innerHeight;
            this.maxWidth = window.innerWidth;
        }

        var canvasPos = r.rect || (r.rect = r.scroller.getBoundingClientRect());
        var offset = (this.x + r.scrollLeft - canvasPos.left - r.$padding) / r.characterWidth;
        var row = Math.floor((this.y + r.scrollTop - canvasPos.top) / r.lineHeight);
        var col = Math.round(offset);

        var screenPos = {row: row, column: col, side: offset - col > 0 ? 1 : -1};
        var session = this.editor.session;
        var docPos = session.screenToDocumentPosition(screenPos.row, screenPos.column);
        var token = session.getTokenAt(docPos.row, docPos.column);

        if (!token && !session.getLine(docPos.row)) {
            token = {
                type: "",
                value: "",
                state: session.bgTokenizer.getState(0)
            };
        }
        var tokenText= '';

        if(editorSessions.has(token.value)) // see inside files
        {
        //  this.hide();
          
          const fileText = await editorSessions.get(token.value)?.editor?.getValue() as string;
          tokenText = `<b>${token.value}</b>: <pre style="opacity: 0.75; max-height: 20lh; overflow: hidden;">${fileText}</pre>`
        } else
        if (!token || !tooltip.tooltips[token.value]) {
            session.removeMarker(this.marker);
            this.hide();
            return;
        }else
        {
          const tooltipValue = tooltip.tooltips[token.value] || undefined //(await (await fetch('/editor/tooltipHints/'+token.value)).json()).description;
          tokenText = tooltipValue.description + "\n<span>" + tooltipValue.example+"</span>";
        }
       

        if (token.state)
            tokenText += "|" + token.state;
        if (token.merge)
            tokenText += "\n  merge";
        if (token.stateTransitions)
            tokenText += "\n  " + token.stateTransitions.join("\n  ");

        if (this.tokenText != tokenText) {
            this.setHtml(tokenText);
            this.width = this.getWidth();
            this.height = this.getHeight();
            this.tokenText = tokenText;
        }
        if (!this.isOpen) {
            this.setTheme(r.theme);
            this.setClassName('ii-hoverHints')
        }

        this.show(null, this.x, this.y);

        this.token = token;
        session.removeMarker(this.marker);
        this.range = new Range(docPos.row, token.start, docPos.row, token.start + token.value.length);
        this.marker = session.addMarker(this.range, "ace_bracket", "text");
    };
    
    onMouseMove(e) {
        this.x = e.clientX;
        this.y = e.clientY;

        if (this.isOpen) {
            this.lastT = e.timeStamp;
            this.setPosition(this.x, this.y);
        }
        if (!this.$timer)
            this.$timer = setTimeout(this.update, this.isOpen ? 100 : 1500);
    };

    onMouseOut(e) {
        if (e && e.currentTarget.contains(e.relatedTarget))
            return;
        this.hide();
        this.editor.session.removeMarker(this.marker);
        this.$timer = clearTimeout(this.$timer);
    };

    setPosition(x, y) {
        if (x + 10 + this.width > this.maxWidth)
            x = window.innerWidth - this.width - 10;
        if (y > window.innerHeight * 0.75 || y + 20 + this.height > this.maxHeight)
            y = y - this.height - 30;

        Tooltip.prototype.setPosition.call(this, x + 10, y + 20);
    };

    destroy() {
        this.onMouseOut(undefined);
        event.removeListener(this.editor.renderer.scroller, "mousemove", this.onMouseMove);
        event.removeListener(this.editor.renderer.content, "mouseout", this.onMouseOut);
        delete this.editor.tokenTooltip;
    };

}

export class TerminalTab extends EditorWindowTab {
    terminal: Ace.Editor
    constructor() {
        const terminalElem = createNode('div', {className: 'terminal'})
        let terminal = ace.edit(terminalElem, {
            showGutter: false,
            enableBasicAutocompletion: false,
            displayIndentGuides: false,
            fontSize: 16,
            showLineNumbers: false,
            highlightActiveLine: false,
            showPrintMargin: false,
            wrap: true,
            theme: 'ace/theme/terminal'
        })
        terminal.setShowPrintMargin(false)
        terminal.renderer.setShowGutter(false)

        let prompt = "$ ";  // your prompt string
        terminal.setValue(prompt, -1); // set prompt and move cursor to end

        function runCommand(command: string) {
            // Simple commands for demonstration
            let output = "";
            switch (command.trim()) {
                case "help":
                    output = "Available commands: help, echo, clear";
                    break;
                case "":
                    output = "";
                    break;
                case "clear":
                    terminal.setValue(prompt, prompt.length);
                    return;
                default:
                    if (command.startsWith("echo ")) {
                        output = command.slice(5);
                    } else {
                        output = `Command not found: ${command}`;
                    }
            }
            terminal.insert("\n" + output + "\n" + prompt);
            // Move cursor to end
            terminal.gotoLine(terminal.session.getLength(), prompt.length);
        }

        // Prevent editing previous lines
        terminal.on("change", function(delta) {
            const lines = terminal.session.getDocument().getAllLines();
            const lastLine = lines[lines.length - 1];
            const cursor = terminal.getCursorPosition();
            if (cursor.row < lines.length - 1 || cursor.column < prompt.length) {
                terminal.gotoLine(lines.length, prompt.length);
            }
        });

        // Intercept Enter key to run command
        terminal.commands.addCommand({
            name: "runTerminalCommand",
            bindKey: { win: "Enter", mac: "Enter" },
            exec: function(editor: Ace.Editor) {
                const lines = editor.session.getDocument().getAllLines();
                const lastLine = lines[lines.length - 1];
                const command = lastLine.slice(prompt.length);
                // runCommand(command);
                ws.send(JSON.stringify({type: WebSocketMessageType.Console, action: 'container', body: command}))
            }
        });

        // Prevent backspacing the prompt
        terminal.commands.addCommand({
            name: "preventBackspacePrompt",
            bindKey: { win: "Backspace", mac: "Backspace" },
            exec: function(editor: Ace.Editor) {
                const pos = editor.getCursorPosition();
                const line = editor.session.getLine(pos.row);
                if (pos.column <= prompt.length) return;
                editor.remove("left");
            }
        });

       


        super('Terminal', createTabElement('Terminal'), terminalElem)

        this.terminal = terminal
    }

    public write(data: string)
    {
        this.terminal.session.insert({row: this.terminal.session.getLength()+1, column: 0}, "\n"+data)
    }
}

export function findTabByName(name): EditorWindowTab {
    let found;
    for(const window_ of windows)
        found = window_.tabs.find(tab => tab.name == name)
    return found
}