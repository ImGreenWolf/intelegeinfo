import { compileErrorObjs } from "./codeEditor.js";
import { createNode } from "./components.js";
var draggedTab;
export class EditorWindow {
    element;
    tabContainer;
    contentContainer;
    activeTab;
    editor;
    constructor(element, tabContainer, contentContainer) {
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
            const elem = document.getElementsByClassName(draggedIdName)[0];
            const data = ev.dataTransfer.getData("application/x-moz-node");
            console.log(data);
            tabContainer.appendChild(elem);
            if (!draggedTab)
                throw 'no dragged tab';
            console.log(draggedTab.parentWindow, window);
            draggedTab.parentWindow = window;
            draggedTab = null;
        }
    }
    getEditor() {
        if (!this.editor)
            this.editor = ace.edit(this.contentContainer, {
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
        return this.editor;
    }
    initializeEditor() {
        if (!this.editor)
            return;
        this.editor.setTheme("ace/theme/editor-theme");
        this.editor.setHighlightActiveLine(true);
        this.editor.resize();
        const codeWindow = this.editor;
        this.editor.on('changeSession', (e) => {
            if (!this.editor)
                return;
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
                const cases = [
                    { text: 'expected',
                        test: (error) => error.includes('expected'),
                        return: { link: 'expected', fixFunction: () => {
                                const varName = mathces[0].replaceAll("'", '');
                                let i = 1;
                                const searchRow = compileErrorObj.range.end.row;
                                const cond = () => !(codeWindow.session.getLine(searchRow - i).trim().includes(';') || codeWindow.session.getLine(searchRow - i).trim() != '' && searchRow - i > 0); //(!editor.session.getLine(searchRow-i).trim().includes(';') || editor.session.getLine(searchRow-i).trim() == '') && searchRow-i > 0
                                while (cond()) {
                                    console.log(cond(), codeWindow.session.getLine(searchRow - i).trim(), codeWindow.session.getLine(searchRow - i).trim().includes(';'));
                                    i++;
                                }
                                const insertRange = { column: codeWindow.session.getLine(searchRow - i).length + 1, row: searchRow - i };
                                codeWindow.session.insert(insertRange, `;`);
                                codeWindow.session.selection.selectWord();
                                // editor.selection.setRange(new Range({start: {row: insertRange.row, column: 0}, end: insertRange}))
                            } }
                    },
                    { text: 'was not declared in this scope',
                        test: (error) => error.includes('was not declared in this scope'),
                        return: { link: 'undeclared', fixFunction: () => {
                                const varName = mathces[0].replaceAll("'", '');
                                const context = getContext(codeWindow.session.getLines(compileErrorObj.range.start.row, compileErrorObj.range.end.row), varName);
                                codeWindow.session.insert({ column: 0, row: compileErrorObj.range.start.row }, `\n`);
                                codeWindow.session.insert({ column: compileErrorObj.range.start.column, row: compileErrorObj.range.start.row }, `${context.type} ${varName};`);
                                codeWindow.session.selection.selectWord();
                            } }
                    },
                ];
                for (const elem of cases) {
                    if (elem.test(basicError))
                        return elem.return;
                }
                return { link: '', fixFunction: () => { } };
            }
            this.editor.session.on('markerUpdate', (marker) => {
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
    }
}
export class EditorWindowTab {
    element;
    parentWindow;
    content;
    constructor(element, parentWindow, content) {
        this.content = content;
        this.parentWindow = parentWindow;
        this.element = element;
        this.element.draggable = true;
        this.element.ondragstart = (ev) => dragstartHandler(this, ev);
        function dragstartHandler(tab, ev) {
            ev.dataTransfer.setData("application/x-moz-node", element);
            const elem = document.getElementsByClassName(draggedIdName)[0];
            if (elem)
                elem.classList.remove(draggedIdName);
            ev.target.classList.add(draggedIdName);
            draggedTab = tab;
        }
    }
}
const draggedIdName = 'dragged';
