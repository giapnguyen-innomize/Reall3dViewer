// ================================
// Copyright (c) 2025 reall3d.com
// ================================
import { AmbientLight } from 'three';
import { GetCurrentDisplayShDegree, GetModelShDegree, IsBigSceneMode, IsControlPlaneVisible, OnSetFlyPositions, OnSetFlyTargets, SplatUpdateShDegree, ClearMarkPoint, CommonUtilsDispose, CreateFocusMarkerMesh, CSS3DRendererDispose, EventListenerDispose, GetMarkFromWeakRef, ViewerDispose, Information, IsCameraChangedNeedUpdate, KeyActionCheckAndExecute, LoadSmallSceneMetaData, MetaMarkSaveData, MarkUpdateVisible, OnViewerAfterUpdate, OnViewerUpdate, RunLoopByTime, SetGaussianText, SplatSetPointcloudMode, SplatSwitchDisplayMode, SplatUpdateLightFactor, SplatUpdateShowWaterMark, StopAutoRotate, TraverseDisposeAndClear, UpdateAllMarkByMeterScale, ViewerUtilsDispose, ViewerCheckNeedUpdate, ViewerSetPointcloudMode, OnSetWaterMark, GetCachedWaterMark, MetaSaveWatermark, AddFlyPosition, Flying, ClearFlyPosition, FlyDisable, GetScene, OnViewerBeforeUpdate, GetOptions, GetControls, GetCanvas, GetRenderer, GetCamera, ViewerNeedUpdate, MetaMarkRemoveData, PrintInfo, GetSplatMesh, FlySavePositions, } from '../events/EventConstants';
import { SplatMesh } from '../meshs/splatmesh/SplatMesh';
import { Events } from '../events/Events';
import { setupControlPlane } from '../meshs/controlplane/SetupControlPlane';
import { copyGsViewerOptions, initCamera, initCanvas, initControls, initGsViewerOptions, initRenderer, initScene, setupViewerUtils, } from '../utils/ViewerUtils';
import { setupEventListener } from '../events/EventListener';
import { setupRaycaster } from '../raycaster/SetupRaycaster';
import { setupCameraControls } from '../controls/SetupCameraControls';
import { setupFocusMarker } from '../meshs/focusmaker/SetupFocusMarker';
import { setupMark } from '../meshs/mark/SetupMark';
import { setupApi } from '../api/SetupApi';
import { setupCommonUtils } from '../utils/CommonUtils';
import { setupFlying } from '../controls/SetupFlying';
import { isMobile, ViewerVersion } from '../utils/consts/GlobalConstants';
/**
 * 高斯渲染器
 */
export class Reall3dViewer {
    constructor(opts = {}) {
        this.disposed = false;
        this.updateTime = 0;
        this.needUpdate = true;
        console.info('Reall3dViewer', ViewerVersion);
        this.init(initGsViewerOptions(opts));
        !opts.disableDropLocalFile && this.enableDropLocalFile();
    }
    init(opts) {
        opts.position = opts.position ? [...opts.position] : [0, -5, 15];
        opts.lookAt = opts.lookAt ? [...opts.lookAt] : [0, 0, 0];
        opts.lookUp = opts.lookUp ? [...opts.lookUp] : [0, -1, 0];
        const canvas = initCanvas(opts);
        const renderer = initRenderer(opts);
        const scene = initScene(opts);
        initCamera(opts);
        const controls = initControls(opts);
        controls.updateByOptions(opts);
        const events = new Events();
        opts.viewerEvents = events;
        this.events = events;
        const on = (key, fn, multiFn) => events.on(key, fn, multiFn);
        const fire = (key, ...args) => events.fire(key, ...args);
        on(GetOptions, () => opts);
        on(GetCanvas, () => canvas);
        on(GetRenderer, () => renderer);
        on(GetScene, () => scene);
        on(GetControls, () => controls);
        on(GetCamera, () => controls.object);
        on(IsBigSceneMode, () => opts.bigSceneMode);
        on(ViewerSetPointcloudMode, (pointMode) => (opts.pointcloudMode = pointMode));
        const aryUpdaters = [];
        on(ViewerNeedUpdate, () => {
            this.needUpdate = true;
            // 稍微多点更新
            while (aryUpdaters.length)
                aryUpdaters.pop().stop = true; // 已有的都停掉
            let oUpdater = { count: 0, stop: false };
            aryUpdaters.push(oUpdater);
            fire(RunLoopByTime, () => {
                !this.disposed && (this.needUpdate = true);
                oUpdater.count++ >= 150 && (oUpdater.stop = true);
            }, () => !this.disposed && (fire(IsControlPlaneVisible) || !oUpdater.stop), 10);
        });
        setupCommonUtils(events);
        setupViewerUtils(events);
        setupApi(events);
        setupCameraControls(events);
        setupMark(events);
        setupEventListener(events);
        setupRaycaster(events);
        setupFocusMarker(events);
        setupFlying(events);
        this.splatMesh = new SplatMesh(copyGsViewerOptions(opts));
        on(GetSplatMesh, () => this.splatMesh);
        scene.add(this.splatMesh);
        setupControlPlane(events);
        scene.add(new AmbientLight('#ffffff', 2));
        scene.add(fire(CreateFocusMarkerMesh));
        renderer.setAnimationLoop(this.update.bind(this));
        on(ViewerCheckNeedUpdate, () => {
            controls.update();
            !this.needUpdate && fire(IsCameraChangedNeedUpdate) && fire(ViewerNeedUpdate);
        });
        on(OnViewerBeforeUpdate, () => fire(KeyActionCheckAndExecute), true);
        on(OnViewerBeforeUpdate, () => fire(ViewerCheckNeedUpdate), true);
        on(OnViewerUpdate, () => {
            try {
                !(this.needUpdate = false) && renderer.render(scene, fire(GetCamera));
            }
            catch (e) {
                console.warn(e.message);
            }
        }, true);
        on(OnViewerAfterUpdate, () => { }, true);
        on(ViewerDispose, () => this.dispose());
        on(PrintInfo, () => console.info(JSON.stringify(fire(GetSplatMesh).meta || {}, null, 2)));
        let watermark = '';
        on(OnSetWaterMark, (text = '') => {
            watermark = text;
            this.splatMesh.fire(SetGaussianText, watermark, true); // 水印文字水平朝向
        });
        on(GetCachedWaterMark, () => watermark);
        fire(Information, { scale: `1 : ${fire(GetOptions).meterScale} m` });
        this.initGsApi();
    }
    /**
     * 允许拖拽本地文件进行渲染
     */
    enableDropLocalFile() {
        const that = this;
        document.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
        document.addEventListener('drop', async function (e) {
            e.preventDefault();
            e.stopPropagation();
            let file = e.dataTransfer.files[0];
            if (!file)
                return;
            let format;
            if (file.name.endsWith('.spx')) {
                format = 'spx';
            }
            else if (file.name.endsWith('.splat')) {
                format = 'splat';
            }
            else if (file.name.endsWith('.ply')) {
                format = 'ply';
            }
            else {
                return console.error('unsupported format:', file.name);
            }
            const url = URL.createObjectURL(file);
            const opts = that.events.fire(GetOptions);
            opts.bigSceneMode = false;
            opts.pointcloudMode = true;
            opts.autoRotate = true;
            opts.debugMode = true;
            that.reset(opts);
            setTimeout(async () => {
                await that.addModel({ url, format });
                URL.revokeObjectURL(url);
            });
        });
    }
    /**
     * 刷新
     */
    update() {
        if (this.disposed)
            return;
        const fire = (key, ...args) => this.events.fire(key, ...args);
        if (Date.now() - this.updateTime > 30) {
            fire(OnViewerBeforeUpdate);
            this.needUpdate && fire(OnViewerUpdate);
            fire(OnViewerAfterUpdate);
        }
    }
    // 开发调试用临时接口
    fire(n, p1, p2) {
        n === 1 && this.splatMesh.fire(SplatUpdateShowWaterMark, p1); // 显示/隐藏水印
        n === 2 && this.events.fire(AddFlyPosition);
        n === 3 && this.events.fire(Flying, true);
        n === 4 && this.events.fire(ClearFlyPosition);
        n === 5 && this.events.fire(FlySavePositions);
        n === 6 && this.events.fire(MetaMarkSaveData);
        n === 7 && this.events.fire(MetaMarkRemoveData);
        if (n === 8) {
            (async () => {
                let shDegree = await this.splatMesh.fire(GetModelShDegree);
                if (p1)
                    shDegree = this.splatMesh.fire(GetCurrentDisplayShDegree) + p1;
                this.splatMesh.fire(SplatUpdateShDegree, shDegree);
            })();
        }
    }
    /**
     * 设定或者获取最新配置项
     * @param opts 配置项
     * @returns 最新配置项
     */
    options(opts) {
        if (this.disposed)
            return {};
        const fire = (key, ...args) => this.events.fire(key, ...args);
        let splatOpts;
        const scene = fire(GetScene);
        scene.traverse((obj) => !splatOpts && obj instanceof SplatMesh && (splatOpts = obj.options()));
        if (opts) {
            if (opts.autoRotate !== undefined) {
                fire(GetControls).autoRotate = opts.autoRotate;
                fire(GetOptions).autoRotate = opts.autoRotate;
            }
            opts.pointcloudMode !== undefined && fire(SplatSetPointcloudMode, opts.pointcloudMode);
            opts.lightFactor !== undefined && fire(SplatUpdateLightFactor, opts.lightFactor);
            opts.maxRenderCountOfMobile && (fire(GetOptions).maxRenderCountOfMobile = opts.maxRenderCountOfMobile);
            opts.maxRenderCountOfPc && (fire(GetOptions).maxRenderCountOfPc = opts.maxRenderCountOfPc);
            opts.debugMode !== undefined && (fire(GetOptions).debugMode = opts.debugMode);
            opts.markType !== undefined && (fire(GetOptions).markType = opts.markType);
            if (opts.markVisible !== undefined) {
                fire(MarkUpdateVisible, opts.markVisible);
            }
            if (opts.meterScale !== undefined) {
                fire(GetOptions).meterScale = opts.meterScale;
            }
            if (opts.markMode !== undefined) {
                fire(GetOptions).markMode = opts.markMode;
                !opts.markMode && fire(ClearMarkPoint);
                fire(GetControls).autoRotate = fire(GetOptions).autoRotate = false;
            }
        }
        const controls = fire(GetControls);
        controls.updateByOptions(opts);
        fire(Information, { scale: `1 : ${fire(GetOptions).meterScale} m` });
        return Object.assign({ ...fire(GetOptions) }, splatOpts);
    }
    /**
     * 重置
     */
    reset(opts = {}) {
        this.dispose();
        this.disposed = false;
        this.init(initGsViewerOptions(opts));
    }
    /**
     * 光圈过渡切换显示
     * @returns
     */
    switchDeiplayMode() {
        if (this.disposed)
            return;
        this.events.fire(SplatSwitchDisplayMode);
    }
    /**
     * 添加场景
     * @param sceneUrl 场景地址
     */
    async addScene(sceneUrl) {
        if (this.disposed)
            return;
        const fire = (key, ...args) => this.events.fire(key, ...args);
        let meta = {};
        try {
            const res = await fetch(sceneUrl, { mode: 'cors', credentials: 'omit', cache: 'reload' });
            if (res.status === 200) {
                meta = await res.json();
            }
            else {
                return console.error('scene file fetch failed, status:', res.status);
            }
        }
        catch (e) {
            return console.error('scene file fetch failed', e.message);
        }
        if (!meta.url)
            return console.error('missing model file url');
        if (!meta.url.endsWith('.bin') && !meta.url.endsWith('.spx'))
            return console.error('The format is unsupported in the large scene mode', meta.url);
        // 重置
        const opts = { ...meta, ...(meta.cameraInfo || {}) };
        meta.autoCut = Math.min(Math.max(meta.autoCut || 0, 0), 50); // 限制0~50
        opts.bigSceneMode = meta.autoCut > 1; // 切割多块的为大场景
        this.reset({ ...opts });
        !opts.bigSceneMode && delete meta.autoCut; // 小场景或没有配置成切割多块，都不支持切割
        // 按元数据调整更新相机、标注等信息
        this.splatMesh.meta = meta;
        isMobile && (meta.cameraInfo?.position || meta.cameraInfo?.lookAt) && this.events.fire(GetControls)._dollyOut(0.75); // 手机适当缩小
        if (opts.bigSceneMode) {
            fire(OnSetFlyPositions, meta.flyPositions || []);
            fire(OnSetFlyTargets, meta.flyTargets || []);
        }
        else {
            fire(LoadSmallSceneMetaData, meta);
        }
        // 加载模型
        await this.splatMesh.addModel({ url: meta.url }, meta);
        await fire(OnSetWaterMark, meta.watermark);
        fire(GetControls).updateRotateAxis();
    }
    /**
     * 添加要渲染的高斯模型（小场景模式）
     * @param urlOpts 高斯模型链接或元数据文件链接或选项
     */
    async addModel(urlOpts) {
        if (this.disposed)
            return;
        const fire = (key, ...args) => this.events.fire(key, ...args);
        // 参数整理
        let metaUrl = '';
        let modelOpts = { url: '' };
        if (Object.prototype.toString.call(urlOpts) === '[object String]') {
            if (urlOpts.endsWith('.meta.json')) {
                metaUrl = urlOpts;
            }
            else {
                modelOpts.url = urlOpts;
            }
        }
        else {
            modelOpts = urlOpts;
        }
        if (!modelOpts.url && !metaUrl)
            return console.error('model url is empty');
        // 获取元数据
        const opts = fire(GetOptions);
        opts.bigSceneMode = false;
        let meta = {};
        if (!modelOpts.url.startsWith('blob:')) {
            try {
                metaUrl = metaUrl || modelOpts.url.substring(0, modelOpts.url.lastIndexOf('.')) + '.meta.json'; // xxx/abc.spx => xxx/abc.meta.json
                const res = await fetch(metaUrl, { mode: 'cors', credentials: 'omit', cache: 'reload' });
                if (res.status === 200) {
                    meta = await res.json();
                }
                else {
                    console.warn('meta file fetch failed, status:', res.status);
                }
            }
            catch (e) {
                console.warn('meta file fetch failed', e.message, modelOpts.url);
            }
        }
        // 检查整理
        meta.url = meta.url || modelOpts.url;
        delete meta.autoCut; // 小场景没有切割
        if (!modelOpts.format) {
            modelOpts.url = modelOpts.url || meta.url;
            if (modelOpts.url.endsWith('.spx')) {
                modelOpts.format = 'spx';
            }
            else if (modelOpts.url.endsWith('.splat')) {
                modelOpts.format = 'splat';
            }
            else if (modelOpts.url.endsWith('.ply')) {
                modelOpts.format = 'ply';
            }
            else {
                console.error('unknow format!', modelOpts.url);
                return;
            }
        }
        // 按元数据调整更新相机、标注等信息
        fire(LoadSmallSceneMetaData, meta);
        // 加载模型
        await this.splatMesh.addModel(modelOpts, meta);
        await fire(OnSetWaterMark, meta.watermark);
    }
    /**
     * 根据需要暴露的接口
     */
    initGsApi() {
        const fire = (key, ...args) => this.events.fire(key, ...args);
        const switchAutoRotate = () => {
            setTimeout(() => window.focus());
            fire(FlyDisable);
            fire(GetControls).autoRotate = fire(GetOptions).autoRotate = !fire(GetOptions).autoRotate;
        };
        const changePointCloudMode = (pointcloudMode = true) => {
            setTimeout(() => window.focus());
            pointcloudMode = !!pointcloudMode;
            const opts = fire(GetOptions);
            if (opts.pointcloudMode === pointcloudMode)
                return;
            opts.bigSceneMode ? fire(SplatSetPointcloudMode, pointcloudMode) : fire(SplatSwitchDisplayMode);
        };
        const showMark = (visible = true) => {
            setTimeout(() => window.focus());
            fire(MarkUpdateVisible, !!visible);
        };
        const startMark = (markType) => {
            setTimeout(() => window.focus());
            const opts = fire(GetOptions);
            if (opts.markMode)
                return false;
            if (markType === 1) {
                opts.markType = 'point';
            }
            else if (markType === 2) {
                opts.markType = 'lines';
            }
            else if (markType === 3) {
                opts.markType = 'plans';
            }
            else if (markType === 4) {
                opts.markType = 'distance';
            }
            else {
                return false;
            }
            opts.markMode = true;
            fire(StopAutoRotate);
            return true;
        };
        const deleteMark = async (name) => {
            setTimeout(() => window.focus());
            if (!name)
                return false;
            fire(GetMarkFromWeakRef, name)?.dispose();
            fire(ViewerNeedUpdate);
            return await fire(MetaMarkSaveData);
        };
        const updateMark = async (data, saveData = true) => {
            fire(UpdateAllMarkByMeterScale, data, saveData);
            fire(GetMarkFromWeakRef, data?.name)?.drawUpdate?.(data, saveData);
            fire(ViewerNeedUpdate);
            if (saveData) {
                setTimeout(() => window.focus());
                return await fire(MetaMarkSaveData);
            }
            return true;
        };
        const showWaterMark = (visible = true) => {
            setTimeout(() => window.focus());
            fire(SplatUpdateShowWaterMark, !!visible);
        };
        const setWaterMark = (text, save = true) => {
            fire(OnSetWaterMark, text);
            save && fire(MetaSaveWatermark, text);
        };
        window['$api'] = { switchAutoRotate, changePointCloudMode, showMark, startMark, deleteMark, updateMark, showWaterMark, setWaterMark };
    }
    /**
     * 销毁渲染器不再使用
     */
    dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        const fire = (key, ...args) => this.events.fire(key, ...args);
        fire(CommonUtilsDispose);
        fire(ViewerUtilsDispose);
        fire(CSS3DRendererDispose);
        fire(EventListenerDispose);
        fire(GetControls).dispose();
        fire(TraverseDisposeAndClear, fire(GetScene));
        const renderer = fire(GetRenderer);
        renderer.clear();
        renderer.dispose();
        this.splatMesh = null;
        this.events.clear();
        this.events = null;
    }
}
