import { createNode } from "./components.js"

export async function test(sessionId, problemId)
{
    const res = await fetch(`../test/${problemId}`)
    console.log(res.body)
    const output = document.getElementById('output')
    const json = await res.json()
    const elems: HTMLElement[] = [];
    for(const result of json.result)
    {
        const test = result.value
        elems.push(createNode('div', {innerText: `#${test.index}: ${test.status} - Score: ${test.score}`}))
    }
    if(json.result && res.ok)
        output!.replaceChildren(...elems)
    else
       output!.replaceChildren(...elems)
}

 