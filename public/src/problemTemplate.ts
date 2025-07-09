export async function test(sessionId, problemId)
{
    const res = await fetch(`../test/${problemId}`)
    console.log(res.body)
    const output = document.getElementById('output')
    const json = await res.json()
    if(json.result && res.ok)
        output!.innerText = 'Ok!'
    else
        output!.innerText = 'Some test failed..'
}

 