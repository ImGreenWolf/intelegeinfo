
declare global {
    interface Window {
        editor: any
    }
}

abstract class IElement {


    abstract render(): Node

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
        
        const t = `<img src="../media/home-svgrepo-com.svg"><p>home</p>,
        <img src="../media/login-svgrepo-com.svg"><p>login</p>,
        <img src="../media/profile-round-1346-svgrepo-com.svg"><p>profile</p>,
        <img src="../media/notebook-svgrepo-com.svg"><p>proiecte</p>,
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
            width: 100px;
            color: white;
            text-decoration: none;
            left: 50%;
            transform: translateX(-50%);
        }
        .dock-button:hover p
        {

            top: -70px;
            opacity: 1;
        }
        
        `.trim().replaceAll('\n', '  ')))
            const func = 
        [
            '/',
            '../signup',
            '../profile',
            () => window.editor.listProjects(),
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
        css: " display: flex; justify-content: center; flex-direction: column; grid-row: 5/6; width: 400px;  align-self: center; justify-self: center; grid-column: 1 / -1;",
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
                + Math.pow((child.offsetTop - translateOffsetY + childHeight/2) / container.offsetHeight - percY,2 )))*25
                child.style.width = child.style.height = Math.max(50, Math.min(100, dist*2.5)) + "px";
                child.style.bottom =Math.max(0, Math.min(100,Math.sqrt(dist*5))) + "px";
                const shadow = Math.max(0, Math.min(30, Math.sqrt(dist*1)))
                child.style.boxShadow = `${shadow/4}px ${shadow*2}px ${shadow*2}px ${shadow}px rgba(0, 0, 0, 0.5)`
            }
        }
        document.addEventListener('mousemove', function(ev) {

           
            updatePositions(ev.x,ev.y)
            
        })
        return base
        
    }
}

