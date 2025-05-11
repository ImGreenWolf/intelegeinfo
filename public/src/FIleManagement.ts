const FileContainer = document.getElementById("editor-tabs-container") as HTMLDivElement;


export function onFileCreate(messageBodyJson: string) {
        const command = JSON.parse(messageBodyJson);
        
        const fileName = command;

        const fileElem = document.createElement("div");
        fileElem.className = "file-tab";
        fileElem.innerText = fileName;
        fileElem.onclick = () => {
          //  createFile();
        } 
        FileContainer.appendChild(fileElem);
    }
        
