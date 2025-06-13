declare global {
    interface Window {
        editor: any;
    }
}
declare abstract class IElement {
    abstract render(): Node | Promise<Node>;
    stylesheet(style: string): HTMLStyleElement;
}
export declare function createNode<K extends keyof HTMLElementTagNameMap>(tag: K, options?: {
    innerText?: string;
    css?: string;
    className?: string;
    id?: string;
    html?: Node[];
    htmlSting?: string;
    attributes?: {
        name: string;
        value: string;
    }[];
}): HTMLElementTagNameMap[K];
export declare class Dock extends IElement {
    render(): HTMLDivElement;
}
export declare class Pixelated extends IElement {
    render(): Promise<Node>;
}
export {};
