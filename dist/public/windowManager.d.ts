import Ace from "ace-builds";
import { MultiCursorManager } from "./codeEditor.js";
export declare const cursorManagers: Map<string, MultiCursorManager>;
export declare class EditorWindow {
    element: HTMLElement;
    tabContainer: HTMLElement;
    contentContainer: HTMLElement;
    activeTab: EditorWindowTab | undefined;
    previousActiveTab: EditorWindowTab | undefined;
    editor: Ace.Editor | undefined | null;
    index: number;
    tabs: EditorWindowTab[];
    tooltip: TokenTooltip | undefined;
    constructor(index: any, element: any, tabContainer: any, contentContainer: any);
    destroyEditor(): void;
    createEditor(newSession?: any): Ace.Editor;
    getEditor(newSession?: any): Ace.Editor;
    setActiveFile(fileTab: EditorWindowTab): void;
    protected initializeEditor(newSession?: any): void;
    addTab(newTab: EditorWindowTab): void;
}
export declare class EditorWindowTab {
    element: HTMLElement;
    parentWindow: EditorWindow;
    content: Ace.EditSession | HTMLElement;
    name: string;
    constructor(name: any, element: HTMLElement, content: typeof this.content, parentWindow?: EditorWindow, disableDrag?: boolean);
    getDragText: () => string | undefined;
    openTab(ev?: MouseEvent): void;
    onOpenTab(elem: any): void;
    remove(): void;
}
export declare function updateCatalouge(sessionId: any, clientId: any): void;
export declare function createEditorTab(name: any, content: any, disableDrag?: any): EditorWindowTab;
export declare function showDefaultScreen(): Promise<void>;
declare var Tooltip: any;
declare class TokenTooltip extends Tooltip {
    constructor(editor: any);
    token: {};
    range: any;
    update(): Promise<void>;
    onMouseMove(e: any): void;
    onMouseOut(e: any): void;
    setPosition(x: any, y: any): void;
    destroy(): void;
}
export {};
