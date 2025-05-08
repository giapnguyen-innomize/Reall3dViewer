export interface MarkData {
    /** 类型 */
    type?: 'MarkDistanceLine' | 'MarkSinglePoint' | 'MarkMultiLines' | 'MarkMultiPlans' | 'MarkCirclePlan' | undefined;
    /** 名称（样式类名等标识用） */
    name?: string;
}
