import { Events } from '../events/Events';
/**
 * 相机参数信息
 */
export interface CameraInfo {
    /**
     * 相机视场
     */
    fov?: number;
    /**
     * 相机近截面距离
     */
    near?: number;
    /**
     * 相机远截面距离
     */
    far?: number;
    /**
     * 相机宽高比
     */
    aspect?: number;
    /**
     * 相机位置
     */
    position: number[];
    /**
     * 相机注视点
     */
    lookAt?: number[];
    /**
     * 相机上向量
     */
    lookUp?: number[];
}
export declare function setupCameraControls(events: Events): void;
