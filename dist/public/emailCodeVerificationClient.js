"use strict";
const form = document.getElementById('codeForm');
const codeInput = document.getElementById('code');
const display = document.getElementById('display');
let lastIndex = 0;
let i = 0;
display.children[0].classList.add('active');
codeInput.oninput = (ev) => {
    // if(index<=0)
    //     display.children[0].innerHTML = ''
    const length = display.children.length;
    const code = ev.target.value;
    // ev.target.value='';
    const index = Math.min(code.length, length) - 1; //ev.target.value.length-1;
    // console.log(index, length, code)
    if (index > length - 1) {
        display.children[index + 1].classList.add('active');
    }
    ev.target.value = ev.target.value.substring(0, length);
    for (i = 0; i < length; i++) {
        display.children[i].classList.remove('active');
        if (i <= index) {
            display.children[i].innerHTML = code[i];
            display.children[i].classList.add('filled');
        }
        else {
            display.children[i].innerHTML = '';
            display.children[i].classList.remove('filled');
        }
    }
    if (lastIndex < length - 1)
        display.children[lastIndex + 1].classList.remove('active');
    if (index < length - 1)
        display.children[index + 1].classList.add('active');
    // if(index>=lastIndex)
    // {
    //     display.children[i].innerHTML = code[i]
    //     display.children[i].classList.add('filled')
    // }
    // else
    //     for(let i=index+1;i<=lastIndex;i++)
    //     {
    //         display.children[i].innerHTML = ''
    //         display.children[i].classList.remove('filled')
    //     }
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
