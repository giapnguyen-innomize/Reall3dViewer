import { Group, Vector3 } from 'three';
import { Events } from '../../events/Events';
import { MarkData } from './data/MarkData';
import { MarkDataSinglePoint } from './data/MarkDataSinglePoint';
export declare class MarkSinglePoint extends Group {
    readonly isMark: boolean;
    private disposed;
    private events;
    private data;
    private css3dTag;
    constructor(events: Events, obj: Vector3 | MarkDataSinglePoint, name?: string);
    /**
     * 绘制更新
     */
    drawUpdate(data?: MarkDataSinglePoint, saveData?: boolean): void;
    resetMeterScale(markData: any): void;
    /**
     * 绘制结束
     */
    drawFinish(): void;
    getMarkData(simple?: boolean): MarkData;
    dispose(): void;
}
