import { UUID } from "crypto";
import { getCookie } from "./codeEditor.js";
declare global {
    interface Window {
        editor: any
    }
}

abstract class IElement {
    parentElement: HTMLElement | undefined
    
    constructor(parentElem?:HTMLElement) {
        this.appendRender(parentElem)
    }

    abstract render(...args): Node | Promise<Node>

    public stylesheet(style: string): HTMLStyleElement
    {
        const elem = document.createElement('style')
        elem.innerText = style;
        return elem
    }

    private appendRender(parentElem) {
        if(parentElem)
        {
            this.parentElement = parentElem
            return new Promise<void>(async (resolve, reject) => {
                parentElem.appendChild(this.render() as Node)  
                resolve()
            })
         }
    }

    
}

export function createNode
<K extends keyof HTMLElementTagNameMap>
(tag: K, options?: {innerText?: string, css?: string, className?: string, id?: string, html?: (Node | undefined)[],
 htmlSting?: string, attributes?: ({name: string, value: string}|undefined)[], onclick?: (ev) => void,
onchange?: (ev) => void, onhover?: (ev: MouseEvent) => void}): HTMLElementTagNameMap[K]
    {  
        const elem = document.createElement(tag)
        if(options)
        {
            if(options.css)
                elem.style.cssText = options.css
            if(options.className)
                elem.className = options.className
            if(options.id)
                elem.id = options.id
            if(options.innerText)
                elem.innerText = options.innerText
            if(options.html)
                for(const node of options.html)
                    if(node)
                        elem.appendChild(node)
            if(options.attributes)
                for(const attribute of options.attributes)
                    if(attribute)
                        elem.setAttribute(attribute.name, attribute.value)
            if(options.htmlSting)
                elem.innerHTML = options.htmlSting;
            if(options.onclick)
                elem.onclick = options.onclick
            if(options.onchange)
                elem.onchange = options.onchange
            if(options.onhover)
                elem.onmouseover = options.onhover
        }       
        

        return elem
    }

export class Dock extends IElement {

    

    render() {
        const loggedIn = getCookie('iiauthstate') == 'true';
        const username = '';
        
        const t = loggedIn ? 
        `<img src="../media/icons/home.svg"><p>home</p>,
        <img src="../media/profile-round-1346-svgrepo-com.svg"><p>profile</p>,
        <img src="../media/notebook-svgrepo-com.svg"><p>proiecte</p>,
        <img src="../media/icons/group_search.svg"><p>join</p>` 
        :
        `<img src="../media/icons/home.svg"><p>home</p>,
        <img src="../media/icons/person_add.svg"><p>signup</p>,
        <img src="../media/icons/account_box.svg"><p>login</p>,
        <img src="../media/icons/group_search.svg"><p>join</p>` 
                const arr: Node[] = []

        arr.push(this.stylesheet(`
        .dock-button
        {
            background-color:rgba(32, 32, 32, 0.38);
            backdrop-filter: blur(5px);
            border: 2px solid rgba(255, 255, 255, 0.1);
            text-align: center;
            position: relative;
            z-index: 1;
            border-radius: 0.5em;
            cursor: pointer;
            text-decoration: none;
            font-family: Poppins;
            font-size: 0.75em;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .dock-button img
        {
            width: 25px;
            height: 25px;
        }
        .dock-button p 
        {
            display: block;
            position: absolute;
            transition-duration: 0.3s;
            top: 0;
            opacity: 0;
            text-align: center;
            z-index: 0;
            color: white;
            text-decoration: none;
            left: 50%;
            transform: translateX(-50%);
            padding: 0.25em;
            background-color: rgba(19, 19, 19, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.13);
            min-width: 50px;
            border-radius: 5px;
            backdrop-filter: blur(5px);
        }
        .dock-button:hover p
        {

            top: -50px;
            opacity: 1;
        }

        #content-container :only-child
        {
            grid-column: span 3 !important;
        }
        h2 
        {
            font-family: Poppins;
            font-size: 0.75em; margin: 10px;
        }
        
        `.trim().replaceAll('\n', '  ')))
            const func = loggedIn ?
        [
            '/',
            '../profile',
            () => window.editor.listProjects(),
            () => window.editor.joinsession(),
        ] :
        [
            '/',
            '../signup',
            '../login',
            () => window.editor.joinsession(),
        ]
        
        

        t.split(',').forEach((element,index) => {
            if(typeof func[index] != 'string')
            {
                const elem = createNode('button', {className: 'dock-button custom-button', attributes: [{name: 'href', value: '/'}], htmlSting: element})
                elem.onclick = func[index]
                arr.push(elem)
            }
            else
                arr.push(createNode('a', {className: 'dock-button', attributes: [{name: 'href', value: func[index]}], htmlSting: element}))
           
        });

       
        const container = createNode('div', {id: 'button-container', css: ` width: 100%; grid-column: 2; position: relative;display: flex; gap: 0.75em; height: 50px;   align-items: flex-end; justify-content: space-between; `,html: arr})
         const mainContainer = createNode('div', {id: 'content-container', html: username? [container,  createNode('h2', {innerText: `Hey, ${username}!`})] : [container], css: "gap: 0.5em; padding: 0.5em; justify-items: center; transition-duration: 1s; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; position: relative; min-height: 50px; border: 2px solid rgba(255, 255, 255, 0.1); background: #00000061; backdrop-filter: blur(5px); border-radius: 0.75em;"}) // grid-auto-flow: column;
        const base = createNode('div', {id:'dock',
        css: "display: flex; justify-content: center; flex-direction: column; grid-row: -2/-1; min-width: 300px;  align-self: center; justify-self: center; grid-column: 1 / -1;",
        html: [createNode('p', {htmlSting: "IntelegeInfo", css: "top: -10px; position: relative; margin: 0.25em; font-size: 1.25em;  color:rgb(228, 228, 228);text-shadow: 3px 4px 3px black; text-align: center; font-family: 'Playwrite DK Loopet', 'Courier New', Courier, monospace;"}), mainContainer]})
        
        
        if(hasRequestAnimationFrame)
            requestAnimationFrame(() => updatePositions(10,10))

        let timeout;
        let lastX = 0;
        let lastY = 0;
        function updatePositions(x,y)
        {   
            const bottom = base.clientWidth > 200;
            lastX = x;
            lastY = y;
            const parentElem = mainContainer
            const translateOffsetX = 0// base.offsetWidth/2
            const translateOffsetY = 0//base.offsetHeight/2
            const parentX = parentElem.offsetLeft + container.offsetLeft 
            const parentY = parentElem.offsetTop  + container.offsetTop

            const percX = (x - parentX) / (parentElem.offsetWidth) 
            const percY = (y - parentY) / (parentElem.offsetHeight)
            const children = container.querySelectorAll('.dock-button') as NodeListOf<HTMLAnchorElement | HTMLDivElement>
            
            base.style.left = children[children.length-1].offsetLeft + "px"
            for(const child of children)
            {
                
                const childWidth = child.offsetWidth
                const childHeight = child.offsetHeight
                const dist = Math.max(0, Math.min(25, 25 - (Math.sqrt(Math.pow((child.offsetLeft + childWidth/2 - translateOffsetX) / parentElem.offsetWidth - percX,2)
                + Math.pow(((child.offsetTop - translateOffsetY + childHeight/1.5) / parentElem.offsetHeight - percY)/2,2 )))*35))

                child.style.width = child.style.height = Math.max(50, Math.min(100, dist*2.5)) + "px";
                bottom ? child.style.bottom =Math.max(0, Math.min(100,Math.sqrt(dist*5))) + "px" : child.style.left =Math.max(0, Math.min(100,Math.sqrt(dist*5))) + "px";;
                const shadow = Math.max(0, Math.min(30, Math.sqrt(dist*1)))
                child.style.boxShadow = `${shadow/4}px ${shadow*2}px ${shadow*2}px ${shadow}px rgba(0, 0, 0, 0.5)`
            }

        }
        if(hasRequestAnimationFrame)
            document.addEventListener('pointermove', function(ev) {
            if(hasRequestAnimationFrame)
            if(ev.pointerType == 'mouse' )
                requestAnimationFrame(() => updatePositions(ev.x,ev.y))
            else
                base.classList.add('touch')
                
            })
        return base
        
    }
}
export function createButton( icon, options: {href?, onclick?: () => void, class?, style?})
{

    return createNode('div', {html: [createNode('div', {html: [createNode('a', {css: `--link: url(../media/icons/${icon});`, attributes: options.href ? [{name: 'href', value: options.href}] : undefined})]})], className: 'toolbar-button-container '+ options.class, onclick: options.onclick, css: options.style})
}
export class Toolbox extends IElement {

    render(): HTMLElement {

        const loggedIn = getCookie('iiauthstate') == 'true';
        const username = '';
        const loggedinbuttons = 
        loggedIn ?
        [
            createButton('notebook-svgrepo-com.svg', {onclick: () => window.editor.listProjects()}),
            createButton('passkey.svg', {href: '/profile'})
        ] 
        :
        [
            createButton('person_add.svg', {href: '/signup'}),
            createButton('passkey.svg', {href: '/login'})
        ]   
        const buttons = [
            createButton('home.svg', {href: '/'}),
            ...loggedinbuttons,
            createButton('action_key.svg', {onclick: () => {
                window.editor.joinsession()
            }, class: "toolbox"}),
        ]

        
        const innerToolbox = createNode('div', {html: buttons, className: 'inner-toolbar'})
        const hideButton = createButton('button', {
            class: "hide-button",
            onclick: () => {
            toobloxContainer.classList.toggle('hidden')
            hideButton.classList.toggle('closed')
        }})
        const toobloxContainer = createNode('div', {className: 'toolbar-container', html: [innerToolbox]})

        const toolboxArea = createNode('div', {html: [hideButton,toobloxContainer], className: "toolbox-area"})
        // setTimeout(() => {
        //     const buttons = [
        //         createButton('play_arrow.svg', {onclick: () => {
        //             window.editor.sendDebugCommand('execute')
        //         }, class: "toolbox"}),
        //     ]

        
        //     const editorControls = createNode('div', {html: buttons, className: 'inner-toolbar'})
        //      toobloxContainer.prepend(editorControls)
        //      editorControls.animate([
        //             {maxWidth: '0', overflow: 'hidden'},
        //             {maxWidth: '80px', overflow: 'initial'}
        //         ], {
        //             duration: 300,
                    
        //         })

        //     for(const button of buttons)
        //         button.animate([
        //             {opacity: '0'},
        //             {opacity: '100%'}
        //         ], {
        //             duration: 300
        //         })

        // }, 1000);
        this.parentElement = toolboxArea
        return toolboxArea;

       
    }
    public addSection(htmlChildren: HTMLElement[], id): HTMLElement
    {
        const editorControls = createNode('div', {html: htmlChildren, className: 'inner-toolbar', id})
        this.parentElement!.children[1].prepend(editorControls)
        return editorControls!
    }
}

export class Pixelated extends IElement {

    canvas: HTMLCanvasElement | undefined
    async render({x=1000, y=500, spacingX = 10,spacingY = 10, pointSize=2, innerVignette=1,outerVignette=1, 
        timeScale=0.5, hover = false, trasnlate = 1, power = 1, offset=10, manualAngle = 0, animatedAnglePow = 1,
        useMouseAngle = 0, randomness = 1}): Promise<Node> {
        if(!this.canvas)
            this.canvas = document.createElement('canvas')
        this.canvas.width = x;
        this.canvas.height = y;
        const ctx = this.canvas.getContext("2d")!
        // const spacing = 10;
        // const pointSize = 2;

        let time =0
        let alpha = 1;
        const canvas = this.canvas
        const perlin = new ImprovedPerlinNoise3D(Date.now());
        
            async function update() {
                    const hx = canvas.width;
                    const hy = canvas.height;
                    
                    time += 1/60  * 60 * timeScale;
                    const z = time
                    // if(alpha==0)
                         ctx.clearRect(0,0,hx,hy)
                    const angle = !manualAngle ? Math.PI / 4 * time/10/animatedAnglePow : (Math.PI / 2 * manualAngle)

                    for(let x=0; x<hx; x+=spacingX)
                        for(let y=0; y<hy; y+=spacingY)
                        {
                            const randOffset = (Math.random()-0.5)*2 * randomness
                            const height = perlin.turbulence(x+0.5,y+0.5,z, 64)
                            const dist =    Math.max(Math.max(0, Math.min(1,Math.sqrt(Math.pow(hx/2-x,2) + Math.pow(hy/2-y,2)) / hx)) * 10,innerVignette)
                            const outdist = Math.max(1- Math.pow(Math.max(0, Math.min(1,Math.sqrt(Math.pow(hx/2-x,2)/hx/500*2+ Math.pow(hy/2-y,2)/hy/300*2))),2),outerVignette)
                            const alphadist = 1 - Math.max(0, Math.min(1,Math.sqrt(Math.pow(hx/2-x,2)/hx/100 + Math.pow(hy/2-y,2))/hy/100))
                            const value = Math.round(Math.abs(Math.pow((Math.max(-1,Math.min(1,height))+1-dist/5),power))*200*dist*outdist+offset) //* Math.min(1,z/10)*(y-y*(1-perspective))/hy
                            // const hex = value.toString(16).repeat(3)

                            // perlin.getDirection(x,y,z)
                            if(value>20)
                            {   
                                const cx = x+Math.sin(angle + randomness * value/255)*value/50 
                                const cy = y+Math.cos(angle + randomness* value/255)*value/50
                                const tx = cx*trasnlate
                                const ty = cy*trasnlate
                                const valScaledSize = Math.min(Math.abs(pointSize)*value/255,Math.abs(pointSize))
                                ctx.beginPath()
                                ctx.clearRect(tx-valScaledSize/2,ty-valScaledSize/2,cx,cy)
                                if(pointSize<0)
                                    ctx.rect(tx,ty, valScaledSize,valScaledSize)
                                else
                                    ctx?.arc(tx,ty,valScaledSize,0,2*Math.PI)
                                ctx.stroke()
                                ctx.fillStyle = `rgb(${value}, ${value}, ${value})`//'#' + hex
                                ctx.fill()
                            }
                            

                        }
                     requestAnimationFrame(update)           
        }
                update()
        // setInterval(update, 10);       
        let updateint;
        function inc(delta)
        {
            alpha = Math.max(0, Math.min(1, alpha + delta))
            if(alpha < 0 && delta> 0)
                requestAnimationFrame(() => inc(delta))
            else if (alpha > 0 && delta<0)
                requestAnimationFrame(() => inc(delta))   
        }
        if(hover)
        {
            this.canvas.onmouseover = (ev) => {
                //  clearInterval(updateint)
             requestAnimationFrame(() => inc(0.1))
             
           alpha = 1
        }      
        this.canvas.onmouseleave = ev => {
            
                //    clearInterval(updateint)
                
                
                requestAnimationFrame(() => inc(-0.01))
            // requestAnimationFrame(() => {
            //     alpha = Math.max(0, Math.min(1, alpha - 0.05))
            //     inc
            // });
            alpha = 0
        }
        }
        
        
        return this.canvas
    }
}

export const hasRequestAnimationFrame =
  typeof window.requestAnimationFrame === 'function' ||
  typeof (window as any).webkitRequestAnimationFrame === 'function' ||
  typeof (window as any).mozRequestAnimationFrame === 'function' ||
  typeof (window as any).oRequestAnimationFrame === 'function' ||
  typeof (window as any).msRequestAnimationFrame === 'function';

class ImprovedPerlinNoise3D {
    private permutation: number[];
    private grad3: [number, number, number][];

    constructor(seed: number = Math.random() * 2147483647) {
        // Initialize gradient vectors - 12 vectors from center of cube to edges
        this.grad3 = [
            [1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0],
            [1,0,1], [-1,0,1], [1,0,-1], [-1,0,-1],
            [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1],
            // Duplicate to prevent modulo operations
            [1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0]
        ];

        // Initialize permutation table
        this.permutation = new Array(512);
        
        // Fill with 0-255
        const p = new Array(256);
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        // Shuffle using Fisher-Yates with seed
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(this.random(seed++) * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }

        // Duplicate for overflow
        for (let i = 0; i < 512; i++) {
            this.permutation[i] = p[i & 255];
        }
    }

    private random(seed: number): number {
        const x = Math.sin(seed) * 43758.5453;
        return x - Math.floor(x);
    }

    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    private grad3D(hash: number, x: number, y: number, z: number): number {
        // Ensure hash is within bounds of grad3 array
        const h = hash % 16;
        const grad = this.grad3[h];
        return grad[0] * x + grad[1] * y + grad[2] * z;
    }

    public noise3D(x: number, y: number, z: number): number {
        // Find unit cube that contains point
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        // Find relative x,y,z of point in cube
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        // Compute fade curves for x,y,z
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        // Hash coordinates of the 8 cube corners
        const A = this.permutation[X] + Y;
        const AA = this.permutation[A] + Z;
        const AB = this.permutation[A + 1] + Z;
        const B = this.permutation[X + 1] + Y;
        const BA = this.permutation[B] + Z;
        const BB = this.permutation[B + 1] + Z;

        // Add blended results from 8 corners of cube
        return this.lerp(w, 
            this.lerp(v, 
                this.lerp(u, 
                    this.grad3D(this.permutation[AA], x, y, z),
                    this.grad3D(this.permutation[BA], x - 1, y, z)
                ),
                this.lerp(u,
                    this.grad3D(this.permutation[AB], x, y - 1, z),
                    this.grad3D(this.permutation[BB], x - 1, y - 1, z)
                )
            ),
            this.lerp(v,
                this.lerp(u,
                    this.grad3D(this.permutation[AA + 1], x, y, z - 1),
                    this.grad3D(this.permutation[BA + 1], x - 1, y, z - 1)
                ),
                this.lerp(u,
                    this.grad3D(this.permutation[AB + 1], x, y - 1, z - 1),
                    this.grad3D(this.permutation[BB + 1], x - 1, y - 1, z - 1)
                )
            )
        );
    }

    public turbulence(x: number, y: number, z: number, size: number = 32): number {
        let value = 0;
        let initialSize = size;

        while (size >= 1) {
            value += Math.abs(this.noise3D(x / size, y / size, z / size)) * size;
            size /= 2;
        }

        return value / initialSize;
    }

    public fractalNoise(
        x: number,
        y: number,
        z: number,
        octaves: number = 6,
        persistence: number = 0.5,
        lacunarity: number = 2.0
    ): number {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }

        public noiseWithGradient(x: number, y: number, z: number): [number, number, number, number] {
        const eps = 0.0001; // Small offset for finite differences
        
        // Central difference calculation
        const n0 = this.noise3D(x, y, z);
        const nx = this.noise3D(x + eps, y, z);
        const ny = this.noise3D(x, y + eps, z);
        const nz = this.noise3D(x, y, z + eps);
        
        // Finite differences
        const gx = (nx - n0) / eps;
        const gy = (ny - n0) / eps;
        const gz = (nz - n0) / eps;
        
        return [n0, gx, gy, gz];
    }

    /**
     * Reliable angle calculation (2D)
     */
    public get2DAngle(x: number, y: number): number {
        const [_, gx, gy] = this.noiseWithGradient(x, y, 0);
        
        // Handle zero gradient case
        if (Math.abs(gx) < 0.001 && Math.abs(gy) < 0.001) {
            return Math.random() * Math.PI * 2; // Random direction if flat
        }
        
        return Math.atan2(gy, gx);
    }

}

// Safe usage example:

interface Point {
    x,
    y
}
enum EditorCanvasDrawType
{
    draw = 'draw',
    start = 'start',
    end = 'end',
    
}
export class EditorCanvas extends IElement {

    canvas: HTMLCanvasElement = createNode('canvas', {css: 'touch-action: none'});
    ctx: CanvasRenderingContext2D = this.canvas.getContext('2d')!
    h = this.canvas.height;
    w = this.canvas.width;
    isDrawing = 0 //0 no, 1 user, 2 remote
    ws: WebSocket;
    clientId: UUID;
    strokeIndex: number = 0
    public updateSize() {
        const rect = this.canvas.parentElement!.getBoundingClientRect();   // actual size of canvas el. itself
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.h = this.canvas.height;
        this.w = this.canvas.width;
        // console.log(this.w)

        this.onUpdate()
    }
    render() {
        if(!this.canvas)
        {
            this.canvas =  createNode('canvas');
            this.ctx = this.canvas.getContext('2d')!
        }
        return this.canvas
    }
    public remove() {

        this.canvas.remove()
    }
    private async onUpdate()
    {
        
        this.ctx.fillStyle ='white'
        this.ctx.strokeStyle = 'black'
        this.ctx.fillRect(0,0,this.w,this.h)
        this.ctx.lineWidth = 5;
        
        this.canvas.addEventListener('pointerdown', ev => {
            
            if(ev.pointerType!='pen')
            {
                this.isDrawing = 1
                this.beginDraw(this.relativeToCanvas({x: ev.offsetX,y:ev.offsetY}))
            } 
            else if(this.isDrawing == 0)
            {
                                this.isDrawing = 1

                this.beginDraw(this.relativeToCanvas({x: ev.offsetX,y:ev.offsetY}))
            }
            else
            
                this.draw(this.relativeToCanvas({x: ev.offsetX,y:ev.offsetY}))
        })
        this.canvas.addEventListener('pointermove', ev => {
            // if(ev.pointerType!='pen')
            if(this.isDrawing == 1)
                this.draw(this.relativeToCanvas({x: ev.offsetX,y:ev.offsetY}))
            // setTimeout(() => {
            //     this.isDrawing = 0 
            // }, 1000);
        })
        this.canvas.addEventListener('pointerup', ev => {
            if(this.isDrawing != 1)
                return
            this.isDrawing = 0
            this.endDraw()
        })
    }

    relativeToCanvas(coords: Point): Point
    {
        return {x: coords.x, y: coords.y}
    }
    
    beginDraw(coords: Point)
    {
        this.strokeIndex = 0;
        this.ctx.beginPath()
        this.ctx.moveTo(coords.x, coords.y)
        if(this.isDrawing==1)
        this.replicateDraw(EditorCanvasDrawType.start, {x: coords.x, y: coords.y, color: 'black', width: 2})
    }
    draw(coords: Point) {
        this.strokeIndex++
        this.ctx.lineTo(coords.x, coords.y)
        this.ctx.stroke()
        if(this.strokeIndex%5==0 && this.isDrawing==1)
        this.replicateDraw(EditorCanvasDrawType.draw, {x: coords.x, y: coords.y})
    }
    endDraw() {
        this.ctx.stroke()
        if(this.isDrawing==1)
        this.replicateDraw(EditorCanvasDrawType.end, {})
    }

    constructor(ws: WebSocket, clientId) {
        super()

        this.ws = ws;
        this.clientId = clientId
    }


    public handleReplication(ev)
    {
        this.isDrawing = 2
        switch(ev.command)
        {
            case EditorCanvasDrawType.draw:
                this.draw({x: ev.x, y:ev.y})
            break;
            case EditorCanvasDrawType.start:
                this.beginDraw({x: ev.x, y:ev.y})
            break
            case EditorCanvasDrawType.end:
                this.endDraw()
            break
        }
    }
    private replicateDraw<K extends EditorCanvasDrawType>(type: K, args: DrawArguments[K])
    {
        this.ws.send(JSON.stringify({type: 'canvas', command: type, ...args, clientId: this.clientId}))
    }
}


type DrawArguments = {
    [K in EditorCanvasDrawType]: 
        K extends EditorCanvasDrawType.draw ? { x: number, y: number } :
        K extends EditorCanvasDrawType.start ? { x: number, y: number, color: string, width: number } :
        K extends EditorCanvasDrawType.end ? {} :
        {}
};


export class LoadingThrobber extends IElement
{

    render(): Node {
        
        const throbber = createNode('div', {className: 'throbber-container'})
        const throbbers = [
        this.newtonThrober,
        this.queueThrober]
        const index =Math.max(0,Math.min(1,Math.round(Math.random())*throbbers.length))
        if(throbbers[index]!= undefined)
            throbbers[index](throbber)
        else throw 'invalid function'
        return throbber
    }



    private queueThrober(throbber: HTMLDivElement)
    {
        throbber.classList.add('queue')
        for(let i =0;i<6;i++)
            throbber.appendChild(createNode('div', {className: 'throbber-elem',}))
        let i =0;

        const duration = 1000;
        const riseTime = 25
        const fallTime = 25
        const height = 20;

        function cycleQueue() {
            const firstItem = throbber.children[i] as HTMLElement;
    
           
            let startTime: number | undefined = undefined;
            
            function updateQueue(time: number)
            {
                const padding = throbber.clientWidth/6-firstItem.clientWidth
                const width = firstItem.clientWidth
                if(startTime === undefined)
                {
                    firstItem.style.left = "0px"
                    startTime = time;
                }
                    
                let elapsed = time - startTime;
                let perc = elapsed / duration * 100;
                if(perc<riseTime)
                 firstItem.style.top = (perc)/riseTime * -height + "px" 
                else
                {
                    
                    if(perc<100-fallTime)
                    {
                        firstItem.style.top = -height + 'px'
                        firstItem.style.left = (throbber.clientWidth- width - padding/2) * (perc-riseTime)*100/(100-fallTime-riseTime)/100  + "px"
                    }
                         
                    else
                        firstItem.style.top = -height*(100-perc)/fallTime + "px" 
                }
               


                let m=0
                for(let k=0;k<6;k++)
                    if(i!=k)
                        (throbber.children[k] as HTMLElement).style.left = throbber.clientWidth - (4 - m++)*(width+padding) - (perc+width+padding*2)/100*(width+padding)-width + "px" // - perc/(25+padding)*10

                if(perc<=100)
                    requestAnimationFrame(updateQueue)
                else
                {
                    firstItem.style.top = "0px"
                    i = (i+1)%6
                    cycleQueue()
                    
                }
            }
            
            requestAnimationFrame(updateQueue)
            
            
        
        }
        cycleQueue()
        // // Start cycling every 1.5 seconds
        // setInterval(cycleQueue, 1500);

    }

    private newtonThrober(throbber: HTMLDivElement)
    {
        throbber.classList.add('newton')
          for(let i =0;i<6;i++)
            throbber.appendChild(createNode('div', {className: 'throbber-elem',}))


           let startTime: number | undefined = undefined;

            const duration = 2000;

          function updateNewton(time: number)
          {

           

            if(startTime === undefined)
                    startTime = time;
                
                    
                let elapsed = time - startTime;
                let perc = elapsed / duration * 100;
                const pi = Math.PI
                const distance = 50
                
                const angle =     (Math.sin((perc-50)/50*pi)-0.5)* 180 +90 
                const startAngle = Math.min(angle/2, 0) 
            
                const endAngle =   Math.max(angle/2,0)
                function calcAngle(angle): {x,y} {
                    const x = Math.sin(angle*pi/180) * distance 
                    const y = Math.cos(angle*pi/180) * distance - distance
                        return {x,y}
                }

                const elem = throbber.children[0] as HTMLElement
                elem.style.left = calcAngle(startAngle).x + 'px'
                elem.style.top = calcAngle(startAngle).y + 'px'

                const lelem = throbber.lastChild as HTMLElement
                lelem.style.left = calcAngle(endAngle).x + 'px'
                lelem.style.top = calcAngle(endAngle).y + 'px'
                if(perc <100)
                    requestAnimationFrame(updateNewton)
                else
                {
                    startTime = undefined
                    requestAnimationFrame(updateNewton)
                }
          }

          requestAnimationFrame(updateNewton)
    }
}