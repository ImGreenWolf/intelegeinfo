import { createNode } from "./components.js"
// declare const createNode;
// declare module '/editor/components';
interface TableOptions {
    rows
    columns,
    indexOffset
    expression,
    valExpression
}
function initInput(inputElem, options: TableOptions, type: "b" | 'v') {

    
    inputElem.oninput = (ev) => {
        const expr = inputElem.value
        if(type == 'b')
            options.expression = expr
        else 
            options.valExpression = expr
        cacheTableElements(options)

        
    }

}

let cachedVal;

function updateTableElements(options: TableOptions) {
    let rowElems: HTMLElement[] = [];
    for(let row=0+options.indexOffset; row < options.rows + options.indexOffset; row++)
    {
        const colomElems: HTMLElement[] = [];
        for(let column=0 + options.indexOffset; column < options.columns + options.indexOffset; column++)
        {
            const value = getExpressionValue(options, row, column)
            if(value.err)
                return undefined;
            colomElems.push(createNode('th', {innerText: value.text, css: value.css}))
        }
            
        rowElems.push(createNode('tr', {html: colomElems}))

    }
    return rowElems
}



function getExpressionValue(options: TableOptions, row: number, column: number)
{
    let rexExpr = options.expression.replaceAll('i', row).replaceAll('j', column).replaceAll('n',options.rows).replaceAll('m', options.columns)
    let rexValExpr = options.valExpression.replaceAll('i', row).replaceAll('j', column).replaceAll('n',options.rows).replaceAll('m', options.columns)
    try{
        const res = eval(rexExpr) 
        const resVal = eval(rexValExpr)
        let text = `${row}, ${column}`

        if(typeof resVal == 'number' || typeof resVal == 'string')
        {
            text = resVal.toString()
            if(typeof res == 'boolean')
                return {css: res ? 'background-color: lime' : '', text}
        }
       
           

        return {err: 'Incorrect input type'}
    }
    catch(err) {
        return {err}
    }
    
    
}

function cacheTableElements(options) {
     const tableElems = updateTableElements(options) ?? cachedVal
    cachedVal = tableElems;
    table.replaceChildren(...tableElems)
}
function initDisplay(parentElem: HTMLElement, indexOffset: number)
{
    const input = document.getElementById('sandbox-input') as HTMLInputElement
    const valInput = document.getElementById('sandbox-value-input') as HTMLInputElement
    const options: TableOptions = {rows: 5, columns: 5, indexOffset, expression:  input.value, valExpression: valInput.value}

    const row =  document.getElementById('sandbox-row') as HTMLInputElement
    row.oninput = () => {
        options.rows = Math.min(20, row.valueAsNumber)
         cacheTableElements(options)
        
    }

    const column =  document.getElementById('sandbox-column') as HTMLInputElement
    column.oninput = () => {
        options.columns =  Math.min(20, column.valueAsNumber)
        cacheTableElements(options)

        
    }
    
    table = createNode('table', {html: updateTableElements(options), className: 'matricie'});

    
    
    const container = createNode('div', {html: [table]})
    parentElem.appendChild(container)


    initInput(input, options, 'b')
    initInput(valInput, options, 'v')
    return table
}

let table: HTMLTableElement;
initDisplay(document.getElementById('sandbox')!, 0)