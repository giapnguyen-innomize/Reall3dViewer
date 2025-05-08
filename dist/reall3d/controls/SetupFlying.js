import { AddFlyPosition, ClearFlyPosition, FlySavePositions, GetControls, GetFlyPositionArray, GetFlyPositions, GetFlyTargetArray, GetSplatMesh, HttpPostMetaData, OnSetFlyPositions, OnSetFlyTargets, OnViewerAfterUpdate, StopAutoRotate, Flying, FlyDisable, FlyEnable, FlyOnce, } from '../events/EventConstants';
import { CatmullRomCurve3, Vector3 } from 'three';
export function setupFlying(events) {
    const fire = (key, ...args) => events.fire(key, ...args);
    const on = (key, fn, multiFn) => events.on(key, fn, multiFn);
    const flyPositions = [];
    const flyTargets = [];
    let flyEnable = false;
    let flyOnceDone = false;
    on(FlyDisable, () => (flyEnable = false));
    on(FlyEnable, () => (flyEnable = true));
    on(GetFlyPositions, () => flyPositions);
    on(GetFlyPositionArray, () => {
        const rs = [];
        for (let i = 0, max = flyPositions.length; i < max; i++) {
            rs.push(...flyPositions[i].toArray());
        }
        return rs;
    });
    on(GetFlyTargetArray, () => {
        const rs = [];
        for (let i = 0, max = flyTargets.length; i < max; i++) {
            rs.push(...flyTargets[i].toArray());
        }
        return rs;
    });
    on(OnSetFlyPositions, (v3s) => {
        for (let i = 0, max = (v3s.length / 3) | 0; i < max; i++) {
            flyPositions[i] = new Vector3(v3s[i * 3 + 0], v3s[i * 3 + 1], v3s[i * 3 + 2]);
        }
    });
    on(OnSetFlyTargets, (v3s) => {
        for (let i = 0, max = (v3s.length / 3) | 0; i < max; i++) {
            flyTargets[i] = new Vector3(v3s[i * 3 + 0], v3s[i * 3 + 1], v3s[i * 3 + 2]);
        }
    });
    on(AddFlyPosition, () => {
        const controls = fire(GetControls);
        flyPositions.push(controls.object.position.clone());
        flyTargets.push(controls.target.clone());
    });
    on(ClearFlyPosition, () => {
        flyPositions.length = 0;
        flyTargets.length = 0;
    });
    on(FlySavePositions, async () => {
        const meta = fire(GetSplatMesh).meta || {};
        if (flyPositions.length) {
            const positions = [];
            const targets = [];
            for (let i = 0, max = flyPositions.length; i < max; i++) {
                positions.push(...flyPositions[i].toArray());
                targets.push(...flyTargets[i].toArray());
            }
            meta.flyPositions = positions;
            meta.flyTargets = targets;
        }
        else {
            delete meta.flyPositions;
            delete meta.flyTargets;
        }
        return await fire(HttpPostMetaData, meta);
    });
    on(FlyOnce, () => {
        if (flyOnceDone)
            return;
        (flyOnceDone = true) && fire(Flying);
    });
    let t = 0; // 插值因子
    const flyTotalTime = 120 * 1000;
    let flyStartTime = 0;
    let curvePos;
    let curveTgt;
    on(Flying, (force) => {
        t = 0;
        flyStartTime = Date.now();
        curvePos = null;
        curveTgt = null;
        if (!flyPositions.length)
            return;
        if (!force && !fire(GetControls).autoRotate)
            return; // 避免在非自动旋转模式下执行
        const controls = fire(GetControls);
        const points = [controls.object.position.clone()];
        const tgts = [controls.target.clone()];
        // const points: Vector3[] = [];
        // const tgts: Vector3[] = [];
        const all = fire(GetFlyPositions) || [];
        for (let i = 0, max = Math.min(all.length, 100); i < max; i++) {
            all[i] && points.push(all[i]);
            flyTargets[i] && tgts.push(flyTargets[i]);
        }
        curvePos = new CatmullRomCurve3(points);
        curvePos.closed = true;
        curveTgt = new CatmullRomCurve3(tgts);
        curveTgt.closed = true;
        fire(FlyEnable);
        fire(StopAutoRotate, false);
    });
    on(OnViewerAfterUpdate, () => {
        if (Date.now() - flyStartTime > flyTotalTime)
            fire(FlyDisable);
        if (!flyEnable || !curvePos || !curveTgt)
            return;
        const controls = fire(GetControls);
        t = (Date.now() - flyStartTime) / flyTotalTime;
        const pt = curvePos.getPoint(t);
        const tgt = curveTgt.getPoint(t);
        controls.object.position.set(pt.x, pt.y, pt.z);
        controls.target.set(tgt.x, tgt.y, tgt.z);
    }, true);
}
