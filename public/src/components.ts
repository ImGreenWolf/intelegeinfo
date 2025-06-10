
abstract class IElement {


    abstract render(): Node

//keyof HTMLElementTagNameMap
    protected node<K extends keyof HTMLElementTagNameMap>(tag: K, options?: {css?: string, className?: string, id?: string, html?: Node[], htmlSting?: string}): HTMLElementTagNameMap[K]
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

            if(options.htmlSting)
                elem.innerHTML = options.htmlSting;
        }       
        

        return elem
    }
}



export class Dock extends IElement {


    render() {
        
const t = `<div>home</div>,<div>login</div>,<div>profile</div>,<div>proiecte</div>,<div>join</div>`
        const arr: Node[] = []
t.split(',').forEach(element => {
    arr.push(this.node('div', {className: 'dock-button', htmlSting: element}))
});
        
        return this.node('div', {
        css: "position: absolute; left: 50%; bottom: 20px; transform: translate(-50%, -50%); display: flex; width: 200px",
        html: arr})
        
    }
}

