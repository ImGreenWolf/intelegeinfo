class IElement {
}
export class Dock extends IElement {
    render() {
        const t = ` <div>home</div>
            <div>login</div>
            <div>profile</div>
            <div>proiecte</div>
            <div>join</div>`;
        const cont = document.createElement('div');
        cont.innerHTML = t;
        return cont;
    }
}
