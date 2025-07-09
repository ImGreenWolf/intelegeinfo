import { createNode } from "./components.js"

export async function test(sessionId, problemId)
{
    const output = document.getElementById('output')
    output!.innerHTML = 'Programul se verifica...';
    const res = await fetch(`../test/${problemId}`)
    
    const json = await res.json()
    const elems: HTMLElement[] = [];
        if(!(json.result && res.ok))
            throw 'Invalid response';

    
    for(const result of json.result)
    {
        const test = result.value
        elems.push(createNode('div', {innerText: `#${test.index}: ${test.status} - Score: ${test.score}`}))
    }

        output!.replaceChildren(...elems)
}

 