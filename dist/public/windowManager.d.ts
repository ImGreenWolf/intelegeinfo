import Ace from "ace-builds";
export declare class EditorWindow {
    element: HTMLElement;
    tabContainer: HTMLElement;
    contentContainer: HTMLElement;
    activeTab: EditorWindowTab | undefined;
    editor: Ace.Editor | undefined;
    constructor(element: any, tabContainer: any, contentContainer: any);
    getEditor(): Ace.Editor;
    protected initializeEditor(): void;
}
export declare class EditorWindowTab {
    element: HTMLElement;
    parentWindow: EditorWindow;
    content: Ace.EditSession | HTMLElement;
    constructor(element: HTMLElement, parentWindow: EditorWindow, content: typeof this.content);
}
