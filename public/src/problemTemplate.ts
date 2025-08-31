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
        elems.push(createNode('div', {htmlSting: `#${test.index}: ${test.status} - Score: <span class="${test.score!=0 ? 'good' : 'bad'}">${test.score}</span>` +
         (test.result !== undefined ? `<span title='arata datele de intrare a testului' class='show-input'>👁️<span>Input: ${test.result.input}</span></div>` : '' )} ))
    }

        output!.replaceChildren(...elems)

        document.getElementById('final-score')!.innerHTML = `${json.solve.score} - Time: ${json.solve.time}`;
        document.getElementById('final-score')!.className = ['bad', 'decent','good', 'perfect'][Math.round(json.score/25)- (json.score==0 ? 0 : 1)]
        console.log(Math.round(json.score/25)- json.score==0 ? 0 : 1, Math.round(json.score/25), json.score==0 ? 0 : 1)
}


export async function evaluate(sessionId, problemId)
{
    const output = document.getElementById('output')
    output!.innerHTML = 'Programul se evalueaza...';
    const res = await fetch(`./${problemId}/evaluate`);
    if(!res.ok)
        output!.innerHTML = await res.text();
    const json = await res.json();
    // const elems: HTMLElement[] = [];
    //     if(!(json.result && res.ok))
    //         throw 'Invalid response';

    output!.innerHTML = `
    <section>
        <h1>Ce ai facut bine</h1>
        <p>${json.positives}</p>
    </section>
    ${json.improvements ? `
    <section>
        <h1>Ce ar trebui să îmbunătățești</h1>
        <p>${json.improvements}</p>
    </section>` : ''}
    ${json.suggestions ? `
    <section>
        <h1>Sugestii</h1>
        <p>${json.suggestions}</p>
    </section>` : ''}
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
 