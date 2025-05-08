// ================================
// Copyright (c) 2025 reall3d.com
// ================================
import { BufferAttribute, DataTexture, DoubleSide, DynamicDrawUsage, InstancedBufferAttribute, InstancedBufferGeometry, Mesh, NormalBlending, RGBAIntegerFormat, ShaderMaterial, UnsignedIntType, Vector2, Vector4, } from 'three';
import { GetCamera, GetCurrentDisplayShDegree, GetModelShDegree, GetShTexheight, SplatUpdateSh12Texture, SplatUpdateSh3Texture, SplatUpdateShDegree, UploadSplatTexture, NotifyViewerNeedUpdate, SplatUpdateViewport, GetSplatMaterial, CreateSplatGeometry, CreateSplatMaterial, CreateSplatUniforms, SplatUpdateFocal, SplatUpdateSplatIndex, GetWorker, GetCanvasSize, Information, GetSplatGeometry, CreateSplatMesh, GetOptions, SplatMeshDispose, SplatGeometryDispose, SplatMaterialDispose, GetMaxRenderCount, SplatUpdateTexture, SplatUpdateUsingIndex, SplatUpdatePointMode, SplatUpdateBigSceneMode, SplatUpdateLightFactor, SplatUpdateTopY, SplatUpdateCurrentVisibleRadius, SplatUpdateCurrentLightRadius, IsBigSceneMode, SplatMeshSwitchDisplayMode, RunLoopByFrame, IsPointcloudMode, SplatMeshCycleZoom, IsSmallSceneRenderDataReady, OnTextureReadySplatCount, SplatUpdateMarkPoint, MarkUpdateVisible, SplatUpdatePerformanceNow, SplatUpdateShowWaterMark, FlyOnce, SplatUpdateDebugEffect, } from '../../events/EventConstants';
import { getSplatFragmentShader, getSplatVertexShader, VarBigSceneMode, VarCurrentLightRadius, VarCurrentVisibleRadius, VarDebugEffect, VarFocal, VarLightFactor, VarMarkPoint, VarPerformanceNow, VarPointMode, VarShDegree, VarShowWaterMark, VarSplatIndex, VarSplatShTexture12, VarSplatShTexture3, VarSplatTexture0, VarSplatTexture1, VarTopY, VarUsingIndex, VarViewport, VarWaterMarkColor, } from '../../internal/Index';
import { WkIndex, WkRenderSplatCount, WkSortTime, WkSplatIndex, WkTextureReady, WkVersion, WkSortStartTime, WkXyz, WkMinX, WkMaxX, WkMinY, WkMaxY, WkMinZ, WkMaxZ, WkVisibleSplatCount, WkModelSplatCount, WkWatermarkCount, } from '../../utils/consts/Index';
export function setupSplatMesh(events) {
    let disposed = false;
    const on = (key, fn, multiFn) => events.on(key, fn, multiFn);
    const fire = (key, ...args) => events.fire(key, ...args);
    let maxRadius = 0;
    let currentMaxRadius = 0;
    const arySwitchProcess = [];
    let currentDisplayShDegree = 0;
    on(GetCurrentDisplayShDegree, () => currentDisplayShDegree);
    on(CreateSplatGeometry, async () => {
        const baseGeometry = new InstancedBufferGeometry();
        baseGeometry.setIndex([0, 1, 2, 0, 2, 3]);
        const positionsArray = new Float32Array(4 * 3);
        const positions = new BufferAttribute(positionsArray, 3);
        baseGeometry.setAttribute('position', positions);
        positions.setXYZ(0, -2.0, -2.0, 0.0);
        positions.setXYZ(1, -2.0, 2.0, 0.0);
        positions.setXYZ(2, 2.0, 2.0, 0.0);
        positions.setXYZ(3, 2.0, -2.0, 0.0);
        positions.needsUpdate = true;
        let geometry = new InstancedBufferGeometry().copy(baseGeometry);
        const MaxSplatCount = await fire(GetMaxRenderCount);
        if (disposed)
            return;
        const indexArray = new Uint32Array(MaxSplatCount);
        const indexAttribute = new InstancedBufferAttribute(indexArray, 1, false);
        indexAttribute.setUsage(DynamicDrawUsage);
        indexAttribute.needsUpdate = true;
        geometry.setAttribute(VarSplatIndex, indexAttribute);
        geometry.instanceCount = 0;
        on(SplatUpdateSplatIndex, (datas, index, sortTime, sortStartTime) => {
            fire(SplatUpdateUsingIndex, index);
            indexArray.set(datas, 0);
            indexAttribute.clearUpdateRanges();
            indexAttribute.addUpdateRange(0, datas.length);
            indexAttribute.needsUpdate = true;
            geometry.instanceCount = datas.length;
            fire(NotifyViewerNeedUpdate);
            fire(Information, { sortTime: `${sortTime} / ${Date.now() - sortStartTime}` });
        });
        on(GetSplatGeometry, () => geometry);
        on(SplatGeometryDispose, () => {
            indexAttribute.array = null;
            geometry.dispose();
        });
        return geometry;
    });
    on(CreateSplatMaterial, async () => {
        const MaxSplatCount = await fire(GetMaxRenderCount);
        if (disposed)
            return;
        const texwidth = 1024 * 2;
        const texheight = Math.ceil((2 * MaxSplatCount) / texwidth);
        const material = new ShaderMaterial({
            uniforms: fire(CreateSplatUniforms),
            vertexShader: getSplatVertexShader(),
            fragmentShader: getSplatFragmentShader(),
            transparent: true,
            alphaTest: 1.0,
            blending: NormalBlending,
            depthTest: true, // 是否启用深度测试。深度测试用于确保只有离相机更近的物体才会被渲染
            depthWrite: false, // 是否将深度值写入深度缓冲区
            side: DoubleSide,
        });
        const dataArray0 = new Uint32Array(texwidth * texheight * 4);
        let dataTexture0 = new DataTexture(dataArray0, texwidth, texheight, RGBAIntegerFormat, UnsignedIntType);
        dataTexture0.internalFormat = 'RGBA32UI';
        dataTexture0.needsUpdate = true;
        material.uniforms[VarSplatTexture0].value = dataTexture0;
        const texheight1 = fire(IsBigSceneMode) ? texheight : 1;
        const dataArray1 = new Uint32Array(texwidth * texheight1 * 4);
        let dataTexture1 = new DataTexture(dataArray1, texwidth, texheight1, RGBAIntegerFormat, UnsignedIntType);
        dataTexture1.internalFormat = 'RGBA32UI';
        dataTexture1.needsUpdate = true;
        material.uniforms[VarSplatTexture1].value = dataTexture1;
        const shTexheight12 = await fire(GetShTexheight, 1);
        const dataArraySh12 = new Uint32Array(texwidth * shTexheight12 * 4);
        let dataTextureSh12 = new DataTexture(dataArraySh12, texwidth, shTexheight12, RGBAIntegerFormat, UnsignedIntType);
        dataTextureSh12.internalFormat = 'RGBA32UI';
        dataTextureSh12.needsUpdate = true;
        material.uniforms[VarSplatShTexture12].value = dataTextureSh12;
        const shTexheight3 = await fire(GetShTexheight, 3);
        const dataArraySh3 = new Uint32Array(texwidth * shTexheight3 * 4);
        let dataTextureSh3 = new DataTexture(dataArraySh3, texwidth, shTexheight3, RGBAIntegerFormat, UnsignedIntType);
        dataTextureSh3.internalFormat = 'RGBA32UI';
        dataTextureSh3.needsUpdate = true;
        material.uniforms[VarSplatShTexture3].value = dataTextureSh3;
        material.needsUpdate = true;
        let isLastEmpty = false;
        on(SplatUpdateTexture, (texture) => {
            if (!fire(IsBigSceneMode)) {
                if (isLastEmpty && !texture.renderSplatCount)
                    return; // 小场景，不要重复提交空数据
                isLastEmpty = !texture.renderSplatCount;
            }
            const dataArray = texture.txdata;
            texture.txdata = null;
            const dataTexture = new DataTexture(dataArray, texwidth, texheight, RGBAIntegerFormat, UnsignedIntType);
            dataTexture.onUpdate = () => {
                texture.textureReady = true;
                texture.textureReadyTime = Date.now();
                notifyWorkerTextureReady(texture);
                fire(OnTextureReadySplatCount, texture.renderSplatCount); // 用于判断小场景是否可以开始光圈过渡
            };
            dataTexture.internalFormat = 'RGBA32UI';
            dataTexture.needsUpdate = true;
            if (texture.index) {
                material.uniforms[VarSplatTexture1].value = dataTexture;
                dataTexture1 = dataTexture;
            }
            else {
                material.uniforms[VarSplatTexture0].value = dataTexture;
                dataTexture0 = dataTexture;
            }
            material.needsUpdate = true;
            fire(NotifyViewerNeedUpdate);
        });
        on(SplatUpdateSh12Texture, async (datas) => {
            if (fire(IsBigSceneMode) || !datas || !datas.length)
                return;
            const dataArray = new Uint32Array(texwidth * (await fire(GetShTexheight, 1)) * 4);
            const ui8s = new Uint8Array(dataArray.buffer);
            for (let i = 0, offset = 0; i < datas.length; i++) {
                ui8s.set(datas[i], offset);
                offset += datas[i].byteLength;
            }
            const dataTexture = new DataTexture(dataArray, texwidth, shTexheight12, RGBAIntegerFormat, UnsignedIntType);
            dataTexture.internalFormat = 'RGBA32UI';
            dataTexture.needsUpdate = true;
            material.uniforms[VarSplatShTexture12].value = dataTexture;
            material.needsUpdate = true;
            fire(NotifyViewerNeedUpdate);
        });
        on(SplatUpdateSh3Texture, async (datas) => {
            if (fire(IsBigSceneMode) || !datas || !datas.length)
                return;
            const dataArray = new Uint32Array(texwidth * (await fire(GetShTexheight, 3)) * 4);
            const ui8s = new Uint8Array(dataArray.buffer);
            for (let i = 0, offset = 0; i < datas.length; i++) {
                ui8s.set(datas[i], offset);
                offset += datas[i].byteLength;
            }
            const dataTexture = new DataTexture(dataArray, texwidth, shTexheight12, RGBAIntegerFormat, UnsignedIntType);
            dataTexture.internalFormat = 'RGBA32UI';
            dataTexture.needsUpdate = true;
            material.uniforms[VarSplatShTexture3].value = dataTexture;
            material.needsUpdate = true;
            fire(NotifyViewerNeedUpdate);
        });
        on(GetSplatMaterial, () => material);
        on(SplatUpdateFocal, () => {
            const camera = fire(GetCamera);
            const { width, height } = fire(GetCanvasSize);
            const fx = Math.abs(camera.projectionMatrix.elements[0]) * 0.5 * width;
            const fy = Math.abs(camera.projectionMatrix.elements[5]) * 0.5 * height;
            const material = fire(GetSplatMaterial);
            material.uniforms[VarFocal].value.set(fx, fy);
            material.uniformsNeedUpdate = true;
            fire(NotifyViewerNeedUpdate);
        });
        on(SplatUpdateViewport, () => {
            const { width, height } = fire(GetCanvasSize);
            material.uniforms[VarViewport].value.set(width, height);
            material.uniformsNeedUpdate = true;
            fire(NotifyViewerNeedUpdate);
        });
        on(SplatUpdateUsingIndex, (index) => {
            material.uniforms[VarUsingIndex].value = index;
            material.uniformsNeedUpdate = true;
            fire(NotifyViewerNeedUpdate);
        });
        on(SplatUpdatePointMode, (isPointcloudMode) => {
            const opts = fire(GetOptions);
            isPointcloudMode === undefined && (isPointcloudMode = !opts.pointcloudMode);
            material.uniforms[VarPointMode].value = isPointcloudMode ? 1 : 0;
            material.uniformsNeedUpdate = true;
            opts.pointcloudMode = isPointcloudMode;
            fire(NotifyViewerNeedUpdate);
            opts.viewerEvents && (opts.viewerEvents.fire(GetOptions).pointcloudMode = isPointcloudMode);
        });
        on(SplatUpdateBigSceneMode, (isbigSceneMode) => {
            material.uniforms[VarBigSceneMode].value = isbigSceneMode ? 1 : 0;
            material.uniformsNeedUpdate = true;
            const opts = fire(GetOptions);
            opts.bigSceneMode = isbigSceneMode;
            fire(NotifyViewerNeedUpdate);
        });
        on(SplatUpdateLightFactor, (value) => {
            material.uniforms[VarLightFactor].value = value;
            material.uniformsNeedUpdate = true;
            const opts = fire(GetOptions);
            opts.lightFactor = value;
            fire(NotifyViewerNeedUpdate);
        });
        let initTopY = false;
        on(SplatUpdateTopY, (value) => {
            if (fire(IsBigSceneMode) || initTopY)
                return;
            initTopY = true;
            material.uniforms[VarTopY].value = value;
            material.uniformsNeedUpdate = true;
            fire(NotifyViewerNeedUpdate);
        });
        on(SplatUpdateCurrentVisibleRadius, (value) => {
            material.uniforms[VarCurrentVisibleRadius].value = value;
            material.uniformsNeedUpdate = true;
            fire(NotifyViewerNeedUpdate);
        });
        on(SplatUpdateCurrentLightRadius, (value) => {
            material.uniforms[VarCurrentLightRadius].value = value;
            material.uniformsNeedUpdate = true;
            fire(NotifyViewerNeedUpdate);
        });
        on(SplatUpdateMarkPoint, (x, y, z, isMark) => {
            material.uniforms[VarMarkPoint].value = [x, y, z, isMark ? 1 : -1];
            material.uniformsNeedUpdate = true;
            fire(NotifyViewerNeedUpdate);
        });
        on(SplatUpdateShowWaterMark, (show = true) => {
            material.uniforms[VarShowWaterMark].value = !!show ? 1 : 0;
            material.uniformsNeedUpdate = true;
            fire(NotifyViewerNeedUpdate);
        });
        on(SplatUpdatePerformanceNow, (value) => {
            material.uniforms[VarPerformanceNow].value = value;
            material.uniformsNeedUpdate = true;
        });
        on(SplatUpdateDebugEffect, (value) => {
            material.uniforms[VarDebugEffect].value = value;
            material.uniformsNeedUpdate = true;
        });
        on(SplatUpdateShDegree, async (value) => {
            if (fire(IsBigSceneMode))
                return;
            const modelShDegree = await fire(GetModelShDegree);
            if (value < 0)
                value = 0;
            if (value > modelShDegree)
                value = modelShDegree;
            currentDisplayShDegree = value;
            material.uniforms[VarShDegree].value = value;
            material.uniformsNeedUpdate = true;
            fire(Information, { shDegree: `${value} / max ${modelShDegree}` });
            fire(NotifyViewerNeedUpdate);
        });
        on(SplatMaterialDispose, () => {
            material.dispose();
            dataTexture0 && dataTexture0.dispose();
            dataTexture1 && dataTexture1.dispose();
            dataTextureSh12 && dataTextureSh12.dispose();
            dataTextureSh3 && dataTextureSh3.dispose();
        });
        return material;
    });
    on(CreateSplatMesh, async () => {
        const mesh = new Mesh(await fire(CreateSplatGeometry), await fire(CreateSplatMaterial));
        fire(SplatUpdateFocal);
        fire(SplatUpdateViewport);
        fire(SplatUpdateBigSceneMode, fire(IsBigSceneMode));
        fire(SplatUpdatePointMode, fire(IsPointcloudMode));
        return mesh;
    });
    function resize() {
        fire(SplatUpdateFocal);
        fire(SplatUpdateViewport);
    }
    window.addEventListener('resize', resize);
    on(SplatMeshDispose, () => {
        disposed = true;
        window.removeEventListener('resize', resize);
        fire(SplatGeometryDispose);
        fire(SplatMaterialDispose);
    });
    // 小场景圆圈扩大渐进渲染
    on(SplatMeshCycleZoom, async () => {
        if (fire(IsBigSceneMode))
            return; // 大场景模式不支持
        let stepRate = 0.01;
        let currentVisibleRadius = 0.01;
        let stop = false;
        let startTime = 0;
        fire(SplatUpdateCurrentVisibleRadius, currentVisibleRadius);
        fire(RunLoopByFrame, () => {
            if (disposed || currentMaxRadius <= currentVisibleRadius)
                return;
            currentVisibleRadius += (currentMaxRadius - currentVisibleRadius) * stepRate;
            fire(SplatUpdateCurrentVisibleRadius, currentVisibleRadius);
            let isDataAllReay = fire(IsSmallSceneRenderDataReady);
            isDataAllReay && !startTime && (startTime = Date.now());
            let visibleRate = currentVisibleRadius / maxRadius;
            if (isDataAllReay && (visibleRate > 0.9 || Date.now() - startTime > 2500)) {
                fire(IsPointcloudMode) && fire(SplatMeshSwitchDisplayMode, true);
                fire(SplatUpdateCurrentVisibleRadius, 0);
                stop = true;
            }
            else if (isDataAllReay && visibleRate > 0.7) {
                stepRate = Math.min(stepRate * 1.2, 0.3);
            }
            else if (isDataAllReay && visibleRate > 0.5) {
                stepRate = Math.min(stepRate * 1.2, 0.2);
            }
            else if (visibleRate > 0.4) {
                stepRate = Math.min(stepRate * 1.05, 0.1);
            }
        }, () => !disposed && !stop, 3);
    });
    // 切换渲染模式（0:正常模式，1:点云模式），相互排挤，最后调用的优先响应
    on(SplatMeshSwitchDisplayMode, (showMark = false) => {
        if (fire(IsBigSceneMode))
            return; // 大场景模式下不响应光圈过渡效果
        while (arySwitchProcess.length)
            arySwitchProcess.pop().stop = true; // 已有的都停掉
        const opts = fire(GetOptions);
        const currentLightRadius = maxRadius * 0.001;
        let switchProcess = { currentPointMode: opts.pointcloudMode, stepRate: 0.0015, currentLightRadius, stop: false };
        arySwitchProcess.push(switchProcess);
        fire(RunLoopByFrame, () => {
            if (disposed)
                return;
            switchProcess.currentLightRadius += maxRadius * switchProcess.stepRate; // 动态增量
            fire(SplatUpdateCurrentLightRadius, switchProcess.currentLightRadius);
            if (switchProcess.currentLightRadius > maxRadius) {
                fire(SplatUpdatePointMode, !switchProcess.currentPointMode); // 根据开始时的点云显示模式进行切换
                fire(SplatUpdateCurrentLightRadius, 0); // 光圈停止
                switchProcess.stop = true; // 主动完成
                arySwitchProcess.length === 1 && arySwitchProcess[0] === switchProcess && arySwitchProcess.pop();
                showMark && fire(GetOptions).viewerEvents?.fire(MarkUpdateVisible);
                fire(GetOptions).viewerEvents?.fire(FlyOnce);
            }
            else if (switchProcess.currentLightRadius / maxRadius < 0.4) {
                switchProcess.stepRate = Math.min(switchProcess.stepRate * 1.02, 0.03); // 前半圈提速并限速
            }
            else {
                switchProcess.stepRate *= 1.04; // 后半圈加速
            }
        }, () => !disposed && !switchProcess.stop);
    });
    on(CreateSplatUniforms, () => {
        return {
            [VarSplatTexture0]: { type: 't', value: null },
            [VarSplatTexture1]: { type: 't', value: null },
            [VarSplatShTexture12]: { type: 't', value: null },
            [VarSplatShTexture3]: { type: 't', value: null },
            [VarFocal]: { type: 'v2', value: new Vector2() },
            [VarViewport]: { type: 'v2', value: new Vector2() },
            [VarUsingIndex]: { type: 'int', value: 0 },
            [VarPointMode]: { type: 'int', value: 0 },
            [VarDebugEffect]: { type: 'int', value: 1 },
            [VarBigSceneMode]: { type: 'int', value: 0 },
            [VarShDegree]: { type: 'int', value: 0 },
            [VarLightFactor]: { type: 'float', value: 1 },
            [VarTopY]: { type: 'float', value: 0 },
            [VarCurrentVisibleRadius]: { type: 'float', value: 0 },
            [VarCurrentLightRadius]: { type: 'float', value: 0 },
            [VarMarkPoint]: { type: 'v4', value: new Vector4(0, 0, 0, -1) },
            [VarPerformanceNow]: { type: 'float', value: performance.now() },
            [VarWaterMarkColor]: { type: 'v4', value: new Vector4(1, 1, 0, 0.5) },
            [VarShowWaterMark]: { type: 'int', value: 1 },
        };
    });
    const worker = fire(GetWorker);
    worker.onmessage = e => {
        const data = e.data;
        if (data[WkSplatIndex]) {
            fire(SplatUpdateSplatIndex, data[WkSplatIndex], data[WkIndex], data[WkSortTime], data[WkSortStartTime], data[WkRenderSplatCount]);
        }
    };
    on(UploadSplatTexture, (texture, dataCurrentRadius, dataMaxRadius) => {
        if (!fire(IsBigSceneMode)) {
            currentMaxRadius = dataCurrentRadius;
            maxRadius = dataMaxRadius;
        }
        fire(SplatUpdateTexture, texture);
    });
    function notifyWorkerTextureReady(texture) {
        const xyz = texture.xyz.slice(0);
        worker.postMessage({
            [WkTextureReady]: true,
            [WkXyz]: xyz,
            [WkWatermarkCount]: texture.watermarkCount,
            [WkIndex]: texture.index,
            [WkVersion]: texture.version,
            [WkRenderSplatCount]: texture.renderSplatCount,
            [WkVisibleSplatCount]: texture.visibleSplatCount,
            [WkModelSplatCount]: texture.modelSplatCount,
            [WkMinX]: texture.minX,
            [WkMaxX]: texture.maxX,
            [WkMinY]: texture.minY,
            [WkMaxY]: texture.maxY,
            [WkMinZ]: texture.minZ,
            [WkMaxZ]: texture.maxZ,
        }, [xyz.buffer]);
    }
}
