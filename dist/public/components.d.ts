import { UUID } from "crypto";
declare global {
    interface Window {
        editor: any;
    }
}
declare abstract class IElement {
    parentElement: HTMLElement | undefined;
    constructor(parentElem?: HTMLElement);
    abstract render(...args: any[]): Node | Promise<Node>;
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
    attributes?: ({
        name: string;
        value: string;
    } | undefined)[];
    onclick?: (ev: any) => void;
    onchange?: (ev: any) => void;
}): HTMLElementTagNameMap[K];
export declare class Dock extends IElement {
    render(): HTMLDivElement;
}
export declare function createButton(icon: any, options: {
    href?: any;
    onclick?: () => void;
    class?: any;
    style?: any;
}): HTMLDivElement;
export declare class Toolbox extends IElement {
    render(): HTMLElement;
}
export declare class Pixelated extends IElement {
    canvas: HTMLCanvasElement | undefined;
    render({ x, y, spacingX, spacingY, pointSize, innerVignette, outerVignette, timeScale, hover, trasnlate, power, offset, manualAngle, animatedAnglePow, useMouseAngle, randomness }: {
        x?: number | undefined;
        y?: number | undefined;
        spacingX?: number | undefined;
        spacingY?: number | undefined;
        pointSize?: number | undefined;
        innerVignette?: number | undefined;
        outerVignette?: number | undefined;
        timeScale?: number | undefined;
        hover?: boolean | undefined;
        trasnlate?: number | undefined;
        power?: number | undefined;
        offset?: number | undefined;
        manualAngle?: number | undefined;
        animatedAnglePow?: number | undefined;
        useMouseAngle?: number | undefined;
        randomness?: number | undefined;
    }): Promise<Node>;
}
export declare const hasRequestAnimationFrame: boolean;
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
export declare class LoadingThrobber extends IElement {
    render(): Node;
    private queueThrober;
    private newtonThrober;
}
export {};
