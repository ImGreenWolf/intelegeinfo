import { createNode } from "./components.js";
function initInput(inputElem, options) {
    inputElem.oninput = (ev) => {
        const expr = inputElem.value;
        options.expression = expr;
        table.replaceChildren(...updateTableElements(options));
    };
}
function updateTableElements(options) {
    let rowElems = [];
    for (let row = 0 + options.indexOffset; row < options.rows + options.indexOffset; row++) {
        const colomElems = [];
        for (let column = 0 + options.indexOffset; column < options.columns + options.indexOffset; column++) {
            const value = getExpressionValue(options.expression, row, column);
            colomElems.push(createNode('th', { innerText: value.text, css: value.css }));
        }
        rowElems.push(createNode('tr', { html: colomElems }));
    }
    return rowElems;
}
function getExpressionValue(expr, row, column) {
    let rexExpr = expr.replaceAll('i', row).replaceAll('j', column);
    const res = eval(rexExpr);
    switch (typeof res) {
        case 'boolean':
            return { css: res ? 'background-color: lime' : '', text: Number(row + column).toString() };
            break;
        case 'number':
            return { text: res.toString() };
            break;
        default:
            return { err: 'invalid output type' };
    }
}
function initDisplay(parentElem, rows, columns, indexOffset) {
    const options = { rows, columns, indexOffset, expression: '' };
    table = createNode('table', { html: updateTableElements(options), className: 'matricie' });
    const input = createNode('input');
    const container = createNode('div', { html: [table, input] });
    parentElem.appendChild(container);
    initInput(input, options);
    return table;
}
let table;
initDisplay(document.getElementById('sandbox'), 5, 5, 0);
