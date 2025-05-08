import { Group, Vector3 } from 'three';
import { Events } from '../../events/Events';
import { MarkData } from './data/MarkData';
import { MarkDataCirclePlan } from './data/MarkDataCirclePlan';
export declare class MarkCirclePlan extends Group {
    readonly isMark: boolean;
    private disposed;
    private events;
    private data;
    private circleMesh;
    private css3dMainTag;
    private css3dTag;
    constructor(events: Events);
    /**
     * 绘制开始
     */
    drawStart(startPoint: Vector3, name?: string): void;
    /**
     * 绘制更新
     */
    drawUpdate(data: MarkDataCirclePlan, saveData?: boolean, lastPoint?: Vector3): void;
    /**
     * 按米标比例尺重新计算更新渲染
     */
    updateByMeterScale(meterScale: number): void;
    /**
     * 绘制结束
     */
    drawFinish(endPoint: Vector3): void;
    /**
     * 根据数据直接绘制
     */
    draw(inputData: MarkDataCirclePlan): void;
    getMarkData(simple?: boolean): MarkData;
    dispose(): void;
}
