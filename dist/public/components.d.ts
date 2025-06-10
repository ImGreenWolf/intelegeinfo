declare abstract class IElement {
    abstract render(): Node;
}
export declare class Dock extends IElement {
    render(): HTMLDivElement;
}
export {};
