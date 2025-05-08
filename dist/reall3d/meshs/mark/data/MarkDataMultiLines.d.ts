import { MarkData } from './MarkData';
/**
 * 多线段连接线数据
 */
export interface MarkDataMultiLines extends MarkData {
    /** 点 */
    points?: number[];
    /** 线颜色，默认 #eeee00 */
    lineColor?: string;
    /** 线宽，默认 3 */
    lineWidth?: number;
    /** 主标签字体颜色，默认 #c4c4c4  */
    mainTagColor?: string;
    /** 主标签背景颜色，默认 #2E2E30  */
    mainTagBackground?: string;
    /** 主标签透明度，默认 0.8  */
    mainTagOpacity?: number;
    /** 主标签标签是否显示，默认 true  */
    mainTagVisible?: boolean;
    /** 距离标签字体颜色，默认 #000000  */
    distanceTagColor?: string;
    /** 距离标签背景颜色，默认 #e0ffff  */
    distanceTagBackground?: string;
    /** 距离标签透明度，默认 0.9  */
    distanceTagOpacity?: number;
    /** 距离标签是否显示，默认 true */
    distanceTagVisible?: boolean;
    /** 标题 */
    title?: string;
    /** 说明 */
    note?: string;
}
