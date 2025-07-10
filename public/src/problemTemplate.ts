import { createNode } from "./components.js"

export async function test(sessionId, problemId)
{
    const output = document.getElementById('output')
    output!.innerHTML = 'Programul se verifica...';
    const res = await fetch(`../test/${problemId}`)
    
    const json = await res.json()
    const elems: HTMLElement[] = [];
        if(!(json.results && res.ok))
            throw 'Invalid response';

    
    for(const result of json.results)
    {
        const test = result.value
        elems.push(createNode('div', {innerText: `#${test.index}: ${test.status} - Score: ${test.score}`}))
    }

        output!.replaceChildren(...elems)
}


export async function evaluate(sessionId, problemId)
{
    const output = document.getElementById('output')
    output!.innerHTML = 'Programul se evalueaza...';
    const res = await fetch(`./${problemId}/evaluate`);
    
    const json = await res.json();
    // const elems: HTMLElement[] = [];
    //     if(!(json.result && res.ok))
    //         throw 'Invalid response';

    output!.innerHTML = `
    <section>
        <h1>Ce ai facut bine</h1>
        <p>${json.positives}</p>
    </section>
    <section>
        <h1>Ce ar trebui să îmbunătățești</h1>
        <p>${json.improvements}</p>
    </section>
    <section>
        <h1>Sugestii</h1>
        <p>${json.suggestions}</p>
    </section>
    <section>
        <h1>Concluzie</h1>
        <p>${json.scoreConclusion.conclusion}</p>
        <p>Scor: <span>${json.scoreConclusion.score}</span></p>
        ${json.scoreConclusion.score_reasons ?
`       <ul id='score-details'>
            ${(json.scoreConclusion.score_reasons as {reason, score}[]).map(reason => `<li><span>${reason.score}</span> ${reason.reason}</li>`).join('\n')}
        </ul>` : ''}
       
    </section>
    `
    
}
 