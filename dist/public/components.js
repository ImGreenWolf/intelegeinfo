class IElement {
    parentElement;
    constructor(parentElem) {
        this.appendRender(parentElem);
    }
    stylesheet(style) {
        const elem = document.createElement('style');
        elem.innerText = style;
        return elem;
    }
    appendRender(parentElem) {
        if (parentElem) {
            this.parentElement = parentElem;
            return new Promise(async (resolve, reject) => {
                parentElem.appendChild(this.render());
                resolve();
            });
        }
    }
}
export function createNode(tag, options) {
    const elem = document.createElement(tag);
    if (options) {
        if (options.css)
            elem.style.cssText = options.css;
        if (options.className)
            elem.className = options.className;
        if (options.id)
            elem.id = options.id;
        if (options.innerText)
            elem.innerText = options.innerText;
        if (options.html)
            for (const node of options.html)
                elem.appendChild(node);
        if (options.attributes)
            for (const attribute of options.attributes)
                elem.setAttribute(attribute.name, attribute.value);
        if (options.htmlSting)
            elem.innerHTML = options.htmlSting;
        if (options.onclick)
            elem.onclick = options.onclick;
    }
    return elem;
}
export class Dock extends IElement {
    render() {
        const loggedIn = false;
        const username = '';
        const t = loggedIn ?
            `<img src="../media/home-svgrepo-com.svg"><p>home</p>,
        <img src="../media/profile-round-1346-svgrepo-com.svg"><p>profile</p>,
        <img src="../media/notebook-svgrepo-com.svg"><p>proiecte</p>,
        <img src="../media/group-svgrepo-com.svg"><p>join</p>`
            :
                `<img src="../media/home-svgrepo-com.svg"><p>home</p>,
        <img src="../media/login-svgrepo-com.svg"><p>signup</p>,
        <img src="../media/login-svgrepo-com.svg"><p>login</p>,
        <img src="../media/group-svgrepo-com.svg"><p>join</p>`;
        const arr = [];
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
            min-width: 50px;
            border-radius: 5px;
            backdrop-filter: blur(5px);
        }
        .dock-button:hover p
        {

            top: -80px;
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
        
        `.trim().replaceAll('\n', '  ')));
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
            ];
        t.split(',').forEach((element, index) => {
            if (typeof func[index] != 'string') {
                const elem = createNode('button', { className: 'dock-button custom-button', attributes: [{ name: 'href', value: '/' }], htmlSting: element });
                elem.onclick = func[index];
                arr.push(elem);
            }
            else
                arr.push(createNode('a', { className: 'dock-button', attributes: [{ name: 'href', value: func[index] }], htmlSting: element }));
        });
        const container = createNode('div', { id: 'button-container', css: ` width: 100%; grid-column: 2; position: relative;display: flex; gap: 0.75em; height: 50px;   align-items: flex-end; justify-content: space-between; `, html: arr });
        const mainContainer = createNode('div', { id: 'content-container', html: username ? [container, createNode('h2', { innerText: `Hey, ${username}!` })] : [container], css: "gap: 0.5em; padding: 0.5em; justify-items: center; transition-duration: 1s; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; position: relative; min-height: 50px; border: 2px solid rgba(255, 255, 255, 0.1); background: #00000061; backdrop-filter: blur(5px); border-radius: 0.75em;" }); // grid-auto-flow: column;
        const base = createNode('div', { id: 'dock',
            css: "display: flex; justify-content: center; flex-direction: column; grid-row: -2/-1; min-width: 300px;  align-self: center; justify-self: center; grid-column: 1 / -1;",
            html: [createNode('p', { htmlSting: "IntelegeInfo", css: "top: -10px; position: relative; margin: 0.25em; font-size: 1.25em;  color:rgb(228, 228, 228);text-shadow: 3px 4px 3px black; text-align: center; font-family: 'Playwrite DK Loopet', 'Courier New', Courier, monospace;" }), mainContainer] });
        if (hasRequestAnimationFrame)
            requestAnimationFrame(() => updatePositions(10, 10));
        let timeout;
        let lastX = 0;
        let lastY = 0;
        function updatePositions(x, y) {
            const bottom = base.clientWidth > 200;
            lastX = x;
            lastY = y;
            const parentElem = mainContainer;
            const translateOffsetX = 0; // base.offsetWidth/2
            const translateOffsetY = 0; //base.offsetHeight/2
            const parentX = parentElem.offsetLeft + container.offsetLeft;
            const parentY = parentElem.offsetTop + container.offsetTop;
            const percX = (x - parentX) / (parentElem.offsetWidth);
            const percY = (y - parentY) / (parentElem.offsetHeight);
            const children = container.querySelectorAll('.dock-button');
            base.style.left = children[children.length - 1].offsetLeft + "px";
            for (const child of children) {
                const childWidth = child.offsetWidth;
                const childHeight = child.offsetHeight;
                const dist = Math.max(0, Math.min(25, 25 - (Math.sqrt(Math.pow((child.offsetLeft + childWidth / 2 - translateOffsetX) / parentElem.offsetWidth - percX, 2)
                    + Math.pow(((child.offsetTop - translateOffsetY + childHeight / 1.5) / parentElem.offsetHeight - percY) / 2, 2))) * 35));
                child.style.width = child.style.height = Math.max(50, Math.min(100, dist * 2.5)) + "px";
                bottom ? child.style.bottom = Math.max(0, Math.min(100, Math.sqrt(dist * 5))) + "px" : child.style.left = Math.max(0, Math.min(100, Math.sqrt(dist * 5))) + "px";
                ;
                const shadow = Math.max(0, Math.min(30, Math.sqrt(dist * 1)));
                child.style.boxShadow = `${shadow / 4}px ${shadow * 2}px ${shadow * 2}px ${shadow}px rgba(0, 0, 0, 0.5)`;
            }
        }
        if (hasRequestAnimationFrame)
            document.addEventListener('pointermove', function (ev) {
                if (ev.pointerType == 'mouse')
                    requestAnimationFrame(() => updatePositions(ev.x, ev.y));
                else
                    base.classList.add('touch');
            });
        return base;
    }
}
export class Pixelated extends IElement {
    canvas;
    async render({ x = 1000, y = 500, spacingX = 10, spacingY = 10, pointSize = 2, innerVignette = 1, outerVignette = 1, timeScale = 0.5, hover = false, trasnlate = 1, power = 1, offset = 10, manualAngle = 0, animatedAnglePow = 1, useMouseAngle = 0, randomness = 1 }) {
        if (!this.canvas)
            this.canvas = document.createElement('canvas');
        this.canvas.width = x;
        this.canvas.height = y;
        const ctx = this.canvas.getContext("2d");
        // const spacing = 10;
        // const pointSize = 2;
        let time = 0;
        let alpha = 1;
        const canvas = this.canvas;
        const perlin = new ImprovedPerlinNoise3D(Date.now());
        async function update() {
            const hx = canvas.width;
            const hy = canvas.height;
            time += 1 / 60 * 60 * timeScale;
            const z = time;
            // if(alpha==0)
            ctx.clearRect(0, 0, hx, hy);
            const angle = !manualAngle ? Math.PI / 4 * time / 10 / animatedAnglePow : (Math.PI / 2 * manualAngle);
            for (let x = 0; x < hx; x += spacingX)
                for (let y = 0; y < hy; y += spacingY) {
                    const randOffset = (Math.random() - 0.5) * 2 * randomness;
                    const height = perlin.turbulence(x + 0.5, y + 0.5, z, 64);
                    const dist = Math.max(Math.max(0, Math.min(1, Math.sqrt(Math.pow(hx / 2 - x, 2) + Math.pow(hy / 2 - y, 2)) / hx)) * 10, innerVignette);
                    const outdist = Math.max(1 - Math.pow(Math.max(0, Math.min(1, Math.sqrt(Math.pow(hx / 2 - x, 2) / hx / 500 * 2 + Math.pow(hy / 2 - y, 2) / hy / 300 * 2))), 2), outerVignette);
                    const alphadist = 1 - Math.max(0, Math.min(1, Math.sqrt(Math.pow(hx / 2 - x, 2) / hx / 100 + Math.pow(hy / 2 - y, 2)) / hy / 100));
                    const value = Math.round(Math.abs(Math.pow((Math.max(-1, Math.min(1, height)) + 1 - dist / 5), power)) * 200 * dist * outdist + offset); //* Math.min(1,z/10)*(y-y*(1-perspective))/hy
                    // const hex = value.toString(16).repeat(3)
                    // perlin.getDirection(x,y,z)
                    if (value > 20) {
                        const cx = x + Math.sin(angle + randomness * value / 255) * value / 50;
                        const cy = y + Math.cos(angle + randomness * value / 255) * value / 50;
                        const tx = cx * trasnlate;
                        const ty = cy * trasnlate;
                        const valScaledSize = Math.min(Math.abs(pointSize) * value / 255, Math.abs(pointSize));
                        ctx.beginPath();
                        ctx.clearRect(tx - valScaledSize / 2, ty - valScaledSize / 2, cx, cy);
                        if (pointSize < 0)
                            ctx.rect(tx, ty, valScaledSize, valScaledSize);
                        else
                            ctx?.arc(tx, ty, valScaledSize, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fillStyle = `rgb(${value}, ${value}, ${value})`; //'#' + hex
                        ctx.fill();
                    }
                }
            requestAnimationFrame(update);
        }
        update();
        // setInterval(update, 10);       
        let updateint;
        function inc(delta) {
            alpha = Math.max(0, Math.min(1, alpha + delta));
            if (alpha < 0 && delta > 0)
                requestAnimationFrame(() => inc(delta));
            else if (alpha > 0 && delta < 0)
                requestAnimationFrame(() => inc(delta));
        }
        if (hover) {
            this.canvas.onmouseover = (ev) => {
                //  clearInterval(updateint)
                requestAnimationFrame(() => inc(0.1));
                alpha = 1;
            };
            this.canvas.onmouseleave = ev => {
                //    clearInterval(updateint)
                requestAnimationFrame(() => inc(-0.01));
                // requestAnimationFrame(() => {
                //     alpha = Math.max(0, Math.min(1, alpha - 0.05))
                //     inc
                // });
                alpha = 0;
            };
        }
        return this.canvas;
    }
}
export const hasRequestAnimationFrame = typeof window.requestAnimationFrame === 'function' ||
    typeof window.webkitRequestAnimationFrame === 'function' ||
    typeof window.mozRequestAnimationFrame === 'function' ||
    typeof window.oRequestAnimationFrame === 'function' ||
    typeof window.msRequestAnimationFrame === 'function';
class ImprovedPerlinNoise3D {
    permutation;
    grad3;
    constructor(seed = Math.random() * 2147483647) {
        // Initialize gradient vectors - 12 vectors from center of cube to edges
        this.grad3 = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
            // Duplicate to prevent modulo operations
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0]
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
    random(seed) {
        const x = Math.sin(seed) * 43758.5453;
        return x - Math.floor(x);
    }
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    grad3D(hash, x, y, z) {
        // Ensure hash is within bounds of grad3 array
        const h = hash % 16;
        const grad = this.grad3[h];
        return grad[0] * x + grad[1] * y + grad[2] * z;
    }
    noise3D(x, y, z) {
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
        return this.lerp(w, this.lerp(v, this.lerp(u, this.grad3D(this.permutation[AA], x, y, z), this.grad3D(this.permutation[BA], x - 1, y, z)), this.lerp(u, this.grad3D(this.permutation[AB], x, y - 1, z), this.grad3D(this.permutation[BB], x - 1, y - 1, z))), this.lerp(v, this.lerp(u, this.grad3D(this.permutation[AA + 1], x, y, z - 1), this.grad3D(this.permutation[BA + 1], x - 1, y, z - 1)), this.lerp(u, this.grad3D(this.permutation[AB + 1], x, y - 1, z - 1), this.grad3D(this.permutation[BB + 1], x - 1, y - 1, z - 1))));
    }
    turbulence(x, y, z, size = 32) {
        let value = 0;
        let initialSize = size;
        while (size >= 1) {
            value += Math.abs(this.noise3D(x / size, y / size, z / size)) * size;
            size /= 2;
        }
        return value / initialSize;
    }
    fractalNoise(x, y, z, octaves = 6, persistence = 0.5, lacunarity = 2.0) {
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
    noiseWithGradient(x, y, z) {
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
    get2DAngle(x, y) {
        const [_, gx, gy] = this.noiseWithGradient(x, y, 0);
        // Handle zero gradient case
        if (Math.abs(gx) < 0.001 && Math.abs(gy) < 0.001) {
            return Math.random() * Math.PI * 2; // Random direction if flat
        }
        return Math.atan2(gy, gx);
    }
}
var EditorCanvasDrawType;
(function (EditorCanvasDrawType) {
    EditorCanvasDrawType["draw"] = "draw";
    EditorCanvasDrawType["start"] = "start";
    EditorCanvasDrawType["end"] = "end";
})(EditorCanvasDrawType || (EditorCanvasDrawType = {}));
export class EditorCanvas extends IElement {
    canvas = createNode('canvas');
    ctx = this.canvas.getContext('2d');
    h = this.canvas.height;
    w = this.canvas.width;
    isDrawing = 0; //0 no, 1 user, 2 remote
    ws;
    clientId;
    strokeIndex = 0;
    updateSize() {
        const rect = this.canvas.parentElement.getBoundingClientRect(); // actual size of canvas el. itself
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.h = this.canvas.height;
        this.w = this.canvas.width;
        console.log(this.w);
        this.onUpdate();
    }
    render() {
        if (!this.canvas) {
            this.canvas = createNode('canvas');
            this.ctx = this.canvas.getContext('2d');
        }
        return this.canvas;
    }
    remove() {
        this.canvas.remove();
    }
    async onUpdate() {
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.fillRect(0, 0, this.w, this.h);
        this.ctx.lineWidth = 1;
        this.canvas.onmousedown = (ev => {
            this.isDrawing = 1;
            this.beginDraw(this.relativeToCanvas({ x: ev.offsetX, y: ev.offsetY }));
        });
        this.canvas.onmousemove = (ev => {
            if (this.isDrawing == 1)
                this.draw(this.relativeToCanvas({ x: ev.offsetX, y: ev.offsetY }));
            // setTimeout(() => {
            //     this.isDrawing = 0 
            // }, 1000);
        });
        this.canvas.onmouseup = (ev => {
            if (this.isDrawing != 1)
                return;
            this.isDrawing = 0;
            this.endDraw();
        });
    }
    relativeToCanvas(coords) {
        return { x: coords.x, y: coords.y };
    }
    beginDraw(coords) {
        this.strokeIndex = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(coords.x, coords.y);
        if (this.isDrawing == 1)
            this.replicateDraw(EditorCanvasDrawType.start, { x: coords.x, y: coords.y, color: 'black', width: 2 });
    }
    draw(coords) {
        this.strokeIndex++;
        this.ctx.lineTo(coords.x, coords.y);
        this.ctx.stroke();
        if (this.strokeIndex % 5 == 0 && this.isDrawing == 1)
            this.replicateDraw(EditorCanvasDrawType.draw, { x: coords.x, y: coords.y });
    }
    endDraw() {
        this.ctx.stroke();
        if (this.isDrawing == 1)
            this.replicateDraw(EditorCanvasDrawType.end, {});
    }
    constructor(ws, clientId) {
        super();
        this.ws = ws;
        this.clientId = clientId;
    }
    handleReplication(ev) {
        this.isDrawing = 2;
        switch (ev.command) {
            case EditorCanvasDrawType.draw:
                this.draw({ x: ev.x, y: ev.y });
                break;
            case EditorCanvasDrawType.start:
                this.beginDraw({ x: ev.x, y: ev.y });
                break;
            case EditorCanvasDrawType.end:
                this.endDraw();
                break;
        }
    }
    replicateDraw(type, args) {
        this.ws.send(JSON.stringify({ type: 'canvas', command: type, ...args, clientId: this.clientId }));
    }
}
