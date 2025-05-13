"use strict";
const form = document.getElementById('codeForm');
const codeInput = document.getElementById('code');
const display = document.getElementById('display');
let lastIndex = 0;
codeInput.oninput = (ev) => {
    // if(index<=0)
    //     display.children[0].innerHTML = ''
    const code = ev.target.value;
    // ev.target.value='';
    const index = code.length - 1; //ev.target.value.length-1;
    if (index > 5)
        return;
    if (index >= lastIndex) {
        display.children[index].innerHTML = code[index];
        display.children[index].classList.add('filled');
    }
    else
        for (let i = index + 1; i <= lastIndex; i++) {
            display.children[i].innerHTML = '';
            display.children[i].classList.remove('filled');
        }
    lastIndex = index;
    // for(let i=0;i<6;i++)
    //     if(i<=index && index!=0)
    //     {
    //         display.children[i].classList.add('filled')
    //     }
    //     else
    //     {
    //         display.children[i].classList.remove('filled')
    //         display.children[i].innerHTML = ''
    //     }
};
