// ================================
// Copyright (c) 2025 reall3d.com
// ================================
import { Color, FrontSide, Matrix4, Mesh, ShaderMaterial, SphereGeometry, Vector2, Vector3 } from 'three';
import { RunLoopByTime, ViewerNeedUpdate, CreateFocusMarkerMesh, FocusMarkerMaterialSetOpacity, FocusMarkerMeshAutoDisappear, FocusMarkerMeshDispose, FocusMarkerMeshUpdate, GetCamera, GetCanvasSize, GetFocusMarkerMaterial, } from '../../events/EventConstants';
import { getFocusMarkerFragmentShader, getFocusMarkerVertexShader, VarCycleColor, VarOpacity, VarRealFocusPosition, VarViewport, } from '../../internal/Index';
export class FocusMarkerMesh extends Mesh {
    constructor() {
        super(...arguments);
        this.ignoreIntersect = true;
    }
}
export function setupFocusMarker(events) {
    let disposed = false;
    const on = (key, fn, multiFn) => events.on(key, fn, multiFn);
    const fire = (key, ...args) => events.fire(key, ...args);
    const aryProcessFocus = [];
    const tempPosition = new Vector3();
    const tempMatrix = new Matrix4();
    on(CreateFocusMarkerMesh, () => {
        const sphereGeometry = new SphereGeometry(0.5, 32, 32);
        const focusMarkerMaterial = buildFocusMarkerMaterial();
        focusMarkerMaterial.depthTest = false;
        focusMarkerMaterial.depthWrite = false;
        focusMarkerMaterial.transparent = true;
        const focusMarkerMesh = new FocusMarkerMesh();
        focusMarkerMesh.copy(new Mesh(sphereGeometry, focusMarkerMaterial));
        on(GetFocusMarkerMaterial, () => focusMarkerMaterial);
        on(FocusMarkerMaterialSetOpacity, (val) => {
            if (disposed)
                return;
            focusMarkerMaterial.uniforms[VarOpacity].value = val;
            val <= 0.01 ? (focusMarkerMesh.visible = false) : (focusMarkerMesh.visible = true);
            focusMarkerMaterial.uniformsNeedUpdate = true;
            fire(ViewerNeedUpdate);
        });
        on(FocusMarkerMeshUpdate, (focusPosition) => {
            if (disposed)
                return;
            const camera = fire(GetCamera);
            tempMatrix.copy(camera.matrixWorld).invert();
            tempPosition.copy(focusPosition).applyMatrix4(tempMatrix);
            tempPosition.normalize().multiplyScalar(10);
            tempPosition.applyMatrix4(camera.matrixWorld);
            const { width, height } = fire(GetCanvasSize);
            focusMarkerMaterial.uniforms[VarViewport].value.set(width, height);
            focusMarkerMesh.position.copy(tempPosition);
            focusMarkerMaterial.uniforms[VarRealFocusPosition].value.copy(focusPosition);
            focusMarkerMaterial.uniforms[VarViewport].value.set(width, height);
            focusMarkerMaterial.uniforms[VarOpacity].value = 1;
            focusMarkerMaterial.uniformsNeedUpdate = true;
            fire(FocusMarkerMeshAutoDisappear);
            fire(ViewerNeedUpdate);
        });
        on(FocusMarkerMeshDispose, () => {
            if (disposed)
                return;
            disposed = true;
            focusMarkerMaterial.dispose();
            sphereGeometry.dispose();
        });
        focusMarkerMesh.renderOrder = 99999;
        return focusMarkerMesh;
    });
    on(FocusMarkerMeshAutoDisappear, () => {
        while (aryProcessFocus.length)
            aryProcessFocus.pop().opacity = 0;
        let process = { opacity: 1.0 };
        aryProcessFocus.push(process);
        fire(RunLoopByTime, () => {
            if (!disposed && process.opacity > 0) {
                if (process.opacity < 0.2) {
                    process.opacity = 0;
                }
                else if (process.opacity > 0.6) {
                    process.opacity = Math.max((process.opacity -= 0.01), 0);
                }
                else {
                    process.opacity = Math.max((process.opacity -= 0.03), 0);
                }
                fire(FocusMarkerMaterialSetOpacity, process.opacity);
            }
        }, () => !disposed && process.opacity > 0);
    });
}
function buildFocusMarkerMaterial() {
    const uniforms = {
        [VarCycleColor]: { type: 'v3', value: new Color() },
        [VarRealFocusPosition]: { type: 'v3', value: new Vector3() },
        [VarViewport]: { type: 'v2', value: new Vector2() },
        [VarOpacity]: { value: 0.0 },
    };
    const material = new ShaderMaterial({
        uniforms: uniforms,
        vertexShader: getFocusMarkerVertexShader(),
        fragmentShader: getFocusMarkerFragmentShader(),
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: FrontSide,
    });
    return material;
}
