// ================================
// Copyright (c) 2025 reall3d.com
// ================================
import { CircleGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { CSS3DSprite } from 'three/examples/jsm/Addons.js';
import { AddMarkToWeakRef, DeleteMarkWeakRef, GetOptions, GetScene, MarkFinish, StopAutoRotate, TraverseDisposeAndClear, ViewerNeedUpdate, } from '../../events/EventConstants';
export class MarkCirclePlan extends Group {
    constructor(events) {
        super();
        this.isMark = true;
        this.disposed = false;
        this.events = events;
    }
    /**
     * 绘制开始
     */
    drawStart(startPoint, name) {
        if (this.disposed)
            return;
        const that = this;
        const cnt = document.querySelectorAll('.mark-wrap-circle.main-warp').length + 1;
        const data = {
            type: 'MarkCirclePlan',
            name: name || 'circle' + Date.now(),
            startPoint: startPoint.toArray(),
            radius: 0.05,
            circleColor: '#eeee00',
            circleOpacity: 0.5,
            mainTagColor: '#c4c4c4',
            mainTagBackground: '#2E2E30',
            mainTagOpacity: 0.8,
            mainTagVisible: true,
            circleTagColor: '#000000',
            circleTagBackground: '#e0ffff',
            circleTagOpacity: 0.9,
            circleTagVisible: true,
            title: '标记圆面' + cnt,
        };
        const circleGeometry = new CircleGeometry(data.radius, 32);
        const circleMaterial = new MeshBasicMaterial({ color: data.circleColor, side: DoubleSide, transparent: true });
        circleMaterial.opacity = data.circleOpacity;
        const circleMesh = new Mesh(circleGeometry, circleMaterial);
        circleMesh.position.copy(startPoint);
        circleMesh['isMark'] = true;
        circleMesh.renderOrder = 1;
        const dir = new Vector3(0, 1, 0).normalize();
        circleMesh.lookAt(circleMesh.position.clone().add(dir));
        const mainTagWarp = document.createElement('div');
        mainTagWarp.innerHTML = `<div style='flex-direction: column;align-items: center;display: flex;pointer-events: none;margin-bottom: 40px;'>
                                    <span class="${data.name}-main-tag" style="color:${data.mainTagColor};background:${data.mainTagBackground};opacity:${data.mainTagOpacity};padding:1px 5px 2px 5px;border-radius: 4px;user-select: none;font-size: 12px;pointer-events: auto;">${data.title}</span>
                                 </div>`;
        mainTagWarp.classList.add('mark-wrap-circle', `${data.name}`, `main-warp`);
        mainTagWarp.style.position = 'absolute';
        mainTagWarp.style.borderRadius = '4px';
        mainTagWarp.style.cursor = 'pointer';
        mainTagWarp.onclick = () => {
            if (that.events.fire(GetOptions).markMode)
                return;
            // @ts-ignore
            const onActiveMark = parent?.onActiveMark;
            onActiveMark?.(that.getMarkData(true));
            that.events.fire(StopAutoRotate);
        };
        mainTagWarp.oncontextmenu = (e) => e.preventDefault();
        const css3dMainTag = new CSS3DSprite(mainTagWarp);
        css3dMainTag.position.copy(startPoint);
        css3dMainTag.element.style.pointerEvents = 'none';
        css3dMainTag.scale.set(0.01, 0.01, 0.01);
        css3dMainTag.visible = data.mainTagVisible;
        const tagWarp = document.createElement('div');
        tagWarp.innerHTML = `<span class="${name}-circle-tag" style="color:${data.circleTagColor};background:${data.circleTagBackground};opacity:${data.circleTagOpacity};padding: 1px 5px;border-radius: 4px;margin-bottom: 5px;user-select: none;font-size: 12px;pointer-events: none;"></span>`;
        tagWarp.classList.add('mark-wrap-circle', `${name}`, `circle-warp`);
        tagWarp.style.position = 'absolute';
        tagWarp.style.borderRadius = '4px';
        tagWarp.style.pointerEvents = 'none';
        const css3dTag = new CSS3DSprite(tagWarp);
        css3dTag.position.set(startPoint.x + Math.min(data.radius / 2, 0.5), startPoint.y, startPoint.z);
        css3dTag.element.style.pointerEvents = 'none';
        css3dTag.scale.set(0.008, 0.008, 0.008);
        css3dTag.visible = false;
        that.add(circleMesh, css3dMainTag, css3dTag);
        that.data = data;
        that.circleMesh = circleMesh;
        that.css3dTag = css3dTag;
        that.css3dMainTag = css3dMainTag;
        that.events.fire(AddMarkToWeakRef, that);
    }
    /**
     * 绘制更新
     */
    drawUpdate(data, saveData = true, lastPoint) {
        if (this.disposed)
            return;
        const that = this;
        if (lastPoint) {
            const start = new Vector3().fromArray(that.data.startPoint);
            const radius = start.distanceTo(new Vector3(lastPoint.x, start.y, lastPoint.z));
            saveData && (that.data.radius = radius);
            that.circleMesh.geometry.copy(new CircleGeometry(radius, 128));
            that.css3dTag.visible = radius > 0.3;
            const meterRadius = radius * that.events.fire(GetOptions).meterScale;
            const areaTitle = (Math.PI * meterRadius * meterRadius).toFixed(2) + ' m²';
            that.css3dTag.element.childNodes[0].innerText = areaTitle;
            that.css3dTag.position.set(start.x + Math.min(that.data.radius / 2, 0.5), start.y, start.z);
        }
        if (data?.radius) {
            const start = new Vector3().fromArray(that.data.startPoint);
            const radius = data?.radius;
            saveData && (that.data.radius = radius);
            that.circleMesh.geometry.copy(new CircleGeometry(radius, 128));
            that.css3dTag.visible = radius > 0.3;
            const meterRadius = radius * that.events.fire(GetOptions).meterScale;
            const areaTitle = (Math.PI * meterRadius * meterRadius).toFixed(2) + ' m²';
            that.css3dTag.element.childNodes[0].innerText = areaTitle;
            that.css3dTag.position.set(start.x + Math.min(radius / 2, 0.5), start.y, start.z);
        }
        if (data?.circleColor) {
            saveData && (that.data.circleColor = data.circleColor);
            that.circleMesh.material.color.set(data.circleColor);
        }
        if (data?.circleOpacity) {
            saveData && (that.data.circleOpacity = data.circleOpacity);
            that.circleMesh.material.opacity = data.circleOpacity;
        }
        if (data?.mainTagColor) {
            saveData && (that.data.mainTagColor = data.mainTagColor);
            document.querySelector(`.${that.data.name}-main-tag`).style.color = data.mainTagColor;
        }
        if (data?.mainTagBackground) {
            saveData && (that.data.mainTagBackground = data.mainTagBackground);
            document.querySelector(`.${that.data.name}-main-tag`).style.background = data.mainTagBackground;
        }
        if (data?.mainTagOpacity) {
            saveData && (that.data.mainTagOpacity = data.mainTagOpacity);
            document.querySelector(`.${that.data.name}-main-tag`).style.opacity = data.mainTagOpacity.toString();
        }
        if (data?.mainTagVisible !== undefined) {
            saveData && (that.data.mainTagVisible = data.mainTagVisible);
            that.css3dMainTag.visible = data.mainTagVisible;
        }
        if (data?.circleTagColor) {
            saveData && (that.data.circleTagColor = data.circleTagColor);
            document.querySelector(`.${that.data.name}-circle-tag`).style.color = data.circleTagColor;
        }
        if (data?.circleTagBackground) {
            saveData && (that.data.circleTagBackground = data.circleTagBackground);
            document.querySelector(`.${that.data.name}-circle-tag`).style.background = data.circleTagBackground;
        }
        if (data?.circleTagOpacity) {
            saveData && (that.data.circleTagOpacity = data.circleTagOpacity);
            document.querySelector(`.${that.data.name}-circle-tag`).style.opacity = data.circleTagOpacity.toString();
        }
        if (data?.circleTagVisible !== undefined) {
            saveData && (that.data.circleTagVisible = data.circleTagVisible);
            that.css3dTag.visible = data.circleTagVisible;
        }
        if (data?.title !== undefined) {
            saveData && (that.data.title = data.title);
            this.css3dMainTag.element.querySelector(`.${that.data.name}-main-tag`).innerText = data.title;
        }
        if (data?.note !== undefined) {
            saveData && (that.data.note = data.note);
        }
        that.events.fire(ViewerNeedUpdate);
    }
    /**
     * 按米标比例尺重新计算更新渲染
     */
    updateByMeterScale(meterScale) {
        const that = this;
        const meterRadius = that.data.radius * meterScale;
        const areaTitle = (Math.PI * meterRadius * meterRadius).toFixed(2) + ' m²';
        that.css3dTag.element.childNodes[0].innerText = areaTitle;
    }
    /**
     * 绘制结束
     */
    drawFinish(endPoint) {
        if (this.disposed)
            return;
        const that = this;
        const start = new Vector3().fromArray(that.data.startPoint);
        const radius = start.distanceTo(new Vector3(endPoint.x, start.y, endPoint.z));
        that.data.radius = radius;
        that.circleMesh.geometry.copy(new CircleGeometry(radius, 128));
        const meterRadius = that.data.radius * that.events.fire(GetOptions).meterScale;
        const areaTitle = (Math.PI * meterRadius * meterRadius).toFixed(2) + ' m²';
        that.css3dTag.element.childNodes[0].innerText = areaTitle;
        that.events.fire(MarkFinish);
        // @ts-ignore
        const onActiveMark = parent?.onActiveMark;
        const data = that.getMarkData(true);
        data.isNew = true;
        data.meterScale = that.events.fire(GetOptions).meterScale;
        onActiveMark?.(data);
    }
    /**
     * 根据数据直接绘制
     */
    draw(inputData) {
        if (this.disposed)
            return;
        const that = this;
        const data = {
            type: 'MarkCirclePlan',
            name: inputData.name || 'circle' + Date.now(),
            startPoint: [...inputData.startPoint],
            radius: inputData.radius,
            circleColor: inputData.circleColor || '#eeee00',
            circleOpacity: inputData.circleOpacity || 0.5,
            mainTagColor: inputData.mainTagColor || '#c4c4c4',
            mainTagBackground: inputData.mainTagBackground || '#2E2E30',
            mainTagOpacity: inputData.mainTagOpacity || 0.8,
            mainTagVisible: inputData.mainTagVisible === undefined ? true : inputData.mainTagVisible,
            circleTagColor: inputData.circleTagColor || '#000000',
            circleTagBackground: inputData.circleTagBackground || '#e0ffff',
            circleTagOpacity: inputData.circleTagOpacity || 0.9,
            circleTagVisible: inputData.circleTagVisible === undefined ? true : inputData.circleTagVisible,
            title: inputData.title || '标记圆面',
        };
        const circleGeometry = new CircleGeometry(data.radius, 128);
        const circleMaterial = new MeshBasicMaterial({ color: data.circleColor, side: DoubleSide, transparent: true });
        circleMaterial.opacity = data.circleOpacity;
        const circleMesh = new Mesh(circleGeometry, circleMaterial);
        circleMesh.position.fromArray(data.startPoint);
        circleMesh['isMark'] = true;
        circleMesh.renderOrder = 1;
        const dir = new Vector3(0, 1, 0).normalize();
        circleMesh.lookAt(circleMesh.position.clone().add(dir));
        const name = data.name;
        const mainTagWarp = document.createElement('div');
        mainTagWarp.innerHTML = `<div style='flex-direction: column;align-items: center;display: flex;pointer-events: none;margin-bottom: 40px;'>
                                <span class="${name}-main-tag" style="color:${data.mainTagColor};background:${data.mainTagBackground};opacity:${data.mainTagOpacity};padding:1px 5px 2px 5px;border-radius: 4px;margin-bottom: 5px;user-select: none;font-size: 12px;pointer-events: auto;">${data.title}</span>
                             </div>`;
        mainTagWarp.classList.add('mark-wrap-circle', `${data.name}`, `main-warp`);
        mainTagWarp.style.position = 'absolute';
        mainTagWarp.style.borderRadius = '4px';
        mainTagWarp.style.cursor = 'pointer';
        mainTagWarp.onclick = () => {
            if (that.events.fire(GetOptions).markMode)
                return;
            // @ts-ignore
            const onActiveMark = parent?.onActiveMark;
            onActiveMark?.(that.getMarkData(true));
            that.events.fire(StopAutoRotate);
        };
        mainTagWarp.oncontextmenu = (e) => e.preventDefault();
        const startPoint = new Vector3().fromArray(data.startPoint);
        const meterRadius = data.radius * that.events.fire(GetOptions).meterScale;
        const areaTitle = (Math.PI * meterRadius * meterRadius).toFixed(2) + ' m²';
        const css3dMainTag = new CSS3DSprite(mainTagWarp);
        css3dMainTag.position.copy(startPoint);
        css3dMainTag.element.style.pointerEvents = 'none';
        css3dMainTag.scale.set(0.01, 0.01, 0.01);
        css3dMainTag.visible = data.mainTagVisible;
        const tagWarp = document.createElement('div');
        tagWarp.innerHTML = `<span class="${name}-distance-tag ${name}-circle-tag" style="color:${data.circleTagColor};background:${data.circleTagBackground};opacity:${data.circleTagOpacity};padding: 1px 5px;border-radius: 4px;margin-bottom: 5px;user-select: none;font-size: 12px;pointer-events: none;">${areaTitle}</span>`;
        tagWarp.classList.add('mark-wrap-circle', `${name}`, 'circle-warp');
        tagWarp.style.position = 'absolute';
        tagWarp.style.borderRadius = '4px';
        tagWarp.style.pointerEvents = 'none';
        const css3dTag = new CSS3DSprite(tagWarp);
        css3dTag.position.set(startPoint.x + Math.min(data.radius / 2, 0.5), startPoint.y, startPoint.z);
        css3dTag.element.style.pointerEvents = 'none';
        css3dTag.scale.set(0.008, 0.008, 0.008);
        css3dTag.visible = data.circleTagVisible;
        that.add(circleMesh, css3dMainTag, css3dTag);
        that.data = data;
        that.circleMesh = circleMesh;
        that.css3dTag = css3dTag;
        that.css3dMainTag = css3dMainTag;
        that.events.fire(AddMarkToWeakRef, that);
    }
    getMarkData(simple = false) {
        const data = { ...this.data };
        if (simple) {
            delete data.startPoint;
            delete data.radius;
        }
        else {
            data.startPoint = [...data.startPoint];
        }
        return data;
    }
    dispose() {
        if (this.disposed)
            return;
        const that = this;
        that.disposed = true;
        that.events.fire(TraverseDisposeAndClear, that);
        that.events.fire(GetScene).remove(that);
        that.events.fire(DeleteMarkWeakRef, that);
        const list = document.querySelectorAll(`.${that.data.name}`);
        list.forEach(wrap => wrap.parentElement?.removeChild(wrap));
        that.events = null;
        that.data = null;
        that.circleMesh = null;
        that.css3dTag = null;
        that.css3dMainTag = null;
    }
}
