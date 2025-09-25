import { createNode, displayInputPopup } from "./utils.js";
let draggedSave = undefined;
let parentFolder = undefined;
let container;
let cache = new Map();
export async function loadExplorer(elem, createFolderElement) {
    let json;
    if (!cache.has('root')) {
        const res = await fetch('/user/listProjects');
        if (!res.ok)
            return;
        json = await res.json();
        cache.set('root', json);
    }
    else
        json = cache.get('root');
    if (elem)
        container = elem;
    if (createFolderElement)
        createFolderElement.onclick = createFolder;
    updateExplorer(json);
}
export async function updateExplorer(json) {
    const folderArr = [];
    parentFolder = json;
    if (json.folderId && !json.ParentFolder)
        folderArr.push(createFolderElement(undefined, 'project-parent-folder'));
    else if (json.ParentFolder)
        folderArr.push(createFolderElement(json.ParentFolder, 'project-parent-folder'));
    for (const folder of json.folders)
        folderArr.push(createFolderElement(folder));
    for (const project of json.projects) {
        const projectElem = createNode('a', { attributes: [{ name: 'href', value: `/editor?save=${project.id}` }, { name: 'draggable', value: 'true' }],
            className: 'project', htmlSting: `<h3>${project.name}</h3><button>x</button>` });
        projectElem.ondragstart = (event) => {
            event.dataTransfer.setData("text/plain", project.name);
            draggedSave = { elem: projectElem, uuid: project.id, isFolder: false };
        };
        folderArr.push(projectElem);
    }
    container.replaceChildren(...folderArr);
}
function createFolderElement(folder, className) {
    const folderElem = createNode('button', { innerText: folder ? folder.name : 'Folder Principal',
        attributes: [{ name: 'draggable', value: 'true' }], className: 'project-folder ' + (className ?? ''),
        async onclick(ev) {
            let json;
            if (!cache.has(folder?.folderId) || !cache.get(folder?.folderId)) {
                cache.set(folder?.folderId, json);
                const res = await fetch(!folder ? '/user/listProjects' : `/user/folder/f/${folder.folderId}`);
                if (!res.ok)
                    return;
                json = await res.json();
            }
            else
                json = cache.get(folder?.folderId);
            updateExplorer(json);
        }, });
    if (folder)
        folderElem.ondragstart = (event) => {
            event.dataTransfer.setData("text/plain", folder.name);
            draggedSave = { elem: folderElem, uuid: folder.folderId, isFolder: true };
        };
    folderElem.addEventListener("dragover", (event) => {
        event.preventDefault();
    });
    folderElem.ondrop = (ev) => onElemDrop(ev, folder);
    return folderElem;
}
async function onElemDrop(ev, folder) {
    ev.preventDefault();
    if (!draggedSave)
        return;
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
    });
    if (!res.ok)
        return;
    draggedSave.elem.remove();
    draggedSave = undefined;
}
export async function createFolder() {
    const name = (await displayInputPopup('Ce nume vrei sa aiba folderul?')).value;
    const res = await fetch('/user/folder/create', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name,
            parentFolderUUID: parentFolder.folderId
        })
    });
    if (!res.ok)
        return;
    const json = await res.json();
    cache.delete(parentFolder.folderId);
    loadExplorer();
}
