import { createNode } from "./components"

interface TableOptions {
    rows
    columns,
    indexOffset
    expression
}
function initInput(inputElem, options: TableOptions) {


    inputElem.oninput = (ev) => {
        const expr = inputElem.value
        options.expression = expr
        table.replaceChildren(...updateTableElements(options))
        
    }

}

function updateTableElements(options: TableOptions) {
    let rowElems: HTMLElement[] = [];
    for(let row=0+options.indexOffset; row < options.rows + options.indexOffset; row++)
    {
        const colomElems: HTMLElement[] = [];
        for(let column=0 + options.indexOffset; column < options.columns + options.indexOffset; column++)
            colomElems.push(createNode('th', {innerText: row+column, css: getExpressionValue(options.expression, row, column).css}))
        rowElems.push(createNode('tr', {html: colomElems}))

    }
    return rowElems
}

function getExpressionValue(expr, row, column)
{
    let rexExpr = expr.replaceAll('i', row).replaceAll('j', column)
    const res = eval(rexExpr) 
    if(typeof res != 'boolean')
        return {err: 'invalid type of input'}
    return {css: res ? 'background-color: lime' : ''}
}

function initDisplay(parentElem: HTMLElement, rows: number, columns: number, indexOffset: number)
{
   const options = {rows, columns, indexOffset, expression: ''}
    
     table = createNode('table', {html: updateTableElements(options), className: 'matricie'});

    const input = createNode('input')
    
    const container = createNode('div', {html: [table, input]})
    parentElem.appendChild(container)


    initInput(input, options)
    return table
}

let table: HTMLTableElement;
initDisplay(document.getElementById('sandbox')!, 5, 5, 0)