declare abstract class IElement {
    abstract render(): Node;
    protected node<K extends keyof HTMLElementTagNameMap>(tag: K, options?: {
        css?: string;
        className?: string;
        id?: string;
        html?: Node[];
        htmlSting?: string;
    }): HTMLElementTagNameMap[K];
}
export declare class Dock extends IElement {
    render(): HTMLDivElement;
}
export {};
