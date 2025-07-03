import Ace from "ace-builds";
import { MultiCursorManager } from "./codeEditor.js";
export declare const cursorManagers: Map<string, MultiCursorManager>;
export declare class EditorWindow {
    element: HTMLElement;
    tabContainer: HTMLElement;
    contentContainer: HTMLElement;
    activeTab: EditorWindowTab | undefined;
    previousActiveTab: EditorWindowTab | undefined;
    editor: Ace.Editor | undefined;
    index: number;
    tabs: EditorWindowTab[];
    tooltip: TokenTooltip | undefined;
    constructor(index: any, element: any, tabContainer: any, contentContainer: any);
    destroyEditor(): void;
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
export declare function updateCatalouge(): void;
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
