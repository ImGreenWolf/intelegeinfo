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
            if (options.attributes)
                for (const attribute of options.attributes)
                    elem.setAttribute(attribute.name, attribute.value);
            if (options.htmlSting)
                elem.innerHTML = options.htmlSting;
        }
        return elem;
    }
}
export class Dock extends IElement {
    render() {
        const t = `<img><p>home</p>,<img><p>login</p>,<img><p>profile</p>,<img><p>proiecte</p>,<img><p>join</p>`;
        const arr = [];
        arr.push(this.stylesheet(`
            .dock-button
            {
                flex-grow: 1;
                background-color: black;
                text-align: center;
                position: relative;
                border-radius: 0.5em;
            }
            .dock-button p 
            {
                            display: block;
                position: relative;
                transition-duration: 0.3s;
                top: 0;
                opacity: 0;
            }
            .dock-button:hover p
            {

                top: -70px;
                opacity: 1;
            }
            
            `.trim().replaceAll('\n', '  ')));
        t.split(',').forEach(element => {
            arr.push(this.node('div', { className: 'dock-button', attributes: [{ name: 'name', value: element }], htmlSting: element }));
        });
        const container = this.node('div', { css: 'position: relative;display: flex; width: 400px; gap: 10px; height: 200px; align-items: flex-end; justify-content: space-between', html: arr });
        const base = this.node('div', {
            css: "position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); display: flex;",
            html: [container]
        });
        document.addEventListener('mousemove', function (ev) {
            const translateOffsetX = base.offsetWidth / 2;
            const translateOffsetY = base.offsetHeight / 2;
            const parentX = base.offsetLeft;
            const parentY = base.offsetTop;
            const percX = (ev.x - parentX) / base.offsetWidth;
            const percY = (ev.y - parentY) / base.offsetHeight;
            for (const child of container.children) {
                const childWidth = child.offsetWidth;
                const childHeight = child.offsetHeight;
                const dist = 100 - (Math.sqrt(Math.pow((child.offsetLeft + childWidth / 2 - translateOffsetX) / base.offsetWidth - percX, 2)
                    + Math.pow((child.offsetTop + childHeight / 2 - translateOffsetY) / base.offsetHeight - percY / 2, 2))) * 100;
                child.style.width = child.style.height = Math.max(50, Math.min(100, dist)) + "px";
                // child.style.transform = `scale(${ Math.max(50, Math.min(100, dist))}%)`
            }
        });
        return base;
    }
}
