// Ensure Ace Editor is globally available or import it properly

import Ace, { edit } from "ace-builds";
// import { Marker } from "ace-builds-internal/search_highlight";
import { text } from "body-parser";
// import * as FileManagement from "./FIleManagement";

// import { WebSocketMessageType } from "./types"; // fuck this
import { WSMessage } from '../../shared/src/types'
import { UUID } from "crypto";
// import QRCode from 'qrcode'
// import { WebSocketMessageType } from "../../dist/shared/types";
// const WebSocketMessageType = require("../../dist/shared/types")


/*END IMPORTS*/

//  import * as Ace from "ace-builds";
declare const ace: typeof Ace;
import modelist from "ace-builds/src-noconflict/ext-modelist";
// import { Callback } from "ioredis";
// import { EditorSession } from "../../server/types";
import { Project } from "../../generated/prisma";
import path from "path";
const AceRange = ace.require("ace/range").Range;
const aceModes: typeof modelist = ace.require("ace/ext/modelist");
var codeLens = ace.require("ace/ext/code_lens");
//  const msgMap: Map<Number, WSMessage> = new Map();
let activeElem: Element;
const typingIndicators: Map<UUID,HTMLDivElement> = new Map();
let debounceTimer: NodeJS.Timeout;
let typingIndicatorDelay = 1000;

// function getCompiledCode() {
//   return fetch("/getCompiledCode", {
//     method: "GET",
//   });
// }

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
  Chat = "chat",
  ConsoleTyping = 'consolekeepalive',
  CodeChange = "codeChange",
  CodeSelection = "codeSelection",
  ColabData = "colabData",
  Heartbeat = "heartbeat",
  FileManagement = "FileManagement",
  CompileResult = "CompileResult",
  ExecuteStatus =  "executestatus",
}

export enum ConsoleMessageType {
  UserChat = "chat",
  Error = "error",
  Info = "information",
  Debug = "debug",
  SessionInfo = "session",
  Output = "output",
  DebugProgram = "debugProgram",
}

const variableStore = new Map<string, Variable>();

function parseDebuggerOutput(
  input: string,
  {
    onNewVariable = (newVar: Variable) => {},
    onArrayIndexChange = (
      name: string,
      change: { index: number; old: any; new: any },
      changed: boolean
    ) => {},
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
        let i = 0;i <Math.max((existing.value as any[])?.length, (value as any[]).length);i++
      ) {
        if (
          Array.isArray(existing.value)
        //    &&
        //   existing.value[i] !== (value as any[])[i]
        ) {
          const change = {
            index: i,
            old: existing.value[i],
            new: (value as any[])[i],
          };
          const changed = existing.value[i] !== (value as any[])[i];
          updatedIndices.push(change);
          onArrayIndexChange(name, change, changed);
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
let lastViewedMessage: number;
let currentFileName: string;

// ace.config.setModuleUrl('ace/mode/c_cpp_worker', 'cpp_worker.js');
// ace.config.setModuleUrl('ace/mode/c_cpp_custom', 'mode_cpp_custom.js');

const editorSessions: Map<string, FileEditorSession> = new Map<
  string,
  FileEditorSession
>();
var editor: Ace.Editor = ace.edit("editor", {
  mode: "ace/mode/c_cpp",
  enableLiveAutocompletion: true,
  enableBasicAutocompletion: true,
  enableSnippets: true,
  placeholder: "incepe sa scrii niste cod...",
  tooltipFollowsMouse: true,
  animatedScroll: true,
  useWorker:true,
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

editor.setTheme("ace/theme/editor-theme");
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
  constructor(private editor: any) {}
  clear() {
    // Implementation for clearing ghost markers
  }
  add(variableName: string, value: string) {
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

const byteSize = (str: string) => new Blob([str]).size;


export function displayMessagePopup(message)
{
  function createPopup(classList: string, innerHTML): typeof popup | undefined
  {
    if(!innerHTML) return;
    const popup = document.createElement('div')
    popup.classList.add("client-popup")
    if(classList.split[' '])
      for(const classname of classList.split[' '])
        popup.classList.add(classname);

    popup.innerHTML = `<button class="client-popup-close">x</button><div>${innerHTML}</div>`;
    document.body.appendChild(popup)

    setTimeout(() => {
      popup.remove();
    }, 1000*5);
  }

  createPopup('', `
    <p>${message}</p>
    
    `)
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
const consoleInput = document.getElementById("console") as HTMLTextAreaElement;

if(new URLSearchParams(window.location.search).has('save'))
  document.getElementById('saveProject')?.classList.add('saved')


// export function onMarkerUpdate(marker:any, elem: HTMLDivElement)
// {
 
// }



editor.on('changeSession', (e) => 
{

  //TODO Check if i can imrove the changedCss check, so it
  // doesnt create new listener for each update.
  let errorDisplay: HTMLDivElement | undefined;
  let errorDisplayTimeout: NodeJS.Timeout;
 editor.session.on('markerUpdate', (marker) => {
    if(!marker.changedCss) return;


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
        document.body.appendChild(errorDisplay)
      }, 200);
      

    })
     marker.elem.addEventListener('mouseleave', ev => {
      if(errorDisplayTimeout)
        clearTimeout(errorDisplayTimeout)
      if(!errorDisplay) return;

      errorDisplay.remove()
      errorDisplay = undefined;
    })
  })

})




/* IMPORTS */
// FileManagement.ts
const FileContainer = document.getElementById(
  "editor-tabs-container"
) as HTMLDivElement;
if (!FileContainer) console.error("Couldn't find file container!");
function onFileCreate(fileName: string) {
  // const command = JSON.parse(messageBodyJson);

  // const fileName = command.content;

  const fileElem: HTMLSpanElement = document.createElement("span");
  fileElem.className = "file-tab";
  fileElem.innerText = fileName;
  fileElem.onclick = () => {
    openFile(fileElem.innerHTML);
  };
  FileContainer.appendChild(fileElem);
  
  if(editorSessions.has(fileName))
  {
    const session = editorSessions.get(fileName)!;
    if(!session.fileElement)
     {
        const newSession: FileEditorSession =
        {
          editor: session.editor,
          fileName: session.fileName,
          fileElement: fileElem
        }
        editorSessions.set(fileName,newSession);
     }
  }
  else
  {
    const newSession: FileEditorSession =
    {
      editor: undefined,
      fileName: fileName,
      fileElement: fileElem
    }


    editorSessions.set(fileName, newSession);
  }
     
          

  




  // FileContainer.innerHTML += `<span>${fileName}</span>`
}



export function createFileNamePrompt() {
  if (!namePrompt) return;
  namePrompt.style.display = "initial";
  namePrompt.innerText = "";
  namePrompt.focus();
  function handleEnterKey(this: HTMLElement, e: KeyboardEvent) {
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


if (consoleInput)
  consoleInput.addEventListener("keypress", (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      submitConsole(consoleInput, WebSocketMessageType.Chat);
    }
  });



export function toggleConsoleDebugProgram(elem: HTMLElement) {
  elem.classList.toggle("open");
  elem.children[1].classList.toggle("open");
}



export function onConsoleInput(elem: HTMLTextAreaElement, ev?: Event)
{
  const console = elem as HTMLTextAreaElement;
  if(console.value!='') 
    {
        if(!console.classList.contains('filled'))console.classList.add('filled');

        
        ws.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping, status: "start"}))

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      ws.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping, status: "end"}))

    }, Math.min(console.value.length*10+typingIndicatorDelay, 3000));



    } 
    else 
        console.classList.remove('filled');

    
    
    // ws.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping, status: "end"}))
    // ws.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping, status: "alive"}))


}


export function saveProject()
{
  if(!wsSessionId) return;
  if (!namePrompt) return;

  fetch('../user/checkLoggedIn').then(loggedin => {

    if(loggedin.ok)
    {
        namePrompt.style.display = "initial";
        namePrompt.innerText = "";
        namePrompt.focus();
        function handleEnterKey(this: HTMLElement, e: KeyboardEvent) {
          if (e.key === "Enter") {
            e.preventDefault();
      
            fetch('/user/saveProject', {
              method: "POST",
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({name: namePrompt?.innerText, sessionId: wsSessionId})
            }).then(response => {
              if(!response.ok)
                if(response.status === 401)
                  displayMessagePopup('Please log in!')
                
              // save was sucsessfull
              document.getElementById('active-project-name') ?.classList.remove('dirty')
              modifiedFile = false;
              
            })
            .catch(err => {

              
              displayMessagePopup(err);
            })
      
            document.getElementById('saveProject')?.classList.add('saved')
      
            this.style.display = "none";
            this.innerText = "";
            this.removeEventListener("keypress", handleEnterKey);
          }
        }
        const enterListener = namePrompt.addEventListener("keypress", handleEnterKey);
    } else
    {
      if(loggedin.status == 401)
        displayMessagePopup('Pentru a-ti salva proiectele trebuie sa intri in cont sau sa-ti faci unul nou!')
      else 
       displayMessagePopup('Eroare: ' + loggedin.statusText)
    }
    
  
  }).catch(err => {
    displayMessagePopup(err)
  })


  

  
}


function loadProject(id:number)
{
  if(!wsSessionId) return;
  fetch('/user/loadProject/'+id, {
    method: "GET",
    headers: {'Content-Type': 'application/json'},
  }).then(res => res.json())
  .then(data => {
    if (data.redirectTo) {
      window.location.href = data.redirectTo;
    }
  })
  .catch(err => {
    displayMessagePopup(err)
  })
}


export function listProjects()
{
  if(!wsSessionId) return;
  fetch('/user/listProjects', {
    method: "GET",
    headers: {'Content-Type': 'application/json'},
  }).then(response => response.json()).catch(err => {})
  .then(data => {

    // if(data.error) throw 'unauth'
    try {
  if(!data.projects) throw "invalid data"
    }
    catch
    {
      displayMessagePopup('please log in')
    }
    const container = document.createElement('div')
    container.classList.add('project-list-container')

    const closeButton = document.createElement('button');
    closeButton.onclick = function (this, ev) {
      container.remove();
    }
    closeButton.innerText = 'x';
    container.appendChild(closeButton)
    const currentSaveId = new URLSearchParams(window.location.search).get('save')
    // displayMessagePopup(JSON.stringify(data.projects))
    const listcontainer = document.createElement('ul')
    listcontainer.classList.add('project-list')
    for(const project of data.projects as Project[])
    {
      const projectElem = listcontainer.appendChild(document.createElement('li'))
      const button = projectElem.appendChild(document.createElement('button'))
      const deleteProject = projectElem.appendChild(document.createElement('button'))
      deleteProject.innerText = 'x';
      deleteProject.classList.add('remove-proj')
      deleteProject.onclick = () => {
        fetch('../user/removeproject?id='+project.id).then(res => {
          if(res.ok)
            projectElem.remove();
        })
      }
      button.innerText = project.name;
      if(currentSaveId === project.fileUUID)
        button.classList.add('active')
      button.onclick = ( () => {
        loadProject(project.id)

      })
    }
      container.appendChild(listcontainer)
    const newProjButton = document.createElement('button')
    newProjButton.innerText = 'New Project'
    newProjButton.onclick = () => {
      window.location.href = '/editor'
    }

    container.appendChild(newProjButton)
    document.body.appendChild(container)

  })
  // .catch(err => {
  //   displayMessagePopup('nigger ' + err)
  // })
}


// END DOCUMENT FUNCTIONS //

// standardise the json
function sendWebsocketCommand(cmd: string, argsArr: string[] = []) {
  ws.send(
    JSON.stringify({
      command: cmd,
      args: argsArr,
      type: WebSocketMessageType.Output,
    })
  );
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

function writeOutput(data: string, messageJson?: any,manuallScroll?) {
  if (outputArea) {
    const msgText = data.replaceAll("<", "&lt").replaceAll(">", "&gt");

    if (messageJson && messageJson.messageType) {
      const localmsgId = (messageJson.id as number) || -1;
      msgId = localmsgId;
      if (messageJson.id === -1)
        console.error(new Error("invalid message id: " + messageJson));
      const messageType = messageJson.messageType;
      const messageClientId = messageJson.clientId;
      let messageGroup = outputArea;
      switch (messageType) {
        case ConsoleMessageType.UserChat:
          
          const group = outputArea.querySelector(
            `[msg-id="${localmsgId - 1}"]`
          ) as HTMLElement;

          const ownMessageClass =
            messageClientId === wsClientId || !wsClientId ? "chat-ownMessage" : "";
            
          if ((group?.getAttribute("clientId") as UUID) == messageClientId && group === outputArea.lastChild) {
            messageGroup = group;
            messageGroup.getElementsByClassName(
              "chat-content-container"
            )[0].innerHTML += `<span class="chat-content"> ${msgText}</span>`;
            messageGroup.setAttribute("msg-id", localmsgId + "");
            // messageGroup.classList.add('console-chat-group')
          } else
            outputArea.innerHTML += `<span class="console-chat ${ownMessageClass}" msg-id="${localmsgId}" clientId="${(
              messageClientId as string
            ).trim()}"><span class="chat-displayName">${
              messageJson.clientDisplayName
            }</span><div class="chat-content-container"><span class="chat-content">${msgText}</span></div></span>`;
          break;
        case ConsoleMessageType.SessionInfo:
          outputArea.innerHTML += `<span class="console-session-info" msg-id="${localmsgId}">${msgText}</span>`;
          break;
        case ConsoleMessageType.Info:
          outputArea.innerHTML += `<span class="console-info" msg-id="${localmsgId}">${msgText}</span>`;
          break;
        case ConsoleMessageType.Error:
          const errorElem = document.createElement('span')
          errorElem.classList.add('console-error')
          errorElem.setAttribute('msg-id', localmsgId.toString())
          // errorElem.id = 'compile-error'
          errorElem.innerHTML = msgText;
          errorElem.onclick = () => {
            const {range, row, column, rowend, columnEnd} = messageJson.params;
            editor.focus()
            editor.gotoLine(row, column)
            editor.selection.setRange(range)
          }
          outputArea.appendChild(errorElem)
          // outputArea.innerHTML += `<span class="console-error" msg-id="${msgId}" id='compile-error'>${msgText}</span>`;
          break;
        case ConsoleMessageType.Debug:
          outputArea.innerHTML += `<div  msg-id="${msgId}"><pre class="console-debug">${msgText}</pre></div>`;
          break;
        case ConsoleMessageType.DebugProgram:
          const groupDebug = outputArea.querySelector(
            `.debug-program[msg-id="${msgId}"] .debug-program-container`
          ) as HTMLElement;
          if (groupDebug)
            groupDebug.innerHTML += `<span class="console-debug">${msgText}</span>`;
          else
            outputArea.innerHTML += `<div class="debug-program" msg-id="${msgId}"><button onclick="toggleConsoleDebugProgram(this.parentElement)">x</button><div class="debug-program-container"></div></div>`;

          break;
        case ConsoleMessageType.Output:
          if(document.getElementById('active-console'))
            messageGroup = document.getElementById('active-console')!.querySelector(' div')!                        // TODO improve this selection
          messageGroup.innerHTML += `<pre class="console-program-${messageJson.type == WebSocketMessageType.End ? "return" : messageJson.type == WebSocketMessageType.Console  ? "input" :"output"}">${data} </pre>`;
          break;

        default:
          outputArea.innerHTML += `<pre class="console-output" msg-id="${msgId}">${data}</pre>`;
          break;
      }
    } else {
      outputArea.innerHTML += `<pre class="console-output" msg-id="${msgId}">${msgText}</pre>`;
    }
    // outputArea.textContent += "\n";

    if(!manuallScroll)
      outputArea.scrollTop = outputArea.scrollHeight;
  }
}

export function joinsession()
{
      
    const shareContainer = document.createElement('div')
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
    
    `

    
    
    document.body.appendChild(shareContainer)
    const script = document.createElement('script')
    const file = "/client/scripts/emailCodeVerificationClient.js";
    script.setAttribute('src', file);
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('async', 'true');

    document.body.insertBefore(script,shareContainer)
    const form = document.getElementById('codeForm') as HTMLFormElement
    const codeInput: HTMLInputElement = document.getElementById('code') as HTMLInputElement;

    codeInput.oninput = onCodeInput
    function onCodeInput()
    {
        if(codeInput!.value.length>=6)
          submit()
    }

    async function submit()
    {
        const codeInput: HTMLInputElement = document.getElementById('code') as HTMLInputElement;
        if(codeInput.valueAsNumber==undefined) return;

        await fetch('editor/joinsession?code='+codeInput.valueAsNumber, {
        }).then(response => {
            return response.json()
        }).then(res => {

            
                location.href = res.redirect;  
                console.log('redirecting..')
            
               
              
        }).catch(err => {
          document.getElementById('code-error')!.innerText=err;
        })
    }
    form!.addEventListener('submit', async (ev) => {

        ev.preventDefault()
        submit()
    })

    // document.getElementById('copy-link')!.onclick = () => {
    //   displayMessagePopup(data.link)
    // }
}





export function copySessionLink() {
  const clientId = wsSessionId;
  let sessionLink: string;


    sessionLink = window.location.origin + window.location.pathname + `?session=${clientId}`;

  // if (navigator.clipboard) {
  //   navigator.clipboard.writeText(sessionLink).then(() => {
  //     console.log("Code copied to clipboard!");
  //   });
  // } else displayMessagePopup(sessionLink);
  if(!wsSessionId) displayMessagePopup('Invalid session id.')


        const shareContainer = document.createElement('div')
    shareContainer.classList.add('share-container');
  
    shareContainer.innerHTML =
    `
    <form id="createSessionForm" action="/editor/startsession/${wsSessionId}" method="POST">
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
          <p class='code' id="data.code">}xxxxxx</p><button id='copy-link'>copy</button>
        </div>
      </div>
    </div>
    
    `

    
  
    document.body.appendChild(shareContainer)

    document.getElementById('close-share-session')!.onclick = function (this, ev) {
      shareContainer.remove();
      // shareContainer.animate()
    }



  fetch('/editor/sharesession?id='+wsSessionId)
  .then(res => {
    return res.json();
  })
  .then(data => {
    
    document.getElementById('data.code')!.innerText = data.code;
    (document.getElementById('data.qrurl')! as HTMLImageElement).src = data.qrsvg;
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
    document.getElementById('createSessionForm')!.onsubmit =  function (this, ev) {
      ev.preventDefault()
      const formData = new FormData(ev.target as HTMLFormElement)
      try {
        if(!formData.has('chat'))
        formData.set('chat', '')

        const entryData = Object.fromEntries(formData.entries());
        if(!wsSessionId) throw "Invalid session id."
        const startedSessionId = wsSessionId;
        fetch('/editor/startsession/'+wsSessionId, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entryData)
        }).then(res => {
          document.getElementById('connect-data-container')?.classList.add('created')
          const sessionCodeNode = document.createElement('h2');
          sessionCodeNode.innerText = data.code;
          sessionCodeNode.classList.add('session-code');
          document.getElementById('join-session')!.parentNode!.insertBefore(sessionCodeNode, document.getElementById('join-session'))
          // window.location.search += (window.location.search ? "&" : "?" ) + "session="+wsSessionId
          if(!window.location.search.includes("session=") && startedSessionId!=undefined)
            window.history.pushState({page: "updated session info"}, "intelge info", window.location.search + (window.location.search ? "&" : "?" ) + "session="+startedSessionId)
        }).catch(err => {
          throw err;
        })
      }
      catch (err)
      {
        if(typeof err == "string")
          document.getElementById('session-create-error')!.innerText = err as string;
        else
          console.error(err);
      }
     

      



    }
    document.getElementById('copy-link')!.onclick = () => {
      displayMessagePopup(data.link)
    }
  })
 

  
}


export function createFile(fileName: string = "untitled.txt") {
  const command = JSON.stringify({
    type: WebSocketMessageType.FileManagement,
    command: FileManagementCommands.Create,
    body: fileName,
  });
  ws.send(command);
  //ws.send({command: FileManagementCommands.Create, args: []});
  // console.log("create file " + command)
}



function openFile(fileName: string = "main.cpp") {
  const command = JSON.stringify({
    type: WebSocketMessageType.FileManagement,
    command: FileManagementCommands.Open,
    body: fileName,
  });
  ws.send(command);
}

let cmdId = 0;
const sessionId = new URLSearchParams(window.location.search).get("session") 
const saveId = new URLSearchParams(window.location.search).get("save");

// websocket //
const WSUrl = "ws://" + window.location.hostname  + ":" + window.location.port + (sessionId || saveId ? "?" : "") + (sessionId ? "session="+sessionId+"&" : "")  + (saveId ? "save="+saveId : "")


if(document.cookie.split('session=')[1])
{
  if(!window.confirm('You have a previous unsaved session, would you like to recover it?'))
      document.cookie = 'session=';

}


export const ws = new WebSocket(WSUrl);

let variables: any[] = [];
const variableArrayIndexes: number[] = [];

export function submitConsole(elem: HTMLTextAreaElement | null, type: WebSocketMessageType) {
  //     const sendText = elem?.value.replace(consoleText, "")
  //     if(sendText == "") return;
  //     console.log(sendText);
  //    //sendWebsocketCommand(sendText, ["console"]); //ws.send({command: sendText, args: ['console']});
  //    ws.send(JSON.stringify({ command: sendText, args: ['console'], type: WebSocketMessageType.Chat }));
  //    consoleText = elem?.value || "Error: invalid element";
  //    consoleInput.value = "";
  const sendText = elem?.value;
  if (!sendText) return;
  ws.send(
    JSON.stringify({
      command: sendText,
      // args: ["console"],
      type,
    })
  );
  consoleInput.value = "";
  typingIndicatorDelay = 300;
  onConsoleInput(elem)
  ws.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping, status: "end"}))

}

let wsClientId: UUID;
let wsSessionId: UUID;
const outputArea = document.getElementById("output");

type CursorPosition = { row: number; column: number };

// Class to render one visual cursor
class VisualCursor implements Ace.Ace.MarkerLike {
  constructor(
    public cursorId: string,
    private getPosition: () => CursorPosition
  ) {}
  type: string = "line";
  clazz: string = "ace_remote_cursor";
  markerRef: Ace.Ace.MarkerLike | undefined = undefined;
  update(
    html: string[],
    markerLayer: any,
    session: Ace.Ace.EditSession,
    config: any
  ): void {
    const pos = this.getPosition();
    const screenPos = session.documentToScreenPosition(pos.row, pos.column);
    const top = markerLayer.$getTop(screenPos.row, config);
    const left =
      markerLayer.$padding + screenPos.column * config.characterWidth;

    markerLayer.elt(
      "ace_remote_cursor",
      `height: ${config.lineHeight}px; top: ${top}px; left: ${left}px; --color: green`
    );
    // FOR FUTURE REFERENCE, HTML DOESNT WORK ANYMORE, USE ELT
  }
}

outputArea!.onscroll = ev => {
          const lastMessageGroup: HTMLDivElement = document.querySelector('[msg-id="'+ ((msgId!=-1) ? msgId.toString() : '0') +'"]')!;
          console.log(outputArea!.scrollTop + outputArea!.scrollHeight)
           console.log(lastMessageGroup.offsetTop + lastMessageGroup.offsetHeight + " " + lastMessageGroup.scrollHeight )
          const blockScroll =  outputArea!.scrollHeight - outputArea!.clientHeight - outputArea!.scrollTop > 1//*eventJson.clientId !== wsClientId && */document.querySelector( `[msg-id="${msgId}"]`) ? (outputArea!.scrollTop > document.querySelector( `[msgId="${msgId}"]`)!.clientHeight) : true

  if(!blockScroll)
        {
          document.getElementById('message-indicator')?.remove()
        }
}


// Manager class for multiple visual cursors
class MultiCursorManager {
  private cursorsPos: Map<string, CursorPosition> = new Map();
  private cursors: Map<string, VisualCursor> = new Map();
  constructor(private editor: Ace.Ace.Editor) {}

  addCursor(cursorId: string, position: CursorPosition): VisualCursor {
    this.cursorsPos.set(cursorId, position);

    const marker = new VisualCursor(
      cursorId,
      () => this.cursorsPos.get(cursorId)!
    );

    const markerDyn = this.editor.session.addDynamicMarker(marker, true);
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
    this.editor.session.removeMarker(
      (this.cursors.get(cursorId)?.markerRef as Ace.Ace.MarkerLike).id || 0
    );
    const success = this.cursors.delete(cursorId);
    this.cursors.delete(cursorId);
    this.editor.renderer.updateFrontMarkers();
    return success;
  }
  replicateCursor(cursorId: string, position: CursorPosition) {
    if (this.cursors.has(cursorId)) {
      this.updateCursor(cursorId, position);
      return this.cursorsPos.get(cursorId);
    } else return this.addCursor(cursorId, position);
  }
}

// Initialize the manager
const cursorManager = new MultiCursorManager(editor);

let msgId: number = 0;

ws.onclose = (ev) => {
  const serviceRestart = ev.code == 1006;
  console.log(ev.code + " " + ev.reason)
  const socketStopped = document.createElement('div')
  socketStopped.classList.add(serviceRestart ? 'service-stopped' : 'service-error')
  const socketText = document.createElement('p')
  socketText.innerHTML = serviceRestart ? 'Scuze, am pierdut conexiunea la server...' : ev.reason;
  socketStopped.appendChild(socketText)
  document.getElementById('editor')?.appendChild(socketStopped)
  if(serviceRestart)
    setTimeout(() => {
      window.location.reload()
    }, 2000);
}


ws.onopen = (ev) => {
  const sessionId = new URLSearchParams(window.location.search).get("session") ? new URLSearchParams(window.location.search).get("session") : new URLSearchParams(window.location.search).get("save");
  //writeOutput(sessionId || "No session ID found in URL.");

  
  window.onbeforeunload = (ev => {
    
    if(modifiedFile)
      ev.preventDefault()
  })




  editor.on("change", (delta: any) => {
    if (isRemoteChange) return;

    const code = editor.getValue();

    //    if(!currentFileName) console.error('Current file name is invalid')
    //         const saveFile: boolean = !["c","exe"].includes(currentFileName.split(".").pop()||"");

    //    writeOutput('waasassasa')
    //     new WSMessage(WebSocketMessageType.CodeChange, { body: code,  delta: delta, type: WebSocketMessageType.CodeChange, fileName: currentFileName, saveFile: true, }, msgMap, msgId++, (data) => {
    //         if (editor.getValue() !== data.body && data.clientId !== wsClientId) {
    //             const delta = data.body.delta;
    //             console.log(data)
    //             isRemoteChange = true;
    //             editor.session.getDocument().applyDelta(delta);
    //             isRemoteChange = false;
    //         }
    //         writeOutput('waas')
    // })

    // console.log("changed")
    if (!currentFileName) console.error("Current file name is invalid");
    
    dirtyFile(currentFileName)
    ws.send(
      JSON.stringify({
        body: code,
        delta: delta,
        type: WebSocketMessageType.CodeChange,
        fileName: currentFileName,
        saveFile: true,
      })
    ); // Send code to server on change // TODO Remove code from body.
  });

  editor.on("changeSelection", () => {

    if (isRemoteChange) return;
    const selection = editor.getSelectionRange();
    // const start = selection.start;
    // const end = selection.end;
    // const range = new AceRange(start.row, start.column, end.row, end.column);
    // const selectedText = editor.session.getTextRange(range);
    // console.log(selectedText);
    if (!currentFileName) console.error("Current file name is invalid");
    ws.send(
      JSON.stringify({
        range: editor.getSelectionRange(),
        fileName: currentFileName,
        type: WebSocketMessageType.CodeSelection,
      })
    ); // Send code to server on change
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
};

enum FileManagementCommands {
  Create = "create",
  Delete = "delete",
  List = "list",
  Rename = "rename",
  Open = "open",
}

type errorObject = {
  row: Number;
  column: Number;
  error: String;
};

type FileEditorSession = {
  editor: Ace.EditSession | undefined,
  fileName: string,
  fileElement: HTMLElement | undefined,
}
 class CompileError {
  range: Ace.Range;
  annotation;
  markerId: number;
  text: string
  constructor(range: Ace.Range, text: string)
  {
    this.text = text;
    this.range = range
    this.annotation = {
      row: range.start.row,
      column: range.start.column,
      text: text,
      type: "error",
    }

    this.markerId = editor.session.addMarker(
      range,
      "ace_carret_error",
      "text",
      true
    )

  }
}

let modifiedFile = false;
let ping = -1;
function cleanDebug()
{
  renderer.removeGhostText();
  (document.getElementById('vector-container') as HTMLDivElement).innerHTML = '';
  clearTimeout(playbackId)
  onExit();
}

function dirtyFile(fileName: string)
{
  modifiedFile = true;
  const saveFile: boolean = fileName ? !["c", "exe"].includes(
      fileName.split(".").pop() || ""
    ) : true;
  if(saveFile)
  {
    document.getElementById('buttons')?.classList.remove('compiled')
    document.getElementById('saveProject')?.classList.remove('saved')
    document.getElementById('active-project-name')?.classList.add('dirty')
  }
 
}



// STATE VARIABLES //

const markers: number[] = [];
const errorAnnotations: Ace.Ace.Annotation[] = [];
const compileErrorObjs: Map<number,CompileError> = new Map();

//    END   //

ws.onmessage = (event) => {
  let eventJson = JSON.parse(event.data);
  let command = eventJson.message;
  let data = eventJson.body;
  const type: string = eventJson.type;

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

  function handleOutput(eventJson: any) {

    if(eventJson.message != 'info locals' && eventJson.messageType != ConsoleMessageType.DebugProgram)
      writeOutput(data, eventJson);

    const session = editor.getSession();
    const doc = session.getDocument();

    const text = doc.getValue();

    async function asyncExecuteCommand(command: string, cmdId: number) {
      return await fetch("/requestValue?value=" + command + "&cmdId=" + cmdId, {
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
            changes: { new: any; index: any },
            changed: boolean
          ) => {

            updateDisplayVectorElement(
              new Variable(variableName, changes.new, "array"),
              changes.index,
              changed
            );

            // console.log(changes.updatedIndices)
          },
        });
      }
      
      // set variables
      maxValue = 0;
      for (let index = 0; index < variables.length; index++) {
        const element: Variable = variables[index];
        if (variables.length == 0) break;

        //array type

        if (element.type == "array") {
          (element.value as number[]).forEach((value) => {
            if (maxValue < value) maxValue = value;

            updateDisplayVector(element);
          });
        }
      }
      vectDisplays.forEach((element) => {
        const vectElems = document
          .getElementById(element)
          ?.getElementsByClassName("item-container")[0]
          .children as HTMLCollection;

        for (let i = 0; i < vectElems.length; i++) {
          const value = parseInt(
            (vectElems[i] as HTMLSpanElement).innerText.split("\n")[1]
          ) as number;
          const colorV = Math.min(
            Math.max(value / maxValue, value / maxValue / 2) * 200 + 50,
            255
          );
          (
            vectElems[i] as HTMLElement
          ).style.backgroundColor = `rgb(${colorV},${colorV},${colorV})`;
        }
      });
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
        if (playbackSpeed < 4)
          // dont bother if speed is too high.
          for (const condition of conditions) {
            asyncExecuteCommand(condition, cmdId++)
              .then(function (response) {
                return response.json();
              })
              .then(function (data) {
                const exprValue = data.body.toString();
                if (
                  parseInt(
                    (exprValue as string).match(/(?<=\$)\d*/)?.[0] as string
                  ) === cmdId &&
                  !Number.isNaN(
                    parseInt(
                      (exprValue as string).match(/(?<=\$)\d*/)?.[0] as string
                    )
                  )
                ) {
                  buffer += (
                    exprValue.replace(exprValue.match(/\$\d*/), condition) +
                    "; "
                  )
                    .replace("(gdb)", "")
                    .replace("\n", "");
                  console.log(buffer);
                  if (i++ == conditions.length) {
                    // wait to buffer all values
                    renderer.setGhostText("   " + buffer, pos);
                    console.log(buffer);
                    buffer = "";
                  }
                } else renderer.setGhostText("   " + buffer, pos);
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
              if (variable.indexes.length > indexCode) return;
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
      writeOutput(data, eventJson);
      break;


    case WebSocketMessageType.Console:
    case WebSocketMessageType.Output:
      
      if(byteSize(eventJson.body) > 64000) // 1000000 is 1Mb
      {
        writeOutput('error! output exceeded 64kb')
       
        break;
      }
      else 
      // writeOutput(data, eventJson)

      handleOutput(eventJson);
      if(eventJson.message === 'end')
        cleanDebug()
        
      break;

    case WebSocketMessageType.End:
      if(eventJson.body==="gdb")
      {
        cleanDebug()
        const cmdBut = document.getElementById("buttons");
        cmdBut?.classList.remove("debug-control");
        cmdBut?.classList.remove("execute-control");
      }
      else
      {
        writeOutput( data + "  |   Execution time: " + `<span style="color:${eventJson.time < 100 ? 'green' : 'red'}">` + eventJson.time +"</span>ms" + (eventJson.notes  != "" ? "<br><span style='opacity: 0.5'>notes: " + eventJson.notes + "</span>": ""), eventJson);
      }

      onExit()

      
      break;
    
    case WebSocketMessageType.Chat:
      if(eventJson.clientId)
      {
        
        const lastMessageGroup: HTMLDivElement = document.querySelector('[msg-id="'+ ((msgId!=-1) ? msgId.toString() : '0') +'"]')!;
        const blockScroll = outputArea!.scrollHeight - outputArea!.clientHeight - outputArea!.scrollTop > 1 // lastMessageGroup? lastMessageGroup.offsetTop + lastMessageGroup.offsetHeight > outputArea!.scrollTop : false//*eventJson.clientId !== wsClientId && */document.querySelector( `[msg-id="${msgId}"]`) ? (outputArea!.scrollTop > document.querySelector( `[msgId="${msgId}"]`)!.clientHeight) : true


        // if(!document.querySelector('[msgId='+msgId+']')) return;
        if(blockScroll)
        {
          if(document.getElementById('message-indicator'))
          {

            const existingIndicator = document.getElementById('message-indicator');
            if(existingIndicator?.innerText)
              existingIndicator!.innerText = (parseInt(existingIndicator!.innerText) + 1).toString() + "+"
            
          }
          else
          {

            outputArea!.innerHTML += "<br>"
            const messageIndicator = document.createElement('div')
            messageIndicator.id = 'message-indicator';
            messageIndicator.innerText = "1+"
            document.getElementById('output-container')?.appendChild(messageIndicator)
            lastViewedMessage = msgId;

          }


        } else
        {
          document.getElementById('message-indicator')?.remove()
        }


        writeOutput(data, eventJson, blockScroll);

           
      }
      else
      
      writeOutput(data, eventJson);

      break;

    case WebSocketMessageType.Handshake:
      if(!wsSessionId && !wsClientId || eventJson.sessionId)
      {
      wsClientId = eventJson.clientId;
      wsSessionId = eventJson.sessionId;
      // if(!document.cookie.includes('session='))
      document.cookie='session='
      setTimeout(() => {
        document.cookie = 'session='+wsSessionId+';' 
      }, 15000);
      //console.log(editor.session.toJSON()) // TODO Implement saving the editor session in a file on the server or on the client.
      }

      if(eventJson.session ? eventJson.session.isHost : false || !eventJson.session)
        document.getElementById('share')?.classList.add('host')
      
      writeOutput(eventJson.body, eventJson);


      const projectData = eventJson.project;
      const sessionData = eventJson.session;
      if(projectData)
      {
        
        const projNameNode = document.createElement('h1');
        projNameNode.innerText = eventJson.project.name as string;
        projNameNode.id = 'active-project-name'
        document.getElementById('join-session')!.parentNode!.insertBefore(projNameNode, document.getElementById('join-session'))
        

      }
      if(sessionData)
      {
        if(!sessionData.canEdit)
          editor.setReadOnly(true)
        if(!sessionData.canChat)
          document.getElementById('console')?.setAttribute('disabled','true')
      }
      

      
      break;
    case WebSocketMessageType.CodeChange:
      // editor.session.getDocument().applyDelta(delta);
      if (
        editor.getValue() !== data.body &&
        eventJson.clientId !== wsClientId
      ) {
        const delta = eventJson.body.delta;
        console.log(eventJson);
        isRemoteChange = true;
        editor.session.getDocument().applyDelta(delta);
        isRemoteChange = false;
        document.getElementById('buttons')?.classList.remove('compiled')
        dirtyFile(eventJson.fileName)

      }
      break;
    case WebSocketMessageType.CompileResult:


      const compileErrors = JSON.parse(eventJson.body);

    for(const elem of document.getElementsByClassName('console-error'))
          elem.remove()
       editor.session.setAnnotations([])
        errorAnnotations.length=0;
        for(const marker of markers)
          editor.session.removeMarker(marker)

        markers.length =0;


      if(!compileErrors.length)
      {
        writeOutput('ok')
        
        for(const marker of markers)
          editor.session.removeMarker(marker)

        markers.length =0;
      }  
      
      else
        for(const result of compileErrors)
        {
          switch(result.kind)
          {
            case "error":
              
             
              // const location = result.locations[0];
              if(!result.locations || !result)
                {
                  writeOutput(result.message, {messageType: 'error'})
                  break;
                } 
              else
                for(const location of result.locations)
                {

                 
                  const range: Ace.Range = new AceRange(
                    location.caret.line-1,
                    location.caret.column-1,
                    location.finish? location.finish.line-1 : location.caret.line-1,
                    location.finish? location.finish.column : location.caret.column)

                  const compileErrorObj = new CompileError(range, result.message)
                  compileErrorObjs.set(compileErrorObj.markerId, compileErrorObj)
                  errorAnnotations.push(compileErrorObj.annotation);
                
                  markers.push(
                    compileErrorObj.markerId
                    
                  );
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
            for(const marker of markers)
              editor.session.removeMarker(marker)
              errorAnnotations.length = 0;
              editor.session.setAnnotations([]);
              document.getElementById('compile-error')?.remove()
            break;
        }
        // writeOutput(result.kind)
      }
      
      break;


    case WebSocketMessageType.ExecuteStatus:
      let errorOutputString = "";
      if(eventJson.error)
      {
       onExit()
        // ON ERROR
        document.getElementById('buttons')?.classList.remove('compiled')
        for (const markerId of markers) editor.session.removeMarker(markerId);

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

            markers.push(
              editor.session.addMarker(
                new AceRange(row, column, row, column + 1),
                "ace-error-line",
                "screenLine"
              )
            );
          }
        }
        editor.session.setAnnotations(errorAnnotations);
      } else {
        if(eventJson.input == 1)
        {
          const console = document.createElement('textarea')as HTMLTextAreaElement;
          document.querySelector('#active-console')?.appendChild(console) 

          console.addEventListener("keypress", (e: KeyboardEvent) => {
            
            if (e.key === "Enter" && !e.shiftKey || e.key === " ") {
              e.preventDefault();

              submitConsole(console, WebSocketMessageType.Console)
              console.remove()
            }
           });

           console.focus();
        }
          
        editor.session.setAnnotations([]);
        document.getElementById('buttons')?.classList.add('compiled')
        for (const markerId of markers) editor.session.removeMarker(markerId);
      }

      // writeOutput(
      //   data.success
      //     ? "Compilation of " + data.fileName + " successful!\n"
      //     : errorOutputString ||
      //         "Compilation error. (couldnt retrieve error message, sorry)"
      // );
      
      document.getElementById('compile-status')!.innerText = eventJson.body;
      document.getElementById('compile-status')!.style.opacity = '1'

      setTimeout(() => {
        document.getElementById('compile-status')!.style.opacity = '0'
      }, 500);

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
      const end = selection.end;      const range: Ace.Range = new AceRange(start.row, start.column, end.row, end.column);

      let cursorRow;
          let cursorColumn;
      
      //if(start.end==end.end || start.row*end.row * start.column * start*end.column==0) return;
      if (marker) editor.session.removeMarker(marker);
      if (start && end) {
        if (start !== end)

          marker = editor.session.addMarker(
            range,
            "ace_remote_selection",
            "line",
            false
          );
          
          // TODO fix this so that the cursor goes to the end of the selection.
        cursorManager.replicateCursor(eventJson.clientId, {
  row: (end.row > start.row)as boolean ? end.row : start.row,
  column: (end.column > start.column) as boolean ? end.column : start.column,
        });

        console.log(range.toString())
      }

      console.log("selection ", selection);
      break;

    case WebSocketMessageType.ConsoleTyping:
      const indicatorStatus = eventJson.status;
      const indicatorClientId = eventJson.clientId;
      const typingIndicatorContainer = document.getElementById('typingIndicatorContainer');
      
      switch(indicatorStatus)
      {
        case "start":
          if(!typingIndicators.has(indicatorClientId))
            {
              if((typingIndicators.has(indicatorClientId))) (typingIndicators.get(indicatorClientId) as HTMLElement).remove;
              // typingIndicators.delete(indicatorClientId);

              const typingIndicator = document.createElement('div');
              // typingIndicator. = indicatorClientId;
              
              typingIndicators.set(indicatorClientId, typingIndicator)
              typingIndicator.textContent = eventJson.displayName + " scrie..."
              typingIndicatorContainer?.appendChild(typingIndicator);

              
            }
          break;
          case "end":

          if(typingIndicatorContainer!==undefined && typingIndicators.has(indicatorClientId))
            {
              const typingIndicator = typingIndicators.get(indicatorClientId) as HTMLElement;
              if(!typingIndicator) return typingIndicatorContainer?.replaceChildren();
              typingIndicator.animate([
                {opacity: "100%", bottom: "0px", filter: "blur(0px)"},
                {bottom: "-50px", opacity: 0, filter:" blur(10px)"},
                ],
              {duration: 200}).onfinish = (event) => {
                typingIndicatorContainer?.removeChild(typingIndicator);
                typingIndicator.remove;
                typingIndicators.delete(indicatorClientId);

              }


            }
          break;
      }
        

      
    break;
    case WebSocketMessageType.ColabData:
      const colabClients: UUID[] = eventJson.clients;
      const colabSessionId = eventJson.thisSessionId;
      const colabClientId = eventJson.thisClientId;
      const colabCommand = eventJson.colabCommand;
      console.log("collab command= " + colabCommand);
      switch(colabCommand) 
      {
        case "DISCONECT":
                const success = cursorManager.removeCursor(colabClientId);
                writeOutput(eventJson.body, eventJson);
            break;
        case "HOST":
          writeOutput(eventJson.body, eventJson);
      }
      
      const colabContainer = document.getElementById("colab-container") || null;
      if (!colabContainer) return;
      colabContainer.innerHTML = "";
      colabClients.forEach((client) => {
        const clientId = client.split("-")[0];
        colabContainer.innerHTML += `<div class="colab-client" id=${clientId}>${clientId}</div>`;
      });
      break;
    case WebSocketMessageType.Heartbeat:
      ping = Date.now() - ping - eventJson.expectedDelay;

      ws.send(JSON.stringify({ type: WebSocketMessageType.Heartbeat })); // send heartbeat to server
      if (ping != -1) console.log("heartbeat ping: " + ping);
      ping = Date.now();
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
          JSON.parse(event.data).body.content.forEach((file: string) => {
            onFileCreate(file);
          });

          break;
        case FileManagementCommands.Rename:
          break;
        case FileManagementCommands.Open:
          const fileName: string = eventJson.body.fileName;
          const fileContent = eventJson.body.content;
          currentFileName = fileName;
          console.log(editorSessions.get(fileName));

          if (!editorSessions.has(fileName)) {
            const newSession = ace.createEditSession(fileContent);
            // undo manager?
            // if(fileName.split('.')[1] != 'cpp')
              newSession.setMode(aceModes.getModeForPath(fileName).mode);
            editor.setSession(newSession);
            
            const session: FileEditorSession =
            {
              editor: newSession,
              fileName: fileName,
              fileElement: undefined
            }
            
            editorSessions.set(fileName, session);
          } else {

            if(!editorSessions.get(fileName)?.editor)
              editorSessions.get(fileName)!.editor =  ace.createEditSession(fileContent);


            console.log("File already opened: ", fileName);
            const session = editorSessions.get(fileName)!;

            if (session)
              {
                session.editor!.setMode(aceModes.getModeForPath(fileName).mode);
                editor.setSession(session.editor);
              } 
            if (fileContent.toString() != session?.editor!.getValue().toString()) {
              isRemoteChange = true;  // must add this to prevent sending on changed event
              session.editor!.setValue(fileContent);
              isRemoteChange = false;
            }
          }
          if(document.getElementById('active-open-file'))
            document.getElementById('active-open-file')!.id = '';
          const elem = editorSessions.get(fileName)?.fileElement!;
          if(elem)
          {
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

export function compileCode(this, ev) {

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
      const output = document.getElementById("output") as HTMLInputElement;
      if (!output) return;
      let errorOutputString = "";

document.getElementById('compile-error')?.remove()
      if (!data.success) {
        // ON ERROR
        
        document.getElementById('buttons')?.classList.remove('compiled')
        for (const markerId of markers) editor.session.removeMarker(markerId);

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

            markers.push(
              editor.session.addMarker(
                new AceRange(row, column, row, column + 1),
                "ace-error-line",
                "screenLine"
              )
            );
          }
        }
        editor.session.setAnnotations(errorAnnotations);
      } else {
        editor.session.setAnnotations([]);
        document.getElementById('buttons')?.classList.add('compiled')
        for (const markerId of markers) editor.session.removeMarker(markerId);
      }

      writeOutput(
        data.success
          ? "Compilation of " + data.fileName + " successful!\n"
          : errorOutputString ||
              "Compilation error. (couldnt retrieve error message, sorry)", {messageType: "error"}
      );

      code = editor.getValue();
    });
}

export function sendDebugCommand(cmd: string) {
  //editor.setValue(code, -1);
  const cmdBut = document.getElementById("buttons");
  if (cmd == "run") {
    cmdBut?.classList.add("debug-control");
    cmdBut?.classList.remove("execute-control");
    onRun()
  } else if (cmd == "execute") {
    cmdBut?.classList.remove("debug-control");
    cmdBut?.classList.add("execute-control");
    onRun()
  }

  sendWebsocketCommand(cmd, []); //ws.send(JSON.stringify({command: cmd , args: []}));
  if (cmd == "next" || cmd == "continue")
    sendWebsocketCommand("info locals\n ", []); // ws.send({command: 'info locals' , args: []});
  const consoleElem = document.getElementById("console") as HTMLTextAreaElement;
  if (cmd == "execute" && consoleElem?.value != "") submitConsole(consoleElem, WebSocketMessageType.Console);
}

let playbackSpeed = 1;
let playbackId: NodeJS.Timeout;
let processRunning: boolean;

export function playback() {
  sendDebugCommand("break main");

  onRun();
  let i = debugLine;
  updatePlaybackSpeed();
}

export function restartPlayback() {
  sendDebugCommand("run");
  setPlaybackSpeed(1);
  playback();
}

const childIndexOf = 1;
export function setPlaybackSpeed(newPlaybackSpeed: number) {
  document
    .getElementById("speed-control")
    ?.children[playbackSpeed - 1 + childIndexOf].classList.remove(
      "active-speed"
    );
  playbackSpeed = newPlaybackSpeed;
  updatePlaybackSpeed();
}
function updatePlaybackSpeed() {
  document
    .getElementById("speed-control")
    ?.children[playbackSpeed - 1 + childIndexOf].classList.add("active-speed");
  if (playbackId) clearInterval(playbackId);
  playbackId = setInterval(() => {
    if (!ws.OPEN || processRunning) return clearInterval(playbackId);
    sendDebugCommand("next");
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
  document.getElementById('buttons')?.classList.add('executing')

  document.getElementById('compile-status')!.innerText = 'Communicating with server...';
   document.getElementById('compile-status')!.style.opacity = '0.25'

  if(document.getElementById('active-console'))
    document.getElementById('active-console')!.id = '';

  outputArea!.innerHTML += "<div id='active-console' class='output-console-container'><div class='program-output'></div></div>"
  //<div class='header'>  <div class='button-container' ><button>close</button> <button>maxi</button> <button>mini</button> </div> program output</div>


  


  // TODO Add separate input area for interactive console.
}

function onExit() {
  editor.setReadOnly(false);
  processRunning = false
  editor.session.removeMarker(lastDebugId);
  document.getElementById('buttons')?.classList.remove('executing')

  if(document.getElementById('active-console'))
    document.getElementById('active-console')!.id = '';
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
    vectCont.innerHTML += `<span style="background-color: rgb(${
      element * 50 + 50
    },${element * 50 + 50},${
      element * 50 + 50
    })"><index>${i++}</index><value>${element}</value></span>`;
  });
}
let vectDisplays: string[] = [];
function createDisplayVector(variable: Variable) {
  // console.log(variable)
  if (variable.type != "array") return;
  // vectDisplays.add(variable)
  vectDisplays.push(variable.varname);
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
let maxValue = 0;
function updateDisplayVector(variable: any) {
  // displayVector(variable.value, document.getElementById(variable.varname))
  //    variable.values.forEach(vari => {
  //     updateDisplayVectorElement(variable, vari.index)
  //    });
}

function updateDisplayVectorElement(variable: Variable, index: any, changed: boolean) {
  const elem = getDisplayVectorElement({ varname: variable.varname }, index); //class="active-vector-element"
  if (!elem) return;
  if (elem && typeof variable.value === "number") {
    const classes = elem.classList.toString();
    if(changed) elem.innerHTML = `<index>${index}</index><value>${variable.value}</value>`;
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

function getDisplayVectorElement(variable: { varname: string }, index: number) {
  return document
    .getElementById(variable.varname)
    ?.getElementsByClassName("item-container")[0].children[index]; // offset by the ammount of default children aka the header of the container
}

