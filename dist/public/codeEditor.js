// Ensure Ace Editor is globally available or import it properly
const AceRange = ace.require("ace/range").Range;
const aceModes = ace.require("ace/ext/modelist");
var codeLens = ace.require("ace/ext/code_lens");
//  const msgMap: Map<Number, WSMessage> = new Map();
// function getCompiledCode() {
//   return fetch("/getCompiledCode", {
//     method: "GET",
//   });
// }
function parseArray(str) {
    // Extract the value (x) and number of repeats (y) using a regular expression
    const match = str.match(/([^<]+) <repeats (\d+) times>/);
    if (match) {
        // Get the value (x) and number of repetitions (y)
        const value = match[1].trim(); // x (strip any extra spaces)
        const times = parseInt(match[2], 10); // y (convert to integer)
        // Create the array filled with 'value' repeated 'times' times
        return new Array(times).fill(value);
    }
    else {
        return [];
    }
}
// Class to render one visual cursor
class VisualCursor {
    cursorId;
    getPosition;
    constructor(cursorId, getPosition) {
        this.cursorId = cursorId;
        this.getPosition = getPosition;
    }
    type = "line";
    clazz = "ace_remote_cursor";
    markerRef = undefined;
    update(html, markerLayer, session, config) {
        const pos = this.getPosition();
        const screenPos = session.documentToScreenPosition(pos.row, pos.column);
        const top = markerLayer.$getTop(screenPos.row, config);
        const left = markerLayer.$padding + screenPos.column * config.characterWidth;
        markerLayer.elt("ace_remote_cursor", `height: ${config.lineHeight}px; top: ${top}px; left: ${left}px; --color: green`);
        // FOR FUTURE REFERENCE, HTML DOESNT WORK ANYMORE, USE ELT
    }
}
class Console {
    element;
    stdin = [];
    event = new Event("open");
    constructor() {
        if (outputConsoles.length > 0)
            outputConsoles[outputConsoles.length - 1].callbackCreate(this);
        const thisConsole = document.createElement('div');
        outputArea.appendChild(thisConsole);
        thisConsole.id = 'active-console';
        thisConsole.className = 'output-console-container';
        thisConsole.innerHTML = "<div class='program-output'></div>";
        const resendButton = document.createElement('button');
        resendButton.innerText = '↻';
        resendButton.classList = 'retry-program custom-button';
        resendButton.onclick = (ev) => {
            sendDebugCommand("execute");
            ws.send(JSON.stringify({
                command: this.stdin.join(" "),
                // args: ["console"],
                type: WebSocketMessageType.Console,
            }));
            //   ws.send(
            // JSON.stringify({
            //   command: "execute",
            //   textMode: this.stdin.join(" "),
            //   type: WebSocketMessageType.Output,
            // })
            // );
        };
        thisConsole.appendChild(resendButton);
        this.element = thisConsole;
    }
    callbackCreate(callerConsole) {
        callerConsole.stdin = this.stdin;
    }
    sendCommand(cmd) {
        this.stdin.push(cmd);
    }
}
// Manager class for multiple visual cursors
class MultiCursorManager {
    editor;
    cursorsPos = new Map();
    cursors = new Map();
    constructor(editor) {
        this.editor = editor;
    }
    addCursor(cursorId, position) {
        this.cursorsPos.set(cursorId, position);
        const marker = new VisualCursor(cursorId, () => this.cursorsPos.get(cursorId));
        const markerDyn = this.editor.session.addDynamicMarker(marker, true);
        marker.markerRef = markerDyn;
        this.cursors.set(cursorId, marker);
        return marker;
    }
    updateCursor(cursorId, position) {
        if (this.cursorsPos.has(cursorId)) {
            this.cursorsPos.set(cursorId, position);
            this.editor.renderer.updateFull(); // Triggers redraw
        }
    }
    removeCursor(cursorId) {
        this.editor.session.removeMarker((this.cursors.get(cursorId)?.markerRef).id || 0);
        const success = this.cursors.delete(cursorId);
        this.cursors.delete(cursorId);
        this.editor.renderer.updateFrontMarkers();
        return success;
    }
    replicateCursor(cursorId, position) {
        if (this.cursors.has(cursorId)) {
            this.updateCursor(cursorId, position);
            return this.cursorsPos.get(cursorId);
        }
        else
            return this.addCursor(cursorId, position);
    }
}
class EditorCursor {
    cursor;
    posX = 0;
    posY = 0;
    lposX = 0;
    lposY = 0;
    updateInterval;
    step = 0;
    pointerType = "mouse";
    animated = false;
    animTimeout;
    constructor(eventJson) {
        this.cursor = this.refreshCursor(eventJson);
        cursors.set(eventJson.clientId, this);
        this.update(eventJson);
    }
    refreshCursor(eventJson) {
        if (this.cursor != undefined)
            this.cursor.remove();
        const cursor = document.createElement('div');
        const name = document.createElement('span');
        name.innerText = eventJson.displayName;
        cursor.appendChild(name);
        cursor.id = 'cursor-' + eventJson.clientId;
        cursor.classList.add('cursor');
        // cursor.setAttribute('name', eventJson.displayName) 
        // cursor.style.color
        cursor.style.color = eventJson.color;
        this.pointerType = eventJson.pointerType || "mouse";
        if (this.pointerType != "mouse") {
            cursor.classList.add(eventJson.pointerType);
            cursor.style.width = eventJson.width;
            cursor.style.height = eventJson.height;
            // if(eventJson.pointerType=="mouse")
            // setTimeout(() => {
            //   this.cursor?.remove()
            //   cursors.delete(eventJson.clientId)
            // }, 1000);
        }
        document.body.appendChild(cursor);
        return cursor;
    }
    update(eventJson) {
        if (this.pointerType != eventJson.pointerType)
            this.refreshCursor(eventJson);
        if (eventJson.pointerType == "touch" && this.animated == false) {
            this.animated = true;
            this.cursor.animate([
                { opacity: "0%", transform: "scale(1.2) translate(-50%, -50%)" },
                { opacity: "100%", transform: "scale(0.95) translate(-50%, -50%)" },
            ], {
                duration: 250,
                fill: "both",
                easing: "ease-out"
            });
        }
        const updatedPos = updateCursor(this.cursor, eventJson);
        this.posX = updatedPos.posX;
        this.posY = updatedPos.posY;
        this.step = 0;
        const stepSize = 1 / 5;
        if (this.updateInterval) {
            // this.lposX = updatedPos.posX;
            // this.lposY = updatedPos.posY;
            clearInterval(this.updateInterval);
        }
        if (true) { // interpolate cursor position
            this.updateInterval = setInterval(() => {
                const cposX = this.lposX * (1 - this.step) + this.posX * this.step;
                const cposY = this.lposY * (1 - this.step) + this.posY * this.step;
                this.cursor.style.left = cposX + 'px';
                this.cursor.style.top = cposY + 'px';
                this.step += stepSize;
                if (this.step >= 1) {
                    this.lposX = updatedPos.posX;
                    this.lposY = updatedPos.posY;
                    clearInterval(this.updateInterval);
                    if (eventJson.pointerType == "touch") {
                        if (this.animTimeout)
                            clearTimeout(this.animTimeout);
                        this.animTimeout = setTimeout(() => {
                            this.animated = false;
                            this.cursor.animate([
                                { opacity: "100%", transform: "scale(1) translate(-50%, -50%)" },
                                { opacity: "0%", transform: "scale(0.9) translate(-50%, -50%)" },
                            ], {
                                duration: 250,
                                fill: "both",
                                // easing: "ease-out"
                            });
                        }, 250);
                    }
                }
            }, 1 / stepSize);
        }
        else {
            this.cursor.style.left = this.posX + 'px';
            this.cursor.style.top = this.posY + 'px';
        }
    }
}
class Variable {
    varname;
    value;
    type;
    updatedIndices;
    indexes;
    constructor(name, value, type, updatedIndices = []) {
        this.varname = name;
        this.value = value;
        this.type = type;
        if (type === "array" && updatedIndices.length > 0) {
            this.updatedIndices = updatedIndices;
            this.indexes = [];
        }
    }
}
export var WebSocketMessageType;
(function (WebSocketMessageType) {
    WebSocketMessageType["Handshake"] = "handshake";
    WebSocketMessageType["Error"] = "error";
    WebSocketMessageType["Output"] = "output";
    WebSocketMessageType["End"] = "end";
    WebSocketMessageType["Console"] = "console";
    WebSocketMessageType["Chat"] = "chat";
    WebSocketMessageType["ConsoleTyping"] = "consolekeepalive";
    WebSocketMessageType["CodeChange"] = "codeChange";
    WebSocketMessageType["CodeSelection"] = "codeSelection";
    WebSocketMessageType["ColabData"] = "colabData";
    WebSocketMessageType["Heartbeat"] = "heartbeat";
    WebSocketMessageType["FileManagement"] = "FileManagement";
    WebSocketMessageType["CompileResult"] = "CompileResult";
    WebSocketMessageType["ExecuteStatus"] = "executestatus";
    WebSocketMessageType["MouseUpdate"] = "MouseUpdate";
    WebSocketMessageType["WebCam"] = "webcam";
})(WebSocketMessageType || (WebSocketMessageType = {}));
export var ConsoleMessageType;
(function (ConsoleMessageType) {
    ConsoleMessageType["UserChat"] = "chat";
    ConsoleMessageType["Error"] = "error";
    ConsoleMessageType["Info"] = "information";
    ConsoleMessageType["Debug"] = "debug";
    ConsoleMessageType["SessionInfo"] = "session";
    ConsoleMessageType["Output"] = "output";
    ConsoleMessageType["DebugProgram"] = "debugProgram";
})(ConsoleMessageType || (ConsoleMessageType = {}));
// VARIABLES //
const cursors = new Map();
const typingIndicators = new Map();
let debounceTimer;
let typingIndicatorDelay = 1000;
let activeElem;
const variableStore = new Map();
let code;
let debugLine = 1; // debug row
let lastDebugId;
let lastViewedMessage;
let currentFileName;
let wsClientId;
let wsSessionId;
const outputArea = document.getElementById("output");
const outputConsoles = [];
let activeConsole;
let contextMenu;
let parsedCode;
let stepint;
let isColabSession = true;
let lastEventJson;
let session;
let cmdId = 0;
let variables = [];
const variableArrayIndexes = [];
const editorSessions = new Map();
const editor = ace.edit("editor", {
    mode: "ace/mode/c_cpp",
    enableLiveAutocompletion: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    placeholder: "incepe sa scrii niste cod...",
    tooltipFollowsMouse: true,
    animatedScroll: true,
    useWorker: true,
    //   fontSize: "18px",
    //maxLines: 30,
    wrap: true,
    autoScrollEditorIntoView: true,
    enableCodeLens: true,
});
var event = ace.require("ace/lib/event");
var Range = ace.require("ace/range").Range;
var Tooltip = ace.require("ace/tooltip").Tooltip;
const sessionId = new URLSearchParams(window.location.search).get("session");
const saveId = new URLSearchParams(window.location.search).get("save");
const WSUrl = "ws://" + window.location.hostname + ":" + window.location.port + (sessionId || saveId ? "?" : "") + (sessionId ? "session=" + sessionId + "&" : "") + (saveId ? "save=" + saveId : "");
// Initialize the manager
const cursorManager = new MultiCursorManager(editor);
let msgId = 0;
function parseDebuggerOutput(input, { onNewVariable = (newVar) => { }, onArrayIndexChange = (name, change, changed) => { }, } = {}) {
    const cleanedInput = input
        .replace(/\(gdb\)/g, "")
        .replace(/\n\s*/g, " ")
        .trim();
    const regex = /(\w+)\s*:\s*(.*?)(?=\s+\w+\s*:|$)/g;
    let match;
    while ((match = regex.exec(cleanedInput)) !== null) {
        const name = match[1];
        const rawValue = match[2].trim();
        let type = "string";
        let value = rawValue; // might be broken
        // Parse arrays
        if (rawValue.startsWith("{") && rawValue.endsWith("}")) {
            type = "array";
            const inner = rawValue.slice(1, -1).trim();
            const array = [];
            const arrayRegex = /(-?\d+)\s*<repeats\s+(\d+)\s+times>|-?\d+/g;
            let valMatch;
            while ((valMatch = arrayRegex.exec(inner)) !== null) {
                if (valMatch[2]) {
                    const val = parseInt(valMatch[1], 10);
                    const count = parseInt(valMatch[2], 10);
                    array.push(...Array(count).fill(val));
                }
                else {
                    array.push(parseInt(valMatch[0], 10));
                }
            }
            value = array;
        }
        else if (!isNaN(Number(rawValue))) {
            type = "int";
            value = Number(rawValue);
        }
        const existing = variableStore.get(name);
        if (!existing) {
            const newVar = new Variable(name, value, type);
            variableStore.set(name, newVar);
            onNewVariable(newVar);
        }
        else if (type === "array" && existing.type === "array") {
            const updatedIndices = [];
            for (let i = 0; i < Math.max(existing.value?.length, value.length); i++) {
                if (Array.isArray(existing.value)
                //    &&
                //   existing.value[i] !== (value as any[])[i]
                ) {
                    const change = {
                        index: i,
                        old: existing.value[i],
                        new: value[i],
                    };
                    const changed = existing.value[i] !== value[i];
                    updatedIndices.push(change);
                    onArrayIndexChange(name, change, changed);
                }
            }
            if (updatedIndices.length > 0) {
                const updatedVar = new Variable(name, value, type, updatedIndices);
                variableStore.set(name, updatedVar);
            }
        }
        else if (existing.value !== value || existing.type !== type) {
            const updatedVar = new Variable(name, value, type);
            variableStore.set(name, updatedVar);
        }
    }
    return Array.from(variableStore.values());
}
function parseMIDebuggerOutput(input, { onNewVariable = (newVar) => { }, onArrayIndexChange = (name, change, changed) => { }, } = {}) {
    const cleanedInput = input;
    const regex = /(\w+)\s*:\s*(.*?)(?=\s+\w+\s*:|$)/g;
    let match;
    for (const variable of cleanedInput.variables) {
        const name = variable.name;
        const rawValue = variable.value;
        let type = "string";
        let value = rawValue; // might be broken
        // Parse arrays
        if (Array.isArray(rawValue)) {
            type = "array";
            //const inner = //rawValue.slice(1, -1).trim();
            const array = rawValue; //[];
            // const arrayRegex = /(-?\d+)\s*<repeats\s+(\d+)\s+times>|-?\d+/g;
            // let valMatch;
            // while ((valMatch = arrayRegex.exec(inner)) !== null) {
            //   if (valMatch[2]) {
            //     const val = parseInt(valMatch[1], 10);
            //     const count = parseInt(valMatch[2], 10);
            //     array.push(...Array(count).fill(val));
            //   } else {
            //     array.push(parseInt(valMatch[0], 10));
            //   }
            // }
            value = array;
        }
        else if (!isNaN(Number(rawValue))) {
            type = "int";
            value = Number(rawValue);
        }
        const existing = variableStore.get(name);
        if (!existing) {
            const newVar = new Variable(name, value, type);
            variableStore.set(name, newVar);
            onNewVariable(newVar);
        }
        else if (type === "array" && existing.type === "array") {
            const updatedIndices = [];
            for (let i = 0; i < Math.max(existing.value?.length, value.length); i++) {
                if (Array.isArray(existing.value)
                //    &&
                //   existing.value[i] !== (value as any[])[i]
                ) {
                    const change = {
                        index: i,
                        old: existing.value[i],
                        new: value[i],
                    };
                    const changed = existing.value[i] !== value[i];
                    updatedIndices.push(change);
                    onArrayIndexChange(name, change, changed);
                }
            }
            if (updatedIndices.length > 0) {
                const updatedVar = new Variable(name, value, type, updatedIndices);
                variableStore.set(name, updatedVar);
            }
        }
        else if (existing.value !== value || existing.type !== type) {
            const updatedVar = new Variable(name, value, type);
            variableStore.set(name, updatedVar);
        }
    }
    return Array.from(variableStore.values());
}
// Helper to compare arrays
function arraysEqual(a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (a[i] !== b[i])
            return false;
    return true;
}
// ace.config.setModuleUrl('ace/mode/c_cpp_worker', 'cpp_worker.js');
// ace.config.setModuleUrl('ace/mode/c_cpp_custom', 'mode_cpp_custom.js');
// window.onload = function() {
//   //  document.querySelector('#editor textarea')?.setAttribute('inputmode', 'none')
//   const ddd = document.querySelector('.ace_text-input');
//   if(!ddd)  return;
//   writeOutput(window.getComputedStyle(ddd).fontSize)
// }
editor.setTheme("ace/theme/editor-theme");
editor.setHighlightActiveLine(true);
editor.resize();
let isRemoteChange = false; // used for colaborative changes
let marker; //selection marker
const renderer = editor.renderer;
// Initialize ghostManager with the correct type
const ghostManager = new (class {
    editor;
    constructor(editor) {
        this.editor = editor;
    }
    clear() {
        // Implementation for clearing ghost markers
    }
    add(variableName, value) {
        // Implementation for adding ghost markers
    }
})(editor);
// TODO add on load event or pre load
// getCompiledCode()
//   .then(function (response) {
//     return response.json();
//   })
//   .then(function (data) {
//     // code = data.code;
//     // isRemoteChange = true; // used to force the editor to not send changes to the server
//     // editor.session.setValue(code);
//     // isRemoteChange = false;
//   });
/////////////       HELPER FUNCTIONS
////
///
//
const byteSize = (str) => new Blob([str]).size;
export function displayMessagePopup(message) {
    function createPopup(classList, innerHTML) {
        if (!innerHTML)
            return;
        const popup = document.createElement('div');
        popup.classList.add("client-popup");
        if (classList.split[' '])
            for (const classname of classList.split[' '])
                popup.classList.add(classname);
        popup.innerHTML = `<button class="client-popup-close">x</button><div>${innerHTML}</div>`;
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.remove();
        }, 1000 * 5);
    }
    createPopup('', `
    <p>${message}</p>
    
    `);
}
//
///
////
////////////  END HELPER FUNCTIONS
// 
// 
// 
// DOCUMENT FUNCTIONS //
// 
// 
// 
// //TODO Add playback controls and rest of buttons or figure out a fix.
// (document.getElementById('compile') as HTMLButtonElement).onclick = compileCode;
// (document.getElementById('saveProject') as HTMLButtonElement).onclick = saveProject;
// (document.getElementById('createFile') as HTMLButtonElement).onclick = createFileNamePrompt;
// (document.getElementById('share') as HTMLButtonElement).onclick = copySessionLink;
// (document.getElementById('join-session') as HTMLButtonElement).onclick = joinsession;
// (document.getElementById('console') as HTMLTextAreaElement).oninput = onConsoleInput;
// if((document.getElementById('listProjects') as HTMLButtonElement))
//   (document.getElementById('listProjects') as HTMLButtonElement).onclick = listProjects;
// (document.getElementById('compile') as HTMLButtonElement).onclick = compileCode;
// (document.getElementById('execute-control') as HTMLButtonElement).onclick = () => {
//   sendDebugCommand('execute');
// }
// (document.getElementById('run') as HTMLButtonElement).onclick = () => {
//   sendDebugCommand('run');
// }
// (document.getElementById('next') as HTMLButtonElement).onclick = () => {
//   sendDebugCommand('next');
// }
// (document.getElementById('quit') as HTMLButtonElement).onclick = () => {
//   sendDebugCommand('quit');
// }
// (document.getElementById('playback') as HTMLButtonElement).onclick = () => {
//   sendDebugCommand('playback');
// }
const namePrompt = document.getElementById("name-prompt");
const consoleInput = document.getElementById("console");
if (new URLSearchParams(window.location.search).has('save'))
    document.getElementById('saveProject')?.classList.add('saved');
// export function onMarkerUpdate(marker:any, elem: HTMLDivElement)
// {
// }
var beautify = ace.require("ace/ext/beautify"); // get reference to extension
function bufferToBase64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
export function beautifyEditor() {
    // const ws = new WebSocket('ws://localhost:8080');
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        const video = document.createElement('video');
        video.width = 640;
        video.height = 480;
        document.body.appendChild(video);
        video.srcObject = stream;
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        video.play();
        const ctx = canvas.getContext('2d');
        setInterval(() => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            // ws.send(JSON.stringify({type: WebSocketMessageType.WebCam, buffer: dataURL}));
            console.log(canvas.toDataURL());
            canvas.toBlob(blob => {
                console.log(blob);
                if (blob) {
                    blob.arrayBuffer().then(buffer => {
                        const base64 = bufferToBase64(buffer);
                        ws.send(JSON.stringify({ type: WebSocketMessageType.WebCam, buffer: base64 }));
                    });
                }
            }, 'image/jpeg', 0.7);
        }, 100); // every 100ms
    });
    // beautify.beautify(editor.session);
}
export function undo() {
    editor.session.getUndoManager().redo(editor.session);
}
export function redo() {
    editor.session.getUndoManager().undo(editor.session);
}
editor.on('changeSession', (e) => {
    //TODO Check if i can imrove the changedCss check, so it
    // doesnt create new listener for each update.
    let errorDisplay;
    let errorDisplayTimeout;
    !editor.session.getUndoManager().canRedo() ? document.getElementById('editor-redo')?.classList.add('enable') : document.getElementById('editor-redo')?.classList.remove('enable');
    !editor.session.getUndoManager().canUndo() ? document.getElementById('editor-undo')?.classList.add('enable') : document.getElementById('editor-undo')?.classList.remove('enable');
    editor.session.on('changeBreakpoint', e => {
    });
    editor.session.on('changeScrollTop', scrollTop => {
        // if(lastEv!=undefined)
        //   updateLocalCursor(lastEv)
    });
    editor.session.on('markerUpdate', (marker) => {
        if (!marker.changedCss)
            return;
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
                document.body.appendChild(errorDisplay);
                compileErrorObjs.get(marker.marker.id).display = errorDisplay;
            }, 200);
        });
        marker.elem.addEventListener('mouseleave', ev => {
            if (errorDisplayTimeout)
                clearTimeout(errorDisplayTimeout);
            if (!errorDisplay)
                return;
            errorDisplay.remove();
            errorDisplay = undefined;
        });
    });
});
function getPointerRelativePosition(editor, x, y) {
    const rect = editor.container.getBoundingClientRect();
    // Normalize mouse coordinates within editor container
    const relX = (x - rect.left + editor.renderer.scrollLeft); // / rect.width;
    const relY = (y - rect.top + editor.renderer.scrollTop); // / rect.height;
    return { relX, relY, rect }; // values from 0 to 1
}
function getPixelFromRelativePosition(editor, relX, relY, eventJson) {
    // const rect = editor.container.getBoundingClientRect();
    const rectWidth = editor.renderer.characterWidth;
    const rectHeight = editor.renderer.lineHeight;
    const rect = editor.container.getBoundingClientRect();
    const x = rect.left - (rectWidth - eventJson.rectWidth) * 2 - editor.renderer.scrollLeft + relX * (rectWidth / eventJson.rectWidth); // * eventJson.rect.width
    const y = rect.top - editor.renderer.scrollTop + relY * (rectHeight / eventJson.rechHeight); // * eventJson.rect.height
    return { x, y, rect };
}
function updateLocalCursor(ev, fromPress) {
    const deltaTime = 30;
    if (fromPress && ev.pointerType != "touch")
        return; // i can remove this and add a few things to show when a user is clicking
    if (ev.timeStamp - lastTime > deltaTime) {
        lastEv = ev;
        lastTime = ev.timeStamp;
        const posX = ev.pageX;
        const posY = ev.pageY;
        for (const checkCursor of cursors.values())
            if (getDistanceFromPosition(checkCursor.cursor, posX, posY) < 100)
                checkCursor.cursor.children[0].style.opacity = Math.min(100 - getDistanceFromPosition(checkCursor.cursor, posX, posY) / 2, 100) + "%";
            else
                checkCursor.cursor.children[0].style.opacity = "0%";
        const sizeX = document.body.clientWidth;
        const sizeY = document.body.clientHeight;
        const pos = getPointerRelativePosition(editor, posX, posY);
        const rectWidth = editor.renderer.characterWidth;
        const rechHeight = editor.renderer.lineHeight;
        const pointerType = ev.pointerType;
        if (pointerType == "touch") {
            const height = ev.height;
            const width = ev.width;
            ws.send(JSON.stringify({ type: WebSocketMessageType.MouseUpdate, posX, posY, sizeX, sizeY, pointerType, width, height, relPosX: pos.relX, relPosY: pos.relY, rect: pos.rect, rectWidth, rechHeight }));
        }
        else
            ws.send(JSON.stringify({ type: WebSocketMessageType.MouseUpdate, posX, posY, sizeX, sizeY, pointerType, relPosX: pos.relX, relPosY: pos.relY, rect: pos.rect, rectWidth, rechHeight }));
    }
}
function updateCursor(cursor, eventJson) {
    const sizeX = document.body.clientWidth;
    const sizeY = document.body.clientHeight;
    let posX = 0;
    let posY = 0;
    const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const relPos = getPixelFromRelativePosition(editor, eventJson.relPosX, eventJson.relPosY, eventJson);
    if (sizeX / eventJson.sizeX < 0.7 || sizeY / eventJson.sizeY < 0.7 || sizeX / eventJson.sizeX > 1.3 || sizeY / eventJson.sizeY > 1.3) {
        const scale = 5;
        const mask = Math.max((relPos.x - relPos.rect.width + relPos.rect.left - remSize) / scale + 10, (relPos.y - relPos.rect.height - relPos.rect.top + remSize) / scale + 10);
        if (mask * scale > -50) {
            cursor.style.filter = `blur(${mask / scale}px)`; //(Math.max(Math.abs(sizeX/eventJson.sizeX), Math.abs(sizeY/eventJson.sizeY)))
            cursor.style.opacity = 150 - (mask * scale) + "%";
        }
        else {
            cursor.style.opacity = "100%";
            cursor.style.filter = `blur(0px)`; //(Math.max(Math.abs(sizeX/eventJson.sizeX), Math.abs(sizeY/eventJson.sizeY)))
        }
        if (mask * scale < 100) {
            posX = relPos.x;
            posY = relPos.y;
        }
    }
    else {
        posX = Math.min(sizeX - remSize, eventJson.posX * sizeX / eventJson.sizeX);
        posY = Math.min(sizeY - remSize, eventJson.posY * sizeY / eventJson.sizeY);
    }
    return { posX, posY };
}
let lastTime = 0;
let lastEv;
function addMouseListener(session) {
    // TODO Maybe limit this only to the editor itself.
    if (session != undefined && session.canEdit && session.canChat)
        document.onpointermove = (ev) => updateLocalCursor(ev, false);
    document.onpointerdown = (ev) => updateLocalCursor(ev, true);
}
/* IMPORTS */
// FileManagement.ts
const FileContainer = document.getElementById("editor-tabs-container");
if (!FileContainer)
    console.error("Couldn't find file container!");
function deleteFile(fileName, remote) {
    if (!editorSessions.has(fileName))
        return false;
    editorSessions.get(fileName)?.fileElement?.remove();
    if (!remote)
        ws.send(JSON.stringify({
            type: WebSocketMessageType.FileManagement,
            command: FileManagementCommands.Delete,
            name: fileName,
        }));
    if (currentFileName == fileName)
        displayBlankEditor();
    editorSessions.delete(fileName);
    return true;
}
function getFileValue(fileName) {
    return new Promise((resolve, reject) => {
        fetch('editor/' + wsSessionId + '/file/' + fileName).then(res => {
            res.text().then(text => {
                resolve(text);
            }).catch(err => {
                reject(err);
            });
        });
    });
}
function displayBlankEditor() {
    currentFileName = '';
    editor.session.setValue('Create a new file!');
    editor.session.setMode('txt');
}
function renameFile(fileName, newName) {
    if (!editorSessions.has(fileName))
        return false;
    if (newName) {
        editor.session.setMode(aceModes.getModeForPath(newName).mode);
        editorSessions.get(fileName).fileElement.innerText = newName;
    }
    else {
        editorSessions.get(fileName).fileElement.style.display = 'none';
        awaitFileNamePrompt().then(name => {
            editorSessions.get(fileName).fileElement.style.display = 'block';
            editorSessions.get(fileName).fileElement.innerText = name;
            editor.session.setMode(aceModes.getModeForPath(name).mode);
            ws.send(JSON.stringify({
                type: WebSocketMessageType.FileManagement,
                command: FileManagementCommands.Rename,
                name: fileName,
                newName: name
            }));
        });
    }
    return true;
}
function onFileCreate(fileName) {
    // const command = JSON.parse(messageBodyJson);
    // const fileName = command.content;
    const fileElem = document.createElement("span");
    fileElem.className = "file-tab";
    fileElem.innerText = fileName;
    fileElem.onclick = () => {
        openFile(fileElem.innerHTML);
    };
    fileElem.oncontextmenu = (ev) => {
        ev.preventDefault();
        if (contextMenu)
            contextMenu.remove();
        contextMenu = document.createElement('div');
        const deleteButton = document.createElement('button');
        deleteButton.innerText = "Delete";
        deleteButton.onclick = () => {
            deleteFile(fileName);
            contextMenu.remove();
        };
        contextMenu.appendChild(deleteButton);
        const renameButton = document.createElement('button');
        renameButton.onclick = () => {
            renameFile(fileName);
            contextMenu.remove();
        };
        renameButton.innerText = "Rename";
        contextMenu.appendChild(renameButton);
        contextMenu.id = 'context-menu';
        contextMenu.style.position = 'absolute';
        contextMenu.style.top = ev.y + "px";
        contextMenu.style.left = ev.x + "px";
        document.body.appendChild(contextMenu);
    };
    FileContainer.appendChild(fileElem);
    if (editorSessions.has(fileName)) {
        const session = editorSessions.get(fileName);
        if (!session.fileElement) {
            const newSession = {
                editor: session.editor,
                fileName: session.fileName,
                fileElement: fileElem
            };
            editorSessions.set(fileName, newSession);
        }
    }
    else {
        const newSession = {
            editor: undefined,
            fileName: fileName,
            fileElement: fileElem
        };
        editorSessions.set(fileName, newSession);
    }
    // FileContainer.innerHTML += `<span>${fileName}</span>`
}
export function createFileNamePrompt() {
    if (!namePrompt)
        return;
    namePrompt.style.display = "initial";
    namePrompt.innerText = "";
    namePrompt.focus();
    function handleEnterKey(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            createFile(this.innerText);
            openFile(this.innerText);
            this.style.display = "none";
            this.innerText = "";
            this.removeEventListener("keypress", handleEnterKey);
        }
    }
    const enterListener = namePrompt.addEventListener("keypress", handleEnterKey);
}
export function awaitFileNamePrompt() {
    return new Promise((resolve, reject) => {
        if (!namePrompt)
            return;
        namePrompt.style.display = "initial";
        namePrompt.innerText = "";
        namePrompt.focus();
        function handleEnterKey(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                resolve(this.innerText);
                this.style.display = "none";
                this.innerText = "";
                this.removeEventListener("keypress", handleEnterKey);
            }
        }
        const enterListener = namePrompt.addEventListener("keypress", handleEnterKey);
    });
}
if (consoleInput)
    consoleInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitConsole(consoleInput, WebSocketMessageType.Chat);
        }
    });
export function toggleConsoleDebugProgram(elem) {
    elem.classList.toggle("open");
    elem.children[1].classList.toggle("open");
}
export function onConsoleInput(elem, ev) {
    const console = elem;
    if (console.value != '') {
        if (!console.classList.contains('filled'))
            console.classList.add('filled');
        ws.send(JSON.stringify({ type: WebSocketMessageType.ConsoleTyping, status: "start" }));
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            ws.send(JSON.stringify({ type: WebSocketMessageType.ConsoleTyping, status: "end" }));
        }, Math.min(console.value.length * 10 + typingIndicatorDelay, 3000));
    }
    else
        console.classList.remove('filled');
    // ws.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping, status: "end"}))
    // ws.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping, status: "alive"}))
}
export function saveProject() {
    if (!wsSessionId)
        return;
    if (!namePrompt)
        return;
    fetch('../user/checkLoggedIn').then(loggedin => {
        if (loggedin.ok) {
            namePrompt.style.display = "initial";
            namePrompt.innerText = "";
            namePrompt.focus();
            function handleEnterKey(e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    fetch('/user/saveProject', {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: namePrompt?.innerText, sessionId: wsSessionId })
                    }).then(response => {
                        if (!response.ok)
                            if (response.status === 401)
                                displayMessagePopup('Please log in!');
                        // save was sucsessfull
                        document.getElementById('active-project-name')?.classList.remove('dirty');
                        modifiedFile = false;
                    })
                        .catch(err => {
                        displayMessagePopup(err);
                    });
                    document.getElementById('saveProject')?.classList.add('saved');
                    this.style.display = "none";
                    this.innerText = "";
                    this.removeEventListener("keypress", handleEnterKey);
                }
            }
            const enterListener = namePrompt.addEventListener("keypress", handleEnterKey);
        }
        else {
            if (loggedin.status == 401)
                displayMessagePopup('Pentru a-ti salva proiectele trebuie sa intri in cont sau sa-ti faci unul nou!');
            else
                displayMessagePopup('Eroare: ' + loggedin.statusText);
        }
    }).catch(err => {
        displayMessagePopup(err);
    });
}
function loadProject(id) {
    if (!wsSessionId)
        return;
    fetch('/user/loadProject/' + id, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json())
        .then(data => {
        if (data.redirectTo) {
            window.location.href = data.redirectTo;
        }
    })
        .catch(err => {
        displayMessagePopup(err);
    });
}
export function listProjects() {
    if (!wsSessionId)
        return;
    fetch('/user/listProjects', {
        method: "GET",
        headers: { 'Content-Type': 'application/json' },
    }).then(response => response.json()).catch(err => { })
        .then(data => {
        // if(data.error) throw 'unauth'
        try {
            if (!data.projects)
                throw "invalid data";
        }
        catch {
            displayMessagePopup('please log in');
        }
        const container = document.createElement('div');
        container.classList.add('project-list-container');
        const closeButton = document.createElement('button');
        closeButton.onclick = function (ev) {
            container.remove();
        };
        closeButton.innerText = 'x';
        container.appendChild(closeButton);
        const currentSaveId = new URLSearchParams(window.location.search).get('save');
        // displayMessagePopup(JSON.stringify(data.projects))
        const listcontainer = document.createElement('ul');
        listcontainer.classList.add('project-list');
        for (const project of data.projects) {
            const projectElem = listcontainer.appendChild(document.createElement('li'));
            const button = projectElem.appendChild(document.createElement('button'));
            const deleteProject = projectElem.appendChild(document.createElement('button'));
            deleteProject.innerText = 'x';
            deleteProject.classList.add('remove-proj');
            deleteProject.onclick = () => {
                fetch('../user/removeproject?id=' + project.id).then(res => {
                    if (res.ok)
                        projectElem.remove();
                });
            };
            button.innerText = project.name;
            if (currentSaveId === project.fileUUID)
                button.classList.add('active');
            button.onclick = (() => {
                loadProject(project.id);
            });
        }
        container.appendChild(listcontainer);
        const newProjButton = document.createElement('button');
        newProjButton.innerText = 'New Project';
        newProjButton.onclick = () => {
            window.location.href = '/editor';
        };
        container.appendChild(newProjButton);
        document.body.appendChild(container);
    });
    // .catch(err => {
    //   displayMessagePopup('nigger ' + err)
    // })
}
// END DOCUMENT FUNCTIONS //
// standardise the json
function sendWebsocketCommand(cmd, argsArr = []) {
    ws.send(JSON.stringify({
        command: cmd,
        args: argsArr,
        type: WebSocketMessageType.Output,
    }));
}
function addGhostMarkers(editor, word, ghostText) {
    const session = editor.getSession();
    const tokenizer = session.getMode().getTokenizer();
    const Range = ace.require("ace/range").Range;
    // Clean previous markers
    clearGhostMarkers(editor);
    const markers = [];
    for (let row = 0; row < session.getLength(); row++) {
        const line = session.getLine(row);
        const tokens = tokenizer.getLineTokens(line, session.getMode().$id).tokens;
        let col = 0;
        tokens.forEach((token) => {
            if (token.value === word) {
                // Add marker just *after* the word
                const start = new AceRange(row, col + word.length, row, col + word.length);
                const id = session.addMarker(start, "ghost-text", "text", false);
                markers.push(id);
                // Inject inline ghost text (this doesn't show real characters, just a styled span)
                const ghostSpan = document.createElement("span");
                ghostSpan.className = "ghost-text";
                ghostSpan.textContent = ghostText;
                ghostSpan.style.marginLeft = "2px";
                // Ace allows adding custom overlays to text layers
                const textLayer = editor.renderer.$textLayer;
                textLayer.$lines[row] = textLayer.$lines[row] || [];
                textLayer.$lines[row].push(ghostSpan);
            }
            col += token.value.length;
        });
    }
    editor._ghostMarkerIds = markers;
}
function findTokenPositions(editor, targetWord) {
    const session = editor.getSession();
    const tokenizer = session.getMode().getTokenizer();
    const positions = [];
    for (let row = 0; row < session.getLength(); row++) {
        const line = session.getLine(row);
        const tokens = tokenizer.getLineTokens(line, session.getMode().$id).tokens;
        let column = 0;
        tokens.forEach((token) => {
            if (token.value === targetWord) {
                positions.push({ row, column });
            }
            column += token.value.length;
        });
    }
    return positions;
}
function clearGhostMarkers(editor) {
    const session = editor.getSession();
    if (editor._ghostMarkerIds) {
        editor._ghostMarkerIds.forEach((id) => session.removeMarker(id));
        editor._ghostMarkerIds = [];
    }
}
function writeOutput(data, messageJson, manuallScroll) {
    if (outputArea) {
        const msgText = data.replaceAll("<", "&lt").replaceAll(">", "&gt");
        if (messageJson && messageJson.messageType) {
            const localmsgId = messageJson.id || -1;
            msgId = localmsgId;
            if (messageJson.id === -1)
                console.error(new Error("invalid message id: " + messageJson));
            const messageType = messageJson.messageType;
            const messageClientId = messageJson.clientId;
            let messageGroup = outputArea;
            switch (messageType) {
                case ConsoleMessageType.UserChat:
                    const group = outputArea.querySelector(`[msg-id="${localmsgId - 1}"]`);
                    const ownMessageClass = messageClientId === wsClientId || !wsClientId ? "chat-ownMessage" : "";
                    if (group?.getAttribute("clientId") == messageClientId && group === outputArea.lastChild) {
                        messageGroup = group;
                        messageGroup.getElementsByClassName("chat-content-container")[0].innerHTML += `<span class="chat-content"> ${msgText}</span>`;
                        messageGroup.setAttribute("msg-id", localmsgId + "");
                        // messageGroup.classList.add('console-chat-group')
                    }
                    else
                        outputArea.innerHTML += `<span class="console-chat ${ownMessageClass}" msg-id="${localmsgId}" clientId="${messageClientId.trim()}"><span class="chat-displayName">${messageJson.clientDisplayName}</span><div class="chat-content-container"><span class="chat-content">${msgText}</span></div></span>`;
                    break;
                case ConsoleMessageType.SessionInfo:
                    outputArea.innerHTML += `<span class="console-session-info" msg-id="${localmsgId}">${msgText}</span>`;
                    break;
                case ConsoleMessageType.Info:
                    outputArea.innerHTML += `<span class="console-info" msg-id="${localmsgId}">${msgText}</span>`;
                    break;
                case ConsoleMessageType.Error:
                    const errorElem = document.createElement('span');
                    errorElem.classList.add('console-error');
                    errorElem.setAttribute('msg-id', localmsgId.toString());
                    // errorElem.id = 'compile-error'
                    errorElem.innerHTML = msgText;
                    errorElem.onclick = () => {
                        const { range, row, column, rowend, columnEnd } = messageJson.params;
                        editor.focus();
                        editor.gotoLine(row, column);
                        editor.selection.setRange(range);
                    };
                    outputArea.appendChild(errorElem);
                    // outputArea.innerHTML += `<span class="console-error" msg-id="${msgId}" id='compile-error'>${msgText}</span>`;
                    break;
                case ConsoleMessageType.Debug:
                    outputArea.innerHTML += `<div  msg-id="${msgId}"><pre class="console-debug">${msgText}</pre></div>`;
                    break;
                case ConsoleMessageType.DebugProgram:
                    const groupDebug = outputArea.querySelector(`.debug-program[msg-id="${msgId}"] .debug-program-container`);
                    if (groupDebug)
                        groupDebug.innerHTML += `<span class="console-debug">${msgText}</span>`;
                    else
                        outputArea.innerHTML += `<div class="debug-program" msg-id="${msgId}"><button onclick="toggleConsoleDebugProgram(this.parentElement)">x</button><div class="debug-program-container"></div></div>`;
                    break;
                case ConsoleMessageType.Output:
                    if (document.getElementById('active-console'))
                        messageGroup = document.getElementById('active-console').querySelector(' div'); // TODO improve this selection
                    messageGroup.innerHTML += `<pre class="console-program-${messageJson.type == WebSocketMessageType.End ? "return" : messageJson.type == WebSocketMessageType.Console ? "input" : "output"}">${data} </pre>`;
                    break;
                default:
                    outputArea.innerHTML += `<pre class="console-output" msg-id="${msgId}">${data}</pre>`;
                    break;
            }
        }
        else {
            outputArea.innerHTML += `<pre class="console-output" msg-id="${msgId}">${msgText}</pre>`;
        }
        // outputArea.textContent += "\n";
        if (!manuallScroll)
            outputArea.scrollTop = outputArea.scrollHeight;
    }
}
export function joinsession() {
    const shareContainer = document.createElement('div');
    shareContainer.classList.add('share-container');
    shareContainer.innerHTML =
        `

    <script src="../dist/public/emailCodeVerificationClient.js" async type="text/javascript"></script>
    <form id="codeForm" method="get">
        <div class="text-container">
            <h1>Join a session</h1>
        </div>
        <div class="input-container">
            <input type="number" maxlength="6" name="code" id="code" autocomplete="off">
            <div class="display" id="display">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        <div class="button-container">
            <button  type="submit">Alatura-te</button>
            <p id="code-error"></p>
        </div>
        
    </form>
    
    `;
    document.body.appendChild(shareContainer);
    const script = document.createElement('script');
    const file = "/client/scripts/emailCodeVerificationClient.js";
    script.setAttribute('src', file);
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('async', 'true');
    document.body.insertBefore(script, shareContainer);
    const form = document.getElementById('codeForm');
    const codeInput = document.getElementById('code');
    codeInput.oninput = onCodeInput;
    function onCodeInput() {
        if (codeInput.value.length >= 6)
            submit();
    }
    async function submit() {
        const codeInput = document.getElementById('code');
        if (codeInput.valueAsNumber == undefined)
            return;
        await fetch('editor/joinsession?code=' + codeInput.valueAsNumber, {}).then(response => {
            return response.json();
        }).then(res => {
            if (res.redirect)
                location.href = res.redirect;
            console.log('redirecting..');
        }).catch(err => {
            window.alert(err);
            document.getElementById('code-error').innerText = err;
        });
    }
    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        submit();
    });
    // document.getElementById('copy-link')!.onclick = () => {
    //   displayMessagePopup(data.link)
    // }
}
export function copySessionLink() {
    const clientId = wsSessionId;
    let sessionLink;
    sessionLink = window.location.origin + window.location.pathname + `?session=${clientId}`;
    // if (navigator.clipboard) {
    //   navigator.clipboard.writeText(sessionLink).then(() => {
    //     console.log("Code copied to clipboard!");
    //   });
    // } else displayMessagePopup(sessionLink);
    if (!wsSessionId)
        displayMessagePopup('Invalid session id.');
    const shareContainer = document.createElement('div');
    shareContainer.classList.add('share-container');
    shareContainer.innerHTML =
        `
    <form id="createSessionForm">
      <button id='close-share-session'>x</button>

      <label for="chat">Enable Chat <input type="checkbox" name="chat" checked></label>
      
      <label for="code-permission">Editor Permission 
          <select id='code-permission' name='codePermission'>
            <option value='0'>Everyone</option>
            <option value='2'>Only host</option>
            <option value='1'>Require Permission</option>
          </select>
      </label>
      <button type="submit" id="submit-create-session">Create Session</button>
      <p id='session-create-error'></p>
    </form>
    <div id='connect-data-container'>
      <div id='connect-data-inner'>
        <img id="data.qrurl"> 
        <p>or</p>
        <div class='connect-info'>
          <p class='code' id="data.code">xxxxxx</p><button id='copy-link'>copy</button>
        </div>
      </div>
    </div>
    
    `;
    document.body.appendChild(shareContainer);
    document.getElementById('close-share-session').onclick = function (ev) {
        shareContainer.remove();
        // shareContainer.animate()
    };
    document.getElementById('createSessionForm').onsubmit = function (ev) {
        ev.preventDefault();
    };
    if (session) {
        document.getElementById('connect-data-container')?.classList.add('created');
        document.getElementById('data.code').innerText = session.code;
        document.getElementById('data.qrurl').src = session.img;
    }
    else
        fetch('/editor/sharesession?id=' + wsSessionId)
            .then(res => {
            return res.json();
        })
            .then(data => {
            session = { code: data.code, img: data.qrsvg };
            document.getElementById('data.code').innerText = data.code;
            document.getElementById('data.qrurl').src = data.qrsvg;
            // const shareContainer = document.createElement('div')
            // shareContainer.classList.add('share-container');
            // shareContainer.innerHTML =
            // `
            // <form id="createSessionForm" action="/editor/startsession/${wsSessionId}" method="POST">
            //   <button id='close-share-session'>x</button>
            //   <label for="chat">Enable Chat <input type="checkbox" name="chat" checked></label>
            //   <label for="code-permission">Editor Permission 
            //       <select id='code-permission' name='codePermission'>
            //         <option value='0'>Everyone</option>
            //         <option value='2'>Only host</option>
            //         <option value='1'>Require Permission</option>
            //       </select>
            //   </label>
            //   <button type="submit" id="submit-create-session">Create Session</button>
            // </form>
            // <div id='connect-data-container'>
            //   <div id='connect-data-inner'>
            //     <img src="${data.qrsvg}">
            //     <p>or</p>
            //     <div class='connect-info'>
            //       <p class='code'>${data.code}</p><button id='copy-link'>copy</button>
            //     </div>
            //   </div>
            // </div>
            // `
            // document.body.appendChild(shareContainer)
            // document.getElementById('close-share-session')!.onclick = function (this, ev) {
            //   shareContainer.remove();
            //   // shareContainer.animate()
            // }
            document.getElementById('createSessionForm').onsubmit = function (ev) {
                ev.preventDefault();
                const formData = new FormData(ev.target);
                try {
                    if (!formData.has('chat'))
                        formData.set('chat', '');
                    const entryData = Object.fromEntries(formData.entries());
                    if (!wsSessionId)
                        throw "Invalid session id.";
                    const startedSessionId = wsSessionId;
                    fetch('/editor/startsession/' + wsSessionId, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(entryData)
                    }).then(res => {
                        document.getElementById('connect-data-container')?.classList.add('created');
                        const sessionCodeNode = document.createElement('h2');
                        sessionCodeNode.innerText = data.code;
                        sessionCodeNode.classList.add('session-code');
                        document.getElementById('join-session').parentNode.insertBefore(sessionCodeNode, document.getElementById('join-session'));
                        // window.location.search += (window.location.search ? "&" : "?" ) + "session="+wsSessionId
                        if (!window.location.search.includes("session=") && startedSessionId != undefined)
                            window.history.pushState({ page: "updated session info" }, "intelge info", window.location.search + (window.location.search ? "&" : "?") + "session=" + startedSessionId);
                    }).catch(err => {
                        throw err;
                    });
                }
                catch (err) {
                    if (typeof err == "string")
                        document.getElementById('session-create-error').innerText = err;
                    else
                        console.error(err);
                }
            };
            document.getElementById('copy-link').onclick = () => {
                displayMessagePopup(data.link);
            };
        });
}
export function createFile(fileName = "untitled.txt") {
    const command = JSON.stringify({
        type: WebSocketMessageType.FileManagement,
        command: FileManagementCommands.Create,
        body: fileName,
    });
    ws.send(command);
    //ws.send({command: FileManagementCommands.Create, args: []});
    // console.log("create file " + command)
}
function openFile(fileName = "main.cpp") {
    const command = JSON.stringify({
        type: WebSocketMessageType.FileManagement,
        command: FileManagementCommands.Open,
        body: fileName,
    });
    ws.send(command);
}
// websocket //
if (document.cookie.includes('session=') && !window.location.search.includes('save') && !window.location.search.includes('session')) {
    if (!window.confirm('You have a previous unsaved session, would you like to recover it?'))
        document.cookie = 'session=';
}
const tooltip = (await (await fetch('/editor/tooltipHints')).json());
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
        var screenPos = { row: row, column: col, side: offset - col > 0 ? 1 : -1 };
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
        var tokenText = '';
        if (editorSessions.has(token.value)) {
            //  this.hide();
            const fileText = await getFileValue(token.value);
            tokenText = `<b>${token.value}</b>: <pre style="opacity: 0.75; max-height: 20lh; overflow: hidden;">${fileText}</pre>`;
        }
        else if (!token || !tooltip.tooltips[token.value]) {
            session.removeMarker(this.marker);
            this.hide();
            return;
        }
        else {
            const tooltipValue = tooltip.tooltips[token.value] || undefined; //(await (await fetch('/editor/tooltipHints/'+token.value)).json()).description;
            tokenText = tooltipValue.description + "\n<span>" + tooltipValue.example + "</span>";
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
            this.setClassName('ii-hoverHints');
        }
        this.show(null, this.x, this.y);
        this.token = token;
        session.removeMarker(this.marker);
        this.range = new Range(docPos.row, token.start, docPos.row, token.start + token.value.length);
        this.marker = session.addMarker(this.range, "ace_bracket", "text");
    }
    ;
    onMouseMove(e) {
        this.x = e.clientX;
        this.y = e.clientY;
        if (this.isOpen) {
            this.lastT = e.timeStamp;
            this.setPosition(this.x, this.y);
        }
        if (!this.$timer)
            this.$timer = setTimeout(this.update, this.isOpen ? 100 : 1500);
    }
    ;
    onMouseOut(e) {
        if (e && e.currentTarget.contains(e.relatedTarget))
            return;
        this.hide();
        this.editor.session.removeMarker(this.marker);
        this.$timer = clearTimeout(this.$timer);
    }
    ;
    setPosition(x, y) {
        if (x + 10 + this.width > this.maxWidth)
            x = window.innerWidth - this.width - 10;
        if (y > window.innerHeight * 0.75 || y + 20 + this.height > this.maxHeight)
            y = y - this.height - 30;
        Tooltip.prototype.setPosition.call(this, x + 10, y + 20);
    }
    ;
    destroy() {
        this.onMouseOut(undefined);
        event.removeListener(this.editor.renderer.scroller, "mousemove", this.onMouseMove);
        event.removeListener(this.editor.renderer.content, "mouseout", this.onMouseOut);
        delete this.editor.tokenTooltip;
    }
    ;
}
const ws = new WebSocket(WSUrl);
ws.addEventListener('open', (ev) => {
    const sessionId = new URLSearchParams(window.location.search).get("session") ? new URLSearchParams(window.location.search).get("session") : new URLSearchParams(window.location.search).get("save");
    //writeOutput(sessionId || "No session ID found in URL.");
    displayMessagePopup(sessionId);
    window.onbeforeunload = (ev => {
        if (modifiedFile)
            ev.preventDefault();
    });
    let hoverTooltip = 0;
    setTimeout(() => {
        if (wsSessionId == undefined)
            ws.send(JSON.stringify({ type: WebSocketMessageType.Handshake }));
        setTimeout(() => {
            if (wsSessionId == undefined)
                ws.send(JSON.stringify({ type: WebSocketMessageType.Handshake }));
        }, 3000);
    }, 500);
    const tooltip = new TokenTooltip(editor);
});
ws.addEventListener('close', (ev) => {
    const serviceRestart = ev.code == 1006;
    console.log(ev.code + " " + ev.reason);
    const socketStopped = document.createElement('div');
    socketStopped.classList.add(serviceRestart ? 'service-stopped' : 'service-error');
    const socketText = document.createElement('p');
    socketText.innerHTML = serviceRestart ? 'Scuze, am pierdut conexiunea la server...' : ev.reason;
    socketStopped.appendChild(socketText);
    document.getElementById('editor')?.appendChild(socketStopped);
    if (serviceRestart)
        setTimeout(() => {
            window.location.reload();
        }, 2000);
});
ws.onerror = (err) => {
    displayMessagePopup("WEBSOCKER ERROR: " + err);
};
export function submitConsole(elem, type, Console) {
    //     const sendText = elem?.value.replace(consoleText, "")
    //     if(sendText == "") return;
    //     console.log(sendText);
    //    //sendWebsocketCommand(sendText, ["console"]); //ws.send({command: sendText, args: ['console']});
    //    ws.send(JSON.stringify({ command: sendText, args: ['console'], type: WebSocketMessageType.Chat }));
    //    consoleText = elem?.value || "Error: invalid element";
    //    consoleInput.value = "";
    const sendText = elem?.value;
    if (!sendText)
        return;
    ws.send(JSON.stringify({
        command: sendText,
        // args: ["console"],
        type: type || WebSocketMessageType.Chat,
    }));
    if (Console)
        Console.sendCommand(sendText);
    consoleInput.value = "";
    typingIndicatorDelay = 300;
    onConsoleInput(elem);
    ws.send(JSON.stringify({ type: WebSocketMessageType.ConsoleTyping, status: "end" }));
}
outputArea.onscroll = ev => {
    const lastMessageGroup = document.querySelector('[msg-id="' + ((msgId != -1) ? msgId.toString() : '0') + '"]');
    console.log(outputArea.scrollTop + outputArea.scrollHeight);
    console.log(lastMessageGroup.offsetTop + lastMessageGroup.offsetHeight + " " + lastMessageGroup.scrollHeight);
    const blockScroll = outputArea.scrollHeight - outputArea.clientHeight - outputArea.scrollTop > 1; //*eventJson.clientId !== wsClientId && */document.querySelector( `[msg-id="${msgId}"]`) ? (outputArea!.scrollTop > document.querySelector( `[msgId="${msgId}"]`)!.clientHeight) : true
    if (!blockScroll) {
        document.getElementById('message-indicator')?.remove();
    }
};
editor.on("change", (delta) => {
    !editor.session.getUndoManager().canRedo() ? document.getElementById('editor-redo')?.classList.add('enable') : document.getElementById('editor-redo')?.classList.remove('enable');
    !editor.session.getUndoManager().canUndo() ? document.getElementById('editor-undo')?.classList.add('enable') : document.getElementById('editor-undo')?.classList.remove('enable');
    editor.renderer.updateFull();
    parsedCode = parseCode();
    if (isRemoteChange)
        return;
    const code = editor.getValue();
    if (!currentFileName)
        console.error("Current file name is invalid");
    dirtyFile(currentFileName);
    ws.send(JSON.stringify({
        body: code,
        delta: delta,
        type: WebSocketMessageType.CodeChange,
        fileName: currentFileName,
        saveFile: true,
    })); // Send code to server on change // TODO Remove code from body.
});
editor.on("changeSelection", () => {
    if (isRemoteChange)
        return;
    if (!isColabSession)
        return;
    const selection = editor.getSelectionRange();
    // const start = selection.start;
    // const end = selection.end;
    // const range = new AceRange(start.row, start.column, end.row, end.column);
    // const selectedText = editor.session.getTextRange(range);
    // console.log(selectedText);
    if (!currentFileName)
        console.error("Current file name is invalid");
    ws.send(JSON.stringify({
        range: selection,
        fileName: currentFileName,
        type: WebSocketMessageType.CodeSelection,
    })); // Send code to server on change
});
var FileManagementCommands;
(function (FileManagementCommands) {
    FileManagementCommands["Create"] = "create";
    FileManagementCommands["Delete"] = "delete";
    FileManagementCommands["List"] = "list";
    FileManagementCommands["Rename"] = "rename";
    FileManagementCommands["Open"] = "open";
})(FileManagementCommands || (FileManagementCommands = {}));
class CompileError {
    range;
    annotation;
    markerId;
    text;
    display;
    constructor(range, text) {
        this.text = text;
        this.range = range;
        this.annotation = {
            row: range.start.row,
            column: range.start.column,
            text: text,
            type: "error",
        };
        this.markerId = editor.session.addMarker(range, "ace_carret_error", "text", true);
    }
}
let modifiedFile = false;
let ping = -1;
function cleanDebug() {
    renderer.removeGhostText();
    document.getElementById('vector-container').innerHTML = '';
    clearTimeout(playbackId);
    onExit();
}
function dirtyFile(fileName) {
    modifiedFile = true;
    const saveFile = fileName ? !["c", "exe"].includes(fileName.split(".").pop() || "") : true;
    if (saveFile) {
        document.getElementById('buttons')?.classList.remove('compiled');
        document.getElementById('saveProject')?.classList.remove('saved');
        document.getElementById('active-project-name')?.classList.add('dirty');
    }
}
// STATE VARIABLES //
const markers = [];
const errorAnnotations = [];
const compileErrorObjs = new Map();
//    END   //
ws.onmessage = (event) => {
    let eventJson = JSON.parse(event.data);
    lastEventJson = eventJson;
    let command = eventJson.message;
    let data = eventJson.body;
    const type = eventJson.type;
    // if(type!=WebSocketMessageType.Handshake && !wsSessionId)
    //   return displayMessagePopup('editor was not initialised. Session id is invalid.')
    //console.log(type);
    //console.log(eventJson)
    // try{
    //     msgMap.get(eventJson.msgId)?.onReceive(eventJson)
    // } catch
    // {
    //     console.log("failed to get websocket msg")
    // }
    // console.log(msgMap)
    // console.log(eventJson)
    function handleOutput(eventJson) {
        if (eventJson.message != 'info locals' && eventJson.messageType != ConsoleMessageType.DebugProgram)
            writeOutput(data, eventJson);
        const session = editor.getSession();
        const doc = session.getDocument();
        const text = doc.getValue();
        async function asyncExecuteCommand(command, cmdId) {
            return await fetch("/requestValue?value=" + command + "&cmdId=" + cmdId, {
                cache: "no-store",
            });
        }
        // handle variables
        if (eventJson.variables != undefined) {
            const variablesSection = document.getElementById("variables");
            let unprocVariables;
            const variablesString = JSON.stringify(eventJson.variables);
            // const textToVar = data
            //   .split("(gdb)")
            //   .pop()
            //   ?.replace(/\n/g, ";")
            //   .match(/(?<!\w\S)(\b\w+)\s*=.*/g);
            if (eventJson.variables != undefined) {
                //if we have variables in the chunk
                variables = parseMIDebuggerOutput(eventJson, {
                    onNewVariable: (variable) => {
                        if (variable.type != "array")
                            return;
                        createDisplayVector(variable);
                        //console.log("created display vector")
                    },
                    onArrayIndexChange: (variableName, changes, changed) => {
                        updateDisplayVectorElement(new Variable(variableName, changes.new, "array"), changes.index, changed);
                        // console.log(changes.updatedIndices)
                    },
                });
                console.log(variables);
            }
            // set variables
            maxValue = 0;
            for (let index = 0; index < variables.length; index++) {
                const element = variables[index];
                if (variables.length == 0)
                    break;
                //array type
                if (element.type == "array") {
                    element.value.forEach((value) => {
                        if (maxValue < value)
                            maxValue = value;
                        updateDisplayVector(element);
                    });
                }
            }
            vectDisplays.forEach((element) => {
                const vectElems = document
                    .getElementById(element)
                    ?.getElementsByClassName("item-container")[0]
                    .children;
                for (let i = 0; i < vectElems.length; i++) {
                    const value = parseInt(vectElems[i].innerText.split("\n")[1]);
                    const colorV = Math.min(Math.max(value / maxValue, value / maxValue / 2) * 200 + 50, 255);
                    vectElems[i].style.backgroundColor = `rgb(${colorV},${colorV},${colorV})`;
                }
            });
        }
        else {
            //TODO DMDMDMDM Check if line number string contains (gdb) to prevent standard output from being parsed as line number
            if (eventJson.body.frame && eventJson.body.frame.line) {
                //check if its a chunk with line number
                debugLine = eventJson.body.frame.line; //parseInt(data.match(/^(\d)+(?=\s)?/gm)); // update debug row
                setDebugLineStyle(debugLine);
                const conditionRegex = /(?:if|while)\s*\(([^(){};]+?)\)/g;
                const forRegex = /for\s*\(([^;]*);([^;]*);[^)]*\)/g;
                let conditions = [];
                let buffer = "";
                const debugLineText = session.getLine(debugLine - 1);
                const pos = { row: debugLine - 1, column: debugLineText.length };
                // Match `if` and `while`
                for (const match of data.matchAll(conditionRegex)) {
                    conditions.push(match[1].trim());
                }
                // Match `for` loops (only the 2nd part — the condition)
                for (const match of data.matchAll(forRegex)) {
                    conditions.push(match[2].trim());
                }
                // setTimeout(() => {
                let i = 1;
                if (playbackSpeed < 4)
                    // dont bother if speed is too high.
                    for (const condition of conditions) {
                        asyncExecuteCommand(condition, cmdId++)
                            .then(function (response) {
                            return response.json();
                        })
                            .then(function (data) {
                            const exprValue = data.body.toString();
                            if (parseInt(exprValue.match(/(?<=\$)\d*/)?.[0]) === cmdId &&
                                !Number.isNaN(parseInt(exprValue.match(/(?<=\$)\d*/)?.[0]))) {
                                buffer += (exprValue.replace(exprValue.match(/\$\d*/), condition) +
                                    "; ")
                                    .replace("(gdb)", "")
                                    .replace("\n", "");
                                console.log(buffer);
                                if (i++ == conditions.length) {
                                    // wait to buffer all values
                                    renderer.setGhostText("   " + buffer, pos);
                                    console.log(buffer);
                                    buffer = "";
                                }
                            }
                            else
                                renderer.setGhostText("   " + buffer, pos);
                        });
                    }
                // }, 50);
                const regex = /(\b(?<=^(\d)+(?=\s)?\s*)(\w*)(\[(\w|\d)\]))|(?<=[(-/])(\w*)(\[(\w|\d)\])/g;
                if (data.match(regex) != null)
                    data.match(regex).forEach((variable) => {
                        const vararr = regex.exec(data);
                        if (!vararr)
                            return;
                        let varName = vararr[3];
                        if (!varName)
                            varName = vararr[6];
                        let varIndex = vararr[5];
                        if (!varIndex)
                            varIndex = vararr[8];
                        console.log(variables);
                        const indexCode = varIndex.charCodeAt(0);
                        if (variables.find((vari) => vari.varname === varIndex)) {
                            const index = variables.find((vari) => vari.varname === varIndex).value;
                            if (variable.indexes.length > indexCode)
                                return;
                            variable.indexes[indexCode] = index;
                            //console.log(index)
                            //document.getElementById(varName).children[index].classList.add("active-vector-element");
                            removePrevActiveElem(index, varName, varIndex); // TODO remove +1
                            const vectorElem = document.getElementById(varName);
                            vectorElem.children[index].style.outlineColor =
                                "#" +
                                    Math.floor((16777215 % (varIndex.charCodeAt(0) / 100)) * 16777215).toString(16);
                            //document.getElementById(varName).setAttribute("activeIndex", index);
                            //getDisplayVectorElement(makeVariableRefByName(varName), index).parentElement.setAttribute("activeIndex", index);
                        }
                    });
            }
        }
        if (data[0] == data.match(/^(\d)(?=\s)?/gm)) {
            setDebugLineStyle(debugLine);
        }
    }
    switch (type) {
        case WebSocketMessageType.Error:
            writeOutput(data, eventJson);
            break;
        case WebSocketMessageType.Console:
        case WebSocketMessageType.Output:
            if (byteSize(eventJson.body) > 64000) // 1000000 is 1Mb
             {
                writeOutput('error! output exceeded 64kb');
                break;
            }
            else
                // writeOutput(data, eventJson)
                handleOutput(eventJson);
            if (eventJson.message === 'end')
                cleanDebug();
            break;
        case WebSocketMessageType.End:
            if (eventJson.body === "gdb") {
                cleanDebug();
                const cmdBut = document.getElementById("buttons");
                cmdBut?.classList.remove("debug-control");
                cmdBut?.classList.remove("execute-control");
            }
            else {
                if (data)
                    writeOutput(data + "  |<span>   Execution time: " + `<span style="color:${eventJson.time < 100 ? 'green' : 'red'}">` + eventJson.time + "</span>ms" + (eventJson.notes != "" && eventJson.notes != undefined ? "<br><span style='opacity: 0.5'>notes: " + eventJson.notes + "</span>" : "" + "</span>"), eventJson);
                else
                    writeOutput("Forced closed program." + (eventJson.notes != "" && eventJson.notes != undefined ? "<br><span style='opacity: 0.5'>notes: " + eventJson.notes + "</span>" : "" + "</span>"), eventJson);
            }
            onExit();
            break;
        case WebSocketMessageType.MouseUpdate:
            if (!eventJson.clientId)
                break;
            // }
            // let cursor: HTMLDivElement | null = document.getElementById('cursor-'+eventJson.clientId) as HTMLDivElement
            // if((sizeX/eventJson.sizeX<0.7 || sizeY/eventJson.sizeY<0.7 || sizeX/eventJson.sizeX>1.3 || sizeY/eventJson.sizeY>1.3)) 
            //   {
            //     clearInterval(stepint)
            //     if(cursor)
            //       cursor!.remove();
            //     break;
            //   }
            // maybe check if the pointer type switched
            //  TODO Imrpove this
            // if(sizeX/eventJson.sizeX<1.1 && sizeX/eventJson.sizeX>0.9)
            //   cursor.style.filter = '';
            // else
            //   cursor.style.filter = `blur(${(1-sizeX/eventJson.sizeX)*7}px)` //(Math.max(Math.abs(sizeX/eventJson.sizeX), Math.abs(sizeY/eventJson.sizeY)))
            if (!cursors.has(eventJson.clientId))
                new EditorCursor(eventJson);
            else
                cursors.get(eventJson.clientId).update(eventJson);
            // cursorObj.lposX = cursorObj.posX;
            // cursorObj.lposY = cursorObj.posY;
            // if(cursorObj)
            // {
            // }
            // cursors.set(eventJson.clientId, {...cursorObj, lposX: posX, lposY: posY})
            // let lposX = cursorObj.posX;
            // let lposY = cursorObj.posY;
            //  cursors.set(eventJson.clientId, {...cursorObj, posX: updatedPos.posX, posY: updatedPos.posY, lposX, lposY})
            // TODO Add incative class to cursor when user doesnt move it.
            break;
        case WebSocketMessageType.Chat:
            if (eventJson.clientId) {
                const lastMessageGroup = document.querySelector('[msg-id="' + ((msgId != -1) ? msgId.toString() : '0') + '"]');
                const blockScroll = outputArea.scrollHeight - outputArea.clientHeight - outputArea.scrollTop > 1; // lastMessageGroup? lastMessageGroup.offsetTop + lastMessageGroup.offsetHeight > outputArea!.scrollTop : false//*eventJson.clientId !== wsClientId && */document.querySelector( `[msg-id="${msgId}"]`) ? (outputArea!.scrollTop > document.querySelector( `[msgId="${msgId}"]`)!.clientHeight) : true
                // if(!document.querySelector('[msgId='+msgId+']')) return;
                if (blockScroll) {
                    if (document.getElementById('message-indicator')) {
                        const existingIndicator = document.getElementById('message-indicator');
                        if (existingIndicator?.innerText)
                            existingIndicator.innerText = (parseInt(existingIndicator.innerText) + 1).toString() + "+";
                    }
                    else {
                        outputArea.innerHTML += "<br>";
                        const messageIndicator = document.createElement('div');
                        messageIndicator.id = 'message-indicator';
                        messageIndicator.innerText = "1+";
                        document.getElementById('output-container')?.appendChild(messageIndicator);
                        lastViewedMessage = msgId;
                    }
                }
                else {
                    document.getElementById('message-indicator')?.remove();
                }
                writeOutput(data, eventJson, blockScroll);
            }
            else
                writeOutput(data, eventJson);
            break;
        case WebSocketMessageType.Handshake:
            if ((!wsSessionId && !wsClientId) || eventJson.sessionId) {
                wsClientId = eventJson.clientId;
                wsSessionId = eventJson.sessionId;
                isColabSession = eventJson.session != undefined;
                // if(!document.cookie.includes('session='))
                document.cookie = 'session=';
                setTimeout(() => {
                    document.cookie = 'session=' + wsSessionId + ';';
                }, 15000);
                //console.log(editor.session.toJSON()) // TODO Implement saving the editor session in a file on the server or on the client.
                addMouseListener(eventJson);
            }
            if (eventJson.session ? eventJson.session.isHost : false || !eventJson.session)
                document.getElementById('share')?.classList.add('host');
            writeOutput(eventJson.body, eventJson);
            const projectData = eventJson.project;
            const sessionData = eventJson.session;
            if (projectData) {
                const projNameNode = document.createElement('h1');
                projNameNode.innerText = eventJson.project.name;
                projNameNode.id = 'active-project-name';
                document.getElementById('join-session').parentNode.insertBefore(projNameNode, document.getElementById('join-session'));
            }
            if (sessionData) {
                if (!sessionData.canEdit)
                    editor.setReadOnly(true);
                if (!sessionData.canChat)
                    document.getElementById('console')?.setAttribute('disabled', 'true');
            }
            break;
        case WebSocketMessageType.CodeChange:
            // editor.session.getDocument().applyDelta(delta);
            if (editor.getValue() !== data.body &&
                eventJson.clientId !== wsClientId) {
                const delta = eventJson.body.delta;
                console.log(eventJson);
                isRemoteChange = true;
                editor.session.getDocument().applyDelta(delta);
                isRemoteChange = false;
                document.getElementById('buttons')?.classList.remove('compiled');
                dirtyFile(eventJson.fileName);
            }
            break;
        case WebSocketMessageType.CompileResult:
            const compileErrors = JSON.parse(eventJson.body);
            for (const elem of document.getElementsByClassName('console-error'))
                elem.remove();
            editor.session.setAnnotations([]);
            errorAnnotations.length = 0;
            for (const marker of markers)
                editor.session.removeMarker(marker);
            markers.length = 0;
            if (!compileErrors.length) {
                writeOutput('ok');
                for (const marker of markers)
                    editor.session.removeMarker(marker);
                markers.length = 0;
            }
            else
                for (const result of compileErrors) {
                    switch (result.kind) {
                        case "error":
                            // const location = result.locations[0];
                            if (!result.locations || !result) {
                                writeOutput(result.message, { messageType: 'error' });
                                break;
                            }
                            else
                                for (const location of result.locations) {
                                    const range = new AceRange(location.caret.line - 1, location.caret.column - 1, location.finish ? location.finish.line - 1 : location.caret.line - 1, location.finish ? location.finish.column : location.caret.column);
                                    const compileErrorObj = new CompileError(range, result.message);
                                    // compileErrorObjs.get(markerId)!.display?.remove()
                                    compileErrorObjs.set(compileErrorObj.markerId, compileErrorObj);
                                    errorAnnotations.push(compileErrorObj.annotation);
                                    markers.push(compileErrorObj.markerId);
                                    // window.alert((editor.renderer as any).$markerFront);
                                    //  writeOutput(result.message, {messageType: 'error', params: {range, row: range.start.row+1, column: range.start.column+1, rowend: range.end.row+1, columnemnd: range.end.column+1}})
                                    editor.session.setAnnotations(errorAnnotations);
                                    // for(const error of document.getElementsByClassName('ace_carret_error') as HTMLCollectionOf<HTMLDivElement>)
                                    // {
                                    //   error.addEventListener('click', ev => {
                                    //     window.alert('jsdjdjd')
                                    //   })
                                    // }
                                }
                            break;
                        default:
                        case "success":
                            for (const marker of markers)
                                editor.session.removeMarker(marker);
                            errorAnnotations.length = 0;
                            editor.session.setAnnotations([]);
                            document.getElementById('compile-error')?.remove();
                            compileErrorObjs.forEach(element => {
                                element.display?.remove();
                            });
                            // compileErrorObjs.clear()
                            break;
                    }
                    // writeOutput(result.kind)
                }
            break;
        case WebSocketMessageType.ExecuteStatus:
            let errorOutputString = "";
            switch (eventJson.status) {
                case 'spawnGUI':
                    displaynoVNC(activeConsole.element);
                    break;
                default:
                    if (eventJson.error) {
                        onExit();
                        // ON ERROR
                        document.getElementById('buttons')?.classList.remove('compiled');
                        for (const markerId of markers)
                            editor.session.removeMarker(markerId);
                        for (const errorMessage of eventJson.error.errors) {
                            errorOutputString += errorMessage.error + "\n";
                            if (errorMessage.row != -1) {
                                const row = errorMessage.row - 1;
                                const column = errorMessage.column;
                                errorAnnotations.push({
                                    row: row,
                                    column: column,
                                    text: errorMessage.error,
                                    type: "error",
                                });
                                markers.push(editor.session.addMarker(new AceRange(row, column, row, column + 1), "ace-error-line", "screenLine"));
                            }
                        }
                        editor.session.setAnnotations(errorAnnotations);
                    }
                    else {
                        if (eventJson.input == 1) {
                            const console = document.createElement('textarea');
                            document.querySelector('#active-console')?.appendChild(console);
                            console.addEventListener("keypress", (e) => {
                                if (e.key === "Enter" && !e.shiftKey || e.key === " ") {
                                    e.preventDefault();
                                    submitConsole(console, WebSocketMessageType.Console, activeConsole);
                                    console.remove();
                                }
                            });
                            console.focus();
                        }
                        editor.session.setAnnotations([]);
                        document.getElementById('buttons')?.classList.add('compiled');
                        for (const markerId of markers)
                            editor.session.removeMarker(markerId);
                    }
                    // writeOutput(
                    //   data.success
                    //     ? "Compilation of " + data.fileName + " successful!\n"
                    //     : errorOutputString ||
                    //         "Compilation error. (couldnt retrieve error message, sorry)"
                    // );
                    document.getElementById('compile-status').innerText = eventJson.body;
                    document.getElementById('compile-status').style.opacity = '1';
                    setTimeout(() => {
                        document.getElementById('compile-status').style.opacity = '0';
                    }, 500);
                    break;
            }
            break;
        case WebSocketMessageType.CodeSelection:
            if (!data) {
                //clear selection
                console.log("removed sleection");
                editor.session.removeMarker(marker);
                cursorManager.removeCursor(eventJson.clientId);
                return;
            }
            const selection = eventJson.body.range;
            const start = selection.start;
            const end = selection.end;
            const range = new AceRange(start.row, start.column, end.row, end.column);
            let cursorRow;
            let cursorColumn;
            //if(start.end==end.end || start.row*end.row * start.column * start*end.column==0) return;
            if (marker)
                editor.session.removeMarker(marker);
            if (start && end) {
                if (start !== end)
                    marker = editor.session.addMarker(range, "ace_remote_selection", "line", false);
                // TODO fix this so that the cursor goes to the end of the selection.
                cursorManager.replicateCursor(eventJson.clientId, {
                    row: (end.row > start.row) ? end.row : start.row,
                    column: (end.column > start.column) ? end.column : start.column,
                });
            }
            break;
        case WebSocketMessageType.ConsoleTyping:
            const indicatorStatus = eventJson.status;
            const indicatorClientId = eventJson.clientId;
            const typingIndicatorContainer = document.getElementById('typingIndicatorContainer');
            switch (indicatorStatus) {
                case "start":
                    if (!typingIndicators.has(indicatorClientId)) {
                        if ((typingIndicators.has(indicatorClientId)))
                            typingIndicators.get(indicatorClientId).remove;
                        // typingIndicators.delete(indicatorClientId);
                        const typingIndicator = document.createElement('div');
                        // typingIndicator. = indicatorClientId;
                        typingIndicators.set(indicatorClientId, typingIndicator);
                        typingIndicator.textContent = eventJson.displayName + " scrie...";
                        typingIndicatorContainer?.appendChild(typingIndicator);
                    }
                    break;
                case "end":
                    if (typingIndicatorContainer !== undefined && typingIndicators.has(indicatorClientId)) {
                        const typingIndicator = typingIndicators.get(indicatorClientId);
                        if (!typingIndicator)
                            return typingIndicatorContainer?.replaceChildren();
                        typingIndicator.animate([
                            { opacity: "100%", bottom: "0px", filter: "blur(0px)" },
                            { bottom: "-50px", opacity: 0, filter: " blur(10px)" },
                        ], { duration: 200 }).onfinish = (event) => {
                            typingIndicatorContainer?.removeChild(typingIndicator);
                            typingIndicator.remove;
                            typingIndicators.delete(indicatorClientId);
                        };
                    }
                    break;
            }
            break;
        case WebSocketMessageType.ColabData:
            const colabClients = eventJson.clients;
            const colabSessionId = eventJson.thisSessionId;
            const colabClientId = eventJson.thisClientId;
            const colabCommand = eventJson.colabCommand;
            isColabSession = true;
            switch (colabCommand) {
                case "DISCONECT":
                    const success = cursorManager.removeCursor(colabClientId);
                    document.getElementById('cursor-' + colabClientId)?.remove();
                    cursors.delete(colabClientId);
                    writeOutput(eventJson.body, eventJson);
                    break;
                case "HOST":
                    writeOutput(eventJson.body, eventJson);
                case "JOIN":
                    addMouseListener(eventJson.session);
                    break;
            }
            const colabContainer = document.getElementById("colab-container") || null;
            if (!colabContainer)
                return;
            colabContainer.innerHTML = "";
            colabClients.forEach((client) => {
                const clientId = client.split("-")[0];
                colabContainer.innerHTML += `<div class="colab-client" id=${clientId}>${clientId}</div>`;
            });
            break;
        case WebSocketMessageType.Heartbeat:
            ping = Date.now() - ping - eventJson.expectedDelay;
            ws.send(JSON.stringify({ type: WebSocketMessageType.Heartbeat })); // send heartbeat to server
            if (ping != -1)
                console.log("heartbeat ping: " + ping);
            ping = Date.now();
            break;
        case WebSocketMessageType.FileManagement:
            //   data.command should work too but it doesnt TODO
            const commandType = JSON.parse(event.data).body ? JSON.parse(event.data).body.command : eventJson.command;
            switch (commandType) {
                case FileManagementCommands.Create:
                    onFileCreate(data.content);
                    break;
                case FileManagementCommands.Delete:
                    deleteFile(eventJson.name, true);
                    break;
                case FileManagementCommands.List:
                    JSON.parse(event.data).body.content.forEach((file) => {
                        onFileCreate(file);
                    });
                    break;
                case FileManagementCommands.Rename:
                    renameFile(eventJson.name, eventJson.newName);
                    break;
                case FileManagementCommands.Open:
                    const fileName = eventJson.body.fileName;
                    const fileContent = eventJson.body.content;
                    currentFileName = fileName;
                    console.log(editorSessions.get(fileName));
                    if (!editorSessions.has(fileName)) {
                        const newSession = ace.createEditSession(fileContent);
                        // undo manager?
                        // if(fileName.split('.')[1] != 'cpp')
                        newSession.setMode(aceModes.getModeForPath(fileName).mode);
                        editor.setSession(newSession);
                        const session = {
                            editor: newSession,
                            fileName: fileName,
                            fileElement: undefined
                        };
                        editorSessions.set(fileName, session);
                    }
                    else {
                        if (!editorSessions.get(fileName)?.editor)
                            editorSessions.get(fileName).editor = ace.createEditSession(fileContent);
                        console.log("File already opened: ", fileName);
                        const session = editorSessions.get(fileName);
                        if (session) {
                            session.editor.setMode(aceModes.getModeForPath(fileName).mode);
                            editor.setSession(session.editor);
                        }
                        if (fileContent.toString() != session?.editor.getValue().toString()) {
                            isRemoteChange = true; // must add this to prevent sending on changed event
                            session.editor.setValue(fileContent);
                            isRemoteChange = false;
                        }
                    }
                    if (document.getElementById('active-open-file'))
                        document.getElementById('active-open-file').id = '';
                    const elem = editorSessions.get(fileName)?.fileElement;
                    if (elem) {
                        elem.id = 'active-open-file';
                    }
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
};
function removePrevActiveElem(index, varName, varIndex) {
    if (variableArrayIndexes[varIndex.charCodeAt(0)]) {
        const vectorElem = document.getElementById(varName);
        if (vectorElem) {
            const prevElem = vectorElem.children[variableArrayIndexes[varIndex.charCodeAt(0)]];
            prevElem.classList.remove("active-vector-element");
            prevElem.style.outlineColor = "initial";
            prevElem.classList.remove("active-vector-element");
            prevElem.style.outlineColor = "initial";
        }
    }
    variableArrayIndexes[varIndex.charCodeAt(0)] = index;
}
export function compileCode(ev) {
    fetch("/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            code: editor.getValue(),
            clientId: wsClientId,
            sessionId: wsSessionId,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
        const output = document.getElementById("output");
        if (!output)
            return;
        let errorOutputString = "";
        document.getElementById('compile-error')?.remove();
        if (!data.success) {
            // ON ERROR
            document.getElementById('buttons')?.classList.remove('compiled');
            for (const markerId of markers)
                editor.session.removeMarker(markerId);
            for (const errorMessage of data.errors) {
                errorOutputString += errorMessage.error + "\n";
                if (errorMessage.row != -1) {
                    const row = errorMessage.row - 1;
                    const column = errorMessage.column;
                    errorAnnotations.push({
                        row: row,
                        column: column,
                        text: errorMessage.error,
                        type: "error",
                    });
                    markers.push(editor.session.addMarker(new AceRange(row, column, row, column + 1), "ace-error-line", "screenLine"));
                }
            }
            editor.session.setAnnotations(errorAnnotations);
        }
        else {
            editor.session.setAnnotations([]);
            document.getElementById('buttons')?.classList.add('compiled');
            for (const markerId of markers)
                editor.session.removeMarker(markerId);
        }
        writeOutput(data.success
            ? "Compilation of " + data.fileName + " successful!\n"
            : errorOutputString ||
                "Compilation error. (couldnt retrieve error message, sorry)", { messageType: "error" });
        code = editor.getValue();
    });
}
export function sendDebugCommand(cmd) {
    //editor.setValue(code, -1);
    const cmdBut = document.getElementById("buttons");
    if (cmd == "-exec-run") {
        cmdBut?.classList.add("debug-control");
        cmdBut?.classList.remove("execute-control");
        if (!processRunning)
            onRun();
    }
    else if (cmd == "execute") {
        cmdBut?.classList.remove("debug-control");
        cmdBut?.classList.add("execute-control");
        if (!processRunning)
            onRun();
    }
    sendWebsocketCommand(cmd, []); //ws.send(JSON.stringify({command: cmd , args: []}));
    if (cmd == "-exec-next" || cmd == "-exec-continue")
        sendWebsocketCommand("-stack-list-variables --all-values ", []); // ws.send({command: 'info locals' , args: []});
    const consoleElem = document.getElementById("console");
    if (cmd == "-exec-execute" && consoleElem?.value != "")
        submitConsole(consoleElem, WebSocketMessageType.Console, activeConsole);
}
let playbackSpeed = 1;
let playbackId;
let processRunning;
export function playback() {
    sendDebugCommand("-stack-list-variables --all-values");
    //  TODO Stop playback
    if (!processRunning)
        onRun();
    let i = debugLine;
    updatePlaybackSpeed();
}
export function restartPlayback() {
    sendDebugCommand("-exec-run");
    setPlaybackSpeed(1);
    playback();
}
const childIndexOf = 1;
export function setPlaybackSpeed(newPlaybackSpeed) {
    document
        .getElementById("speed-control")
        ?.children[playbackSpeed - 1 + childIndexOf].classList.remove("active-speed");
    playbackSpeed = newPlaybackSpeed;
    updatePlaybackSpeed();
}
function updatePlaybackSpeed() {
    document
        .getElementById("speed-control")
        ?.children[playbackSpeed - 1 + childIndexOf].classList.add("active-speed");
    if (playbackId)
        clearInterval(playbackId);
    playbackId = setInterval(() => {
        if (!ws.OPEN || processRunning)
            return clearInterval(playbackId);
        sendDebugCommand("-exec-next");
        if (debugLine >= editor.session.getLength() + 2) {
            // add offset to complete exectuin and display result.
            clearInterval(playbackId);
            onExit();
        }
    }, 300 / playbackSpeed);
}
function onRun() {
    editor.setReadOnly(true);
    processRunning = true;
    document.getElementById('buttons')?.classList.add('executing');
    document.getElementById('compile-status').innerText = 'Communicating with server...';
    document.getElementById('compile-status').style.opacity = '0.25';
    if (document.getElementById('active-console'))
        document.getElementById('active-console').id = '';
    activeConsole = new Console();
    // if(currentFileName.toLowerCase().includes("gui"))
    //   displaynoVNC(activeConsole.element)
    outputConsoles.push(activeConsole);
    // TODO Add separate input area for interactive console.
}
function onExit() {
    editor.setReadOnly(false);
    processRunning = false;
    editor.session.removeMarker(lastDebugId);
    document.getElementById('buttons')?.classList.remove('executing');
    if (document.getElementById('active-console'))
        document.getElementById('active-console').id = '';
}
function setDebugLineStyle(lineIndex) {
    // document.querySelectorAll(".ace_debug").forEach(element => {
    //     element.classList.remove("ace_debug");
    // });
    //editor.session.setBreakpoint(lineIndex-1)
    editor.session.removeMarker(lastDebugId);
    lastDebugId = editor.session.highlightLines(lineIndex - 1, lineIndex - 1, "").id;
    //document.querySelectorAll(".ace_text-layer > .ace_line")[lineIndex-1].classList.add("ace_debug");
}
function displayVector(array, vectCont) {
    // TODO make vect cont an array based of vector name (aka index of ascii number)
    //  vectCont.innerHTML ="";c
    let i = 0;
    // console.log(array);
    if (!vectCont)
        return;
    array.forEach((element) => {
        vectCont.innerHTML += `<span style="background-color: rgb(${element * 50 + 50},${element * 50 + 50},${element * 50 + 50})"><index>${i++}</index><value>${element}</value></span>`;
    });
}
let vectDisplays = [];
function createDisplayVector(variable) {
    // console.log(variable)
    if (variable.type != "array")
        return;
    // vectDisplays.add(variable)
    vectDisplays.push(variable.varname);
    const vectorContainer = document.getElementById("vector-container");
    if (vectorContainer) {
        vectorContainer.innerHTML += `<div id=${variable.varname} class='vector-display'><div class='vector-header'><h>${variable.varname}</h><button onclick='resizeVectorContainer(this)'>x</button></div><div class='item-container'></div></div>\n`;
    }
    if (Array.isArray(variable.value)) {
        displayVector(variable.value, document
            .getElementById(variable.varname)
            ?.getElementsByClassName("item-container")[0]);
    }
}
function resizeVectorContainer(elem) {
    const itemContainer = elem.parentElement?.parentElement?.getElementsByClassName("item-container")[0];
    if (itemContainer) {
        itemContainer.style.height =
            itemContainer.style.height === "0px" ? "auto" : "0px";
        itemContainer.style.minHeight =
            itemContainer.style.minHeight === "0px" ? "100px" : "0px";
        itemContainer.style.overflow =
            itemContainer.style.overflow === "hidden" ? "visible" : "hidden";
        // itemContainer.style.display = itemContainer.style.display === 'none' ? 'flex' : 'none';
    }
}
let maxValue = 0;
function updateDisplayVector(variable) {
    // displayVector(variable.value, document.getElementById(variable.varname))
    //    variable.values.forEach(vari => {
    //     updateDisplayVectorElement(variable, vari.index)
    //    });
}
function updateDisplayVectorElement(variable, index, changed) {
    const elem = getDisplayVectorElement({ varname: variable.varname }, index); //class="active-vector-element"
    if (!elem)
        return;
    if (elem && typeof variable.value === "number") {
        const classes = elem.classList.toString();
        if (changed)
            elem.innerHTML = `<index>${index}</index><value>${variable.value}</value>`;
        if (activeElem && activeElem != elem)
            activeElem.classList.remove("active-vector-element");
        if (activeElem != elem) {
            elem.classList.add("active-vector-element");
            activeElem = elem;
        }
    }
    // console.log(Number(elem.parentElement.getAttribute("activeIndex"))-index)
    // if(index===Number(elem.parentElement.getAttribute("activeIndex")))
    //elem.classList.add('active-vector-element')
    // if(activeElem) activeElem.classList.remove('active-vector-element')
    // activeElem = elem;
    // removePrevActiveElem(index, variable.varname, variable)
}
function getDisplayVectorElement(variable, index) {
    return document
        .getElementById(variable.varname)
        ?.getElementsByClassName("item-container")[0].children[index]; // offset by the ammount of default children aka the header of the container
}
function getDistanceFromPosition(checkCursor, posX, posY) {
    const elemX = checkCursor.offsetLeft;
    const elemY = checkCursor.offsetTop;
    return Math.sqrt(Math.pow(elemX - posX, 2) + Math.pow(elemY - posY, 2));
}
const commandId = "createFileCommand";
editor.commands.addCommand({
    name: commandId,
    exec: function (editor, args) {
        const filename = args?.filename || "unnamed.txt";
        createFile(filename);
        openFile(filename);
        editor.renderer.updateFull(true);
        codeLens.clear(editor.session);
    }
});
editor.commands.addCommand({
    name: "include<fstream>",
    exec: function (editor, args) {
        const index = editor.getValue().lastIndexOf("#include");
        if (index == -1)
            editor.session.insert({ row: 0, column: 0 }, "#include <fstream>\n");
        else {
            const point = editor.session.doc.indexToPosition(index);
            editor.session.insert({ row: point.row + 1, column: 0 }, "#include <fstream>\n");
        }
    }
});
editor.commands.addCommand({
    name: "usingnamespacestd",
    exec: function (editor, args) {
        const index = editor.getValue().lastIndexOf("#include");
        if (index == -1)
            editor.session.insert({ row: 0, column: 0 }, "\nusing namespace std;\n");
        else {
            const point = editor.session.doc.indexToPosition(index);
            editor.session.insert({ row: point.row + 1, column: 0 }, "\nusing namespace std;\n");
        }
    }
});
// Register CodeLens provider
codeLens.registerCodeLensProvider(editor, {
    provideCodeLenses: function (session, callback) {
        const lines = session.getDocument().getAllLines();
        const lenses = [];
        const regex = /[i o]fstream\s+\w+\s*\(\s*["'](.+?)["']\s*\);/;
        lines.forEach((line, row) => {
            const match = line.match(regex);
            if (match) {
                const filename = match[1];
                if (!editorSessions.has(filename))
                    lenses.push({
                        start: { row },
                        command: {
                            id: commandId,
                            title: `Create file "${filename}"`,
                            arguments: { filename }
                        }
                    });
                if (!editor.getValue().includes("#include <fstream>"))
                    lenses.push({
                        start: { row },
                        command: {
                            id: "include<fstream>",
                            title: `Add #include <fstream>"`,
                            arguments: {}
                        }
                    });
            }
            if (line.includes("#include <iostream>"))
                if (!editor.getValue().includes("using namespace std;"))
                    lenses.push({
                        start: { row },
                        command: {
                            id: "usingnamespacestd",
                            title: `Add using namespace std;`,
                            arguments: {}
                        }
                    });
        });
        callback(null, lenses);
    }
});
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
                .filter(c => { return c.functionName == indexToFunctionName(editor.session.doc.positionToIndex(editor.selection.getRange().start))?.name || c.functionName == undefined; })
                .map(c => ({
                caption: c.name, value: c.name, meta: `${c.type} variable : ${c.functionName ? c.functionName : "Global"}`, score: 100,
                docHTML: `${c.type} <b>${c.name}</b>`
            })));
        }
        console.log(editor.session.doc.positionToIndex(editor.selection.getRange().start));
        console.log(indexToFunctionName(editor.session.doc.positionToIndex(editor.selection.getRange().start))?.name);
        callback(null, completions);
    }
};
// Register it
ace.require("ace/ext/language_tools").addCompleter(customCompleter);
export function displaynoVNC(container) {
    const frame = document.createElement('iframe');
    frame.src = 'http://intelegeinfo.go.ro:8080/vnc_lite.html?bell=true&quality=5&path=novnc/websockify?token=' + wsSessionId;
    frame.id = 'noVDC';
    container.appendChild(frame);
}
function parseCode() {
    const code = editor.session.getValue();
    let depth = 0;
    const functions = [];
    const variables = [];
    let buffer = '';
    let tokenIndex = 0;
    const tokens = [];
    const storageType = ("asm|__asm__|auto|bool|_Bool|char|_Complex|double|enum|float|" +
        "_Imaginary|int|int8_t|int16_t|int32_t|int64_t|long|short|signed|size_t|struct|typedef|uint8_t|uint16_t|uint32_t|uint64_t|union|unsigned|void|" +
        "class|wchar_t|template|char16_t|char32_t");
    const types = storageType.split("|");
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        if (((char == " " || char == "\n" || char == "\\n") && buffer != '' && buffer.trim() != '') || i + 1 == code.length) {
            tokens.push({ body: buffer + char, name: buffer.trim(), depth, tokenIndex });
            buffer = '';
            continue;
        }
        else {
            switch (char) {
                case "{":
                    depth++;
                    break;
                case "}":
                    // if(depth-1==0)
                    tokenIndex++;
                    depth--;
                case ";":
                    continue;
                    break;
            }
            buffer += char;
        }
    }
    tokens.forEach((token, index) => {
        if (index > 0)
            if (types.includes(tokens[index - 1].name)) {
                if (token.name.includes("(") && token.name.includes(")")) {
                    if (tokens[index + 1] == undefined)
                        return;
                    let content = tokens[index + 1].body;
                    let j = index + 1;
                    if (j < tokens.length && tokens[j].depth != undefined)
                        while (tokens[j].depth > token.depth && j <= tokens.length && tokens[j + 1] != undefined)
                            content += tokens[++j].body;
                    functions.push({ name: token.name, type: tokens[index - 1].name, depth: token.depth, content, tokenIndex: token.tokenIndex });
                }
                else {
                    const functionName = functions.find(value => {
                        return value.tokenIndex == token.tokenIndex;
                    })?.name;
                    token.name.split(',').map(v => {
                        if (isNaN(parseInt(v)))
                            variables.push({ name: v, type: tokens[index - 1].name, depth: token.depth, functionName, tokenIndex: token.tokenIndex });
                    });
                }
            }
    });
    console.log(variables);
    return { functions, variables };
}
function indexToFunctionName(index) {
    const code = editor.session.getValue();
    let depth = 0;
    let tokenIndex = 0;
    for (let i = 0; i < Math.min(index, code.length); i++) {
        const char = code[i];
        switch (char) {
            case "}":
                // if(depth-1==0)
                tokenIndex++;
                break;
        }
    }
    return parsedCode.functions.find(value => {
        return value.tokenIndex == tokenIndex;
    });
}
export async function downloadEditorFiles() {
    fetch(`/editor/${wsSessionId}/downloadFiles`)
        .then(response => {
        if (!response.ok)
            throw new Error('Network error');
        return response.blob();
    })
        .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'intelegeinfo-project.zip'; // You can name the zip whatever you like
        a.click(); // Triggers the download
        URL.revokeObjectURL(url); // Cleanup
    })
        .catch(err => displayMessagePopup('Download failed:' + err));
}
