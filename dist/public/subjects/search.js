"use strict";
const inputElem = document.getElementById('search-input');
const displayElem = document.getElementById('display');
let timeout;
inputElem.oninput = (ev) => {
    if (timeout)
        clearTimeout(timeout);
    timeout = setTimeout(async () => {
        const input = inputElem.value;
        const res = await fetch('subiecte/search?input=' + encodeURI(input));
        const json = await res.json();
        if (input == '')
            displayElem.innerHTML = '';
        else
            displayElem.innerHTML = json.map(field => `<a href='subiecte/file/${field.entry.file}' title='Search score: ${field.score}' style='color: white'>${field.entry.val}</a>`).splice(0, 10).join('\n');
    }, 200);
};
