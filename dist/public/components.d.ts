import { UUID } from "crypto";
declare global {
    interface Window {
        editor: any;
    }
}
declare abstract class IElement {
    parentElement: HTMLElement | undefined;
    constructor(parentElem?: HTMLElement);
    abstract render(): Node | Promise<Node>;
    stylesheet(style: string): HTMLStyleElement;
    private appendRender;
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
interface Point {
    x: any;
    y: any;
}
export declare class EditorCanvas extends IElement {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    h: number;
    w: number;
    isDrawing: number;
    ws: WebSocket;
    clientId: UUID;
    strokeIndex: number;
    updateSize(): void;
    render(): HTMLCanvasElement;
    remove(): void;
    private onUpdate;
    relativeToCanvas(coords: Point): Point;
    beginDraw(coords: Point): void;
    draw(coords: Point): void;
    endDraw(): void;
    constructor(ws: WebSocket, clientId: any);
    handleReplication(ev: any): void;
    private replicateDraw;
}
export {};
