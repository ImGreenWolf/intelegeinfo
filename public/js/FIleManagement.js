"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onFileCreate = onFileCreate;
const FileContainer = document.getElementById("editor-tabs-container");
function onFileCreate(messageBodyJson) {
    const command = JSON.parse(messageBodyJson);
    const fileName = command;
    const fileElem = document.createElement("div");
    fileElem.className = "file-tab";
    fileElem.innerText = fileName;
    fileElem.onclick = () => {
        //  createFile();
    };
    FileContainer.appendChild(fileElem);
}
