// ================================
// Copyright (c) 2025 reall3d.com
// ================================
import { GetCameraInfo, GetCameraLookAt, GetCameraLookUp, GetCameraPosition, GetCameraFov, GetControls, ControlsUpdate, ControlsUpdateRotateAxis, IsCameraChangedNeedUpdate, CameraSetLookAt, FocusMarkerMeshUpdate, RunLoopByFrame, ControlPlaneUpdate, } from '../events/EventConstants';
import { Vector3 } from 'three';
import { GetCamera } from '../events/EventConstants';
export function setupCameraControls(events) {
    const on = (key, fn, multiFn) => events.on(key, fn, multiFn);
    const fire = (key, ...args) => events.fire(key, ...args);
    on(GetCameraFov, () => fire(GetCamera).fov);
    on(GetCameraPosition, (copy = false) => (copy ? fire(GetCamera).position.clone() : fire(GetCamera).position));
    on(GetCameraLookAt, (copy = false) => (copy ? fire(GetControls).target.clone() : fire(GetControls).target));
    on(GetCameraLookUp, (copy = false) => (copy ? fire(GetCamera).up.clone() : fire(GetCamera).up));
    on(CameraSetLookAt, (target, animate = false) => {
        fire(FocusMarkerMeshUpdate, target);
        if (!animate) {
            fire(GetControls).target.copy(target);
            fire(ControlPlaneUpdate);
            return;
        }
        const start = fire(GetControls).target.clone();
        let alpha = 0;
        fire(RunLoopByFrame, () => {
            alpha += 0.03;
            fire(GetControls).target.copy(start.clone().lerp(target, alpha));
            fire(ControlPlaneUpdate);
        }, () => alpha < 1);
    });
    on(GetCameraInfo, () => {
        let position = fire(GetCameraPosition).toArray();
        let lookUp = fire(GetCameraLookUp).toArray();
        let lookAt = fire(GetCameraLookAt).toArray();
        return { position, lookUp, lookAt };
    });
    on(ControlsUpdate, () => fire(GetControls).update());
    on(ControlsUpdateRotateAxis, () => fire(GetControls).updateRotateAxis());
    // ---------------------
    const epsilon = 0.01;
    let lastCameraPosition = new Vector3();
    let lastCameraDirection = new Vector3();
    let lastCameraFov = 0;
    on(IsCameraChangedNeedUpdate, () => {
        const camera = fire(GetControls).object;
        const fov = camera.fov;
        const position = camera.position.clone();
        const direction = camera.getWorldDirection(new Vector3());
        if (Math.abs(lastCameraFov - fov) < epsilon &&
            Math.abs(position.x - lastCameraPosition.x) < epsilon &&
            Math.abs(position.y - lastCameraPosition.y) < epsilon &&
            Math.abs(position.z - lastCameraPosition.z) < epsilon &&
            Math.abs(direction.x - lastCameraDirection.x) < epsilon &&
            Math.abs(direction.y - lastCameraDirection.y) < epsilon &&
            Math.abs(direction.z - lastCameraDirection.z) < epsilon) {
            return false;
        }
        lastCameraFov = fov;
        lastCameraPosition = position;
        lastCameraDirection = direction;
        return true;
    });
}
