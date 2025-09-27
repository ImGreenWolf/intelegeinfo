
export function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
      c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
      }
  }
  return undefined;
}

export function displayInputPopup(message, placeholder='')
{
  let popup;
  const promise = new Promise<{ok:boolean, value?: string, popup?: HTMLElement}>(async (resolve, reject) => {
    
    popup = createPopup('input-popup', 10, [
      
      createNode('button', {innerText: 'x', onclick: () => {resolve({ok: false})}}),
      createNode('p', {innerText: message}),
      createNode('input', {attributes: [{name: 'type', value: "text"}, {name: 'placeholder', value: placeholder}], onchange(ev) {
        resolve({ok: true, value: ev.target.value})
      },}),
      
    ], true)
    
  })
  promise.then(() => {
    // if(popup)
    popup.animate([
        { opacity:"100%", transform: "translate(-50%, -50%)"},
        { opacity: "0%",  transform: "translate(-50%, 0%)"},
      ],
      {
        duration: 250,
        // easing: "ease-out"
      }).addEventListener('finish', () =>
      {
        popup!.remove();
      })
  })
  return promise;
  
}



export function displayMessagePopup(message)
{
  function createPopup(classList: string, innerHTML): typeof popup | undefined
  {
    if(!innerHTML) return;
    const popup = document.createElement('div')
    popup.classList.add("client-popup")
    if(classList.split[' '])
      for(const classname of classList.split[' '])
        popup.classList.add(classname);

    // popup.innerHTML = `<button class="client-popup-close"></button><div>${innerHTML}</div>`;
    const close = createNode('button', {className: 'client-popup-close'})
    close.onclick = () => {
      popup.remove()
     }
    popup.appendChild(close)
    popup.appendChild(createNode('div', {htmlSting: innerHTML}))
    document.body.appendChild(popup)

    setTimeout(() => {
      popup.remove();
    }, 1000*5);
  }

  createPopup('', `
    <p>${message}</p>
    
    `)
}

function createPopup(classList: string, seconds,innerHTML: HTMLElement[], keepVisible:boolean=false)
{
  function addPopup()
  {
    const popup = createNode('div', {className: 'client-popup '+classList, html: innerHTML})
    document.body.appendChild(popup)
    return popup
  }
  if(keepVisible)
  {
    if(!innerHTML) return;
    return addPopup()
  }
    else
  return new Promise<HTMLElement>((resolve, reject) => {
   if(!innerHTML) return;
    const popup = addPopup()

    setTimeout(() => {
      popup.animate([
        { opacity:"100%", transform: "scale(1) translate(-50%, -50%)" },
        { opacity: "0%", transform: "scale(0.9) translate(-50%, -50%)"  },
      ],
      {
        duration: 500,
      }).addEventListener('finish', () =>
      {
        popup.remove();
        reject(popup)
      })
      
    }, 1000*seconds);
  })
}


export function displayConfirmPopup(message, confirmText='Accept', rejectText='Cancel')
{
  let popup;
  const promise = new Promise<{value: boolean, popup?: HTMLElement}>((resolve, reject) => {
    
    popup = createPopup('', 10, [
      createNode('button', {innerText: confirmText, onclick: (ev) => resolve({value:true, popup: ev.target.parentElement})}),
      createNode('button', {innerText: rejectText, onclick: (ev) => resolve({value:false, popup: ev.target.parentElement})}),
      createNode('p', {innerText: message})
    ])
    popup.catch(err => {
      resolve({value: false, popup: undefined})
    })
  })
  promise.then(res => {
    if(res.popup)
    res.popup.animate([
        { opacity:"100%", transform: "translate(-50%, -50%)"},
        { opacity: "0%",  transform: "translate(-50%, 0%)"},
      ],
      {
        duration: 250,
        // easing: "ease-out"
      }).addEventListener('finish', () =>
      {
        res.popup!.remove();
      })
  })
  return promise;
  
}

export function createNode
<K extends keyof HTMLElementTagNameMap>
(tag: K, options?: {innerText?: string, css?: string, className?: string, id?: string, html?: (Node | undefined)[],
 htmlSting?: string, attributes?: ({name: string, value: string}|undefined)[], onclick?: (ev) => void,
onchange?: (ev) => void, onhover?: (ev: MouseEvent) => void}): HTMLElementTagNameMap[K]
    {  
        const elem = document.createElement(tag)
        if(options)
        {
            if(options.css)
                elem.style.cssText = options.css
            if(options.className)
                elem.className = options.className
            if(options.id)
                elem.id = options.id
            if(options.innerText)
                elem.innerText = options.innerText
            if(options.html)
                for(const node of options.html)
                    if(node)
                        elem.appendChild(node)
            if(options.attributes)
                for(const attribute of options.attributes)
                    if(attribute)
                        elem.setAttribute(attribute.name, attribute.value)
            if(options.htmlSting)
                elem.innerHTML = options.htmlSting;
            if(options.onclick)
                elem.onclick = options.onclick
            if(options.onchange)
                elem.onchange = options.onchange
            if(options.onhover)
                elem.onmouseover = options.onhover
        }       
        

        return elem
    }