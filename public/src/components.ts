
declare global {
    interface Window {
        editor: any
    }
}

abstract class IElement {


    abstract render(): Node | Promise<Node>

    public stylesheet(style: string): HTMLStyleElement
    {
        const elem = document.createElement('style')
        elem.innerText = style;
        return elem
    }

    protected node<K extends keyof HTMLElementTagNameMap>(tag: K, options?: {css?: string, className?: string, id?: string, html?: Node[], htmlSting?: string, attributes?: {name: string, value: string}[]}): HTMLElementTagNameMap[K]
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
            if(options.html)
                for(const node of options.html)
                    elem.appendChild(node)
            if(options.attributes)
                for(const attribute of options.attributes)
                    elem.setAttribute(attribute.name, attribute.value)
            if(options.htmlSting)
                elem.innerHTML = options.htmlSting;
        }       
        

        return elem
    }
}



export class Dock extends IElement {



    render() {
        const loggedIn = false;
        
        const t = loggedIn ? 
        `<img src="../media/home-svgrepo-com.svg"><p>home</p>,
        <img src="../media/profile-round-1346-svgrepo-com.svg"><p>profile</p>,
        <img src="../media/notebook-svgrepo-com.svg"><p>proiecte</p>,
        <img src="../media/group-svgrepo-com.svg"><p>join</p>` 
        :
        `<img src="../media/home-svgrepo-com.svg"><p>home</p>,
        <img src="../media/login-svgrepo-com.svg"><p>signup</p>,
        <img src="../media/login-svgrepo-com.svg"><p>login</p>,
        <img src="../media/group-svgrepo-com.svg"><p>join</p>` 
                const arr: Node[] = []

        arr.push(this.stylesheet(`
        .dock-button
        {
            background-color:rgba(32, 32, 32, 0.38);
            backdrop-filter: blur(5px);
            border: 1px solid #ffffff61;
            text-align: center;
            position: relative;
            z-index: 1;
            border-radius: 0.5em;
            cursor: pointer;
            text-decoration: none;
            font-family: Poppins;
            font-size: 0.75em;
        }
        .dock-button img
        {
            width: 25px;
            height: 25px;
            position: relative;
            top: 50%;
            transform: translateY(-50%);
        }
        .dock-button p 
        {
            display: block;
            position: relative;
            transition-duration: 0.3s;
            top: -50px;
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
            min-width: 25px;
            border-radius: 5px;
            backdrop-filter: blur(5px);
        }
        .dock-button:hover p
        {

            top: -80px;
            opacity: 1;
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
                const elem = this.node('button', {className: 'dock-button custom-button', attributes: [{name: 'href', value: '/'}], htmlSting: element})
                elem.onclick = func[index]
                arr.push(elem)
            }
            else
                arr.push(this.node('a', {className: 'dock-button', attributes: [{name: 'href', value: func[index]}], htmlSting: element}))
           
        });
            
        const container = this.node('div', {css: `border: 1px solid #ffffff61; position: relative;display: flex; gap: 0.5em; height: 50px; padding: 0.5em; align-items: flex-end; justify-content: space-between; background: #00000061; backdrop-filter: blur(5px); border-radius: 0.75em;`,html: arr})
        const base = this.node('div', {
        css: " display: flex; justify-content: center; flex-direction: column; grid-row: 5/6; width: 300px;  align-self: center; justify-self: center; grid-column: 1 / -1;",
        html: [this.node('p', {htmlSting: "IntelegeInfo", css: "top: -10px; position: relative; color:rgb(228, 228, 228);text-shadow: 3px 4px 3px black; text-align: center; font-family: 'Playwrite DK Loopet', 'Courier New', Courier, monospace;"}), container]})

        updatePositions(0,0)

        function updatePositions(x,y)
        {
            const translateOffsetX = 0// base.offsetWidth/2
            const translateOffsetY = 0//base.offsetHeight/2
            const parentX = container.offsetLeft
            const parentY = container.offsetTop 
            const percX = (x - parentX) / container.offsetWidth
            const percY = (y - parentY) / container.offsetHeight
            for(const child of container.children as HTMLCollectionOf<HTMLDivElement>)
            {
                const childWidth = child.offsetWidth
                const childHeight = child.offsetHeight
                const dist = 25 - (Math.sqrt(Math.pow((child.offsetLeft + childWidth/2 - translateOffsetX) / container.offsetWidth - percX,2)
                + Math.pow(((child.offsetTop - translateOffsetY + childHeight/2) / container.offsetHeight - percY)/2,2 )))*25
                child.style.width = child.style.height = Math.max(50, Math.min(100, dist*2.5)) + "px";
                child.style.bottom =Math.max(0, Math.min(100,Math.sqrt(dist*5))) + "px";
                const shadow = Math.max(0, Math.min(30, Math.sqrt(dist*1)))
                child.style.boxShadow = `${shadow/4}px ${shadow*2}px ${shadow*2}px ${shadow}px rgba(0, 0, 0, 0.5)`
            }
        }
        document.addEventListener('mousemove', function(ev) {

           
            requestAnimationFrame(() => updatePositions(ev.x,ev.y))
            
        })
        return base
        
    }
}

export class Pixelated extends IElement {

    
    async render(): Promise<Node> {
        
        const canvas = document.createElement('canvas')
        canvas.width = 300;
        canvas.height = 500;
        const ctx = canvas.getContext("2d")!
        const spacing = 10;
        const pointSize = 2;

        let time =0
        let alpha = 1;
        const randOffset = Math.random()
        const perlin = new ImprovedPerlinNoise3D(Date.now());
        
            async function update() {
                    const hx = canvas.width;
                    const hy = canvas.height;
                    time += 1/60  * 30;
                    const z = time
                    if(alpha==0)
                         ctx.clearRect(0,0,hx,hy)
                    const angle = Math.PI / 4;

                    for(let x=0; x<hx; x+=spacing)
                        for(let y=0; y<hy; y+=spacing)
                        {
                            //@ts-ignore
                            const height = perlin.turbulence(x+0.5,y+0.5,z, 64)
                            const dist =  Math.max(0, Math.min(1,Math.sqrt(Math.pow(hx/2-x,2) + Math.pow(hy/2-y,2)) / hx)) * 2
                            const outdist = 1- Math.pow(Math.max(0, Math.min(1,Math.sqrt(Math.pow(hx/2-x,2)/hx/500*2+ Math.pow(hy/2-y,2)/hy/300*2))),2)
                            const alphadist = 1 - Math.max(0, Math.min(1,Math.sqrt(Math.pow(hx/2-x,2)/hx/100 + Math.pow(hy/2-y,2))/hy/100))
                            const value = Math.round(Math.abs((Math.max(-1,Math.min(1,height))+1-dist/5))*200*dist*outdist * 1+10) * Math.min(1,z/10)
                            // const hex = value.toString(16).repeat(3)

                            // perlin.getDirection(x,y,z)
                            if(value>30)
                            {   
                                ctx.beginPath()
                                ctx?.arc(x+Math.sin(angle)*value/50,y+Math.cos(angle)*value/50,pointSize,0,2*Math.PI)
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

        canvas.onmouseover = (ev) => {
                //  clearInterval(updateint)
             requestAnimationFrame(() => inc(0.1))
             
           alpha = 1
        }      
        canvas.onmouseleave = ev => {
            
                //    clearInterval(updateint)
                
                
                requestAnimationFrame(() => inc(-0.01))
            // requestAnimationFrame(() => {
            //     alpha = Math.max(0, Math.min(1, alpha - 0.05))
            //     inc
            // });
            alpha = 0
        }
        
        return canvas
    }
}



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



