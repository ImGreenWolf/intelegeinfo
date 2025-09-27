import { createNode, displayInputPopup, displayMessagePopup } from "./utils.js";
let draggedSave = undefined;
let parentFolder = undefined;
let container;
let cache = new Map();
let contentCache = new Map();
let currentPathElem;
let activeContextMenu;
document.head.append(createNode('link', { attributes: [{ name: 'rel', value: 'stylesheet' }, { name: 'href', value: "../css/folderManager.css" }] }));
export async function loadExplorer(elem, createFolderElement, pathElem) {
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
    if (pathElem)
        currentPathElem = pathElem;
    if (createFolderElement)
        createFolderElement.onclick = createFolder;
    updateExplorer(json);
}
function getCurrentPath(currentFolder, arr = []) {
    let string = currentFolder.name ? currentFolder.name : '';
    if (!currentFolder.folderId)
        return string;
    if (!cache.has(currentFolder.folderId) || !cache.has(cache.get(currentFolder.folderId).parentFolderId))
        return string;
    else
        return getCurrentPath(cache.get(cache.get(currentFolder.folderId).parentFolderId)) + '/' + string;
}
export async function updateExplorer(json) {
    const folderArr = [];
    const projMap = new Map();
    parentFolder = json;
    if (json.folderId && !json.ParentFolder)
        folderArr.push(createFolderElement(undefined, 'project-parent-folder filled'));
    else if (json.ParentFolder)
        folderArr.push(createFolderElement(json.ParentFolder, 'project-parent-folder filled'));
    if (json && currentPathElem)
        currentPathElem.innerHTML = getCurrentPath(json);
    for (const folder of json.folders)
        folderArr.push(createFolderElement(folder));
    for (const project of json.projects) {
        const img = createNode('div', { className: 'project-sneakpeak' });
        const title = createNode('h3', { innerText: project.name });
        const projectElem = createNode('div', { attributes: [{ name: 'href', value: `/editor?save=${project.id}` }, { name: 'draggable', value: 'true' }],
            className: 'project', html: [img, title], onclick(ev) {
                if (ev.target.parentElement != projectElem)
                    return;
                const link = `/editor?save=${project.id}`;
                if (ev.ctrlKey)
                    open(link);
                else
                    location.href = link;
            }, });
        projMap.set(project.id, { projectElem, img, project });
        createContextMenu(project, projectElem);
        projectElem.ondragstart = (event) => {
            event.dataTransfer.setData("text/plain", project.name);
            draggedSave = { elem: projectElem, uuid: project.id, isFolder: false };
        };
        folderArr.push(projectElem);
    }
    container.replaceChildren(...folderArr);
    loadContent(projMap, json);
    let index = 0;
    for (const elem of folderArr)
        elem.animate([
            { opacity: 0, transform: 'translateY(-5px)' },
            { opacity: 1 }
        ], {
            duration: 100,
            fill: "both",
            delay: 25 * index++
        });
}
async function loadContent(projects, folder) {
    const id = folder && folder.folderId ? folder.folderId : 'root';
    let json;
    if (cache.has(id) && cache.get(id).projects[0]?.Project)
        json = cache.get(id);
    else {
        const res = await fetch(!folder || !folder.folderId ? '/user/listProjects/content' : `/user/folder/f/${folder.folderId}/content`);
        if (!res.ok)
            return;
        json = await res.json();
        const oldCache = cache.get(id);
        cache.set(id, { ...oldCache, projects: json.projects });
    }
    for (const project of json.projects) {
        if (!project.Project || !project.Project.files || !project.Project.files.content)
            continue;
        if (!projects.has(project.id))
            continue;
        const projRef = projects.get(project.id);
        projRef.img.innerText = project.Project.files.content;
        projRef.projectElem.title = project.Project.files.content;
    }
}
function createContextMenu(projectOrFolder, elem) {
    elem.oncontextmenu = (ev) => {
        if (ev.target == activeContextMenu && activeContextMenu)
            return;
        ev.preventDefault();
        if (activeContextMenu)
            activeContextMenu.remove(), activeContextMenu = undefined;
        const isFolder = projectOrFolder.folderId != undefined;
        const elems = [
            createNode('div', { innerText: new Date(projectOrFolder.createdAt ?? projectOrFolder.savedAt).toLocaleDateString('ro-RO') }),
            createNode('button', { innerText: "Redenumeste", async onclick(ev) {
                    ev.preventDefault();
                    const name = (await displayInputPopup('Ce nume vrei sa aiba folderul?')).value;
                    if (!projectOrFolder.id && !(projectOrFolder.folderId && isFolder))
                        throw 'invalid id';
                    const res = isFolder ?
                        await fetch(`/user/folder/f/${projectOrFolder.folderId}/update`, {
                            method: 'post',
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name
                            })
                        }) :
                        await fetch(`/user/project/p/${projectOrFolder.id}/update`, {
                            method: 'post',
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name
                            })
                        });
                    if (!res.ok)
                        displayMessagePopup('Nu am putut updata proiectul/fisierul');
                    else {
                        const json = await res.json();
                        if (isFolder)
                            cache.set(projectOrFolder.folderId, json);
                        if (projectOrFolder.parentFolderId)
                            if (cache.has(projectOrFolder.parentFolderId))
                                cache.delete(projectOrFolder.parentFolderId); ///    TODO: update existing cache
                            else if (isFolder)
                                cache.delete('root'); ///    TODO: update existing cache
                            else
                                cache.set('root', json);
                        updateExplorer(json);
                    }
                },
            }),
            createNode('button', { innerText: "Partajeaza" }),
            createNode('button', { innerText: "Sterge", css: 'color: red' }),
        ];
        activeContextMenu = createNode('aside', { html: elems, css: `left: ${ev.offsetX}px; top: ${ev.offsetY}px; position: absolute;`, className: 'project-contextMenu' });
        elem.appendChild(activeContextMenu);
    };
    elem.oncontextlost = (ev) => {
        ev.preventDefault();
        if (activeContextMenu)
            activeContextMenu.remove(), activeContextMenu = undefined;
    };
    elem.onpointerleave = (ev) => {
        if (activeContextMenu)
            activeContextMenu.remove(), activeContextMenu = undefined;
    };
}
async function onFolderClick(folder, ev, folderElem) {
    if (ev.target.parentElement != folderElem)
        return;
    let json;
    let containerAnim;
    let index = 0;
    if (!cache.has(folder?.folderId) || !cache.get(folder?.folderId)) {
        const res = await fetch(!folder ? '/user/listProjects' : `/user/folder/f/${folder.folderId}`);
        if (!res.ok)
            return;
        containerAnim = container.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration: 100,
            delay: 300,
            fill: "both",
        });
        for (const elem of Array.from(container.children).reverse())
            elem.animate([
                { opacity: 1, transform: 'translateY(5px)' },
                { opacity: 0 }
            ], {
                duration: 50,
                fill: "both",
                delay: 25 * index++
            });
        json = await res.json();
        cache.set(folder?.folderId, json);
    }
    else
        json = cache.get(folder?.folderId);
    setTimeout(() => {
        updateExplorer(json);
        if (containerAnim)
            containerAnim.cancel();
    }, Math.min(index * 25 + 50, 400));
}
function createFolderElement(folder, className) {
    const folderElem = createNode('button', { htmlSting: `<div>${folder ? folder.name : 'Folder Principal'}</div>`,
        attributes: [{ name: 'draggable', value: folder ? 'true' : 'false' }], className: 'project-folder ' + (className ?? '') +
            (folder && (folder._count) && (folder._count.Projects + folder._count.ChildFolders != 0) ? 'filled' : ''),
        onclick: (ev) => onFolderClick(folder, ev, folderElem) });
    if (folder) {
        createContextMenu(cache.get(folder.folderId) ?? folder, folderElem);
        folderElem.ondragstart = (event) => {
            event.dataTransfer.setData("text/plain", folder.name);
            draggedSave = { elem: folderElem, uuid: folder.folderId, isFolder: true };
        };
    }
    folderElem.ondragenter = (ev) => folderElem.classList.add('drag');
    folderElem.ondragleave = (ev) => folderElem.classList.remove('drag');
    folderElem.addEventListener("dragover", (event) => {
        event.preventDefault();
    });
    folderElem.ondrop = (ev) => onElemDrop(folderElem, ev, folder);
    return folderElem;
}
async function onElemDrop(folderElem, ev, folder) {
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
    folderElem.classList.add('filled');
    let relativeLeft = folderElem.offsetLeft - draggedSave.elem.offsetLeft;
    let relativeTop = folderElem.offsetTop - draggedSave.elem.offsetTop;
    draggedSave.elem.animate([
        { left: 0, top: 0, opacity: 1 },
        { opacity: 0 },
        { left: relativeLeft + "px", top: relativeTop + "px", opacity: 0 }
    ], {
        duration: 200,
        easing: 'ease-in'
    }).onfinish = (ev) => {
        draggedSave.elem.remove();
        draggedSave = undefined;
    };
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
    if (!parentFolder.folderId)
        cache.delete('root');
    else
        cache.delete(parentFolder.folderId);
    loadExplorer();
}
