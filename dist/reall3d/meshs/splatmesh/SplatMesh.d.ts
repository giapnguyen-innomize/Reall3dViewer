import { Mesh } from 'three';
import { SplatMeshOptions } from './SplatMeshOptions';
import { ModelOptions } from '../../modeldata/ModelOptions';
import { MetaData } from '../../modeldata/ModelData';
export declare class SplatMesh extends Mesh {
    readonly isSplatMesh: boolean;
    meta: MetaData;
    private disposed;
    private events;
    private opts;
    /**
     * 构造函数
     * @param options 渲染器、场景、相机都应该传入
     */
    constructor(options: SplatMeshOptions);
    /**
     * 设定或者获取最新配置项
     * @param opts 配置项
     * @returns 最新配置项
     */
    options(opts?: SplatMeshOptions): SplatMeshOptions;
    /**
     * 添加渲染指定高斯模型
     * @param opts 高斯模型选项
     * @param meta 元数据
     */
    addModel(opts: ModelOptions, meta: MetaData): Promise<void>;
    fire(key: number, ...args: any): any;
    /**
     * 销毁
     */
    dispose(): void;
}
