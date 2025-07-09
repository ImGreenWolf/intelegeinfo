import { createNode } from "./components.js";
export async function test(sessionId, problemId) {
    const res = await fetch(`../test/${problemId}`);
    console.log(res.body);
    const output = document.getElementById('output');
    const json = await res.json();
    const elems = [];
    for (const result of json.result) {
        elems.push(createNode('div', { innerText: result.status }));
    }
    if (json.result && res.ok)
        output.append(...elems);
    else
        output.innerText = 'Some test failed..';
}
