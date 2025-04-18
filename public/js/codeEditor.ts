// Ensure Ace Editor is globally available or import it properly

import Ace, { edit } from "ace-builds";
// import { Marker } from "ace-builds-internal/search_highlight";
import { text } from "body-parser";
// import * as FileManagement from "./FIleManagement";

// import { WebSocketMessageType } from "./types"; // fuck this

import { UUID } from "crypto";



/* IMPORTS */

// FileManagement.ts
const FileContainer = document.getElementById("editor-tabs-container") as HTMLDivElement;
if(!FileContainer) console.error("Couldn't find file container!")
 function onFileCreate(fileName: string) {
        // const command = JSON.parse(messageBodyJson);
        
        // const fileName = command.content;
    console.log(fileName)
        const fileElem: HTMLSpanElement = document.createElement("span");
        fileElem.className = "file-tab";
        fileElem.innerText = fileName;
        fileElem.onclick = () => {
            openFile(fileElem.innerHTML)
        } 
        FileContainer.appendChild(fileElem);
        
        // FileContainer.innerHTML += `<span>${fileName}</span>`
    }
        



/*END IMPORTS*/











//  import * as Ace from "ace-builds";
declare const ace: typeof Ace;
import modelist from "ace-builds/src-noconflict/ext-modelist";
import { JsonOptions } from "vite";
const AceRange = ace.require("ace/range").Range;
const aceModes: typeof modelist = ace.require("ace/ext/modelist");

function getCompiledCode() {
    return fetch("/getCompiledCode", {
        method: "GET",
    });
}

function parseArray(str: string) {
    // Extract the value (x) and number of repeats (y) using a regular expression
    const match = str.match(/([^<]+) <repeats (\d+) times>/);

    if (match) {
        // Get the value (x) and number of repetitions (y)
        const value = match[1].trim(); // x (strip any extra spaces)
        const times = parseInt(match[2], 10); // y (convert to integer)

        // Create the array filled with 'value' repeated 'times' times
        return new Array(times).fill(value);
    } else {
        return [];
    }
}

class Variable {
    varname: string;
    value: string | number | any[] | undefined;
    type: string | undefined;
    updatedIndices?: { index: number; old: any; new: any }[];
    indexes?: any[];

    constructor(
        name: string,
        value: string | number | any[],
        type: string | undefined,
        updatedIndices: { index: number; old: any; new: any }[] = []
    ) {
        this.varname = name;
        this.value = value;
        this.type = type;
        if (type === "array" && updatedIndices.length > 0) {
            this.updatedIndices = updatedIndices;
            this.indexes = [];
        }
    }
}
export enum WebSocketMessageType {
    Handshake = "handshake",
    Error = "error",
    Output = "output",
    End = "end",
    Console = "console",
    CodeChange = "codeChange",
    CodeSelection = "codeSelection",
    ColabData = "colabData",
    Heartbeat = "heartbeat",
    FileManagement = "FileManagement",
}

export enum ConsoleMessageType {
    UserChat = 'chat',
    Error = 'error',
    Info = 'information',
    Debug = 'debug',
    SessionInfo = "session",
    Output = 'output',
    DebugProgram  = "debugProgram"
}

const variableStore = new Map<string, Variable>();

function parseDebuggerOutput(
    input: string,
    {
        onNewVariable = (newVar: Variable) => { },
        onArrayIndexChange = (
            name: string,
            change: { index: number; old: any; new: any }
        ) => { },
    } = {}
) {
    const cleanedInput = input
        .replace(/\(gdb\)/g, "")
        .replace(/\n\s*/g, " ")
        .trim();

    const regex = /(\w+)\s*=\s*(.*?)(?=\s+\w+\s*=|$)/g;

    let match;
    while ((match = regex.exec(cleanedInput)) !== null) {
        const name = match[1];
        const rawValue = match[2].trim();

        let type: "string" | "int" | "array" = "string";
        let value: string | number | any[] = rawValue; // might be broken

        // Parse arrays
        if (rawValue.startsWith("{") && rawValue.endsWith("}")) {
            type = "array";
            const inner = rawValue.slice(1, -1).trim();
            const array: number[] = [];

            const arrayRegex = /(-?\d+)\s*<repeats\s+(\d+)\s+times>|-?\d+/g;
            let valMatch;
            while ((valMatch = arrayRegex.exec(inner)) !== null) {
                if (valMatch[2]) {
                    const val = parseInt(valMatch[1], 10);
                    const count = parseInt(valMatch[2], 10);
                    array.push(...Array(count).fill(val));
                } else {
                    array.push(parseInt(valMatch[0], 10));
                }
            }

            value = array;
        } else if (!isNaN(Number(rawValue))) {
            type = "int";
            value = Number(rawValue);
        }

        const existing = variableStore.get(name);

        if (!existing) {
            const newVar = new Variable(name, value, type);
            variableStore.set(name, newVar);
            onNewVariable(newVar);
        } else if (type === "array" && existing.type === "array") {
            const updatedIndices: any = [];

            for (
                let i = 0;
                i <
                Math.max((existing.value as any[])?.length, (value as any[]).length);
                i++
            ) {
                if (
                    Array.isArray(existing.value) &&
                    existing.value[i] !== (value as any[])[i]
                ) {
                    const change = {
                        index: i,
                        old: existing.value[i],
                        new: (value as any[])[i],
                    };
                    updatedIndices.push(change);
                    onArrayIndexChange(name, change);
                }
            }

            if (updatedIndices.length > 0) {
                const updatedVar = new Variable(name, value, type, updatedIndices);
                variableStore.set(name, updatedVar);
            }
        } else if (existing.value !== value || existing.type !== type) {
            const updatedVar = new Variable(name, value, type);
            variableStore.set(name, updatedVar);
        }
    }

    return Array.from(variableStore.values());
}

// Helper to compare arrays
function arraysEqual(a: string | any[], b: string | any[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

let code;
let debugLine = 1; // debug row
let lastDebugId: any;

let currentFileName: string;

const editorSessions: Map<string, Ace.EditSession> = new Map<string, Ace.EditSession>();
var editor: Ace.Editor = ace.edit("editor", {
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
let marker: number; //selection marker
const renderer = editor.renderer;
// Define the type or class for ghostManager
interface GhostManager {
    clear: () => void;
    add: (variableName: string, value: string) => void;
}

// Initialize ghostManager with the correct type
const ghostManager: GhostManager = new (class implements GhostManager {
    constructor(private editor: any) { }
    clear() {
        // Implementation for clearing ghost markers
    }
    add(variableName: string, value: string) {
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








        // DOCUMENT FUNCTIONS //


        const namePrompt = document.getElementById("name-prompt");
        const consoleInput = document.getElementById('console') as HTMLInputElement;
        
        function createFileNamePrompt()
        {
            if(!namePrompt) return;
            namePrompt.style.display = "initial";
            namePrompt.innerText = "";
            namePrompt.focus();
            function handleEnterKey(this:HTMLElement, e: KeyboardEvent) {
                if (e.key === "Enter") {
                    e.preventDefault();
    
                    
                    createFile(this.innerText)
                    openFile(this.innerText)          
                    this.style.display = "none";
                    this.innerText = "";
                    this.removeEventListener("keypress", handleEnterKey);
                }

            }
            const enterListener = namePrompt.addEventListener("keypress", handleEnterKey);

        }
        if(consoleInput)
            consoleInput.addEventListener("keypress", (e: KeyboardEvent) => {
                
                if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                submitConsole(consoleInput);
                
            }

               
            });

        function toggleConsoleDebugProgram(elem: HTMLElement)
        {
            elem.classList.toggle('open');
            elem.children[1].classList.toggle('open');
        }

        // END DOCUMENT FUNCTIONS //







// standardise the json
function sendWebsocketCommand(cmd: string, argsArr: string[] = []) {
    ws.send(JSON.stringify({ command: cmd, args: argsArr, type: WebSocketMessageType.Output }));
}

function addGhostMarkers(
    editor: {
        getSession: () => any;
        renderer: { $textLayer: any };
        _ghostMarkerIds: any[];
    },
    word: string | any[],
    ghostText: string | null
) {
    const session = editor.getSession();
    const tokenizer = session.getMode().getTokenizer();
    const Range = ace.require("ace/range").Range;

    // Clean previous markers
    clearGhostMarkers(editor);

    const markers: any[] = [];

    for (let row = 0; row < session.getLength(); row++) {
        const line = session.getLine(row);
        const tokens = tokenizer.getLineTokens(line, session.getMode().$id).tokens;

        let col = 0;
        tokens.forEach((token: { value: string | any[] }) => {
            if (token.value === word) {
                // Add marker just *after* the word
                const start = new AceRange(
                    row,
                    col + word.length,
                    row,
                    col + word.length
                );
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

function findTokenPositions(
    editor: { getSession: () => any },
    targetWord: any
) {
    const session = editor.getSession();
    const tokenizer = session.getMode().getTokenizer();
    const positions: { row: number; column: number }[] = [];

    for (let row = 0; row < session.getLength(); row++) {
        const line = session.getLine(row);
        const tokens = tokenizer.getLineTokens(line, session.getMode().$id).tokens;

        let column = 0;
        tokens.forEach((token: { value: string | any[] }) => {
            if (token.value === targetWord) {
                positions.push({ row, column });
            }
            column += token.value.length;
        });
    }

    return positions;
}
function clearGhostMarkers(editor: {
    getSession: () => any;
    _ghostMarkerIds: any[];
}) {
    const session = editor.getSession();
    if (editor._ghostMarkerIds) {
        editor._ghostMarkerIds.forEach((id: any) => session.removeMarker(id));
        editor._ghostMarkerIds = [];
    }
}

function writeOutput(data: string, messageJson?: any) {
    if (outputArea) {

        if(messageJson && messageJson.messageType)
        {
            const msgId = messageJson.id as number || -1;
            if(messageJson.id===-1)
                console.error(new Error("invalid message id: " + messageJson))
            const messageType = messageJson.messageType ;
            const messageClientId = messageJson.clientId ;
            switch(messageType)
            {
                

                case ConsoleMessageType.UserChat:
                    let messageGroup = outputArea;
                    const group = outputArea.querySelector(`[msg-id="${msgId-1}"]`) as HTMLElement;
                    
                    const ownMessageClass = messageClientId === wsClientId ? "chat-ownMessage" : "";
                    if((group?.getAttribute("clientId") as UUID) == messageClientId)
                    {
                        messageGroup = group;
                        messageGroup.getElementsByClassName('chat-content-container')[0].innerHTML += `<span class="chat-content"> ${data}</span>`;
                        messageGroup.setAttribute('msg-id', msgId+"")
                        // messageGroup.classList.add('console-chat-group')
                    }
                    else
                        outputArea.innerHTML += `<span class="console-chat ${ownMessageClass}" msg-id="${msgId}" clientId="${(messageClientId as string).trim()}"><span class="chat-displayName">${messageJson.clientDisplayName}</span><div class="chat-content-container"><span class="chat-content">${data}</span></div></span>`;
                break;
                case ConsoleMessageType.SessionInfo:
                    outputArea.innerHTML += `<span class="console-session-info" msg-id="${msgId}">${data}</span>`;
                break;
                case ConsoleMessageType.Info:
                    outputArea.innerHTML += `<span class="console-info" msg-id="${msgId}">${data}</span>`;
                break;
                case ConsoleMessageType.Error:
                    outputArea.innerHTML += `<span class="console-error" msg-id="${msgId}">${data}</span>`;
                break;
                case ConsoleMessageType.Debug:
                 
                outputArea.innerHTML += `<div  msg-id="${msgId}"><span class="console-debug">${data}</span></div>`;
                break;
                case ConsoleMessageType.DebugProgram:
                    const groupDebug = outputArea.querySelector(`.debug-program[msg-id="${msgId}"] .debug-program-container`) as HTMLElement;
                    if(groupDebug)
                    groupDebug.innerHTML += `<span class="console-debug">${data}</span>`;
                    else 
                    outputArea.innerHTML += `<div class="debug-program" msg-id="${msgId}"><button onclick="toggleConsoleDebugProgram(this.parentElement)">x</button><div class="debug-program-container"></div></div>`
                
                break;
                case ConsoleMessageType.Output:
                default:
                    outputArea.innerHTML += `<pre class="console-output" msg-id="${msgId}"}>${data}</pre>`;
                    break;
            }
        }
        else
        {
            outputArea.innerHTML += `<pre class="console-output" msg-id="-1">${data}</pre>`;

        }
        // outputArea.textContent += "\n";
        outputArea.scrollTop = outputArea.scrollHeight;
    }
}

function copySessionLink() {
    const clientId = wsSessionId;
    let sessionLink;
    
    if(!window.location.search.includes("?session"))
         sessionLink = window.location.hostname + `?session=${clientId}`;
    else 
        sessionLink = window.location.toString();
    if(navigator.clipboard)
    {
        navigator.clipboard.writeText(sessionLink).then(() => {
        console.log("Code copied to clipboard!");
    });
    } else
    window.alert(sessionLink)
}
export function createFile(fileName:string = "untitled.txt") {
    const command = JSON.stringify({type: WebSocketMessageType.FileManagement, command: FileManagementCommands.Create, body: fileName });
    ws.send(command);
     //ws.send({command: FileManagementCommands.Create, args: []});
   // console.log("create file " + command)
}

function openFile(fileName: string = "main.cpp")
{
    const command = JSON.stringify({type: WebSocketMessageType.FileManagement, command: FileManagementCommands.Open, body: fileName });
    ws.send(command);
    

}


let cmdId = 0;



// websocket //
const ws = new WebSocket("ws:/" + window.location.hostname + ":8080");
let consoleText = "";
let variables: any[] = [];
const variableArrayIndexes: number[] = [];


function submitConsole(elem: HTMLInputElement | null) {
//     const sendText = elem?.value.replace(consoleText, "")
//     if(sendText == "") return;
//     console.log(sendText);
//    //sendWebsocketCommand(sendText, ["console"]); //ws.send({command: sendText, args: ['console']});
//    ws.send(JSON.stringify({ command: sendText, args: ['console'], type: WebSocketMessageType.Console }));
//    consoleText = elem?.value || "Error: invalid element";
//    consoleInput.value = "";
    const sendText = elem?.value;
    if(!sendText) return;
    ws.send(JSON.stringify({ command: sendText, args: ['console'], type: WebSocketMessageType.Console }));
    consoleInput.value = "";

}


let wsClientId: UUID;
let wsSessionId: UUID;
const outputArea = document.getElementById("output");



type CursorPosition = { row: number; column: number };

// Class to render one visual cursor
class VisualCursor implements Ace.Ace.MarkerLike {
  constructor(public cursorId: string,private getPosition: () => CursorPosition) {}
  type: string = "line";
  clazz: string = "ace_remote_cursor";
  markerRef: Ace.Ace.MarkerLike | undefined = undefined;
  update(
    html: string[],
    markerLayer: any,
    session: Ace.Ace.EditSession,
    config: any,
  ): void {
    const pos = this.getPosition();
    const screenPos = session.documentToScreenPosition(pos.row, pos.column);
    const top = markerLayer.$getTop(screenPos.row, config);
    const left = markerLayer.$padding + screenPos.column * config.characterWidth;

   
    markerLayer.elt("ace_remote_cursor",
        `height: ${config.lineHeight}px; top: ${top}px; left: ${left}px;`)
         // FOR FUTURE REFERENCE, HTML DOESNT WORK ANYMORE, USE ELT

  }
}

// Manager class for multiple visual cursors
class MultiCursorManager {
  private cursorsPos: Map<string, CursorPosition> = new Map();
  private cursors: Map<string, VisualCursor> = new Map();
  constructor(private editor: Ace.Ace.Editor) {}

  addCursor(cursorId: string, position: CursorPosition): VisualCursor {
    this.cursorsPos.set(cursorId, position);
    
    const marker = new VisualCursor(cursorId, () => this.cursorsPos.get(cursorId)!);
    
    const markerDyn =this.editor.session.addDynamicMarker(marker, true);
    marker.markerRef = markerDyn;
    this.cursors.set(cursorId, marker);
    return marker;
  }

  updateCursor(cursorId: string, position: CursorPosition) {
    if (this.cursorsPos.has(cursorId)) {
      this.cursorsPos.set(cursorId, position);
      this.editor.renderer.updateFull(); // Triggers redraw
    }
  }

  removeCursor(cursorId: string) {

    this.editor.session.removeMarker((this.cursors.get(cursorId)?.markerRef as Ace.Ace.MarkerLike).id || 0)
    const success = this.cursors.delete(cursorId);
    this.cursors.delete(cursorId)
    this.editor.renderer.updateFrontMarkers();
    return success;
  }
   replicateCursor(cursorId: string,  position: CursorPosition) {
    if(this.cursors.has(cursorId))
        {
            this.updateCursor(cursorId, position)
            return this.cursorsPos.get(cursorId);
        }
    else 
       return this.addCursor(cursorId,  position)
  }
}

// Initialize the manager
const cursorManager = new MultiCursorManager(editor);

ws.onopen = (ev) => {
    const sessionId = new URLSearchParams(window.location.search).get("session");
    //writeOutput(sessionId || "No session ID found in URL.");
    ws.send(JSON.stringify({error: false, input: false, type: WebSocketMessageType.Handshake, sessionId: sessionId?.toString() || null})); // Send initial message to server
    console.log("logged in")
    
    
    editor.on("change",  (delta: any) => {
        if (isRemoteChange) return
        
        const code = editor.getValue();
        console.log(delta);
        
            // console.log("changed")
            if(!currentFileName) console.error('Current file name is invalid')
            const saveFile: boolean = !["c","exe"].includes(currentFileName.split(".").pop()||"");
             ws.send(JSON.stringify({ body: code,  delta: delta, type: WebSocketMessageType.CodeChange, fileName: currentFileName, saveFile: true, })); // Send code to server on change // TODO Remove code from body.
             
    })
    editor.on("changeSelection", () => {
        if (isRemoteChange) return
        const selection = editor.getSelectionRange();
        // const start = selection.start;
        // const end = selection.end;
        // const range = new AceRange(start.row, start.column, end.row, end.column);
        // const selectedText = editor.session.getTextRange(range);
        // console.log(selectedText);
        if(!currentFileName) console.error('Current file name is invalid')
        ws.send(JSON.stringify({ range: editor.getSelectionRange(),  fileName: currentFileName, type: WebSocketMessageType.CodeSelection })); // Send code to server on change
    });  
    
       

    // Add the dynamic marker
    

    // setInterval(() => {
    //     const code = editor.getValue();
    //     //console.log(delta);
    //     // if(blockChange) blockChange = false;
    //     // else {
    //     // blockChange = true;
    //     ws.send(JSON.stringify({ body: code, type: WebSocketMessageType.CodeChange })); // Send code to server on change
    //  //   }
    // }, 500);
}

enum FileManagementCommands {
    Create = "create",
    Delete = "delete",
    List = "list",
    Rename = "rename",
    Open = "open",
}

type errorObject = {
    row: Number,
    column: Number,
    error: String,
}

let ping = -1;

ws.onmessage = (event) => {
    
    let eventJson = JSON.parse(event.data);
    let command = eventJson.message;
    let data = eventJson.body;
    const type: string = eventJson.type;
    //console.log(type);
    //console.log(eventJson)

    function handleOutput(eventJson: any) {
        writeOutput(data, eventJson);

        const session = editor.getSession();
        const doc = session.getDocument();

        const text = doc.getValue();

        async function asyncExecuteCommand(command: string, cmdId: number) {
            return await fetch("/requestValue?value=" + command + "&cmdId="+cmdId, {
                cache: "no-store",
            });
        }



        // handle variables
        if (command == "info locals") {
            const variablesSection = document.getElementById("variables");
            let unprocVariables;
            const textToVar = data
                .split("(gdb)")
                .pop()
                ?.replace(/\n/g, ";")
                .match(/(?<!\w\S)(\b\w+)\s*=.*/g);
            if (command == "info locals") {
                //if we have variables in the chunk
                variables = parseDebuggerOutput(data, {
                    onNewVariable: (variable) => {
                        if (variable.type != "array") return;
                        createDisplayVector(variable);
                        //console.log("created display vector")
                    },

                    onArrayIndexChange: (
                        variableName: any,
                        changes: { new: any; index: any }
                    ) => {
                        updateDisplayVectorElement(
                            new Variable(variableName, changes.new, "array"),
                            changes.index
                        );
                        // console.log(changes.updatedIndices)
                    },
                });
            }

            // set variables

            for (let index = 0; index < variables.length; index++) {
                const element = variables[index];
                if (variables.length == 0) break;

                //array type
                if (element.type == "array") updateDisplayVector(element);
            }
        } else {
            //TODO DMDMDMDM Check if line number string contains (gdb) to prevent standard output from being parsed as line number
            if (data.match(/^(\d)+(?=\s)?/gm) != null) {
                //check if its a chunk with line number
                debugLine = parseInt(data.match(/^(\d)+(?=\s)?/gm)); // update debug row
                setDebugLineStyle(debugLine);

                const conditionRegex = /(?:if|while)\s*\(([^(){};]+?)\)/g;
                const forRegex = /for\s*\(([^;]*);([^;]*);[^)]*\)/g;

                let conditions: string[] = [];
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
                if(playbackSpeed < 4) // dont bother if speed is too high.
                    for (const condition of conditions) {
                        asyncExecuteCommand(condition, cmdId++)
                            .then(function (response) {
                                return response.json();
                            })
                            .then(function (data) {
                                const exprValue = data.body.toString();
                                if((parseInt((exprValue as string).match(/(?<=\$)\d*/)?.[0] as string) === cmdId) && !Number.isNaN((parseInt((exprValue as string).match(/(?<=\$)\d*/)?.[0] as string))))
                                {
                                    buffer += (
                                        exprValue.replace(exprValue.match(/\$\d*/), condition) + "; "
                                    )
                                        .replace("(gdb)", "")
                                        .replace("\n", "");
                                    console.log(buffer);
                                    if (i++ == conditions.length) { // wait to buffer all values
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

                const regex =
                    /(\b(?<=^(\d)+(?=\s)?\s*)(\w*)(\[(\w|\d)\]))|(?<=[(-/])(\w*)(\[(\w|\d)\])/g;
                if (data.match(regex) != null)
                    data.match(regex).forEach((variable: { indexes: any[] }) => {
                        const vararr = regex.exec(data);
                        if (!vararr) return;
                        let varName = vararr[3];
                        if (!varName) varName = vararr[6];
                        let varIndex = vararr[5];
                        if (!varIndex) varIndex = vararr[8];
                        console.log(variables);
                        const indexCode = varIndex.charCodeAt(0);
                        if (variables.find((vari) => vari.varname === varIndex)) {
                            const index = variables.find(
                                (vari) => vari.varname === varIndex
                            ).value;
                            if(variable.indexes.length > indexCode) return;
                                variable.indexes[indexCode] = index;
                            //console.log(index)
                            //document.getElementById(varName).children[index].classList.add("active-vector-element");
                            removePrevActiveElem(index, varName, varIndex); // TODO remove +1
                            const vectorElem = document.getElementById(
                                varName
                            ) as HTMLSpanElement;
                            (vectorElem.children[index] as HTMLElement).style.outlineColor =
                                "#" +
                                Math.floor(
                                    (16777215 % (varIndex.charCodeAt(0) / 100)) * 16777215
                                ).toString(16);
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
            writeOutput(data,eventJson);
            break;
        case WebSocketMessageType.Output:
            handleOutput(eventJson);
            break;
        case WebSocketMessageType.End:
            writeOutput(data,eventJson);
            break;


        case WebSocketMessageType.Console:
            writeOutput(data, eventJson);

            break;




        case WebSocketMessageType.Handshake:
            wsClientId = eventJson.clientId;
            wsSessionId = eventJson.sessionId;
            writeOutput(wsClientId);
            break;
        case WebSocketMessageType.CodeChange:
             
            // editor.session.getDocument().applyDelta(delta);
            if (editor.getValue() !== data.body && eventJson.clientId !== wsClientId) {
                const delta = eventJson.body.delta;
                console.log(eventJson)
                isRemoteChange = true;
                editor.session.getDocument().applyDelta(delta);
                isRemoteChange = false;
            } 
            break;
        case  WebSocketMessageType.CodeSelection:
            if(!data) //clear selection 
            {
                console.log("removed sleection")
                editor.session.removeMarker(marker);
                cursorManager.removeCursor(eventJson.clientId);
                return;
            }
            
            const selection = eventJson.body.range;
            const start = selection.start;
            const end = selection.end;
            
            //if(start.end==end.end || start.row*end.row * start.column * start*end.column==0) return;
            const range = new AceRange(start.row, start.column, end.row, end.column);
            if(marker) editor.session.removeMarker(marker);
            if(start && end)
            {
                if(start!==end)
                 marker = editor.session.addMarker(range, "ace_remote_selection", "line", false);
            
                cursorManager.replicateCursor(eventJson.clientId,{row: end.row, column: end.column})
             
            }



            console.log("selection ", selection);
            break;
        case WebSocketMessageType.ColabData:
            const colabClients: UUID[] = eventJson.clients;
            const colabSessionId = eventJson.thisSessionId;
            const colabClientId = eventJson.thisClientId;
            const colabCommand = eventJson.colabCommand;
            console.log("collab command= " + colabCommand)
            if(colabCommand == "DISCONECT" && colabCommand)
            {
                const success = cursorManager.removeCursor(colabClientId)
                writeOutput(eventJson.body, eventJson)
            }
            const colabContainer = document.getElementById("colab-container") || null;
            if (!colabContainer) return;
            colabContainer.innerHTML = "";
            colabClients.forEach(client => {
                const clientId = client.split("-")[0];
                colabContainer.innerHTML += `<div class="colab-client" id=${clientId}>${clientId}</div>`
            });
            break;
        case WebSocketMessageType.Heartbeat:
            
            ping = Date.now() - ping - eventJson.expectedDelay;
            
            ws.send(JSON.stringify({type: WebSocketMessageType.Heartbeat})); // send heartbeat to server
            if(ping != -1)
                console.log("heartbeat ping: " + ping)
            ping = Date.now()
        break;
        case WebSocketMessageType.FileManagement:
            //   data.command should work too but it doesnt TODO
            const commandType = JSON.parse(event.data).body.command
           
            switch (commandType) {
                case FileManagementCommands.Create:
                    onFileCreate(data.content);
                break;
                case FileManagementCommands.Delete:

                break;
                case FileManagementCommands.List:
                   (JSON.parse(event.data).body.content).forEach((file: string) => {
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

                    if(!editorSessions.has(fileName))
                    {
                        const newSession = ace.createEditSession(fileContent);
                    // undo manager? 
                    newSession.setMode(aceModes.getModeForPath(fileName).mode)

                    editor.setSession(newSession); 
                    editorSessions.set(fileName, newSession);
                    
                    } else
                    {
                        console.log("File already opened: ", fileName);
                        const session = editorSessions.get(fileName);
                        if(session) editor.setSession(session);
                        if(fileContent.toString() != session?.getValue().toString()) {
                            isRemoteChange = true;
                            session?.setValue(fileContent);
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

function removePrevActiveElem(index: any, varName: string, varIndex: string) {
    if (variableArrayIndexes[varIndex.charCodeAt(0)]) {
        const vectorElem = document.getElementById(varName);
        if (vectorElem) {
            const prevElem = vectorElem.children[
                variableArrayIndexes[varIndex.charCodeAt(0)]
            ] as HTMLSpanElement;
            prevElem.classList.remove("active-vector-element");
            prevElem.style.outlineColor = "initial";

            prevElem.classList.remove("active-vector-element");
            prevElem.style.outlineColor = "initial";
        }
    }
    variableArrayIndexes[varIndex.charCodeAt(0)] = index;
}
const markers: number[] = [];
function compileCode() {
    fetch("/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editor.getValue(), clientId: wsClientId, sessionId: wsSessionId}),
    })
        .then((res) => res.json())
        .then((data) => {
            
            const output = document.getElementById("output") as HTMLInputElement;
            if (!output) return;
             let errorOutputString = '';
             const errorAnnotations: Ace.Ace.Annotation[] = [];
            
            if(!data.success)
            {
                // ON ERROR
               
               for(const errorMessage of data.error)
               {
                 errorOutputString += errorMessage.error + "\n"; 
                 
                 if(errorMessage.row != -1)
                 {
                    const row = errorMessage.row-1
                    const column = errorMessage.column;
                    errorAnnotations.push({row: row, column: column, text: errorMessage.error, type: "error"})
                    // editor.session.addMarker(new AceRange(row, column, row, column), "ace-error-line", "fullLine")
                   markers.push(editor.session.addMarker(new AceRange(row, column, row, column+1), "ace-error-line", "screenLine"));
                 }
                    
               }

               editor.session.setAnnotations(errorAnnotations)

            } else
            {
                editor.session.setAnnotations([]);
            for(const markerId of markers)
                editor.session.removeMarker(markerId);
            }
            
            writeOutput(data.success
                ? "Compilation of " + data.fileName + " successful!\n"
                : errorOutputString || "Compilation error. (couldnt retrieve error message, sorry)")
            
            code = editor.getValue();
        });
}



function sendDebugCommand(cmd: string) {
    //editor.setValue(code, -1);
    sendWebsocketCommand(cmd, []); //ws.send(JSON.stringify({command: cmd , args: []}));
    if (cmd == "next" || cmd == "continue")
        sendWebsocketCommand("info locals", []); // ws.send({command: 'info locals' , args: []});
    const consoleElem = document.getElementById("console") as HTMLInputElement;
    if (cmd == "execute" && consoleElem?.value != "") submitConsole(consoleElem);
}
let playbackSpeed = 1;
let playbackId: NodeJS.Timeout;
export function playback() {
    sendDebugCommand('break main')
    sendDebugCommand("run");
    onRun();
    let i = debugLine;
    setPlaybackSpeed(1)
}
function setPlaybackSpeed(newPlaybackSpeed: number)
{
    document.getElementById('speed-control')?.children[playbackSpeed-1].classList.remove('active-speed')
    playbackSpeed = newPlaybackSpeed;
    updatePlaybackSpeed()
}
function updatePlaybackSpeed()
{
    document.getElementById('speed-control')?.children[playbackSpeed-1].classList.add('active-speed')
    if(playbackId) clearInterval(playbackId);
    playbackId = setInterval(() => {
        if(!ws.OPEN) return clearInterval(playbackId);
        sendDebugCommand("next");
        if (debugLine >= editor.session.getLength() + 2) { // add offset to complete exectuin and display result.
            clearInterval(playbackId);
            onExit();
        }
    }, 300 / playbackSpeed);
}

function onRun() {
    editor.setReadOnly(true);
}

function onExit() {
    editor.setReadOnly(false);
    editor.session.removeMarker(lastDebugId);
}

function setDebugLineStyle(lineIndex: number) {
    // document.querySelectorAll(".ace_debug").forEach(element => {
    //     element.classList.remove("ace_debug");
    // });

    //editor.session.setBreakpoint(lineIndex-1)
    editor.session.removeMarker(lastDebugId);
    lastDebugId = editor.session.highlightLines(
        lineIndex - 1,
        lineIndex - 1,
        ""
    ).id;
    //document.querySelectorAll(".ace_text-layer > .ace_line")[lineIndex-1].classList.add("ace_debug");
}

function displayVector(array: any[], vectCont: HTMLDivElement | null) {
    // TODO make vect cont an array based of vector name (aka index of ascii number)
    //  vectCont.innerHTML ="";c
    let i = 0;
    // console.log(array);
    if (!vectCont) return;
    array.forEach((element: any) => {
        vectCont.innerHTML += `<span style="background-color: rgb(${element * 50 + 50
            },${element * 50 + 50},${element * 50 + 50
            })"><index>${i++}</index>${element}</span>`;
    });
}
let vectDisplays = [];
function createDisplayVector(variable: Variable) {
    // console.log(variable)
    if (variable.type != "array") return;
    // vectDisplays.add(variable)

    const vectorContainer = document.getElementById("vector-container");
    if (vectorContainer) {
        vectorContainer.innerHTML += `<div id=${variable.varname} class='vector-display'><div class='vector-header'><h>${variable.varname}</h><button onclick='resizeVectorContainer(this)'>x</button></div><div class='item-container'></div></div>\n`;
    }
    if (Array.isArray(variable.value)) {
        displayVector(
            variable.value,
            document
                .getElementById(variable.varname)
                ?.getElementsByClassName("item-container")[0] as HTMLDivElement | null
        );
    }
}

function resizeVectorContainer(elem: HTMLDivElement) {
    const itemContainer =
        elem.parentElement?.parentElement?.getElementsByClassName(
            "item-container"
        )[0] as HTMLDivElement | null;
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
function updateDisplayVector(variable: any) {
    // displayVector(variable.value, document.getElementById(variable.varname))
    //    variable.values.forEach(vari => {
    //     updateDisplayVectorElement(variable, vari.index)
    //    });
}

let activeElem;

function updateDisplayVectorElement(variable: Variable, index: any) {
    const elem = getDisplayVectorElement({ varname: variable.varname }, index); //class="active-vector-element"
    if (!elem) return;
    if (elem && typeof variable.value === "number") {
        elem.outerHTML = `<span style="background-color: rgb(${variable.value * 50 + 50
            },${variable.value * 50 + 50},${variable.value * 50 + 50
            })"><index>${index}</index>${variable.value}</span>`;
    }
    // console.log(Number(elem.parentElement.getAttribute("activeIndex"))-index)
    // if(index===Number(elem.parentElement.getAttribute("activeIndex")))
    //elem.classList.add('active-vector-element')
    // if(activeElem) activeElem.classList.remove('active-vector-element')
    // activeElem = elem;
    // removePrevActiveElem(index, variable.varname, variable)
}

function getDisplayVectorElement(variable: { varname: string }, index: number) {
    return document
        .getElementById(variable.varname)
        ?.getElementsByClassName("item-container")[0].children[index]; // offset by the ammount of default children aka the header of the container
}
