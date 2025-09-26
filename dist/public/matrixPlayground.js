import { createNode } from "./utils.js";
function initInput(inputElem, options, type) {
    inputElem.oninput = (ev) => {
        const expr = inputElem.value;
        if (type == 'b')
            options.expression = expr;
        else
            options.valExpression = expr;
        cacheTableElements(options);
    };
}
let cachedVal;
function updateTableElements(options) {
    let rowElems = [];
    for (let row = 0 + options.indexOffset; row < options.rows + options.indexOffset; row++) {
        const colomElems = [];
        for (let column = 0 + options.indexOffset; column < options.columns + options.indexOffset; column++) {
            const value = getExpressionValue(options, row, column);
            if (value.err)
                return undefined;
            colomElems.push(createNode('th', { innerText: value.text, css: value.css }));
        }
        rowElems.push(createNode('tr', { html: colomElems }));
    }
    return rowElems;
}
function getExpressionValue(options, row, column) {
    let rexExpr = options.expression.replaceAll('i', row).replaceAll('j', column).replaceAll('n', options.rows).replaceAll('m', options.columns);
    let rexValExpr = options.valExpression.replaceAll('i', row).replaceAll('j', column).replaceAll('n', options.rows).replaceAll('m', options.columns);
    try {
        const res = eval(rexExpr);
        const resVal = eval(rexValExpr);
        let text = `${row}, ${column}`;
        if (typeof resVal == 'number' || typeof resVal == 'string') {
            text = resVal.toString();
            if (typeof res == 'boolean')
                return { css: res ? 'background-color: lime' : '', text };
        }
        return { err: 'Incorrect input type' };
    }
    catch (err) {
        return { err };
    }
}
function cacheTableElements(options) {
    const tableElems = updateTableElements(options) ?? cachedVal;
    cachedVal = tableElems;
    table.replaceChildren(...tableElems);
}
function initDisplay(parentElem, indexOffset) {
    const input = document.getElementById('sandbox-input');
    const valInput = document.getElementById('sandbox-value-input');
    const options = { rows: 5, columns: 5, indexOffset, expression: input.value, valExpression: valInput.value };
    const row = document.getElementById('sandbox-row');
    row.oninput = () => {
        options.rows = Math.min(20, row.valueAsNumber);
        cacheTableElements(options);
    };
    const column = document.getElementById('sandbox-column');
    column.oninput = () => {
        options.columns = Math.min(20, column.valueAsNumber);
        cacheTableElements(options);
    };
    table = createNode('table', { html: updateTableElements(options), className: 'matricie' });
    const container = createNode('div', { html: [table] });
    parentElem.appendChild(container);
    initInput(input, options, 'b');
    initInput(valInput, options, 'v');
    return table;
}
let table;
initDisplay(document.getElementById('sandbox'), 0);
