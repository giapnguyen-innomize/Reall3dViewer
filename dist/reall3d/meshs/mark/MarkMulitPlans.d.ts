import { Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/Addons.js';
import { Events } from '../../events/Events';
import { MarkData } from './data/MarkData';
import { MarkDataMultiPlans } from './data/MarkDataMultiPlans';
export declare class MarkMultiPlans extends Line2 {
    readonly isMark: boolean;
    private disposed;
    private events;
    private data;
    private css3dTags;
    private css3dMainTag;
    private css3dAreaTag;
    private group;
    private meshPlans;
    constructor(events: Events);
    /**
     * 绘制开始
     */
    drawStart(startPoint: Vector3, name?: string): void;
    /**
     * 绘制更新
     */
    drawUpdate(data?: MarkDataMultiPlans, saveData?: boolean, lastPoint?: Vector3, next?: boolean): void;
    /**
     * 按米标比例尺重新计算更新渲染
     */
    updateByMeterScale(meterScale: number): void;
    /**
     * 绘制结束
     */
    drawFinish(hasSelectPoint?: boolean): void;
    /**
     * 根据数据直接绘制
     */
    draw(inputData: MarkDataMultiPlans, finish?: boolean): void;
    private drawPlans;
    getMarkData(simple?: boolean): MarkData;
    dispose(): void;
}
