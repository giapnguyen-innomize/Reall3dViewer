export declare class Events {
    private map;
    constructor();
    on(key: number, fn?: Function, multiFn?: boolean): Function | Function[];
    fire(key: number, ...args: any): any;
    tryFire(key: number, ...args: any): any;
    off(key: number): void;
    clear(): void;
}
export declare const uiEvent: Events;
