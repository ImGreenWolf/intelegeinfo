import { Folder, Project, SavedProject } from "../../generated/prisma";
import { createNode, displayInputPopup } from "./utils.js";


let draggedSave: {uuid: string, elem: HTMLElement, isFolder: boolean} | undefined = undefined
let parentFolder: any | undefined = undefined
let container: Element
let cache = new Map()
let currentPathElem: HTMLDivElement
export async function loadExplorer(elem?: Element, createFolderElement?: HTMLButtonElement, pathElem?: HTMLDivElement) {

    let json: {
        folders: Folder[],
        projects: SavedProject[]
    } | undefined;

     if(!cache.has('root')) {
        const res = await fetch('/user/listProjects')
        if(!res.ok)
            return;

        json = await res.json();
        cache.set('root', json)
    } else
        json = cache.get('root')
   
    if(elem)
        container = elem
    if(pathElem)
        currentPathElem = pathElem
   
    if(createFolderElement)
        createFolderElement.onclick = createFolder

    updateExplorer(json)
}

function getCurrentPath(currentFolder: {name: string, folderId: number}, arr: {name: string, folderId: number}[] = []): string {
    
    // if(currentFolder.ParentFolder) 
    //      arr.push(...getCurrentPath(currentFolder.ParentFolder, arr))
    // else {
    //     const folder = cache.get(currentFolder.folderId)
    //     if(!folder || !cache.has(folder.parentFolderId))
    //         return arr
    //      arr.push(...getCurrentPath(folder.ParentFolder,arr))
    // }
    // console.log(arr)
    // return arr
    let string = currentFolder.name ? currentFolder.name : '/'
    if(!currentFolder.folderId)
        return '/'
    if(!cache.has(currentFolder.folderId) || !cache.has(cache.get(currentFolder.folderId).parentFolderId))
        return string;
    else
    return  getCurrentPath(cache.get(cache.get(currentFolder.folderId).parentFolderId)) + '/' + string 

}
export async function updateExplorer(json) {
    const folderArr: HTMLElement[] = []
    parentFolder = json
    if(json.folderId && !json.ParentFolder)
        folderArr.push(createFolderElement(undefined, 'project-parent-folder filled'))
    else if(json.ParentFolder)
        folderArr.push(createFolderElement(json.ParentFolder,'project-parent-folder'))

    if(json && currentPathElem)
    currentPathElem.innerHTML = getCurrentPath(json)

    for(const folder of json.folders)
        folderArr.push(createFolderElement(folder))

    for(const project of json.projects)
    {
        const projectElem = createNode('div', {attributes: [{name: 'href', value: `/editor?save=${project.id}`}, {name: 'draggable', value: 'true'}],
            className: 'project',htmlSting: `<h3>${project.name}</h3><button>x</button>`, onclick(ev: MouseEvent) {
                const link = `/editor?save=${project.id}`
                if(ev.ctrlKey)
                    open(link)
                else
                    location.href = link
            },})

        projectElem.ondragstart = (event) =>
        {
            event.dataTransfer!.setData("text/plain", project.name!)
            draggedSave = {elem: projectElem, uuid: project.id, isFolder: false}
        }
        
        folderArr.push(projectElem)

    }
    
    container!.replaceChildren(...folderArr )
    let index=0
    for(const elem of folderArr)
        elem.animate([
            {opacity: 0, transform: 'translateY(-5px)'},
            {opacity: 1}
        ], {
            duration: 100,
            fill:"both",
            delay: 25*index++
        })
}

 function createFolderElement(folder?: {name: string, folderId: string, _count: {Projects, ChildFolders}}, className?: string) {
    const folderElem = createNode('button', {htmlSting: `<div>${folder ? folder.name : 'Folder Principal'}</div>`,
        attributes: [{name: 'draggable', value: folder ? 'true' : 'false'}], className: 'project-folder ' + (className ?? '') + 
        (folder && (folder._count) &&  (folder._count.Projects + folder._count.ChildFolders != 0)  ? 'filled' : ''),
        async onclick(ev) {
            let json;
            let containerAnim: Animation | undefined
             let index=0
             if(!cache.has(folder?.folderId) || !cache.get(folder?.folderId))
                {
                    
                    const res = await fetch(!folder ? '/user/listProjects' : `/user/folder/f/${folder.folderId}`)
                    if(!res.ok)
                        return;
                    containerAnim = container.animate([
                            {opacity: 1},
                            {opacity: 0}
                        ], {
                            duration: 100,
                            delay: 300,
                            fill:"both",
                        })
                    for(const elem of Array.from(container.children).reverse())
                        elem.animate([
                            {opacity: 1, transform: 'translateY(5px)'},
                            {opacity: 0}
                        ], {
                            duration: 50,
                            fill:"both",
                            delay: 25*index++
                        })
                    json = await res.json()
                    cache.set(folder?.folderId, json)
                }
            else
                json = cache.get(folder?.folderId)
            setTimeout(() => {
                updateExplorer(json )
                if(containerAnim)
                    containerAnim.cancel()
            }, Math.min(index*25 + 50,400));
            
        },})
    if(folder)
    folderElem.ondragstart = (event) =>
    {
        event.dataTransfer!.setData("text/plain", folder.name)
        draggedSave = {elem: folderElem, uuid: folder.folderId, isFolder: true}
    }
    folderElem.ondragenter = (ev) =>
        folderElem.classList.add('drag')
    
    folderElem.ondragleave = (ev) =>
        folderElem.classList.remove('drag')

    folderElem.addEventListener("dragover", (event) => {
            event.preventDefault();
    });

    folderElem.ondrop = (ev) => onElemDrop(folderElem,ev, folder)

    return folderElem
}

async function onElemDrop(folderElem: HTMLElement,ev, folder) {
    ev.preventDefault();
    if(!draggedSave)
        return
    const res = await fetch(`/user/folder/f/${folder ? folder.folderId : '_root'}/add`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draggedSave.isFolder ? 
        {
            folderUUID: draggedSave.uuid
        } :
        {
            saveUUID: draggedSave.uuid
        })
    })
    if(!res.ok)
        return;
    folderElem.classList.add('filled')

    let relativeLeft =  folderElem.offsetLeft - draggedSave.elem.offsetLeft
    let relativeTop =  folderElem.offsetTop - draggedSave.elem.offsetTop 
    draggedSave.elem.animate([
        {left: 0, top: 0, opacity: 1},
        {opacity: 0},
        {left: relativeLeft+"px", top: relativeTop+"px", opacity: 0}
    ], {
        duration: 200,
        easing: 'ease-in'
    }).onfinish = (ev) => {
        draggedSave!.elem.remove()
        draggedSave = undefined
    }

}

export async function createFolder() {
    const name = (await displayInputPopup('Ce nume vrei sa aiba folderul?')).value
    const res = await fetch('/user/folder/create', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name,
            parentFolderUUID: parentFolder.folderId
        })
    })
    if(!res.ok)
        return;

    const json: {
        folders: Folder[],
        projects: Project[]
    } = await res.json();
    if(!parentFolder.folderId)
        cache.delete('root')
    else
        cache.delete(parentFolder.folderId)
    loadExplorer()
}

