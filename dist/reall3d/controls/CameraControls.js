// ================================
// Copyright (c) 2025 reall3d.com
// ================================
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initCanvas } from '../utils/ViewerUtils';
import { isMobile } from '../utils/consts/GlobalConstants';
/**
 * 旋转控制器
 */
export class CameraControls extends OrbitControls {
    constructor(opts) {
        const canvas = initCanvas(opts);
        const camera = opts.camera;
        super(camera, canvas);
        const that = this;
        that.dampingFactor = 0.1;
        that.rotateSpeed = 0.4;
        that.updateByOptions(opts);
    }
    updateByOptions(opts = {}) {
        const that = this;
        opts.enableDamping !== undefined && (that.enableDamping = opts.enableDamping);
        opts.autoRotate !== undefined && (that.autoRotate = opts.autoRotate);
        opts.enableZoom !== undefined && (that.enableZoom = opts.enableZoom);
        opts.enableRotate !== undefined && (that.enableRotate = opts.enableRotate);
        opts.enablePan !== undefined && (that.enablePan = opts.enablePan);
        opts.minDistance !== undefined && (that.minDistance = opts.minDistance);
        opts.maxDistance !== undefined && (that.maxDistance = opts.maxDistance);
        opts.minPolarAngle !== undefined && (that.minPolarAngle = opts.minPolarAngle);
        opts.maxPolarAngle !== undefined && (that.maxPolarAngle = opts.maxPolarAngle);
        opts.fov !== undefined && (that.object.fov = opts.fov);
        opts.near !== undefined && (that.object.near = opts.near);
        opts.far !== undefined && (that.object.far = opts.far);
        opts.position && that.object.position.fromArray(opts.position);
        opts.lookAt && that.target.fromArray(opts.lookAt);
        opts.lookUp && that.object.up.fromArray(opts.lookUp);
        // @ts-ignore
        isMobile && that._dollyOut?.(0.75); // 手机适当缩小
        that.updateRotateAxis();
        that.update();
    }
    /**
     * 更新旋转轴
     */
    updateRotateAxis() {
        // @ts-ignore
        this._quat?.setFromUnitVectors?.(this.object.up, new Vector3(0, 1, 0));
        // @ts-ignore
        this._quatInverse = this._quat?.clone?.()?.invert?.();
    }
}
