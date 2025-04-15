"use strict";
// Ensure Ace Editor is globally available or import it properly
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketMessageType = void 0;
exports.createFile = createFile;
/* IMPORTS */
// FileManagement.ts
const FileContainer = document.getElementById("editor-tabs-container");
function onFileCreate(fileName) {
    // const command = JSON.parse(messageBodyJson);
    // const fileName = command.content;
    console.log(fileName);
    const fileElem = document.createElement("span");
    fileElem.className = "file-tab";
    fileElem.innerText = fileName;
    fileElem.onclick = () => {
        openFile(fileElem.innerHTML);
    };
    FileContainer.appendChild(fileElem);
    // FileContainer.innerHTML += `<span>${fileName}</span>`
}
const AceRange = ace.require("ace/range").Range;
const aceModes = ace.require("ace/ext/modelist");
function getCompiledCode() {
    return fetch("/getCompiledCode", {
        method: "GET",
    });
}
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
class Variable {
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
var WebSocketMessageType;
(function (WebSocketMessageType) {
    WebSocketMessageType["Handshake"] = "handshake";
    WebSocketMessageType["Error"] = "error";
    WebSocketMessageType["Output"] = "output";
    WebSocketMessageType["End"] = "end";
    WebSocketMessageType["Console"] = "console";
    WebSocketMessageType["CodeChange"] = "codeChange";
    WebSocketMessageType["CodeSelection"] = "codeSelection";
    WebSocketMessageType["ColabData"] = "colabData";
    WebSocketMessageType["Heartbeat"] = "heartbeat";
    WebSocketMessageType["FileManagement"] = "FileManagement";
})(WebSocketMessageType || (exports.WebSocketMessageType = WebSocketMessageType = {}));
const variableStore = new Map();
function parseDebuggerOutput(input, { onNewVariable = (newVar) => { }, onArrayIndexChange = (name, change) => { }, } = {}) {
    var _a;
    const cleanedInput = input
        .replace(/\(gdb\)/g, "")
        .replace(/\n\s*/g, " ")
        .trim();
    const regex = /(\w+)\s*=\s*(.*?)(?=\s+\w+\s*=|$)/g;
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
            for (let i = 0; i <
                Math.max((_a = existing.value) === null || _a === void 0 ? void 0 : _a.length, value.length); i++) {
                if (Array.isArray(existing.value) &&
                    existing.value[i] !== value[i]) {
                    const change = {
                        index: i,
                        old: existing.value[i],
                        new: value[i],
                    };
                    updatedIndices.push(change);
                    onArrayIndexChange(name, change);
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
let code;
let debugLine = 1; // debug row
let lastDebugId;
let currentFileName;
const editorSessions = new Map();
var editor = ace.edit("editor", {
    mode: "ace/mode/c_cpp",
    enableLiveAutocompletion: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    placeholder: "hello",
    tooltipFollowsMouse: true,
    animatedScroll: true,
    //   fontSize: "18px",
    //maxLines: 30,
    wrap: true,
    autoScrollEditorIntoView: true,
});
// window.onload = function() {
//   //  document.querySelector('#editor textarea')?.setAttribute('inputmode', 'none')
//   const ddd = document.querySelector('.ace_text-input');
//   if(!ddd)  return;
//   writeOutput(window.getComputedStyle(ddd).fontSize)
// }
editor.setTheme("ace/theme/twilight");
editor.setHighlightActiveLine(true);
editor.resize();
let isRemoteChange = false; // used for colaborative changes
let marker; //selection marker
const renderer = editor.renderer;
// Initialize ghostManager with the correct type
const ghostManager = new (class {
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
getCompiledCode()
    .then(function (response) {
    return response.json();
})
    .then(function (data) {
    // code = data.code;
    // isRemoteChange = true; // used to force the editor to not send changes to the server
    // editor.session.setValue(code);
    // isRemoteChange = false;
});
// standardise the json
function sendWebsocketCommand(cmd, argsArr = []) {
    ws.send(JSON.stringify({ command: cmd, args: argsArr, type: WebSocketMessageType.Output }));
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
function writeOutput(data) {
    if (outputArea) {
        outputArea.textContent += data + "\n";
        outputArea.scrollTop = outputArea.scrollHeight;
    }
}
function copySessionLink() {
    const clientId = wsSessionId;
    let sessionLink;
    if (window.location.search)
        sessionLink = window.location.hostname + `?session=${clientId}`;
    else
        sessionLink = window.location.toString();
    if (navigator.clipboard) {
        navigator.clipboard.writeText(sessionLink).then(() => {
            console.log("Code copied to clipboard!");
        });
    }
    else
        window.alert(sessionLink);
}
function createFile() {
    const command = JSON.stringify({ type: WebSocketMessageType.FileManagement, command: FileManagementCommands.Create, body: "jsjsjsj.txt" });
    ws.send(command);
    //ws.send({command: FileManagementCommands.Create, args: []});
    // console.log("create file " + command)
}
function openFile(fileName) {
    const command = JSON.stringify({ type: WebSocketMessageType.FileManagement, command: FileManagementCommands.Open, body: fileName });
    ws.send(command);
}
// websocket //
const ws = new WebSocket("ws:/" + window.location.hostname + ":8080");
let consoleText = "";
let variables = [];
const variableArrayIndexes = [];
function submitConsole(elem) {
    const sendText = elem === null || elem === void 0 ? void 0 : elem.value.replace(consoleText, "");
    if (sendText == "")
        return;
    console.log(sendText);
    //sendWebsocketCommand(sendText, ["console"]); //ws.send({command: sendText, args: ['console']});
    ws.send(JSON.stringify({ command: sendText, args: ['console'], type: WebSocketMessageType.Console }));
    consoleText = (elem === null || elem === void 0 ? void 0 : elem.value) || "Error: invalid element";
    // console.log(elem.value)
}
let wsClientId;
let wsSessionId;
const outputArea = document.getElementById("output");
ws.onopen = (ev) => {
    const sessionId = new URLSearchParams(window.location.search).get("session");
    //writeOutput(sessionId || "No session ID found in URL.");
    ws.send(JSON.stringify({ error: false, input: false, type: WebSocketMessageType.Handshake, sessionId: (sessionId === null || sessionId === void 0 ? void 0 : sessionId.toString()) || null })); // Send initial message to server
    console.log("logged in");
    editor.on("change", (delta) => {
        if (isRemoteChange)
            return;
        const code = editor.getValue();
        console.log(delta);
        // console.log("changed")
        if (!currentFileName)
            console.error('Current file name is invalid');
        const saveFile = !["c", "exe"].includes(currentFileName.split(".").pop() || "");
        ws.send(JSON.stringify({ body: code, delta: delta, type: WebSocketMessageType.CodeChange, fileName: currentFileName, saveFile: true, })); // Send code to server on change // TODO Remove code from body.
    });
    editor.on("changeSelection", () => {
        if (isRemoteChange)
            return;
        const selection = editor.getSelectionRange();
        // const start = selection.start;
        // const end = selection.end;
        // const range = new AceRange(start.row, start.column, end.row, end.column);
        // const selectedText = editor.session.getTextRange(range);
        // console.log(selectedText);
        if (!currentFileName)
            console.error('Current file name is invalid');
        ws.send(JSON.stringify({ range: editor.getSelectionRange(), fileName: currentFileName, type: WebSocketMessageType.CodeSelection })); // Send code to server on change
    });
    // setInterval(() => {
    //     const code = editor.getValue();
    //     //console.log(delta);
    //     // if(blockChange) blockChange = false;
    //     // else {
    //     // blockChange = true;
    //     ws.send(JSON.stringify({ body: code, type: WebSocketMessageType.CodeChange })); // Send code to server on change
    //  //   }
    // }, 500);
};
var FileManagementCommands;
(function (FileManagementCommands) {
    FileManagementCommands["Create"] = "create";
    FileManagementCommands["Delete"] = "delete";
    FileManagementCommands["List"] = "list";
    FileManagementCommands["Rename"] = "rename";
    FileManagementCommands["Open"] = "open";
})(FileManagementCommands || (FileManagementCommands = {}));
ws.onmessage = (event) => {
    let eventJson = JSON.parse(event.data);
    let command = eventJson.message;
    let data = eventJson.body;
    const type = eventJson.type;
    //console.log(type);
    //console.log(eventJson)
    function handleOutput() {
        var _a;
        writeOutput(data);
        const session = editor.getSession();
        const doc = session.getDocument();
        const text = doc.getValue();
        function asyncExecuteCommand(command) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield fetch("/requestValue?value=" + command, {
                    cache: "no-store",
                });
            });
        }
        // handle variables
        if (command == "info locals") {
            const variablesSection = document.getElementById("variables");
            let unprocVariables;
            const textToVar = (_a = data
                .split("(gdb)")
                .pop()) === null || _a === void 0 ? void 0 : _a.replace(/\n/g, ";").match(/(?<!\w\S)(\b\w+)\s*=.*/g);
            if (command == "info locals") {
                //if we have variables in the chunk
                variables = parseDebuggerOutput(data, {
                    onNewVariable: (variable) => {
                        if (variable.type != "array")
                            return;
                        createDisplayVector(variable);
                        //console.log("created display vector")
                    },
                    onArrayIndexChange: (variableName, changes) => {
                        updateDisplayVectorElement(new Variable(variableName, changes.new, "array"), changes.index);
                        // console.log(changes.updatedIndices)
                    },
                });
            }
            // set variables
            for (let index = 0; index < variables.length; index++) {
                const element = variables[index];
                if (variables.length == 0)
                    break;
                //array type
                if (element.type == "array")
                    updateDisplayVector(element);
            }
        }
        else {
            //TODO DMDMDMDM Check if line number string contains (gdb) to prevent standard output from being parsed as line number
            if (data.match(/^(\d)+(?=\s)?/gm) != null) {
                //check if its a chunk with line number
                debugLine = parseInt(data.match(/^(\d)+(?=\s)?/gm)); // update debug row
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
                console.log(conditions);
                setTimeout(() => {
                    let i = 1;
                    for (const condition of conditions) {
                        console.log(condition);
                        asyncExecuteCommand(condition)
                            .then(function (response) {
                            return response.json();
                        })
                            .then(function (data) {
                            const exprValue = data.body.toString();
                            buffer += (exprValue.replace(exprValue.match(/\$\d*/), condition) + "; ")
                                .replace("(gdb)", "")
                                .replace("\n", "");
                            console.log(buffer);
                            if (i++ == conditions.length) {
                                renderer.setGhostText("   " + buffer, pos);
                                console.log(buffer);
                                buffer = "";
                            }
                        });
                    }
                }, 500);
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
            writeOutput(data);
            break;
        case WebSocketMessageType.Output:
            handleOutput();
            break;
        case WebSocketMessageType.End:
            writeOutput(data);
            break;
        case WebSocketMessageType.Console:
            writeOutput(data);
            break;
        case WebSocketMessageType.Handshake:
            wsClientId = eventJson.clientId;
            wsSessionId = eventJson.clientId;
            writeOutput(wsClientId);
            break;
        case WebSocketMessageType.CodeChange:
            // editor.session.getDocument().applyDelta(delta);
            if (editor.getValue() !== data.body && eventJson.clientId !== wsClientId) {
                const delta = eventJson.body.delta;
                console.log(eventJson);
                isRemoteChange = true;
                editor.session.getDocument().applyDelta(delta);
                isRemoteChange = false;
            }
            break;
        case WebSocketMessageType.CodeSelection:
            if (!data) //clear selection 
             {
                editor.session.removeMarker(marker);
                return;
            }
            const selection = eventJson.body.range;
            const start = selection.start;
            const end = selection.end;
            //if(start.end==end.end || start.row*end.row * start.column * start*end.column==0) return;
            const range = new AceRange(start.row, start.column, end.row, end.column);
            editor.session.removeMarker(marker);
            marker = editor.session.addMarker(range, "ace_remote_selection", "line", false);
            console.log("selection ", selection);
            break;
        case WebSocketMessageType.ColabData:
            const colabClients = JSON.parse(eventJson.body).clients;
            const colabSessionId = JSON.parse(eventJson.body).thisSessionId;
            const colabCLientId = JSON.parse(eventJson.body).thisClientId;
            const colabContainer = document.getElementById("colab-container") || null;
            if (!colabContainer)
                return;
            colabContainer.innerHTML = "";
            colabClients.forEach(client => {
                const clientId = client.split("-")[0];
                colabContainer.innerHTML += `<div class="colab-client" id=${clientId}>${clientId}</div>`;
            });
            break;
        case WebSocketMessageType.Heartbeat:
            ws.send(JSON.stringify({ type: WebSocketMessageType.Heartbeat })); // send heartbeat to server
            console.log("heartbeat");
            break;
        case WebSocketMessageType.FileManagement:
            //   data.command should work too but it doesnt TODO
            const commandType = JSON.parse(event.data).body.command;
            switch (commandType) {
                case FileManagementCommands.Create:
                    onFileCreate(data.content);
                    break;
                case FileManagementCommands.Delete:
                    break;
                case FileManagementCommands.List:
                    (JSON.parse(event.data).body.content).forEach((file) => {
                        onFileCreate(file);
                    });
                    break;
                case FileManagementCommands.Rename:
                    break;
                case FileManagementCommands.Open:
                    const fileName = eventJson.body.fileName;
                    const fileContent = eventJson.body.content;
                    currentFileName = fileName;
                    console.log("Opened file: ", fileName);
                    if (!editorSessions.has(fileName)) {
                        const newSession = ace.createEditSession(fileContent);
                        // undo manager? 
                        newSession.setMode(aceModes.getModeForPath(fileName).mode);
                        editor.setSession(newSession);
                        editorSessions.set(fileName, newSession);
                    }
                    else {
                        console.log("File already opened: ", fileName);
                        const session = editorSessions.get(fileName);
                        if (session)
                            editor.setSession(session);
                        if (fileContent.toString() != (session === null || session === void 0 ? void 0 : session.getValue().toString())) {
                            isRemoteChange = true;
                            session === null || session === void 0 ? void 0 : session.setValue(fileContent);
                            isRemoteChange = false;
                        }
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
function compileCode() {
    fetch("/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editor.getValue() }),
    })
        .then((res) => res.json())
        .then((data) => {
        const output = document.getElementById("output");
        if (!output)
            return;
        output.textContent = data.success
            ? "Compilation successful!\n"
            : data.error;
        code = editor.getValue();
    });
}
function sendDebugCommand(cmd) {
    //editor.setValue(code, -1);
    sendWebsocketCommand(cmd, []); //ws.send(JSON.stringify({command: cmd , args: []}));
    if (cmd == "next" || cmd == "continue")
        sendWebsocketCommand("info locals", []); // ws.send({command: 'info locals' , args: []});
    const consoleElem = document.getElementById("console");
    if (cmd == "execute" && (consoleElem === null || consoleElem === void 0 ? void 0 : consoleElem.value) != "")
        submitConsole(consoleElem);
}
function playback() {
    sendDebugCommand("run");
    onRun();
    let i = debugLine;
    const playback = setInterval(() => {
        sendDebugCommand("next");
        if (debugLine >= editor.session.getLength()) {
            clearInterval(playback);
            onExit();
        }
    }, 100);
}
function onRun() {
    editor.setReadOnly(true);
}
function onExit() {
    editor.setReadOnly(false);
    editor.session.removeMarker(lastDebugId);
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
        vectCont.innerHTML += `<span style="background-color: rgb(${element * 50 + 50},${element * 50 + 50},${element * 50 + 50})"><index>${i++}</index>${element}</span>`;
    });
}
let vectDisplays = [];
function createDisplayVector(variable) {
    var _a;
    // console.log(variable)
    if (variable.type != "array")
        return;
    // vectDisplays.add(variable)
    const vectorContainer = document.getElementById("vector-container");
    if (vectorContainer) {
        vectorContainer.innerHTML += `<div id=${variable.varname} class='vector-display'><div class='vector-header'><h>${variable.varname}</h><button onclick='resizeVectorContainer(this)'>x</button></div><div class='item-container'></div></div>\n`;
    }
    if (Array.isArray(variable.value)) {
        displayVector(variable.value, (_a = document
            .getElementById(variable.varname)) === null || _a === void 0 ? void 0 : _a.getElementsByClassName("item-container")[0]);
    }
}
function resizeVectorContainer(elem) {
    var _a, _b;
    const itemContainer = (_b = (_a = elem.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.getElementsByClassName("item-container")[0];
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
function updateDisplayVector(variable) {
    // displayVector(variable.value, document.getElementById(variable.varname))
    //    variable.values.forEach(vari => {
    //     updateDisplayVectorElement(variable, vari.index)
    //    });
}
let activeElem;
function updateDisplayVectorElement(variable, index) {
    const elem = getDisplayVectorElement({ varname: variable.varname }, index); //class="active-vector-element"
    if (!elem)
        return;
    if (elem && typeof variable.value === "number") {
        elem.outerHTML = `<span style="background-color: rgb(${variable.value * 50 + 50},${variable.value * 50 + 50},${variable.value * 50 + 50})"><index>${index}</index>${variable.value}</span>`;
    }
    // console.log(Number(elem.parentElement.getAttribute("activeIndex"))-index)
    // if(index===Number(elem.parentElement.getAttribute("activeIndex")))
    //elem.classList.add('active-vector-element')
    // if(activeElem) activeElem.classList.remove('active-vector-element')
    // activeElem = elem;
    // removePrevActiveElem(index, variable.varname, variable)
}
function getDisplayVectorElement(variable, index) {
    var _a;
    return (_a = document
        .getElementById(variable.varname)) === null || _a === void 0 ? void 0 : _a.getElementsByClassName("item-container")[0].children[index]; // offset by the ammount of default children aka the header of the container
}
