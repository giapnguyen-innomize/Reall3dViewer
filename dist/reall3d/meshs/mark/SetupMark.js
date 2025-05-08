// ================================
// Copyright (c) 2025 reall3d.com
// ================================
import { MarkCirclePlan } from './MarkCirclePlan';
import { AddMarkToWeakRef, ClearMarkPoint, ComputePlansArea, ComputePlansCenter, ComputePoint3Area, CSS3DRendererDispose, GetCamera, GetCSS3DRenderer, GetMarkWarpElement, GetOptions, GetScene, MarkFinish, LoadSmallSceneMetaData, MetaMarkRemoveData, MetaMarkSaveData, MarkUpdateVisible, OnViewerUpdate, HttpPostMetaData, ViewerNeedUpdate, DeleteMarkWeakRef, GetMarkFromWeakRef, GetMarkDataByName, UpdateMarkByName, MetaSaveSmallSceneCameraInfo, GetCameraInfo, UpdateAllMarkByMeterScale, ReComputePlansArea, Information, GetCachedWaterMark, MetaSaveWatermark, OnSetFlyPositions, OnSetFlyTargets, GetSplatMesh, GetControls, } from './../../events/EventConstants';
import { MarkMultiLines } from './MarkMultiLines';
import { CSS3DRenderer } from 'three/examples/jsm/Addons.js';
import { Vector3 } from 'three';
import { MarkDistanceLine } from './MarkDistanceLine';
import { MarkSinglePoint } from './MarkSinglePoint';
import { MarkMultiPlans } from './MarkMulitPlans';
export function setupMark(events) {
    const on = (key, fn, multiFn) => events.on(key, fn, multiFn);
    const fire = (key, ...args) => events.fire(key, ...args);
    const markMap = new Map();
    const divMarkWarp = document.createElement('div');
    divMarkWarp.classList.add('mark-warp');
    document.body.appendChild(divMarkWarp);
    const css3DRenderer = new CSS3DRenderer();
    css3DRenderer.setSize(innerWidth, innerHeight);
    css3DRenderer.domElement.style.position = 'absolute';
    css3DRenderer.domElement.style.top = '0px';
    css3DRenderer.domElement.style.pointerEvents = 'none';
    divMarkWarp.appendChild(css3DRenderer.domElement);
    on(GetMarkWarpElement, () => divMarkWarp);
    on(GetCSS3DRenderer, () => css3DRenderer);
    on(CSS3DRendererDispose, () => document.body.removeChild(divMarkWarp));
    on(OnViewerUpdate, () => css3DRenderer.render(fire(GetScene), fire(GetCamera)), true);
    on(AddMarkToWeakRef, (mark) => {
        const name = mark?.getMarkData?.()?.name || mark?.name;
        if (!name)
            return;
        markMap.set(name, new WeakRef(mark));
    });
    on(DeleteMarkWeakRef, (mark) => {
        const name = mark?.getMarkData?.()?.name || mark?.name;
        markMap.delete(name);
    });
    on(GetMarkFromWeakRef, (name) => markMap.get(name)?.deref());
    on(UpdateMarkByName, (name, data) => {
        const mark = fire(GetMarkFromWeakRef, name);
        if (!mark || !data)
            return;
        mark.drawUpdate?.(data);
    });
    on(GetMarkDataByName, (name) => {
        const mark = fire(GetMarkFromWeakRef, name);
        if (!mark)
            return {};
        return mark.getMarkData?.();
    });
    on(MarkUpdateVisible, (visible) => {
        if (visible !== undefined)
            fire(GetOptions).markVisible = visible;
        fire(GetScene).traverse((child) => child['isMark'] && (child.visible = fire(GetOptions).markVisible));
        fire(ViewerNeedUpdate);
    });
    on(MetaSaveSmallSceneCameraInfo, async () => {
        const marks = [];
        fire(GetScene).traverse((child) => {
            if (child.isMark) {
                const data = child.getMarkData?.();
                data && marks.push(data);
            }
        });
        const meta = fire(GetSplatMesh).meta || {};
        if (marks.length) {
            meta.marks = marks;
        }
        else {
            delete meta.marks;
        }
        meta.cameraInfo = fire(GetCameraInfo);
        return await fire(HttpPostMetaData, meta);
    });
    on(MetaMarkSaveData, async () => {
        const marks = [];
        fire(GetScene).traverse((child) => {
            if (child.isMark) {
                const data = child.getMarkData?.();
                data && marks.push(data);
            }
        });
        const meta = fire(GetSplatMesh).meta || {};
        if (marks.length) {
            meta.marks = marks;
        }
        else {
            delete meta.marks;
        }
        return await fire(HttpPostMetaData, meta);
    });
    on(MetaMarkRemoveData, async () => {
        const meta = fire(GetSplatMesh).meta || {};
        delete meta.marks;
        const rs = await fire(HttpPostMetaData, meta);
        const marks = [];
        markMap.forEach(item => marks.push(item));
        marks.forEach(item => item.deref()?.dispose?.());
        fire(ViewerNeedUpdate);
        return rs;
    });
    on(MetaSaveWatermark, async () => {
        const marks = [];
        fire(GetScene).traverse((child) => {
            if (child.isMark) {
                const data = child.getMarkData?.();
                data && marks.push(data);
            }
        });
        const meta = fire(GetSplatMesh).meta || {};
        meta.watermark = fire(GetCachedWaterMark) || '';
        return await fire(HttpPostMetaData, meta);
    });
    on(LoadSmallSceneMetaData, (metaData) => {
        if (metaData.meterScale) {
            fire(GetOptions).meterScale = metaData.meterScale;
            fire(Information, { scale: `1 : ${fire(GetOptions).meterScale} m` });
        }
        fire(GetControls).updateByOptions({ ...metaData, ...(metaData.cameraInfo || {}) });
        const marks = metaData.marks || [];
        // 初始化标注，隐藏待激活显示
        marks.forEach((data) => {
            if (data.type === 'MarkSinglePoint') {
                // 单点
                const mark = new MarkSinglePoint(events, data);
                mark.visible = false;
                fire(GetScene).add(mark);
            }
            else if (data.type === 'MarkDistanceLine') {
                // 测量距离
                const mark = new MarkDistanceLine(events);
                mark.draw(data);
                mark.visible = false;
                fire(GetScene).add(mark);
            }
            else if (data.type === 'MarkMultiLines') {
                // 折线
                const mark = new MarkMultiLines(events);
                mark.draw(data, true);
                mark.visible = false;
                fire(GetScene).add(mark);
            }
            else if (data.type === 'MarkMultiPlans') {
                // 多面
                const mark = new MarkMultiPlans(events);
                mark.draw(data, true);
                mark.visible = false;
                fire(GetScene).add(mark);
            }
            else if (data.type === 'MarkCirclePlan') {
                // 圆面
                const mark = new MarkCirclePlan(events);
                mark.draw(data);
                mark.visible = false;
                fire(GetScene).add(mark);
            }
        });
        fire(OnSetFlyPositions, metaData.flyPositions || []);
        fire(OnSetFlyTargets, metaData.flyTargets || []);
    });
    on(MarkFinish, () => {
        const opts = fire(GetOptions);
        opts.markMode = false;
        fire(ClearMarkPoint);
        fire(ViewerNeedUpdate);
    });
    on(UpdateAllMarkByMeterScale, (markData, saveData = true) => {
        const meterScale = markData?.meterScale;
        if (!meterScale)
            return;
        if (typeof meterScale !== 'number' || meterScale <= 0) {
            console.warn('meterScale is not a number or <= 0', markData);
            return;
        }
        saveData && (fire(GetOptions).meterScale = markData.meterScale);
        fire(Information, { scale: `1 : ${meterScale} m` });
        for (const value of markMap.values()) {
            const mark = value.deref();
            if (!mark)
                continue;
            if (mark instanceof MarkDistanceLine) {
                mark.updateByMeterScale(meterScale);
            }
            else if (mark instanceof MarkMultiLines) {
                mark.updateByMeterScale(meterScale);
            }
            else if (mark instanceof MarkMultiPlans) {
                mark.updateByMeterScale(meterScale);
            }
        }
    });
    on(ComputePlansCenter, (positions) => {
        const p0 = new Vector3().fromArray(positions.slice(0, 3));
        const p1 = new Vector3().fromArray(positions.slice(-6, -3));
        const p2 = new Vector3().fromArray(positions.slice(-3));
        const eq02 = p0.distanceTo(p2) < 0.0001;
        const eq12 = p1.distanceTo(p2) < 0.0001;
        const center = new Vector3();
        const cnt = eq02 || eq12 ? positions.length / 3 - 1 : positions.length / 3;
        for (let i = 0; i < cnt; i++) {
            center.add(new Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]));
        }
        center.divideScalar(cnt);
        return center;
    });
    on(ComputePlansArea, (positions) => {
        const points = [];
        for (let i = 0, cnt = positions.length / 3; i < cnt; i++) {
            points.push(new Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]));
        }
        const eq1 = points[0].distanceTo(points[points.length - 1]) < 0.0001;
        const eq2 = points[points.length - 2].distanceTo(points[points.length - 1]) < 0.0001;
        (eq1 || eq2) && points.pop();
        if (points.length < 3)
            return 0;
        let total = 0;
        for (let i = 0, cnt = points.length - 2; i < cnt; i++) {
            total += fire(ComputePoint3Area, points[0], points[i + 1], points[i + 2], fire(GetOptions).meterScale);
        }
        return total;
    });
    on(ReComputePlansArea, (points, meterScale) => {
        let total = 0;
        for (let i = 0, cnt = points.length - 2; i < cnt; i++) {
            total += fire(ComputePoint3Area, points[0], points[i + 1], points[i + 2], meterScale);
        }
        return total;
    });
    on(ComputePoint3Area, (p1, p2, p3, meterScale) => {
        const a = p1.distanceTo(p2) * meterScale;
        const b = p2.distanceTo(p3) * meterScale;
        const c = p3.distanceTo(p1) * meterScale;
        const s = (a + b + c) / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    });
}
