import { createNode } from "./components.js"
// declare const createNode;
// declare module '/editor/components';
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
        {
            const value = getExpressionValue(options, row, column)
            colomElems.push(createNode('th', {innerText: value.text, css: value.css}))
        }
            
        rowElems.push(createNode('tr', {html: colomElems}))

    }
    return rowElems
}



function getExpressionValue(options: TableOptions, row, column)
{
    let rexExpr = options.expression.replaceAll('i', row).replaceAll('j', column).replaceAll('n',options.rows).replaceAll('m', options.columns)
    try{
        const res = eval(rexExpr) 
        switch(typeof res)
        {
            case 'boolean':
                return {css: res ? 'background-color: lime' : '', text: `${row}, ${column}`}
            break;
            case 'number':
                return {text: res.toString()}
            break;
            default:
                return {err: 'invalid output type'}
        }
    }
    catch(err) {
        return {err}
    }
    
    
}


function initDisplay(parentElem: HTMLElement, rows: number, columns: number, indexOffset: number)
{
    const input = document.getElementById('sandbox-input') as HTMLInputElement
    const options = {rows, columns, indexOffset, expression:  input.value}
    
    table = createNode('table', {html: updateTableElements(options), className: 'matricie'});

    
    
    const container = createNode('div', {html: [table]})
    parentElem.appendChild(container)


    initInput(input, options)
    return table
}

let table: HTMLTableElement;
initDisplay(document.getElementById('sandbox')!, parseInt((document.getElementById('sandbox-row') as HTMLInputElement).value), parseInt((document.getElementById('sandbox-column')as HTMLInputElement).value), 0)