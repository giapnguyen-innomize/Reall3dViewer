import { Object3D, Vector3 } from 'three';
export declare class ArrowHelper extends Object3D {
    private line;
    private cone;
    type: string;
    private _axis;
    constructor(dir?: Vector3, origin?: Vector3, length?: number, radius?: number, color?: number, headLength?: number, headRadius?: number);
    setDirection(dir: any): void;
    setColor(color: any): void;
    copy(source: any): this;
    dispose(): void;
}
