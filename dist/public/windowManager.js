import { client, compileErrorObjs, createFile, dirtyFile, editorSessions, indexToFunctionName, isRemoteChange, MultiCursorManager, openFile, parseCode, tooltip, WebSocketMessageType, windows, ws } from "./codeEditor.js";
import { createNode } from "./components.js";
export const cursorManagers = new Map();
const preloadTabs = false;
var draggedTab;
export class EditorWindow {
    element;
    tabContainer;
    contentContainer;
    activeTab;
    previousActiveTab;
    editor;
    index;
    tabs = [];
    constructor(index, element, tabContainer, contentContainer) {
        this.index = index;
        this.tabContainer = tabContainer;
        this.contentContainer = contentContainer;
        this.element = element;
        this.element.ondrop = (ev) => dropHandler(ev, this);
        this.element.ondragover = dragoverHandler;
        function dragoverHandler(ev) {
            ev.preventDefault();
        }
        function dropHandler(ev, window) {
            ev.preventDefault();
            if (!draggedTab && ev.dataTransfer.getData("name")) {
                const fileName = ev.dataTransfer.getData("name");
                const fileContent = ev.dataTransfer.getData("text");
                // const fileExists = editorSessions.has(fileName)
                let safeFileName = fileName;
                let index = 1;
                if (!Number.isNaN(Number.parseInt(fileName.split('.')[0].at(-1)))) {
                    index = parseInt(fileName.split('.')[0].at(-1)) + 1;
                    safeFileName.slice(fileName.split('.')[0].length - 1, fileName.split('.')[0].length);
                }
                while (editorSessions.has(safeFileName)) {
                    safeFileName = `${fileName.split('.')[0]}-${index++}.${fileName.split('.')[1]}`;
                }
                createFile(safeFileName, fileContent, window.index);
                return;
            }
            const elem = document.getElementsByClassName(draggedIdName)[0];
            const data = ev.dataTransfer.getData("application/x-moz-node");
            elem.classList.remove(draggedIdName);
            if (!draggedTab)
                throw 'no dragged tab';
            console.log(draggedTab.parentWindow, window);
            if (draggedTab.parentWindow)
                if (draggedTab.parentWindow.tabs.findIndex(val => val.name != draggedTab?.name) != -1)
                    draggedTab.parentWindow.tabs.find(val => val.name != draggedTab?.name).openTab(ev);
                // openFile(draggedTab.parentWindow.tabs[0].name)
                else {
                    // const session = ace.createEditSession('')
                    // draggedTab!.parentWindow.editor?.setSession(session)
                    draggedTab.parentWindow.destroyEditor();
                    client.editorSession[draggedTab.parentWindow.index].editor = undefined;
                    // showDefaultScreen()
                    // displayBlankEditor(draggedTab!.parentWindow.index)
                }
            window.addTab(draggedTab);
            // client!.editorSession![window.index].editor! =  client!.editorSession![draggedTab!.parentWindow.index].editor!
            draggedTab.parentWindow = window;
            openFile(draggedTab.name);
            // window.tabs.push(draggedTab)
            if (!editorSessions.has(draggedTab.name))
                throw 'couldnt find editor session for dragged tab';
            draggedTab = null;
        }
    }
    destroyEditor() {
        if (this.editor) {
            this.editor.destroy();
            this.editor.container.remove();
            this.editor = undefined;
        }
    }
    getEditor(newSession) {
        if (!this.editor) {
            console.log('creating new editor');
            const editor = createNode('div', { id: 'editor', className: 'editor' });
            this.contentContainer.appendChild(editor);
            this.editor = ace.edit(editor, {
                mode: "ace/mode/c_cpp",
                enableLiveAutocompletion: true,
                enableBasicAutocompletion: true,
                enableSnippets: true,
                placeholder: "scrie niste cod...",
                tooltipFollowsMouse: true,
                animatedScroll: true,
                useWorker: true,
                //   fontSize: "18px",
                //maxLines: 30,
                wrap: true,
                autoScrollEditorIntoView: true,
                enableCodeLens: true,
            });
            this.editor.setTheme("ace/theme/editor-theme");
            this.initializeEditor(newSession);
        }
        if (newSession) {
            // if(this.editor.session)
            //     draggedTab!.parentWindow.editor?.session.destroy()
            this.editor.setSession(newSession);
            // for(const session of editorSessions.values())
            //     if(session.fileElement?.parentWindow === this)
            //     session.editor = this.editor.getSession()
        }
        return this.editor;
    }
    setActiveFile(fileTab) {
        if (!fileTab)
            throw 'invalid file tab';
        if (this.activeTab) {
            // if(this.previousActiveTab)
            //     this.previousActiveTab.element.classList.remove('open-file')
            // else
            this.activeTab.element.classList.remove('open-file');
            this.previousActiveTab = this.activeTab;
        }
        this.activeTab = fileTab;
        fileTab.element.classList.add('open-file');
    }
    initializeEditor(newSession) {
        // TODO fix sessions, eg if you press to fix an error it fixes in the code window rather than in the chat window
        if (!this.editor)
            throw 'invalid editor while initializing';
        this.editor.setTheme("ace/theme/editor-theme");
        this.editor.setHighlightActiveLine(true);
        this.editor.resize();
        const windowEditor = this.editor;
        if (newSession) {
            // if(this.editor.session)
            //     draggedTab!.parentWindow.editor?.session.destroy()
            this.editor.setSession(newSession);
            // for(const session of editorSessions.values())
            //     if(session.fileElement?.parentWindow === this)
            //     session.editor = this.editor.getSession()
        }
        const session = () => editorSessions.get(this.activeTab.name)?.editor || this.editor.session;
        cursorManagers.set(this.editor.id, new MultiCursorManager(windowEditor));
        // this.editor.on('keyboardActivity', () => {
        //     isRemoteChange = false;
        // })
        // const name = this.activeTab.name
        let parsedCode;
        this.editor.on('changeSession', (e) => {
            if (!this.editor)
                return;
            // if(!this.activeTab)
            //     throw 'no active tab'
            // const name = this.activeTab.name
            //TODO Check if i can imrove the changedCss check, so it
            // doesnt create new listener for each update.
            let errorDisplay;
            let errorDisplayTimeout;
            !this.editor.session.getUndoManager().canRedo() ? document.getElementById('editor-redo')?.classList.add('enable') : document.getElementById('editor-redo')?.classList.remove('enable');
            !this.editor.session.getUndoManager().canUndo() ? document.getElementById('editor-undo')?.classList.add('enable') : document.getElementById('editor-undo')?.classList.remove('enable');
            this.editor.session.on('changeBreakpoint', e => {
            });
            this.editor.session.on('changeScrollTop', scrollTop => {
                // if(lastEv!=undefined)
                //   updateLocalCursor(lastEv)
            });
            function getContext(line, variable) {
                return { type: "int" };
            }
            function getErrorInfo(compileErrorObj) {
                const mathces = compileErrorObj.text.match(/'.+?'/g);
                console.log(mathces[0]);
                const basicError = compileErrorObj.text.replaceAll(/'.+?'/g, '').trim();
                console.log(basicError);
                // TODO Improve this
                var cases = [
                    { text: 'expected',
                        test: (error) => error.includes('expected'),
                        return: { link: 'expected', fixFunction: () => {
                                const varName = mathces[0].replaceAll("'", '');
                                let i = 1;
                                const searchRow = compileErrorObj.range.end.row;
                                const cond = () => !(session().getLine(searchRow - i).trim().includes(';') || session().getLine(searchRow - i).trim() != '' && searchRow - i > 0); //(!editor.session.getLine(searchRow-i).trim().includes(';') || editor.session.getLine(searchRow-i).trim() == '') && searchRow-i > 0
                                while (cond()) {
                                    console.log(cond(), session().getLine(searchRow - i).trim(), session().getLine(searchRow - i).trim().includes(';'));
                                    i++;
                                }
                                const insertRange = { column: session().getLine(searchRow - i).length + 1, row: searchRow - i };
                                session().insert(insertRange, `;`);
                                session().selection.selectWord();
                                // editor.selection.setRange(new Range({start: {row: insertRange.row, column: 0}, end: insertRange}))
                            } }
                    },
                    { text: 'was not declared in this scope',
                        test: (error) => error.includes('was not declared in this scope'),
                        return: { link: 'undeclared', fixFunction: () => {
                                const varName = mathces[0].replaceAll("'", '');
                                const context = getContext(session().getLines(compileErrorObj.range.start.row, compileErrorObj.range.end.row), varName);
                                session().insert({ column: 0, row: compileErrorObj.range.start.row }, `\n`);
                                session().insert({ column: compileErrorObj.range.start.column, row: compileErrorObj.range.start.row }, `${context.type} ${varName};`);
                                session().selection.selectWord();
                            } }
                    },
                ];
                for (const elem of cases) {
                    if (elem.test(basicError))
                        return elem.return;
                }
                return { link: '', fixFunction: () => { } };
            }
            this.editor.getSession().on('markerUpdate', (marker) => {
                if (!marker.changedCss)
                    return;
                // TODO add marke events only to errored tokens
                marker.elem.addEventListener('mouseover', ev => {
                    if (errorDisplay)
                        return;
                    if (errorDisplayTimeout)
                        clearTimeout(errorDisplayTimeout);
                    errorDisplayTimeout = setTimeout(() => {
                        errorDisplay = document.createElement('div');
                        const top = marker.elem.getBoundingClientRect().top;
                        const left = marker.elem.getBoundingClientRect().left;
                        errorDisplay.style.cssText = `top: ${top}px; left: ${left}px; position: absolute;`;
                        errorDisplay.innerText = compileErrorObjs.get(marker.marker.id).text;
                        errorDisplay.classList.add('compile-error-tooltip');
                        const errorInfo = getErrorInfo(compileErrorObjs.get(marker.marker.id));
                        const actionsContainer = createNode('div', { css: "display: flex; gap: 10px; margin: 5px;" });
                        actionsContainer.appendChild(createNode('a', { innerText: "Despre eroare", attributes: [{ name: 'href', value: "/guides/post/" + errorInfo.link }] }));
                        actionsContainer.appendChild(createNode('a', { innerText: "Repara", css: "text-decoration: underline; cursor: pointer;", onclick(ev) {
                                errorInfo.fixFunction();
                            }, }));
                        errorDisplay.appendChild(actionsContainer);
                        document.body.appendChild(errorDisplay);
                        compileErrorObjs.get(marker.marker.id).display = errorDisplay;
                    }, 200);
                });
                if (errorDisplay)
                    if (!errorDisplay.checkVisibility()) {
                        errorDisplay.remove();
                        errorDisplay = undefined;
                    }
                    else
                        errorDisplay.addEventListener('mouseleave', ev => {
                            if (errorDisplayTimeout)
                                clearTimeout(errorDisplayTimeout);
                            if (!errorDisplay)
                                return;
                            errorDisplay.remove();
                            errorDisplay = undefined;
                        });
            });
        });
        this.editor.on("change", (delta) => {
            if (!this.activeTab)
                console.error('no active tab');
            const name = this.activeTab.name;
            !windowEditor.session.getUndoManager().canRedo() ? document.getElementById('editor-redo')?.classList.add('enable') : document.getElementById('editor-redo')?.classList.remove('enable');
            !windowEditor.session.getUndoManager().canUndo() ? document.getElementById('editor-undo')?.classList.add('enable') : document.getElementById('editor-undo')?.classList.remove('enable');
            windowEditor.renderer.updateFull();
            parsedCode = parseCode();
            if (isRemoteChange)
                return;
            const code = windowEditor.getValue();
            if (!name)
                console.error("Current file name is invalid");
            if (name)
                dirtyFile(name);
            ws.send(JSON.stringify({
                body: code,
                delta: delta,
                type: WebSocketMessageType.CodeChange,
                fileName: name,
                saveFile: true,
            })); // Send code to server on change // TODO Remove code from body.
        });
        this.editor.on("changeSelection", () => {
            if (!this.activeTab)
                throw 'no active tab';
            const name = this.activeTab.name;
            if (isRemoteChange)
                return;
            // if( !isColabSession) return;
            const selection = windowEditor.getSelectionRange();
            // const start = selection.start;
            // const end = selection.end;
            // const range = new AceRange(start.row, start.column, end.row, end.column);
            // const selectedText = editor.session.getTextRange(range);
            // console.log(selectedText);
            if (!name)
                console.error("Current file name is invalid");
            ws.send(JSON.stringify({
                range: selection,
                fileName: name,
                type: WebSocketMessageType.CodeSelection,
            })); // Send code to server on change
        });
        // TODO finish this
        const customCompleter = {
            getCompletions: function (editor, session, pos, prefix, callback) {
                // if (prefix.length === 0) {
                //   callback(null, []);
                //   return;
                // }
                const line = session.getLine(pos.row).trim();
                let completions = [];
                if (line.includes("#include")) {
                    const libraries = tooltip.libraries[0];
                    completions = libraries.map(lib => ({
                        caption: prefix.length > 0 ? `${lib.name}>` : `<${lib.name}>`,
                        value: prefix.length > 0 ? `${lib.name}>` : `<${lib.name}>`,
                        meta: "library",
                        score: lib.score,
                        docHTML: `<b>&lt;${lib.name}&gt;</b><br>${lib.description}`
                    }));
                    // callback(null, completions);
                }
                else {
                    if (!parsedCode)
                        return callback(null, []);
                    if (!parsedCode.functions)
                        return callback(null, []);
                    completions = parsedCode.functions
                        //  .filter(c => {return c.name == indexToFunctionName(editor.session.doc.positionToIndex(editor.selection.getRange().start))?.name || c.name == undefined})
                        .map(c => ({
                        caption: c.name, value: c.name, meta: "function", score: 100,
                        docHTML: `${c.type} <b>${c.name}</b><pre>${c.content}</pre>`
                    })).concat(parsedCode.variables
                        .filter(c => { return c.functionName == indexToFunctionName(parsedCode, editor.session.doc.positionToIndex(editor.selection.getRange().start))?.name || c.functionName == undefined; })
                        .map(c => ({
                        caption: c.name, value: c.name, meta: `${c.type} variable : ${c.functionName ? c.functionName : "Global"}`, score: 100,
                        docHTML: `${c.type} <b>${c.name}</b>`
                    })));
                }
                console.log(editor.session.doc.positionToIndex(editor.selection.getRange().start));
                console.log(indexToFunctionName(parsedCode, editor.session.doc.positionToIndex(editor.selection.getRange().start))?.name);
                callback(null, completions);
            }
        };
        // Register it
        ace.require("ace/ext/language_tools").addCompleter(customCompleter);
    }
    addTab(newTab) {
        this.tabContainer.appendChild(newTab.element);
        this.tabs.push(newTab);
        newTab.parentWindow = this;
        const content = newTab.content;
        if (preloadTabs)
            if (content.outerHTML) {
                this.contentContainer.appendChild(content);
                content.style.display = 'none';
            }
    }
}
export class EditorWindowTab {
    element;
    parentWindow;
    content;
    name;
    // public onDragEnd: undefined | (() => void)
    constructor(name, element, content, parentWindow, disableDrag) {
        this.name = name;
        this.content = content;
        this.element = element;
        if (!disableDrag)
            this.element.draggable = true;
        this.element.ondragstart = (ev) => dragstartHandler(this, ev);
        // element.ondragend = (ev) => this.onDragEnd!()
        function dragstartHandler(tab, ev) {
            // ev.dataTransfer.setData("application/x-moz-node", element);
            if (tab.getDragText()) {
                ev.dataTransfer.setData("text", tab.getDragText());
                ev.dataTransfer.setData("name", tab.name);
            }
            const elem = document.getElementsByClassName(draggedIdName)[0];
            if (elem)
                elem.classList.remove(draggedIdName);
            ev.target.classList.add(draggedIdName);
            draggedTab = tab;
        }
        if (parentWindow)
            parentWindow.addTab(this);
        this.element.onclick = (ev) => {
            this.openTab(ev);
        };
    }
    getDragText = () => { return undefined; };
    openTab(ev) {
        if (!this.content)
            throw 'File tab content is undifined.';
        const elem = this.content;
        if (elem.outerHTML) {
            this.onOpenTab(elem);
        }
    }
    onOpenTab(elem) {
        if (!this.parentWindow)
            throw 'no parent window';
        for (const child of this.parentWindow.contentContainer.children)
            if (this.parentWindow.contentContainer.children.length > 10)
                child.remove();
            else
                child.style.display = 'none';
        this.parentWindow.setActiveFile(this);
        if (!preloadTabs) {
            let foundElem;
            for (let index = 0; index < this.parentWindow.contentContainer.children.length && !foundElem; index++) {
                if (this.parentWindow.contentContainer.children[index] == elem)
                    foundElem = elem;
            }
            if (foundElem === undefined)
                this.parentWindow.contentContainer.appendChild(elem);
        }
        elem.style.display = '';
    }
    remove() {
        this.element.remove();
        // if(client!.editorSession![this.parentWindow.index]!.fileElement!)
        // if(client!.editorSession![this.parentWindow.index]!.fileElement!.element == this.element)
        //     client!.editorSession[this.parentWindow.index].fileElement = undefined
        if (editorSessions.has(this.name))
            editorSessions.get(this.name).fileElement = undefined;
        if (!this.parentWindow)
            return;
        const index = this.parentWindow.tabs.findIndex(val => val.element == this.element);
        if (index == -1)
            throw 'couldnt find tab to remove';
        this.parentWindow.tabs.splice(index, 1);
        if (this.content.outerHTML)
            this.content.remove();
    }
}
const draggedIdName = 'dragged';
export function updateCatalouge() {
    const catalouge = document.getElementById('tab-catalouge');
    const tabs = [
        createEditorTab('Subiecte', createNode('iframe', { css: 'width: 100%; height: 100%; border: none', attributes: [{ name: 'src', value: '/subiecte' }] })),
        createEditorTab('Pbinfo', createNode('iframe', { css: 'width: 100%; height: 100%; border: none', attributes: [{ name: 'src', value: 'https://www.pbinfo.ro/' }, { name: 'allow', value: "encrypted-media" }] }))
    ];
    for (const tab of tabs) {
        tab.element.ondragend = () => {
            catalouge?.parentElement?.classList.remove('open');
            const index = tabs.findIndex(val => val === tab);
            tabs.splice(index, 1);
            if (tabs.length == 0)
                (catalouge?.parentElement).disabled = true;
        };
        catalouge?.appendChild(tab.element);
    }
}
function createEditorTab(name, content, disableDrag) {
    return new EditorWindowTab(name, createNode('span', { className: "file-tab", html: [createNode('p', { innerText: name })] }), content, undefined, disableDrag);
}
export async function showDefaultScreen() {
    const window = windows[0];
    window.destroyEditor();
    const languages = [
        { name: 'c++', src: 'c++-logo.png', ext: 'cpp' },
        { name: 'python', src: 'python-logo.webp', ext: 'py' },
        { name: 'javascript', src: 'js-logo.png', }, // ext: 'js'},
        { name: 'typescript', src: 'ts-logo.svg', }, // ext: 'ts'},
        { name: 'java', src: 'java-logo.webp', }, // ext: 'java'},
        { name: 'go', src: 'Go-logo.png', }, // ext: 'go'},
        { name: 'c', src: 'C-logo.png', }, //ext: 'c'},
        { name: 'html', src: 'html-logo.webp', }, // ext: 'html'},
        { name: 'css', src: 'css-logo.png', }, //ext: 'css'},
        { name: 'node.js', src: 'node.js-logo.webp', } // ext: 'js'},
    ];
    let langaugeElements = [];
    let i = 1;
    for (const language of languages)
        langaugeElements.push(createNode('button', { html: [
                createNode('div', { css: "background-image: url(../media/logos/" + language.src + ");",
                    className: 'language-logo',
                    attributes: [
                        { name: 'draggable', value: 'false' }
                    ] }),
                createNode('p', { innerText: language.name })
            ],
            attributes: [
                // {name: 'tabindex',value: (i++).toString()},
                language.ext ? { name: 'onclick', value: `window.editor.createFile('main.${language.ext}'); ` } : undefined,
                !language.ext ? { name: "disabled", value: '' } : undefined
            ],
            className: 'custom-button'
        }));
    const languageCarousel = createNode('ul', { html: langaugeElements, className: 'language-carousel' });
    const container = createNode('div', { className: 'default-screen', html: [
            createNode('h1', { innerText: 'Creaza un nou proiect' }),
            languageCarousel,
            createNode('div', { className: 'language-info' })
        ] });
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
    for (const elem of languageCarousel.children)
        elem.animate([
            { opacity: "0%", transform: "translateY(-50%)" },
            { opacity: "100%", transform: "translateY(0%)" },
        ], {
            duration: 200,
            delay: Math.random() * 200 + 50,
            easing: "ease-out"
        });
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
    const tab = createEditorTab('Hello!', container, true);
    window.addTab(tab);
    window.setActiveFile(tab);
    tab.openTab(undefined);
}
