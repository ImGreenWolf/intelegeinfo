// Ensure Ace Editor is globally available or import it properly

import Ace, { edit } from "ace-builds";
// import { Marker } from "ace-builds-internal/search_highlight";
import { text } from "body-parser";
// import * as FileManagement from "./FIleManagement";

// import { WebSocketMessageType } from "./types"; // fuck this
import { WSMessage } from '../../shared/src/types.js'
import { UUID } from "crypto";
// import QRCode from 'qrcode'
// import { WebSocketMessageType } from "../../dist/shared/types";
// const WebSocketMessageType = require("../../dist/shared/types")

import { createButton, createNode, Dock, EditorCanvas, LoadingThrobber, Pixelated, Toolbox } from "./components.js";
/*END IMPORTS*/
const inIframe = window.self !== window.top;


// new Pixelated().render().then(node => document.body.appendChild(node))
//@ts-ignore


//  import * as Ace from "ace-builds";
declare const ace: typeof Ace;
declare const gtag: any
declare const sha256: any
import modelist from "ace-builds/src-noconflict/ext-modelist";
import { Project } from "../../generated/prisma"
import { HandshakeMessage, WebSocketMessage } from "../../shared/src/messageTypes"
import { createWindowTab, cursorManagers, EditorWindow, EditorWindowTab, findTabByName, showDefaultScreen, TerminalTab, updateCatalouge } from "./windowManager.js";

const AceRange = ace.require("ace/range").Range;
const aceModes: typeof modelist = ace.require("ace/ext/modelist");
const sessionCookieName = 'editor_session_id'
let openMenu: any | null = null;
//  const msgMap: Map<Number, WSMessage> = new Map();


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



if(!Array.prototype.at)
{
  Array.prototype.at = function (index: number)
  {
    if(index<0)
      return this[this.length-index]
    else
      return this[index]
  }
}



// Class to render one visual cursor
class VisualCursor implements Ace.Ace.MarkerLike {
  constructor(
    public color,
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
      `height: ${config.lineHeight}px; top: ${top}px; left: ${left}px; --color: #` + this.color
    );
    // FOR FUTURE REFERENCE, HTML DOESNT WORK ANYMORE, USE ELT
  }
}

class RemoteCursorSelection implements Ace.Ace.MarkerLike {
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


class Console {
  element: HTMLDivElement;
  stdin: string[] = []
  event = new Event("open");
  compileMessage: HTMLDivElement | undefined
  noVNC: HTMLIFrameElement | undefined
  consoleInput: HTMLTextAreaElement | undefined
  constructor () {
    if(outputConsoles.length>0)
      outputConsoles.at(-1)!.callbackCreate(this)

    const thisConsole = document.createElement('div')
    outputConsoles.push(this)
    if(outputArea)
      outputArea.appendChild(thisConsole);
    thisConsole.id =  'active-console'
    thisConsole.className = 'output-console-container'
    // thisConsole.innerHTML = "<div class='program-output'></div>"

    const resendButton = document.createElement('button');
    resendButton.innerText = '↻'
    resendButton.classList = 'retry-program custom-button'

    resendButton.onclick = (ev) => {
      sendDebugCommand("execute")
      ws.send(
        JSON.stringify({
          command: this.stdin.join(" "),
          // args: ["console"],
          type: WebSocketMessageType.Console,
          action: 'process'
        })
      );

    }
    thisConsole.appendChild(resendButton);
    this.element = thisConsole
    

    this.onCompileStart()

  }
  public onCompileStart(message = 'Comunicating with server')
  {
    this.compileMessage = createNode('div', {html: [new LoadingThrobber().render(), createNode('p', {innerText:message, css:"text-align: center; opacity: 0.75" })]})
    this.element.appendChild(this.compileMessage)
    
  }
  public onProcessStart()
  {
    if(this.compileMessage)
      this.compileMessage.remove()

    if(this.consoleInput )
      return
    this.consoleInput = document.createElement('textarea')as HTMLTextAreaElement;
    this.element.appendChild(this.consoleInput)
  }

  public onProcessEnd()
  {
    if(this.consoleInput)
      this.consoleInput.remove()
    this.compileMessage?.remove()

    this.element.id = '';
  }

  public callbackCreate(callerConsole: Console) {
    callerConsole.stdin = this.stdin;
  }
  public sendCommand(cmd: string) {
    this.stdin.push(cmd)
  }
}

// Manager class for multiple visual cursors
export class MultiCursorManager {
  private cursorsPos: Map<string, CursorPosition> = new Map();
  private cursors: Map<string, VisualCursor> = new Map();
  constructor(private editor: Ace.Ace.Editor) {}
  public selectMarker: number | null = null
  addCursor(cursorId: string, position: CursorPosition,color): VisualCursor {
    this.cursorsPos.set(cursorId, position);

    const marker = new VisualCursor(
      color,
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
  replicateCursor(color, cursorId: string, position: CursorPosition) {
    if (this.cursors.has(cursorId)) {
      this.updateCursor(cursorId, position);
      return this.cursorsPos.get(cursorId);
    } else return this.addCursor(cursorId, position, color);
  }
}

class EditorCursor {
        cursor: HTMLDivElement| undefined
        posX: number=0;
        posY: number=0;
        cposX: number=0;
        cposY: number=0;
        lposX: number=0;
        lposY: number=0;
        updateInterval;
        step: number=0;
        pointerType: string = "mouse";
        animated = false;
        animTimeout: NodeJS.Timeout|undefined;
        id;
        cursorContainer: HTMLDivElement | undefined
        nameElement: HTMLSpanElement | undefined
        
        constructor(eventJson) {
            

            this.id = eventJson.clientId
            cursors.set(this.id, this)
            const cursorObj = 
            this.refreshCursor(eventJson)
            this.update(eventJson);
             
          }

          protected refreshCursor(eventJson)
          {
            if(this.cursor != undefined)
              this.cursor.remove();
            this.cursor = createNode('div', {className: 'cursor'})
            this.cursorContainer = createNode('div', {className: 'cursor-container'})
            this.nameElement = document.createElement('span');
            this.nameElement.innerText = eventJson.displayName;
            this.cursorContainer.appendChild(this.nameElement)
            this.cursorContainer.appendChild(this.cursor)
            // this.cursor.id = 'cursor-'+this.id;
            this.cursorContainer.classList.add('cursor-container')
            // cursor.setAttribute('name', eventJson.displayName) 
            // cursor.style.color
            this.cursor.style.backgroundColor = "#" + eventJson.color;
            this.pointerType = eventJson.pointerType || "mouse";
            if(this.pointerType != "mouse")
            {
              this.cursor.classList.add(eventJson.pointerType)
              this.cursor.style.width = eventJson.width;
              this.cursor.style.height = eventJson.height;
              this.cursor.style.maskImage = `radial-gradient(transparent, #${eventJson.color})`
              // if(eventJson.pointerType=="mouse")
              // setTimeout(() => {
              //   this.cursor?.remove()
              //   cursors.delete(eventJson.clientId)
              // }, 1000);
            }
            document.body.appendChild(this.cursorContainer)
            
            return this.cursor;
          }
          public remove()
          {
            const elem = this.cursorContainer!
            let blurAmmount = 0;
            const maxBlur = 10;
            const blurDuration = 0.2;
            const id = this.id
            function blur(timems)
            {

              elem.style.filter = `blur: ${blurAmmount}px;`
              blurAmmount += maxBlur * blurDuration * timems
              if(maxBlur < 10)
                requestAnimationFrame(blur)
              else blurDone()
            }

            requestAnimationFrame(blur)
            function blurDone()
            {
              elem.remove()
              cursors.delete(id)
            }
          }

          public update(eventJson)
          {
            if(this.pointerType != eventJson.pointerType)
              this.refreshCursor(eventJson)

            if(eventJson.pointerType === "touch" && this.animated==false)
                {
                  this.animated = true;
                  this.cursor!.animate(
                      [
                        { opacity: "0%", transform: "scale(1.2) translate(-50%, -50%)" },
                        { opacity:"100%", transform: "scale(0.95) translate(-50%, -50%)" },
                      ],
                      {
                        duration: 250,
                        fill: "both",
                        easing: "ease-out"
                      },
                    );
                }
              

if(false)
{
   const updatedPos = updateCursor(this.cursor!, eventJson)
            if(!updatedPos)
              return
            this.posX = updatedPos!.posX;
            this.posY = updatedPos!.posY;
            this.step =0;
            const duration=100
            let startTime = undefined

            if(this.updateInterval && startTime != undefined)
              {
                  cancelAnimationFrame(this.updateInterval)
                  startTime = undefined
                  this.lposX = this.cposX
                  this.lposY = this.cposY
              }
            // if(this.updateInterval)  
            //   {
            //     // this.lposX = updatedPos.posX;
            //     // this.lposY = updatedPos.posY;
            //     clearInterval(this.updateInterval)
            //   }

            if(true) { // interpolate cursor position
              
             const animatePosition = (timestamp) => {
             if(!updatedPos)
              return
              if(!startTime) startTime = timestamp;
              const elapsed = timestamp - startTime!;
              const t = Math.min(elapsed/duration, 1);
              

              this.cposX = this.lposX*(1-t) + this.posX*t;
              this.cposY = this.lposY*(1-t) + this.posY*t;
              this.cursorContainer!.style.left =  this.cposX+'px';
              this.cursorContainer!.style.top =  this.cposY+'px';
              



              if(t>=1)
              {
                startTime = undefined
                this.updateInterval = undefined
                this.lposX = updatedPos.posX;
                this.lposY = updatedPos.posY;
                // clearInterval(this.updateInterval)
                if(eventJson.pointerType == "touch")
                {
                  if(this.animTimeout)
                    clearTimeout(this.animTimeout)
                  this.animTimeout = setTimeout(() => {
                    this.animated = false;
                    this.cursor!.animate(
                      [
                        { opacity:"100%", transform: "scale(1) translate(-50%, -50%)" },
                        { opacity: "0%", transform: "scale(0.9) translate(-50%, -50%)"  },
                      ],
                      {
                        duration: 250,
                        fill: "both",
                        // easing: "ease-out"
                      },
                    );
                  }, 2*duration);
                  
                }
            }
            else 
            this.updateInterval = requestAnimationFrame(animatePosition)
          
              }

              

              if(startTime == undefined)
                this.updateInterval = requestAnimationFrame(animatePosition)
            }
            else
            {
              this.cursorContainer!.style.left = this.posX+'px';
              this.cursorContainer!.style.top = this.posY+'px';
            }
}
    else
    {
      
            const updatedPos = updateCursor(this.cursor!, eventJson)
            if(!updatedPos)
              return
            this.posX = updatedPos.posX;
            this.posY = updatedPos.posY;
            this.step =0;
            const stepSize=1
            if(this.updateInterval)  
              {
                this.lposX = this.cposX;
                this.lposY = this.cposY;
                clearInterval(this.updateInterval)
              }

            if(false) { 
              // interpolate cursor position
              if(!updatedPos)
              return
             this.updateInterval = setInterval(() => {
              
              this.cposX = this.lposX*(1-this.step) + this.posX*this.step;
              this.cposY = this.lposY*(1-this.step) + this.posY*this.step;
              this.cursorContainer!.style.left = this.cposX+'px';
              this.cursorContainer!.style.top = this.cposY+'px';
              this.step+=1/stepSize;
              if(this.step>=1)
              {
                this.lposX = updatedPos!.posX;
                this.lposY = updatedPos!.posY;
                clearInterval(this.updateInterval)
                if(eventJson.pointerType == "touch")
                {
                  if(this.animTimeout)
                    clearTimeout(this.animTimeout)
                  this.animTimeout = setTimeout(() => {
                    this.animated = false;
                    this.cursor!.animate(
                      [
                        { opacity:"100%", transform: "scale(1) translate(-50%, -50%)" },
                        { opacity: "0%", transform: "scale(0.9) translate(-50%, -50%)"  },
                      ],
                      {
                        duration: 250,
                        fill: "both",
                        // easing: "ease-out"
                      },
                    );
                  }, 250);
                  
                }
              }
                
            }, stepSize)}
            else
            {
              this.cursorContainer!.style.left = this.posX+'px';
              this.cursorContainer!.style.top = this.posY+'px';
              
              
              if(eventJson.pointerType === "touch")
                  {
                    if(this.animTimeout)
                      clearTimeout(this.animTimeout)
                    this.animTimeout = setTimeout(() => {
                      this.animated = false;
                      this.cursor!.animate(
                        [
                          { opacity:"100%", transform: "scale(1) translate(-50%, -50%)" },
                          { opacity: "0%", transform: "scale(0.9) translate(-50%, -50%)"  },
                        ],
                        {
                          duration: 250,
                          fill: "both",
                          // easing: "ease-out"
                        },
                      );
                    }, 250);
                    
                  }
              
            }

    }       

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
  MouseUpdate = "MouseUpdate",
  WebCam = 'webcam',
  Canvas = 'canvas',
  RTC = 'rtc',
  Utilities = 'utils',
  Debug = 'debug',
}

export enum ConsoleMessageType {
  UserChat = "chat",
  Error = "error",
  Info = "information",
  Debug = "debug",
  SessionInfo = "session",
  Output = "output",
  DebugProgram = "debugProgram",
  Notification = 'notification',
  Console = 'console'
}

interface SessionInfo  {
  code: string;
  img: any;
  
}

class SessionClient {
  cursor: EditorCursor | undefined;
  typingIndicator: HTMLDivElement | undefined;
  editorSession: FileEditorSession[] = []
  clientId: UUID;
  color;
  displayName;
  canEdit: boolean
  sessionIcon: HTMLElement
  rtcConnection: IIWebRTC | undefined
  isHost: boolean
  constructor(clientId, displayName, color, canEdit, userId: number | undefined, isLocal, clientIsHost: boolean) {
    this.clientId = clientId;
    this.color = color;
    this.displayName = displayName;
    this.canEdit = canEdit
    this.isHost = clientIsHost

    this.sessionIcon = createNode('div', {
      onclick: function (ev: MouseEvent) {
        for(const child of (this as any).parentElement.children)
          if(child != (this as any))
            child.classList.remove('open');
              (this as any).classList.toggle('open'); },
            className: 'client-container' + (isLocal ? ' localClient' : ''),
            attributes: [{name: 'style', value: '--userColor: #'+color}],
            html: [
              createNode('img', {attributes: [{name:  'src', value: userId ? '/user/picture/'+userId : '/user/upload/default.png'}]}),
              createNode('div', {className: 'session-client-menu', html: [
                createNode('div', {html: [
                  
                    createNode('a', {htmlSting:  `<h3>${this.displayName}${isLocal ? ' (Tu)' : ''}<div class='img-placeholder'></div>"</h3>`,
                    attributes: [userId ? {name: 'href', value: '/profile'} : undefined],
                    onclick: async ev => 
                      {if(userId || !isLocal)
                        return
                      const displayName = await displayInputPopup('Schimba-ti numele')
                      if(displayName.value)
                      {
                        document.cookie = 'savedName='+displayName.value
                        // params.set('displayName', displayName.value)
                      }
                    }}),
                    createNode('p', {innerText: isHost && this.isHost ? 'Tu esti proprietarul acestei sesiuni!' :  this.isHost ? `${this.displayName} este proprietarul acestei seiuni` : this.canEdit ? 'Poate edita' : 'Nu poate edita'}),
                    !isLocal && isHost ? createNode('button', {innerText: 'Scoate din sesiune'}) : undefined,
                ]})
              ] 
          // `
          // <div>
          //   ${isLocal ? '<a href="/user/profile">' : ''}<h3>${this.displayName}${isLocal ? ' (Tu)' : ''}<div class='img-placeholder'></div></h3>${isLocal ? '</a>' : ''}
          //   <lable>${this.canEdit ? 'Poate edita' : 'Nu poate edita'}</lable>
          //   ${!isLocal ? `<button>Scoate</button>` : ''}
          // </div>
          // `
        }),
        createNode('div', {innerText: isLocal ? '(Tu)' : this.displayName, className: 'tooltip-clientName'})
      ]})
    document.getElementById('sessionInfo-container')?.appendChild(this.sessionIcon)

  }
  public onJoin()
  {

  }
  public onDisconect()
  {

    for(const session of this!.editorSession!)
    {
      session.fileElement?.removeUser(this.clientId)
      if(cursorManagers.has(session.editor!.id))
        cursorManagers.get(session.editor!.id)!.removeCursor(this.clientId);
      else
        console.error('invalid cursor manager')
    }

    cursors.get(this.clientId)?.remove()

    rtc.get(this.clientId)?.close()
    rtc.delete(this.clientId)
    this.sessionIcon.remove()

  }
}

// VARIABLES //
export let client: SessionClient | undefined;
export let clients: Map<UUID,SessionClient> = new Map()
const cursors: Map<string, EditorCursor> = new Map()
const typingIndicators: Map<UUID,HTMLDivElement> = new Map();
let debounceTimer: NodeJS.Timeout;
let typingIndicatorDelay = 1000;
let activeElem: Element;
const variableStore = new Map<string, Variable>();
let code;
let debugLine = 1; // debug row
let lastDebugId: any;
let lastViewedMessage: number;
let currentFileName: string | undefined;
let wsClientId: UUID;
let wsSessionId: UUID;
let isHost: boolean = false;
let ClientOptions: {canChat:boolean, canEdit: boolean, canVoice: boolean}
const outputArea = document.getElementById("output");
let testSubjectArea: HTMLIFrameElement;
let activeClientArea = outputArea!
const outputConsoles: Console[] = [];
let activeConsole: Console|undefined;
let contextMenu: HTMLDivElement;
let debugWindow: DebugWindow
let isColabSession=true;
let lastEventJson;
let session: SessionInfo | undefined;
let cmdId = 0;
let variables: any[] = [];
let canvas: EditorCanvas | undefined
let cameraEnabled = false;
let videoStream: MediaStream
const variableArrayIndexes: number[] = [];
export const editorSessions: Map<string, FileEditorSession> = new Map<
  string,
  FileEditorSession
>();
const ClientDock = inIframe ? undefined : new Toolbox() //Dock()
const DockElement = inIframe || !ClientDock ? undefined : ClientDock.render() 
let microphone: HTMLElement | undefined
let microphonePaused: boolean = true;
if(DockElement)
  document.getElementsByClassName('container')[0].appendChild(DockElement)

let rtc: Map<UUID, IIWebRTC> = new Map()


type DebugVariable = string | number | Array<string | number | object> | object


class DebugWindow {
  procVariables: Map<string, DebugVariable> = new Map()
  mainContainer: HTMLDivElement 
  varList: HTMLUListElement
  constructor() {
    this.varList = createNode('ul')
    this.mainContainer = createNode('div', {html: [this.varList], className: 'debug-container'})
  }

  public updateVariables(variables: {name: string, value: string}[])
  {
    if(!variables)
      return;

    this.procVariables = new Map()

    for(const variable of variables)
    {
      let value: DebugVariable = variable.value
      if(variable.value.startsWith('{') && variable.value.endsWith('}'))
      {
        // is an array
        const valString = variable.value.substring(1, variable.value.length-1)
         if(valString.endsWith('...'))
          value = valString.substring(0, valString.length-3)
        else 
          value = valString

        value = value.split(',').map(val => val.trim().replaceAll('<', '&lt;').replace('>', '&gt;'))
      
      }
       
      this.procVariables.set(variable.name, value)
    }

    this.displayVariables()
  }

  private displayVariables()
  {
    const vars: HTMLElement[] = []
    for(const [varName, varVal] of this.procVariables.entries())
    {
      if(Array.isArray(varVal))
        vars.push(createNode('li', {htmlSting: `${varName}: <div class="array-container">${varVal.map(val => `<span>${val}</span>`).join(' ')}</div>`}))
      else
        vars.push(createNode('li', {htmlSting: `${varName}: <div class="value-container">${varVal}</div>`}))
    }
    this.varList.replaceChildren(...vars)
  }
}

class CodeWindow extends EditorWindow {

  

  constructor()
  {
    
    super(0, document.getElementById("editor-container"), document.getElementById("editor-tabs-container"), document.getElementById("code-window-container"))

    // this.editor = ace.edit("editor", {
    //   mode: "ace/mode/c_cpp",
    //   enableLiveAutocompletion: true,
    //   enableBasicAutocompletion: true,
    //   enableSnippets: true,
    //   placeholder: "scrie niste cod...",
    //   tooltipFollowsMouse: true,
    //   animatedScroll: true,
    //   useWorker:true,
    //   //   fontSize: "18px",
    //   //maxLines: 30,
    //   wrap: true,
    //   autoScrollEditorIntoView: true,
    //   enableCodeLens: true,
    // });


    // this.initializeEditor()
    
  }


}

const codeWindow = new CodeWindow()
const chatWindow = new EditorWindow(1,document.getElementById('output-container'), document.querySelector('#output-container .editor-tabs-container .file-scroller'), document.querySelector('#output-container #client-area-body'))

chatWindow.addTab(function () {
  const chatTab = new EditorWindowTab('chat', createNode('span', {className: "file-tab", html: [createNode('p', {innerText: "Chat"})]}), document.getElementById('output') as HTMLElement, chatWindow)
  chatTab.openTab()
  return chatTab
}())

// chatWindow.addTab(new EditorWindowTab('chat', createNode('a', {className: "file-tab", innerText: "Subiecte"}), createNode('iframe', {css: 'width: 100%; height: 100%; border: none', attributes: [{name: 'src', value: '/subiecte'}]})))
export const windows = [codeWindow, chatWindow]





var event = ace.require("ace/lib/event");
var Range = ace.require("ace/range").Range;
var Tooltip = ace.require("ace/tooltip").Tooltip;
// Initialize the manager


let msgId: number = 0;
type CursorPosition = { row: number; column: number };


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

  const regex = /(\w+)\s*:\s*(.*?)(?=\s+\w+\s*:|$)/g;

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


function parseMIDebuggerOutput(
  input: Record<string, string>,
  {
    onNewVariable = (newVar: Variable) => {},
    onArrayIndexChange = (
      name: string,
      change: { index: number; old: any; new: any },
      changed: boolean
    ) => {},
  } = {}
) {
  const cleanedInput: any = input

  const regex = /(\w+)\s*:\s*(.*?)(?=\s+\w+\s*:|$)/g;

  let match;
  for(const variable of cleanedInput.variables) {
    const name = variable.name;
    const rawValue = variable.value;

    let type: "string" | "int" | "array" = "string";
    let value: string | number | any[] = rawValue; // might be broken

    // Parse arrays
    if (Array.isArray(rawValue)) {
      type = "array";
      //const inner = //rawValue.slice(1, -1).trim();
      const array: number[] = rawValue//[];

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



// ace.config.setModuleUrl('ace/mode/c_cpp_worker', 'cpp_worker.js');
// ace.config.setModuleUrl('ace/mode/c_cpp_custom', 'mode_cpp_custom.js');





// window.onload = function() {
//   //  document.querySelector('#editor textarea')?.setAttribute('inputmode', 'none')
//   const ddd = document.querySelector('.ace_text-input');
//   if(!ddd)  return;
//   writeOutput(window.getComputedStyle(ddd).fontSize)
// }


export let isRemoteChange = false; // used for colaborative changes
let marker: number; //selection marker
// const renderer = codeWindow.getEditor().renderer;
// Define the type or class for ghostManager
interface GhostManager {
  clear: () => void;
  add: (variableName: string, value: string) => void;
}

// Initialize ghostManager with the correct type
// const ghostManager: GhostManager = new (class implements GhostManager {
//   constructor(private editor: any) {}
//   clear() {
//     // Implementation for clearing ghost markers
//   }
//   add(variableName: string, value: string) {
//     // Implementation for adding ghost markers
//   }
// })(codeWindow.getEditor());

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


export function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
      c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
      }
  }
  return "";
}



const byteSize = (str: string) => new Blob([str]).size;
function checkIsOpen(id)
{
  if(openMenu)
      if(openMenu.menuid == id)
        return true
}
function onOpenMenu(id:string, elem?): boolean
{
  if(!id)
    throw 'invalid id on open menu.'

  if(openMenu)
    openMenu.remove()
  if(elem)
  {
    
    openMenu = elem
    openMenu.menuid = id
    
  }
  else
    openMenu = null
  return false
}

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

    // popup.innerHTML = `<button class="client-popup-close"></button><div>${innerHTML}</div>`;
    const close = createNode('button', {className: 'client-popup-close'})
    close.onclick = () => {
      popup.remove()
     }
    popup.appendChild(close)
    popup.appendChild(createNode('div', {htmlSting: innerHTML}))
    document.body.appendChild(popup)

    setTimeout(() => {
      popup.remove();
    }, 1000*5);
  }

  createPopup('', `
    <p>${message}</p>
    
    `)
}

function createPopup(classList: string, seconds,innerHTML: HTMLElement[], keepVisible:boolean=false)
{
  function addPopup()
  {
    const popup = createNode('div', {className: 'client-popup '+classList, html: innerHTML})
    document.body.appendChild(popup)
    return popup
  }
  if(keepVisible)
  {
    if(!innerHTML) return;
    return addPopup()
  }
    else
  return new Promise<HTMLElement>((resolve, reject) => {
   if(!innerHTML) return;
    const popup = addPopup()

    setTimeout(() => {
      popup.animate([
        { opacity:"100%", transform: "scale(1) translate(-50%, -50%)" },
        { opacity: "0%", transform: "scale(0.9) translate(-50%, -50%)"  },
      ],
      {
        duration: 500,
      }).addEventListener('finish', () =>
      {
        popup.remove();
        reject(popup)
      })
      
    }, 1000*seconds);
  })
}


export function displayConfirmPopup(message, confirmText='Accept', rejectText='Cancel')
{
  let popup;
  const promise = new Promise<{value: boolean, popup?: HTMLElement}>((resolve, reject) => {
    
    popup = createPopup('', 10, [
      createNode('button', {innerText: confirmText, onclick: (ev) => resolve({value:true, popup: ev.target.parentElement})}),
      createNode('button', {innerText: rejectText, onclick: (ev) => resolve({value:false, popup: ev.target.parentElement})}),
      createNode('p', {innerText: message})
    ])
    popup.catch(err => {
      resolve({value: false, popup: undefined})
    })
  })
  promise.then(res => {
    if(res.popup)
    res.popup.animate([
        { opacity:"100%", transform: "translate(-50%, -50%)"},
        { opacity: "0%",  transform: "translate(-50%, 0%)"},
      ],
      {
        duration: 250,
        // easing: "ease-out"
      }).addEventListener('finish', () =>
      {
        res.popup!.remove();
      })
  })
  return promise;
  
}

export function displayInputPopup(message, placeholder='')
{
  let popup;
  const promise = new Promise<{ok:boolean, value?: string, popup?: HTMLElement}>(async (resolve, reject) => {
    
    popup = createPopup('input-popup', 10, [
      
      createNode('button', {innerText: 'x', onclick: () => {resolve({ok: false})}}),
      createNode('p', {innerText: message}),
      createNode('input', {attributes: [{name: 'type', value: "text"}, {name: 'placeholder', value: placeholder}], onchange(ev) {
        resolve({ok: true, value: ev.target.value})
      },}),
      
    ], true)
    
  })
  promise.then(() => {
    // if(popup)
    popup.animate([
        { opacity:"100%", transform: "translate(-50%, -50%)"},
        { opacity: "0%",  transform: "translate(-50%, 0%)"},
      ],
      {
        duration: 250,
        // easing: "ease-out"
      }).addEventListener('finish', () =>
      {
        popup!.remove();
      })
  })
  return promise;
  
}

function getStreamVolume(stream: MediaStream, updateFreq = 50, volumeCallback: (volume) => void)
{
 const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.minDecibels = -127;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.4;
    audioSource.connect(analyser);
    const volumes = new Uint8Array(analyser.frequencyBinCount);
     setInterval(() => {
      analyser.getByteFrequencyData(volumes);
      let volumeSum = 0;
      for(const volume of volumes)
        volumeSum += volume;
      const averageVolume = volumeSum / volumes.length;
      // Value range: 127 = analyser.maxDecibels - analyser.minDecibels;

      volumeCallback(averageVolume)
  }, updateFreq)
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



const namePrompt = document.getElementById("name-prompt");
const consoleInput = document.getElementById("console") as HTMLTextAreaElement;

if(new URLSearchParams(window.location.search).has('save'))
  document.getElementById('saveProject')?.classList.add('saved')


// export function onMarkerUpdate(marker:any, elem: HTMLDivElement)
// {
 
// }

var beautify = ace.require("ace/ext/beautify"); // get reference to extension

function bufferToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export function toggleCamera() {
  cameraEnabled = !cameraEnabled
  if(!cameraEnabled)
  {
    // videoStream.getTracks[0].stop()
    if(!videoStream)
      return
    const tracks = videoStream.getTracks();
    
    tracks.forEach((track) => {
      track.stop();
    });
    document.getElementById('camera-video')?.remove()
    document.getElementById('camera-canvas')?.remove()
  } else
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      videoStream = stream;
      const video = document.createElement('video')
      video.width= 640;
      video.height= 480;
      document.body.appendChild(video)
      video.srcObject = stream;
      const canvas = document.createElement('canvas');
      video.id = 'camera-video'
      canvas.id = 'camera-canvas'
      canvas.width = 640;
      canvas.height = 480;
      video.play()
      const ctx = canvas.getContext('2d')!;
      ws.send(JSON.stringify({type: WebSocketMessageType.WebCam, started: true}));
      setInterval(() => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // ws.send(JSON.stringify({type: WebSocketMessageType.WebCam, buffer: dataURL}));
        canvas.toBlob(blob => {
          if (blob) {
            blob.arrayBuffer().then(buffer => {
              const base64 = bufferToBase64(buffer);
              ws.send(JSON.stringify({type: WebSocketMessageType.WebCam, buffer: base64}));
            });
          }
        }, 'image/jpeg', 0.7);
      }, 100); // every 100ms
    });
}

export function beautifyEditor() {
   
    if(codeWindow.editor)
      beautify.beautify(codeWindow.editor.session);

      
}
export function undo() {
      codeWindow.getEditor().session.getUndoManager().redo(codeWindow.getEditor().session)
}
export function redo() {
      codeWindow.getEditor().session.getUndoManager().undo(codeWindow.getEditor().session)
}


function getPointerRelativePosition(window: EditorWindow, x, y) {
  const rect = window.editor!.container.getBoundingClientRect();
  // Normalize mouse coordinates within editor container
  const relX = (x - rect.left + window.element.scrollLeft)  // / rect.width;
  const relY = (y - rect.top + window.element.scrollTop) // / rect.height;
  return { relX, relY, rect}; // values from 0 to 1
}

function getPixelFromRelativePosition(editor: Ace.Editor, relX, relY, eventJson) {
  // const rect = editor.container.getBoundingClientRect();
  const rectWidth = editor.renderer.characterWidth
  const rectHeight = editor.renderer.lineHeight
  const rect = editor.container.getBoundingClientRect(); 
  const x = rect.left - (rectWidth - eventJson.rectWidth)*2 - editor.renderer.scrollLeft + relX   * ( rectWidth / eventJson.rectWidth   ) ; // * eventJson.rect.width
  const y = rect.top -  editor.renderer.scrollTop + relY  * ( rectHeight / eventJson.rechHeight  ) ; // * eventJson.rect.height

  return { x, y, rect};
}

//  TODO Web RTC cursors for better performance
function updateLocalCursor(ev: PointerEvent, fromPress) {
  const deltaTime = 20;
  // if(fromPress && ev.pointerType != "touch") return; // i can remove this and add a few things to show when a user is clicking
  if(ev.timeStamp-lastTime>deltaTime)
    {
     lastEv = ev;
      lastTime = ev.timeStamp
     
      const posX = ev.pageX;
      const posY = ev.pageY;

      for(const checkCursor of cursors.values())
        if(getDistanceFromPosition(checkCursor.cursorContainer!, posX, posY)<100)
        {
          // if(checkCursor.cursor?.checkVisibility)
          // rtc.get(checkCursor.id)!.audio.volume =  Math.floor(Math.min(100-getDistanceFromPosition(checkCursor.cursorContainer!, posX, posY)/2, 100)*2)/2/100 ;
          (checkCursor.nameElement! as HTMLSpanElement).style.opacity = Math.min(100-getDistanceFromPosition(checkCursor.cursorContainer!, posX, posY)/2, 100) + "%"
        }
          
        else
        {
          // rtc.get(checkCursor.id)!.audio.volume =  0 ;
           (checkCursor.nameElement as HTMLSpanElement).style.opacity = "0%"
        }
       
      const sizeX = document.body.clientWidth;
      const sizeY = document.body.clientHeight;
      const foundEditor = client?.editorSession.find(editor => editor.fileElement?.parentWindow.element === document.elementsFromPoint(posX, posY).find(val => val.classList.contains('ace_editor')))
      // if(!foundEditor)
      //   return console.error('Couldnt find editor while updating local cursor');
        
      const session =  foundEditor ? foundEditor : client?.editorSession[0] 
      if(!session || !session.fileElement)
        return
      const editor = session.fileElement.parentWindow.editor
      
      const pos =getPointerRelativePosition(codeWindow, posX, posY)

      const rectWidth = editor ? editor.renderer.characterWidth : undefined
      const rechHeight = editor ? editor.renderer.lineHeight : undefined
      const pointerType = ev.pointerType;
      if(pointerType != "mouse")
      {
        const height = ev.height;
        const width = ev.width;
        for(const conn of rtc.values())
          // if(clients.find(val => val.clientId == conn.thistargetId)?.editorSession?.fileName == client?.editorSession?.fileName)
        conn.send(JSON.stringify({type: WebSocketMessageType.MouseUpdate,
           posX, posY, sizeX, sizeY, pointerType, width, height, relPosX: pos.relX, relPosY: pos.relY,
            rect: pos.rect, rectWidth , rechHeight, clientId: wsClientId,
             openFile: windows.filter(window => window.activeTab && window.activeTab.content && (window.activeTab?.content as Ace.EditSession).doc != undefined).map(window => window.activeTab?.name)}))
      } else
        for(const conn of rtc.values())
          // if(clients.find(val => val.clientId == conn.thistargetId)?.editorSession?.fileName == client?.editorSession?.fileName)
        conn.send(JSON.stringify({type: WebSocketMessageType.MouseUpdate, posX, posY, sizeX, sizeY,
           pointerType, relPosX: pos.relX, relPosY: pos.relY, rect: pos.rect, rectWidth,
            rechHeight, clientId: wsClientId, openFile: windows.filter(fileWindow => fileWindow.activeTab && fileWindow.activeTab.content && (fileWindow.activeTab?.content as Ace.EditSession).doc != undefined).map(window => window.activeTab?.name)}))

    }
  }


function updateCursor(cursor: HTMLElement, eventJson)
  {
      const sizeX = document.body.clientWidth;
      const sizeY = document.body.clientHeight;
      let posX = 0;
      let posY = 0;
      const remSize: number = parseFloat(getComputedStyle(document.documentElement).fontSize)
      if(!codeWindow.editor)
        return
    const relPos = getPixelFromRelativePosition(codeWindow.editor!, eventJson.relPosX, eventJson.relPosY, eventJson);

    if(!(eventJson.openFile as string[]).some(name => windows.some(val => val.activeTab?.name == name)))
      cursor.style.display = 'none';
    else
      cursor.style.display = 'initial';

    if((sizeX/eventJson.sizeX<0.7 || sizeY/eventJson.sizeY<0.7 || sizeX/eventJson.sizeX>1.3 || sizeY/eventJson.sizeY>1.3) || true) // editor relative cursors
    {
      const scale = 5;
      const mask = Math.max((relPos.x - relPos.rect.width + relPos.rect.left - remSize)/scale + 10, (relPos.y - relPos.rect.height - relPos.rect.top + remSize)/scale + 10)
      if(mask*scale > -50)
      {
        cursor.style.filter = `blur(${mask/scale}px)` //(Math.max(Math.abs(sizeX/eventJson.sizeX), Math.abs(sizeY/eventJson.sizeY)))
        cursor.style.opacity = 150-(mask*scale)+"%"
        
        
      }
      else
      {
        cursor.style.opacity = "100%"
        cursor.style.filter = `blur(0px)` //(Math.max(Math.abs(sizeX/eventJson.sizeX), Math.abs(sizeY/eventJson.sizeY)))
        
      }
      if(mask*scale < 100)
      {
        posX =  relPos.x
        posY =  relPos.y
      }
        

    }
    else
    {
      posX = Math.min(sizeX-remSize, eventJson.posX* sizeX/eventJson.sizeX);
      posY = Math.min(sizeY-remSize, eventJson.posY* sizeY/eventJson.sizeY);
    }

    return {posX, posY}
  }

let lastTime=0;
let lastEv;
function addMouseListener(session: typeof ClientOptions)
{

  // TODO Maybe limit this only to the editor itself.

  if(session!=undefined && session.canEdit && session.canChat)
    document.onpointermove = (ev) => updateLocalCursor(ev, false)
  document.onpointerdown = (ev) => {
  //   ws.send(JSON.stringify({type: WebSocketMessageType.MouseUpdate, pointerType:  ev.pointerType}))
    updateLocalCursor(ev, true)
  }
  // document.onpointerdown = (ev) => {
  //   ws.send(JSON.stringify({type: WebSocketMessageType.MouseUpdate, pointerType:  ev.pointerType}))
  //   updateLocalCursor(ev, true)
  // }

}


/* IMPORTS */
// FileManagement.ts
const FileContainer = document.getElementById(
  "editor-tabs-container"
) as HTMLDivElement;
if (!FileContainer) console.error("Couldn't find file container!");


function deleteFile(fileName: string, remote?:boolean) {
  if(!editorSessions.has(fileName)) return false;
  editorSessions.get(fileName)?.fileElement?.remove()
  if(!remote)  
    ws.send(JSON.stringify({
      type: WebSocketMessageType.FileManagement,
      command: FileManagementCommands.Delete,
      name: fileName,
    }));

  if(currentFileName == fileName)
    displayBlankEditor(editorSessions.get(fileName)?.fileElement?.parentWindow.index);
  editorSessions.delete(fileName)
  return true;
}

function getFileValue(fileName: string): Promise<string>
  {
    
    return new Promise((resolve, reject) => {
      fetch('editor/'+wsSessionId+'/file/'+fileName).then(res => {
      res.text().then(text => {
        resolve(text);
      }).catch(err => {
        reject(err)
      })
    })
    })
    
  }



export function displayBlankEditor(index)
{
  currentFileName = '';
  client?.editorSession[index].editor!.setValue('Create a new file!')
  client?.editorSession[index].editor!.setMode('txt')
}

function renameFile(fileName: string, newName?: string) {
  return new Promise<void>((resolve, reject) => {

  
  if(!editorSessions.has(fileName)) return false;
  if(newName)
  {
    codeWindow.getEditor().session.setMode(aceModes.getModeForPath(newName).mode);
    editorSessions.get(fileName)!.fileElement!.nameElement.innerText = newName;
    if(!editorSessions.get(fileName) || editorSessions.has(newName))
      return;
    editorSessions.get(fileName)!.fileElement!.name = newName
    editorSessions.get(fileName)!.fileName = newName
    const index = client!.editorSession.findIndex(val => val.fileName == fileName)
    client!.editorSession[index]! = editorSessions.get(fileName)!
    editorSessions.set(newName, editorSessions.get(fileName)!)


    // editorSessions.get(fileName)?.fileElement?.Users.forEach(user => {
    //   clients.get(user.id)?.editorSession 
    // })
    
    editorSessions.delete(fileName)
    resolve()
  }
    
  else
  { 
     editorSessions.get(fileName)!.fileElement!.fileElem.style.display = 'none';
    awaitFileNamePrompt(fileName).then(name => {
      
      editorSessions.get(fileName)!.fileElement!.fileElem.style.display = '';
      // editorSessions.get(fileName)!.fileElement!.fileElem.innerText = name; 
      codeWindow.getEditor().session.setMode(aceModes.getModeForPath(name).mode);
      ws.send(JSON.stringify({
        type: WebSocketMessageType.FileManagement,
        command: FileManagementCommands.Rename,
        name: fileName,
        newName: name
      }));
      resolve()
    })
  }
})

}
interface User {
    name,
    color,
    id,
    elem?,
  }

class FileElement extends EditorWindowTab
{
  public Users: User[] = [];
  fileElem: HTMLSpanElement
  usersContainer: HTMLDivElement
  animOptions = {duration: 200, easing: "ease-in"}
  nameElement
  constructor(fileName:string, session: HTMLElement | Ace.EditSession | undefined, index?: number) {
    const nameElement = createNode('p', {innerText: fileName})
    super(fileName, createNode('span', {className: "file-tab", html: [nameElement]}),  session,[codeWindow, chatWindow][index!=undefined ? index : 0])
    this.nameElement = nameElement
    this.fileElem = this.element  //document.createElement("span"); 
    // this.fileElem.className = "file-tab";
    // this.fileElem.innerText = fileName;
    
    // this.fileElem.onclick = () => {
    //   openFile(fileName);
    // };

    this.fileElem.oncontextmenu = (ev) => {
      ev.preventDefault()
      if(contextMenu)
        contextMenu.remove()
      contextMenu = document.createElement('div')
      const deleteButton = document.createElement('button')
      deleteButton.innerText = "Delete"
      deleteButton.onclick = () => {
        deleteFile(fileName)
        contextMenu.remove();
      }
      contextMenu.appendChild(deleteButton);
      const renameButton = document.createElement('button')
      renameButton.onclick = () => {
        renameFile(fileName)
        contextMenu.remove();
      }
      renameButton.innerText = "Rename"
      contextMenu.appendChild(renameButton);
      
      contextMenu.appendChild(createNode('button', {innerText: 'Transpile', onclick: () => {
        displayMessagePopup('Schimba extensia fisierului pentru a transpila codul.')
        editorSessions.get(fileName)!.fileElement!.fileElem.style.display = 'none';
        awaitFileNamePrompt(fileName).then(name => {
          
          editorSessions.get(fileName)!.fileElement!.fileElem.style.display = '';
          ws.send(JSON.stringify({type: WebSocketMessageType.Utilities, util: 'transpile', target: name.split('.').at(-1), fileName}))
        })
      }}))
      contextMenu.id = 'context-menu'
      contextMenu.style.position = 'absolute'
      contextMenu.style.top = ev.y + "px";
      contextMenu.style.left = ev.x + "px";
      document.body.appendChild(contextMenu)
      contextMenu.onmouseleave = (ev) => {
        contextMenu.remove()
      } 
    }

    FileContainer.appendChild(this.fileElem);
    this.usersContainer = this.fileElem.appendChild(createNode('div', {className: "file-users-container"}))
    this.fileElem.appendChild(this.usersContainer)
  }
  public getDragText = () =>
  {
    return editorSessions.get(this.name)?.editor?.getValue()
  }
  
  public openTab(ev: MouseEvent): void {

    
    openFile(this.name);
  }
  addUser(user: User, lastFileName)
  {
    const existingUser = this.Users.findIndex((value) => user.id == value.id)
    if(existingUser != -1)
      return console.warn('User already exists on file element.')
    
    const elem = createNode('div', {css: 'background-color: #'+ user.color});
    this.Users.push({...user, elem})
    this.usersContainer.appendChild(elem)
    // TODO fix this
    // if(lastFileName != undefined || user.id != wsClientId)
    elem.animate([{flexGrow: '0'}, {flexGrow: '1'}], this.animOptions)
    // requestAnimationFrame(() => elem.style.flexGrow = "1")
  }
  removeUser (userId: UUID)
  {
    const user = this.Users.findIndex((value) => userId === value.id)
    if(user == -1)
      return console.warn('Couldnt remove user on file element.')
    const elem: HTMLElement = this.Users[user].elem;
    this.Users.splice(this.Users.findIndex((value) => userId === value.id), 1) // i got stuck for a day because of this 1
    elem.animate([{flexGrow: '1'}, {flexGrow: '0'}], this.animOptions).addEventListener('finish',
    () => {
      elem.remove()
    })
    

  }
  public remove()
  {
    // TODO make sure parent class remove is called
    this.fileElem.remove()
  }
  
}

function onFileCreate(fileName: string, index=0) {
  // const command = JSON.parse(messageBodyJson);

  // const fileName = command.content;
 
  // const index = 0;
  try {
    if(editorSessions.has(fileName))
  {
    const session = editorSessions.get(fileName)!;
    if(!session.editor)
      throw 'session doesnt have editor session'
    const file = new FileElement(fileName, session.editor, index)
    //open newly created file
   

    if(!session.fileElement)
     {
        const newSession: FileEditorSession =
        {
          editor: session.editor,
          fileName: session.fileName,
          fileElement: file
        }
       
        editorSessions.set(fileName,newSession);
        if(client)
          client!.editorSession![file.parentWindow.index] = newSession
     }

      if(namePrompt?.innerText == fileName)
    {
        openFile(namePrompt.innerText);
        namePrompt.innerText = "";
    }
  }
  else
  {
    const file = new FileElement(fileName, undefined, index)
    //open newly created file
   

    const newSession: FileEditorSession =
    {
      editor: undefined,
      fileName: fileName,
      fileElement: file
    }

    
    editorSessions.set(fileName, newSession);
    if(client)
      client!.editorSession![index] = newSession

     if(namePrompt?.innerText == fileName)
    {
        openFile(namePrompt.innerText);
        namePrompt.innerText = "";
    }
  }
     
  }
  catch(err)
  {
    console.error(err)
  }
  
    closeDefaultScreen(editorSessions.get(fileName)?.fileElement)
      

  



  // FileContainer.innerHTML += `<span>${fileName}</span>`
}



export function createFileNamePrompt() {
  if (!namePrompt) return;
  //prep name prompt
  namePrompt.style.display = "";
  namePrompt.innerText = "";
  namePrompt.focus();
  namePrompt.onblur = () => {
    namePrompt.style.display = "none";

      namePrompt.removeEventListener("keypress", handleEnterKey);
  }

  function handleEnterKey(this: HTMLElement, e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();

      createFile(this.innerText);
      // setTimeout(() => {
       
      // }, 300);

      this.style.display = "none";

      this.removeEventListener("keypress", handleEnterKey);
    }
  }
  const enterListener = namePrompt.addEventListener("keypress", handleEnterKey);
}


export function awaitFileNamePrompt(fileName = '') {
  return new Promise<string>((resolve, reject) => {
      if (!namePrompt) return;
    namePrompt.style.display = "";
    namePrompt.innerText = fileName;
    namePrompt.focus();

    namePrompt.onblur = () => {
    namePrompt.style.display = "none";

      namePrompt.removeEventListener("keypress", handleEnterKey);
  }

  
    function handleEnterKey(this: HTMLElement, e: KeyboardEvent) {
      if (e.key === "Enter") {
        e.preventDefault();
        resolve(this.innerText)
        this.style.display = "none";
        this.innerText = "";
        this.removeEventListener("keypress", handleEnterKey);
      }
    }
    const enterListener = namePrompt.addEventListener("keypress", handleEnterKey);
  })
  
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
      console.classList.add('filled');

        
      ws.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping, status: "start"}))

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        ws.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping, status: "end"}))

      }, Math.min(console.value.length*10+typingIndicatorDelay, 3000));

      

    } 
    else 
        console.classList.remove('filled');

    if(console.value.includes('\n'))
      {
        console.style.height = `auto`;
         console.classList.add('multiline');
        console.style.height = `${console.scrollHeight}px`;
      }
    else {
       console.style.height = ''
        console.classList.remove('multiline');
    }
    
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
        // namePrompt.style.display = "";
        // namePrompt.innerText = "";
        // namePrompt.focus();
        // function handleEnterKey(this: HTMLElement, e: KeyboardEvent) {
        //   if (e.key === "Enter") {
        //     e.preventDefault();
      
        //     fetch('/user/saveProject', {
        //       method: "POST",
        //       headers: {'Content-Type': 'application/json'},
        //       body: JSON.stringify({name: namePrompt?.innerText, sessionId: wsSessionId})
        //     }).then(response => {
        //       if(!response.ok)
        //         if(response.status === 401)
        //           displayMessagePopup('Please log in!')
                
        //       // save was sucsessfull
        //       document.getElementById('active-project-name') ?.classList.remove('dirty')
        //       modifiedFile = false;
              
        //     })
        //     .catch(err => {

              
        //       displayMessagePopup(err);
        //     })
      
        //     document.getElementById('saveProject')?.classList.add('saved')
      
        //     this.style.display = "none";
        //     this.innerText = "";
        //     this.removeEventListener("keypress", handleEnterKey);
        //   }
        // }
        // const enterListener = namePrompt.addEventListener("keypress", handleEnterKey);
          fetch('/user/saveProject', {
              method: "POST",
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({sessionId: wsSessionId, projectId: new URLSearchParams(location.search).get('save')})
            }).then(async response => {
              if(!response.ok)
                if(response.status === 401)
                  displayMessagePopup('Please log in!')

                
               
                

                const json = await response.json()
                if(!json.isNew)
                {
                  modifiedFile = false;
                  document.getElementById('saveProject')?.classList.add('saved')
                } else
                displayInputPopup('Ce nume vrei sa aiba proiectul tau?', 'nume').then(res => {
                  if(!res.ok)
                    return
                    fetch('/user/saveProject', {
                        method: "POST",
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({name: res.value, sessionId: wsSessionId})
                      }).then(async res => {
                        if(!response.ok)
                            return displayMessagePopup('A aparut o problema...')
                        return await res.json()
                        })
                      .then(response => {
                        
                          
                        // save was sucsessfull
                        document.getElementById('active-project-name') ?.classList.remove('dirty')
                        modifiedFile = false;
                        document.getElementById('saveProject')?.classList.add('saved')
                        window.history.pushState({page: "updated save info"}, "intelege info", window.location.search + (window.location.search ? "&" : "?" ) + "save="+response.projectId)

                      })
                      .catch(err => {
                        displayMessagePopup(err);
                      })
                    
              
                    
          })
        })
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
  if(checkIsOpen('projects'))
    return onOpenMenu("projects")
  if(!wsSessionId) return;
  fetch('/user/listProjects', {
    method: "GET",
    headers: {'Content-Type': 'application/json'},
  }).then(response => response.json()).catch(err => {})
  .then(projects => {

    // if(data.error) throw 'unauth'
    try {
  if(!projects) throw "invalid data"
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
      onOpenMenu("projects")
    }
    closeButton.innerText = 'x';
    container.appendChild(closeButton)
    const currentSaveId = new URLSearchParams(window.location.search).get('save')
    // displayMessagePopup(JSON.stringify(data.projects))
    const listcontainer = document.createElement('ul')
    listcontainer.classList.add('project-list')
    for(const project of projects as Project[])
    {
      const projectElem = listcontainer.appendChild(document.createElement('li'))
      const button = projectElem.appendChild(document.createElement('button'))
      const deleteProject = projectElem.appendChild(document.createElement('button'))
      deleteProject.innerText = 'x';
      deleteProject.classList.add('remove-proj')
      deleteProject.onclick = () => {
        displayConfirmPopup('Vrei sa stergi acest proiect?', 'Șterge', 'Anulează').then(res => {
          if(res.value)
             fetch('../user/removeproject?id='+project.id).then(res => {
              if(res.ok)
                projectElem.remove();
            })
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
    onOpenMenu("projects",container)

  })
  // .catch(err => {
  //   displayMessagePopup('nigger ' + err)
  // })
}


// END DOCUMENT FUNCTIONS //

// standardise the json
export function sendWebsocketCommand(cmd: string, argsArr: string[] = []) {
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

function writeOutput(data: string, message?: any,manuallScroll?, manualMessageType?: ConsoleMessageType) {
  if (outputArea) {
    const msgText = data
    let textArea;
    if (message && message.messageType) {
      const localmsgId = (message.id as number) || -1;
      msgId = localmsgId;
      if (message.id === -1)
        console.error(new Error("invalid message id: " + message));
      const messageType = manualMessageType? manualMessageType : message.messageType;
      const messageClientId = message.clientId;
      
      if(activeConsole)
      {
         textArea = activeConsole.element.getElementsByTagName('pre')[0]
        if(!textArea)
        {
          textArea = createNode('pre')
          activeConsole.element.prepend(textArea)
        }
      }
      
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
            outputArea.innerHTML += `<span class="console-chat ${ownMessageClass}" style='--userColor: #${message.color}' msg-id="${localmsgId}" clientId="${(
              messageClientId as string
            ).trim()}"><span class="chat-displayName">${message.userId ? `<img src='/user/picture/${message.userId}'>` : ''}${
              message.clientDisplayName
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
            const {range, row, column, rowend, columnEnd} = message.params;
            codeWindow.getEditor().focus()
            codeWindow.getEditor().gotoLine(row, column)
            codeWindow.getEditor().selection.setRange(range)
          }
          outputArea.appendChild(errorElem)
          // outputArea.innerHTML += `<span class="console-error" msg-id="${msgId}" id='compile-error'>${msgText}</span>`;
          break;
        case ConsoleMessageType.Debug:
          // activeConsole!.element!.innerHTML += `<div  msg-id="${msgId}"><pre class="console-debug">${msgText}</pre></div>`;
          if(textArea)
          textArea.innerHTML += data
          break;
        case ConsoleMessageType.DebugProgram:
          // const groupDebug = outputArea.querySelector(
          //   `.debug-program[msg-id="${msgId}"] .debug-program-container`
          // ) as HTMLElement;
          // if (groupDebug)
          //   groupDebug.innerHTML += `<span class="console-debug">${msgText}</span>`;
          // else
          //   outputArea.innerHTML += `<div class="debug-program" msg-id="${msgId}"><button onclick="toggleConsoleDebugProgram(this.parentElement)">x</button><div class="debug-program-container"></div></div>`;
          if(textArea)
          textArea.innerHTML += data
          break;
        case ConsoleMessageType.Output:
          // if(document.getElementById('active-console'))
          //   messageGroup = document.getElementById('active-console')!.querySelector(' div')!                        // TODO improve this selection
          // messageGroup.innerHTML += `<pre class="console-program-${message.type == WebSocketMessageType.End ? "return" : message.type == WebSocketMessageType.Console  ? "input" :"output"}">${data} </pre>`;
          
          if(textArea)
          textArea.innerHTML += data
            


        break;
        case ConsoleMessageType.Console:
          if(textArea)
            textArea.innerHTML += data + " \n"
        else 
           outputArea.innerText += data + "\n";
        break;
        case ConsoleMessageType.Notification:
          displayMessagePopup(data)
        break;
        default:
          outputArea.innerHTML += `<span class="console-output" msg-id="${msgId}">${data}</span>`;
          break;
      }
    } else {
      if(activeConsole)
      {
         textArea = activeConsole.element.getElementsByTagName('pre')[0]
        if(!textArea)
        {
          textArea = createNode('pre')
          activeConsole.element.prepend(textArea)
        }
      }
      // outputArea.innerHTML += `<pre class="console-output" msg-id="${msgId}">${msgText}</pre>`;
      if(textArea)
          textArea.innerHTML += data
    }
    // outputArea.textContent += "\n";

    if(!manuallScroll)
      outputArea.scrollTop = outputArea.scrollHeight;
  }
}


export function joinsession()
{
    if(checkIsOpen('join'))
      return onOpenMenu("join")
    const shareContainer = document.createElement('div')
    shareContainer.classList.add('share-container');
    
    shareContainer.innerHTML =
    `

   
    <form id="codeForm" method="get">
       <script src="../dist/public/emailCodeVerificationClient.js" async type="text/javascript"></script>
        <div class="text-container">
            <h1>Conecteaza-te</h1>
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
          <p>
            Cere codul unui prieten sau profesor pentru a te conecta la sesiunea lor!
          </p>
          <button  type="submit">Alatura-te</button>
          <p id="code-error"></p>
        </div>
        
    </form>
    
    `

    
    
    document.body.appendChild(shareContainer)
    shareContainer.appendChild(createNode('button', {css: 'position: absolute; top: 20px; right: 20px;', innerText: 'x',onclick(ev) {
      shareContainer.remove()
      onOpenMenu("join")
    },}))
    const script = document.createElement('script')
    const file = "/client/scripts/emailCodeVerificationClient.js";
    script.setAttribute('src', file);
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('async', 'true');

    document.body.insertBefore(script,shareContainer)
    const form = document.getElementById('codeForm') as HTMLFormElement
    const codeInput: HTMLInputElement = document.getElementById('code') as HTMLInputElement;

    codeInput.oninput = onCodeInput

    onOpenMenu("join", shareContainer)
    function onCodeInput()
    {
        if(codeInput!.value.length>=6)
          submit()
    }

    async function submit()
    {
        const codeInput: HTMLInputElement = document.getElementById('code') as HTMLInputElement;
        if(codeInput.valueAsNumber==undefined) return;

        await fetch('/editor/joinsession?code='+codeInput.valueAsNumber, {
        }).then(response => {
            return response.json()
        }).then(res => {

              if(res.redirect)
                location.href = res.redirect;  
                console.log('redirecting..')
            
               
              
        }).catch(err => {
          if(!inIframe)
          displayMessagePopup(err)
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
  if(checkIsOpen('share'))
    return onOpenMenu("share")

    sessionLink = window.location.origin + window.location.pathname + `?session=${clientId}`;

  // if (navigator.clipboard) {
  //   navigator.clipboard.writeText(sessionLink).then(() => {
  //     console.log("Code copied to clipboard!");
  //   });
  // } else displayMessagePopup(sessionLink);
  if(!wsSessionId) displayMessagePopup('Invalid session id.')

    const prevElem = document.getElementById('share-container')
    if(prevElem)
      return prevElem.remove()
        const shareContainer = document.createElement('div')
    shareContainer.classList.add('share-container');
    shareContainer.id = 'share-container'
    shareContainer.innerHTML =
    `
    <button id='close-share-session'>x</button>
    <form id="createSessionForm">
      

      <label for="chat" title='Daca este oprit, persoanele care intră nu vor avea posibilitatea de a vorbi pe chat'>
        Porneste Chat <input type="checkbox" name="chat" checked></label>

      <label for="voice" title='Daca este pornit, veti putea comunica cu celelalte persoane prin apel vocal'>
        Porneste Voce <input type="checkbox" name="voice"></label>

      <label for="code-permission" title='Alegeti cine poate edita codul - Oricine, doar tu, sau oricui ii dati permisiunea'>
        Editori Cod
          <select id='code-permission' name='codePermission'>
            <option value='0'>Toata lumea</option>
            <option value='2'>Doar tu</option>
            <option value='1'>Doar cu permisiune</option>
          </select>
      </label>

      <label for="sandbox" title='Daca este pornit, toate persoanele care intră vor avea fisierelelor lor, pe care doar dumneavoastra le veti putea vedea'>
        Izolează colaboratori ?<input type="checkbox" name="sandbox"></label>

      <label for="externals" title='Daca nu este pornit, contribuitorii nu vor putea sa deschida taburi externe'>
        Permite taburi externe ?<input type="checkbox" name="externals"></label>

      <label for="anonymous" title='Asociaza nume anonime aleatori pentru fiecare contribuitor.'>
        Nume anonime ?<input type="checkbox" name="anonymous"></label>

      <label for="language" title='Alege ce limbaj de programare poate fi rulat in aceasta sesiune.'>
      Limbajul Sesiunii
        <select id='language' name='language'>
            <option value='null'>Oricare</option>
            <option value='C++'>C++</option>
            <option value='Python'>Python</option>
            <option value='Javascript'>Javascript</option>
          </select>
      </label>
      <p class='info'>Dupa ce ati partajat editorul, sesiunea voastră v-a fi disponibilă orcărei persoane
      care are linkul, codul de 6 cifre sau codul qr.</p>

      <p id='session-create-error'></p>

      <button type="submit" id="submit-create-session" class="glowing" style='height: 2lh'>Partajeaza Editor</button>
      
    </form>
    <div id='connect-data-container'>
      <div id='connect-data-inner'>
        <img id="data.qrurl"> 
        <p>or</p>
        <div class='connect-info'>
          <p class='code' id="data.code" title='Codul de 6 cifre, se introduce in butonul portocaliu din bara de unelte de jos'>xxxxxx</p>
          <button id='copy-link' class='icon' style="background-image: url(../media/icons/link.svg)" title='Copiaza linkul sesiunii de editor'></button>
        </div>
      </div>
    </div>
    
    `

    
  
    document.body.appendChild(shareContainer)
    onOpenMenu("share", shareContainer)
    document.getElementById('close-share-session')!.onclick = function (this, ev) {
      shareContainer.remove();
      onOpenMenu("share")
      // shareContainer.animate()
    }

 document.getElementById('createSessionForm')!.onsubmit =  function (this, ev) {
      ev.preventDefault()
 }
  if(session)
  {
    document.getElementById('connect-data-container')?.classList.add('created')
    document.getElementById('data.code')!.innerText = session.code;
    (document.getElementById('data.qrurl')! as HTMLImageElement).src = session.img;
  }
  else
  fetch('/editor/sharesession?id='+wsSessionId)
  .then(res => {
    return res.json();
  })
  .then(data => {
    session = {code: data.code, img: data.qrsvg};
    document.getElementById('data.code')!.innerText = data.code;
    (document.getElementById('data.qrurl')! as HTMLImageElement).src = data.qrsvg;
      gtag('event', 'session_share', {

      });
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
          if(DockElement)
          DockElement.getElementsByClassName('toolbar-container')[0].prepend(createNode('h2', {innerText: data.code, css: "font-size: 1em; align-self: center; margin-inline: 1em; color: gray; font-family: 'Poppins';"}))
          // document.getElementById('join-session').parentNode.insertBefore(sessionCodeNode, document.getElementById('join-session'))
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
      navigator.clipboard.writeText(data.link)
      .then(() => displayMessagePopup("Lnkul a fost copiat!"))
      .catch(() => displayMessagePopup("Scuze, nu am putut copia linkul..\n Copiaza-l manual din bara de adresa!"))
      
    }
    const canShare = navigator.canShare({url: data.link})
    
      const share = createNode('button', {className: 'icon', css: `background-image: url(../media/icons/share${canShare ? '' : '_off'}.svg)`})
      document.getElementsByClassName('connect-info')[0].appendChild(share)
      if(canShare)
        share.onclick = () => {
          navigator.share({url: data.link, title: "Link colaborare intelegeinfo", text: "Vizualizeaza si editeaza cod alaturi de mine: \n"})
          .then(() => displayMessagePopup("Lnkul a fost impartasit!"))
          .catch(() => displayMessagePopup("Scuze, nu am putut copia linkul..\n Copiaza-l manual din bara de adresa!"))
        }
    
    
  })
 

  
}


export function createFile(fileName: string = "untitled.txt", fileContent?, index?: number) {
  const command = JSON.stringify({
    type: WebSocketMessageType.FileManagement,
    command: FileManagementCommands.Create,
    name: fileName,
    body: fileContent,
    index,
  });
  ws.send(command);
  //ws.send({command: FileManagementCommands.Create, args: []});
  // console.log("create file " + command)
}

export function closeDefaultScreen(createdFileElement)
{
  const elem = windows[0].tabs.find(val => val.name == 'Hello!')
  if(!elem)
    return;
 
     (elem.content as HTMLElement).animate([
        { opacity:"100%", filter: "blur(0)"},
        { opacity: "0%",  filter: "blur(10px)"},
      ],
      {
        duration: 500,
        delay: Math.random()*200 + 50,
        easing: "cubic-bezier(.2, .88, .5, .99)"
      }).onfinish = () => {
        elem.remove()
      }
  
    createdFileElement.openTab()
      elem?.element.remove()

      addButtons([createButton('play_arrow.svg', {onclick: () => {
            window.editor.sendDebugCommand('execute')
        }, class: "run"}),
         ], 'execution')
}

function addButtons(buttons, id?)
{


    // const buttons = [
    //     createButton('play_arrow.svg', {onclick: () => {
    //         window.editor.sendDebugCommand('execute')
    //     }, class: "run"}),
    //      createButton('pest_control.svg', {onclick: () => {
    //         window.editor.sendDebugCommand('-exec-run')
    //     }, class: "debug"}),
    //      createButton('step_over.svg', {onclick: () => {
    //         window.editor.sendDebugCommand('-exec-next')
    //     }, class: "debug"})
    // ]
    if(!ClientDock)
      return
    const editorControls = ClientDock.addSection(buttons, id)
    // const editorControls = createNode('div', {html: buttons, className: 'inner-toolbar', id})
    //   DockElement!.children[1].prepend(editorControls)
      editorControls.animate([
            {maxWidth: '0', overflow: 'hidden'},
            {maxWidth: '80px', overflow: 'initial'}
        ], {
            duration: 150,
            
        })

    for(const button of buttons)
        button.animate([
            {opacity: '0'},
            {opacity: '100%'}
        ], {
            duration: 150
        })
}

export function openFile(fileName: string = "main.cpp") {
  const prevTab = (editorSessions.get(fileName)?.fileElement?.parentWindow.activeTab as FileElement)
  const closedFile = 
  prevTab &&
  prevTab.fileElem !==undefined ?
  editorSessions.get(fileName)?.fileElement?.parentWindow.activeTab?.name!
  : undefined
  
  const command = JSON.stringify({
    type: WebSocketMessageType.FileManagement,
    command: FileManagementCommands.Open,
    body: fileName,
    closedFile
  });
  ws.send(command);

}



// websocket //


if(document.cookie.includes(sessionCookieName+'=') && !window.location.search.includes('save') && !window.location.search.includes(sessionCookieName))
{
//   const sesCookie = document.cookie
  document.cookie = sessionCookieName+'=';
//   if(!inIframe)
//   displayConfirmPopup(`Ai un proiect nesalvat,
// dorești să-l recuperezi?`, "Da", "Nu").then(res => {
//     if(res.value)
//       document.cookie = sesCookie //'session=';
//   })
      

}


export let tooltip:any= {};
 fetch('/editor/tooltipHints').then(data => data.json().then(json => tooltip = json))


export class TokenTooltip extends Tooltip {
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
          
          const fileText = await getFileValue(token.value) as string;
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

  // export const ws = new WebSocket(WSUrl);
  function doesHttpOnlyCookieExist(cookiename) {
    var d = new Date();
    d.setTime(d.getTime() + (1000));
    var expires = "expires=" + d.toUTCString();

    document.cookie = cookiename + "=new_value;path=/;" + expires;
    return document.cookie.indexOf(cookiename + '=') == -1;
  }
  export let ws: WebSocket 
  (async() => {

    
    const sessionId = new URL(window.location.toString()).searchParams.get("session") 
    const saveId = new URL(window.location.toString()).searchParams.get("save");
    // const params: (boolean | string | undefined | null)[] = [sessionId, saveId, inIframe]
    // const paramNames: (boolean | string | undefined | null)[] = ['session', 'save', 'embeded']
    // let paramsURL = ''
    // for(const param of params)
    // {
    //   const paramIndex = params.indexOf(param)
    //   if(typeof param == 'string' || typeof param == 'boolean' && param)
    //   {
    //     if(paramIndex!=0)
    //       paramsURL+="&"
    //     paramsURL += `${paramNames[paramIndex]}=${param}`
    //   }
        
        
    // }
    const params = new URLSearchParams()
    if(sessionId && !inIframe)
    {
            
            if(getCookie('iiauthstate'))
            {  
               if(getCookie('savedName'))
                document.cookie = 'savedName='
            }
            else
              if(!getCookie('savedName'))
              {
                const displayName = await displayInputPopup('Alegeti un nume prietenos:')
                
                if(displayName.value)
                {
                  document.cookie = 'savedName='+displayName.value
                  params.set('displayName', displayName.value)
                }
              }
              else
                params.set('displayName', getCookie('savedName'))
            
            
    }

    if(saveId)
     params.set('save', saveId.toString())
    if(sessionId)
      params.set('session', sessionId.toString())
    params.set('embeded', inIframe.toString())
    const WSUrl = (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.hostname  + ":" + window.location.port + "/editor" + (params.size ? "?" : "") + params.toString()



    

    ws = new WebSocket(WSUrl);

      ws.addEventListener('open', (ev) => {
          const sessionId = new URLSearchParams(window.location.search).get("session") ? new URLSearchParams(window.location.search).get("session") : new URLSearchParams(window.location.search).get("save");
          //writeOutput(sessionId || "No session ID found in URL.");

          window.onbeforeunload = (ev => {
            if(!inIframe)
            if(modifiedFile)
              ev.preventDefault()
          })

          let hoverTooltip = 0;

          setTimeout(() => {
          
            if(wsSessionId==undefined)
              ws.send(JSON.stringify({type: WebSocketMessageType.Handshake, displayName: name}))
              setTimeout(() => {
                if(wsSessionId==undefined)
                  ws.send(JSON.stringify({type: WebSocketMessageType.Handshake, displayName: name}))
              }, 3000); 
          }, 500); 

          

      });


      ws.addEventListener('close', (ev) => {
        const serviceRestart = ev.code == 1006;
        console.warn(ev.code, ev.reason)
        const socketStopped = document.createElement('div')
        socketStopped.classList.add(serviceRestart ? 'service-stopped' : 'service-error')
        const socketText = document.createElement('p')
        socketText.innerHTML = serviceRestart ? 'Scuze, am pierdut conexiunea la server...' : ev.reason;
        socketStopped.appendChild(socketText)
        document.getElementById('code-window-container')?.appendChild(socketStopped)
        // if(serviceRestart)
        //   setTimeout(() => {
        //     window.location.reload()
        //   }, 2000);
      })



      ws.onerror = (err) => {
        displayMessagePopup("Sorry we encountered an error while connecting to the server...")
        console.error(err)
      }

      ws.onmessage = onMessage
  })()





import { IIWebRTC } from "./webrtcdemo.js";



export function submitConsole(elem: HTMLTextAreaElement | null, type: WebSocketMessageType | undefined, Console?: Console) {
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
      type: type || WebSocketMessageType.Chat,
      action: 'process'
    })
  );
  if(Console)
    Console.sendCommand(sendText)

  consoleInput.value = "";
  typingIndicatorDelay = 300;
  onConsoleInput(elem)
  ws.send(JSON.stringify({type: WebSocketMessageType.ConsoleTyping, status: "end"}))

}

if(outputArea)
outputArea.onscroll = ev => {
          const lastMessageGroup: HTMLDivElement = document.querySelector('[msg-id="'+ ((msgId!=-1) ? msgId.toString() : '0') +'"]')!;
          if(!lastMessageGroup || !outputArea)
            return
          console.log(outputArea.scrollTop + outputArea.scrollHeight)
           console.log(lastMessageGroup.offsetTop + lastMessageGroup.offsetHeight + " " + lastMessageGroup.scrollHeight )
          const blockScroll =  outputArea.scrollHeight - outputArea.clientHeight - outputArea.scrollTop > 1//*eventJson.clientId !== wsClientId && */document.querySelector( `[msg-id="${msgId}"]`) ? (outputArea.scrollTop > document.querySelector( `[msgId="${msgId}"]`)!.clientHeight) : true

  if(!blockScroll)
        {
          document.getElementById('message-indicator')?.remove()
        }
}



enum FileManagementCommands {
  Create = "create",
  Delete = "delete",
  List = "list",
  Rename = "rename",
  Open = "open",
  Close = "close"
}

type errorObject = {
  row: Number;
  column: Number;
  error: String;
};

type FileEditorSession = {
  editor: Ace.EditSession | undefined,
  fileName: string,
  fileElement: FileElement | undefined,
   
}

export class CompileError {
  range: Ace.Range;
  annotation;
  markerId: number;
  text: string
  display: HTMLDivElement|undefined;
  constructor(session, range: Ace.Range, text: string)
  {
    this.text = text;
    this.range = range
    this.annotation = {
      row: range.start.row,
      column: range.start.column,
      text: text,
      type: "error",
    }

    this.markerId = session.addMarker(
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
  // renderer.removeGhostText(); // TODO reimplement
  (document.getElementById('vector-container') as HTMLDivElement).innerHTML = '';
  clearTimeout(playbackId)
  onExit();
}
function cleanFile(fileName) {
    editorSessions.get(fileName)?.fileElement?.fileElem.classList.remove('dirty')
}
export function dirtyFile(fileName: string)
{
  modifiedFile = true;
  const saveFile: boolean = fileName ? !["c", "exe"].includes(
      fileName.split(".").pop() || ""
    ) : true;

  editorSessions.get(fileName)?.fileElement?.fileElem.classList.add('dirty')
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
export const compileErrorObjs: Map<number,CompileError> = new Map();

//    END   //

 function onMessage (event) {
  const parsedData = JSON.parse(event.data);
  const type: WebSocketMessageType = parsedData.type
  let messageJson = parsedData as WebSocketMessage
  lastEventJson = messageJson;
  let command = parsedData.message;
  let data = parsedData.body;


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

    // if(eventJson.message != 'info locals' && eventJson.messageType != ConsoleMessageType.DebugProgram)
    //   writeOutput(data, eventJson);

    const session = codeWindow.getEditor().getSession();

    

    // handle variables
    if (eventJson.variables!=undefined) {
      const variablesSection = document.getElementById("variables");
      let unprocVariables;
      const variablesString = JSON.stringify(eventJson.variables)
      // writeOutput("", eventJson.variables, false, ConsoleMessageType.Info)

      if(debugWindow)
          debugWindow.updateVariables(eventJson.variables)
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
      if (eventJson.body.frame && eventJson.body.frame.line) {
        //check if its a chunk with line number
        debugLine = eventJson.body.frame.line;//parseInt(data.match(/^(\d)+(?=\s)?/gm)); // update debug row
        setDebugLineStyle(debugLine);

        const conditionRegex = /(?:if|while)\s*\(([^(){};]+?)\)/g;
        const forRegex = /for\s*\(([^;]*);([^;]*);[^)]*\)/g;

        let conditions: string[] = [];
        let buffer = "";
        const debugLineText = session.getLine(debugLine - 1);
        const pos = { row: debugLine - 1, column: debugLineText.length };

        // Match `if` and `while`
        for (const match of debugLineText.matchAll(conditionRegex)) {
          conditions.push(match[1].trim());
        }

        // Match `for` loops (only the 2nd part — the condition)
        for (const match of debugLineText.matchAll(forRegex)) {
          conditions.push(match[2].trim());
        }
        
        // setTimeout(() => {
        let i = 1;
        if (playbackSpeed < 4)
          // dont bother if speed is too high.
          for (const condition of conditions) {
                const exprValue = eventJson.variables;
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
                    //renderer.setGhostText("   " + buffer, pos); // TODO reimplement
                    console.log(buffer);
                    buffer = "";
                  }
                } //else renderer.setGhostText("   " + buffer, pos); // TODO reimplement
          }

        // }, 50);

        const regex =
          /(\b(?<=^(\d)+(?=\s)?\s*)(\w*)(\[(\w|\d)\]))|(?<=[(-/])(\w*)(\[(\w|\d)\])/g;
        if(eventJson.variables)
        if (eventJson.variables.match(regex) != null)
          eventJson.variables.match(regex).forEach((variable: { indexes: any[] }) => {
            const vararr = regex.exec(eventJson.variables);
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

    // if (data[0] == data.match(/^(\d)(?=\s)?/gm)) {
    //   setDebugLineStyle(debugLine);
    // }
  }

  function enableVoice()
  {
    if(microphone)
      throw 'microphone already exists'
      microphone = createNode('div', {html: [createNode('div', {css: 'width: 100%; position: absolute; bottom: 0; background-color:white;'})],
      id: 'microphone'})

    microphone.onclick = (ev) => {
      if(microphonePaused)
        unpauseVoice(true)
      else
        pauseVoice()
    }
    if(ClientDock)
      ClientDock.addSection([microphone], 'microphone-container')
    // ClientDock.appendChild(microphone)


    // for(const newRTC of rtc.values())
    //   sendVoice(newRTC)
  }

  function pauseVoice()
  {
     for(const newRTC of rtc.values())
      if(newRTC.localAudioStream)
          for(const track of newRTC.localAudioStream.getTracks())
            track.enabled  = false
      microphonePaused=true;
      microphone?.classList.remove('playing')
  }

  function unpauseVoice(autoStart=false)
  {
     for(const newRTC of rtc.values())
      if(newRTC.localAudioStream)
          for(const track of newRTC.localAudioStream.getTracks())
            track.enabled  = true
      else if(autoStart)
        sendVoice(newRTC)
      microphonePaused=false
      microphone?.classList.add('playing')

  }


  function sendVoice(newRTC)
  {
        newRTC.beginSendingAudio().then(stream => {
            const audio = stream.getTracks()[0]
            if(audio)
            {
              getStreamVolume(stream, 10, (volume) => {
                const normalize = Math.min(1,Math.max(0,Math.pow(volume/100,2)))
                const val = normalize*255
                const color = `rgb(${val}, ${val}, ${val})`;
                // (microphone!.children[0] as HTMLElement).style.backgroundColor = color;
                (microphone!.children[0] as HTMLElement).style.height = normalize*50 +'px'
              })

              
              audio.onmute = (ev) => {
              if(microphone)
                microphone.style.opacity = '0.15';
              }
              audio.onunmute = (ev) => {
                if(microphone)
                  microphone.style.opacity = '1';
                
              }
            }
            
            
            
          })
  }
  function disableVoice()
    {
      if(microphone)
        microphone!.remove()
        microphone = undefined;
        for(const newRTC of rtc.values())
          newRTC.stopSendingAudio()
    }

  function createRTCConnection(targetId, isHost)
  {
    console.log('is host:',isHost)
    const newRTC = new IIWebRTC(targetId,wsClientId, ws, isHost, (dc) => {
      document.onpointerdown = onCapture;
      document.onpointermove = onCapture;
      document.onpointerover = onCapture
       function onCapture(ev) {

        ws.send(JSON.stringify({type: WebSocketMessageType.MouseUpdate, pointerType:  ev.pointerType}))

        // updateLocalCursor(ev, true)
        document.onpointerdown = null;
        document.onpointermove = null;
        document.onpointerover = null

        setTimeout(() => {
          addMouseListener(ClientOptions)
        }, 100);

      }
      
      console.log(ClientOptions)
    })
    rtc.set(targetId, newRTC)
    // if(ClientOptions)
    //   if(ClientOptions.canVoice)
    //       sendVoice(newRTC)
     
    
    
    newRTC.onData = (data) => {
      const eventJson = JSON.parse(data)
      if(!cursors.has(eventJson.clientId))
        new EditorCursor(eventJson)
      else
        cursors.get(targetId)!.update(eventJson)
    }
  }

function onRemoteClientJoin(rclient: HandshakeMessage['users'][number]) 
{
  if(!rclient)
    throw 'Invalid remote client'
  // clients.push(new SessionClient(rclient.clientId, rclient.displayName, rclient.color))
    if(!rtc.has(rclient.clientId))
    createRTCConnection(rclient.clientId, isHost)

  if(rclient.clientId == wsClientId)
    throw 'duplicate client id'
    // const clientIndex = clients.findIndex((val) => val!.clientId == messageJson.clientId)
    const fileName = rclient.openFile[0]

    // if(clientIndex == -1)
    // {
      
      createClient(rclient.clientId, rclient.displayName, rclient.color, rclient.accountId, false, rclient.isHost,
         rclient.openFile.map(fileName =>
           { return {fileElement: editorSessions.get(fileName)?.fileElement, fileName, editor: editorSessions.get(fileName)?.editor} as FileEditorSession }))
      for(const remoteFileName of rclient.openFile)
      editorSessions.get(remoteFileName)?.fileElement?.addUser({name: rclient.displayName, color: rclient.color, id: rclient.clientId}, undefined)
}

 function createFileSession(fileName, fileContent, index) {
      const newSession = ace.createEditSession(fileContent);
      // undo manager?
      // if(fileName.split('.')[1] != 'cpp')
      
      newSession.setMode(aceModes.getModeForPath(fileName).mode);
      const editor = client!.editorSession[index].fileElement!.parentWindow.createEditor()

      if(editor.session)
        editor.session.destroy()
     editor.setSession(newSession);
      
        editor.setReadOnly(!client!.canEdit)
      const session: FileEditorSession =
      {
        editor: newSession,
        fileName: fileName,
        fileElement: undefined
      }
      editorSessions.set(fileName, session);
      client!.editorSession![0] = session
      console.log('created file session')
  }

  function updateFileSession(fileName, fileContent) {
    // let currentSession = editorSessions.get(fileName)!
    const file = editorSessions.get(fileName)!
    if(!file.editor)
      file.editor =  ace.createEditSession(fileContent);
    
    
    console.log("File already opened: ", fileName, "current session: ", editorSessions.get(fileName)!);
    // let session = editorSessions.get(fileName)!;
    switch(fileName.split('.').at(-1))
    {
      case 'png':
      case 'jpeg':
      case 'webp':
      case 'img':
        codeWindow.createEditor().container.style.display = 'none';
        canvas = new EditorCanvas(ws, wsClientId)
        codeWindow.getEditor().container.parentElement?.appendChild(canvas.render())
        canvas.updateSize()
        break;
      default:
        codeWindow.createEditor().container.style.display = '';
        if(canvas)
        {
          canvas.remove()
          canvas = undefined;
        }
      
        break;
    }
    if (editorSessions.has(fileName))
      {
        
        file.editor!.setMode(aceModes.getModeForPath(fileName).mode);
        file.fileElement!.parentWindow.setActiveFile(file.fileElement!) // we need to set the active tab before changing sessions!!
        const editor = file.fileElement!.parentWindow.createEditor()
        if(editor.session)
        {
          editor.setSession(editorSessions.get(fileName)!.editor)
          file.fileElement!.content = editor.session
        }
         
        
        editor.setReadOnly(!client!.canEdit)
      } 
    if (fileContent.toString() != editorSessions.get(fileName)!.editor!.getValue()) {
      isRemoteChange = true;  // must add this to prevent sending on changed event
      editorSessions.get(fileName)!.editor!.setValue(fileContent);
      isRemoteChange = false;
    }
    // editorSessions.set(fileName, currentSession);
  }


function onOpenFile(fileName, fileContent, client: SessionClient ) {
  
  console.log('opening file:',editorSessions, client);
  
  if (!editorSessions.has(fileName)) 
    createFileSession(fileName, fileContent, 0)
  else 
    updateFileSession(fileName, fileContent)
  
  onFileSessionUpdated(fileName, client)

  if(editorSessions.get(fileName)?.fileElement!.parentWindow.editor)
      editorSessions.get(fileName)?.fileElement!.onOpenTab(editorSessions.get(fileName)!.fileElement!.parentWindow.editor!.container)


  if(!['cpp','c++'].includes(fileName.split('.').at(-1)))
  {
    const debug = document.getElementsByClassName('debug')
    if(debug)
      for(const debugElem of debug)
        debugElem.remove()
  }
  else if(document.getElementsByClassName('debug').length ==0)
    document.getElementById('execution')?.appendChild(createButton('pest_control.svg', {onclick: () => {
            window.editor.sendDebugCommand('-exec-run')
        }, class: "debug"}))
  
  
}

function createClient(clientId, displayName, color, userId, isLocal: boolean, clientIsHost: boolean, session: FileEditorSession[]) {
  
  const client = new SessionClient(clientId,displayName, color, true, userId, isLocal, clientIsHost)
  client.editorSession = session
  clients.set(clientId,client)
  console.log("Created client: ", client, clients)
  
  return client
}

function onClientDisconect(colabClientId, messageJson)
{
    

    const collabClient = clients.get(colabClientId)
    if(!collabClient) throw 'couldnt find collab client'
    
    


      // document.getElementById('cursor-'+colabClientId)?.remove()
      // cursors.delete(colabClientId)
      collabClient.onDisconect()
      writeOutput(messageJson.body, messageJson, false, ConsoleMessageType.SessionInfo);
      
      clients.delete(colabClientId)
}

function getEditorSession(fileName)
{
  return editorSessions.get(fileName)!//client?.editorSession.find(file => file.fileName === fileName)!
}

  switch (messageJson.type) {
  case WebSocketMessageType.Utilities:

  switch (messageJson.util) {
    case 'transpile':
        const target = getEditorSession(messageJson.fileName)
        target.editor?.setValue(messageJson.response)
            
    break;
}

break;
    case WebSocketMessageType.RTC:
      // if(eventJson.end)
      // {
      //   const conn = rtc.get(eventJson.callerId)!
      //   conn.close()
      //   rtc.delete(eventJson.callerId)
      //   break;
      // }
        
        const peerRTC = rtc.get(messageJson.callerId || messageJson.targetId);
        if (peerRTC) {
          peerRTC.handleSignal(messageJson as any);
          break
        }
        
      if(!messageJson.description)
        break;
      if(messageJson.description.type != "offer" )
        break;
      const callerId = messageJson.callerId
      if(!rtc.has(callerId))
        createRTCConnection(callerId, isHost)

    break;
    case WebSocketMessageType.Error:
      writeOutput(data, messageJson);
      break;
    case WebSocketMessageType.Canvas:
      if(canvas)
        canvas.handleReplication(messageJson)
      break;
    case WebSocketMessageType.Console:
      if(messageJson.action == 'container')
      {
        const tab = findTabByName('Terminal') as TerminalTab
        if(tab)
          tab.write(messageJson.body)
        break
      }
    case WebSocketMessageType.Output:
      
      if(byteSize(messageJson.body) > 64000) // 1000000 is 1Mb
      {
        writeOutput('error! output exceeded 64kb')
       
        break;
      }
      else 
        writeOutput(data, messageJson);
    
      if(messageJson.message === 'end')
        cleanDebug()
        
      break;
    case WebSocketMessageType.Debug:
      switch(messageJson.state)
      {
        case "end":
          cleanDebug()
          const cmdBut = document.getElementById("buttons");
          cmdBut?.classList.remove("debug-control");
          cmdBut?.classList.remove("execute-control");
          writeOutput('Ended debug session', null, ConsoleMessageType.Debug)
          document.getElementById('debug-exec-controls')?.remove()
          break
        case "start":
          
          onRun()
          addButtons([createButton('step_over.svg', {onclick: () => {
            window.editor.sendDebugCommand('-exec-next')
        }, class: "debug"})], 'debug-exec-controls')
         
         activeConsole?.onProcessStart()
         writeOutput('Started debug session', null, ConsoleMessageType.Debug)
         if(!debugWindow)
         {
           debugWindow = new DebugWindow()
         windows[1].addTab(createWindowTab('Debug', debugWindow.mainContainer ))
         }
       
          break;
        case "running":
          handleOutput(messageJson);
      }
      break;

    case WebSocketMessageType.End:
        if(data)
          writeOutput(" " + data + "  |<span style='text-wrap: wrap;'>Timp de executie: " + `<span style="color:${messageJson.time < 300 ? 'green' : 'red'}">` + messageJson.time +"</span>ms" + (messageJson.notes  != "" &&  messageJson.notes != undefined ? "<br><span style='opacity: 0.5'>notes: " + messageJson.notes + "</span>": "" + "</span>"), messageJson);
        else if(messageJson.sandbox)
            activeConsole?.element.appendChild(createSandbox(messageJson.fileName, messageJson.sandbox)!)
          else  writeOutput("Pregramul a fost terminat fortat." + (messageJson.notes  != "" &&  messageJson.notes != undefined ? "<br><span style='opacity: 0.5'>notes: " + messageJson.notes + "</span>": "" + "</span>"), messageJson);
      onExit()

      
      break;
    case WebSocketMessageType.MouseUpdate:
       if(!messageJson.clientId) break;

      //  if(eventJson.fileName)
      //  {
      //   cursors.get(eventJson.clientId)?.remove()
      //   return;
      //  }

        if(!cursors.has(messageJson.clientId))
         new EditorCursor(messageJson)

      // TODO Add incative class to cursor when user doesnt move it.

       
    break;
    case WebSocketMessageType.Chat:
      if(!outputArea)
        break;
      if(messageJson.clientId)
      {
        
        const lastMessageGroup: HTMLDivElement = document.querySelector('[msg-id="'+ ((msgId!=-1) ? msgId.toString() : '0') +'"]')!;
        const blockScroll = outputArea.scrollHeight - outputArea.clientHeight - outputArea.scrollTop > 1 // lastMessageGroup? lastMessageGroup.offsetTop + lastMessageGroup.offsetHeight > outputArea.scrollTop : false//*eventJson.clientId !== wsClientId && */document.querySelector( `[msg-id="${msgId}"]`) ? (outputArea.scrollTop > document.querySelector( `[msgId="${msgId}"]`)!.clientHeight) : true


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

            outputArea.innerHTML += "<br>"
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


        writeOutput(data, messageJson, blockScroll);

           
      }
      else
      
      writeOutput(data, messageJson);

      break;

    case WebSocketMessageType.Handshake:


      // if((!wsSessionId && !wsClientId) || messageJson.sessionId)
      // {
      // wsClientId = messageJson.clientId;
      // wsSessionId = messageJson.sessionId;
      // isColabSession = messageJson.session!=undefined
      
      // isHost = messageJson.session!=undefined ? messageJson.session.isHost : false
      // if(!client)
      // client = new SessionClient(wsClientId, messageJson.displayName, messageJson.color)
      // // if(!document.cookie.includes('session='))
      // document.cookie='session='

      // setTimeout(() => {
      //   document.cookie = 'session='+wsSessionId+';' 
      // }, 15000);
      // //console.log(editor.session.toJSON()) // TODO Implement saving the editor session in a file on the server or on the client.
        
        
      // }

      
      // if(messageJson.session ? messageJson.session.isHost : false || !messageJson.session)
      //   document.getElementById('share')?.classList.add('host')

      // if(messageJson.body)
      //   writeOutput(messageJson.body, messageJson);


      // const projectData = messageJson.project;
      // const sessionData = messageJson.session;
      // if(projectData)
      // { 
      //   const projNameNode = document.createElement('h1');
      //   projNameNode.innerText = messageJson.project.name as string;
      //   projNameNode.id = 'active-project-name'
      //   document.getElementById('join-session')!.parentNode!.insertBefore(projNameNode, document.getElementById('join-session'))
      // }

      // if(sessionData)
      // {
      //   if(!sessionData.canEdit)
      //     editor.setReadOnly(true)
      //   if(!sessionData.canChat)
      //     document.getElementById('console')?.setAttribute('disabled','true')

      //   ClientOptions = {canChat: messageJson.session.canChat, canEdit: messageJson.session.canEdit, canVoice: messageJson.session.canVoice}

      //   if(!ClientOptions.canVoice)
      //     disableVoice()
      //   else
      //     if(!microphone)
      //       enableVoice()
           

      // console.log(ClientOptions)
      // }
      function updatePermissions(newPermissions) {
          if(!newPermissions.canEdit && codeWindow)
            if(codeWindow.editor)
            codeWindow.getEditor().setReadOnly(true)
          if(!newPermissions.canChat)
            document.getElementById('console')?.setAttribute('disabled','true')
          if(newPermissions.isHost)
            document.getElementById('share')?.classList.add('host')
          ClientOptions = newPermissions
  
          if(!ClientOptions.canVoice)
            disableVoice()
          else
            if(!microphone)
              enableVoice()
        }



      const sessionData = messageJson.permissions;

      if(wsClientId && wsSessionId)
      {
        updatePermissions(sessionData)
        return;
        // update session permissions
      }


      wsClientId = messageJson.clientId;
      wsSessionId = messageJson.sessionId
      isHost = messageJson.isHost || sessionData!=undefined ? sessionData.isHost : false
      isColabSession = sessionData!=undefined

      if(sessionData)
        updatePermissions(sessionData)


      writeOutput(messageJson.body, messageJson);
      updateCatalouge(wsSessionId, wsClientId)


      if(new URLSearchParams(location.search).has('content'))
      {
        const content = decodeURIComponent(new URLSearchParams(location.search).get('content') as string)
        const split = content.split(':')
        createFile(split[0], content.substring(split[0].length+1))
      }
      // if(!document.cookie.includes(sessionCookieName+'='))
      //   document.cookie=sessionCookieName+'='
      // setTimeout(() => {
      //   document.cookie = sessionCookieName+'='+wsSessionId+';' 
      // }, 15000);
      


      messageJson.files.forEach((file: string) => {
          onFileCreate(file);
        });
      
      messageJson.users?.forEach(rclient => {
        if(rclient.clientId != wsClientId)
        {
          onRemoteClientJoin(rclient)
        }
        else
        {
          if(!client)
          {
            // create local client
            client = createClient(wsClientId, messageJson.displayName, messageJson.color, messageJson.accountId, true, messageJson.isHost || isHost,  [{fileName: rclient.openFile[0], editor: undefined, fileElement: undefined}])
            // client = new SessionClient(wsClientId, messageJson.displayName, messageJson.color, sessionData.canEdit)
            document.getElementById('editor-grid-container')!.style = '--userColor: #'+ messageJson.color;
            if(rclient.openFile.length == 0)
              showDefaultScreen()
            else
            {
              
                openFile(rclient.openFile[0])
              // client.editorSession![0] = {fileName: rclient.openFile[0], editor: undefined, fileElement: undefined}
              addButtons([createButton('play_arrow.svg', {onclick: () => {
                  window.editor.sendDebugCommand('execute')
              }, class: "run"},),
              ], 'execution')
            }
            // clients.set(wsClientId, client)
            
          }
        }
      })
      
      break;
    case WebSocketMessageType.CodeChange:
      // editor.session.getDocument().applyDelta(delta);
      const editorSession: FileEditorSession = editorSessions.get(messageJson.fileName) || editorSessions.values()[0]!
      const delta = messageJson.delta;
      
      if(!editorSession.editor)
        throw 'invalid editor on editor session'
      isRemoteChange = true;
      try{

        if(messageJson.body)
        {
          editorSession.editor.getDocument().setValue(messageJson.body)
          console.warn('Applied forced file content correction!')
          if(sha256(editorSession.editor.getValue()) != messageJson.checksum)
            console.error('Failed checksum check after force content change.')
        }
        else
          editorSession.editor.getDocument().applyDelta(delta);

        if(sha256(editorSession.editor.getValue()) != messageJson.checksum)
          console.error('Checksum failed!')
      } finally {
        isRemoteChange = false;
        document.getElementById('buttons')?.classList.remove('compiled')
        dirtyFile(messageJson.fileName)
      }
      
      

      
      break;
    case WebSocketMessageType.CompileResult:


      const compileErrors = JSON.parse(messageJson.body);
      const index = client?.editorSession.findIndex(file => file.fileName === messageJson.fileName)!
      const session = client?.editorSession[index].editor!

      if(messageJson.saved)
        cleanFile(messageJson.fileName)
    for(const elem of document.getElementsByClassName('console-error'))
          elem.remove()
       session.setAnnotations([])
        errorAnnotations.length=0;
        for(const marker of markers)
          session.removeMarker(marker)

        markers.length =0;


      if(!compileErrors.length)
      {
        
        
        for(const marker of markers)
          session.removeMarker(marker)

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

                  const compileErrorObj = new CompileError(session, range, result.message)
                  // compileErrorObjs.get(markerId)!.display?.remove()
                  compileErrorObjs.set(compileErrorObj.markerId, compileErrorObj)
                  errorAnnotations.push(compileErrorObj.annotation);
                
                  markers.push(
                    compileErrorObj.markerId
                    
                  );
                  // window.alert((editor.renderer as any).$markerFront);
                  //  writeOutput(result.message, {messageType: 'error', params: {range, row: range.start.row+1, column: range.start.column+1, rowend: range.end.row+1, columnemnd: range.end.column+1}})
                  session.setAnnotations(errorAnnotations);
                  

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
              session.removeMarker(marker)
              errorAnnotations.length = 0;
              session.setAnnotations([]);
              document.getElementById('compile-error')?.remove()
              compileErrorObjs.forEach(element => {   // TODO improve this
                element.display?.remove()
              });
              // compileErrorObjs.clear()
            break;
        }
        // writeOutput(result.kind)
      }
      
      break;


    case WebSocketMessageType.ExecuteStatus:
      let errorOutputString = "";
      switch (messageJson.status)
      {
        case 'spawnGUI':
          displaynoVNC(activeConsole!.element)
        break;
        case 'spawn':
          onRun()
        break;
        case 'container-spawn':
          onRun()
        break;
        default:
          const index = 0 //client?.editorSession.findIndex(file => file.fileName === messageJson.fileName) 
          const session = client?.editorSession[index].editor!
          if(messageJson.error)
          {
          onExit()
          
          // if(index==-1)
          //   throw 'couldnt find session while displaying errors'
            // ON ERROR
            document.getElementById('buttons')?.classList.remove('compiled')
            for (const markerId of markers) session.removeMarker(markerId);

            for (const errorMessage of messageJson.error.errors) {
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
                  session.addMarker(
                    new AceRange(row, column, row, column + 1),
                    "ace-error-line",
                    "screenLine"
                  )
                );
              }
            }
            session.setAnnotations(errorAnnotations);
          } else {
            if(messageJson.input == 1)
            {
              // if(document.getElementById('console-input'))
              //   document.getElementById('console-input')?.remove();
              
              const console = activeConsole!.consoleInput
              if(!console)
                return
              console.id = 'console-input'
              activeConsole?.element.appendChild(console) 
              activeConsole!.element.onclick = (ev) => console.focus()
              
              const listener = (e: KeyboardEvent) => {
                
                if (e.key === "Enter" && !e.shiftKey || e.key === " ") {
                  e.preventDefault();

                  submitConsole(console, WebSocketMessageType.Console, activeConsole)
                  console.innerText = ''
                  console.value = ''
                  console.removeEventListener("keypress", listener)
                  // console.remove()
                }
              }

              console.addEventListener("keypress", listener);
              console.focus();
            }
              
            session.setAnnotations([]);
            document.getElementById('buttons')?.classList.add('compiled')
            for (const markerId of markers) session.removeMarker(markerId);
          }

          // writeOutput(
          //   data.success
          //     ? "Compilation of " + data.fileName + " successful!\n"
          //     : errorOutputString ||
          //         "Compilation error. (couldnt retrieve error message, sorry)"
          // );
          if(!activeConsole)
          {
            startProgram()
            onRun()
          }
          else
            if( activeConsole.compileMessage)
              if(!messageJson.body)
          
          
                activeConsole.onProcessStart()
          
                  
                else
                  activeConsole.compileMessage.children[1].innerHTML = messageJson.body
              
          
         

          document.getElementById('compile-status')!.innerText = messageJson.body;
          document.getElementById('compile-status')!.style.opacity = '1'

          setTimeout(() => {
            document.getElementById('compile-status')!.style.opacity = '0'
          }, 500);

          break;
      }
      
    break;

    case WebSocketMessageType.CodeSelection:
      const fileName = messageJson.fileName;
      const cursorManager = cursorManagers.get(editorSessions.get(fileName)?.fileElement!.parentWindow.editor!.id!)!

      if (!data) {
        //clear selection
       
        
        if(!editorSessions.get(fileName))
          break;
        if (cursorManager.selectMarker)
        editorSessions.get(fileName)!.editor!.removeMarker(cursorManager.selectMarker);
        if(messageJson.clientId)
          cursorManager.removeCursor(messageJson.clientId);
        return;
      }

      const selection = messageJson.body.range;
      const start = selection.start;
      const end = selection.end;      const range: Ace.Range = new AceRange(start.row, start.column, end.row, end.column);

      if(!editorSessions.get(fileName)!.editor!)
        throw 'Invalid editor session while remote selecting code'
      //if(start.end==end.end || start.row*end.row * start.column * start*end.column==0) return;
      if (cursorManager.selectMarker) editorSessions.get(fileName)?.editor!.removeMarker(cursorManager.selectMarker);
      if (start && end) {
        if (start !== end)
          cursorManager.selectMarker = editorSessions.get(fileName)!.editor!.addMarker(
            range,
            "ace_remote_selection",
            "line",
            false,
            'background-color: #' + messageJson.color
          );
          
          // TODO fix this so that the cursor goes to the end of the selection.
          cursorManager.replicateCursor(messageJson.color, messageJson.clientId, {
            row: (end.row > start.row)as boolean ? end.row : start.row,
            column: (end.column > start.column) as boolean ? end.column : start.column,
          });

          }

      break;

    case WebSocketMessageType.ConsoleTyping:
      const indicatorStatus = messageJson.status;
      const indicatorClientId = messageJson.clientId;
      const typingIndicatorContainer = document.getElementById('typingIndicatorContainer');
      try {
        switch(indicatorStatus)
        {
          case "start":
            if(!typingIndicators.has(indicatorClientId))
              {
                if((typingIndicators.has(indicatorClientId)))
                  (typingIndicators.get(indicatorClientId) as HTMLElement).remove;

                const typingIndicator = document.createElement('div');
                
                typingIndicators.set(indicatorClientId, typingIndicator)
                typingIndicator.textContent = `${messageJson.displayName} scrie...`
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
      } catch(err) {
        console.warn(err)
      }
      
        

      
    break;
    case WebSocketMessageType.ColabData:
      const colabClients: {displayName:string, fileName:string, clientId: UUID, color: string }[] = messageJson.clients;
      const colabClientId = messageJson.clientId;
      const colabCommand = messageJson.colabCommand;
      
      isColabSession = true;
      switch(colabCommand) 
      {
        case "DISCONECT":
          if(!colabClientId)
            break;

            onClientDisconect(colabClientId, messageJson)
            break;
        case "HOST":
          writeOutput(messageJson.body, messageJson, false, ConsoleMessageType.SessionInfo);
          isHost = true
          break;
        case "JOIN":
          // a new client joined
          // addMouseListener(eventJson.session)
         if(messageJson.client.clientId == wsClientId)
          throw 'Error: joined client is this client'
          onRemoteClientJoin(messageJson.client)
          
        break;

        case "LIST":
           const colabContainer = document.getElementById("colab-container") || null;
          if (!colabContainer) return;
          colabContainer.innerHTML = "";
          if(colabClients)
          if(colabClients.length != 0)
            colabClients.forEach((client) => {
              const clientId = client.displayName.split("-")[0];
              colabContainer.innerHTML += `<div class="colab-client" id=${clientId}>${clientId}</div>`;
              // if(!clients.find(val => val.clientId === client.clientId))
              //   clients.push(new SessionClient(client.clientId, client.displayName, client.color))
            });
        break;
      }
      
     
      break;
    case WebSocketMessageType.Heartbeat:
      ping = Date.now() - ping - messageJson.expectedDelay;

      ws.send(JSON.stringify({ type: WebSocketMessageType.Heartbeat })); // send heartbeat to server
      if (ping != -1) console.log("heartbeat ping: " + ping);
      ping = Date.now();
      break;
    case WebSocketMessageType.FileManagement:
      //   data.command should work too but it doesnt TODO
      const commandType = JSON.parse(event.data).body ? JSON.parse(event.data).body.command : messageJson.command;

      switch (commandType) {
        case FileManagementCommands.Create:
          onFileCreate(data.content, messageJson.index);
          break;
        case FileManagementCommands.Delete:
          deleteFile(messageJson.name, true)
          break;
        case FileManagementCommands.List:
          JSON.parse(event.data).body.content.forEach((file: string) => {
            onFileCreate(file);
          });

          break;
        case FileManagementCommands.Rename:
          renameFile(messageJson.name, messageJson.newName)
          break;
        case FileManagementCommands.Open:
          const fileName: string = messageJson.fileName;
          // remote open meaning another user opened a file
          if(!messageJson.body)
          {
            // if(messageJson.clientId == wsClientId)
            //   // if(messageJson.oldFileName !== fileName)
            // {
            //   return
            //   // client!.editorSession = {fileElement: editorSessions.get(fileName)?.fileElement, fileName, editor: editorSessions.get(fileName)?.editor};
            //   //  return onFileSessionUpdated(messageJson.fileName, client!)
            // }
               
              // else return
            // add and remove activity markers, it calls even for own user
            if(messageJson.oldFileName !== messageJson.fileName)
              if(messageJson.oldFileName !== undefined && editorSessions.has(messageJson.oldFileName))
              {
                  console.log('REMOVED USER IN FileManagementCommands.Open', clients.get(messageJson.clientId)!.editorSession!)
                //  clients.get(messageJson.clientId)!.editorSession!.fileElement?.removeUser(messageJson.clientId)
                 editorSessions.get(messageJson.oldFileName)!.fileElement?.removeUser(messageJson.clientId)
              }
              if(!editorSessions.has(fileName))
                return
              clients.get(messageJson.clientId)!.editorSession![editorSessions.get(fileName)!.fileElement!.parentWindow!.index] = editorSessions.get(fileName)! //{fileElement: editorSessions.get(fileName)?.fileElement, fileName, editor: editorSessions.get(fileName)?.editor};

              editorSessions.get(fileName)?.fileElement?.addUser({name: messageJson.displayName, color: messageJson.color, id: messageJson.clientId}, messageJson.oldFileName)
              console.log('added user: ', clients.get(messageJson.clientId)!.editorSession!)
              //obsolete?
              // if(wsClientId == messageJson.clientId)
              //   break;
              // check if we know about this user
              // const clientIndex = clients.findIndex((val) => val!.clientId == messageJson.clientId)
              // if(clientIndex == -1)
              // {
              //   // create a new user // if its self
              //   if(!messageJson.clientId)
              //     break
              //   createClient(messageJson.clientId, messageJson.displayName, messageJson.color, {fileElement: editorSessions.get(fileName)?.fileElement, fileName, editor: editorSessions.get(fileName)?.editor})
                
              // }
                 
              // else
                
                console.log('updated client', clients.get(messageJson.clientId))
          }
          else
          if(client)
            onOpenFile(fileName, messageJson.body.content, client)
          else
            throw 'CLIENT IS INVALID WHILE OPENING FILE'
          

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
      code: codeWindow.getEditor().getValue(),
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
        for (const markerId of markers) codeWindow.getEditor().session.removeMarker(markerId);

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
              codeWindow.getEditor().session.addMarker(
                new AceRange(row, column, row, column + 1),
                "ace-error-line",
                "screenLine"
              )
            );
          }
        }
        codeWindow.getEditor().session.setAnnotations(errorAnnotations);
      } else {
        codeWindow.getEditor().session.setAnnotations([]);
        document.getElementById('buttons')?.classList.add('compiled')
        for (const markerId of markers) codeWindow.getEditor().session.removeMarker(markerId);
      }

      writeOutput(
        data.success
          ? "Compilation of " + data.fileName + " successful!\n"
          : errorOutputString ||
              "Compilation error. (couldnt retrieve error message, sorry)", {messageType: "error"}
      );

      code = codeWindow.getEditor().getValue();
    });
}

export function sendDebugCommand(cmd: string) {
  //editor.setValue(code, -1);
  const cmdBut = document.getElementById("buttons");
  if (cmd == "-exec-run") {
    // debugger
    cmdBut?.classList.add("debug-control");
    cmdBut?.classList.remove("execute-control");
    startProgram()
  } else if (cmd == "execute") {

    //normal execute
    cmdBut?.classList.remove("debug-control");
    cmdBut?.classList.add("execute-control");
    startProgram()
  }

  sendWebsocketCommand(cmd, []); //ws.send(JSON.stringify({command: cmd , args: []}));
  if (cmd == "-exec-next" || cmd == "-exec-continue")
    sendWebsocketCommand("-stack-list-variables --all-values ", []); // ws.send({command: 'info locals' , args: []});
  const consoleElem = document.getElementById("console") as HTMLTextAreaElement;
  if (cmd == "-exec-execute" && consoleElem?.value != "") submitConsole(consoleElem, WebSocketMessageType.Console, activeConsole);
}

let playbackSpeed = 1;
let playbackId: NodeJS.Timeout;
let processRunning: boolean;

export function playback() {
  sendDebugCommand("-stack-list-variables --all-values");
  //  TODO Stop playback
  // if(!processRunning)
  //     onRun()
  let i = debugLine;
  updatePlaybackSpeed();
}

export function restartPlayback() {
  sendDebugCommand("-exec-run");
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
    sendDebugCommand("-exec-next");
    if (debugLine >= codeWindow.getEditor().session.getLength() + 2) {
      // add offset to complete exectuin and display result.
      clearInterval(playbackId);
      onExit();
    }
  }, 300 / playbackSpeed);
}

function onRun() {
  codeWindow.getEditor().setReadOnly(true);
  processRunning = true;
  document.getElementById('buttons')?.classList.add('executing')
  document.getElementById('execute-control')!.innerText = "Opreste Programul"
  if(document.getElementById('debug-exec-controls'))
    document.getElementById('debug-exec-controls')?.remove()
  if(document.getElementById('console-input'))
    document.getElementById('console-input')?.remove();



  // activeConsole.compileMessage?.remove()
  
    // if(currentFileName.toLowerCase().includes("gui"))
  //   displaynoVNC(activeConsole.element)


  
  gtag('event', 'program_run', {
        'extension': currentFileName?.split('.').at(-1),
      });

  // TODO Add separate input area for interactive console.
}

function spawnConsole()
{
  document.getElementById('compile-status')!.innerText = 'Communicating with server...';
  document.getElementById('compile-status')!.style.opacity = '0.25'

  if(document.getElementById('active-console'))
  document.getElementById('active-console')!.id = '';

  return new Console()
}

function startProgram()
{
  
  if(activeConsole || processRunning)
    return
  activeConsole = spawnConsole()
  activeConsole.element.parentElement!.scrollTop =activeConsole.element.parentElement!.scrollHeight;
    if(activeConsole?.noVNC)
    activeConsole?.noVNC?.remove()
}

function onExit() {
  codeWindow.getEditor().setReadOnly(false);
  processRunning = false
  codeWindow.getEditor().session.removeMarker(lastDebugId);
  document.getElementById('buttons')?.classList.remove('executing')
  document.getElementById('execute-control')!.innerText = "Executa Programul"



  
  activeConsole?.onProcessEnd()

  
  activeConsole = undefined
}

function setDebugLineStyle(lineIndex: number) {
  // document.querySelectorAll(".ace_debug").forEach(element => {
  //     element.classList.remove("ace_debug");
  // });


  //editor.session.setBreakpoint(lineIndex-1)
  codeWindow.getEditor().session.removeMarker(lastDebugId);
  lastDebugId = codeWindow.getEditor().session.highlightLines(
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



function getDistanceFromPosition(checkCursor: HTMLDivElement, posX: number, posY: number) {
  const elemX = checkCursor.offsetLeft;
  const elemY = checkCursor.offsetTop;

  return Math.sqrt(Math.pow(elemX-posX, 2) + Math.pow(elemY-posY, 2))
  
}




  


export function displaynoVNC(container)
{
  const frame = document.createElement('iframe')
  // TODO Implement a better noVNC client
  const src = window.location.protocol+ +'//'+window.location.hostname+':8080/vnc_lite.html?bell=true&quality=5&resize=scale&path=novnc/websockify?token='+wsSessionId
  frame.src = 'https://'+window.location.hostname+':8080/vnc_lite.html?bell=true&quality=5&resize=scale&path=novnc/websockify?token='+wsSessionId
  frame.id = 'noVNC'
  if(activeConsole)
    activeConsole!.noVNC = frame
  container.appendChild(frame)
}

 const types = ("asm|__asm__|auto|bool|_Bool|char|_Complex|double|enum|float|" +
    "_Imaginary|int|int8_t|int16_t|int32_t|int64_t|long|short|signed|size_t|struct|typedef|uint8_t|uint16_t|uint32_t|uint64_t|union|unsigned|void|" +
    "class|wchar_t|template|char16_t|char32_t").split("|")

export function parseCode()
{
    const code = codeWindow.getEditor().session.getLines(0, 1000)
    let breadth = 0;
    const functions:{name: string, value: string, type: string, depth: number, tokenIndex:number, content: string}[] = [];
    const variables:{name: string, type: string, depth: number, tokenIndex:number, functionName: string}[] = [];
    let buffer = '';
    let args = '';
    let tokenIndex = 0;
    const tokens:{name: string, body: string, breadth: number, tokenIndex:number,}[] = [];
    
    for(const line of code)
    for(let i=0;i<line.length;i++)
    {
      
      const char = line[i];
      if(([' ', '\n', '\\n', '{', '}', ';'].includes(char) && buffer.trim()!='' && (args.at(-1)==')' || args==''))
      ) // why?
      {
        tokens.push({body: args, name: buffer.trim(),breadth: breadth, tokenIndex})
        args=''
        buffer=''
        continue
      }
      else
      {
          switch(char)
          {
            case "{":
              breadth++;
            continue
            case "}":
              tokenIndex++
              breadth--;
              continue
            case ";":
              continue;
            case '(':
              args+=char
              buffer+=char
              break
            case ')':
              args+=char
              buffer+=char
              break;
          }
          if(args[0] != '(' )  
            buffer+=char;
          else
            if(char!='(' && char!=')')
              args+=char
          
          
      }
      
    }

    
console.log(tokens)
    tokens.forEach((token,index) => {


      if(index!=0) // start from second token
        if(types.includes(tokens[index-1].name)) // get token before this token, think int name. name is current token, the one before will be the type.
       { // this will be valid for functions and variables.
          
          if(token.name.endsWith('()'))
          {
            if(tokens[index+1] == undefined) return;
            let content = tokens[index+1].body;
            let j=index+1;
            if(j<tokens.length && tokens[j].breadth !=undefined)
            while(tokens[j].breadth>token.breadth && j<=tokens.length && tokens[j+1] !=undefined)
              content+=tokens[++j].body;
            const funcName = token.name.substring(0, token.name.length-2)
            functions.push({name: funcName+token.body, value: addPlaceholdersToFunction(funcName, token), type: tokens[index-1].name, depth: token.breadth, content,tokenIndex: token.tokenIndex})
          }
          else
          {
            const functionName = functions.find(value => {
              return value.tokenIndex == token.tokenIndex
            })?.value as string;
            token.name.split(',').map(v => {
              if(isNaN(parseInt(v)))
                variables.push({name: v, type: tokens[index-1].name, depth: token.breadth, functionName,tokenIndex: token.tokenIndex})
            })
            
          }
       } 
      
          
    })

    console.log(variables)

    return {functions, variables}
}

function addPlaceholdersToFunction(funcName, token)
{
  /*
    $1,$2... - tab stops
    ${1:placeholder text}
    $0 - final position
  */
  const tokens = (token.body as string).substring(1,token.body.length-1).split(' ');
  let k=1;
  let buffer='';
  let type = '';
  console.log(tokens)
  for(let i=0; i<tokens.length; i++)
  {
    const token = tokens[i]
    
    if(types.includes(token))
    {
      type=token
      continue;
    }

    if(type)
      buffer += "${"+ k++ + ":" + type + '}'
    if(tokens.length-1 != i)
      buffer +=', '
  } 
  console.log(buffer)
  return `${funcName}(${buffer})`+"$0"
}

export function indexToFunctionName(parsedCode, index)
{
  const code = codeWindow.getEditor().session.getValue()
    let depth = 0;
    let tokenIndex = 0;
    for(let i=0;i<Math.min(index,code.length);i++)
    {
      
      const char = code[i];
          switch(char)
          {
            case "}":
              // if(depth-1==0)
                tokenIndex++
              break;

          }
          
      
      
    }
    if(parsedCode)
    return parsedCode.functions.find(value => {
      return value.tokenIndex == tokenIndex
    })
}


export async function downloadEditorFiles()
{
    fetch(`/editor/${wsSessionId}/downloadFiles`)
    .then(response => {
      if (!response.ok) throw new Error('Network error');
      return response.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'intelegeinfo-project.zip';  // You can name the zip whatever you like
      a.click();                  // Triggers the download
      URL.revokeObjectURL(url);  // Cleanup
    })
    .catch(err => displayMessagePopup('Download failed:'+ err));
}


export function onFileSessionUpdated(newFileName, client: SessionClient) {
  
  
    // if(document.getElementById('active-open-file'))
    //   document.getElementById('active-open-file')!.id = '';
    const elem = editorSessions.get(newFileName)?.fileElement!;
    console.log("elem: ", elem)
    if(currentFileName)
      if(currentFileName != newFileName)
      {
        
        const prevElem =  client.editorSession.find(val => val.fileElement?.name != newFileName)?.fileElement
        


        if(prevElem?.parentWindow == elem.parentWindow || client.clientId != wsClientId)
        {
          
          console.log('REMOVED USER IN onFileSessionUpdated')
          prevElem?.removeUser(client.clientId)
          // prevElem.fileElement?.element.classList.remove('open-file')
        }
        // else if(prevActiveTab != elem && prevActiveTab && (prevActiveTab as FileElement).removeUser)
        // {
        //   // prevElem.fileElement?.element.classList.remove('open-file');
        //   (prevActiveTab as FileElement).removeUser(client.clientId)
        // }
      }

      
    if(elem)
    {
      if(currentFileName !== newFileName)
        editorSessions.get(newFileName)?.fileElement!.addUser({name: client.displayName, color: client.color, id: client.clientId}, currentFileName)
        // editorSessions.get(newFileName)!.fileElement!.fileElem.id = 'active-open-file';
        // client.editorSession = editorSessions.get(newFileName)!
        var prevActiveTab = elem.parentWindow.previousActiveTab//elem.parentWindow.activeTab
        client.editorSession[editorSessions.get(newFileName)!.fileElement!.parentWindow!.index] = editorSessions.get(newFileName)! 
        clients.get(client.clientId)!.editorSession![editorSessions.get(newFileName)!.fileElement!.parentWindow!.index] = editorSessions.get(newFileName)! 
        // clients.get(client.clientId)!.editorSession! =  editorSessions.get(newFileName)!
        console.log(elem.parentWindow)
        elem.parentWindow.previousActiveTab?.element.classList.remove('open-file')
        elem.parentWindow.setActiveFile(elem)

        
        // elem.parentWindow.activeTab = elem
        // elem.parentWindow.activeTab?.element.classList.add('open-file')
    }

    

    currentFileName = newFileName;
  }
function sandboxHead()
{
  console.log = (data) => 
    {
      let parsedData = data;
      switch(typeof data)
      {
        case 'object':
          parsedData = JSON.stringify(data);
          break
        default:
          parsedData = data.toString()
      }
      document.body.innerText += parsedData
      document.body.innerHTML += "<br>"
    }

}

  function createSandbox(fileName, existingCode?)
  {
    const editor = editorSessions.get(fileName)?.editor;
    if(!editor)
      return
    const code = existingCode ? existingCode : editor.getValue()
    const codeScript = createNode('script', {htmlSting: code})
    const headScript = createNode('script', {htmlSting: sandboxHead.toString() + "\n sandboxHead()"})
    const frame = createNode('iframe', {attributes: [{name: 'src', value: 'about:blank'}]})
    frame.srcdoc =
    `<head>
    ${headScript.outerHTML}
    <!-- debug from here -->
   
    </head>
    <body style="color: white; font-family: monospace; overflow-wrap: break-word;">
     ${codeScript.outerHTML}
    </body>`

    return frame
    // const doc = frame.contentWindow!.document
    // doc.open()
    // doc.writeln(createNode('script', {innerText: code}).outerHTML)
    // doc.close()
  }

  