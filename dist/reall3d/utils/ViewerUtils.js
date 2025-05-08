// ================================
// Copyright (c) 2025 reall3d.com
// ================================
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { ComputeFps, GetFpsReal, CountFpsReal, Vector3ToString, CountFpsDefault, GetFpsDefault, Information, IsDebugMode, ViewerUtilsDispose, OnViewerBeforeUpdate, ControlsUpdate, OnViewerUpdate, ViewerDispose, GetCameraFov, GetCameraPosition, GetCameraLookAt, GetCameraLookUp, } from '../events/EventConstants';
import { CameraControls } from '../controls/CameraControls';
export function setupViewerUtils(events) {
    let disposed = false;
    const on = (key, fn, multiFn) => events.on(key, fn, multiFn);
    const fire = (key, ...args) => events.fire(key, ...args);
    on(ViewerUtilsDispose, () => (disposed = true));
    const fpsMap = new Map();
    const fpsRealMap = new Map();
    on(CountFpsDefault, () => fire(IsDebugMode) && fpsMap.set(Date.now(), 1));
    on(GetFpsDefault, () => fire(IsDebugMode) && fire(ComputeFps, fpsMap));
    on(CountFpsReal, () => fire(IsDebugMode) && fpsRealMap.set(Date.now(), 1));
    on(GetFpsReal, () => fire(IsDebugMode) && fire(ComputeFps, fpsRealMap));
    on(OnViewerUpdate, () => {
        fire(CountFpsReal);
        fire(IsDebugMode) &&
            fire(Information, {
                fov: fire(GetCameraFov),
                position: fire(Vector3ToString, fire(GetCameraPosition)),
                lookAt: fire(Vector3ToString, fire(GetCameraLookAt)),
                lookUp: fire(Vector3ToString, fire(GetCameraLookUp)),
            });
    }, true);
    let iRender = 0;
    on(OnViewerBeforeUpdate, () => {
        fire(ControlsUpdate);
        if (fire(IsDebugMode)) {
            fire(CountFpsDefault);
            !(iRender++ % 5) && fire(Information, { fps: fire(GetFpsDefault), realFps: fire(GetFpsReal) });
        }
    }, true);
    on(ComputeFps, (map) => {
        let dels = [];
        let now = Date.now();
        let rs = 0;
        for (const key of map.keys()) {
            if (now - key <= 1000) {
                rs++;
            }
            else {
                dels.push(key);
            }
        }
        dels.forEach(key => map.delete(key));
        return Math.min(rs, 30);
    });
    window.addEventListener('beforeunload', () => fire(ViewerDispose));
}
export function initSplatMeshOptions(options) {
    const opts = { ...options };
    // 默认参数校验设定
    opts.bigSceneMode ?? (opts.bigSceneMode = false);
    opts.pointcloudMode ?? (opts.pointcloudMode = !opts.bigSceneMode); // 小场景默认点云模式，大场景默认正常模式
    opts.lightFactor ?? (opts.lightFactor = 1.0);
    opts.name ?? (opts.name = '');
    opts.showWaterMark ?? (opts.showWaterMark = true);
    return opts;
}
export function initGsViewerOptions(options) {
    const opts = { ...options };
    // 默认参数校验设定
    opts.position = opts.position ? [...opts.position] : [0, -5, 15];
    opts.lookAt = opts.lookAt ? [...opts.lookAt] : [0, 0, 0];
    opts.lookUp = opts.lookUp ? [...opts.lookUp] : [0, -1, 0];
    opts.fov ?? (opts.fov = 45);
    opts.near ?? (opts.near = 0.001);
    opts.far ?? (opts.far = 1000);
    opts.enableDamping ?? (opts.enableDamping = true);
    opts.autoRotate ?? (opts.autoRotate = true);
    opts.enableZoom ?? (opts.enableZoom = true);
    opts.enableRotate ?? (opts.enableRotate = true);
    opts.enablePan ?? (opts.enablePan = true);
    opts.enableKeyboard ?? (opts.enableKeyboard = true);
    opts.bigSceneMode ?? (opts.bigSceneMode = false);
    opts.pointcloudMode ?? (opts.pointcloudMode = !opts.bigSceneMode); // 小场景默认点云模式，大场景默认正常模式
    opts.lightFactor ?? (opts.lightFactor = 1.1);
    opts.maxRenderCountOfMobile ?? (opts.maxRenderCountOfMobile = opts.bigSceneMode ? 256 * 10000 : (256 + 128) * 10240);
    opts.maxRenderCountOfPc ?? (opts.maxRenderCountOfPc = opts.bigSceneMode ? (256 + 64) * 10000 : (256 + 128) * 10000);
    opts.debugMode ?? (opts.debugMode = location.protocol === 'http:' || /^test\./.test(location.host)); // 生产环境不开启
    opts.markMode ?? (opts.markMode = false);
    opts.markVisible ?? (opts.markVisible = true);
    opts.meterScale ?? (opts.meterScale = 1);
    return opts;
}
export function initCanvas(opts) {
    opts.root ?? (opts.root = '#gsviewer');
    opts.canvas ?? (opts.canvas = '#gsviewer-canvas');
    let canvas;
    if (opts.canvas) {
        canvas = typeof opts.canvas === 'string' ? document.querySelector(opts.canvas) : opts.canvas;
    }
    if (!canvas) {
        let root;
        if (opts.root) {
            root = typeof opts.root === 'string' ? document.querySelector(opts.root) || document.querySelector('#gsviewer') : opts.root;
        }
        else {
            root = document.querySelector('#gsviewer') || document.querySelector('body');
        }
        if (!root) {
            root = document.createElement('div');
            root.id = 'gsviewer';
            document.body.appendChild(root);
        }
        canvas = document.createElement('canvas');
        canvas.id = 'gsviewer-canvas';
        root.appendChild(canvas);
    }
    opts.canvas = canvas;
    return canvas;
}
export function initRenderer(opts) {
    let renderer = null;
    if (!opts.renderer) {
        const canvas = initCanvas(opts);
        renderer = new WebGLRenderer({ canvas, antialias: false });
        renderer.setSize(innerWidth, innerHeight);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        opts.renderer = renderer;
    }
    else {
        renderer = opts.renderer;
    }
    return renderer;
}
export function initScene(opts) {
    const scene = opts.scene || new Scene();
    opts.scene = scene;
    return scene;
}
export function initCamera(opts) {
    let camera = opts.camera;
    if (!camera) {
        const canvas = initCanvas(opts);
        const aspect = canvas.width / canvas.height;
        let lookUp = new Vector3().fromArray(opts.lookUp);
        let lookAt = new Vector3().fromArray(opts.lookAt);
        let position = new Vector3().fromArray(opts.position);
        camera = new PerspectiveCamera(opts.fov, aspect, opts.near, opts.far);
        camera.position.copy(position);
        camera.up.copy(lookUp).normalize();
        camera.lookAt(lookAt);
        opts.camera = camera;
    }
    return opts.camera;
}
export function initControls(opts) {
    const controls = new CameraControls(opts);
    opts.controls = controls;
    return controls;
}
export function copyGsViewerOptions(gsViewerOptions) {
    const { renderer, scene } = gsViewerOptions;
    const opts = { renderer, scene };
    opts.viewerEvents = gsViewerOptions.viewerEvents;
    opts.debugMode = gsViewerOptions.debugMode;
    opts.renderer = gsViewerOptions.renderer;
    opts.scene = gsViewerOptions.scene;
    opts.controls = gsViewerOptions.controls;
    opts.bigSceneMode = gsViewerOptions.bigSceneMode;
    opts.pointcloudMode = gsViewerOptions.pointcloudMode;
    opts.maxRenderCountOfMobile = gsViewerOptions.maxRenderCountOfMobile;
    opts.maxRenderCountOfPc = gsViewerOptions.maxRenderCountOfPc;
    opts.lightFactor = gsViewerOptions.lightFactor;
    opts.shDegree = gsViewerOptions.shDegree;
    return opts;
}
