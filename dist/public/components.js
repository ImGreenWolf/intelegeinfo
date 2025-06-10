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
                background-color: black;
                text-align: center;
            }
            
            `.trim().replaceAll('\n', '  ')));
        t.split(',').forEach(element => {
            arr.push(this.node('div', { className: 'dock-button', htmlSting: element }));
        });
        const container = this.node('div', { css: 'position: relative;display: flex; min-width: 300px; justify-content: space-between', html: arr });
        const base = this.node('div', {
            css: "position: absolute; left: 50%; bottom: 20px;  display: flex;",
            html: [container]
        });
        document.addEventListener('mousemove', function (ev) {
            const parentX = base.offsetLeft;
            const parentY = base.offsetTop;
            const perc = (ev.x - parentX) / base.offsetWidth;
            for (const child of container.children) {
                const dist = (Math.sqrt(Math.pow(((child.offsetLeft) / base.offsetWidth), 2) + Math.pow(perc, 2))) * 100;
                console.log(child.offsetLeft / base.offsetWidth + " - " + perc + " dist: " + dist);
                child.style.width = child.style.height = Math.max(50, Math.min(100, dist)) + "px";
                // child.style.transform = `scale(${ Math.max(50, Math.min(100, dist))}%)`
            }
        });
        return base;
    }
}
