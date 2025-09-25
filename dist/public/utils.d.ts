export declare function getCookie(cname: any): string;
export declare function displayInputPopup(message: any, placeholder?: string): Promise<{
    ok: boolean;
    value?: string;
    popup?: HTMLElement;
}>;
export declare function displayMessagePopup(message: any): void;
export declare function displayConfirmPopup(message: any, confirmText?: string, rejectText?: string): Promise<{
    value: boolean;
    popup?: HTMLElement;
}>;
export declare function createNode<K extends keyof HTMLElementTagNameMap>(tag: K, options?: {
    innerText?: string;
    css?: string;
    className?: string;
    id?: string;
    html?: (Node | undefined)[];
    htmlSting?: string;
    attributes?: ({
        name: string;
        value: string;
    } | undefined)[];
    onclick?: (ev: any) => void;
    onchange?: (ev: any) => void;
    onhover?: (ev: MouseEvent) => void;
}): HTMLElementTagNameMap[K];
