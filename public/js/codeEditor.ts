// Ensure Ace Editor is globally available or import it properly

import { Ace } from "ace-builds";

// import * as ace from "ace-builds";
declare const ace: any

const AceRange = ace.require("ace/range").Range;
    

    
    






    function getCompiledCode()
        {
            return fetch("http://localhost:3000/getCompiledCode", {
                method: "GET",
                
            });
        }


    function parseArray(str: string) {
        // Extract the value (x) and number of repeats (y) using a regular expression
        const match = str.match(/([^<]+) <repeats (\d+) times>/);

        if (match) {
            // Get the value (x) and number of repetitions (y)
            const value = match[1].trim();  // x (strip any extra spaces)
            const times = parseInt(match[2], 10);  // y (convert to integer)
            
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

        constructor(name: string, value: string | number | any[], type: string | undefined, updatedIndices: { index: number; old: any; new: any }[] = []) {
            this.varname = name;
            this.value = value;
            this.type = type;
            if (type === 'array' && updatedIndices.length > 0) {
                this.updatedIndices = updatedIndices;
                this.indexes = [];
            }
        }
    }

    const variableStore = new Map<string, Variable>();

    function parseDebuggerOutput(input: string, {
    onNewVariable = (newVar: Variable) => {},
    onArrayIndexChange = (name: string, change: { index: number; old: any; new: any; }) => {},
    } = {}) {
    const cleanedInput = input
        .replace(/\(gdb\)/g, '')
        .replace(/\n\s*/g, ' ')
        .trim();

    const regex = /(\w+)\s*=\s*(.*?)(?=\s+\w+\s*=|$)/g;

    let match;
    while ((match = regex.exec(cleanedInput)) !== null) {
        const name = match[1];
        const rawValue = match[2].trim();

        let type: 'string' | 'int' | 'array' = 'string';
        let value: string | number | any[] = rawValue; // might be broken

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
            } else {
            array.push(parseInt(valMatch[0], 10));
            }
        }

        value = array;
        } else if (!isNaN(Number(rawValue))) {
        type = 'int';
        value = Number(rawValue);
        }

        const existing = variableStore.get(name);

        if (!existing) {
        const newVar = new Variable(name, value, type);
        variableStore.set(name, newVar);
        onNewVariable(newVar);
        } else if (type === 'array' && existing.type === 'array') {
        const updatedIndices = [];

            for (let i = 0; i < Math.max((existing.value as any[])?.length, (value as any[]).length); i++) {
                if (Array.isArray(existing.value) && existing.value[i] !== (value as any[])[i]) {
                const change = { index: i, old: existing.value[i], new: (value as any[])[i] };
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
    let debugLine=1; // debug row
    let lastDebugId: any;

    var editor: Ace.Editor = ace.edit("editor", {
        mode: "ace/mode/c_cpp",
        enableLiveAutocompletion: true,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        placeholder: "hello",
        tooltipFollowsMouse: true,
        animatedScroll : true,
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
    editor.resize()
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
    getCompiledCode()
    .then(function(response) {
        return response.json();
    }).then(function(data) {
         code = data.code;
        editor.session.setValue(code)
    });

     // standardise the json
     function sendWebsocketCommand(cmd: string,argsArr: string[]=[])
     {
         ws.send(JSON.stringify({command: cmd , args: argsArr}));
     }


    function addGhostMarkers(editor: { getSession: () => any; renderer: { $textLayer: any; }; _ghostMarkerIds: any[]; }, word: string | any[], ghostText: string | null) {
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
            tokens.forEach((token: { value: string | any[]; }) => {
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

        function findTokenPositions(editor: { getSession: () => any; }, targetWord: any) {
            const session = editor.getSession();
            const tokenizer = session.getMode().getTokenizer();
            const positions: { row: number; column: number; }[] = [];

            for (let row = 0; row < session.getLength(); row++) {
                const line = session.getLine(row);
                const tokens = tokenizer.getLineTokens(line, session.getMode().$id).tokens;

                let column = 0;
                tokens.forEach((token: { value: string | any[]; }) => {
                if (token.value === targetWord) {
                    positions.push({ row, column });
                }
                column += token.value.length;
                });
        }

        return positions;
        }
        function clearGhostMarkers(editor: { getSession: () => any; _ghostMarkerIds: any[]; }) {
            const session = editor.getSession();
            if (editor._ghostMarkerIds) {
                editor._ghostMarkerIds.forEach((id: any) => session.removeMarker(id));
                editor._ghostMarkerIds = [];
            }
        }


        function writeOutput(data: string) 
        {
            if (outputArea) {
                outputArea.textContent += data + "\n";
                outputArea.scrollTop = outputArea.scrollHeight;
            }
        }
                
    
    //websocket
    const ws = new WebSocket("ws://localhost:8080");
    let consoleText="";
    let variables: any[] = [];
    const variableArrayIndexes: number[] = [];
    function submitConsole(elem: HTMLInputElement | null)
    {
        const sendText = elem?.value.replace(consoleText, "") || "Error: invalid element";
        console.log(sendText);
        sendWebsocketCommand(sendText,["console"])//ws.send({command: sendText, args: ['console']});
        consoleText=elem?.value || "Error: invalid element";
    // console.log(elem.value)
    }

    const outputArea = document.getElementById("output");

   

    ws.onmessage = (event) => {
        let eventJson = JSON.parse(event.data);
        let command = eventJson.message;
        let data = eventJson.body;
    
        writeOutput(data)
        
        
        
        const session = editor.getSession();
        const doc = session.getDocument();

        const text = doc.getValue();



        


        async function asyncExecuteCommand(command: string)
        {
            return await fetch("/requestValue?value="+command,{cache: "no-store"});
        }
        

        // handle variables
        if (command=="info locals") {
            
            const variablesSection = document.getElementById("variables");
            let unprocVariables;
            const textToVar = data.split('(gdb)').pop()?.replace(/\n/g, ';').match(/(?<!\w\S)(\b\w+)\s*=.*/g);
            if(command=="info locals") //if we have variables in the chunk
            {
                
                variables = parseDebuggerOutput(data, {onNewVariable: (variable) =>
            {
                if(variable.type !="array") return;
                createDisplayVector(variable)
                //console.log("created display vector")
            },

    onArrayIndexChange: (variableName: any, changes: { new: any; index: any; }) =>
    {
       
            updateDisplayVectorElement(new Variable(variableName, changes.new, "array"), changes.index)
            // console.log(changes.updatedIndices)
        
    }})
            
            }
             


            // set variables
           
                
            for (let index = 0; index < variables.length; index++) {
                const element = variables[index];
                if(variables.length==0) break;

            
            //array type
                if(element.type=="array") 
            
                updateDisplayVector(element);
            
            }
       }
        else {

            if(data.match(/^(\d)+(?=\s)?/gm)!=null) //check if its a chunk with line number
        {
            debugLine = parseInt(data.match(/^(\d)+(?=\s)?/gm)); // update debug row
            setDebugLineStyle(debugLine);

            const conditionRegex = /(?:if|while)\s*\(([^(){};]+?)\)/g;
            const forRegex = /for\s*\(([^;]*);([^;]*);[^)]*\)/g;

            let conditions = [];
            let buffer = "";
            const debugLineText = session.getLine(debugLine-1);
            const pos = {row: debugLine-1, column: debugLineText.length}
           
            // Match `if` and `while`
            for (const match of data.matchAll(conditionRegex)) {
            conditions.push(match[1].trim());
            }

            // Match `for` loops (only the 2nd part — the condition)
            for (const match of data.matchAll(forRegex)) {
            conditions.push(match[2].trim());
            }

            console.log(conditions)
            setTimeout(() => {
                let i=1;
                for(const  condition  of conditions)
                {
                
                    console.log(condition)
                    asyncExecuteCommand(condition).then(function(response) {
                    return response.json();
                }).then(function(data) {
                    const exprValue = data.body.toString();
                    
                    buffer += (exprValue.replace(exprValue.match(/\$\d*/), condition) + "; ").replace("(gdb)", "").replace("\n", "")
                    console.log(buffer)
                    if(i++ == conditions.length)
                        {
                            renderer.setGhostText("   " + buffer,pos);
                            console.log(buffer)
                            buffer = "";   
                            
                        }
                });   
                 
            }

            }, 500);
            

            const regex = /(\b(?<=^(\d)+(?=\s)?\s*)(\w*)(\[(\w|\d)\]))|(?<=[(-/])(\w*)(\[(\w|\d)\])/g;
            if(data.match(regex)!=null) 
                data.match(regex).forEach((variable: { indexes: any[]; }) => {
                    const vararr = regex.exec(data);
                    if(!vararr) return;
                    let varName = vararr[3] 
                    if(!varName) varName = vararr[6];
                    let varIndex = vararr[5]
                    if(!varIndex) varIndex = vararr[8];
                    console.log(variables)
                    const indexCode = varIndex.charCodeAt(0);
                    if(variables.find((vari) => vari.varname === varIndex))
                {
                    
                    const index = variables.find((vari) => vari.varname === varIndex).value;
                    variable.indexes[indexCode] =  index;
                    //console.log(index)
                    //document.getElementById(varName).children[index].classList.add("active-vector-element");
                    removePrevActiveElem(index, varName, varIndex) // TODO remove +1
                    const vectorElem = document.getElementById(varName) as HTMLSpanElement;
                    (vectorElem.children[index] as HTMLElement).style.outlineColor = "#" + Math.floor(16777215%(varIndex.charCodeAt(0)/100)*16777215).toString(16);
                    //document.getElementById(varName).setAttribute("activeIndex", index);
                    //getDisplayVectorElement(makeVariableRefByName(varName), index).parentElement.setAttribute("activeIndex", index);
                }
                });

        }

        }


       if(data[0]==data.match(/^(\d)(?=\s)?/gm))
        {
            setDebugLineStyle(debugLine);

        }
       
    };

    function removePrevActiveElem(index: any, varName: string, varIndex: string)
                    {
                            if(variableArrayIndexes[varIndex.charCodeAt(0)]) 
                        {
                            const vectorElem = document.getElementById(varName);
                            if (vectorElem) {
                                const prevElem = vectorElem.children[variableArrayIndexes[varIndex.charCodeAt(0)]] as HTMLSpanElement;
                                prevElem.classList.remove("active-vector-element");
                                prevElem.style.outlineColor = "initial";
                            
                                prevElem.classList.remove("active-vector-element")
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
            const output = document.getElementById("output") as HTMLInputElement;
            if(!output) return;
            output.textContent = data.success ? "Compilation successful!\n" : data.error;
            code = editor.getValue();
        });
    }



    function sendDebugCommand(cmd: string) {
        //editor.setValue(code, -1);
        sendWebsocketCommand(cmd,[]) //ws.send(JSON.stringify({command: cmd , args: []}));
        if(cmd=="next" || cmd == "continue") sendWebsocketCommand('info locals',[]) // ws.send({command: 'info locals' , args: []});
        const consoleElem = document.getElementById('console') as HTMLInputElement;
        if(cmd=="execute" && consoleElem?.value!="") submitConsole(consoleElem);
    }
   
    function playback()
    {
        sendDebugCommand("run");
        onRun();
        let i=debugLine;
        const playback = setInterval(() => {
            sendDebugCommand("next")
            if(debugLine>=editor.session.getLength())
        {
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
    
    function setDebugLineStyle(lineIndex: number) {
        // document.querySelectorAll(".ace_debug").forEach(element => {
        //     element.classList.remove("ace_debug");
        // });
       
        //editor.session.setBreakpoint(lineIndex-1)
        editor.session.removeMarker(lastDebugId);
        lastDebugId = editor.session.highlightLines(lineIndex-1, lineIndex-1, "").id;
        //document.querySelectorAll(".ace_text-layer > .ace_line")[lineIndex-1].classList.add("ace_debug");
    }

    
    function displayVector(array: any[], vectCont: HTMLDivElement | null)
    {
       // TODO make vect cont an array based of vector name (aka index of ascii number)
      //  vectCont.innerHTML ="";c 
        let i=0;
       // console.log(array);
       if(!vectCont) return;
        array.forEach((element: any) => {
            
            vectCont.innerHTML += `<span style="background-color: rgb(${(element)*50+50},${(element)*50+50},${(element)*50+50})"><index>${i++}</index>${element}</span>`
        });
    }
    let vectDisplays = [];
    function createDisplayVector(variable: Variable)
    {
       // console.log(variable)
       if(variable.type!="array") return;
      // vectDisplays.add(variable)
       
        const vectorContainer = document.getElementById('vector-container');
        if (vectorContainer) {
            vectorContainer.innerHTML += `<div id=${variable.varname} class='vector-display'><div class='vector-header'><h>${variable.varname}</h><button onclick='resizeVectorContainer(this)'>x</button></div><div class='item-container'></div></div>\n`;
        }
        if (Array.isArray(variable.value)) {
            displayVector(variable.value, document.getElementById(variable.varname)?.getElementsByClassName('item-container')[0] as HTMLDivElement | null);
        }
    }

    function resizeVectorContainer(elem: HTMLDivElement)
    {
        const itemContainer = elem.parentElement?.parentElement?.getElementsByClassName('item-container')[0] as HTMLDivElement | null;
        if (itemContainer) {
            itemContainer.style.height = itemContainer.style.height === '0px' ? 'auto' : '0px';
            itemContainer.style.minHeight = itemContainer.style.minHeight === '0px' ? '100px' : '0px';
            itemContainer.style.overflow = itemContainer.style.overflow === 'hidden' ? 'visible' : 'hidden';
           // itemContainer.style.display = itemContainer.style.display === 'none' ? 'flex' : 'none';
        }
    }
    function updateDisplayVector(variable: any)
    {
       // displayVector(variable.value, document.getElementById(variable.varname))
    //    variable.values.forEach(vari => {
    //     updateDisplayVectorElement(variable, vari.index)
    //    });
    }


    let activeElem;


    function updateDisplayVectorElement(variable: Variable,index: any)
    {
        const elem = getDisplayVectorElement({ varname: variable.varname }, index)//class="active-vector-element"
        if(!elem) return;
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

    function getDisplayVectorElement(variable: { varname: string; }, index: number)
    {
        
        return document.getElementById(variable.varname)?.getElementsByClassName('item-container')[0].children[index]; // offset by the ammount of default children aka the header of the container
    }
   

    

