import { loadExplorer, createFolder } from "./fileManager.js"
import { createNode } from "./utils.js"

main()

async function main() {
    const button = createNode('button', {onclick: () => createFolder(), innerText: 'Creaza Fisier'})
     loadExplorer(document.getElementsByClassName('projects-container')[0], button)

    document.getElementById('project-toolbar')!.prepend(button)
}