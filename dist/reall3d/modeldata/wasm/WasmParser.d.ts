import { SpxHeader } from '../ModelData';
export declare function parseSpxHeader(header: Uint8Array): Promise<SpxHeader>;
interface SpxBlockResult {
    splatCount: number;
    blockFormat: number;
    datas?: Uint8Array;
    isSplat?: boolean;
    isSh?: boolean;
    isSh1?: boolean;
    isSh2?: boolean;
    isSh3?: boolean;
    success: boolean;
}
export declare function parseSpxBlockData(data: Uint8Array): Promise<SpxBlockResult>;
export declare function parseSplatToTexdata(data: Uint8Array, splatCount: number): Promise<Uint8Array>;
export declare function parseWordToTexdata(x: number, y0z: number, isY?: boolean, isNgativeY?: boolean): Promise<Uint8Array>;
export {};
