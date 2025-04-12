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
const AceRange = ace.require("ace/range").Range;
function getCompiledCode() {
    return fetch("http://localhost:3000/getCompiledCode", {
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
        if (type === 'array' && updatedIndices.length > 0) {
            this.updatedIndices = updatedIndices;
            this.indexes = [];
        }
    }
}
const variableStore = new Map();
function parseDebuggerOutput(input, { onNewVariable = (newVar) => { }, onArrayIndexChange = (name, change) => { }, } = {}) {
    var _a;
    const cleanedInput = input
        .replace(/\(gdb\)/g, '')
        .replace(/\n\s*/g, ' ')
        .trim();
    const regex = /(\w+)\s*=\s*(.*?)(?=\s+\w+\s*=|$)/g;
    let match;
    while ((match = regex.exec(cleanedInput)) !== null) {
        const name = match[1];
        const rawValue = match[2].trim();
        let type = 'string';
        let value = rawValue; // might be broken
        // Parse arrays
        if (rawValue.startsWith('{') && rawValue.endsWith('}')) {
            type = 'array';
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
            type = 'int';
            value = Number(rawValue);
        }
        const existing = variableStore.get(name);
        if (!existing) {
            const newVar = new Variable(name, value, type);
            variableStore.set(name, newVar);
            onNewVariable(newVar);
        }
        else if (type === 'array' && existing.type === 'array') {
            const updatedIndices = [];
            for (let i = 0; i < Math.max((_a = existing.value) === null || _a === void 0 ? void 0 : _a.length, value.length); i++) {
                if (Array.isArray(existing.value) && existing.value[i] !== value[i]) {
                    const change = { index: i, old: existing.value[i], new: value[i] };
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
var editor = ace.edit("editor", {
    mode: "ace/mode/c_cpp",
    enableLiveAutocompletion: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    placeholder: "hello",
    tooltipFollowsMouse: true,
    animatedScroll: true,
    //   fontSize: "18px",
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
}).then(function (data) {
    code = data.code;
    editor.session.setValue(code);
});
// standardise the json
function sendWebsocketCommand(cmd, argsArr = []) {
    ws.send(JSON.stringify({ command: cmd, args: argsArr }));
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
//websocket
const ws = new WebSocket("ws://localhost:8080");
let consoleText = "";
let variables = [];
const variableArrayIndexes = [];
function submitConsole(elem) {
    const sendText = (elem === null || elem === void 0 ? void 0 : elem.value.replace(consoleText, "")) || "Error: invalid element";
    console.log(sendText);
    sendWebsocketCommand(sendText, ["console"]); //ws.send({command: sendText, args: ['console']});
    consoleText = (elem === null || elem === void 0 ? void 0 : elem.value) || "Error: invalid element";
    // console.log(elem.value)
}
const outputArea = document.getElementById("output");
ws.onmessage = (event) => {
    var _a;
    let eventJson = JSON.parse(event.data);
    let command = eventJson.message;
    let data = eventJson.body;
    writeOutput(data);
    const session = editor.getSession();
    const doc = session.getDocument();
    const text = doc.getValue();
    function asyncExecuteCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetch("/requestValue?value=" + command, { cache: "no-store" });
        });
    }
    // handle variables
    if (command == "info locals") {
        const variablesSection = document.getElementById("variables");
        let unprocVariables;
        const textToVar = (_a = data.split('(gdb)').pop()) === null || _a === void 0 ? void 0 : _a.replace(/\n/g, ';').match(/(?<!\w\S)(\b\w+)\s*=.*/g);
        if (command == "info locals") //if we have variables in the chunk
         {
            variables = parseDebuggerOutput(data, { onNewVariable: (variable) => {
                    if (variable.type != "array")
                        return;
                    createDisplayVector(variable);
                    //console.log("created display vector")
                },
                onArrayIndexChange: (variableName, changes) => {
                    updateDisplayVectorElement(new Variable(variableName, changes.new, "array"), changes.index);
                    // console.log(changes.updatedIndices)
                } });
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
        if (data.match(/^(\d)+(?=\s)?/gm) != null) //check if its a chunk with line number
         {
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
                    asyncExecuteCommand(condition).then(function (response) {
                        return response.json();
                    }).then(function (data) {
                        const exprValue = data.body.toString();
                        buffer += (exprValue.replace(exprValue.match(/\$\d*/), condition) + "; ").replace("(gdb)", "").replace("\n", "");
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
                        vectorElem.children[index].style.outlineColor = "#" + Math.floor(16777215 % (varIndex.charCodeAt(0) / 100) * 16777215).toString(16);
                        //document.getElementById(varName).setAttribute("activeIndex", index);
                        //getDisplayVectorElement(makeVariableRefByName(varName), index).parentElement.setAttribute("activeIndex", index);
                    }
                });
        }
    }
    if (data[0] == data.match(/^(\d)(?=\s)?/gm)) {
        setDebugLineStyle(debugLine);
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
    fetch("http://localhost:3000/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editor.getValue() })
    })
        .then(res => res.json())
        .then(data => {
        const output = document.getElementById("output");
        if (!output)
            return;
        output.textContent = data.success ? "Compilation successful!\n" : data.error;
        code = editor.getValue();
    });
}
function sendDebugCommand(cmd) {
    //editor.setValue(code, -1);
    sendWebsocketCommand(cmd, []); //ws.send(JSON.stringify({command: cmd , args: []}));
    if (cmd == "next" || cmd == "continue")
        sendWebsocketCommand('info locals', []); // ws.send({command: 'info locals' , args: []});
    const consoleElem = document.getElementById('console');
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
        vectCont.innerHTML += `<span style="background-color: rgb(${(element) * 50 + 50},${(element) * 50 + 50},${(element) * 50 + 50})"><index>${i++}</index>${element}</span>`;
    });
}
let vectDisplays = [];
function createDisplayVector(variable) {
    var _a;
    // console.log(variable)
    if (variable.type != "array")
        return;
    // vectDisplays.add(variable)
    const vectorContainer = document.getElementById('vector-container');
    if (vectorContainer) {
        vectorContainer.innerHTML += `<div id=${variable.varname} class='vector-display'><div class='vector-header'><h>${variable.varname}</h><button onclick='resizeVectorContainer(this)'>x</button></div><div class='item-container'></div></div>\n`;
    }
    if (Array.isArray(variable.value)) {
        displayVector(variable.value, (_a = document.getElementById(variable.varname)) === null || _a === void 0 ? void 0 : _a.getElementsByClassName('item-container')[0]);
    }
}
function resizeVectorContainer(elem) {
    var _a, _b;
    const itemContainer = (_b = (_a = elem.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.getElementsByClassName('item-container')[0];
    if (itemContainer) {
        itemContainer.style.height = itemContainer.style.height === '0px' ? 'auto' : '0px';
        itemContainer.style.minHeight = itemContainer.style.minHeight === '0px' ? '100px' : '0px';
        itemContainer.style.overflow = itemContainer.style.overflow === 'hidden' ? 'visible' : 'hidden';
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
    if (elem && typeof variable.value === 'number') {
        elem.outerHTML = `<span style="background-color: rgb(${(variable.value) * 50 + 50},${(variable.value) * 50 + 50},${(variable.value) * 50 + 50})"><index>${index}</index>${variable.value}</span>`;
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
    return (_a = document.getElementById(variable.varname)) === null || _a === void 0 ? void 0 : _a.getElementsByClassName('item-container')[0].children[index]; // offset by the ammount of default children aka the header of the container
}
