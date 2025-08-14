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
            const value = getExpressionValue(options, row, column);
            colomElems.push(createNode('th', { innerText: value.text, css: value.css }));
        }
        rowElems.push(createNode('tr', { html: colomElems }));
    }
    return rowElems;
}
function getExpressionValue(options, row, column) {
    let rexExpr = options.expression.replaceAll('i', row).replaceAll('j', column).replaceAll('n', options.rows).replaceAll('m', options.columns);
    try {
        const res = eval(rexExpr);
        switch (typeof res) {
            case 'boolean':
                return { css: res ? 'background-color: lime' : '', text: `${row}, ${column}` };
                break;
            case 'number':
                return { text: res.toString() };
                break;
            default:
                return { err: 'invalid output type' };
        }
    }
    catch (err) {
        return { err };
    }
}
function initDisplay(parentElem, rows, columns, indexOffset) {
    const input = document.getElementById('sandbox-input');
    const options = { rows, columns, indexOffset, expression: input.value };
    table = createNode('table', { html: updateTableElements(options), className: 'matricie' });
    const container = createNode('div', { html: [table] });
    parentElem.appendChild(container);
    initInput(input, options);
    return table;
}
let table;
initDisplay(document.getElementById('sandbox'), parseInt(document.getElementById('sandbox-row').value), parseInt(document.getElementById('sandbox-column').value), 0);
