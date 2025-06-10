class IElement {
    stylesheet(style) {
        const elem = document.createElement('style');
        elem.innerText = style;
        return elem;
    }
    node(tag, options) {
        const elem = document.createElement(tag);
        if (options) {
            if (options.css)
                elem.style.cssText = options.css;
            if (options.className)
                elem.className = options.className;
            if (options.id)
                elem.id = options.id;
            if (options.html)
                for (const node of options.html)
                    elem.appendChild(node);
            if (options.htmlSting)
                elem.innerHTML = options.htmlSting;
        }
        return elem;
    }
}
export class Dock extends IElement {
    render() {
        const t = `home,login,profile,proiecte,join`;
        const arr = [];
        arr.push(this.stylesheet(`
            .dock-button
            {
                flex-grow: 1;
            }
            
            `.trim().replaceAll('\n', '  ')));
        t.split(',').forEach(element => {
            arr.push(this.node('div', { className: 'dock-button', htmlSting: element }));
        });
        const base = this.node('div', {
            css: "position: absolute; left: 50%; bottom: 20px; transform: translate(-50%, -50%); display: flex; width: 300px",
            html: arr
        });
        base.addEventListener('mousemove', function (ev) {
            for (const child of this.children)
                child.style.width = child.style.height = Math.sqrt(Math.pow(child.offsetLeft - ev.offsetX, 2) + Math.pow(child.offsetTop - ev.offsetY, 2)) + "px";
        });
        return base;
    }
}
