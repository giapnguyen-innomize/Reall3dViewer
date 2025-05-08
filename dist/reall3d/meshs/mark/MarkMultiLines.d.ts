import { Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/Addons.js';
import { Events } from '../../events/Events';
import { MarkData } from './data/MarkData';
import { MarkDataMultiLines } from './data/MarkDataMultiLines';
export declare class MarkMultiLines extends Line2 {
    readonly isMark: boolean;
    private disposed;
    private events;
    private data;
    private css3dTags;
    private css3dMainTag;
    private group;
    constructor(events: Events);
    /**
     * 绘制开始
     */
    drawStart(startPoint: Vector3, name?: string): void;
    /**
     * 绘制更新
     */
    drawUpdate(data?: MarkDataMultiLines, saveData?: boolean, lastPoint?: Vector3, next?: boolean): void;
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
    draw(inputData: MarkDataMultiLines, finish?: boolean): void;
    getMarkData(simple?: boolean): MarkData;
    dispose(): void;
}
