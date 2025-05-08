import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Reall3dViewerOptions } from '../viewer/Reall3dViewerOptions';
/**
 * 旋转控制器
 */
export declare class CameraControls extends OrbitControls {
    constructor(opts: Reall3dViewerOptions);
    updateByOptions(opts?: Reall3dViewerOptions): void;
    /**
     * 更新旋转轴
     */
    updateRotateAxis(): void;
}
