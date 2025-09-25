import { Folder, Project, SavedProject } from "../../generated/prisma";
import { createNode, displayInputPopup } from "./utils.js";


let draggedSave: {uuid: string, elem: HTMLElement, isFolder: boolean} | undefined = undefined
let parentFolder: any | undefined = undefined
let container: Element


export async function loadExplorer(elem: Element, createFolderElement: HTMLButtonElement) {
    const res = await fetch('/user/listProjects')
    if(!res.ok)
        return;

    const json: {
        folders: Folder[],
        projects: SavedProject[]
    } = await res.json();
    container = elem

    createFolderElement.onclick = createFolder
    updateExplorer(json)
}


export async function updateExplorer(json) {
    const folderArr: HTMLElement[] = []
    parentFolder = json
    if(json.folderId && !json.ParentFolder)
        folderArr.push(createFolderElement(undefined, 'project-parent-folder'))
    else if(json.ParentFolder)
        folderArr.push(createFolderElement(json.ParentFolder,'project-parent-folder'))

    for(const folder of json.folders)
        folderArr.push(createFolderElement(folder))

    for(const project of json.projects)
    {
        const projectElem = createNode('a', {attributes: [{name: 'href', value: `/editor?save=${project.id}`}, {name: 'draggable', value: 'true'}],
            className: 'project',htmlSting: `<h3>${project.name}</h3><button>x</button>`})

        projectElem.ondragstart = (event) =>
        {
            event.dataTransfer!.setData("text/plain", project.name!)
            draggedSave = {elem: projectElem, uuid: project.id, isFolder: false}
        }
        
        folderArr.push(projectElem)

    }

    container!.replaceChildren(...folderArr )
}

 function createFolderElement(folder?: {name: string, folderId: string}, className?: string) {
    const folderElem = createNode('button', {innerText: folder ? folder.name : 'Folder Principal',
        attributes: [{name: 'draggable', value: 'true'}], className: 'project-folder ' + (className ?? ''),
        async onclick(ev) {
            const res = await fetch(!folder ? '/user/listProjects' : `/user/folder/f/${folder.folderId}`)
            if(!res.ok)
                return;
            updateExplorer( await res.json())
            
        },})
    if(folder)
    folderElem.ondragstart = (event) =>
    {
        event.dataTransfer!.setData("text/plain", folder.name)
        draggedSave = {elem: folderElem, uuid: folder.folderId, isFolder: true}
    }
    
    folderElem.addEventListener("dragover", (event) => {
            event.preventDefault();
    });

    folderElem.ondrop = (ev) => onElemDrop(ev, folder)

    return folderElem
}

async function onElemDrop(ev, folder) {
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
    draggedSave.elem.remove()
    draggedSave = undefined
}

export async function createFolder() {
    const name = (await displayInputPopup('Ce nume vrei sa aiba folderul?')).value
    const res = await fetch('/user/folder/create', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name,
            parentFolderId: parentFolder.folderId
        })
    })
    if(!res.ok)
        return;

    const json: {
        folders: Folder[],
        projects: Project[]
    } = await res.json();
}

